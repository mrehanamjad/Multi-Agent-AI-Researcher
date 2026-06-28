import { useState } from "react";
import { Link, useRouterState } from "@tanstack/react-router";
import { Plus, Search, Telescope, Loader2 } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { UserButton } from "@clerk/clerk-react";
import { getHistory } from "@/services/history";
import { StatusBadge } from "@/components/common/StatusBadge";
import { relativeDate } from "@/lib/format";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import Logo from "./Logo";

export function Sidebar({ onClose }: { onClose?: () => void }) {
  const [query, setQuery] = useState("");
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  const { data, isLoading } = useQuery({
    queryKey: ["history"],
    queryFn: getHistory,
  });

  const reports = data?.reports || [];

  const items = reports.filter((h) =>
    h.topic.toLowerCase().includes(query.toLowerCase()),
  );

  return (
    <div className="flex h-full flex-col bg-sidebar text-sidebar-foreground">
      {/* Logo */}
      <Logo />

      <div className="px-3">
        <Button
          asChild
          className="w-full justify-start gap-2 rounded-xl shadow-soft"
          onClick={onClose}
        >
          <Link to="/app">
            <Plus className="h-4 w-4" />
            New Research
          </Link>
        </Button>
      </div>

      {/* Search */}
      <div className="px-3 py-3">
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search history…"
            className="h-9 w-full rounded-lg border border-sidebar-border bg-background/60 pl-9 pr-3 text-sm outline-none transition-colors placeholder:text-muted-foreground focus:border-primary/40 focus:ring-2 focus:ring-primary/15"
          />
        </div>
      </div>

      {/* History */}
      <div className="flex items-center justify-between px-4 pb-1">
        <span className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
          History
        </span>
        <Link
          to="/app/history"
          onClick={onClose}
          className="text-[11px] font-medium text-primary hover:underline"
        >
          View all
        </Link>
      </div>

      <nav className="scroll-fade flex-1 space-y-1 overflow-y-auto px-2 pb-2">
        {isLoading ? (
          <div className="flex justify-center py-6">
            <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
          </div>
        ) : items.length === 0 ? (
          <p className="px-3 py-6 text-center text-xs text-muted-foreground">No results</p>
        ) : (
          items.map((item) => {
            const activePath = pathname === `/app/report/${item.id}`;
            return (
              <Link
                key={item.id}
                to="/app/report/$id"
                params={{ id: item.id }}
                onClick={onClose}
                className={cn(
                  "block rounded-lg px-3 py-2.5 transition-colors hover:bg-sidebar-accent",
                  activePath && "bg-sidebar-accent",
                )}
              >
                <p className="mb-1.5 line-clamp-1 text-[13px] font-medium">{item.title || item.topic}</p>
                <div className="flex items-center gap-2">
                  <StatusBadge status={item.status} />
                  {item.critic_score != null && (
                    <span className="text-[11px] font-medium text-muted-foreground">
                      {item.critic_score}/10
                    </span>
                  )}
                  <span className="ml-auto text-[11px] text-muted-foreground">
                    {relativeDate(item.created_at)}
                  </span>
                </div>
              </Link>
            );
          })
        )}
      </nav>

      {/* User profile */}
      <div className="border-t border-sidebar-border p-3">
        <div className="flex items-center gap-3 rounded-xl px-2 py-2 transition-colors hover:bg-sidebar-accent">
          <UserButton showName />
        </div>
      </div>
    </div>
  );
}
