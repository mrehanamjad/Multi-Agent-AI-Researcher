import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { PanelRightOpen } from "lucide-react";
import { ResearchHome } from "@/components/research/ResearchHome";
import { ThinkingPanel } from "@/components/research/ThinkingPanel";
import { ClarificationDialog } from "@/components/research/ClarificationDialog";
import { ReportView } from "@/components/report/ReportView";
import { useResearchStream } from "@/hooks/useResearchStream";
import { Button } from "@/components/ui/button";
import { ResearchLayout } from "@/components/research/ResearchLayout";
import { RunningState } from "@/components/research/RunningState";
import { StreamErrorState } from "@/components/common/ErrorStates";

type SearchParams = {
  retryTopic?: string;
};

export const Route = createFileRoute("/app/")({
  validateSearch: (search: Record<string, unknown>): SearchParams => ({
    retryTopic: typeof search.retryTopic === "string" ? search.retryTopic : undefined,
  }),
  head: () => ({
    meta: [
      { title: "New Research — Agentic Research Assistant" },
      {
        name: "description",
        content: "Start a new AI research task and watch the assistant reason in real time.",
      },
    ],
  }),
  component: Workspace,
});

function Workspace() {
  const navigate = useNavigate();
  const { retryTopic } = Route.useSearch();
  const { phase, stages, report, error, startResearch, submitClarifications, reset, clarificationQuestions } = useResearchStream();
  const [query, setQuery] = useState("");

  useEffect(() => {
    if (retryTopic && phase === "idle" && !report) {
      setQuery(retryTopic);
      startResearch(retryTopic);
      // Remove search param without adding to history
      navigate({ to: "/app", replace: true, search: {} });
    }
  }, [retryTopic, phase, report, startResearch, navigate]);

  const handleSubmit = (q: string) => {
    setQuery(q);
    startResearch(q);
  };

  const active = phase === "running" || phase === "clarifying";

  return (
    <ResearchLayout
      active={active}
      stages={stages}
      phase={phase}
      clarificationQuestions={clarificationQuestions}
      onSubmitClarifications={(answers) => submitClarifications(answers)}
      showThinkingToggle={active || !!report}
    >
      {phase === "error" && error ? (
        <StreamErrorState 
          type={error.type} 
          message={error.message} 
          onRetry={() => startResearch(query)} 
        />
      ) : phase === "done" && report ? (
        <ReportView report={report} onDelete={() => reset()} />
      ) : active ? (
        <RunningState query={query} />
      ) : (
        <ResearchHome onSubmit={handleSubmit} />
      )}
    </ResearchLayout>
  );
}
