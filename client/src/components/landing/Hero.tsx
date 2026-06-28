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
import Logo from '@/components/layout/Logo';
import PipelineFlow from './PipelineFlow';

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

export default Hero;