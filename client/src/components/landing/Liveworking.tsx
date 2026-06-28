import { useRef, useState, useEffect } from 'react';
import { motion, useInView } from 'framer-motion';
import {
  Brain,
  ShieldCheck,
  MessageCircleQuestion,
  GitBranch,
  Search,
  Globe,
  FileText,
  ClipboardCheck,
  AlertTriangle,
} from 'lucide-react';
import FadeIn from './FadeIn';

const mockEvents = [
  { icon: Brain, text: 'Topic received: "Impact of AI on Healthcare"', color: 'text-foreground' },
  { icon: ShieldCheck, text: 'Topic validated — scope manageable, sources available', color: 'text-success' },
  { icon: MessageCircleQuestion, text: 'Asking: "Which healthcare domains should we focus on?"', color: 'text-warning' },
  { icon: GitBranch, text: 'Decomposed into 6 subtopics, 18 search queries', color: 'text-primary' },
  { icon: Search, text: 'Searching: "AI radiology diagnostic accuracy 2024"', color: 'text-primary' },
  { icon: Search, text: 'Searching: "AI drug discovery recent breakthroughs"', color: 'text-primary' },
  { icon: Globe, text: 'Extracting structured data from 14 web sources...', color: 'text-primary' },
  { icon: FileText, text: 'Crafting report — 2,847 words, 23 citations', color: 'text-foreground' },
  { icon: ClipboardCheck, text: 'Confidence: 87% | 14 strengths | 3 weaknesses', color: 'text-success' },
  { icon: AlertTriangle, text: 'Suggestion: Add FDA AI regulatory landscape sources', color: 'text-warning' },
];

function Liveworking() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-80px' });
  const [visibleLines, setVisibleLines] = useState(0);

  useEffect(() => {
    if (!isInView) return;
    let timeout: ReturnType<typeof setTimeout>;
    let line = 0;

    const next = () => {
      setVisibleLines(line);
      line++;
      if (line <= mockEvents.length) {
        timeout = setTimeout(next, 650);
      } else {
        timeout = setTimeout(() => {
          line = 0;
          next();
        }, 2200);
      }
    };

    next();
    return () => clearTimeout(timeout);
  }, [isInView]);

  return (
    <section id="working" className="py-20 sm:py-28 bg-muted/30">
      <div className="mx-auto max-w-3xl px-4 sm:px-6">
        <FadeIn className="text-center mb-10">
          <h2 className="font-display text-3xl sm:text-4xl font-bold tracking-tight">
            Watch it work
          </h2>
          <p className="mt-3 text-muted-foreground max-w-lg mx-auto">
            Every step is streamed to you in real-time via Server-Sent Events.
            No spinners, no black boxes.
          </p>
        </FadeIn>

        <FadeIn delay={0.1}>
          <div
            ref={ref}
            className="rounded-xl border bg-card shadow-card overflow-hidden"
          >
            {/* Terminal header */}
            <div className="flex items-center gap-2 px-4 py-2.5 border-b bg-muted/50">
              <div className="w-2.5 h-2.5 rounded-full bg-red-400/60" />
              <div className="w-2.5 h-2.5 rounded-full bg-yellow-400/60" />
              <div className="w-2.5 h-2.5 rounded-full bg-green-400/60" />
              <span className="text-[11px] text-muted-foreground/60 ml-2 font-mono">
                research-agent — sse stream
              </span>
            </div>

            {/* Terminal body */}
            <div className="p-4 sm:p-5 font-mono text-[13px] space-y-2.5 min-h-[300px] max-h-[380px] overflow-y-auto scroll-fade">
              {mockEvents.map((event, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 6 }}
                  animate={
                    i < visibleLines
                      ? { opacity: 1, y: 0 }
                      : { opacity: 0, y: 6 }
                  }
                  transition={{ duration: 0.3, ease: 'easeOut' }}
                  className="flex items-start gap-2.5"
                >
                  <event.icon
                    className={`w-3.5 h-3.5 mt-0.5 shrink-0 ${event.color}`}
                  />
                  <span className="text-foreground/75 leading-snug">
                    {event.text}
                  </span>
                </motion.div>
              ))}

              {/* Blinking cursor */}
              {visibleLines > 0 && visibleLines < mockEvents.length && (
                <motion.span
                  animate={{ opacity: [1, 0] }}
                  transition={{
                    duration: 0.6,
                    repeat: Infinity,
                    ease: 'easeInOut',
                  }}
                  className="inline-block text-primary text-xs leading-none"
                >
                  ▊
                </motion.span>
              )}
            </div>
          </div>
        </FadeIn>
      </div>
    </section>
  );
}

export default Liveworking;