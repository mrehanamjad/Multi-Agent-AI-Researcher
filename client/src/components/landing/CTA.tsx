import {  Link } from '@tanstack/react-router';
import { SignedIn, SignedOut,  SignUpButton } from '@clerk/clerk-react';
import {

  ArrowRight,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import FadeIn from './FadeIn';


function CTA() {
  return (
    <section className="py-20 sm:py-28 relative overflow-hidden">
      {/* Background accent */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-150 h-75 bg-primary/4 rounded-full blur-3xl" />
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

export default CTA;
