import React from 'react';
import { MindTrailLogo } from './MindTrailLogo';
import { ShieldCheck, Github, Linkedin } from 'lucide-react';

interface GlobalFooterProps {
  onNavigate?: (view: string) => void;
  onNavigateHome?: () => void;
  onOpenPrivacy?: () => void;
  onOpenReportIssue?: () => void;
  onOpenFeedback?: () => void;
}

export const GlobalFooter: React.FC<GlobalFooterProps> = ({
  onNavigate,
  onNavigateHome,
  onOpenPrivacy,
  onOpenReportIssue,
  onOpenFeedback,
}) => {
  const handleBrandClick = () => {
    if (onNavigateHome) {
      onNavigateHome();
    } else if (onNavigate) {
      onNavigate('home');
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer
      id="global-footer"
      aria-label="MindTrail AI Global Footer"
      className="w-full border-t border-[#EAE5D9] dark:border-[#252320] bg-[#FAF8F2]/90 dark:bg-[#141312]/95 backdrop-blur-md pt-12 pb-10 px-6 sm:px-10 lg:px-12 mt-auto transition-colors"
    >
      <div className="max-w-7xl mx-auto">
        {/* Upper Brand & Navigation Area */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 lg:gap-10 mb-10 items-start">
          {/* Brand Area */}
          <div className="col-span-1 md:col-span-4 lg:col-span-4 space-y-3 pr-0 lg:pr-6">
            <button
              type="button"
              id="btn-global-footer-brand-home"
              onClick={handleBrandClick}
              className="inline-flex items-center text-left group cursor-pointer transition-transform duration-150 hover:opacity-90 active:scale-[0.99] focus:outline-hidden"
              aria-label="MindTrail AI Home"
            >
              <MindTrailLogo
                size="md"
                showWordmark={true}
                tagline="PRIVATE AI JOURNAL"
                className="group-hover:opacity-95 transition-opacity"
              />
            </button>

            <p className="text-sm text-[#5C5A54] dark:text-[#A4A29B] max-w-sm leading-relaxed font-normal">
              A private space to capture moments, explore memories, and discover meaningful patterns with AI.
            </p>

            <div className="pt-0.5 flex items-center gap-2 text-xs text-[#7C8B7A] dark:text-[#8FA08E] font-medium tracking-wide">
              <ShieldCheck className="w-3.5 h-3.5 text-[#7C8B7A] dark:text-[#8FA08E] shrink-0" />
              <span>Private by design • User-isolated data</span>
            </div>
          </div>

          {/* Product Navigation */}
          <div className="col-span-1 sm:col-span-4 md:col-span-3 lg:col-span-3 space-y-3">
            <h3 className="text-[11px] font-semibold uppercase tracking-widest text-[#171817] dark:text-[#F6F4EE]">
              Product
            </h3>
            <ul className="space-y-2 text-xs text-[#63615B] dark:text-[#9A9891]">
              <li>
                <button
                  type="button"
                  id="btn-global-footer-journal"
                  onClick={() => onNavigate?.('journal')}
                  className="hover:text-[#171817] dark:hover:text-[#F6F4EE] transition-colors duration-150 cursor-pointer text-left"
                >
                  Journal
                </button>
              </li>
              <li>
                <button
                  type="button"
                  id="btn-global-footer-memories"
                  onClick={() => onNavigate?.('memories')}
                  className="hover:text-[#171817] dark:hover:text-[#F6F4EE] transition-colors duration-150 cursor-pointer text-left"
                >
                  Ask My Memories
                </button>
              </li>
              <li>
                <button
                  type="button"
                  id="btn-global-footer-timeline"
                  onClick={() => onNavigate?.('timeline')}
                  className="hover:text-[#171817] dark:hover:text-[#F6F4EE] transition-colors duration-150 cursor-pointer text-left"
                >
                  Memory Timeline
                </button>
              </li>
              <li>
                <button
                  type="button"
                  id="btn-global-footer-reflections"
                  onClick={() => onNavigate?.('journal')}
                  className="hover:text-[#171817] dark:hover:text-[#F6F4EE] transition-colors duration-150 cursor-pointer text-left"
                >
                  AI Reflections
                </button>
              </li>
              <li>
                <button
                  type="button"
                  id="btn-global-footer-books"
                  onClick={() => onNavigate?.('books')}
                  className="hover:text-[#171817] dark:hover:text-[#F6F4EE] transition-colors duration-150 cursor-pointer text-left"
                >
                  Books
                </button>
              </li>
            </ul>
          </div>

          {/* Explore & Policies */}
          <div className="col-span-1 sm:col-span-4 md:col-span-3 lg:col-span-3 space-y-3">
            <h3 className="text-[11px] font-semibold uppercase tracking-widest text-[#171817] dark:text-[#F6F4EE]">
              Explore
            </h3>
            <ul className="space-y-2 text-xs text-[#63615B] dark:text-[#9A9891]">
              <li>
                <button
                  type="button"
                  id="btn-global-footer-about"
                  onClick={() => onNavigate?.('about')}
                  className="hover:text-[#171817] dark:hover:text-[#F6F4EE] transition-colors duration-150 cursor-pointer text-left"
                >
                  About MindTrail
                </button>
              </li>
              <li>
                <button
                  type="button"
                  id="btn-global-footer-how"
                  onClick={() => onNavigate?.('how-it-works')}
                  className="hover:text-[#171817] dark:hover:text-[#F6F4EE] transition-colors duration-150 cursor-pointer text-left"
                >
                  How It Works
                </button>
              </li>
              <li>
                <a
                  href="#faq"
                  id="btn-global-footer-faq"
                  onClick={(e) => {
                    e.preventDefault();
                    if (onNavigate) {
                      onNavigate('faq');
                    } else {
                      document.getElementById('faq')?.scrollIntoView({ behavior: 'smooth' });
                    }
                  }}
                  className="hover:text-[#171817] dark:hover:text-[#F6F4EE] transition-colors duration-150 cursor-pointer text-left block"
                >
                  FAQ
                </a>
              </li>
              <li>
                <button
                  type="button"
                  id="btn-global-footer-privacy"
                  onClick={() => {
                    if (onNavigate) {
                      onNavigate('privacy');
                    } else if (onOpenPrivacy) {
                      onOpenPrivacy();
                    }
                  }}
                  className="hover:text-[#171817] dark:hover:text-[#F6F4EE] transition-colors duration-150 cursor-pointer text-left"
                >
                  Privacy & Security
                </button>
              </li>
              <li>
                <button
                  type="button"
                  id="btn-global-footer-terms"
                  onClick={() => onNavigate?.('terms')}
                  className="hover:text-[#171817] dark:hover:text-[#F6F4EE] transition-colors duration-150 cursor-pointer text-left"
                >
                  Terms of Service
                </button>
              </li>
            </ul>
          </div>

          {/* Support */}
          <div className="col-span-1 sm:col-span-4 md:col-span-2 lg:col-span-2 space-y-3">
            <h3 className="text-[11px] font-semibold uppercase tracking-widest text-[#171817] dark:text-[#F6F4EE]">
              Support
            </h3>
            <ul className="space-y-2 text-xs text-[#63615B] dark:text-[#9A9891]">
              <li>
                <button
                  type="button"
                  id="btn-global-footer-report-issue"
                  onClick={() => (onOpenReportIssue ? onOpenReportIssue() : onNavigate?.('report-issue'))}
                  className="hover:text-[#171817] dark:hover:text-[#F6F4EE] transition-colors duration-150 cursor-pointer text-left block"
                >
                  Report Issue
                </button>
              </li>
              <li>
                <button
                  type="button"
                  id="btn-global-footer-feedback"
                  onClick={() => (onOpenFeedback ? onOpenFeedback() : onNavigate?.('feedback'))}
                  className="hover:text-[#171817] dark:hover:text-[#F6F4EE] transition-colors duration-150 cursor-pointer text-left block"
                >
                  Feedback
                </button>
              </li>
              <li>
                <a
                  href="mailto:contact.eshop.sahil@gmail.com?subject=MindTrail%20AI%20Inquiry"
                  id="btn-global-footer-contact"
                  className="hover:text-[#171817] dark:hover:text-[#F6F4EE] transition-colors duration-150 cursor-pointer text-left block"
                >
                  Contact
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Subtle Horizontal Divider */}
        <div className="w-full h-px bg-[#E8E4DA] dark:bg-[#252320] mb-6" />

        {/* Global Bottom Section: LEFT (Copyright), CENTER (Developer), RIGHT (Socials) */}
        <div
          id="global-footer-bottom-bar"
          className="flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-[#7A7872] dark:text-[#8E8D86]"
        >
          {/* LEFT: Copyright */}
          <div className="order-1 md:order-1 text-center md:text-left">
            <p className="font-normal">
              © 2026 MindTrail AI. All rights reserved.
            </p>
          </div>

          {/* CENTER: Developer Credit */}
          <div className="order-2 md:order-2 text-center">
            <p className="text-[11.5px] text-[#7A7872] dark:text-[#8E8D86] font-normal">
              Designed & Developed by{' '}
              <span className="text-[#3A3834] dark:text-[#C5C3BC] font-medium">
                Sahil Sharma
              </span>
            </p>
          </div>

          {/* RIGHT: LinkedIn & GitHub Buttons (NO external-link arrow) */}
          <div className="order-3 md:order-3 flex items-center gap-2">
            {/* LinkedIn */}
            <a
              href="https://www.linkedin.com/in/sahil-me/"
              target="_blank"
              rel="noopener noreferrer"
              id="global-footer-linkedin"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#FAF7F0] dark:bg-[#1B1917] border border-[#E6DEC9] dark:border-[#302D27] text-[#171817] dark:text-[#F6F4EE] hover:bg-[#F2ECE0] dark:hover:bg-[#23201C] hover:border-[#C5A45D]/50 dark:hover:border-[#D4B774]/40 hover:-translate-y-0.5 text-xs font-medium transition-all duration-150 shadow-2xs group cursor-pointer"
              aria-label="LinkedIn Profile"
            >
              <Linkedin className="w-3.5 h-3.5 text-[#7C8B7A] dark:text-[#8FA08E] group-hover:text-[#8C743D] dark:group-hover:text-[#D4B774] transition-colors duration-150 shrink-0" />
              <span>LinkedIn</span>
            </a>

            {/* GitHub */}
            <a
              href="https://github.com/sahil-me"
              target="_blank"
              rel="noopener noreferrer"
              id="global-footer-github"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#FAF7F0] dark:bg-[#1B1917] border border-[#E6DEC9] dark:border-[#302D27] text-[#171817] dark:text-[#F6F4EE] hover:bg-[#F2ECE0] dark:hover:bg-[#23201C] hover:border-[#C5A45D]/50 dark:hover:border-[#D4B774]/40 hover:-translate-y-0.5 text-xs font-medium transition-all duration-150 shadow-2xs group cursor-pointer"
              aria-label="GitHub Profile"
            >
              <Github className="w-3.5 h-3.5 text-[#7C8B7A] dark:text-[#8FA08E] group-hover:text-[#8C743D] dark:group-hover:text-[#D4B774] transition-colors duration-150 shrink-0" />
              <span>GitHub</span>
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};
