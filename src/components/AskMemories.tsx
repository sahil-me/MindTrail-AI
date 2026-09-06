import React, { useState } from 'react';
import { MindTrailLogo } from './MindTrailLogo';
import {
  Sparkles,
  Send,
  Loader2,
  BookOpen,
  ShieldCheck,
  Brain,
  HelpCircle,
  Plus,
  RefreshCw,
  Clock,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';
import { MemoryInquiry, UserProfile, JournalEntry } from '../types';
import { callAskMemories } from '../utils/api';
import { auth } from '../firebase';
import { AvatarBadge } from '../utils/avatarPresets';

interface AskMemoriesProps {
  user: UserProfile;
  entriesCount: number;
  entries?: JournalEntry[];
  onNewEntryClick: () => void;
}

const STARTER_QUESTIONS = [
  'What have I been thinking about most?',
  'What goals keep coming back?',
  'How has my mindset changed?',
  'What memories are connected to this?',
  'What patterns have appeared in my reflections lately?',
];

export const AskMemories: React.FC<AskMemoriesProps> = ({
  user,
  entriesCount,
  entries = [],
  onNewEntryClick,
}) => {
  const [question, setQuestion] = useState('');
  const [inquiries, setInquiries] = useState<MemoryInquiry[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async (customQuestion?: string) => {
    const q = (customQuestion || question).trim();
    if (!q) {
      setErrorMessage('Please enter a question to ask your memories.');
      return;
    }

    setIsLoading(true);
    setErrorMessage(null);

    try {
      // Obtain current user's authenticated Firebase ID token
      const idToken = await auth.currentUser?.getIdToken();
      if (!idToken) {
        throw new Error('You are not currently authenticated. Please sign in again.');
      }

      const result = await callAskMemories(idToken, q, entries);

      const newInquiry: MemoryInquiry = {
        id: 'mem_' + Date.now(),
        question: q,
        answer: result.answer,
        memoriesAnalyzedCount: result.memoriesAnalyzedCount,
        modelUsed: result.modelUsed,
        timestamp: result.timestamp || new Date().toISOString(),
      };

      setInquiries((prev) => [newInquiry, ...prev]);
      if (!customQuestion) {
        setQuestion('');
      }
    } catch (err: any) {
      console.warn('[Ask Memories]:', err);
      setErrorMessage(err?.message || 'Failed to analyze your memories. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <div id="ask-memories-container" className="w-full flex flex-col gap-8 animate-in fade-in duration-300">
      {/* Editorial Header Banner */}
      <div
        id="memories-header-card"
        className="bg-[#FFFDF8] dark:bg-[#1B1A18] rounded-2xl border border-[#E8E5DE] dark:border-[#292825] p-7 sm:p-9 shadow-xs relative overflow-hidden transition-colors"
      >
        <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="text-[10px] tracking-widest uppercase font-semibold text-[#7C8B7A] dark:text-[#8FA08E]">
                Personal Memory Synthesis
              </span>
              <span className="text-[#8C8B83] dark:text-[#7A7872] text-[10px]">•</span>
              <span className="inline-flex items-center gap-1 text-[11px] text-[#7C8B7A] dark:text-[#8FA08E] font-medium">
                <ShieldCheck className="w-3 h-3" />
                Grounded Exclusively in Your Journal
              </span>
            </div>
            <h1
              id="ask-memories-heading"
              className="font-serif-title text-3xl sm:text-4xl font-normal text-[#171817] dark:text-[#F6F4EE] tracking-tight"
            >
              Ask your memories.
            </h1>
            <p
              id="ask-memories-subtitle"
              className="text-[#686862] dark:text-[#9E9D96] text-sm sm:text-base mt-2 max-w-xl font-normal leading-relaxed"
            >
              Explore connections across everything you've chosen to remember.
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <span
              id="memories-available-badge"
              className="px-3.5 py-1.5 rounded-full bg-[#F8F6F0] dark:bg-[#232220] border border-[#E8E5DE] dark:border-[#2B2A27] text-xs text-[#686862] dark:text-[#A3A199] font-medium flex items-center gap-2"
            >
              <BookOpen className="w-3.5 h-3.5 text-[#C5A45D] dark:text-[#D4B774]" />
              <span>{entriesCount} {entriesCount === 1 ? 'reflection' : 'reflections'} in your archive</span>
            </span>
          </div>
        </div>
      </div>

      {/* Case 1: User has NO reflections in Firestore */}
      {entriesCount === 0 ? (
        <div
          id="memories-empty-entries-card"
          className="bg-[#FFFDF8] dark:bg-[#1B1A18] rounded-2xl border border-dashed border-[#E8E5DE] dark:border-[#292825] p-10 sm:p-14 text-center flex flex-col items-center justify-center gap-4"
        >
          <div className="flex items-center justify-center mx-auto">
            <MindTrailLogo size={42} />
          </div>
          <div className="max-w-md">
            <h2 className="font-serif-title text-xl text-[#171817] dark:text-[#F6F4EE] font-medium">
              No reflections saved yet
            </h2>
            <p className="text-[#686862] dark:text-[#9E9D96] text-xs sm:text-sm mt-2 leading-relaxed">
              Write a few reflections first, then MindTrail can synthesize patterns and answer questions about your memories.
            </p>
          </div>
          <button
            id="btn-first-reflection"
            onClick={onNewEntryClick}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#171817] dark:bg-[#F6F4EE] hover:opacity-90 text-[#FFFDF8] dark:text-[#171817] text-xs font-semibold tracking-wide transition-all shadow-xs cursor-pointer active:scale-98 mt-2"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Write Your First Reflection</span>
          </button>
        </div>
      ) : (
        /* Case 2: User has reflections -> Question Input & Starter Prompts */
        <div className="flex flex-col gap-6">
          {/* Question Input Card */}
          <div
            id="memories-input-card"
            className="bg-[#FFFDF8] dark:bg-[#1B1A18] rounded-2xl border border-[#E8E5DE] dark:border-[#292825] p-6 sm:p-8 shadow-xs"
          >
            <div className="flex items-center justify-between mb-3">
              <label
                htmlFor="input-memory-question"
                className="block text-[11px] font-semibold text-[#171817] dark:text-[#F6F4EE] uppercase tracking-wider"
              >
                Inquire With Your Memories
              </label>
              <span className="text-[11px] text-[#7C8B7A] dark:text-[#8FA08E] font-medium">
                Gemini reads only your authenticated reflections
              </span>
            </div>

            <div className="relative rounded-2xl border border-[#E8E5DE] dark:border-[#292825] overflow-hidden bg-[#F8F6F0]/40 dark:bg-[#151413] focus-within:ring-1 focus-within:ring-[#C5A45D] focus-within:border-[#C5A45D] transition-all">
              <textarea
                id="input-memory-question"
                rows={3}
                value={question}
                onChange={(e) => {
                  setQuestion(e.target.value);
                  if (errorMessage) setErrorMessage(null);
                }}
                onKeyDown={handleKeyDown}
                placeholder="What patterns have appeared in my reflections lately?"
                className="w-full p-4 bg-transparent text-sm sm:text-base text-[#171817] dark:text-[#F6F4EE] focus:outline-none placeholder:text-[#8C8B83] dark:placeholder:text-[#7A7872] resize-none leading-relaxed transition-all"
                disabled={isLoading}
              />
            </div>

            {/* Error message inside input card if any */}
            {errorMessage && (
              <div
                id="memories-error-alert"
                className="mt-3 p-3 rounded-xl bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-900 text-rose-800 dark:text-rose-200 text-xs flex items-center justify-between gap-2"
              >
                <div className="flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                  <span>{errorMessage}</span>
                </div>
                <button
                  onClick={() => setErrorMessage(null)}
                  className="text-rose-600 hover:text-rose-900 dark:hover:text-rose-100 font-semibold cursor-pointer"
                >
                  Dismiss
                </button>
              </div>
            )}

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mt-4 pt-3 border-t border-[#E8E5DE] dark:border-[#292825]">
              <div className="flex items-center gap-1.5 text-xs text-[#8C8B83] dark:text-[#7A7872]">
                <HelpCircle className="w-3.5 h-3.5 text-[#C5A45D]" />
                <span>Press Enter to inquire or click Inquire Memories</span>
              </div>
              <div className="flex items-center gap-2">
                {inquiries.length > 0 && (
                  <button
                    id="btn-clear-memories-inquiries"
                    onClick={() => setInquiries([])}
                    className="px-3.5 py-2 rounded-xl text-[#686862] dark:text-[#9E9D96] hover:text-[#171817] dark:hover:text-[#F6F4EE] text-xs font-medium hover:bg-[#F8F6F0] dark:hover:bg-[#232220] transition-colors cursor-pointer"
                    disabled={isLoading}
                  >
                    Clear Inquiries
                  </button>
                )}
                <button
                  id="btn-submit-memory-question"
                  onClick={() => handleSubmit()}
                  disabled={isLoading || !question.trim()}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#171817] dark:bg-[#F6F4EE] text-[#FFFDF8] dark:text-[#171817] hover:opacity-90 text-xs sm:text-sm font-semibold tracking-wide transition-all shadow-xs cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed active:scale-98"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>Synthesizing...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-3.5 h-3.5 text-[#C5A45D] dark:text-[#D4B774]" />
                      <span>Inquire Memories</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Clickable Example Starters */}
            <div className="mt-5 pt-4 border-t border-[#E8E5DE] dark:border-[#292825]">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-[#686862] dark:text-[#9E9D96] block mb-2.5">
                Suggested questions:
              </span>
              <div className="flex flex-wrap gap-2">
                {STARTER_QUESTIONS.map((starter, idx) => (
                  <button
                    key={idx}
                    id={`btn-starter-question-${idx}`}
                    onClick={() => {
                      setQuestion(starter);
                      handleSubmit(starter);
                    }}
                    disabled={isLoading}
                    className="text-left px-3.5 py-2 rounded-xl bg-[#F8F6F0] dark:bg-[#232220] hover:bg-[#FAF6ED] dark:hover:bg-[#2A271F] hover:border-[#C5A45D] dark:hover:border-[#C5A45D]/60 border border-[#E8E5DE] dark:border-[#2B2A27] text-xs text-[#171817] dark:text-[#F6F4EE] transition-all cursor-pointer disabled:opacity-50"
                  >
                    "{starter}"
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Active Loading State Card */}
          {isLoading && (
            <div
              id="memories-loading-card"
              className="bg-[#FFFDF8] dark:bg-[#1B1A18] rounded-2xl border border-[#C5A45D]/40 dark:border-[#C5A45D]/30 p-6 sm:p-7 shadow-xs flex items-center gap-4 animate-pulse"
            >
              <div className="w-10 h-10 rounded-xl bg-[#FAF6ED] dark:bg-[#28241B] border border-[#E6D8B5] dark:border-[#423924] flex items-center justify-center text-[#C5A45D] shrink-0">
                <Loader2 className="w-5 h-5 animate-spin" />
              </div>
              <div>
                <h2 className="text-sm font-semibold text-[#171817] dark:text-[#F6F4EE]">
                  Synthesizing journal history with Gemini...
                </h2>
                <p className="text-xs text-[#686862] dark:text-[#9E9D96] mt-0.5">
                  Scanning your reflections, identifying recurring themes, and cross-referencing past insights.
                </p>
              </div>
            </div>
          )}

          {/* Inquiries Stream */}
          {inquiries.length > 0 ? (
            <div id="memories-inquiries-list" className="flex flex-col gap-5">
              {inquiries.map((item, index) => (
                <div
                  key={item.id}
                  id={`memory-inquiry-card-${index}`}
                  className="bg-[#FFFDF8] dark:bg-[#1B1A18] rounded-2xl border border-[#E8E5DE] dark:border-[#292825] p-6 sm:p-8 shadow-xs flex flex-col gap-5 transition-all"
                >
                  {/* User's Question */}
                  <div className="flex items-start gap-3 pb-4 border-b border-[#E8E5DE] dark:border-[#292825]">
                    <AvatarBadge
                      user={user}
                      size="sm"
                      idPrefix={`memory-inquiry-user-${index}`}
                      className="mt-0.5"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-xs font-semibold text-[#171817] dark:text-[#F6F4EE]">
                          {user.displayName || 'You inquired'}
                        </span>
                        <span className="text-[11px] text-[#8C8B83] dark:text-[#7A7872] flex items-center gap-1 font-mono">
                          <Clock className="w-3 h-3" />
                          {new Date(item.timestamp).toLocaleTimeString([], {
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </span>
                      </div>
                      <p className="text-[#171817] dark:text-[#F6F4EE] text-sm font-medium mt-1 font-serif-title text-base sm:text-lg">
                        "{item.question}"
                      </p>
                    </div>
                  </div>

                  {/* Gemini's Synthesized Answer */}
                  <div className="flex items-start gap-3.5">
                    <div className="w-8 h-8 rounded-xl bg-[#FAF6ED] dark:bg-[#28241B] border border-[#E6D8B5] dark:border-[#423924] flex items-center justify-center text-[#C5A45D] dark:text-[#D4B774] shrink-0 mt-0.5">
                      <Sparkles className="w-4 h-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-3">
                        <span className="text-xs font-semibold text-[#171817] dark:text-[#F6F4EE]">
                          Gemini Memory Synthesis
                        </span>
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-medium bg-[#FAF6ED] dark:bg-[#221F17] text-[#C5A45D] dark:text-[#D4B774] border border-[#E6D8B5] dark:border-[#3E3622]">
                          <CheckCircle2 className="w-2.5 h-2.5" />
                          Synthesized across {item.memoriesAnalyzedCount} {item.memoriesAnalyzedCount === 1 ? 'reflection' : 'reflections'}
                        </span>
                      </div>

                      {/* Content Body */}
                      <div className="text-sm sm:text-base text-[#171817] dark:text-[#F6F4EE] leading-relaxed space-y-3 whitespace-pre-wrap font-normal">
                        {item.answer}
                      </div>

                      {/* Card Footer Metadata */}
                      <div className="mt-5 pt-3.5 border-t border-[#E8E5DE] dark:border-[#292825] flex flex-wrap items-center justify-between gap-2 text-[11px] text-[#8C8B83] dark:text-[#7A7872]">
                        <span className="flex items-center gap-1">
                          <ShieldCheck className="w-3 h-3 text-[#7C8B7A]" />
                          Derived strictly from your private reflections
                        </span>
                        <span className="font-mono text-[10px]">Engine: {item.modelUsed}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            /* Empty Inquiries State: user has reflections but hasn't asked yet */
            !isLoading && (
              <div
                id="memories-guide-card"
                className="bg-[#FAF6ED]/50 dark:bg-[#1B1A18]/60 rounded-2xl border border-[#E8E5DE] dark:border-[#292825] p-7 sm:p-9 text-center flex flex-col items-center gap-3"
              >
                <div className="w-12 h-12 rounded-xl bg-[#FFFDF8] dark:bg-[#232220] border border-[#E8E5DE] dark:border-[#2B2A27] flex items-center justify-center text-[#C5A45D] dark:text-[#D4B774] shadow-2xs">
                  <Brain className="w-5 h-5" />
                </div>
                <h2 className="font-serif-title text-lg font-normal text-[#171817] dark:text-[#F6F4EE]">
                  Your journal memories are ready for exploration
                </h2>
                <p className="text-xs sm:text-sm text-[#686862] dark:text-[#9E9D96] max-w-md leading-relaxed">
                  Select one of the suggested inquiries above or enter your own question. Gemini will review your stored reflections and surface meaningful patterns.
                </p>
              </div>
            )
          )}
        </div>
      )}
    </div>
  );
};
