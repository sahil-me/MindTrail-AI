import React, { useEffect } from 'react';
import { ArrowLeft, ArrowRight, BookOpen, Feather, MessageSquareQuote, Clock, Sparkles } from 'lucide-react';

interface HowItWorksPageProps {
  onBack: () => void;
  onStartJournal: () => void;
}

export const HowItWorksPage: React.FC<HowItWorksPageProps> = ({
  onBack,
  onStartJournal,
}) => {
  // Ensure we are strictly at the top when this page mounts
  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;
  }, []);

  return (
    <div
      id="how-it-works-page"
      className="w-full max-w-4xl mx-auto py-6 sm:py-10 space-y-12 sm:space-y-14 animate-in fade-in duration-200"
    >
      {/* Back button */}
      <div>
        <button
          type="button"
          onClick={onBack}
          id="btn-how-it-works-back"
          className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl border border-[#E8DFC9] dark:border-[#383222] bg-[#FAF6ED] dark:bg-[#1E1C18] text-[#171817] dark:text-[#F6F4EE] hover:bg-[#F2ECE0] dark:hover:bg-[#25221D] text-xs font-medium transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-3.5 h-3.5 text-[#7C8B7A] dark:text-[#8FA08E]" />
          <span>Back to Home</span>
        </button>
      </div>

      {/* Main Header / Practice Intro */}
      <div className="max-w-3xl text-left space-y-3.5 border-b border-[#ECE7DC] dark:border-[#282622] pb-8 sm:pb-10">
        <p className="text-xs uppercase font-semibold tracking-widest text-[#7C8B7A] dark:text-[#8FA08E]">
          THE PRACTICE
        </p>
        <h1 className="font-serif-title text-3xl sm:text-4xl lg:text-5xl font-normal text-[#171817] dark:text-[#F6F4EE] tracking-tight leading-tight">
          How MindTrail Works
        </h1>
        <p className="text-base sm:text-lg text-[#52504B] dark:text-[#A8A59C] leading-relaxed max-w-2xl font-normal">
          Three simple steps to build a reflective habit that compounds with time.
        </p>
      </div>

      {/* Clean Process Sequence with Dividers */}
      <div className="w-full divide-y divide-[#EAE4D6] dark:divide-[#282622] border-y border-[#EAE4D6] dark:border-[#282622] text-left">
        {/* Step 01: Capture */}
        <div className="py-8 sm:py-10 grid grid-cols-1 md:grid-cols-12 gap-4 md:gap-8 items-baseline">
          <div className="md:col-span-4 flex items-center gap-3">
            <span className="font-mono text-sm sm:text-base font-semibold text-[#8C743D] dark:text-[#D4B774]">
              01
            </span>
            <span className="h-px w-4 bg-[#D8CEBA] dark:bg-[#3D382E]" />
            <h2 className="font-serif-title text-2xl sm:text-3xl font-medium text-[#171817] dark:text-[#F6F4EE]">
              Capture
            </h2>
          </div>
          <div className="md:col-span-8">
            <p className="text-base sm:text-lg text-[#52504B] dark:text-[#A8A59C] leading-relaxed max-w-2xl font-normal">
              Write a moment, thought, experience, or reflection.
            </p>
          </div>
        </div>

        {/* Step 02: Reflect */}
        <div className="py-8 sm:py-10 grid grid-cols-1 md:grid-cols-12 gap-4 md:gap-8 items-baseline">
          <div className="md:col-span-4 flex items-center gap-3">
            <span className="font-mono text-sm sm:text-base font-semibold text-[#8C743D] dark:text-[#D4B774]">
              02
            </span>
            <span className="h-px w-4 bg-[#D8CEBA] dark:bg-[#3D382E]" />
            <h2 className="font-serif-title text-2xl sm:text-3xl font-medium text-[#171817] dark:text-[#F6F4EE]">
              Reflect
            </h2>
          </div>
          <div className="md:col-span-8">
            <p className="text-base sm:text-lg text-[#52504B] dark:text-[#A8A59C] leading-relaxed max-w-2xl font-normal">
              Explore your thoughts through AI-powered conversations.
            </p>
          </div>
        </div>

        {/* Step 03: Remember */}
        <div className="py-8 sm:py-10 grid grid-cols-1 md:grid-cols-12 gap-4 md:gap-8 items-baseline">
          <div className="md:col-span-4 flex items-center gap-3">
            <span className="font-mono text-sm sm:text-base font-semibold text-[#8C743D] dark:text-[#D4B774]">
              03
            </span>
            <span className="h-px w-4 bg-[#D8CEBA] dark:bg-[#3D382E]" />
            <h2 className="font-serif-title text-2xl sm:text-3xl font-medium text-[#171817] dark:text-[#F6F4EE]">
              Remember
            </h2>
          </div>
          <div className="md:col-span-8">
            <p className="text-base sm:text-lg text-[#52504B] dark:text-[#A8A59C] leading-relaxed max-w-2xl font-normal">
              Rediscover patterns and meaningful connections across your personal journey.
            </p>
          </div>
        </div>
      </div>

      {/* Gentle Editorial Call to Action */}
      <div className="pt-4 sm:pt-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 border-t border-[#ECE7DC] dark:border-[#282622]">
        <div className="text-left space-y-1">
          <h3 className="font-serif-title text-lg sm:text-xl font-medium text-[#171817] dark:text-[#F6F4EE]">
            Ready to begin your practice?
          </h3>
          <p className="text-xs sm:text-sm text-[#6B6963] dark:text-[#9A9891]">
            Start with a single sentence today. Your future self will thank you.
          </p>
        </div>

        <button
          type="button"
          id="btn-how-it-works-start"
          onClick={onStartJournal}
          className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-[#171817] dark:bg-[#F6F4EE] text-white dark:text-[#171817] text-xs font-semibold hover:opacity-90 transition-opacity cursor-pointer shadow-xs shrink-0"
        >
          <span>Start Journaling</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};
