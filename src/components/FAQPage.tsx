import React from 'react';
import { ArrowLeft, HelpCircle } from 'lucide-react';
import { FAQSection } from './FAQSection';

interface FAQPageProps {
  onBack: () => void;
}

export const FAQPage: React.FC<FAQPageProps> = ({ onBack }) => {
  return (
    <div id="faq-page" className="w-full max-w-4xl mx-auto py-6 sm:py-10 space-y-8 animate-in fade-in duration-200">
      {/* Back button */}
      <div>
        <button
          type="button"
          onClick={onBack}
          id="btn-faq-back"
          className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl border border-[#E8DFC9] dark:border-[#383222] bg-[#FAF6ED] dark:bg-[#1E1C18] text-[#171817] dark:text-[#F6F4EE] hover:bg-[#F2ECE0] dark:hover:bg-[#25221D] text-xs font-medium transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-3.5 h-3.5 text-[#7C8B7A] dark:text-[#8FA08E]" />
          <span>Back to Home</span>
        </button>
      </div>

      {/* Main FAQ Section (First item open by default) */}
      <div className="pt-2">
        <FAQSection />
      </div>
    </div>
  );
};
