import { ResearchLayout } from "@/components/research/ResearchLayout";
import { RunningState } from "@/components/research/RunningState";
import { ReportView } from "@/components/report/ReportView";
import { InvalidTopicState, ExecutionFailedState } from "@/components/common/ErrorStates";
import type { Report, ResearchStage } from "@/types";

interface ReportStateResolverProps {
  report: Report;
  isStreaming: boolean;
  phase: string;
  stages: ResearchStage[];
  clarificationQuestions: string[];
  onSubmitClarifications: (answers: Record<string, string>) => void;
  onRetry: () => void;
  onNewResearch: () => void;
  onDelete: () => void;
}

export function ReportStateResolver({
  report,
  isStreaming,
  phase,
  stages,
  clarificationQuestions,
  onSubmitClarifications,
  onRetry,
  onNewResearch,
  onDelete,
}: ReportStateResolverProps) {
  if (report.status === "FAILED") {
    if (report.meta?.is_valid === false) {
      return (
        <div className="mx-auto max-w-xl px-6 py-20">
          <InvalidTopicState
            reason={report.meta.validation_reason}
            onNewResearch={onNewResearch}
          />
        </div>
      );
    }

    return (
      <div className="mx-auto max-w-xl px-6 py-20">
        <ExecutionFailedState
          meta={report.meta}
          onRetry={onRetry}
          onReturnHome={onNewResearch}
        />
      </div>
    );
  }

  if (isStreaming || report.status === "WAITING_FOR_USER" || report.status === "IN_PROGRESS") {
    const activeQuestions = clarificationQuestions.length > 0 ? clarificationQuestions : report.clarification_questions || [];

    return (
      <ResearchLayout
        active={isStreaming}
        stages={stages}
        phase={phase === "idle" && report.status === "WAITING_FOR_USER" ? "clarifying" : phase}
        clarificationQuestions={activeQuestions}
        onSubmitClarifications={onSubmitClarifications}
        showThinkingToggle={true}
      >
        <RunningState query={report.topic} />
      </ResearchLayout>
    );
  }

  if (report.status === "COMPLETED") {
    return <ReportView report={report} onDelete={onDelete} />;
  }

  // Fallback for unexpected states
  return null;
}
