import { motion,  } from 'framer-motion';
import {  Link } from '@tanstack/react-router';
import { SignedIn, SignedOut, SignInButton, SignUpButton } from '@clerk/clerk-react';
import { Button } from '@/components/ui/button';
import Logo from '@/components/layout/Logo';

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
          <Logo />
        </Link>

        <div className="hidden sm:flex items-center gap-6 text-sm text-muted-foreground">
          <a href="#process" className="hover:text-foreground transition-colors">
            Process
          </a>
          <a href="#working" className="hover:text-foreground transition-colors">
            working
          </a>
          <a href="#features" className="hover:text-foreground transition-colors">
            Features
          </a>
        </div>

        <div className="flex items-center gap-2">
          <SignedOut>
            <SignInButton mode="modal" fallbackRedirectUrl="/app">
              <Button variant="ghost" size="sm">
                Sign in
              </Button>
            </SignInButton>
            <SignUpButton mode="modal" fallbackRedirectUrl="/app">
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

export default Nav;