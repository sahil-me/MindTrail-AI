import React from 'react';
import { JournalHeroVisual } from './JournalHeroVisual';
import { FAQSection } from './FAQSection';
import {
  BookOpen,
  MessageSquareQuote,
  Clock,
  Sparkles,
  ShieldCheck,
  Lock,
  ArrowRight,
  CheckCircle2,
  Compass,
  Feather,
  Library,
} from 'lucide-react';

interface LandingPageProps {
  onStartJournal: () => void;
  onExplorePrivacy?: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({
  onStartJournal,
  onExplorePrivacy: _onExplorePrivacy,
}) => {
  React.useEffect(() => {
    if (!window.location.hash) {
      window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
      document.documentElement.scrollTop = 0;
      document.body.scrollTop = 0;
    }
  }, []);

  const scrollToHowItWorks = () => {
    const el = document.getElementById('how-it-works');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <div id="mindtrail-landing-page" className="w-full flex flex-col space-y-16 sm:space-y-20 lg:space-y-24 py-2 sm:py-6">
      {/* 1. HERO SECTION */}
      <section
        id="landing-hero"
        aria-label="MindTrail AI Hero"
        className="w-full pt-2 sm:pt-6 md:pt-8"
      >
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-center">
          {/* Left Column: Editorial Headline & Actions */}
          <div className="lg:col-span-6 space-y-6 sm:space-y-7 text-left">
            {/* Subtle Brand Tagline Badge */}
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#FAF6ED] dark:bg-[#201D17] border border-[#E8DFC9] dark:border-[#383222] text-[#8C743D] dark:text-[#D4B774] text-xs font-medium tracking-wide">
              <span className="w-1.5 h-1.5 rounded-full bg-[#C5A45D] dark:bg-[#D4B774]" />
              <span>PRIVATE AI JOURNAL</span>
            </div>

            {/* Headline */}
            <h1
              id="hero-headline"
              className="font-serif-title text-4xl sm:text-5xl lg:text-[54px] font-normal tracking-tight text-[#171817] dark:text-[#F6F4EE] leading-[1.15]"
            >
              Your memories deserve more than a blank page.
            </h1>

            {/* Supporting Text */}
            <p
              id="hero-supporting-text"
              className="text-base sm:text-lg text-[#52504B] dark:text-[#A8A59C] leading-relaxed max-w-xl font-normal"
            >
              Capture moments, reflect on your thoughts, and rediscover meaningful patterns with your private AI journal.
            </p>

            {/* CTAs */}
            <div className="pt-1 flex flex-col sm:flex-row items-stretch sm:items-center gap-3.5 sm:gap-4">
              <button
                type="button"
                id="btn-hero-start-journal"
                onClick={onStartJournal}
                className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-[#171817] dark:bg-[#F6F4EE] hover:bg-[#2B2A27] dark:hover:bg-white text-[#FFFDF8] dark:text-[#171817] text-sm font-medium tracking-wide transition-all duration-150 cursor-pointer shadow-md hover:shadow-lg active:scale-98"
              >
                <span>Start Your Journal</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <button
                type="button"
                id="btn-hero-explore-how"
                onClick={scrollToHowItWorks}
                className="inline-flex items-center justify-center px-5 py-3.5 rounded-xl bg-[#FAF8F3] dark:bg-[#1E1C1A] hover:bg-[#F4EFE6] dark:hover:bg-[#262421] border border-[#E6DEC9] dark:border-[#333029] text-[#171817] dark:text-[#F6F4EE] text-sm font-medium transition-colors cursor-pointer"
              >
                Explore How It Works
              </button>
            </div>

            {/* Trust & Privacy Micro-Proof */}
            <div className="pt-1 flex items-center gap-6 text-xs text-[#7C8B7A] dark:text-[#8FA08E]">
              <div className="flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-[#7C8B7A] dark:text-[#8FA08E]" />
                <span>Zero model training on your entries</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Lock className="w-3.5 h-3.5 text-[#7C8B7A] dark:text-[#8FA08E]" />
                <span>User-isolated Firestore</span>
              </div>
            </div>
          </div>

          {/* Right Column: Sophisticated Journal Visual */}
          <div className="lg:col-span-6 w-full">
            <JournalHeroVisual onExplore={onStartJournal} />
          </div>
        </div>
      </section>

      {/* 2. BRAND STATEMENT (Editorial Typography with Thin Dividers) */}
      <section
        id="brand-statement-section"
        aria-label="MindTrail Core Statement"
        className="w-full py-10 sm:py-14 border-y border-[#ECE7DC] dark:border-[#282622]"
      >
        <div className="max-w-3xl mx-auto text-center space-y-4 px-4">
          <p className="text-xs uppercase font-semibold tracking-[0.25em] text-[#8C743D] dark:text-[#D4B774]">
            MINDTRAIL AI
          </p>
          <h2 className="font-serif-title text-3xl sm:text-4xl text-[#171817] dark:text-[#F6F4EE] font-normal tracking-tight">
            Capture. Reflect. Remember.
          </h2>
          <p className="font-serif-title text-xl sm:text-2xl text-[#3A3834] dark:text-[#DCD9D0] italic font-normal">
            “A journal that grows with you.”
          </p>
          <p className="text-base sm:text-lg text-[#52504B] dark:text-[#A8A59C] leading-relaxed font-normal pt-1 max-w-2xl mx-auto">
            MindTrail gives your thoughts a place to live — preserving the moments, questions, and experiences that shape your journey.
          </p>

          {/* Subtle Editorial Labels */}
          <div className="pt-5 flex items-center justify-center gap-6 sm:gap-10 text-xs font-semibold tracking-widest text-[#7C8B7A] dark:text-[#8FA08E]">
            <span>CAPTURE</span>
            <span className="w-1 h-1 rounded-full bg-[#C5A45D] dark:bg-[#D4B774] opacity-60" />
            <span>UNDERSTAND</span>
            <span className="w-1 h-1 rounded-full bg-[#C5A45D] dark:bg-[#D4B774] opacity-60" />
            <span>REDISCOVER</span>
          </div>
        </div>
      </section>

      {/* 3. CAPABILITIES SECTION (Editorial Product Feature Layout) */}
      <section
        id="features-section"
        aria-label="MindTrail Capabilities"
        className="w-full space-y-10"
      >
        <div className="max-w-2xl text-left space-y-2.5">
          <p className="text-xs uppercase font-semibold tracking-widest text-[#7C8B7A] dark:text-[#8FA08E]">
            Capabilities
          </p>
          <h2 className="font-serif-title text-3xl sm:text-4xl font-normal text-[#171817] dark:text-[#F6F4EE] tracking-tight">
            More than a journal.
          </h2>
          <p className="text-base text-[#52504B] dark:text-[#A8A59C] leading-relaxed">
            MindTrail helps you turn everyday reflections into a living memory of your journey.
          </p>
        </div>

        {/* Editorial Feature Layout: Subtle Borders & Controlled Whitespace */}
        <div className="border-y border-[#EAE4D6] dark:border-[#282622]">
          <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-[#EAE4D6] dark:divide-[#282622]">
            {/* Left Column: 01 & 03 */}
            <div className="divide-y divide-[#EAE4D6] dark:divide-[#282622]">
              {/* 01 — PRIVATE REFLECTIONS */}
              <div className="py-7 sm:py-8 pr-0 md:pr-8 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="font-mono text-xs font-semibold tracking-wider text-[#8C743D] dark:text-[#D4B774]">
                      01
                    </span>
                    <span className="h-px w-4 bg-[#D8CEBA] dark:bg-[#3D382E]" />
                    <h3 className="font-serif-title text-lg sm:text-xl font-medium text-[#171817] dark:text-[#F6F4EE]">
                      PRIVATE REFLECTIONS
                    </h3>
                  </div>
                  <Feather className="w-4 h-4 text-[#8C743D] dark:text-[#D4B774] opacity-80" />
                </div>
                <p className="text-sm sm:text-base text-[#52504B] dark:text-[#A8A59C] leading-relaxed pl-7">
                  Write freely in a personal space designed around your thoughts and experiences.
                </p>
              </div>

              {/* 03 — MEMORY TIMELINE */}
              <div className="py-7 sm:py-8 pr-0 md:pr-8 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="font-mono text-xs font-semibold tracking-wider text-[#8C743D] dark:text-[#D4B774]">
                      03
                    </span>
                    <span className="h-px w-4 bg-[#D8CEBA] dark:bg-[#3D382E]" />
                    <h3 className="font-serif-title text-lg sm:text-xl font-medium text-[#171817] dark:text-[#F6F4EE]">
                      MEMORY TIMELINE
                    </h3>
                  </div>
                  <Clock className="w-4 h-4 text-[#8C743D] dark:text-[#D4B774] opacity-80" />
                </div>
                <p className="text-sm sm:text-base text-[#52504B] dark:text-[#A8A59C] leading-relaxed pl-7">
                  See your thoughts and meaningful moments organized across your personal journey.
                </p>
              </div>
            </div>

            {/* Right Column: 02 & 04 */}
            <div className="divide-y divide-[#EAE4D6] dark:divide-[#282622]">
              {/* 02 — ASK YOUR MEMORIES */}
              <div className="py-7 sm:py-8 pl-0 md:pl-8 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="font-mono text-xs font-semibold tracking-wider text-[#8C743D] dark:text-[#D4B774]">
                      02
                    </span>
                    <span className="h-px w-4 bg-[#D8CEBA] dark:bg-[#3D382E]" />
                    <h3 className="font-serif-title text-lg sm:text-xl font-medium text-[#171817] dark:text-[#F6F4EE]">
                      ASK YOUR MEMORIES
                    </h3>
                  </div>
                  <MessageSquareQuote className="w-4 h-4 text-[#8C743D] dark:text-[#D4B774] opacity-80" />
                </div>
                <p className="text-sm sm:text-base text-[#52504B] dark:text-[#A8A59C] leading-relaxed pl-7">
                  Ask questions about your own journal history and rediscover connections across your reflections.
                </p>
              </div>

              {/* 04 — AI WEEKLY REFLECTION */}
              <div className="py-7 sm:py-8 pl-0 md:pl-8 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="font-mono text-xs font-semibold tracking-wider text-[#8C743D] dark:text-[#D4B774]">
                      04
                    </span>
                    <span className="h-px w-4 bg-[#D8CEBA] dark:bg-[#3D382E]" />
                    <h3 className="font-serif-title text-lg sm:text-xl font-medium text-[#171817] dark:text-[#F6F4EE]">
                      AI WEEKLY REFLECTION
                    </h3>
                  </div>
                  <Sparkles className="w-4 h-4 text-[#8C743D] dark:text-[#D4B774] opacity-80" />
                </div>
                <p className="text-sm sm:text-base text-[#52504B] dark:text-[#A8A59C] leading-relaxed pl-7">
                  Step back and discover recurring themes, patterns, and insights from your recent reflections.
                </p>
              </div>
            </div>
          </div>

          {/* 05 — REFLECTIVE READING */}
          <div className="border-t border-[#EAE4D6] dark:border-[#282622] py-7 sm:py-8 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="font-mono text-xs font-semibold tracking-wider text-[#8C743D] dark:text-[#D4B774]">
                  05
                </span>
                <span className="h-px w-4 bg-[#D8CEBA] dark:bg-[#3D382E]" />
                <h3 className="font-serif-title text-lg sm:text-xl font-medium text-[#171817] dark:text-[#F6F4EE]">
                  REFLECTIVE READING
                </h3>
              </div>
              <Library className="w-4 h-4 text-[#8C743D] dark:text-[#D4B774] opacity-80" />
            </div>
            <p className="text-sm sm:text-base text-[#52504B] dark:text-[#A8A59C] leading-relaxed pl-7 max-w-3xl">
              Discover books that complement your reflections, inner journey, and personal growth.
            </p>
          </div>
        </div>
      </section>

      {/* 4. HOW MINDTRAIL WORKS (Editorial Guided Process Layout) */}
      <section
        id="how-it-works"
        aria-label="How MindTrail Works"
        className="w-full space-y-10 scroll-mt-28"
      >
        <div className="max-w-2xl text-left space-y-2.5">
          <p className="text-xs uppercase font-semibold tracking-widest text-[#7C8B7A] dark:text-[#8FA08E]">
            THE PRACTICE
          </p>
          <h2 className="font-serif-title text-3xl sm:text-4xl font-normal text-[#171817] dark:text-[#F6F4EE] tracking-tight">
            How MindTrail Works
          </h2>
          <p className="text-base text-[#52504B] dark:text-[#A8A59C] leading-relaxed">
            Three simple steps to build a reflective habit that compounds with time.
          </p>
        </div>

        {/* Clean Process Sequence with Dividers */}
        <div className="w-full divide-y divide-[#EAE4D6] dark:divide-[#282622] border-y border-[#EAE4D6] dark:border-[#282622]">
          {/* Step 01 */}
          <div className="py-6 sm:py-8 grid grid-cols-1 md:grid-cols-12 gap-4 md:gap-8 items-baseline">
            <div className="md:col-span-3 flex items-center gap-3">
              <span className="font-mono text-sm font-semibold text-[#8C743D] dark:text-[#D4B774]">
                01
              </span>
              <h3 className="font-serif-title text-xl sm:text-2xl font-medium text-[#171817] dark:text-[#F6F4EE]">
                Capture
              </h3>
            </div>
            <div className="md:col-span-9">
              <p className="text-base text-[#52504B] dark:text-[#A8A59C] leading-relaxed max-w-2xl">
                Write a moment, thought, experience, or reflection.
              </p>
            </div>
          </div>

          {/* Step 02 */}
          <div className="py-6 sm:py-8 grid grid-cols-1 md:grid-cols-12 gap-4 md:gap-8 items-baseline">
            <div className="md:col-span-3 flex items-center gap-3">
              <span className="font-mono text-sm font-semibold text-[#8C743D] dark:text-[#D4B774]">
                02
              </span>
              <h3 className="font-serif-title text-xl sm:text-2xl font-medium text-[#171817] dark:text-[#F6F4EE]">
                Reflect
              </h3>
            </div>
            <div className="md:col-span-9">
              <p className="text-base text-[#52504B] dark:text-[#A8A59C] leading-relaxed max-w-2xl">
                Explore your thoughts through AI-powered conversations.
              </p>
            </div>
          </div>

          {/* Step 03 */}
          <div className="py-6 sm:py-8 grid grid-cols-1 md:grid-cols-12 gap-4 md:gap-8 items-baseline">
            <div className="md:col-span-3 flex items-center gap-3">
              <span className="font-mono text-sm font-semibold text-[#8C743D] dark:text-[#D4B774]">
                03
              </span>
              <h3 className="font-serif-title text-xl sm:text-2xl font-medium text-[#171817] dark:text-[#F6F4EE]">
                Remember
              </h3>
            </div>
            <div className="md:col-span-9">
              <p className="text-base text-[#52504B] dark:text-[#A8A59C] leading-relaxed max-w-2xl">
                Rediscover patterns and meaningful connections across your personal journey.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 5. GEMINI SECTION (Refined Editorial Technology Presentation) */}
      <section
        id="gemini-section"
        aria-label="Intelligent Technology"
        className="w-full rounded-2xl bg-gradient-to-b from-[#FAF7F0] to-[#F4EFE3] dark:from-[#1C1A17] dark:to-[#171614] border border-[#E8E0CE] dark:border-[#2C2924] p-8 sm:p-10 md:p-12 text-center space-y-4 relative overflow-hidden"
      >
        <div className="relative max-w-2xl mx-auto space-y-3">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#FFFDF8] dark:bg-[#25221B] border border-[#E5DBBF] dark:border-[#38311F] text-[11px] font-semibold tracking-wider text-[#8C743D] dark:text-[#D4B774]">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Powered by Gemini</span>
          </div>

          <h2 className="font-serif-title text-2xl sm:text-3xl lg:text-4xl font-normal text-[#171817] dark:text-[#F6F4EE] tracking-tight">
            Thoughtful AI, grounded in your memories.
          </h2>

          <p className="text-base sm:text-lg text-[#52504B] dark:text-[#A8A59C] leading-relaxed">
            MindTrail uses Gemini to help you explore your reflections through thoughtful conversations, summaries, questions, and personal insights.
          </p>

          <p className="text-xs text-[#7C8B7A] dark:text-[#8FA08E] font-medium pt-1">
            Private context assembly • Thoughtful reflection assistance
          </p>
        </div>
      </section>

      {/* 6. CALM EDITORIAL FINAL CTA */}
      <section
        id="final-cta-section"
        aria-label="Start Your Journey"
        className="w-full text-center py-8 sm:py-12 space-y-5 border-t border-[#ECE7DC] dark:border-[#282622]"
      >
        <div className="max-w-2xl mx-auto space-y-3 px-4">
          <p className="text-xs uppercase font-semibold tracking-[0.2em] text-[#8C743D] dark:text-[#D4B774]">
            BEGIN YOUR REFLECTION
          </p>

          <h2 className="font-serif-title text-3xl sm:text-4xl md:text-[42px] font-normal text-[#171817] dark:text-[#F6F4EE] tracking-tight leading-snug">
            Start building your personal memory trail.
          </h2>

          <p className="text-base sm:text-lg text-[#52504B] dark:text-[#A8A59C] leading-relaxed max-w-lg mx-auto">
            Give your thoughts a place to live, and let MindTrail help you understand the journey.
          </p>

          <div className="pt-2">
            <button
              type="button"
              id="btn-final-create-journal"
              onClick={onStartJournal}
              className="inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-xl bg-[#171817] dark:bg-[#F6F4EE] hover:bg-[#2B2A27] dark:hover:bg-white text-[#FFFDF8] dark:text-[#171817] text-sm sm:text-base font-medium tracking-wide transition-all duration-150 cursor-pointer shadow-md hover:shadow-lg active:scale-98"
            >
              <span>Create Your Journal</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </section>

      {/* Horizontal Section Divider between Begin Your Reflection and FAQ & Guide */}
      <div
        id="reflection-faq-divider"
        role="separator"
        aria-orientation="horizontal"
        className="w-full border-t border-[#ECE7DC] dark:border-[#282622]"
      />

      {/* 7. FAQ SECTION with anchor support */}
      <div id="faq" className="scroll-mt-24 w-full">
        <FAQSection id="faq-section" />
      </div>
    </div>
  );
};
