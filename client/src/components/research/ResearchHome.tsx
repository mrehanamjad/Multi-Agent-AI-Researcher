import { useState } from "react";
import { motion } from "framer-motion";
import { ArrowUp, Sparkles, Telescope } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SUGGESTIONS } from "@/services/constants";

export function ResearchHome({ onSubmit }: { onSubmit: (q: string) => void }) {
  const [value, setValue] = useState("");

  const submit = () => {
    if (value.trim().length < 3) return;
    onSubmit(value.trim());
  };

  return (
    <div className="mx-auto flex h-full w-full max-w-2xl flex-col items-center justify-center px-6 py-10">
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        className="w-full"
      >
        <div className="mb-8 flex flex-col items-center text-center">
          <div className="mb-5 grid h-12 w-12 place-items-center rounded-2xl bg-primary/10 text-primary">
            <Telescope className="h-6 w-6" />
          </div>
          <h1 className="font-display text-3xl font-semibold tracking-tight text-balance sm:text-4xl">
            What would you like to research?
          </h1>
          <p className="mt-3 max-w-md text-sm text-muted-foreground text-balance">
            Pose any question and the assistant will plan, search, synthesize, and critique a
            sourced report.
          </p>
        </div>

        <div className="rounded-3xl border border-border bg-card p-2 shadow-card transition-shadow focus-within:shadow-pop">
          <textarea
            value={value}
            onChange={(e) => setValue(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) submit();
            }}
            placeholder="Ask anything…"
            className="scroll-fade min-h-[120px] w-full resize-none bg-transparent px-4 py-3 text-[15px] leading-relaxed outline-none placeholder:text-muted-foreground"
          />
          <div className="flex items-center justify-between px-2 pb-1">
            <span className="hidden text-xs text-muted-foreground sm:block">
              <kbd className="rounded border border-border bg-muted px-1.5 py-0.5 text-[10px]">
                ⌘ Enter
              </kbd>{" "}
              to run
            </span>
            <Button
              onClick={submit}
              disabled={value.trim().length < 3}
              size="icon"
              className="ml-auto h-10 w-10 rounded-xl"
            >
              <ArrowUp className="h-5 w-5" />
            </Button>
          </div>
        </div>

        <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-2xl mx-auto">
          {SUGGESTIONS.map((item) => (
            <button
              key={item}
              onClick={() => onSubmit(item)}
              className="group flex items-center gap-3 rounded-lg border border-border bg-card/50 p-4 text-left transition-all hover:bg-card hover:border-primary/50 hover:shadow-md active:scale-[0.98]"
            >
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-primary/10 text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
                <Sparkles className="h-4 w-4" />
              </div>
              <span className="text-sm font-medium text-foreground/80 group-hover:text-foreground">
                {item}
              </span>
            </button>
          ))}
        </div>
      </motion.div>
    </div>
  );
}
