import {
  Brain,
  ShieldCheck,
  MessageCircleQuestion,
  GitBranch,
  Search,
  Globe,
  FileText,
  ClipboardCheck,
} from "lucide-react";
import FadeIn from "./FadeIn";

const steps = [
  {
    icon: Brain,
    title: "Topic",
    desc: "Enter any research topic — from technical analysis to market research.",
  },
  {
    icon: ShieldCheck,
    title: "Validate",
    desc: "An agent checks feasibility, scope, and source availability before proceeding.",
  },
  {
    icon: MessageCircleQuestion,
    title: "Clarify",
    desc: "Smart questions refine depth, focus areas, preferred sources, and constraints.",
  },
  {
    icon: GitBranch,
    title: "Decompose",
    desc: "Break the topic into focused subtopics and generate precise search queries.",
  },
  {
    icon: Search,
    title: "Search",
    desc: "Multiple agents fan out across the web, querying diverse sources simultaneously.",
  },
  {
    icon: Globe,
    title: "Extract",
    desc: "Parse and extract structured, relevant data from every discovered page.",
  },
  {
    icon: FileText,
    title: "Report",
    desc: "Synthesize all findings into a structured, well-cited research report.",
  },
  {
    icon: ClipboardCheck,
    title: "Critique",
    desc: "Score confidence, flag weaknesses, highlight strengths, and suggest fixes.",
  },
];

function Process() {
  return (
    <section id="process" className="py-20 sm:py-28">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <FadeIn className="text-center mb-14">
          <h2 className="font-display text-3xl sm:text-4xl font-bold tracking-tight">
            How it works
          </h2>
          <p className="mt-3 text-muted-foreground max-w-lg mx-auto">
            A sequential pipeline of specialized agents, each focused on one aspect of the research
            process.
          </p>
        </FadeIn>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {steps.map((step, i) => (
            <FadeIn key={step.title} delay={i * 0.05}>
              <div className="relative group rounded-xl border bg-card p-5 shadow-soft hover:shadow-card transition-all duration-300 h-full">
                {/* Step number */}
                <span className="absolute top-3 right-3.5 text-[11px] font-mono text-muted-foreground/30 select-none">
                  {String(i + 1).padStart(2, "0")}
                </span>
                {/* Icon */}
                <div className="w-9 h-9 rounded-lg bg-primary/[0.07] flex items-center justify-center mb-3.5 group-hover:bg-primary/[0.12] transition-colors duration-300">
                  <step.icon className="w-4 h-4 text-primary" />
                </div>
                <h3 className="font-display font-semibold text-sm">{step.title}</h3>
                <p className="mt-1.5 text-xs text-muted-foreground leading-relaxed">{step.desc}</p>
              </div>
            </FadeIn>
          ))}
        </div>
      </div>
    </section>

  );
}

export default Process;
