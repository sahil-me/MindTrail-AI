import React from 'react';
import { ArrowLeft, BookOpen, ShieldCheck, Sparkles, Feather, Clock, Compass } from 'lucide-react';
import { MindTrailLogo } from './MindTrailLogo';

interface AboutPageProps {
  onBack: () => void;
  onStartJournal: () => void;
}

export const AboutPage: React.FC<AboutPageProps> = ({ onBack, onStartJournal }) => {
  return (
    <div id="about-page" className="w-full max-w-4xl mx-auto py-6 sm:py-10 space-y-12 animate-in fade-in duration-200">
      {/* Back button */}
      <div>
        <button
          type="button"
          onClick={onBack}
          id="btn-about-back"
          className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl border border-[#E8DFC9] dark:border-[#383222] bg-[#FAF6ED] dark:bg-[#1E1C18] text-[#171817] dark:text-[#F6F4EE] hover:bg-[#F2ECE0] dark:hover:bg-[#25221D] text-xs font-medium transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-3.5 h-3.5 text-[#7C8B7A] dark:text-[#8FA08E]" />
          <span>Back to Home</span>
        </button>
      </div>

      {/* Hero / Title */}
      <div className="space-y-4 text-left border-b border-[#ECE7DC] dark:border-[#282622] pb-8">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#FAF6ED] dark:bg-[#201D17] border border-[#E8DFC9] dark:border-[#383222] text-[#8C743D] dark:text-[#D4B774] text-xs font-semibold tracking-wider uppercase">
          <BookOpen className="w-3.5 h-3.5 text-[#8C743D] dark:text-[#D4B774]" />
          <span>OUR ESSENCE</span>
        </div>

        <h1 className="font-serif-title text-3xl sm:text-4xl lg:text-5xl font-normal text-[#171817] dark:text-[#F6F4EE] tracking-tight leading-tight">
          A thoughtful sanctuary for your memories and reflections.
        </h1>

        <p className="text-base sm:text-lg text-[#52504B] dark:text-[#A8A59C] leading-relaxed max-w-2xl font-normal">
          MindTrail gives your thoughts a place to live — preserving the moments, questions, and experiences that shape your journey.
        </p>
      </div>

      {/* Main Narrative Articles */}
      <div className="space-y-10 text-left">
        {/* Section 1: The Vision */}
        <div className="space-y-3">
          <h2 className="font-serif-title text-2xl sm:text-3xl font-normal text-[#171817] dark:text-[#F6F4EE]">
            Why MindTrail Was Created
          </h2>
          <div className="space-y-3 text-sm sm:text-base text-[#52504B] dark:text-[#A8A59C] leading-relaxed">
            <p>
              In a digital landscape crowded with rapid feeds, temporary stories, and superficial notifications, our most important personal experiences often slip through the cracks. Traditional notes apps become chaotic junk drawers, while blank journal pages can feel intimidating.
            </p>
            <p>
              MindTrail AI was designed as an intentional, calm space to cultivate a meaningful reflective habit. It pairs the timeless tactile calm of personal journaling with gentle, respectful intelligence that helps you revisit thoughts, recognize patterns, and rediscover how you have grown over time.
            </p>
          </div>
        </div>

        {/* Section 2: Core Pillars */}
        <div className="space-y-4 pt-2">
          <h2 className="font-serif-title text-2xl sm:text-3xl font-normal text-[#171817] dark:text-[#F6F4EE]">
            The Three Principles
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-2">
            <div className="p-6 rounded-2xl bg-[#FFFDF8] dark:bg-[#1B1A18] border border-[#ECE7DC] dark:border-[#282622] space-y-2.5">
              <div className="w-8 h-8 rounded-xl bg-[#FAF6ED] dark:bg-[#24211A] flex items-center justify-center text-[#8C743D] dark:text-[#D4B774]">
                <Feather className="w-4 h-4" />
              </div>
              <h3 className="font-serif-title text-lg font-medium text-[#171817] dark:text-[#F6F4EE]">
                1. Private Capture
              </h3>
              <p className="text-xs sm:text-sm text-[#52504B] dark:text-[#A8A59C] leading-relaxed">
                Write freely with zero social pressure or public vanity metrics. Your reflections are strictly isolated to your authenticated account.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-[#FFFDF8] dark:bg-[#1B1A18] border border-[#ECE7DC] dark:border-[#282622] space-y-2.5">
              <div className="w-8 h-8 rounded-xl bg-[#FAF6ED] dark:bg-[#24211A] flex items-center justify-center text-[#8C743D] dark:text-[#D4B774]">
                <Sparkles className="w-4 h-4" />
              </div>
              <h3 className="font-serif-title text-lg font-medium text-[#171817] dark:text-[#F6F4EE]">
                2. Thoughtful Reflection
              </h3>
              <p className="text-xs sm:text-sm text-[#52504B] dark:text-[#A8A59C] leading-relaxed">
                Gemini assists as a reflective sounding board, helping you unpack emotions, generate weekly digests, and query your memory archives.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-[#FFFDF8] dark:bg-[#1B1A18] border border-[#ECE7DC] dark:border-[#282622] space-y-2.5">
              <div className="w-8 h-8 rounded-xl bg-[#FAF6ED] dark:bg-[#24211A] flex items-center justify-center text-[#8C743D] dark:text-[#D4B774]">
                <Compass className="w-4 h-4" />
              </div>
              <h3 className="font-serif-title text-lg font-medium text-[#171817] dark:text-[#F6F4EE]">
                3. Living Memory Trail
              </h3>
              <p className="text-xs sm:text-sm text-[#52504B] dark:text-[#A8A59C] leading-relaxed">
                A visual timeline organizes your thoughts chronologically, transforming disparate moments into a coherent narrative of personal growth.
              </p>
            </div>
          </div>
        </div>

        {/* Section 3: Privacy Commitment */}
        <div className="p-6 sm:p-8 rounded-2xl bg-[#FAF8F3] dark:bg-[#191816] border border-[#E8DFC9] dark:border-[#332F26] space-y-3">
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-[#7C8B7A] dark:text-[#8FA08E]">
            <ShieldCheck className="w-4 h-4" />
            <span>Our Uncompromising Commitment</span>
          </div>
          <h3 className="font-serif-title text-xl font-medium text-[#171817] dark:text-[#F6F4EE]">
            Your reflections belong to you alone.
          </h3>
          <p className="text-sm text-[#52504B] dark:text-[#A8A59C] leading-relaxed">
            MindTrail does not sell your personal data or use your private journal entries to train public artificial intelligence models. Every reflection you save is protected by owner-bound Firestore security rules, accessible solely through your authenticated credentials.
          </p>
        </div>

        {/* CTA */}
        <div className="pt-4 text-center">
          <button
            type="button"
            onClick={onStartJournal}
            id="btn-about-start"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-[#171817] dark:bg-[#F6F4EE] hover:bg-[#2B2A27] dark:hover:bg-white text-[#FFFDF8] dark:text-[#171817] text-sm font-medium transition-all shadow-sm active:scale-98 cursor-pointer"
          >
            <span>Begin Your Journal</span>
          </button>
        </div>
      </div>
    </div>
  );
};
