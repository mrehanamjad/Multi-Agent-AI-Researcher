from langchain.agents import create_agent
from langchain_groq import ChatGroq
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.output_parsers import StrOutputParser
from typer import prompt
from tools import web_search, url_scraper
from dotenv import load_dotenv
load_dotenv()

# model setup
llm = ChatGroq(model="llama-3.3-70b-versatile", temperature=0)

# first agent
def build_search_agent():
    return create_agent(
        model=llm,
        tools=[web_search],
        system_prompt="You are a web researcher. You MUST include the result given by the web_search tool which includes the URL,SNIPPET, and TITLE in your final response so downstream agents can scrape them."
    )

# second agent
def build_reader_agent():
    return create_agent(
        model=llm,
        tools=[url_scraper],
        system_prompt="You are a diligent reader. Your task is to pick the most relevant URL from the search results and scrape its content for deeper insights. Focus on extracting valuable information while ignoring irrelevant details."
    )

writer_prompt = ChatPromptTemplate.from_messages([
    ("system", "You are an expert research writer. Write clear, structured and insightful reports."),
    ("human", """Write a detailed research report on the topic below.

Topic: {topic}

Research Gathered:
{research}

Structure the report as:
- Introduction
- Key Findings (minimum 3 well-explained points)
- Conclusion
- Sources (list all URLs found in the research)

Be detailed, factual and professional."""),
])

writer_chain = writer_prompt | llm | StrOutputParser()

critic_prompt = ChatPromptTemplate.from_messages([
     ("system", "You are a sharp and constructive research critic. Be honest and specific."),
    ("human", """Review the research report below and evaluate it strictly.

Report:
{report}

Respond in this exact format:

Score: X/10

Strengths:
- ...
- ...

Areas to Improve:
- ...
- ...

One line verdict:
..."""),
])

critic_chain = critic_prompt | llm | StrOutputParser()

