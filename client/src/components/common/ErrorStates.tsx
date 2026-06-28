import { AlertTriangle, XCircle, RefreshCw, ServerCrash, WifiOff, FileSearch } from "lucide-react";
import { Button } from "@/components/ui/button";

interface InvalidTopicStateProps {
  reason?: string;
  onNewResearch: () => void;
}

export function InvalidTopicState({ reason, onNewResearch }: InvalidTopicStateProps) {
  return (
    <div className="flex flex-col items-center justify-center gap-4 rounded-2xl border border-dashed border-destructive/30 bg-destructive/5 px-6 py-14 text-center">
      <div className="grid h-12 w-12 place-items-center rounded-full bg-destructive/10 text-destructive">
        <XCircle className="h-6 w-6" />
      </div>
      <div className="space-y-2">
        <h3 className="font-display text-lg font-semibold text-destructive">Invalid Research Topic</h3>
        <p className="mx-auto max-w-md text-sm text-muted-foreground">
          The requested topic cannot be researched because it violates our safety guidelines or is not suitable for academic or professional research.
        </p>
      </div>
      {reason && (
        <div className="mt-2 max-w-lg rounded-xl border border-border bg-card p-4 text-left shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1">Reason</p>
          <p className="text-sm text-foreground">{reason}</p>
        </div>
      )}
      <div className="mt-4 flex gap-3">
        <Button onClick={onNewResearch}>Start New Research</Button>
      </div>
    </div>
  );
}

interface ExecutionFailedStateProps {
  meta?: Record<string, any>;
  onRetry: () => void;
  onReturnHome: () => void;
}

export function ExecutionFailedState({ meta, onRetry, onReturnHome }: ExecutionFailedStateProps) {
  return (
    <div className="flex flex-col items-center justify-center gap-4 rounded-2xl border border-dashed border-border bg-card/50 px-6 py-14 text-center">
      <div className="grid h-12 w-12 place-items-center rounded-full bg-destructive/10 text-destructive">
        <AlertTriangle className="h-6 w-6" />
      </div>
      <div className="space-y-2">
        <h3 className="font-display text-lg font-semibold">Research Could Not Be Completed</h3>
        <p className="mx-auto max-w-sm text-sm text-muted-foreground">
          Something went wrong while generating this research.
        </p>
      </div>

      <div className="text-sm text-muted-foreground">
        <p className="mb-1 font-medium">Possible causes:</p>
        <ul className="list-inside list-disc opacity-80">
          <li>Search provider unavailable</li>
          <li>AI model timeout</li>
          <li>Network interruption</li>
          <li>Internal server error</li>
        </ul>
      </div>

      {meta?.error && (
        <details className="mt-2 max-w-lg cursor-pointer rounded-xl border border-border bg-muted/30 p-3 text-left">
          <summary className="text-xs font-semibold text-muted-foreground outline-none">Technical Details</summary>
          <p className="mt-2 font-mono text-xs text-muted-foreground">{meta.error}</p>
        </details>
      )}

      <div className="mt-4 flex flex-wrap justify-center gap-3">
        <Button variant="default" onClick={onRetry} className="gap-2">
          <RefreshCw className="h-4 w-4" />
          Retry Research
        </Button>
        <Button variant="outline" onClick={onReturnHome}>
          Return Home
        </Button>
      </div>
    </div>
  );
}

interface StreamErrorStateProps {
  type: "network" | "timeout" | "server" | "unknown";
  message?: string;
  onRetry: () => void;
}

export function StreamErrorState({ type, message, onRetry }: StreamErrorStateProps) {
  const isNetwork = type === "network";
  const isTimeout = type === "timeout";
  const isServer = type === "server";

  const Icon = isNetwork ? WifiOff : isServer ? ServerCrash : AlertTriangle;
  const title = isNetwork ? "Network Lost" : isTimeout ? "Request Timeout" : isServer ? "Server Error" : "Stream Interrupted";
  const description = isNetwork
    ? "Your connection to the server was interrupted."
    : isTimeout
      ? "The research took longer than expected and timed out."
      : isServer
        ? "The server encountered an unexpected error while researching."
        : "The research stream was interrupted unexpectedly.";

  return (
    <div className="mx-auto flex h-full max-w-xl flex-col items-center justify-center px-6 text-center">
      <div className="mb-6 grid h-16 w-16 place-items-center rounded-full bg-destructive/10 text-destructive">
        <Icon className="h-8 w-8" />
      </div>
      <h3 className="mb-2 font-display text-2xl font-semibold tracking-tight">{title}</h3>
      <p className="mb-8 text-muted-foreground">{description}</p>

      {message && (
        <div className="mb-8 max-w-md rounded-lg border border-destructive/20 bg-destructive/5 p-3 text-left text-xs font-mono text-destructive/80">
          {message}
        </div>
      )}

      <Button onClick={onRetry} size="lg" className="gap-2">
        <RefreshCw className="h-4 w-4" />
        Retry Attempt
      </Button>
    </div>
  );
}

export function EmptyHistoryState({ onNewResearch }: { onNewResearch: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center gap-4 rounded-2xl border border-dashed border-border bg-card/30 px-6 py-20 text-center">
      <div className="grid h-16 w-16 place-items-center rounded-full bg-primary/10 text-primary">
        <FileSearch className="h-8 w-8" />
      </div>
      <div className="space-y-1">
        <h3 className="font-display text-xl font-semibold">No Research History</h3>
        <p className="mx-auto max-w-sm text-sm text-muted-foreground">
          You haven't conducted any research yet. Start a new topic to see it appear here.
        </p>
      </div>
      <Button onClick={onNewResearch} className="mt-4">
        Start New Research
      </Button>
    </div>
  );
}

export function EmptySectionState({ title, description }: { title: string; description: string }) {
  return (
    <div className="flex flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-border bg-card/50 p-8 text-center">
      <h4 className="font-medium text-foreground">{title}</h4>
      <p className="max-w-sm text-sm text-muted-foreground">{description}</p>
    </div>
  );
}
