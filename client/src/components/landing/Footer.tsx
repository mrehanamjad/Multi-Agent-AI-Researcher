import { Github, Linkedin, Mail } from 'lucide-react';
import Logo from '@/components/layout/Logo';
import { motion } from 'framer-motion';

function Footer() {
  return (
    <footer className="relative border-t bg-background pt-16 pb-8 overflow-hidden">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        
        {/* Top Section: Logo & Socials */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-6 pb-12 border-b border-muted/40">
          <div className="flex items-center gap-2">
            <Logo />
          </div>
          
          {/* Social Links */}
          <div className="flex items-center gap-4">
            <a 
              href="https://github.com/mrehanamjad" 
              target="_blank" 
              rel="noopener noreferrer"
              className="p-2 rounded-full border bg-muted/30 text-muted-foreground hover:text-foreground hover:bg-muted/80 transition-all"
              aria-label="GitHub"
            >
              <Github className="w-4 h-4" />
            </a>
            <a 
              href="https://linkedin.com/in/mrehanamjad" 
              target="_blank" 
              rel="noopener noreferrer"
              className="p-2 rounded-full border bg-muted/30 text-muted-foreground hover:text-foreground hover:bg-muted/80 transition-all"
              aria-label="LinkedIn"
            >
              <Linkedin className="w-4 h-4" />
            </a>
            <a 
              href="mailto:rehanamjad520@gmail.com" 
              className="p-2 rounded-full border bg-muted/30 text-muted-foreground hover:text-foreground hover:bg-muted/80 transition-all"
              aria-label="Email"
            >
              <Mail className="w-4 h-4" />
            </a>
          </div>
        </div>

        {/* Bottom Section: Copyright */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3  text-xs text-muted-foreground">
          <span>&copy; {new Date().getFullYear()} All rights reserved.</span>
          <span>Built by M.Rehan Amjad</span>
        </div>

      </div>
    </footer>
  );
}

export default Footer;