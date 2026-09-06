import React, { useMemo, useEffect, useRef } from 'react';
import { MindTrailLogo } from './MindTrailLogo';
import {
  BookOpen,
  Flame,
  Tag,
  Sparkles,
  ArrowRight,
  Plus,
  Compass,
  MessageSquare,
  Clock,
  ChevronRight,
} from 'lucide-react';
import { JournalEntry, UserProfile } from '../types';
import { getEntryDisplayTimestamp } from '../utils/dateUtils';
import { saveUserProfile } from '../utils/userProfile';

interface DashboardProps {
  user: UserProfile;
  entries: JournalEntry[];
  onSelectEntry: (entry: JournalEntry) => void;
  onNewEntryClick: () => void;
  onOpenMemories: () => void;
  onOpenTimeline: () => void;
}

export const Dashboard: React.FC<DashboardProps> = ({
  user,
  entries,
  onSelectEntry,
  onNewEntryClick,
  onOpenMemories,
  onOpenTimeline,
}) => {
  // 1. Calculate subtle metrics
  const totalMemories = entries.length;

  // Reflections this week
  const reflectionsThisWeek = useMemo(() => {
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
    return entries.filter((e) => {
      const d = new Date(e.createdAt);
      return !isNaN(d.getTime()) && d >= oneWeekAgo;
    }).length;
  }, [entries]);

  // Current Streak (consecutive days with reflections)
  const currentStreak = useMemo(() => {
    if (entries.length === 0) return 0;
    const dates = Array.from(
      new Set(
        entries
          .map((e) => {
            const d = new Date(e.createdAt);
            return isNaN(d.getTime()) ? null : d.toISOString().split('T')[0];
          })
          .filter(Boolean) as string[]
      )
    ).sort((a, b) => (b > a ? 1 : -1));

    if (dates.length === 0) return 0;

    const todayStr = new Date().toISOString().split('T')[0];
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toISOString().split('T')[0];

    // Must have an entry today or yesterday to have an active streak
    if (dates[0] !== todayStr && dates[0] !== yesterdayStr) {
      return 0;
    }

    let streak = 1;
    let currentCheck = new Date(dates[0]);

    for (let i = 1; i < dates.length; i++) {
      currentCheck.setDate(currentCheck.getDate() - 1);
      const expectedStr = currentCheck.toISOString().split('T')[0];
      if (dates[i] === expectedStr) {
        streak++;
      } else {
        break;
      }
    }

    return streak;
  }, [entries]);

  // Key Themes (top moods / topics)
  const keyThemes = useMemo(() => {
    if (entries.length === 0) return 'Personal Reflections';
    const counts: Record<string, number> = {};
    entries.forEach((e) => {
      if (e.mood) {
        counts[e.mood] = (counts[e.mood] || 0) + 1;
      }
    });
    const sorted = Object.entries(counts).sort((a, b) => b[1] - a[1]);
    if (sorted.length === 0) return 'Introspection';
    return sorted
      .slice(0, 3)
      .map(([theme]) => theme)
      .join(', ');
  }, [entries]);

  // Display Name formatting
  const firstName = useMemo(() => {
    if (user.displayName) {
      const parts = user.displayName.trim().split(' ');
      return parts[0];
    }
    if (user.email) {
      return user.email.split('@')[0];
    }
    return '';
  }, [user.displayName, user.email]);

  // Check if this is the user's initial dashboard session
  const isFirstVisitSession = useRef(
    user.hasCompletedFirstVisit === false && entries.length === 0
  );

  // Persist that the first visit has occurred so future sessions show 'Welcome back'
  useEffect(() => {
    if (user?.uid && user.hasCompletedFirstVisit === false) {
      saveUserProfile(user.uid, { hasCompletedFirstVisit: true }).catch((err) =>
        console.warn('[First visit mark error]:', err)
      );
    }
  }, [user?.uid, user?.hasCompletedFirstVisit]);

  const isFirstVisit = isFirstVisitSession.current;

  return (
    <div id="personal-reflection-dashboard" className="w-full max-w-5xl mx-auto space-y-9 animate-in fade-in duration-300">
      {/* 1. Warm, Thoughtful Greeting */}
      <div
        id="dashboard-greeting-banner"
        className="bg-[#FFFDF8] dark:bg-[#1B1A18] rounded-2xl border border-[#E8E5DE] dark:border-[#292825] p-7 sm:p-10 shadow-xs relative overflow-hidden transition-colors"
      >
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
          <div className="max-w-2xl">
            <span className="text-[10px] tracking-widest uppercase font-semibold text-[#7C8B7A] dark:text-[#8FA08E]">
              Private Sanctuary
            </span>
            <h1
              id="dashboard-user-greeting"
              className="font-serif-title text-3xl sm:text-4xl text-[#171817] dark:text-[#F6F4EE] font-normal tracking-tight mt-1.5"
            >
              {isFirstVisit
                ? firstName
                  ? `Welcome to MindTrail, ${firstName}.`
                  : 'Welcome to MindTrail.'
                : firstName
                ? `Welcome back, ${firstName}.`
                : 'Welcome back.'}
            </h1>
            <p className="text-sm sm:text-base text-[#686862] dark:text-[#9E9D96] font-normal leading-relaxed mt-2">
              {isFirstVisit
                ? 'Your private space to reflect, remember, and understand your journey.'
                : 'A quiet space to reflect, remember, and understand your journey.'}
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <button
              id="btn-dashboard-new-reflection"
              onClick={onNewEntryClick}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#171817] dark:bg-[#F6F4EE] text-[#FFFDF8] dark:text-[#171817] hover:opacity-90 text-xs sm:text-sm font-semibold tracking-wide transition-all shadow-xs cursor-pointer active:scale-98"
            >
              <Plus className="w-4 h-4" />
              <span>New Reflection</span>
            </button>
            <button
              id="btn-dashboard-ask-memories"
              onClick={onOpenMemories}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-[#E8E5DE] dark:border-[#2B2A27] bg-[#F8F6F0] dark:bg-[#232220] hover:bg-[#FAF6ED] dark:hover:bg-[#2A271F] text-xs sm:text-sm font-medium text-[#171817] dark:text-[#F6F4EE] transition-colors cursor-pointer"
            >
              <Sparkles className="w-4 h-4 text-[#C5A45D] dark:text-[#D4B774]" />
              <span>Ask Memories</span>
            </button>
          </div>
        </div>
      </div>

      {/* 2. Clean Summary Row with Subtle Metrics */}
      <div id="dashboard-metrics-row" className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {/* Metric 1: Total Memories */}
        <div className="bg-[#FFFDF8] dark:bg-[#1B1A18] rounded-xl border border-[#E8E5DE] dark:border-[#292825] p-5 shadow-2xs transition-colors">
          <span className="text-[11px] font-semibold text-[#686862] dark:text-[#9E9D96] uppercase tracking-wider block mb-1">
            Total Memories
          </span>
          <div className="flex items-baseline gap-2">
            <span className="font-serif-title text-2xl sm:text-3xl font-normal text-[#171817] dark:text-[#F6F4EE]">
              {totalMemories}
            </span>
            <span className="text-xs text-[#8C8B83] dark:text-[#7A7872]">
              {totalMemories === 1 ? 'entry' : 'entries'}
            </span>
          </div>
        </div>

        {/* Metric 2: Reflections This Week */}
        <div className="bg-[#FFFDF8] dark:bg-[#1B1A18] rounded-xl border border-[#E8E5DE] dark:border-[#292825] p-5 shadow-2xs transition-colors">
          <span className="text-[11px] font-semibold text-[#686862] dark:text-[#9E9D96] uppercase tracking-wider block mb-1">
            Reflections This Week
          </span>
          <div className="flex items-baseline gap-2">
            <span className="font-serif-title text-2xl sm:text-3xl font-normal text-[#171817] dark:text-[#F6F4EE]">
              {reflectionsThisWeek}
            </span>
            <span className="text-xs text-[#8C8B83] dark:text-[#7A7872]">
              past 7 days
            </span>
          </div>
        </div>

        {/* Metric 3: Current Streak */}
        <div className="bg-[#FFFDF8] dark:bg-[#1B1A18] rounded-xl border border-[#E8E5DE] dark:border-[#292825] p-5 shadow-2xs transition-colors">
          <span className="text-[11px] font-semibold text-[#686862] dark:text-[#9E9D96] uppercase tracking-wider block mb-1">
            Current Streak
          </span>
          <div className="flex items-baseline gap-2">
            <span className="font-serif-title text-2xl sm:text-3xl font-normal text-[#171817] dark:text-[#F6F4EE]">
              {currentStreak}
            </span>
            <span className="text-xs text-[#8C8B83] dark:text-[#7A7872]">
              {currentStreak === 1 ? 'day' : 'days'}
            </span>
          </div>
        </div>

        {/* Metric 4: Key Themes */}
        <div className="bg-[#FFFDF8] dark:bg-[#1B1A18] rounded-xl border border-[#E8E5DE] dark:border-[#292825] p-5 shadow-2xs transition-colors">
          <span className="text-[11px] font-semibold text-[#686862] dark:text-[#9E9D96] uppercase tracking-wider block mb-1">
            Key Themes
          </span>
          <div className="flex items-baseline gap-1.5 truncate">
            <span className="font-serif-title text-lg sm:text-xl font-normal text-[#171817] dark:text-[#F6F4EE] truncate" title={keyThemes}>
              {keyThemes}
            </span>
          </div>
        </div>
      </div>

      {/* Spotlight: Make Reflection a Habit */}
      <div
        id="spotlight-reflection-habit"
        className="rounded-2xl border border-[#E8E5DE] dark:border-[#292825] bg-gradient-to-r from-[#FAF6ED] to-[#FFFDF8] dark:from-[#201E1A] dark:to-[#181716] p-5 sm:p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4 transition-all"
      >
        <div className="flex items-start gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-[#C5A45D]/15 dark:bg-[#C5A45D]/25 text-[#9E7D32] dark:text-[#E3CA8C] flex items-center justify-center shrink-0 mt-0.5">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-serif-title text-base sm:text-lg font-medium text-[#171817] dark:text-[#F6F4EE]">
                Make Reflection a Habit
              </h3>
              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wider bg-[#7C8B7A]/15 text-[#5B6B59] dark:text-[#9FB09D]">
                Practice
              </span>
            </div>
            <p className="text-xs text-[#686862] dark:text-[#9E9D96] mt-1 max-w-xl leading-relaxed">
              Turn reflection into a daily mindful practice — capture your thoughts and preserve moments that matter.
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 shrink-0 pt-1 md:pt-0">
          <button
            id="btn-new-reflection-dashboard"
            type="button"
            onClick={onNewEntryClick}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#171817] dark:bg-[#F6F4EE] text-[#FFFDF8] dark:text-[#171817] text-xs font-semibold hover:opacity-90 transition-all shadow-2xs cursor-pointer active:scale-98"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Write Reflection</span>
          </button>
        </div>
      </div>

      {/* 3. Section Titled: Recent Reflections */}
      <div id="recent-reflections-section" className="space-y-5">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="font-serif-title text-2xl text-[#171817] dark:text-[#F6F4EE] font-normal tracking-tight">
              Recent Reflections
            </h2>
            <p className="text-xs text-[#686862] dark:text-[#9E9D96] mt-0.5">
              Pages from your personal reflection archive.
            </p>
          </div>

          {entries.length > 0 && (
            <button
              onClick={onOpenTimeline}
              className="inline-flex items-center gap-1.5 text-xs text-[#7C8B7A] dark:text-[#8FA08E] hover:text-[#171817] dark:hover:text-[#F6F4EE] font-medium transition-colors cursor-pointer"
            >
              <span>View Full Timeline</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Entries Presented as Elegant Notebook Pages or Cards */}
        {entries.length === 0 ? (
          <div className="bg-[#FFFDF8] dark:bg-[#1B1A18] rounded-2xl border border-dashed border-[#E8E5DE] dark:border-[#292825] p-10 sm:p-14 text-center space-y-4">
            <div className="flex items-center justify-center mx-auto">
              <MindTrailLogo size={42} />
            </div>
            <div className="max-w-md mx-auto">
              <h3 className="font-serif-title text-xl text-[#171817] dark:text-[#F6F4EE] font-normal">
                Your first page is waiting.
              </h3>
              <p className="text-xs sm:text-sm text-[#686862] dark:text-[#9E9D96] mt-2 leading-relaxed">
                Take a quiet moment to write what's on your mind. MindTrail will help you preserve meaningful moments and discover patterns over time.
              </p>
            </div>
            <button
              onClick={onNewEntryClick}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#171817] dark:bg-[#F6F4EE] text-[#FFFDF8] dark:text-[#171817] hover:opacity-90 text-xs font-semibold tracking-wide transition-all shadow-xs cursor-pointer active:scale-98"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>+ Write Your First Reflection</span>
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {entries.slice(0, 6).map((entry) => {
              const d = new Date(entry.createdAt);
              const dateFormatted = isNaN(d.getTime())
                ? 'Recent'
                : d.toLocaleDateString('en-US', {
                    weekday: 'short',
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric',
                  });

              const previewText =
                entry.summarySnippet ||
                entry.originalJournal.slice(0, 180) + (entry.originalJournal.length > 180 ? '...' : '');

              return (
                <div
                  key={entry.id}
                  onClick={() => onSelectEntry(entry)}
                  className="group bg-[#FFFDF8] dark:bg-[#1B1A18] rounded-2xl border border-[#E8E5DE] dark:border-[#292825] hover:border-[#C5A45D]/70 dark:hover:border-[#D4B774]/70 p-6 shadow-xs hover:shadow-md transition-all cursor-pointer flex flex-col justify-between"
                >
                  <div>
                    {/* Header: Date & Time + Mood Badge */}
                    <div className="flex items-center justify-between gap-3 mb-3">
                      <span className="text-[11px] font-mono text-[#8C8B83] dark:text-[#7A7872]">
                        {getEntryDisplayTimestamp(entry)}
                      </span>
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-[#FAF6ED] dark:bg-[#232018] text-[#C5A45D] dark:text-[#D4B774] border border-[#E6D8B5] dark:border-[#3B331E]">
                        {entry.mood}
                      </span>
                    </div>

                    {/* Title */}
                    <h3 className="font-serif-title text-xl text-[#171817] dark:text-[#F6F4EE] group-hover:text-[#C5A45D] dark:group-hover:text-[#D4B774] transition-colors line-clamp-1">
                      {entry.title}
                    </h3>

                    {/* Brief Preview */}
                    <p className="text-xs sm:text-sm text-[#686862] dark:text-[#9E9D96] font-normal leading-relaxed mt-2.5 line-clamp-3">
                      {previewText}
                    </p>
                  </div>

                  {/* Footer: Subtle tags & Action */}
                  <div className="mt-5 pt-3.5 border-t border-[#E8E5DE]/80 dark:border-[#292825] flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="inline-flex items-center gap-1 text-[11px] text-[#7C8B7A] dark:text-[#8FA08E]">
                        <Tag className="w-3 h-3" />
                        <span className="capitalize">{entry.mode ? entry.mode.replace('_', ' ') : 'Reflection'}</span>
                      </span>

                      {entry.messages && entry.messages.length > 1 && (
                        <>
                          <span className="text-[#8C8B83] dark:text-[#7A7872] text-[10px]">•</span>
                          <span className="inline-flex items-center gap-1 text-[11px] text-[#8C8B83] dark:text-[#7A7872]">
                            <MessageSquare className="w-3 h-3" />
                            <span>{entry.messages.length - 1} AI {entry.messages.length - 1 === 1 ? 'note' : 'notes'}</span>
                          </span>
                        </>
                      )}
                    </div>

                    <span className="inline-flex items-center gap-1 text-xs text-[#171817] dark:text-[#F6F4EE] group-hover:translate-x-0.5 transition-transform font-medium">
                      <span>Open</span>
                      <ArrowRight className="w-3.5 h-3.5 text-[#C5A45D] dark:text-[#D4B774]" />
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
