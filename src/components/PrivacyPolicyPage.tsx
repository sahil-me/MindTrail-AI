import React from 'react';
import { ArrowLeft, ShieldCheck, Lock, Sparkles, Database, KeyRound, Mail } from 'lucide-react';

interface PrivacyPolicyPageProps {
  onBack: () => void;
}

export const PrivacyPolicyPage: React.FC<PrivacyPolicyPageProps> = ({ onBack }) => {
  return (
    <div id="privacy-policy-page" className="w-full max-w-4xl mx-auto py-6 sm:py-10 space-y-12 animate-in fade-in duration-200">
      {/* Back button */}
      <div>
        <button
          type="button"
          onClick={onBack}
          id="btn-privacy-back"
          className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl border border-[#E8DFC9] dark:border-[#383222] bg-[#FAF6ED] dark:bg-[#1E1C18] text-[#171817] dark:text-[#F6F4EE] hover:bg-[#F2ECE0] dark:hover:bg-[#25221D] text-xs font-medium transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-3.5 h-3.5 text-[#7C8B7A] dark:text-[#8FA08E]" />
          <span>Back to Home</span>
        </button>
      </div>

      {/* Hero / Header */}
      <div className="space-y-4 text-left border-b border-[#ECE7DC] dark:border-[#282622] pb-8">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#FAF6ED] dark:bg-[#201D17] border border-[#E8DFC9] dark:border-[#383222] text-[#7C8B7A] dark:text-[#8FA08E] text-xs font-semibold tracking-wider uppercase">
          <ShieldCheck className="w-3.5 h-3.5 text-[#7C8B7A] dark:text-[#8FA08E]" />
          <span>PRIVACY & DATA GOVERNANCE</span>
        </div>

        <h1 className="font-serif-title text-3xl sm:text-4xl lg:text-5xl font-normal text-[#171817] dark:text-[#F6F4EE] tracking-tight leading-tight">
          Your journal. Your memories. Your space.
        </h1>

        <p className="text-base sm:text-lg text-[#52504B] dark:text-[#A8A59C] leading-relaxed max-w-2xl font-normal">
          MindTrail AI is built on the principle that your private thoughts must remain strictly under your control. Learn how our architecture isolates and safeguards your reflections.
        </p>
      </div>

      {/* Structured Policy Content */}
      <div className="space-y-8 text-left">
        {/* Pillar 1: Isolation */}
        <section className="p-6 rounded-2xl bg-[#FFFDF8] dark:bg-[#1B1A18] border border-[#ECE7DC] dark:border-[#282622] space-y-3">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-[#FAF6ED] dark:bg-[#24211A] flex items-center justify-center text-[#7C8B7A] dark:text-[#8FA08E]">
              <Lock className="w-4 h-4" />
            </div>
            <h2 className="font-serif-title text-xl font-medium text-[#171817] dark:text-[#F6F4EE]">
              1. User Data Isolation by Architecture
            </h2>
          </div>
          <p className="text-sm sm:text-base text-[#52504B] dark:text-[#A8A59C] leading-relaxed">
            All personal reflections, entries, chat turns, and timeline memories are stored in Cloud Firestore under owner-bound document paths (<code className="text-xs font-mono bg-[#FAF6ED] dark:bg-[#201D17] px-1.5 py-0.5 rounded text-[#8C743D] dark:text-[#D4B774]">/users/&#123;userId&#125;/entries/&#123;entryId&#125;</code>). Firestore security rules require that <code className="text-xs font-mono bg-[#FAF6ED] dark:bg-[#201D17] px-1.5 py-0.5 rounded text-[#8C743D] dark:text-[#D4B774]">request.auth.uid == userId</code> for every read, write, update, or deletion operation. No user can ever query or inspect another user's memories.
          </p>
        </section>

        {/* Pillar 2: AI Model Policy */}
        <section className="p-6 rounded-2xl bg-[#FFFDF8] dark:bg-[#1B1A18] border border-[#ECE7DC] dark:border-[#282622] space-y-3">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-[#FAF6ED] dark:bg-[#24211A] flex items-center justify-center text-[#8C743D] dark:text-[#D4B774]">
              <Sparkles className="w-4 h-4" />
            </div>
            <h2 className="font-serif-title text-xl font-medium text-[#171817] dark:text-[#F6F4EE]">
              2. Zero Model Training on Your Entries
            </h2>
          </div>
          <p className="text-sm sm:text-base text-[#52504B] dark:text-[#A8A59C] leading-relaxed">
            When you request AI reflections or use Ask My Memories, your journal context is sent to Google Gemini via secure server-side API calls exclusively to generate your immediate, personal response. Your entries are never stored, logged, or utilized to train or fine-tune public foundation AI models.
          </p>
        </section>

        {/* Pillar 3: Authentication & Security */}
        <section className="p-6 rounded-2xl bg-[#FFFDF8] dark:bg-[#1B1A18] border border-[#ECE7DC] dark:border-[#282622] space-y-3">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-[#FAF6ED] dark:bg-[#24211A] flex items-center justify-center text-[#7C8B7A] dark:text-[#8FA08E]">
              <KeyRound className="w-4 h-4" />
            </div>
            <h2 className="font-serif-title text-xl font-medium text-[#171817] dark:text-[#F6F4EE]">
              3. Secure Authentication & Token Handling
            </h2>
          </div>
          <p className="text-sm sm:text-base text-[#52504B] dark:text-[#A8A59C] leading-relaxed">
            Authentication is powered by Firebase Authentication, leveraging modern OAuth 2.0 with Google Sign-In and industry-standard password hashing. MindTrail never stores raw passwords in custom application databases. All network traffic between your client device and our servers is encrypted in transit using HTTPS and TLS 1.3.
          </p>
        </section>

        {/* Pillar 4: Deletion & Sovereignty */}
        <section className="p-6 rounded-2xl bg-[#FFFDF8] dark:bg-[#1B1A18] border border-[#ECE7DC] dark:border-[#282622] space-y-3">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-[#FAF6ED] dark:bg-[#24211A] flex items-center justify-center text-[#8C743D] dark:text-[#D4B774]">
              <Database className="w-4 h-4" />
            </div>
            <h2 className="font-serif-title text-xl font-medium text-[#171817] dark:text-[#F6F4EE]">
              4. Complete User Data Sovereignty
            </h2>
          </div>
          <p className="text-sm sm:text-base text-[#52504B] dark:text-[#A8A59C] leading-relaxed">
            You retain absolute ownership of all content authored in MindTrail AI. You may delete individual entries at any time, or trigger a complete account deletion from your Account settings. Account deletion permanently purges all Firestore journal records, interaction documents, profile settings, and authentication credentials.
          </p>
        </section>

        {/* Contact Support */}
        <section className="p-6 rounded-2xl bg-[#FAF8F3] dark:bg-[#191816] border border-[#E8DFC9] dark:border-[#332F26] space-y-2">
          <h2 className="font-serif-title text-lg font-medium text-[#171817] dark:text-[#F6F4EE]">
            Questions Regarding Privacy?
          </h2>
          <p className="text-sm text-[#52504B] dark:text-[#A8A59C] leading-relaxed">
            If you have questions, inquiries, or data export requests, please contact our support desk:
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
