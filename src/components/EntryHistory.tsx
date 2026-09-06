import React, { useState } from 'react';
import { MindTrailLogo } from './MindTrailLogo';
import { Search, Calendar, Tag, Trash2, ArrowRight, BookOpen, Sparkles, Filter, Brain } from 'lucide-react';
import { JournalEntry } from '../types';
import { getEntryDisplayTimestamp } from '../utils/dateUtils';

interface EntryHistoryProps {
  entries: JournalEntry[];
  selectedEntryId: string | null;
  onSelectEntry: (entry: JournalEntry) => void;
  onDeleteEntry: (entryId: string) => Promise<void>;
  onNewEntryClick: () => void;
  onOpenMemories?: () => void;
  activeView?: 'dashboard' | 'journal' | 'timeline' | 'memories' | 'account';
  isLoading: boolean;
}

export const EntryHistory: React.FC<EntryHistoryProps> = ({
  entries,
  selectedEntryId,
  onSelectEntry,
  onDeleteEntry,
  onNewEntryClick,
  onOpenMemories,
  activeView,
  isLoading,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedMoodFilter, setSelectedMoodFilter] = useState<string>('all');
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const moods = ['all', ...Array.from(new Set(entries.map((e) => e.mood).filter(Boolean)))];

  const filteredEntries = entries.filter((entry) => {
    const matchesSearch =
      searchQuery === '' ||
      entry.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      entry.originalJournal.toLowerCase().includes(searchQuery.toLowerCase()) ||
      entry.messages.some((m) => m.text.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesMood = selectedMoodFilter === 'all' || entry.mood === selectedMoodFilter;

    return matchesSearch && matchesMood;
  });

  const handleDelete = async (e: React.MouseEvent, entryId: string) => {
    e.stopPropagation();
    if (window.confirm('Are you sure you want to delete this reflection and all its conversations?')) {
      setDeletingId(entryId);
      try {
        await onDeleteEntry(entryId);
      } finally {
        setDeletingId(null);
      }
    }
  };

  return (
    <div id="entry-history-sidebar" className="w-full flex flex-col h-full bg-[#FFFDF8] dark:bg-[#1B1A18] rounded-2xl border border-[#E8E5DE] dark:border-[#292825] shadow-xs overflow-hidden">
      {/* Sidebar Header */}
      <div className="p-4 sm:p-5 border-b border-[#E8E5DE] dark:border-[#292825]">
        <div className="flex items-center justify-between gap-2 mb-3">
          <div className="flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-[#C5A45D] dark:text-[#D4B774]" />
            <h2 id="history-heading" className="font-serif-title text-lg font-medium text-[#171817] dark:text-[#F6F4EE]">
              Past Reflections
            </h2>
          </div>
          <span
            id="badge-entries-count"
            className="px-2 py-0.5 rounded-full text-xs font-medium bg-[#F8F6F0] dark:bg-[#232220] text-[#686862] dark:text-[#A3A199] border border-[#E8E5DE] dark:border-[#2B2A27]"
          >
            {entries.length}
          </span>
        </div>

        {/* Search input */}
        <div className="relative mb-3">
          <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-[#8C8B83] dark:text-[#7A7872]" />
          <input
            id="input-history-search"
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search entries or insights..."
            className="w-full pl-9 pr-3 py-1.5 rounded-lg border border-[#E8E5DE] dark:border-[#2B2A27] bg-[#F8F6F0]/60 dark:bg-[#201F1D] text-xs text-[#171817] dark:text-[#F6F4EE] focus:outline-none focus:ring-1 focus:ring-[#C5A45D] focus:border-[#C5A45D] placeholder:text-[#8C8B83] dark:placeholder:text-[#7A7872]"
          />
        </div>

        {/* Mood Filter Chips */}
        {moods.length > 1 && (
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar text-[11px]">
            <Filter className="w-3 h-3 text-[#8C8B83] dark:text-[#7A7872] shrink-0" />
            {moods.map((m) => (
              <button
                key={m}
                onClick={() => setSelectedMoodFilter(m)}
                className={`px-2.5 py-0.5 rounded-full border whitespace-nowrap transition-colors cursor-pointer ${
                  selectedMoodFilter === m
                    ? 'bg-[#171817] dark:bg-[#F6F4EE] text-[#FFFDF8] dark:text-[#171817] border-transparent font-medium'
                    : 'bg-[#F8F6F0] dark:bg-[#232220] text-[#686862] dark:text-[#A3A199] border-[#E8E5DE] dark:border-[#2B2A27] hover:border-[#7C8B7A]'
                }`}
              >
                {m === 'all' ? 'All Moods' : m}
              </button>
            ))}
          </div>
        )}

        {/* Ask My Memories Quick Spotlight */}
        {onOpenMemories && (
          <button
            id="sidebar-btn-ask-memories"
            onClick={onOpenMemories}
            className={`w-full mt-3 p-2.5 rounded-xl border text-left flex items-center justify-between transition-all cursor-pointer ${
              activeView === 'memories'
                ? 'bg-[#171817] text-[#FFFDF8] border-[#171817] shadow-xs'
                : 'bg-[#FAF6ED] dark:bg-[#211E18] hover:bg-[#F5EEDC] dark:hover:bg-[#29251D] border-[#E6D8B5] dark:border-[#3D331A] text-[#171817] dark:text-[#F6F4EE]'
            }`}
          >
            <div className="flex items-center gap-2.5 min-w-0">
              <div
                className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${
                  activeView === 'memories'
                    ? 'bg-[#292825] text-[#D4B774]'
                    : 'bg-[#FFFDF8] dark:bg-[#1B1A18] text-[#C5A45D] dark:text-[#D4B774] border border-[#E6D8B5] dark:border-[#3D331A]'
                }`}
              >
                <Brain className="w-4 h-4" />
              </div>
              <div className="truncate">
                <span className="text-xs font-semibold block leading-tight">Ask My Memories</span>
                <span
                  className={`text-[10px] block truncate ${
                    activeView === 'memories' ? 'text-stone-300' : 'text-[#686862] dark:text-[#A3A199]'
                  }`}
                >
                  Insights from {entries.length} reflections
                </span>
              </div>
            </div>
            <ArrowRight
              className={`w-3.5 h-3.5 shrink-0 ${
                activeView === 'memories' ? 'text-[#D4B774]' : 'text-[#C5A45D] dark:text-[#D4B774]'
              }`}
            />
          </button>
        )}
      </div>

      {/* List of Entries */}
      <div id="history-items-list" className="flex-1 overflow-y-auto divide-y divide-[#E8E5DE]/60 dark:divide-[#292825]/60 p-2 space-y-1">
        {isLoading && entries.length === 0 ? (
          <div className="py-12 text-center text-xs text-[#8C8B83] dark:text-[#7A7872] flex flex-col items-center gap-2">
            <div className="w-5 h-5 border-2 border-[#E8E5DE] dark:border-[#292825] border-t-[#C5A45D] rounded-full animate-spin" />
            <span>Loading reflections from Firestore...</span>
          </div>
        ) : filteredEntries.length === 0 ? (
          <div className="py-12 px-4 text-center">
            <div className="flex items-center justify-center mx-auto mb-2.5 opacity-60">
              <MindTrailLogo size={28} />
            </div>
            <p className="text-xs font-medium text-[#171817] dark:text-[#F6F4EE] mb-1">
              {searchQuery || selectedMoodFilter !== 'all' ? 'No matching reflections' : 'No reflections yet'}
            </p>
            <p className="text-[11px] text-[#686862] dark:text-[#9E9D96] mb-4">
              {searchQuery || selectedMoodFilter !== 'all'
                ? 'Try adjusting your search terms or mood filter.'
                : 'Write your first journal reflection and converse with Gemini.'}
            </p>
            <button
              onClick={onNewEntryClick}
              className="px-3.5 py-1.5 rounded-xl bg-[#171817] dark:bg-[#F6F4EE] text-[#FFFDF8] dark:text-[#171817] text-xs font-medium hover:opacity-90 transition-opacity cursor-pointer"
            >
              Start First Entry
            </button>
          </div>
        ) : (
          filteredEntries.map((entry) => {
            const isSelected = selectedEntryId === entry.id;
            return (
              <div
                key={entry.id}
                id={`history-entry-item-${entry.id}`}
                onClick={() => onSelectEntry(entry)}
                className={`group rounded-xl p-3 text-left transition-all cursor-pointer border ${
                  isSelected
                    ? 'bg-[#FAF6ED] dark:bg-[#232018] border-[#E6D8B5] dark:border-[#3D331A] shadow-xs'
                    : 'bg-[#FFFDF8] dark:bg-[#1B1A18] hover:bg-[#F8F6F0] dark:hover:bg-[#22211E] border-transparent hover:border-[#E8E5DE] dark:hover:border-[#292825]'
                }`}
              >
                <div className="flex items-start justify-between gap-2 mb-1.5">
                  <span className="inline-flex items-center gap-1 text-[10px] font-medium px-2 py-0.5 rounded-full bg-[#F8F6F0] dark:bg-[#232220] text-[#7C8B7A] dark:text-[#8FA08E] border border-[#E8E5DE] dark:border-[#2B2A27]">
                    <Tag className="w-2.5 h-2.5 text-[#7C8B7A] dark:text-[#8FA08E]" />
                    {entry.mood}
                  </span>
                  <div className="flex items-center gap-1">
                    <span className="text-[10px] text-[#8C8B83] dark:text-[#7A7872]">
                      {new Date(entry.createdAt).toLocaleDateString([], {
                        month: 'numeric',
                        day: 'numeric',
                      })}
                    </span>
                    <button
                      id={`btn-delete-entry-${entry.id}`}
                      onClick={(e) => handleDelete(e, entry.id)}
                      disabled={deletingId === entry.id}
                      className="opacity-0 group-hover:opacity-100 p-1 rounded text-[#8C8B83] hover:text-rose-600 dark:hover:text-rose-400 transition-all cursor-pointer"
                      title="Delete reflection"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                </div>

                <h3 className="font-serif-title text-sm font-medium text-[#171817] dark:text-[#F6F4EE] line-clamp-1 group-hover:text-[#C5A45D] dark:group-hover:text-[#D4B774] transition-colors">
                  {entry.title}
                </h3>

                <div className="text-[10px] text-[#8C8B83] dark:text-[#7A7872] mt-0.5 mb-1 flex items-center gap-1">
                  <span>{getEntryDisplayTimestamp(entry)}</span>
                </div>

                <p className="text-xs text-[#686862] dark:text-[#9E9D96] line-clamp-2 mt-1 leading-relaxed">
                  {entry.originalJournal}
                </p>

                <div className="flex items-center justify-between mt-2 pt-2 border-t border-[#E8E5DE]/60 dark:border-[#292825]/60 text-[10px] text-[#8C8B83] dark:text-[#7A7872]">
                  <span>{entry.messages.length} message{entry.messages.length !== 1 ? 's' : ''}</span>
                  <span className="flex items-center gap-0.5 text-[#686862] dark:text-[#9E9D96] group-hover:text-[#C5A45D] dark:group-hover:text-[#D4B774] font-medium">
                    <span>Open</span>
                    <ArrowRight className="w-2.5 h-2.5" />
                  </span>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
