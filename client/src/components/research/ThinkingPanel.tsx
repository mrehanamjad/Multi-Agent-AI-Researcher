import { useEffect, useRef } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Check, ChevronDown, Loader2, Brain, Circle } from "lucide-react";
import * as Collapsible from "@radix-ui/react-collapsible";
import { useState } from "react";
import { cn } from "@/lib/utils";
import type { ResearchStage } from "@/types";

function StageSection({ stage, defaultOpen }: { stage: ResearchStage; defaultOpen: boolean }) {
  const [open, setOpen] = useState(defaultOpen);
  useEffect(() => {
    if (stage.status === "active") setOpen(true);
  }, [stage.status]);

  return (
    <Collapsible.Root
      open={open}
      onOpenChange={setOpen}
      className="rounded-xl border border-border bg-card/60"
    >
      <Collapsible.Trigger className="flex w-full items-center gap-3 px-3.5 py-3 text-left">
        <span
          className={cn(
            "grid h-6 w-6 shrink-0 place-items-center rounded-full border transition-colors",
            stage.status === "done" && "border-success/30 bg-success/15 text-success",
            stage.status === "active" && "border-primary/30 bg-primary/10 text-primary",
            stage.status === "pending" && "border-border bg-muted text-muted-foreground/50",
          )}
        >
          {stage.status === "done" ? (
            <Check className="h-3.5 w-3.5" />
          ) : stage.status === "active" ? (
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
          ) : (
            <Circle className="h-2 w-2 fill-current" />
          )}
        </span>
        <span
          className={cn(
            "flex-1 text-sm font-medium",
            stage.status === "pending" && "text-muted-foreground",
          )}
        >
          {stage.label}
        </span>
        <ChevronDown
          className={cn(
            "h-4 w-4 text-muted-foreground transition-transform",
            open && "rotate-180",
          )}
        />
      </Collapsible.Trigger>
      <Collapsible.Content className="overflow-hidden data-[state=closed]:animate-accordion-up data-[state=open]:animate-accordion-down">
        <div className="space-y-2 px-3.5 pb-3.5 pl-12">
          <AnimatePresence initial={false}>
            {stage.messages.map((m) => (
              <motion.div
                key={m.id}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.25 }}
                className="relative text-xs leading-relaxed text-muted-foreground before:absolute before:-left-[18px] before:top-1.5 before:h-1 before:w-1 before:rounded-full before:bg-border"
              >
                {m.text}
              </motion.div>
            ))}
          </AnimatePresence>
          {stage.status === "pending" && (
            <p className="text-xs italic text-muted-foreground/50">Waiting…</p>
          )}
        </div>
      </Collapsible.Content>
    </Collapsible.Root>
  );
}

export function ThinkingPanel({
  stages,
  active,
}: {
  stages: ResearchStage[];
  active: boolean;
}) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const msgCount = stages.reduce((n, s) => n + s.messages.length, 0);

  useEffect(() => {
    if (active && scrollRef.current) {
      scrollRef.current.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
    }
  }, [msgCount, active]);

  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center gap-2 border-b border-border px-5 py-4">
        <Brain className="h-4 w-4 text-primary" />
        <h3 className="text-sm font-semibold">Reasoning</h3>
        {active && (
          <span className="ml-auto inline-flex items-center gap-1.5 text-xs text-primary">
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-primary" />
            live
          </span>
        )}
      </div>

      {!active && msgCount === 0 ? (
        <div className="flex flex-1 flex-col items-center justify-center gap-3 px-6 text-center">
          <div className="grid h-12 w-12 place-items-center rounded-2xl bg-muted text-muted-foreground">
            <Brain className="h-6 w-6" />
          </div>
          <p className="text-sm font-medium">The thinking panel is empty</p>
          <p className="max-w-[220px] text-xs text-muted-foreground">
            Start a research task to watch the assistant reason step by step.
          </p>
        </div>
      ) : (
        <div ref={scrollRef} className="scroll-fade flex-1 space-y-2.5 overflow-y-auto p-4">
          {stages.map((s, i) => (
            <StageSection key={s.key} stage={s} defaultOpen={i < 2} />
          ))}
        </div>
      )}
    </div>
  );
}
