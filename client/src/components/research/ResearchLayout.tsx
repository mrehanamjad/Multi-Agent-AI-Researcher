import { useState } from "react";
import { PanelRightOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { ThinkingPanel } from "@/components/research/ThinkingPanel";
import { ClarificationDialog } from "@/components/research/ClarificationDialog";
import type { ResearchStage } from "@/types";

interface ResearchLayoutProps {
  active: boolean;
  stages: ResearchStage[];
  phase: string;
  clarificationQuestions: string[];
  onSubmitClarifications: (answers: Record<string, string>) => void;
  children: React.ReactNode;
  showThinkingToggle?: boolean;
}

export function ResearchLayout({
  active,
  stages,
  phase,
  clarificationQuestions,
  onSubmitClarifications,
  children,
  showThinkingToggle = true,
}: ResearchLayoutProps) {
  const [thinkingOpen, setThinkingOpen] = useState(false);

  return (
    <div className="flex h-full">
      {/* Center panel */}
      <div className="relative min-w-0 flex-1">
        {/* Toggle thinking panel on smaller screens */}
        {showThinkingToggle && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => setThinkingOpen(true)}
            className="absolute right-4 top-4 z-10 gap-1.5 xl:hidden"
          >
            <PanelRightOpen className="h-4 w-4" />
            Reasoning
          </Button>
        )}

        {children}
      </div>

      {/* Right panel — desktop */}
      <aside className="hidden w-[360px] shrink-0 border-l border-border bg-muted/20 xl:block">
        <ThinkingPanel stages={stages} active={active} />
      </aside>

      {/* Right panel — mobile/tablet sheet */}
      <Sheet open={thinkingOpen} onOpenChange={setThinkingOpen}>
        <SheetContent side="right" className="w-[360px] max-w-[90vw] p-0">
          <ThinkingPanel stages={stages} active={active} />
        </SheetContent>
      </Sheet>

      <ClarificationDialog
        open={phase === "clarifying"}
        questions={clarificationQuestions}
        onComplete={onSubmitClarifications}
      />
    </div>
  );
}
