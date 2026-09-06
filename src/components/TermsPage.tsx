import React from 'react';
import { ArrowLeft, FileText, CheckCircle2, AlertCircle, Shield, Mail } from 'lucide-react';

interface TermsPageProps {
  onBack: () => void;
}

export const TermsPage: React.FC<TermsPageProps> = ({ onBack }) => {
  return (
    <div id="terms-page" className="w-full max-w-4xl mx-auto py-6 sm:py-10 space-y-12 animate-in fade-in duration-200">
      {/* Back button */}
      <div>
        <button
          type="button"
          onClick={onBack}
          id="btn-terms-back"
          className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl border border-[#E8DFC9] dark:border-[#383222] bg-[#FAF6ED] dark:bg-[#1E1C18] text-[#171817] dark:text-[#F6F4EE] hover:bg-[#F2ECE0] dark:hover:bg-[#25221D] text-xs font-medium transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-3.5 h-3.5 text-[#7C8B7A] dark:text-[#8FA08E]" />
          <span>Back to Home</span>
        </button>
      </div>

      {/* Hero / Header */}
      <div className="space-y-4 text-left border-b border-[#ECE7DC] dark:border-[#282622] pb-8">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#FAF6ED] dark:bg-[#201D17] border border-[#E8DFC9] dark:border-[#383222] text-[#8C743D] dark:text-[#D4B774] text-xs font-semibold tracking-wider uppercase">
          <FileText className="w-3.5 h-3.5 text-[#8C743D] dark:text-[#D4B774]" />
          <span>TERMS OF SERVICE</span>
        </div>

        <h1 className="font-serif-title text-3xl sm:text-4xl lg:text-5xl font-normal text-[#171817] dark:text-[#F6F4EE] tracking-tight leading-tight">
          A clear agreement for reflective journaling.
        </h1>

        <p className="text-base sm:text-lg text-[#52504B] dark:text-[#A8A59C] leading-relaxed max-w-2xl font-normal">
          These Terms govern your use of MindTrail AI. We strive for transparency, respectful service, and absolute protection of your creative ownership.
        </p>
      </div>

      {/* Terms Content */}
      <div className="space-y-8 text-left">
        {/* Section 1 */}
        <section className="p-6 rounded-2xl bg-[#FFFDF8] dark:bg-[#1B1A18] border border-[#ECE7DC] dark:border-[#282622] space-y-3">
          <h2 className="font-serif-title text-xl font-medium text-[#171817] dark:text-[#F6F4EE]">
            1. Nature of the Service
          </h2>
          <p className="text-sm sm:text-base text-[#52504B] dark:text-[#A8A59C] leading-relaxed">
            MindTrail AI is a personal, private digital journaling and memory companion designed to help individuals record moments, reflect upon their thoughts, and discover insights through AI-assisted queries.
          </p>
          <div className="p-4 rounded-xl bg-[#FAF6ED] dark:bg-[#201D17] border border-[#E8DFC9] dark:border-[#383222] flex items-start gap-3 mt-2">
            <AlertCircle className="w-5 h-5 text-[#8C743D] dark:text-[#D4B774] shrink-0 mt-0.5" />
            <p className="text-xs sm:text-sm text-[#52504B] dark:text-[#A8A59C] leading-relaxed">
              <strong>Important Disclaimer:</strong> MindTrail AI is not a clinical medical device, psychological diagnostic tool, or emergency crisis service. The AI-generated reflections and insights are for personal mindfulness and exploratory self-reflection only.
            </p>
          </div>
        </section>

        {/* Section 2 */}
        <section className="p-6 rounded-2xl bg-[#FFFDF8] dark:bg-[#1B1A18] border border-[#ECE7DC] dark:border-[#282622] space-y-3">
          <h2 className="font-serif-title text-xl font-medium text-[#171817] dark:text-[#F6F4EE]">
            2. Ownership of Your Journal Content
          </h2>
          <p className="text-sm sm:text-base text-[#52504B] dark:text-[#A8A59C] leading-relaxed">
            You retain 100% intellectual property ownership of all words, entries, prompts, and notes you author in MindTrail AI. We claim zero ownership or rights over your reflections. MindTrail operates solely to provide you with secure storage, retrieval, and AI synthesis tools on your behalf.
          </p>
        </section>

        {/* Section 3 */}
        <section className="p-6 rounded-2xl bg-[#FFFDF8] dark:bg-[#1B1A18] border border-[#ECE7DC] dark:border-[#282622] space-y-3">
          <h2 className="font-serif-title text-xl font-medium text-[#171817] dark:text-[#F6F4EE]">
            3. Account Responsibilities
          </h2>
          <p className="text-sm sm:text-base text-[#52504B] dark:text-[#A8A59C] leading-relaxed">
            You are responsible for maintaining the confidentiality of your authenticated login credentials. You agree not to attempt to compromise the security rules, reverse-engineer proprietary components, or transmit harmful payloads to the backend services.
          </p>
        </section>

        {/* Section 4 */}
        <section className="p-6 rounded-2xl bg-[#FFFDF8] dark:bg-[#1B1A18] border border-[#ECE7DC] dark:border-[#282622] space-y-3">
          <h2 className="font-serif-title text-xl font-medium text-[#171817] dark:text-[#F6F4EE]">
            4. Account Deletion & Termination
          </h2>
          <p className="text-sm sm:text-base text-[#52504B] dark:text-[#A8A59C] leading-relaxed">
            You may terminate your account and erase all associated data at any time from your Account settings. Upon confirming account deletion, all Firestore documents, user records, and interaction logs are permanently wiped and unrecoverable.
          </p>
        </section>

        {/* Contact Support */}
        <section className="p-6 rounded-2xl bg-[#FAF8F3] dark:bg-[#191816] border border-[#E8DFC9] dark:border-[#332F26] space-y-2">
          <h2 className="font-serif-title text-lg font-medium text-[#171817] dark:text-[#F6F4EE]">
            Questions About Terms?
          </h2>
          <p className="text-sm text-[#52504B] dark:text-[#A8A59C] leading-relaxed">
            Reach out directly for any questions regarding our terms and user protections:
          </p>
          <a
            href="mailto:contact.eshop.sahil@gmail.com"
            className="inline-flex items-center gap-2 text-sm font-medium text-[#8C743D] dark:text-[#D4B774] hover:underline pt-1"
          >
            <Mail className="w-4 h-4" />
            <span>contact.eshop.sahil@gmail.com</span>
          </a>
        </section>
      </div>
    </div>
  );
};
