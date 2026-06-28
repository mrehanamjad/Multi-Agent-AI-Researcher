"""
agent.py — Agentic Research Assistant using LangGraph.
"""

import logging
import os
import re
from operator import add
from typing import Annotated, List, Optional, Dict, Any
from urllib.parse import urlparse

from langchain_community.tools.tavily_search import TavilySearchResults
from langchain_core.output_parsers import StrOutputParser
from langchain_core.prompts import ChatPromptTemplate
from langchain_openai import ChatOpenAI
from langgraph.graph import END, StateGraph
from pydantic import BaseModel, Field
from typing_extensions import TypedDict

from app.core.config import settings

logger = logging.getLogger(__name__)

# Maximum number of web URLs to collect in total
MAX_URLS = 20


# ── Structured output schemas ─────────────────────────────────────────────────

class TopicValidation(BaseModel):
    is_valid: bool = Field(description="True if this is a meaningful research topic that is safe and academic/professional.")
    reason: str = Field(description="One sentence explanation of the validation decision.")
    refined_topic: str = Field(description="A cleaned-up, typo-corrected or expanded version of the topic.")


class ClarificationOutput(BaseModel):
    needs_clarification: bool = Field(description="True if the topic requires clarification (e.g. target audience, report depth, time range).")
    questions: List[str] = Field(default_factory=list, description="3-4 concise questions to clarify the user's intent.")


class QueryAnalysis(BaseModel):
    refined_topic: str = Field(description="The finalized refined research topic.")
    research_plan: List[str] = Field(description="High-level bullet points detailing the research plan.")
    sub_questions: List[str] = Field(description="Exactly 3 specific, focused search queries/sub-questions.")
    reasoning: str = Field(description="Brief explanation of the research query choice.")


class CriticOutput(BaseModel):
    overall_score: float = Field(description="Quality score from 0.0 to 10.0.")
    confidence: str = Field(description="Confidence rating: LOW, MEDIUM, or HIGH.")
    strengths: List[str] = Field(description="Bullet points listing report strengths.")
    weaknesses: List[str] = Field(description="Bullet points listing report weaknesses.")
    suggestions: List[str] = Field(description="Suggestions for future iteration.")


# ── Agent state ───────────────────────────────────────────────────────────────

class ResearchState(TypedDict):
    # Inputs & Validation
    topic: str
    is_valid: Optional[bool]
    validation_reason: Optional[str]

    # Clarification
    needs_clarification: Optional[bool]
    clarification_questions: Optional[List[str]]
    clarification_answers: Optional[Dict[str, str]]

    # Query Planning
    refined_topic: Optional[str]
    research_plan: Optional[List[str]]
    sub_questions: Optional[List[str]]
    reasoning: Optional[str]

    # Web search results
    web_results: Optional[List[Dict[str, Any]]]

    # Output
    report: Optional[str]
    sources: Optional[List[Dict[str, Any]]]

    # Critic evaluation
    critic_score: Optional[float]
    critic_feedback: Optional[Dict[str, Any]]

    # UI updates & thinking steps (reducer)
    thinking_steps: Annotated[List[str], add]


def extract_title(report_md: str, default_topic: str) -> str:
    """Helper to extract the H1 title from generated markdown report."""
    match = re.search(r"^#\s+(.+)$", report_md, re.MULTILINE)
    if match:
        return match.group(1).strip()
    return default_topic


def get_domain(url: str) -> str:
    """Extract domain from a URL."""
    try:
        return urlparse(url).netloc
    except Exception:
        return ""


# ── Agent builder ─────────────────────────────────────────────────────────────

def build_agent(openrouter_api_key: str, openrouter_base_url: str):
    """
    Build and compile the Deep Research LangGraph workflow.
    """
    llm = ChatOpenAI(
        model=settings.llm_model,
        temperature=0,
        api_key=openrouter_api_key,
        base_url=openrouter_base_url,
    )

    validation_llm = llm.with_structured_output(TopicValidation)
    clarification_llm = llm.with_structured_output(ClarificationOutput)
    analysis_llm = llm.with_structured_output(QueryAnalysis)
    critic_llm = llm.with_structured_output(CriticOutput)

    tavily_api_key = settings.tavily_api_key

    # ── Entry Routing Function ────────────────────────────────────────────────

    def route_entry(state: ResearchState) -> str:
        """
        Dynamically determine the entry node based on fields in state.
        This enables stateless execution resumption directly from DB state.
        """
        if state.get("is_valid") is None:
            return "validate_topic"

        if not state.get("is_valid"):
            return END

        # If clarification is needed, but we don't have answers yet, run clarification node
        if state.get("needs_clarification") is None:
            return "clarification"
        if state.get("needs_clarification") and not state.get("clarification_answers"):
            return "clarification"

        if not state.get("sub_questions"):
            return "analyze_query"

        if state.get("web_results") is None:
            return "web_search"

        if not state.get("report"):
            return "synthesize"

        if state.get("critic_feedback") is None:
            return "critic"

        return END

    # ── Node 1: Validate topic ────────────────────────────────────────────────

    def validate_topic(state: ResearchState) -> dict:
        topic = state["topic"]
        logger.info(f"Validating topic: {topic!r}")

        prompt = f"""You are a research quality controller.
Evaluate whether the following is a valid research topic that a researcher
could write a professional or academic report about.

Topic: "{topic}"

Be lenient — if there is any reasonable interpretation, mark it valid.
"""
        result: TopicValidation = validation_llm.invoke(prompt)

        steps = [
            f'Validating topic: "{topic}"',
            f"{'✓ Valid' if result.is_valid else '✗ Invalid'} — {result.reason}"
        ]
        if result.is_valid and result.refined_topic != topic:
            steps.append(f'Refined topic to: "{result.refined_topic}"')

        return {
            "is_valid": result.is_valid,
            "validation_reason": result.reason,
            "topic": result.refined_topic if result.is_valid else topic,
            "thinking_steps": steps,
        }

    # ── Node 2: Clarification ─────────────────────────────────────────────────

    def clarification(state: ResearchState) -> dict:
        if state.get("clarification_answers"):
            return {
                "thinking_steps": ["✓ Clarification answers loaded, continuing..."]
            }

        topic = state["topic"]
        logger.info(f"Checking if clarification is needed for topic: {topic!r}")

        prompt = f"""You are a research planner. Evaluate whether the following topic requires more clarification before we proceed.
Topic: "{topic}"

If the topic is too broad, lacks focus, or needs targeting (e.g. target audience, report depth, time range, or specific focus), generate 3-4 concise clarification questions.
If the topic is clear and sufficient, mark needs_clarification as false.
"""
        result: ClarificationOutput = clarification_llm.invoke(prompt)

        if result.needs_clarification:
            steps = [
                "Topic is broad; generating clarification questions...",
            ]
            for q in result.questions:
                steps.append(f"  • {q}")
            steps.append("Pausing workflow to collect answers.")
            return {
                "needs_clarification": True,
                "clarification_questions": result.questions,
                "thinking_steps": steps,
            }
        else:
            return {
                "needs_clarification": False,
                "clarification_questions": [],
                "clarification_answers": {},
                "thinking_steps": ["✓ Clarification check: Clear topic, proceeding automatically."]
            }

    # ── Node 3: Analyze query ─────────────────────────────────────────────────

    def analyze_query(state: ResearchState) -> dict:
        topic = state["topic"]
        answers = state.get("clarification_answers") or {}
        answers_str = ", ".join(f"'{k}': {v}" for k, v in answers.items()) if answers else "None"

        logger.info(f"Analyzing query: {topic!r}")

        prompt = f"""You are a research planner. Prepare a research strategy.

Topic to research: "{topic}"
User Answers to Clarifications: {answers_str}

Task:
1. Improve and finalize the topic name.
2. Create a research plan with key bullet points.
3. Break the research topic into exactly 3 focused search queries / sub-questions.
"""
        analysis: QueryAnalysis = analysis_llm.invoke(prompt)

        steps = [
            f"Planning research for: {analysis.refined_topic}",
            "Breaking research into exactly 3 search queries:",
            f"  Q1: {analysis.sub_questions[0]}",
            f"  Q2: {analysis.sub_questions[1]}",
            f"  Q3: {analysis.sub_questions[2]}",
        ]

        return {
            "refined_topic": analysis.refined_topic,
            "research_plan": analysis.research_plan,
            "sub_questions": analysis.sub_questions,
            "reasoning": analysis.reasoning,
            "thinking_steps": steps,
        }

    # ── Node 4: Web search ────────────────────────────────────────────────────

    def web_search(state: ResearchState) -> dict:
        if state.get("web_results") is not None:
            return {
                "thinking_steps": ["✓ Loaded cached web search results from saved state."]
            }

        sub_questions = state.get("sub_questions") or []
        all_results = []
        steps = ["Starting parallel web searches via Tavily..."]

        for i, question in enumerate(sub_questions, 1):
            remaining = MAX_URLS - len(all_results)
            if remaining <= 0:
                steps.append("Search cap reached — skipping remaining queries")
                break

            per_query = min(7, remaining)
            steps.append(f"🔍 Searching: \"{question}\"")

            try:
                tavily = TavilySearchResults(
                    max_results=per_query,
                    tavily_api_key=tavily_api_key,
                )
                results = tavily.invoke(question)

                if isinstance(results, list) and results:
                    all_results.extend(results)
                    steps.append(f"   ↳ Found {len(results)} URLs")
                else:
                    steps.append("   ↳ No results found")
            except Exception as e:
                logger.warning(f"Tavily search failed for '{question}': {e}")
                steps.append(f"   ↳ Search failed: {str(e)[:80]}")

        # Deduplicate and build structured source output
        seen_urls = set()
        structured_sources = []
        for r in all_results:
            url = r.get("url")
            if not url or url in seen_urls:
                continue
            seen_urls.add(url)
            structured_sources.append({
                "title": r.get("title") or "Untitled Source",
                "url": url,
                "domain": get_domain(url),
                "snippet": r.get("content") or ""
            })

        steps.append(f"Web search complete — {len(structured_sources)} unique sources collected")

        return {
            "web_results": all_results, # Used for internal state caching
            "sources": structured_sources,
            "thinking_steps": steps
        }

    # ── Node 5: Synthesize ────────────────────────────────────────────────────

    def synthesize(state: ResearchState) -> dict:
        topic = state["topic"]
        refined_topic = state.get("refined_topic") or topic
        sources = state.get("sources") or []
        research_plan = state.get("research_plan") or []
        plan_str = "\n".join(f"- {p}" for p in research_plan)

        steps = [
            f"Synthesizing report based on {len(sources)} sources...",
            "Writing Executive Summary → Background → Key Findings → Analysis → Future Outlook → Conclusion..."
        ]

        context_parts = []
        for i, s in enumerate(sources, 1):
            context_parts.append(f"[Source {i}: {s['title']} ({s['domain']})]\n{s['snippet']}")

        context = "\n\n---\n\n".join(context_parts) if context_parts else "No web findings available."

        source_list = "\n".join(
            f"{i+1}. {s['title']} ({s['domain']})\n   {s['url']}"
            for i, s in enumerate(sources)
        ) if sources else "No source URLs collected."

        report_prompt = ChatPromptTemplate.from_template(
            """You are an expert research analyst. Write a comprehensive, structured research report.

Topic: {refined_topic}
Research Plan:
{plan_str}

Research findings:
{context}

Write a detailed research report with this EXACT structure:

# [Generate a concise, professional title here]

## Executive Summary
[2-3 sentences summarizing the key findings]

## Background
[Detailed background explaining the topic, its history, and why it matters.]

## Key Findings
[The most important and current information about the topic, backed by sources.]

## Analysis
[Your analysis of what the findings mean, trends, and future implications.]

## Future Outlook
[Key takeaways and future trends.]

## Conclusion
[Key takeaways and actionable insights.]

## References
{source_list}

Requirements:
- Be specific and cite evidence from the sources
- Use professional, analytical language
- Do not make up facts or hallucinate; only write based on the provided findings
- Cite sources naturally (e.g. "[Web Source Title]")
"""
        )

        chain = report_prompt | llm | StrOutputParser()
        report = chain.invoke({
            "refined_topic": refined_topic,
            "plan_str": plan_str,
            "context": context,
            "source_list": source_list,
        })

        generated_title = extract_title(report, refined_topic)
        steps.append(f"✓ Report generated: '{generated_title}'")

        return {
            "report": report,
            "refined_topic": generated_title,
            "thinking_steps": steps
        }

    # ── Node 6: Critic ────────────────────────────────────────────────────────

    def critic(state: ResearchState) -> dict:
        report = state.get("report") or ""
        steps = ["Evaluating report quality via Critic LLM..."]

        prompt = f"""You are a research reviewer. Critique the following research report for accuracy, depth, structure, and readability.

Report:
{report}

Provide your evaluation in the required structured output schema. Do NOT modify the report itself.
"""
        result: CriticOutput = critic_llm.invoke(prompt)

        steps.append(f"✓ Critic Evaluation Complete (Score: {result.overall_score}/10)")

        return {
            "critic_score": result.overall_score,
            "critic_feedback": result.dict(),
            "thinking_steps": steps
        }

    # ── Routing functions ─────────────────────────────────────────────────────

    def route_after_clarification(state: ResearchState) -> str:
        if state.get("needs_clarification") and not state.get("clarification_answers"):
            return END
        return "analyze_query"

    # ── Build the graph ───────────────────────────────────────────────────────

    workflow = StateGraph(ResearchState)

    # Add all nodes
    workflow.add_node("validate_topic", validate_topic)
    workflow.add_node("clarification", clarification)
    workflow.add_node("analyze_query", analyze_query)
    workflow.add_node("web_search", web_search)
    workflow.add_node("synthesize", synthesize)
    workflow.add_node("critic", critic)

    # Set conditional entry point
    workflow.set_conditional_entry_point(
        route_entry,
        {
            "validate_topic": "validate_topic",
            "clarification": "clarification",
            "analyze_query": "analyze_query",
            "web_search": "web_search",
            "synthesize": "synthesize",
            "critic": "critic",
            END: END
        }
    )

    # Add standard transitions
    workflow.add_edge("validate_topic", "clarification")
    
    workflow.add_conditional_edges(
        "clarification",
        route_after_clarification,
        {
            END: END,
            "analyze_query": "analyze_query"
        }
    )

    workflow.add_edge("analyze_query", "web_search")
    workflow.add_edge("web_search", "synthesize")
    workflow.add_edge("synthesize", "critic")
    workflow.add_edge("critic", END)

    return workflow.compile()
