import { useEffect } from 'react';
import { createFileRoute } from '@tanstack/react-router';
import { Hero, Process, Liveworking, Features, CTA, Footer,Nav } from '@/components/landing';

export const Route = createFileRoute('/')({
  component: LandingPage,
});

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
      <Liveworking />
      <Features />
      <CTA />
      <Footer />
    </div>
  );
}