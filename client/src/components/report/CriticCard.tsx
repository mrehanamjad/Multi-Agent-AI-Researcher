import React from "react";
import { CheckCircle2, AlertCircle, Lightbulb, Sparkles } from "lucide-react";
import { ScoreRing } from "@/components/common/ScoreRing";
import { Progress } from "@/components/ui/progress";
import type { Critic } from "@/types";

const THEMES = {
  success: {
    text: "text-emerald-600 dark:text-emerald-500",
    bg: "bg-emerald-100 dark:bg-emerald-500/10",
    dot: "bg-emerald-500",
  },
  destructive: {
    text: "text-red-600 dark:text-red-500",
    bg: "bg-red-100 dark:bg-red-500/10",
    dot: "bg-red-500",
  },
  warning: {
    text: "text-amber-600 dark:text-amber-500",
    bg: "bg-amber-100 dark:bg-amber-500/10",
    dot: "bg-amber-500",
  },
};

type ThemeVariant = keyof typeof THEMES;

function List({
  title,
  items,
  icon: Icon,
  variant,
}: {
  title: string;
  items: string[]; 
  icon: React.ElementType;
  variant: ThemeVariant;
}) {
  const theme = THEMES[variant];
  

  if (items.length === 0) return null;

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${theme.bg}`}>
          <Icon className={`h-4 w-4 ${theme.text}`} />
        </div>
        <h4 className="font-semibold tracking-tight">{title}</h4>
      </div>
      <ul className="space-y-2.5">
        {items.map((point, idx) => (
          <li key={idx} className="flex items-start gap-3">
            <span className={`mt-2 h-1.5 w-1.5 shrink-0 rounded-full ${theme.dot}`} aria-hidden="true" />
            <span className="text-sm leading-relaxed text-muted-foreground">
              {point}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}

export function CriticCard({ critic }: { critic: Critic }) {
  // Convert 0-10 backend scale to 0-100 for the UI rings
  const displayScore = critic.overall_score * 10;
  const displayConfidence = critic.confidence === "HIGH" ? 100 : critic.confidence === "MEDIUM" ? 50 : 10;

  return (
    <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm transition-all hover:shadow-md">
      {/* Header Section */}
      <div className="flex flex-col items-center gap-6 border-b border-border bg-muted/40 p-6 sm:flex-row sm:items-center sm:gap-8">
        <div className="shrink-0 drop-shadow-sm">
          <ScoreRing score={displayScore} />
        </div>
        
        <div className="flex-1 space-y-3 text-center sm:text-left">
          <div className="flex items-center justify-center gap-2 sm:justify-start">
            <Sparkles className="h-4 w-4 text-primary" />
            <h3 className="font-display text-lg font-semibold tracking-tight">Critic Review</h3>
          </div>
          <p className="text-sm text-muted-foreground text-balance">
            An automated quality evaluation of factual grounding, coverage, and balance.
          </p>
          
          <div className="pt-1">
            <div className="mb-1.5 flex items-center justify-between text-xs">
              <span className="font-medium text-muted-foreground">Confidence</span>
              <span className="font-semibold tabular-nums">{critic.confidence}</span>
            </div>
            <Progress value={displayConfidence} className="h-1.5 w-full bg-border/50" />
          </div>
        </div>
      </div>

      {/* Content Section */}
      <div className="grid gap-x-8 gap-y-10 p-6 sm:p-8 sm:grid-cols-2">
        <List 
          title="Strengths" 
          items={critic.strengths} 
          icon={CheckCircle2} 
          variant="success" 
        />
        <List 
          title="Weaknesses" 
          items={critic.weaknesses} 
          icon={AlertCircle} 
          variant="destructive" 
        />
        {/* Make Suggestions span full width so it doesn't leave an empty column space */}
        <div className="sm:col-span-2 rounded-xl border border-border/50 bg-muted/20 p-5">
          <List 
            title="Suggestions" 
            items={critic.suggestions} 
            icon={Lightbulb} 
            variant="warning" 
          />
        </div>
      </div>
    </div>
  );
}