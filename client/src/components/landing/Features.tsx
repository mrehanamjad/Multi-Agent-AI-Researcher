import {
  Zap,
  BarChart3,
  AlertTriangle,
  TrendingUp,
} from 'lucide-react';
import FadeIn from './FadeIn';

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
                <div className="w-10 h-10 rounded-lg bg-primary/[0.07] flex items-center justify-center mb-4 group-hover:bg-primary/12 transition-colors duration-300">
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

export default Features;