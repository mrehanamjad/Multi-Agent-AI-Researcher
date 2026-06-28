import { useRef, useState, useEffect, Fragment } from 'react';
import { motion, useInView } from 'framer-motion';
import { createFileRoute, Link } from '@tanstack/react-router';
import { SignedIn, SignedOut, SignInButton, SignUpButton } from '@clerk/clerk-react';
import {
  Brain,
  ShieldCheck,
  MessageCircleQuestion,
  GitBranch,
  Search,
  Globe,
  FileText,
  ClipboardCheck,
  ArrowRight,
  Zap,
  BarChart3,
  AlertTriangle,
  TrendingUp,
  Sparkles,
} from 'lucide-react';
import { Button } from '@/components/ui/button';

export const Route = createFileRoute('/')({
  component: LandingPage,
});

/* ──────────────────────────── Data ──────────────────────────── */

const steps = [
  {
    icon: Brain,
    title: 'Topic',
    desc: 'Enter any research topic — from technical analysis to market research.',
  },
  {
    icon: ShieldCheck,
    title: 'Validate',
    desc: 'An agent checks feasibility, scope, and source availability before proceeding.',
  },
  {
    icon: MessageCircleQuestion,
    title: 'Clarify',
    desc: 'Smart questions refine depth, focus areas, preferred sources, and constraints.',
  },
  {
    icon: GitBranch,
    title: 'Decompose',
    desc: 'Break the topic into focused subtopics and generate precise search queries.',
  },
  {
    icon: Search,
    title: 'Search',
    desc: 'Multiple agents fan out across the web, querying diverse sources simultaneously.',
  },
  {
    icon: Globe,
    title: 'Extract',
    desc: 'Parse and extract structured, relevant data from every discovered page.',
  },
  {
    icon: FileText,
    title: 'Report',
    desc: 'Synthesize all findings into a structured, well-cited research report.',
  },
  {
    icon: ClipboardCheck,
    title: 'Critique',
    desc: 'Score confidence, flag weaknesses, highlight strengths, and suggest fixes.',
  },
];

const features = [
  {
    icon: Zap,
    title: 'Real-Time Streaming',
    desc: 'Watch every agent think and work via Server-Sent Events — no spinners, no black boxes.',
  },
  {
    icon: BarChart3,
    title: 'Confidence Scoring',
    desc: 'Every report ships with a quantitative confidence level backed by source-quality metrics.',
  },
  {
    icon: AlertTriangle,
    title: 'Self-Critique',
    desc: 'A dedicated critic agent identifies gaps, biases, and unsupported claims automatically.',
  },
  {
    icon: TrendingUp,
    title: 'Actionable Improvements',
    desc: 'Get specific, actionable suggestions to strengthen weak areas of the research.',
  },
];

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

/* ──────────────────────── Utility: FadeIn ──────────────────────── */

function FadeIn({
  children,
  delay = 0,
  className = '',
}: {
  children: React.ReactNode;
  delay?: number;
  className?: string;
}) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-60px' });
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 28 }}
      animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 28 }}
      transition={{ duration: 0.55, delay, ease: [0.21, 0.47, 0.32, 0.98] }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

/* ──────────────────────────── Nav ──────────────────────────── */

function Nav() {
  return (
    <motion.nav
      initial={{ y: -16, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5, ease: [0.21, 0.47, 0.32, 0.98] }}
      className="fixed top-0 left-0 right-0 z-50 glass border-b"
    >
      <div className="mx-auto max-w-6xl flex items-center justify-between px-4 sm:px-6 h-14">
        <Link
          to="/"
          className="flex items-center gap-2 font-display font-semibold text-foreground"
        >
          <div className="w-7 h-7 rounded-lg bg-primary flex items-center justify-center">
            <Brain className="w-4 h-4 text-primary-foreground" />
          </div>
          <span>DeepResearch</span>
        </Link>

        <div className="hidden sm:flex items-center gap-6 text-sm text-muted-foreground">
          <a href="#process" className="hover:text-foreground transition-colors">
            Process
          </a>
          <a href="#demo" className="hover:text-foreground transition-colors">
            Live Demo
          </a>
          <a href="#features" className="hover:text-foreground transition-colors">
            Features
          </a>
        </div>

        <div className="flex items-center gap-2">
          <SignedOut>
            <SignInButton mode="modal">
              <Button variant="ghost" size="sm">
                Sign in
              </Button>
            </SignInButton>
            <SignUpButton mode="modal">
              <Button size="sm">Get started</Button>
            </SignUpButton>
          </SignedOut>
          <SignedIn>
            <Link to="/app">
              <Button size="sm">App</Button>
            </Link>
          </SignedIn>
        </div>
      </div>
    </motion.nav>
  );
}

/* ──────────────────── Hero: Pipeline Flow ──────────────────── */

function PipelineFlow() {
  const [active, setActive] = useState(0);

  useEffect(() => {
    const t = setInterval(() => setActive((p) => (p + 1) % steps.length), 1000);
    return () => clearInterval(t);
  }, []);

  return (
    <div className="flex flex-col items-center gap-3 mt-14 sm:mt-16">
      {/* Circles + connectors */}
      <div className="flex items-center flex-wrap justify-center gap-y-5">
        {steps.map((step, i) => (
          <Fragment key={step.title}>
            <motion.div
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.7 + i * 0.06, type: 'spring', stiffness: 260, damping: 20 }}
            >
              <motion.div
                animate={{
                  backgroundColor:
                    active === i ? 'var(--color-primary)' : 'var(--color-muted)',
                  color:
                    active === i
                      ? 'var(--color-primary-foreground)'
                      : 'var(--color-muted-foreground)',
                  scale: active === i ? 1.15 : 1,
                }}
                transition={{ duration: 0.25 }}
                className="w-9 h-9 sm:w-10 sm:h-10 rounded-full flex items-center justify-center"
              >
                <step.icon className="w-4 h-4" />
              </motion.div>
            </motion.div>

            {i < steps.length - 1 && (
              <div className="w-4 sm:w-8 lg:w-12 h-px bg-border relative overflow-hidden mx-0.5">
                <motion.div
                  animate={
                    active === i
                      ? { x: ['-100%', '300%'] }
                      : { x: '-100%' }
                  }
                  transition={{ duration: 0.5, ease: 'easeInOut' }}
                  className="absolute inset-y-0 w-1/3 bg-primary/70 rounded-full"
                />
              </div>
            )}
          </Fragment>
        ))}
      </div>

      {/* Labels */}
      <div className="flex items-start flex-wrap justify-center gap-y-3">
        {steps.map((step, i) => (
          <Fragment key={step.title}>
            <span
              className={`w-9 sm:w-10 text-center text-[10px] sm:text-[11px] font-medium transition-colors duration-300 ${
                active === i ? 'text-foreground' : 'text-muted-foreground/50'
              }`}
            >
              {step.title}
            </span>
            {i < steps.length - 1 && (
              <div className="w-4 sm:w-8 lg:w-12 mx-0.5" />
            )}
          </Fragment>
        ))}
      </div>
    </div>
  );
}

/* ──────────────────────────── Hero ──────────────────────────── */

function Hero() {
  return (
    <section className="relative pt-28 pb-16 sm:pt-36 sm:pb-24 overflow-hidden">
      {/* Background layers */}
      <div className="absolute inset-0 -z-10">
        {/* Subtle grid */}
        <div className="absolute inset-0 bg-[linear-gradient(var(--color-border)_1px,transparent_1px),linear-gradient(90deg,var(--color-border)_1px,transparent_1px)] bg-[size:64px_64px] opacity-30" />
        {/* Primary glow */}
        <motion.div
          animate={{
            x: [0, 25, -15, 0],
            y: [0, -15, 10, 0],
            scale: [1, 1.04, 0.97, 1],
          }}
          transition={{ duration: 22, repeat: Infinity, ease: 'linear' }}
          className="absolute -top-40 left-1/2 -translate-x-1/2 w-[700px] h-[450px] bg-primary/[0.07] rounded-full blur-3xl"
        />
        {/* Accent glow */}
        <motion.div
          animate={{
            x: [0, -20, 15, 0],
            y: [0, 20, -10, 0],
          }}
          transition={{ duration: 18, repeat: Infinity, ease: 'linear' }}
          className="absolute -bottom-40 -right-20 w-[400px] h-[400px] bg-accent/10 rounded-full blur-3xl"
        />
      </div>

      <div className="mx-auto max-w-3xl px-4 sm:px-6 text-center">
        {/* Badge */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45 }}
          className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-primary/[0.07] border border-primary/10 text-primary text-xs font-medium mb-6"
        >
          <Sparkles className="w-3 h-3" />
          Multi-Agent AI Research
        </motion.div>

        {/* Headline */}
        <motion.h1
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.08 }}
          className="font-display text-4xl sm:text-5xl lg:text-[3.5rem] font-bold tracking-tight text-foreground text-balance leading-[1.1]"
        >
          Deep Research,{' '}
          <span className="text-primary">Automated.</span>
        </motion.h1>

        {/* Subtitle */}
        <motion.p
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.16 }}
          className="mt-5 text-base sm:text-lg text-muted-foreground max-w-xl mx-auto text-balance leading-relaxed"
        >
          Eight specialized agents validate, search, extract, write, and critique
          your research — streamed in real-time with confidence scoring.
        </motion.p>

        {/* CTAs */}
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.24 }}
          className="mt-8 flex items-center justify-center gap-3"
        >
          <SignedOut>
            <SignUpButton mode="modal">
              <Button size="lg" className="gap-2">
                Start researching
                <ArrowRight className="w-4 h-4" />
              </Button>
            </SignUpButton>
            <SignInButton mode="modal">
              <Button variant="outline" size="lg">
                Sign in
              </Button>
            </SignInButton>
          </SignedOut>
          <SignedIn>
            <Link to="/app">
              <Button size="lg" className="gap-2">
                Go to App
                <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
          </SignedIn>
        </motion.div>

        {/* Animated pipeline */}
        <PipelineFlow />
      </div>
    </section>
  );
}

/* ──────────────────────── Process ──────────────────────── */

function Process() {
  return (
    <section id="process" className="py-20 sm:py-28">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <FadeIn className="text-center mb-14">
          <h2 className="font-display text-3xl sm:text-4xl font-bold tracking-tight">
            How it works
          </h2>
          <p className="mt-3 text-muted-foreground max-w-lg mx-auto">
            A sequential pipeline of specialized agents, each focused on one
            aspect of the research process.
          </p>
        </FadeIn>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {steps.map((step, i) => (
            <FadeIn key={step.title} delay={i * 0.05}>
              <div className="relative group rounded-xl border bg-card p-5 shadow-soft hover:shadow-card transition-all duration-300 h-full">
                {/* Step number */}
                <span className="absolute top-3 right-3.5 text-[11px] font-mono text-muted-foreground/30 select-none">
                  {String(i + 1).padStart(2, '0')}
                </span>
                {/* Icon */}
                <div className="w-9 h-9 rounded-lg bg-primary/[0.07] flex items-center justify-center mb-3.5 group-hover:bg-primary/[0.12] transition-colors duration-300">
                  <step.icon className="w-4 h-4 text-primary" />
                </div>
                <h3 className="font-display font-semibold text-sm">
                  {step.title}
                </h3>
                <p className="mt-1.5 text-xs text-muted-foreground leading-relaxed">
                  {step.desc}
                </p>
              </div>
            </FadeIn>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ──────────────────────── Live Demo ──────────────────────── */

function LiveDemo() {
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
    <section id="demo" className="py-20 sm:py-28 bg-muted/30">
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

/* ──────────────────────── Features ──────────────────────── */

function Features() {
  return (
    <section id="features" className="py-20 sm:py-28">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <FadeIn className="text-center mb-14">
          <h2 className="font-display text-3xl sm:text-4xl font-bold tracking-tight">
            Built different
          </h2>
          <p className="mt-3 text-muted-foreground max-w-lg mx-auto">
            Not just another chatbot. A research system with quality guarantees.
          </p>
        </FadeIn>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {features.map((feat, i) => (
            <FadeIn key={feat.title} delay={i * 0.07}>
              <div className="rounded-xl border bg-card p-6 shadow-soft hover:shadow-card transition-all duration-300 h-full group">
                <div className="w-10 h-10 rounded-lg bg-primary/[0.07] flex items-center justify-center mb-4 group-hover:bg-primary/[0.12] transition-colors duration-300">
                  <feat.icon className="w-5 h-5 text-primary" />
                </div>
                <h3 className="font-display font-semibold text-base">
                  {feat.title}
                </h3>
                <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
                  {feat.desc}
                </p>
              </div>
            </FadeIn>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ──────────────────────── CTA ──────────────────────── */

function CTA() {
  return (
    <section className="py-20 sm:py-28 relative overflow-hidden">
      {/* Background accent */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-primary/[0.04] rounded-full blur-3xl" />
      </div>

      <div className="mx-auto max-w-2xl px-4 sm:px-6 text-center">
        <FadeIn>
          <h2 className="font-display text-3xl sm:text-4xl font-bold tracking-tight">
            Ready to research smarter?
          </h2>
          <p className="mt-3 text-muted-foreground max-w-md mx-auto">
            Start with any topic. Watch the agents work. Get a scored report in
            minutes.
          </p>
          <div className="mt-8 flex items-center justify-center gap-3">
            <SignedOut>
              <SignUpButton mode="modal">
                <Button size="lg" className="gap-2">
                  Get started free
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </SignUpButton>
            </SignedOut>
            <SignedIn>
              <Link to="/app">
                <Button size="lg" className="gap-2">
                  Start researching
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </Link>
            </SignedIn>
          </div>
        </FadeIn>
      </div>
    </section>
  );
}

/* ──────────────────────── Footer ──────────────────────── */

function Footer() {
  return (
    <footer className="border-t py-8">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-muted-foreground">
        <span className="flex items-center gap-1.5">
          <div className="w-5 h-5 rounded bg-primary/10 flex items-center justify-center">
            <Brain className="w-3 h-3 text-primary" />
          </div>
          DeepResearch
        </span>
        <span>Built with LangChain · FastAPI · TanStack Start</span>
      </div>
    </footer>
  );
}

/* ──────────────────────── Page ──────────────────────── */

function LandingPage() {
  // Enable smooth scroll for anchor links
  useEffect(() => {
    document.documentElement.style.scrollBehavior = 'smooth';
    return () => {
      document.documentElement.style.scrollBehavior = '';
    };
  }, []);

  return (
    <div className="min-h-screen">
      <Nav />
      <Hero />
      <Process />
      <LiveDemo />
      <Features />
      <CTA />
      <Footer />
    </div>
  );
}