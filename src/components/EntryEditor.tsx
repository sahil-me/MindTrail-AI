import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  Lightbulb,
  FileText,
  MessageSquare,
  Compass,
  Send,
  Check,
  MapPin,
  Search,
  X,
  ChevronDown,
  ChevronUp,
  Shield,
  Loader2,
} from 'lucide-react';
import { ReflectionMode, EntryLocation } from '../types';
import { searchPlaces } from '../utils/locationService';
import { formatLocalDate, formatLocalTime } from '../utils/dateUtils';

interface EntryEditorProps {
  onSubmit: (
    title: string,
    journalText: string,
    mood: string,
    mode: ReflectionMode,
    location?: EntryLocation
  ) => Promise<void>;
  isSubmitting: boolean;
  initialTitle?: string;
  initialJournalText?: string;
}

const MOOD_OPTIONS = [
  { label: 'Calm', subtitle: 'Serene & Centered' },
  { label: 'Curious', subtitle: 'Inquiring & Open' },
  { label: 'Grateful', subtitle: 'Appreciative & Warm' },
  { label: 'Focused', subtitle: 'Grounded & Clear' },
  { label: 'Reflective', subtitle: 'Thoughtful & Observant' },
  { label: 'Challenging', subtitle: 'Working Through Resistance' },
];

const REFLECTION_MODES: { id: ReflectionMode; label: string; icon: React.ReactNode; desc: string }[] = [
  {
    id: 'deep_reflection',
    label: 'Deep Inquiry',
    icon: <Sparkles className="w-4 h-4 text-[#C5A45D] dark:text-[#D4B774]" />,
    desc: 'Thoughtful emotional analysis & introspective questions',
  },
  {
    id: 'brainstorm',
    label: 'Brainstorm & Action',
    icon: <Lightbulb className="w-4 h-4 text-[#7C8B7A] dark:text-[#8FA08E]" />,
    desc: 'Creative reframings, alternative paths & actionable steps',
  },
  {
    id: 'summary',
    label: 'Executive Summary',
    icon: <FileText className="w-4 h-4 text-[#C5A45D] dark:text-[#D4B774]" />,
    desc: 'Synthesis of key themes, core feelings & daily affirmation',
  },
  {
    id: 'chat',
    label: 'Open Dialogue',
    icon: <MessageSquare className="w-4 h-4 text-[#7C8B7A] dark:text-[#8FA08E]" />,
    desc: 'Warm conversational exchange exploring the entry',
  },
];

const PROMPT_STARTERS = [
  'What moment brought you the most unexpected clarity or quiet joy today?',
  'What unresolved friction or decision is occupying your mental space right now?',
  'What is one boundary, realization, or learning you want to preserve for your future self?',
];

export const EntryEditor: React.FC<EntryEditorProps> = ({
  onSubmit,
  isSubmitting,
  initialTitle = '',
  initialJournalText = '',
}) => {
  const [title, setTitle] = useState(initialTitle);
  const [journalText, setJournalText] = useState(initialJournalText);

  useEffect(() => {
    if (initialTitle) setTitle(initialTitle);
  }, [initialTitle]);

  useEffect(() => {
    if (initialJournalText) setJournalText(initialJournalText);
  }, [initialJournalText]);
  const [mood, setMood] = useState('Calm');
  const [mode, setMode] = useState<ReflectionMode>('deep_reflection');
  const [location, setLocation] = useState<EntryLocation | null>(null);
  const [locationMode, setLocationMode] = useState<'idle' | 'search'>('idle');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<EntryLocation[]>([]);
  const [isSearchingPlaces, setIsSearchingPlaces] = useState(false);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [validationError, setValidationError] = useState<string | null>(null);

  // Automatic Context: Date & Time in user's local timezone
  const [currentLocalDate, setCurrentLocalDate] = useState(() => formatLocalDate());
  const [currentLocalTime, setCurrentLocalTime] = useState(() => formatLocalTime());

  useEffect(() => {
    const updateTime = () => {
      setCurrentLocalDate(formatLocalDate());
      setCurrentLocalTime(formatLocalTime());
    };
    const timer = setInterval(updateTime, 10000);
    return () => clearInterval(timer);
  }, []);

  // Debounced search for places
  useEffect(() => {
    if (!searchQuery.trim() || locationMode !== 'search') {
      setSearchResults([]);
      return;
    }
    const timer = setTimeout(async () => {
      setIsSearchingPlaces(true);
      setLocationError(null);
      try {
        const results = await searchPlaces(searchQuery);
        setSearchResults(results);
      } catch (err: any) {
        console.warn('[Search places err]:', err);
      } finally {
        setIsSearchingPlaces(false);
      }
    }, 400);
    return () => clearTimeout(timer);
  }, [searchQuery, locationMode]);

  const handleSelectPlace = (place: EntryLocation) => {
    setLocation(place);
    setLocationMode('idle');
    setSearchQuery('');
    setSearchResults([]);
  };

  const handleRemoveLocation = () => {
    setLocation(null);
    setLocationMode('idle');
    setSearchQuery('');
    setLocationError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!journalText.trim()) {
      setValidationError('Please write your thoughts or reflection before submitting.');
      return;
    }
    setValidationError(null);

    const entryTitle =
      title.trim() ||
      `Reflection on ${new Date().toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      })}`;
    await onSubmit(entryTitle, journalText.trim(), mood, mode, location || undefined);
  };

  const applyPrompt = (prompt: string) => {
    if (journalText) {
      setJournalText((prev) => `${prev}\n\n${prompt}\n`);
    } else {
      setJournalText(`${prompt}\n`);
    }
  };

  return (
    <div id="entry-editor-container" className="w-full max-w-3xl mx-auto animate-in fade-in duration-300">
      <div className="bg-[#FFFDF8] dark:bg-[#1B1A18] rounded-2xl border border-[#E8E5DE] dark:border-[#292825] shadow-xs p-6 sm:p-10 transition-colors">
        {/* Editor Title & Context */}
        <div className="mb-8 pb-6 border-b border-[#E8E5DE] dark:border-[#292825]">
          <div className="flex items-center justify-between gap-2 mb-2">
            <span className="text-[10px] tracking-widest uppercase font-semibold text-[#7C8B7A] dark:text-[#8FA08E]">
              Private Notebook
            </span>
            <span className="text-[11px] text-[#8C8B83] dark:text-[#7A7872] font-mono">
              Auto-persisted to Firestore
            </span>
          </div>
          <h1
            id="editor-heading"
            className="font-serif-title text-2xl sm:text-3xl text-[#171817] dark:text-[#F6F4EE] font-normal tracking-tight"
          >
            New Reflection
          </h1>
          <p className="text-xs sm:text-sm text-[#686862] dark:text-[#9E9D96] mt-1 font-normal leading-relaxed">
            Record what you are experiencing. Choose an emotional theme and how Gemini will reflect back with you.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-7">
          {/* Entry Title */}
          <div>
            <label
              htmlFor="input-entry-title"
              className="block text-[11px] font-semibold text-[#171817] dark:text-[#F6F4EE] uppercase tracking-wider mb-2"
            >
              Title
            </label>
            <input
              id="input-entry-title"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="My First MindTrail Memory"
              className="w-full px-4 py-3 rounded-xl border border-[#E8E5DE] dark:border-[#292825] bg-[#F8F6F0]/60 dark:bg-[#151413] text-[#171817] dark:text-[#F6F4EE] text-sm focus:outline-none focus:ring-1 focus:ring-[#C5A45D] focus:border-[#C5A45D] transition-all placeholder:text-[#8C8B83] dark:placeholder:text-[#7A7872]"
              disabled={isSubmitting}
            />
          </div>

          {/* How are you feeling? / Mood Selector */}
          <div>
            <div className="flex items-center justify-between mb-2.5">
              <label
                id="label-mood-selector"
                className="block text-[11px] font-semibold text-[#171817] dark:text-[#F6F4EE] uppercase tracking-wider"
              >
                How are you feeling?
              </label>
              <span className="text-xs text-[#7C8B7A] dark:text-[#8FA08E] font-medium">
                {mood}
              </span>
            </div>
            <div className="flex flex-wrap gap-2">
              {MOOD_OPTIONS.map((item) => (
                <button
                  key={item.label}
                  type="button"
                  id={`btn-mood-${item.label.toLowerCase()}`}
                  onClick={() => setMood(item.label)}
                  className={`px-3.5 py-1.5 rounded-full text-xs font-medium border transition-all cursor-pointer ${
                    mood === item.label
                      ? 'bg-[#171817] dark:bg-[#F6F4EE] text-[#FFFDF8] dark:text-[#171817] border-transparent font-semibold shadow-2xs'
                      : 'bg-[#F8F6F0] dark:bg-[#232220] text-[#686862] dark:text-[#A3A199] border-[#E8E5DE] dark:border-[#2B2A27] hover:border-[#7C8B7A]'
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>

          {/* Context Section: Automatic Date/Time & Optional Location */}
          <div id="section-entry-context" className="rounded-xl border border-[#E8E5DE] dark:border-[#292825] bg-[#F8F6F0]/50 dark:bg-[#181716] p-4 transition-all space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#E8E5DE]/80 dark:border-[#292825]/80">
              <span className="text-[11px] font-semibold text-[#171817] dark:text-[#F6F4EE] uppercase tracking-wider">
                Context
              </span>
              <span className="text-[11px] text-[#8C8B83] dark:text-[#7A7872] font-mono">
                Local Timeline
              </span>
            </div>

            {/* Automatic Date & Time (Clean Journal-Style Presentation) */}
            <div className="grid grid-cols-2 gap-4 pb-3.5 border-b border-[#E8E5DE]/80 dark:border-[#292825]/80">
              <div id="context-field-date">
                <span className="text-[10px] font-semibold tracking-wider uppercase text-[#8C8B83] dark:text-[#7A7872] block mb-1">
                  DATE
                </span>
                <span className="font-serif-title text-sm sm:text-base font-medium text-[#171817] dark:text-[#F6F4EE]">
                  {currentLocalDate}
                </span>
              </div>

              <div id="context-field-time">
                <span className="text-[10px] font-semibold tracking-wider uppercase text-[#8C8B83] dark:text-[#7A7872] block mb-1">
                  TIME
                </span>
                <span className="font-serif-title text-sm sm:text-base font-medium text-[#171817] dark:text-[#F6F4EE]">
                  {currentLocalTime}
                </span>
              </div>
            </div>

            {/* Optional Location */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-medium text-[#171817] dark:text-[#F6F4EE] flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-[#C5A45D] dark:text-[#D4B774]" />
                  <span>Add Location</span>
                </span>
                <span className="text-[11px] text-[#8C8B83] dark:text-[#7A7872]">
                  Optional
                </span>
              </div>

              {/* Location options: Search for a Place ONLY */}
              {location ? (
                <div className="flex items-center justify-between p-2.5 rounded-xl border border-[#E6D8B5] dark:border-[#423924] bg-[#FAF6ED] dark:bg-[#2A2418]">
                  <div className="flex items-center gap-2 text-xs">
                    <MapPin className="w-3.5 h-3.5 text-[#C5A45D] dark:text-[#D4B774] shrink-0" />
                    <div>
                      <span className="font-medium text-[#171817] dark:text-[#F6F4EE]">{location.name}</span>
                      {location.address && (
                        <span className="text-[11px] text-[#8C8B83] dark:text-[#7A7872] block truncate max-w-xs">{location.address}</span>
                      )}
                    </div>
                  </div>
                  <button
                    id="btn-remove-location"
                    type="button"
                    onClick={handleRemoveLocation}
                    className="p-1 hover:bg-[#F0E6D0] dark:hover:bg-[#383120] rounded text-[#8C8B83] hover:text-red-500 transition-colors cursor-pointer"
                    title="Remove location"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              ) : (
                <div>
                  <button
                    id="btn-search-place"
                    type="button"
                    onClick={() => setLocationMode(locationMode === 'search' ? 'idle' : 'search')}
                    className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-medium transition-colors cursor-pointer ${
                      locationMode === 'search'
                        ? 'border-[#C5A45D] bg-[#FAF6ED] dark:bg-[#282318] text-[#171817] dark:text-[#F6F4EE]'
                        : 'border-[#E8E5DE] dark:border-[#2B2A27] bg-[#FFFDF8] dark:bg-[#201F1D] text-[#171817] dark:text-[#F6F4EE] hover:bg-[#F2EFE8] dark:hover:bg-[#282724]'
                    }`}
                  >
                    <Search className="w-3.5 h-3.5 text-[#7C8B7A] dark:text-[#8FA08E]" />
                    <span>Search for a Place</span>
                  </button>

                  {/* Place search input and results */}
                  {locationMode === 'search' && (
                    <div className="mt-3 space-y-2">
                      <div className="relative">
                        <input
                          id="input-search-place"
                          type="text"
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          placeholder="Search city, neighborhood, or landmark (e.g., Kyoto, Central Park)..."
                          className="w-full px-3.5 py-2 pl-9 text-xs rounded-xl border border-[#E8E5DE] dark:border-[#292825] bg-[#FFFDF8] dark:bg-[#1E1D1B] text-[#171817] dark:text-[#F6F4EE] focus:outline-none focus:ring-1 focus:ring-[#C5A45D]"
                          autoFocus
                        />
                        <Search className="w-3.5 h-3.5 text-stone-400 absolute left-3 top-2.5" />
                        {isSearchingPlaces && (
                          <Loader2 className="w-3.5 h-3.5 text-[#C5A45D] absolute right-3 top-2.5 animate-spin" />
                        )}
                      </div>

                      {/* Results list */}
                      {searchResults.length > 0 && (
                        <div className="rounded-xl border border-[#E8E5DE] dark:border-[#292825] bg-[#FFFDF8] dark:bg-[#1E1D1B] divide-y divide-stone-100 dark:divide-stone-800 max-h-48 overflow-y-auto shadow-xs">
                          {searchResults.map((item, idx) => (
                            <button
                              key={idx}
                              type="button"
                              onClick={() => handleSelectPlace(item)}
                              className="w-full text-left p-2.5 hover:bg-[#FAF6ED] dark:hover:bg-[#24211A] transition-colors flex items-start gap-2 text-xs cursor-pointer"
                            >
                              <MapPin className="w-3.5 h-3.5 text-[#C5A45D] shrink-0 mt-0.5" />
                              <div>
                                <div className="font-medium text-[#171817] dark:text-[#F6F4EE]">{item.name}</div>
                                {item.address && (
                                  <div className="text-[11px] text-[#8C8B83] dark:text-[#7A7872] line-clamp-1">{item.address}</div>
                                )}
                              </div>
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  )}

                  {locationError && (
                    <p className="text-xs text-rose-600 dark:text-rose-400 mt-2">
                      {locationError}
                    </p>
                  )}
                </div>
              )}

              {/* Privacy Note */}
              <div className="mt-3 flex items-center gap-1.5 text-[11px] text-[#7C8B7A] dark:text-[#8FA08E]">
                <Shield className="w-3 h-3 shrink-0" />
                <span>Location is optional and saved only with this private memory.</span>
              </div>
            </div>
          </div>

          {/* Reflection Body Textarea */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label
                htmlFor="textarea-journal-body"
                className="block text-[11px] font-semibold text-[#171817] dark:text-[#F6F4EE] uppercase tracking-wider"
              >
                Your reflection
              </label>
              <span className="text-xs text-[#8C8B83] dark:text-[#7A7872] font-mono">
                {journalText.length} characters
              </span>
            </div>
            <div className="relative rounded-2xl border border-[#E8E5DE] dark:border-[#292825] overflow-hidden bg-[#F8F6F0]/40 dark:bg-[#151413] focus-within:ring-1 focus-within:ring-[#C5A45D] focus-within:border-[#C5A45D] transition-all">
              <textarea
                id="textarea-journal-body"
                rows={9}
                value={journalText}
                onChange={(e) => {
                  setJournalText(e.target.value);
                  if (validationError) setValidationError(null);
                }}
                placeholder="Write freely here... What happened? What thoughts, shifts, or questions are present right now?"
                className="w-full px-5 py-4 bg-transparent text-[#171817] dark:text-[#F6F4EE] text-sm sm:text-base leading-relaxed focus:outline-none placeholder:text-[#8C8B83] dark:placeholder:text-[#7A7872] resize-y"
                disabled={isSubmitting}
              />
            </div>
            {validationError && (
              <p id="editor-validation-error" className="text-xs text-rose-600 dark:text-rose-400 mt-2 font-medium">
                {validationError}
              </p>
            )}
          </div>

          {/* Prompt Starters */}
          <div className="p-4 rounded-xl bg-[#FAF6ED]/70 dark:bg-[#201C16] border border-[#E6D8B5] dark:border-[#38311F]">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-[#C5A45D] dark:text-[#D4B774] mb-2 uppercase tracking-wider">
              <Compass className="w-3.5 h-3.5" />
              <span>Prompt Inquiries</span>
            </div>
            <div className="flex flex-col gap-1.5">
              {PROMPT_STARTERS.map((prompt, idx) => (
                <button
                  key={idx}
                  type="button"
                  id={`btn-starter-${idx}`}
                  onClick={() => applyPrompt(prompt)}
                  className="text-left text-xs text-[#686862] dark:text-[#A3A199] hover:text-[#171817] dark:hover:text-[#F6F4EE] hover:bg-[#FFFDF8] dark:hover:bg-[#282724] p-2 rounded-lg transition-colors cursor-pointer border border-transparent hover:border-[#E8E5DE] dark:hover:border-[#2B2A27]"
                >
                  "{prompt}"
                </button>
              ))}
            </div>
          </div>

          {/* AI Companion Section */}
          <div className="pt-2">
            <div className="mb-3">
              <span className="text-[10px] tracking-widest uppercase font-semibold text-[#C5A45D] dark:text-[#D4B774]">
                AI COMPANION
              </span>
              <h2 className="text-xs font-semibold text-[#171817] dark:text-[#F6F4EE] uppercase tracking-wider mt-0.5">
                Choose how Gemini can help:
              </h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {REFLECTION_MODES.map((m) => (
                <button
                  key={m.id}
                  type="button"
                  id={`btn-mode-${m.id}`}
                  onClick={() => setMode(m.id)}
                  className={`p-3.5 rounded-xl text-left border transition-all cursor-pointer flex flex-col justify-between ${
                    mode === m.id
                      ? 'border-[#C5A45D] dark:border-[#D4B774] bg-[#FAF6ED] dark:bg-[#221F17] shadow-2xs'
                      : 'border-[#E8E5DE] dark:border-[#292825] bg-[#FFFDF8] dark:bg-[#1E1D1B] hover:border-[#7C8B7A]'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <div className="flex items-center gap-2">
                      {m.icon}
                      <span className="text-xs font-semibold text-[#171817] dark:text-[#F6F4EE]">
                        {m.label}
                      </span>
                    </div>
                    {mode === m.id && (
                      <Check className="w-3.5 h-3.5 text-[#C5A45D] dark:text-[#D4B774]" />
                    )}
                  </div>
                  <span className="text-[11px] text-[#686862] dark:text-[#9E9D96] leading-snug">
                    {m.desc}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Submit Action */}
          <div className="pt-4 flex items-center justify-end gap-3 border-t border-[#E8E5DE] dark:border-[#292825]">
            <button
              id="btn-submit-reflection"
              type="submit"
              disabled={isSubmitting || !journalText.trim()}
              className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-[#171817] dark:bg-[#F6F4EE] text-[#FFFDF8] dark:text-[#171817] hover:opacity-90 font-semibold text-xs tracking-wide disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-xs cursor-pointer active:scale-98"
            >
              {isSubmitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-stone-400 border-t-white dark:border-stone-600 dark:border-t-black rounded-full animate-spin" />
                  <span>Reflecting with Gemini...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-3.5 h-3.5 text-[#C5A45D] dark:text-[#D4B774]" />
                  <span>Reflect with Gemini</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

