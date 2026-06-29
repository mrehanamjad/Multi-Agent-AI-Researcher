import { motion } from 'framer-motion';
import { Link } from '@tanstack/react-router';
import { SignedIn, SignedOut, SignInButton, SignUpButton } from '@clerk/clerk-react';
import { Button } from '@/components/ui/button';
import Logo from '@/components/layout/Logo';

// Extract links to an array for easier maintenance and cleaner JSX
const NAV_LINKS = [
  { href: '#process', label: 'Process' },
  { href: '#working', label: 'Working' },
  { href: '#features', label: 'Features' },
];

function Nav() {
  return (
    <motion.nav
      aria-label="Main Navigation"
      initial={{ y: -16, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5, ease: [0.21, 0.47, 0.32, 0.98] }}
      className="fixed inset-x-0 top-0 z-50 border-b glass"
    >
      <div className="flex items-center justify-between h-14 max-w-6xl px-4 mx-auto sm:px-6">
        {/* Logo Section */}
        <Link
          to="/"
          aria-label="Home"
          className="flex items-center gap-2 font-semibold font-display text-foreground"
        >
          <Logo />
        </Link>

        {/* Center Links (Hidden on Mobile) */}
        <div className="hidden items-center gap-6 text-sm sm:flex text-muted-foreground">
          {NAV_LINKS.map(({ href, label }) => (
            <a
              key={href}
              href={href}
              className="transition-colors hover:text-foreground"
            >
              {label}
            </a>
          ))}
        </div>

        {/* Authentication Section */}
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
              <Button size="sm">Dashboard</Button>
            </Link>
          </SignedIn>
        </div>
      </div>
    </motion.nav>
  );
}

export default Nav;