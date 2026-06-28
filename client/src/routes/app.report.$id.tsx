import { useEffect } from "react";
import { createFileRoute, useNavigate, useRouter } from "@tanstack/react-router";
import { ReportView } from "@/components/report/ReportView";
import { ErrorState } from "@/components/common/ErrorState";
import { InterruptedState } from "@/components/common/InterruptedState";
import { Skeleton } from "@/components/ui/skeleton";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getReportById, deleteReport } from "@/services/history";
import { useResearchStream } from "@/hooks/useResearchStream";
import { ResearchLayout } from "@/components/research/ResearchLayout";
import { RunningState } from "@/components/research/RunningState";

export const Route = createFileRoute("/app/report/$id")({
  head: () => {
    return {
      meta: [
        { title: "Report — Agentic Research" },
        { name: "description", content: "Research report" },
      ],
    };
  },
  // 1. Point the route to our new wrapper component
  component: ReportPageWrapper,
});

// 2. Create a wrapper that uses the route ID as a React key
function ReportPageWrapper() {
  const { id } = Route.useParams();
  
  // By passing key={id}, React will completely unmount and remount 
  // ReportPage whenever the ID changes, guaranteeing fresh hook state.
  return <ReportPage key={id} />;
}

function ReportSkeleton() {
  return (
    <div className="mx-auto max-w-3xl px-6 py-10">
      <Skeleton className="mb-8 h-10 w-2/3" />
      <div className="space-y-4">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-11/12" />
        <Skeleton className="h-4 w-4/5" />
        <Skeleton className="h-40 w-full rounded-xl" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-3/4" />
      </div>
    </div>
  );
}

function ReportPage() {
  const { id } = Route.useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  // Load the initial report from the database
  const { data: dbReport, isLoading, isError } = useQuery({
    queryKey: ["report", id],
    queryFn: () => getReportById(id),
  });

  // Because of the key={id} in the wrapper, this hook is now 
  // guaranteed to start fresh every time you navigate to a new report!
  const {
    phase,
    stages,
    report: streamReport,
    resumeStream,
    submitClarifications,
    clarificationQuestions,
  } = useResearchStream();

  // Automatically resume the stream if the database report is paused or processing
  useEffect(() => {
    if (
      dbReport &&
      phase === "idle" &&
      dbReport.status !== "COMPLETED" &&
      dbReport.status !== "FAILED" &&
      dbReport.status !== "DRAFT"
    ) {
      resumeStream(dbReport);
    }
  }, [dbReport, phase, resumeStream]);

  const deleteMutation = useMutation({
    mutationFn: () => deleteReport(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["history"] });
      navigate({ to: "/app/history" });
    },
  });

  const handleRetryFailed = () => {
    if (!activeReport?.topic) return;
    const topic = activeReport.topic;
    
    // Fire and forget delete
    deleteReport(id).catch((e) => console.error("Failed to delete old report during retry:", e));
    queryClient.invalidateQueries({ queryKey: ["history"] });
    
    navigate({
      to: "/app",
      search: { retryTopic: topic }
    });
  };

  // Decide whether to use the actively streaming report or the cached DB report
  const activeReport = streamReport || dbReport;
  const isStreaming = phase === "running" || phase === "clarifying";

  if (isLoading) return <ReportSkeleton />;

  if (isError || !activeReport) {
    return (
      <div className="mx-auto max-w-xl px-6 py-20">
        <ErrorState
          title="Report not found"
          message="This research report doesn't exist or may have been deleted."
          onRetry={() => navigate({ to: "/app" })}
        />
      </div>
    );
  }

  if (activeReport.status === "FAILED") {
    return (
      <div className="mx-auto max-w-xl px-6 py-20">
        <ErrorState
          title="Research failed"
          message="The assistant couldn't complete this research task. You can try running it again."
          onRetry={handleRetryFailed}
        />
      </div>
    );
  }

  if (activeReport.status === "INTERRUPTED") {
    return (
      <div className="mx-auto max-w-xl px-6 py-20">
        <ErrorState
          title="Research interrupted"
          message={activeReport.meta?.error?.error_message || "This research did not finish because your connection to the server was interrupted before the process completed."}
          onRetry={handleRetryFailed}
          status="INTERRUPTED" 
        />
      </div>
    );
  }

  // If we are actively interacting with a paused or running session
  if (isStreaming || activeReport.status === "WAITING_FOR_USER" || activeReport.status === "IN_PROGRESS") {
    // If the phase hasn't updated yet (useEffect hasn't fired), fallback to DB questions
    const activeQuestions =
      clarificationQuestions.length > 0 ? clarificationQuestions : activeReport.clarification_questions || [];

    return (
      <ResearchLayout
        active={isStreaming}
        stages={stages}
        phase={phase === "idle" && activeReport.status === "WAITING_FOR_USER" ? "clarifying" : phase}
        clarificationQuestions={activeQuestions}
        onSubmitClarifications={(answers) => submitClarifications(answers)}
        showThinkingToggle={true}
      >
        <RunningState query={activeReport.topic} />
      </ResearchLayout>
    );
  }

  // Final successful state
  if (activeReport.status === "COMPLETED") {
    return <ReportView report={activeReport} onDelete={() => deleteMutation.mutate()} />;
  }

  // Catch-all for intermediate load states
  return <ReportSkeleton />;
}