import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import { Search, FileText, ArrowRight, Loader2, AlertCircle } from "lucide-react";
import { getHistory } from "@/services/history";
import { EmptyHistoryState } from "@/components/common/ErrorStates";
import { StatusBadge } from "@/components/common/StatusBadge";
import { formatDate } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { ResearchStatus, HistoryItem } from "@/types";

export const Route = createFileRoute("/app/history")({
  head: () => ({
    meta: [
      { title: "History — Agentic Research Assistant" },
      { name: "description", content: "Browse and search all of your past research reports." },
    ],
  }),
  component: HistoryPage,
});

const FILTERS: { key: ResearchStatus | "all"; label: string }[] = [
  { key: "all", label: "All" },
  { key: "COMPLETED", label: "Completed" },
  { key: "IN_PROGRESS", label: "In progress" },
  { key: "WAITING_FOR_USER", label: "Waiting" },
  { key: "FAILED", label: "Failed" },
  { key: "INTERRUPTED", label: "Interrupted" },
];

function HistoryPage() {
  const navigate = useNavigate();
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<ResearchStatus | "all">("all");

  const { data, isLoading, isError } = useQuery({
    queryKey: ["history"],
    queryFn: getHistory,
  });

  const reports = data?.reports || [];

  const items = useMemo(
    () =>
      reports.filter(
        (h: HistoryItem) =>
          (filter === "all" || h.status === filter) &&
          h.topic.toLowerCase().includes(query.toLowerCase()),
      ),
    [query, filter, reports],
  );

  return (
    <div className="scroll-fade h-full overflow-y-auto">
      <div className="mx-auto max-w-4xl px-6 py-10">
        <header className="mb-8">
          <h1 className="font-display text-3xl font-semibold tracking-tight">Research History</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            {reports.length} research tasks across all topics.
          </p>
        </header>

        <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search reports…"
              className="h-11 w-full rounded-xl border border-border bg-card pl-10 pr-4 text-sm shadow-soft outline-none transition-colors placeholder:text-muted-foreground focus:border-primary/40 focus:ring-2 focus:ring-primary/15"
            />
          </div>
          <div className="flex flex-wrap gap-1.5">
            {FILTERS.map((f) => (
              <button
                key={f.key}
                onClick={() => setFilter(f.key)}
                className={cn(
                  "rounded-full border px-3.5 py-2 text-sm font-medium transition-colors",
                  filter === f.key
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-border bg-card text-muted-foreground hover:text-foreground",
                )}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>

        {isLoading ? (
          <div className="flex flex-col items-center gap-3 rounded-2xl py-20 text-center">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            <p className="text-sm font-medium">Loading history...</p>
          </div>
        ) : isError ? (
          <div className="flex flex-col items-center gap-3 rounded-2xl py-20 text-center text-destructive">
            <AlertCircle className="h-8 w-8" />
            <p className="text-sm font-medium">Failed to load history</p>
          </div>
        ) : reports.length === 0 ? (
          <EmptyHistoryState onNewResearch={() => navigate({ to: "/app" })} />
        ) : (
          <div className="grid gap-3 sm:grid-cols-2">
            {items.map((item: HistoryItem, i: number) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: i * 0.04 }}
              >
                <Link
                  to="/app/report/$id"
                  params={{ id: item.id }}
                  className="group flex h-full flex-col gap-4 rounded-2xl border border-border bg-card p-5 shadow-soft transition-all hover:-translate-y-0.5 hover:border-primary/30 hover:shadow-card"
                >
                  <div className="flex items-start justify-between gap-3">
                    <h3 className="line-clamp-2 font-display text-base font-semibold leading-snug group-hover:text-primary">
                      {item.title || item.topic}
                    </h3>
                    {item.critic_score != null && (
                      <span className="shrink-0 rounded-lg bg-muted px-2 py-1 text-xs font-semibold tabular-nums">
                        {item.critic_score}
                      </span>
                    )}
                  </div>
                  <div className="mt-auto flex items-center gap-2">
                    <StatusBadge status={item.status} />
                    <span className="text-xs text-muted-foreground">{formatDate(item.created_at)}</span>
                    <ArrowRight className="ml-auto h-4 w-4 text-muted-foreground opacity-0 transition-all group-hover:translate-x-0.5 group-hover:opacity-100" />
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
