import {  useState, useEffect, Fragment } from 'react';
import { motion } from 'framer-motion';
import {
  Brain,
  ShieldCheck,
  MessageCircleQuestion,
  GitBranch,
  Search,
  Globe,
  FileText,
  ClipboardCheck,

} from 'lucide-react';



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

export default PipelineFlow;