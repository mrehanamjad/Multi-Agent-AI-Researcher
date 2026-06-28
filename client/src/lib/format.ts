import type { ResearchStatus } from "@/types";

export function formatDate(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

export function relativeDate(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.round(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.round(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.round(hrs / 24);
  if (days < 30) return `${days}d ago`;
  return formatDate(iso);
}

export const STATUS_META: Record<
  ResearchStatus,
  { label: string; className: string; dot: string }
> = {
  COMPLETED: {
    label: "Completed",
    className: "bg-success/12 text-success border-success/20",
    dot: "bg-success",
  },
  IN_PROGRESS: { // fallback mapping for backward compat if needed
    label: "In progress",
    className: "bg-primary/12 text-primary border-primary/20",
    dot: "bg-primary animate-pulse",
  },
  PLANNING: {
    label: "Planning",
    className: "bg-primary/12 text-primary border-primary/20",
    dot: "bg-primary animate-pulse",
  },
  SEARCHING: {
    label: "Searching",
    className: "bg-primary/12 text-primary border-primary/20",
    dot: "bg-primary animate-pulse",
  },
  SYNTHESIZING: {
    label: "Synthesizing",
    className: "bg-primary/12 text-primary border-primary/20",
    dot: "bg-primary animate-pulse",
  },
  CRITIC: {
    label: "Evaluating",
    className: "bg-primary/12 text-primary border-primary/20",
    dot: "bg-primary animate-pulse",
  },
  VALIDATING: {
    label: "Validating",
    className: "bg-primary/12 text-primary border-primary/20",
    dot: "bg-primary animate-pulse",
  },
  WAITING_FOR_USER: {
    label: "Waiting",
    className: "bg-warning/15 text-warning-foreground border-warning/25",
    dot: "bg-warning",
  },
  FAILED: {
    label: "Failed",
    className: "bg-destructive/12 text-destructive border-destructive/20",
    dot: "bg-destructive",
  },
  INTERRUPTED: {
    label: "Interrupted",
    className: "bg-amber-500/12 text-amber-600 dark:text-amber-500 border-amber-500/20",
    dot: "bg-amber-500",
  },
  DRAFT: {
    label: "Draft",
    className: "bg-muted text-muted-foreground border-border",
    dot: "bg-muted-foreground",
  },
};

export function faviconUrl(domain: string): string {
  return `https://www.google.com/s2/favicons?domain=${domain}&sz=64`;
}
