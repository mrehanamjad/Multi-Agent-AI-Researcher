import { useState } from "react";
import { motion } from "framer-motion";
import { Copy, Check, Download, Trash2, Link2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { StatusBadge } from "@/components/common/StatusBadge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Markdown } from "./Markdown";
import { SourceCard } from "./SourceCard";
import { CriticCard } from "./CriticCard";
import { EmptySectionState } from "@/components/common/ErrorStates";
import { formatDate } from "@/lib/format";
import { downloadPdf } from "@/services/history";
import type { Report } from "@/types";

export function ReportView({ report, onDelete }: { report: Report; onDelete?: () => void }) {
  const [copied, setCopied] = useState(false);

  const copyMarkdown = () => {
    navigator.clipboard.writeText(report.report);
    setCopied(true);
    toast.success("Markdown copied to clipboard");
    setTimeout(() => setCopied(false), 1600);
  };

  const body = report.report.replace(/^#\s+.+\n+/, "");

  return (
    <div className="scroll-fade h-full overflow-y-auto">
      {/* Sticky toolbar */}
      <div className="glass sticky top-0 z-10 border-b border-border">
        <div className="mx-auto flex max-w-3xl items-center gap-2 px-6 py-3">
          <span className="truncate text-sm font-medium text-muted-foreground">
            {formatDate(report.created_at)}
          </span>
          <StatusBadge status={report.status} className="hidden sm:inline-flex" />
          <div className="ml-auto flex items-center gap-1.5">
            <Button variant="outline" size="sm" className="gap-1.5" onClick={() => downloadPdf(report.id)}>
              <Download className="h-4 w-4" />
              <span className="hidden sm:inline">PDF</span>
            </Button>
            <Button variant="outline" size="sm" className="gap-1.5" onClick={copyMarkdown}>
              {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
              <span className="hidden sm:inline">Copy</span>
            </Button>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  className="gap-1.5 text-destructive hover:bg-destructive/10 hover:text-destructive"
                >
                  <Trash2 className="h-4 w-4" />
                  <span className="hidden sm:inline">Delete</span>
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Delete this report?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This action cannot be undone. The report and its sources will be removed.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction
                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                    onClick={() => {
                      toast.success("Report deleted");
                      onDelete?.();
                    }}
                  >
                    Delete
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </div>
      </div>

      <motion.article
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="mx-auto max-w-3xl px-6 pb-24 pt-8"
      >
        <h1 className="mb-8 font-display text-3xl font-semibold tracking-tight text-balance sm:text-4xl">
          {report.title || report.topic}
        </h1>

        <Tabs defaultValue="report" className="w-full">
          <TabsList className="mb-6">
            <TabsTrigger value="report">Report</TabsTrigger>
            <TabsTrigger value="sources">
              Sources {report.sources && report.sources.length > 0 && `(${report.sources ? report.sources.length : 0})`}
            </TabsTrigger>
            {report.critic_feedback ? (
              <TabsTrigger value="review">
                Review ⭐ {report.critic_score || report.critic_feedback.overall_score}
              </TabsTrigger>
            ) : (
              <TabsTrigger value="review">Review</TabsTrigger>
            )}
          </TabsList>
          
          <TabsContent value="report" className="mt-0 outline-none">
            <Markdown content={body} />
          </TabsContent>
          
          <TabsContent value="sources" className="mt-0 outline-none">
            {report.sources && report.sources.length > 0 ? (
              <div className="grid gap-3 sm:grid-cols-2">
                {report.sources && report.sources.map((s, i) => (
                  <SourceCard key={s.url || i} source={s} index={i} />
                ))}
              </div>
            ) : (
              <EmptySectionState 
                title="No Sources Found" 
                description="The assistant didn't collect any external sources for this report." 
              />
            )}
          </TabsContent>
          
          <TabsContent value="review" className="mt-0 outline-none">
            {report.critic_feedback ? (
              <CriticCard critic={report.critic_feedback} />
            ) : (
              <EmptySectionState 
                title="No Review Available" 
                description="The assistant skipped the critical review phase for this report." 
              />
            )}
          </TabsContent>
        </Tabs>
      </motion.article>
    </div>
  );
}
