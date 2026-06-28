import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowRight, ArrowLeft, Check, MessageCircleQuestion, AlertCircle } from "lucide-react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

export function ClarificationDialog({
  open,
  questions,
  onComplete,
}: {
  open: boolean;
  questions: string[];
  onComplete: (answers: Record<string, string>) => void;
}) {
  const [step, setStep] = useState(0);
  const [direction, setDirection] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [error, setError] = useState(false); // Track validation error
  
  const q = questions[step];
  const isLast = step === questions.length - 1;
  const isFirst = step === 0;

  const next = () => {
    // Validate current answer
    const currentAnswer = answers[q]?.trim();
    if (!currentAnswer) {
      setError(true);
      return;
    }

    setError(false); // Clear error on successful validation

    if (isLast) {
      onComplete(answers);
    } else {
      setDirection(1);
      setStep((s) => s + 1);
    }
  };

  const back = () => {
    if (!isFirst) {
      setError(false); // Clear any errors when navigating back
      setDirection(-1);
      setStep((s) => s - 1);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setAnswers((a) => ({ ...a, [q]: e.target.value }));
    if (error) setError(false); // Remove error state as soon as they start typing
  };

  if (!q) return null;

  return (
    <Dialog open={open}>
      <DialogContent className="max-w-lg gap-0 overflow-hidden rounded-3xl border-border p-0 shadow-pop [&>button]:hidden">
        <DialogTitle className="sr-only">Clarification questions</DialogTitle>
        
        {/* Header */}
        <div className="flex items-center gap-3 border-b border-border bg-muted/30 px-6 py-4">
          <div className="grid h-9 w-9 place-items-center rounded-full bg-primary/10 text-primary">
            <MessageCircleQuestion className="h-5 w-5" />
          </div>
          <div>
            <h2 className="font-display text-base font-semibold">A few clarifications</h2>
            <p className="text-xs text-muted-foreground">Question {step + 1} of {questions.length}</p>
          </div>
        </div>

        <div className="px-6 pb-6 pt-5">
          {/* Progress Bar */}
          <div className="mb-5 flex gap-1.5">
            {questions.map((_, i) => (
              <div key={i} className={`h-1 flex-1 rounded-full transition-colors ${i <= step ? "bg-primary" : "bg-muted"}`} />
            ))}
          </div>

          <AnimatePresence mode="wait" initial={false} custom={direction}>
            <motion.div
              key={step}
              custom={direction}
              variants={{
                enter: (dir: number) => ({ opacity: 0, x: dir > 0 ? 32 : -32 }),
                center: { opacity: 1, x: 0 },
                exit: (dir: number) => ({ opacity: 0, x: dir > 0 ? -32 : 32 })
              }}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.2, ease: "easeInOut" }}
            >
              <label className="mb-3 block text-[15px] font-medium leading-relaxed text-balance">
                {q}
              </label>
              
              <Textarea
                autoFocus
                value={answers[q] ?? ""}
                onChange={handleInputChange}
                placeholder="Type your answer…"
                className={`min-h-28 resize-none rounded-xl text-[15px] transition-colors ${
                  error ? "border-destructive focus-visible:ring-destructive" : ""
                }`}
              />
              
              {/* Error Message */}
              {error && (
                <motion.p 
                  initial={{ opacity: 0, y: -5 }} 
                  animate={{ opacity: 1, y: 0 }} 
                  className="mt-2 flex items-center gap-1.5 text-sm font-medium text-destructive"
                >
                  <AlertCircle className="h-4 w-4" />
                  Please provide an answer before continuing.
                </motion.p>
              )}
            </motion.div>
          </AnimatePresence>

          {/* Footer Controls */}
          <div className="mt-5 flex items-center justify-between">
            <Button 
              variant="ghost" 
              onClick={back} 
              disabled={isFirst}
              className="gap-2 rounded-xl text-muted-foreground"
            >
              <ArrowLeft className="h-4 w-4" /> Back
            </Button>
            
            <Button onClick={next} className="gap-2 rounded-xl">
              {isLast ? (
                <>Start research <Check className="h-4 w-4" /></>
              ) : (
                <>Next <ArrowRight className="h-4 w-4" /></>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}