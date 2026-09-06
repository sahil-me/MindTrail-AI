import React, { useState, useMemo } from 'react';
import { MindTrailLogo } from './MindTrailLogo';
import { JournalEntry } from '../types';
import { getEntryDisplayTimestamp } from '../utils/dateUtils';
import {
  Calendar,
  Sparkles,
  ArrowRight,
  Filter,
  Plus,
  Compass,
  GitBranch,
  BookOpen,
  Tag,
  MapPin,
} from 'lucide-react';

interface MemoryTimelineProps {
  entries: JournalEntry[];
  onSelectEntry: (entry: JournalEntry) => void;
  onNewEntryClick: () => void;
}

export const MemoryTimeline: React.FC<MemoryTimelineProps> = ({
  entries,
  onSelectEntry,
  onNewEntryClick,
}) => {
  const [selectedMoodFilter, setSelectedMoodFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Extract unique moods for filtering
  const allMoods = useMemo(() => {
    const set = new Set<string>();
    entries.forEach((e) => {
      if (e.mood) set.add(e.mood);
    });
    return ['all', ...Array.from(set)];
  }, [entries]);

  // Filter entries
  const filtered = useMemo(() => {
    return entries.filter((entry) => {
      const matchMood = selectedMoodFilter === 'all' || entry.mood === selectedMoodFilter;
      const matchSearch =
        !searchQuery.trim() ||
        entry.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        entry.originalJournal.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (entry.summarySnippet && entry.summarySnippet.toLowerCase().includes(searchQuery.toLowerCase()));
      return matchMood && matchSearch;
    });
  }, [entries, selectedMoodFilter, searchQuery]);

  // Group chronologically: Year -> Month -> Entries
  const timelineGroups = useMemo(() => {
    // Sort descending by date
    const sorted = [...filtered].sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );

    const map = new Map<string, Map<string, JournalEntry[]>>();

    sorted.forEach((entry) => {
      const d = new Date(entry.createdAt);
      const year = isNaN(d.getTime()) ? '2026' : d.getFullYear().toString();
      const month = isNaN(d.getTime())
        ? 'September'
        : d.toLocaleDateString('en-US', { month: 'long' });

      if (!map.has(year)) {
        map.set(year, new Map());
      }
      const yearMap = map.get(year)!;
      if (!yearMap.has(month)) {
        yearMap.set(month, []);
      }
      yearMap.get(month)!.push(entry);
    });

    return map;
  }, [filtered]);

  // Derive subtle AI connection patterns across entries
  const connectionInsights = useMemo(() => {
    if (entries.length < 2) return null;
    const moodCounts: Record<string, number> = {};
    entries.forEach((e) => {
      moodCounts[e.mood] = (moodCounts[e.mood] || 0) + 1;
    });
    const topMood = Object.entries(moodCounts).sort((a, b) => b[1] - a[1])[0];

    return {
      topTheme: topMood ? topMood[0] : 'Reflective',
      count: topMood ? topMood[1] : entries.length,
      note: `Recurring emotional anchor: ${topMood ? topMood[0] : 'Thoughtful introspection'} across ${topMood ? topMood[1] : 2} reflections.`,
    };
  }, [entries]);

  return (
    <div id="memory-timeline-view" className="w-full max-w-4xl mx-auto space-y-8 animate-in fade-in duration-300">
      {/* Header Banner */}
      <div className="bg-[#FFFDF8] dark:bg-[#1B1A18] rounded-2xl border border-[#E8E5DE] dark:border-[#292825] p-6 sm:p-8 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-[#F0F3EF] dark:bg-[#1C221D] text-[#7C8B7A] dark:text-[#8FA08E] border border-[#D6DFD4] dark:border-[#2A362B]">
                <Compass className="w-3.5 h-3.5" />
                Personal Journey
              </span>
              <span className="text-xs text-[#686862] dark:text-[#A3A199]">
                Chronological Memory Path
              </span>
            </div>
            <h1 className="font-serif-title text-2xl sm:text-3xl font-normal tracking-tight text-[#171817] dark:text-[#F6F4EE]">
              Your Memory Timeline
            </h1>
            <p className="text-sm text-[#686862] dark:text-[#9E9D96] mt-1 max-w-xl font-normal leading-relaxed">
              Explore your reflections as an evolving personal journey of ideas, realizations, and growth.
            </p>
          </div>

          <button
            onClick={onNewEntryClick}
            className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-[#171817] dark:bg-[#F6F4EE] text-[#FFFDF8] dark:text-[#171817] hover:opacity-90 text-xs font-semibold tracking-wide transition-all shadow-xs cursor-pointer shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span>New Reflection</span>
          </button>
        </div>

        {/* Filter Bar */}
        <div className="mt-6 pt-5 border-t border-[#E8E5DE] dark:border-[#292825] flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
            <span className="text-[#686862] dark:text-[#9E9D96] text-[11px] font-medium mr-1 uppercase tracking-wider">
              Filter:
            </span>
            {allMoods.map((m) => (
              <button
                key={m}
                onClick={() => setSelectedMoodFilter(m)}
                className={`px-3 py-1 rounded-full text-xs font-medium border transition-colors cursor-pointer ${
                  selectedMoodFilter === m
                    ? 'bg-[#171817] dark:bg-[#F6F4EE] text-[#FFFDF8] dark:text-[#171817] border-transparent font-semibold'
                    : 'bg-[#F8F6F0] dark:bg-[#232220] text-[#686862] dark:text-[#A3A199] border-[#E8E5DE] dark:border-[#2B2A27] hover:border-[#7C8B7A]'
                }`}
              >
                {m === 'all' ? 'All Reflections' : m}
              </button>
            ))}
          </div>

          <span className="text-xs text-[#686862] dark:text-[#9E9D96] font-medium">
            {filtered.length} {filtered.length === 1 ? 'memory point' : 'memory points'}
          </span>
        </div>
      </div>

      {/* AI Discovered Connection Highlight if available */}
      {connectionInsights && (
        <div className="bg-[#FAF6ED] dark:bg-[#211E18] rounded-xl border border-[#E6D8B5] dark:border-[#3D331A] p-4 sm:p-5 flex items-start gap-3.5 shadow-2xs">
          <div className="w-8 h-8 rounded-lg bg-[#C5A45D]/15 dark:bg-[#D4B774]/20 text-[#C5A45D] dark:text-[#D4B774] flex items-center justify-center shrink-0 mt-0.5">
            <Sparkles className="w-4 h-4" />
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#C5A45D] dark:text-[#D4B774]">
                AI-Discovered Connection
              </span>
            </div>
            <p className="text-xs sm:text-sm text-[#171817] dark:text-[#F6F4EE] leading-relaxed">
              {connectionInsights.note}
            </p>
          </div>
        </div>
      )}

      {/* Timeline Journey Tree */}
      {timelineGroups.size === 0 ? (
        <div className="bg-[#FFFDF8] dark:bg-[#1B1A18] rounded-2xl border border-[#E8E5DE] dark:border-[#292825] p-10 text-center space-y-4">
          <div className="flex items-center justify-center mx-auto">
            <MindTrailLogo size={42} />
          </div>
          <h3 className="font-serif-title text-xl text-[#171817] dark:text-[#F6F4EE] font-medium">
            Your journey begins with a single memory.
          </h3>
          <p className="text-xs sm:text-sm text-[#686862] dark:text-[#9E9D96] max-w-md mx-auto leading-relaxed">
            As you record reflections, MindTrail will organize them into a living timeline of thoughts, moments, and discoveries.
          </p>
          <button
            onClick={onNewEntryClick}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#171817] dark:bg-[#F6F4EE] text-[#FFFDF8] dark:text-[#171817] text-xs font-medium cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            Write your first reflection
          </button>
        </div>
      ) : (
        <div className="relative pl-4 sm:pl-8 space-y-12">
          {/* Vertical Journey Pathway line */}
          <div className="absolute left-2 sm:left-4 top-4 bottom-4 w-[1.5px] bg-[#E8E5DE] dark:bg-[#2B2A27]" />

          {Array.from(timelineGroups.entries()).map(([year, monthsMap]) => (
            <div key={year} className="relative space-y-8">
              {/* Year Pillar */}
              <div className="flex items-center gap-3 relative -left-4 sm:-left-8">
                <div className="w-8 h-8 rounded-full bg-[#171817] dark:bg-[#F6F4EE] text-[#FFFDF8] dark:text-[#171817] flex items-center justify-center text-xs font-serif-title font-semibold shadow-xs z-10">
                  {year.slice(-2)}
                </div>
                <h2 className="font-serif-title text-2xl font-normal text-[#171817] dark:text-[#F6F4EE] tracking-tight">
                  {year}
                </h2>
              </div>

              {/* Month Branches */}
              <div className="space-y-8 pl-4 sm:pl-6">
                {Array.from(monthsMap.entries()).map(([month, monthEntries]) => (
                  <div key={month} className="relative space-y-4">
                    {/* Month Heading */}
                    <div className="flex items-center gap-2 relative">
                      <div className="w-2.5 h-2.5 rounded-full bg-[#7C8B7A] dark:bg-[#8FA08E] ring-4 ring-[#F8F6F0] dark:ring-[#141312] -left-[23px] sm:-left-[31px] absolute" />
                      <h3 className="text-xs font-semibold uppercase tracking-wider text-[#686862] dark:text-[#A3A199]">
                        {month}
                      </h3>
                      <span className="text-[11px] text-[#8C8B83] dark:text-[#7A7872]">
                        ({monthEntries.length} {monthEntries.length === 1 ? 'entry' : 'entries'})
                      </span>
                    </div>

                    {/* Entries in Month */}
                    <div className="grid grid-cols-1 gap-3.5 pt-1">
                      {monthEntries.map((entry) => {
                        const dateObj = new Date(entry.createdAt);
                        const dayStr = isNaN(dateObj.getTime())
                          ? 'Today'
                          : dateObj.toLocaleDateString('en-US', {
                              weekday: 'short',
                              day: 'numeric',
                            });

                        return (
                          <div
                            key={entry.id}
                            onClick={() => onSelectEntry(entry)}
                            className="group bg-[#FFFDF8] dark:bg-[#1B1A18] rounded-xl border border-[#E8E5DE] dark:border-[#292825] hover:border-[#C5A45D]/60 dark:hover:border-[#D4B774]/60 p-4 sm:p-5 transition-all hover:shadow-sm cursor-pointer relative"
                          >
                            <div className="flex items-center justify-between gap-2 mb-2">
                              <span className="text-[11px] font-mono text-[#8C8B83] dark:text-[#7A7872]">
                                {dayStr}
                              </span>

                              {entry.messages && entry.messages.length > 1 && (
                                <span className="inline-flex items-center gap-1 text-[11px] text-[#C5A45D] dark:text-[#D4B774] font-medium">
                                  <Sparkles className="w-3 h-3" />
                                  <span>{entry.messages.length - 1} Gemini exchanges</span>
                                </span>
                              )}
                            </div>

                            <h4 className="font-serif-title text-base sm:text-lg font-medium text-[#171817] dark:text-[#F6F4EE] group-hover:text-[#C5A45D] dark:group-hover:text-[#D4B774] transition-colors line-clamp-1">
                              {entry.title}
                            </h4>

                            <div className="flex flex-wrap items-center gap-2 mt-1 mb-2 text-xs text-[#686862] dark:text-[#A3A199]">
                              <span className="font-medium text-[#171817] dark:text-[#F6F4EE]">
                                {getEntryDisplayTimestamp(entry)}
                              </span>
                              <span className="text-stone-300 dark:text-stone-700">•</span>
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10.5px] font-medium bg-[#F8F6F0] dark:bg-[#232220] text-[#7C8B7A] dark:text-[#8FA08E] border border-[#E8E5DE] dark:border-[#2B2A27]">
                                {entry.mood}
                              </span>
                              {entry.location?.name && (
                                <>
                                  <span className="text-stone-300 dark:text-stone-700">•</span>
                                  <span className="inline-flex items-center gap-1 text-[11px] text-[#C5A45D] dark:text-[#D4B774] font-medium">
                                    <MapPin className="w-3 h-3 shrink-0" />
                                    <span>{entry.location.name}</span>
                                  </span>
                                </>
                              )}
                            </div>

                            <p className="text-xs text-[#686862] dark:text-[#9E9D96] mt-1.5 line-clamp-2 leading-relaxed">
                              {entry.summarySnippet || entry.originalJournal}
                            </p>

                            <div className="mt-3 pt-2.5 border-t border-[#E8E5DE]/60 dark:border-[#292825]/60 flex items-center justify-between text-[11px] text-[#686862] dark:text-[#A3A199]">
                              <span>Open reflection & conversation</span>
                              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform text-[#7C8B7A] dark:text-[#8FA08E]" />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
