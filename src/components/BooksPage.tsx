import React, { useState, useEffect, useCallback } from 'react';
import {
  Library,
  Search,
  ExternalLink,
  BookOpen,
  PenTool,
  Sparkles,
  Loader2,
  Shield,
  ArrowRight,
  Compass,
  Bookmark,
} from 'lucide-react';
import { JournalEntry, BookRecommendation } from '../types';
import { searchReflectiveBooks } from '../utils/googleServices';

interface BooksPageProps {
  entries: JournalEntry[];
  onReflectOnBook: (bookTitle: string, author: string) => void;
  onBackToJournal: () => void;
}

const CURATED_THEMES = [
  { id: 'resilience', label: 'Resilience & Stoicism', query: 'stoicism resilience philosophy' },
  { id: 'mindfulness', label: 'Mindfulness & Inner Peace', query: 'mindfulness inner peace presence' },
  { id: 'meaning', label: 'Finding Meaning & Purpose', query: 'finding meaning purpose introspection' },
  { id: 'writing', label: 'Creative Writing & Journaling', query: 'journaling creative writing reflection' },
  { id: 'habits', label: 'Habits & Daily Practice', query: 'habits intentional daily practice' },
  { id: 'nature', label: 'Nature & Solitude', query: 'nature solitude contemplative living' },
  { id: 'clarity', label: 'Clarity & Self-Discovery', query: 'self discovery emotional intelligence' },
];

export const BooksPage: React.FC<BooksPageProps> = ({
  entries,
  onReflectOnBook,
  onBackToJournal,
}) => {
  const [selectedTheme, setSelectedTheme] = useState<string>('mindfulness');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [activeQuery, setActiveQuery] = useState<string>('mindfulness inner peace presence');
  const [books, setBooks] = useState<BookRecommendation[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Discover dominant moods from recent entries for personalized theme suggestions
  const recentMoods = React.useMemo(() => {
    const moods = entries.map((e) => e.mood).filter(Boolean);
    const counts: Record<string, number> = {};
    for (const m of moods) {
      counts[m] = (counts[m] || 0) + 1;
    }
    return Object.keys(counts).slice(0, 3);
  }, [entries]);

  const loadBooks = useCallback(async (query: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const results = await searchReflectiveBooks(query, 12);
      if (results && results.length > 0) {
        setBooks(results);
      } else {
        const fallback = await searchReflectiveBooks('', 12);
        setBooks(fallback);
      }
    } catch (err: any) {
      console.warn('[BooksPage Graceful Recovery]:', err);
      try {
        const fallback = await searchReflectiveBooks('', 12);
        setBooks(fallback);
      } catch {
        setError('Unable to load book recommendations. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Initial load
  useEffect(() => {
    loadBooks(activeQuery);
  }, [activeQuery, loadBooks]);

  const handleSelectTheme = (theme: typeof CURATED_THEMES[0]) => {
    setSelectedTheme(theme.id);
    setSearchQuery('');
    setActiveQuery(theme.query);
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const q = searchQuery.trim();
    if (!q) return;
    setSelectedTheme('');
    setActiveQuery(q);
  };

  return (
    <div id="reflective-reading-page" className="w-full max-w-6xl mx-auto space-y-8 animate-in fade-in duration-300">
      {/* Editorial Page Header */}
      <div className="text-center max-w-2xl mx-auto space-y-3 pt-2">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-[#FAF6ED] dark:bg-[#232018] text-[#C5A45D] dark:text-[#D4B774] border border-[#E6D8B5] dark:border-[#423924]">
          <Library className="w-3.5 h-3.5" />
          <span>Reflective Reading</span>
        </div>
        <h1 className="font-serif-title text-3xl sm:text-4xl font-semibold text-[#171817] dark:text-[#F6F4EE] tracking-tight">
          Books for Reflection & Growth
        </h1>
        <p className="text-sm text-[#686862] dark:text-[#A3A199] leading-relaxed">
          Discover contemplative works matching your reflective themes, emotional patterns, and inner journey.
        </p>
      </div>

      {/* Theme selection pills & Search input */}
      <div className="space-y-4 max-w-4xl mx-auto">
        {/* Search bar */}
        <form onSubmit={handleSearchSubmit} className="relative">
          <input
            id="input-search-books"
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search books for reflection... (e.g., mindfulness, clarity, stillness, solitude)"
            className="w-full px-4 py-3 pl-11 pr-24 rounded-2xl border border-[#E8E5DE] dark:border-[#292825] bg-[#FFFDF8] dark:bg-[#1B1A18] text-sm text-[#171817] dark:text-[#F6F4EE] placeholder:text-[#8C8B83] dark:placeholder:text-[#7A7872] focus:outline-none focus:ring-2 focus:ring-[#C5A45D]/30 focus:border-[#C5A45D] shadow-2xs transition-all"
          />
          <Search className="w-4 h-4 text-[#8C8B83] dark:text-[#7A7872] absolute left-4 top-3.5" />
          <button
            id="btn-search-books-submit"
            type="submit"
            className="absolute right-2 top-2 px-3.5 py-1.5 rounded-xl bg-[#171817] dark:bg-[#F6F4EE] text-[#FFFDF8] dark:text-[#171817] text-xs font-semibold hover:opacity-90 transition-opacity cursor-pointer"
          >
            Explore
          </button>
        </form>

        {/* Curated Theme Pills */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-[#686862] dark:text-[#A3A199] uppercase tracking-wider">
              Curated Reflective Themes
            </span>
            {recentMoods.length > 0 && (
              <span className="text-[11px] text-[#7C8B7A] dark:text-[#8FA08E] font-medium hidden sm:inline">
                Tailored for your journal journey
              </span>
            )}
          </div>
          <div className="flex flex-wrap gap-2">
            {CURATED_THEMES.map((theme) => (
              <button
                key={theme.id}
                id={`pill-theme-${theme.id}`}
                type="button"
                onClick={() => handleSelectTheme(theme)}
                className={`px-3 py-1.5 rounded-xl text-xs font-medium border transition-all cursor-pointer ${
                  selectedTheme === theme.id
                    ? 'bg-[#171817] dark:bg-[#F6F4EE] text-[#FFFDF8] dark:text-[#171817] border-transparent shadow-2xs'
                    : 'bg-[#FFFDF8] dark:bg-[#1B1A18] text-[#686862] dark:text-[#A3A199] border-[#E8E5DE] dark:border-[#292825] hover:border-[#7C8B7A]'
                }`}
              >
                {theme.label}
              </button>
            ))}
          </div>
        </div>

        {/* Privacy Note */}
        <div className="flex items-center gap-2 text-xs text-[#7C8B7A] dark:text-[#8FA08E] pt-1">
          <Shield className="w-3.5 h-3.5 shrink-0" />
          <span>
            <strong>Private by design:</strong> MindTrail searches Google Books using only broad themes or your search query. Your personal journal entries are never shared.
          </span>
        </div>
      </div>

      {/* Book Grid */}
      <div>
        {isLoading ? (
          <div id="books-loading-indicator" className="py-20 flex flex-col items-center justify-center gap-3 text-[#686862] dark:text-[#A3A199]">
            <Loader2 className="w-6 h-6 animate-spin text-[#C5A45D]" />
            <p className="text-xs font-medium">Curating reflective titles from Google Books...</p>
          </div>
        ) : error ? (
          <div className="py-16 text-center max-w-md mx-auto space-y-3">
            <p className="text-sm text-rose-600 dark:text-rose-400">{error}</p>
            <button
              onClick={() => loadBooks(activeQuery)}
              className="px-4 py-2 rounded-xl text-xs font-semibold bg-[#171817] dark:bg-[#F6F4EE] text-[#FFFDF8] dark:text-[#171817] cursor-pointer"
            >
              Retry
            </button>
          </div>
        ) : books.length === 0 ? (
          <div className="py-16 text-center max-w-md mx-auto space-y-3">
            <Bookmark className="w-8 h-8 text-stone-300 dark:text-stone-700 mx-auto" />
            <h3 className="font-serif-title text-lg font-medium text-[#171817] dark:text-[#F6F4EE]">
              No titles found
            </h3>
            <p className="text-xs text-[#686862] dark:text-[#A3A199]">
              Try searching with broader terms like "mindfulness", "stoicism", or "solitude".
            </p>
          </div>
        ) : (
          <div id="books-results-grid" className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {books.map((book) => {
              const primaryAuthor = book.authors[0] || 'Unknown Author';
              return (
                <div
                  key={book.id}
                  id={`book-card-${book.id}`}
                  className="rounded-2xl border border-[#E8E5DE] dark:border-[#292825] bg-[#FFFDF8] dark:bg-[#1B1A18] hover:border-[#C5A45D]/60 dark:hover:border-[#D4B774]/60 p-5 flex flex-col justify-between transition-all hover:shadow-xs group"
                >
                  <div className="space-y-3.5">
                    <div className="flex gap-4 items-start">
                      {/* Book Thumbnail */}
                      <div className="w-16 h-24 sm:w-20 sm:h-28 rounded-lg overflow-hidden bg-[#F2EFE8] dark:bg-[#252422] border border-[#E8E5DE] dark:border-[#2B2A27] shrink-0 shadow-2xs flex items-center justify-center">
                        {book.thumbnail ? (
                          <img
                            src={book.thumbnail}
                            alt={book.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                            referrerPolicy="no-referrer"
                          />
                        ) : (
                          <BookOpen className="w-6 h-6 text-stone-400 dark:text-stone-600" />
                        )}
                      </div>

                      {/* Title & Authors */}
                      <div className="flex-1 min-w-0">
                        <h3 className="font-serif-title text-base font-semibold text-[#171817] dark:text-[#F6F4EE] line-clamp-2 leading-snug group-hover:text-[#C5A45D] dark:group-hover:text-[#D4B774] transition-colors">
                          {book.title}
                        </h3>
                        <p className="text-xs text-[#7C8B7A] dark:text-[#8FA08E] font-medium mt-1 truncate">
                          {book.authors.join(', ') || 'Unknown Author'}
                        </p>
                        {book.publishedDate && (
                          <p className="text-[11px] text-[#8C8B83] dark:text-[#7A7872] mt-0.5">
                            {book.publishedDate.slice(0, 4)}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Short Description */}
                    <p className="text-xs text-[#686862] dark:text-[#9E9D96] line-clamp-3 leading-relaxed">
                      {book.description || 'A recommended reflective title exploring personal clarity, resilience, and inner growth.'}
                    </p>
                  </div>

                  {/* Actions */}
                  <div className="pt-4 mt-3 border-t border-[#E8E5DE]/70 dark:border-[#292825]/70 flex items-center justify-between gap-2">
                    <button
                      id={`btn-reflect-book-${book.id}`}
                      type="button"
                      onClick={() => onReflectOnBook(book.title, primaryAuthor)}
                      className="inline-flex items-center gap-1 text-xs font-semibold text-[#171817] dark:text-[#F6F4EE] hover:text-[#C5A45D] dark:hover:text-[#D4B774] transition-colors cursor-pointer"
                      title={`Open journal editor to reflect on ${book.title}`}
                    >
                      <PenTool className="w-3.5 h-3.5 text-[#C5A45D] dark:text-[#D4B774]" />
                      <span>Reflect on this Book</span>
                    </button>

                    {book.infoLink && (
                      <a
                        id={`link-google-books-${book.id}`}
                        href={book.infoLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-[11px] text-[#8C8B83] dark:text-[#7A7872] hover:text-[#171817] dark:hover:text-[#F6F4EE] transition-colors"
                        title={book.source === 'openlibrary' ? 'View on Open Library' : 'View on Google Books'}
                      >
                        <span>{book.source === 'openlibrary' ? 'Open Library' : 'Google Books'}</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    )}
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
