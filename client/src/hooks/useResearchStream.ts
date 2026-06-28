import { useCallback, useRef, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { streamResearch, streamClarifications } from "@/services/research";
import type { ResearchStage, Report, StageKey, SSEEvent } from "@/types";
import { STAGES } from "@/services/constants";

type Phase = "idle" | "clarifying" | "running" | "done" | "error";

function initialStages(): ResearchStage[] {
  return STAGES.map((s) => ({ key: s.key, label: s.label, status: "pending", messages: [] }));
}

export function useResearchStream() {
  const queryClient = useQueryClient();
  const [phase, setPhase] = useState<Phase>("idle");
  const [stages, setStages] = useState<ResearchStage[]>(initialStages);
  const [report, setReport] = useState<Report | null>(null);
  const [error, setError] = useState<{ type: "network" | "timeout" | "server" | "unknown"; message: string } | null>(null);
  const [reportId, setReportId] = useState<string | null>(null);
  const [clarificationQuestions, setClarificationQuestions] = useState<string[]>([]);
  
  const abortControllerRef = useRef<AbortController | null>(null);

  const reset = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
    setStages(initialStages());
    setReport(null);
    setError(null);
    setReportId(null);
    setClarificationQuestions([]);
    setPhase("idle");
  }, []);

  const pushMsg = (key: StageKey, text: string) => {
    setStages((prev) =>
      prev.map((s) =>
        s.key === key
          ? { ...s, messages: [...s.messages, { id: `${key}-${s.messages.length}-${Date.now()}`, text, ts: Date.now() }] }
          : s,
      ),
    );
  };

  const setStageActive = (key: StageKey) => {
    setStages((prev) => {
      // Find the index of the stage we are activating
      const stageIndex = prev.findIndex((s) => s.key === key);
      
      return prev.map((s, idx) => {
        if (s.key === key) {
          return { ...s, status: "active" as const };
        }
        // Mark all stages before the active one as done
        if (idx < stageIndex && s.status !== "done") {
          return { ...s, status: "done" as const };
        }
        return s;
      });
    });
  };

  const handleEvent = useCallback((event: SSEEvent) => {
    switch (event.event) {
      case "start":
        setReportId(event.report_id);
        break;
      
      case "node_start":
        // The backend maps 'validate_topic' to 'validating', 'analyze_query' to 'planning', etc.
        let stageKey: StageKey | null = null;
        if (event.node === "validate_topic") stageKey = "validating";
        else if (event.node === "clarification") stageKey = "clarification";
        else if (event.node === "analyze_query") stageKey = "planning";
        else if (event.node === "web_search") stageKey = "searching";
        else if (event.node === "synthesize") stageKey = "synthesizing";
        else if (event.node === "critic") stageKey = "critic";
        
        if (stageKey) {
          setStageActive(stageKey);
          pushMsg(stageKey, event.message);
        }
        break;
        
      case "thinking":
        // Again map backend node to StageKey
        let tStageKey: StageKey | null = null;
        if (event.node === "validate_topic") tStageKey = "validating";
        else if (event.node === "clarification") tStageKey = "clarification";
        else if (event.node === "analyze_query") tStageKey = "planning";
        else if (event.node === "web_search") tStageKey = "searching";
        else if (event.node === "synthesize") tStageKey = "synthesizing";
        else if (event.node === "critic") tStageKey = "critic";
        
        if (tStageKey) {
          pushMsg(tStageKey, event.message);
        }
        break;
        
      case "clarification_needed":
        setClarificationQuestions(event.questions);
        setPhase("clarifying");
        // Mark clarification as active
        setStageActive("clarification");
        pushMsg("clarification", "Awaiting your clarifications…");
        break;
        
      case "complete":
        // Set all stages to done
        setStages((prev) => prev.map((s) => ({ ...s, status: "done" as const })));
        
        setReport((prev) => {
          const updatedReport: Report = {
            ...prev,
            id: event.report_id,
            topic: prev?.topic || "Unknown Topic",
            report: event.report,
            sources: event.sources || [],
            critic_feedback: event.critic_feedback,
            critic_score: event.critic_score,
            status: "COMPLETED",
            created_at: new Date().toISOString(),
          } as Report;
          
          // Instantly prime the cache so history views match perfectly
          queryClient.setQueryData(["report", event.report_id], updatedReport);
          queryClient.invalidateQueries({ queryKey: ["history"] });
          
          return updatedReport;
        });
        
        setPhase("done");
        break;
        
      case "summary":
        setReport((prev) => {
          if (!prev) return prev;
          return {
            ...prev,
            topic: event.stats.topic || prev.topic,
            critic_score: event.stats.critic_score,
          };
        });
        break;
        
      case "error":
        setError({ type: "server", message: event.message });
        setPhase("error");
        break;
    }
  }, [queryClient]);

  const startResearch = useCallback((topic: string) => {
    reset();
    setPhase("running");
    
    // Set validating to active initially
    setStageActive("validating");
    
    // Initialize a partial report just to hold the topic
    setReport({
      id: "",
      topic,
      report: "",
      sources: [],
      status: "IN_PROGRESS" as any, // Not real status, just internal
      created_at: new Date().toISOString(),
    });

    const controller = new AbortController();
    abortControllerRef.current = controller;

    streamResearch(topic, handleEvent, controller.signal)
      .catch((err) => {
        if (err.name === "AbortError") return;
        
        let type: "network" | "timeout" | "server" | "unknown" = "unknown";
        if (err.message.includes("fetch")) type = "network";
        else if (err.message.includes("timeout")) type = "timeout";
        else if (err.message.includes("Server error")) type = "server";
        
        setError({ type, message: err.message || "Failed to start research" });
        setPhase("error");
      });
  }, [reset, handleEvent]);

  const submitClarifications = useCallback((answers: Record<string, string>) => {
    if (!reportId) {
      setError({ type: "server", message: "Cannot submit clarifications: No active report ID" });
      setPhase("error");
      return;
    }
    
    setPhase("running");
    // Move to planning
    setStageActive("planning");
    
    const controller = new AbortController();
    abortControllerRef.current = controller;
    
    streamClarifications(reportId, answers, handleEvent, controller.signal)
      .catch((err) => {
        if (err.name === "AbortError") return;
        
        let type: "network" | "timeout" | "server" | "unknown" = "unknown";
        if (err.message.includes("fetch")) type = "network";
        else if (err.message.includes("timeout")) type = "timeout";
        else if (err.message.includes("Server error")) type = "server";
        
        setError({ type, message: err.message || "Failed to submit clarifications" });
        setPhase("error");
      });
  }, [reportId, handleEvent]);

  const resumeStream = useCallback((existingReport: Report) => {
    reset();
    setReportId(existingReport.id);
    setReport(existingReport);

    if (existingReport.status === "WAITING_FOR_USER") {
      setPhase("clarifying");
      setClarificationQuestions(existingReport.clarification_questions || []);
      setStageActive("clarification");
    } else {
      setPhase("running");
      
      const statusToStage: Record<string, StageKey> = {
        VALIDATING: "validating",
        PLANNING: "planning",
        SEARCHING: "searching",
        SYNTHESIZING: "synthesizing",
        CRITIC: "critic",
      };
      
      const activeStage = statusToStage[existingReport.status];
      if (activeStage) {
        setStageActive(activeStage);
      } else {
        setStageActive("validating");
      }
    }
  }, [reset]);

  return {
    phase,
    stages,
    report,
    error,
    clarificationQuestions,
    startResearch,
    submitClarifications,
    resumeStream,
    reset,
  };
}
