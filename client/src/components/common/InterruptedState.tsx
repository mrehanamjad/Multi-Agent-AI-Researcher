import { WifiOff, Plus, Home } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "@tanstack/react-router";

export function InterruptedState({
  message = "The research was interrupted before it could complete.",
  topic = "",
  reportId = "",
}: {
  message?: string;
  topic?: string;
  reportId?: string;
}) {
  const navigate = useNavigate();

  const handleStartNew = () => {
    navigate({
      to: "/app",
      search: { retryTopic: topic }
    });
  };

  const handleReturnHome = () => {
    navigate({ to: "/app" });
  };

  return (
    <div className="flex flex-col items-center justify-center gap-6 rounded-2xl border border-dashed border-border bg-card/50 px-6 py-14 text-center">
      <div className="grid h-16 w-16 place-items-center rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-500">
        <WifiOff className="h-8 w-8" />
      </div>
      <div className="space-y-2 max-w-md">
        <h3 className="font-display text-xl font-semibold">Research Interrupted</h3>
        <p className="text-sm text-muted-foreground leading-relaxed">
          This research did not finish because your connection to the server was interrupted before the process completed.
        </p>
        
        {message && (
          <div className="mt-4 rounded-lg bg-muted/50 p-4 text-sm text-left border border-border/50">
            <span className="font-medium text-foreground mb-1 block">Reason:</span>
            <span className="text-muted-foreground">{message}</span>
          </div>
        )}
      </div>
      
      <div className="flex flex-col sm:flex-row gap-3 mt-2 w-full sm:w-auto">
        <Button onClick={handleStartNew} className="gap-2 w-full sm:w-auto">
          <Plus className="h-4 w-4" />
          Start New Research
        </Button>
        <Button variant="outline" onClick={handleReturnHome} className="gap-2 w-full sm:w-auto">
          <Home className="h-4 w-4" />
          Return Home
        </Button>
      </div>
    </div>
  );
}
