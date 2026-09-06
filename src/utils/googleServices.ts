import { BookRecommendation } from '../types';

/* ======================================================================
   GOOGLE BOOKS API WITH RESILIENT MULTI-TIER FALLBACK
   ====================================================================== */

export interface GoogleBookItem {
  id: string;
  title: string;
  authors: string[];
  description: string;
  coverUrl?: string;
  publishedDate?: string;
  categories: string[];
  publicDomain: boolean;
  embeddable: boolean;
  viewability: 'NO_PAGES' | 'PARTIAL' | 'ALL_PAGES' | 'UNKNOWN';
  webReaderLink?: string;
  previewLink?: string;
  infoLink: string;
  accessStatus: 'read_free' | 'preview' | 'view_on_google';
  source?: 'google' | 'openlibrary' | 'curated';
}

// Curated timeless reflective classics for guaranteed offline/rate-limited resilience
export const CURATED_REFLECTIVE_CLASSICS: BookRecommendation[] = [
  {
    id: 'curated-meditations',
    title: 'Meditations',
    authors: ['Marcus Aurelius'],
    description: 'Personal writings of the Roman Emperor Marcus Aurelius offering enduring Stoic insights on self-discipline, inner peace, duty, and emotional resilience.',
    thumbnail: 'https://books.google.com/books/content?id=j5c2AAAAMAAJ&printsec=frontcover&img=1&zoom=1&source=gbs_api',
    infoLink: 'https://books.google.com/books?id=j5c2AAAAMAAJ',
    publishedDate: '180',
    categories: ['Stoicism', 'Philosophy', 'Resilience'],
    source: 'curated',
  },
  {
    id: 'curated-mans-search',
    title: "Man's Search for Meaning",
    authors: ['Viktor E. Frankl'],
    description: 'Psychiatrist Viktor Frankl chronicles his experiences in concentration camps, developing Logotherapy and demonstrating humanity’s power to find purpose in any circumstance.',
    thumbnail: 'https://books.google.com/books/content?id=Vl_kAwAAQBAJ&printsec=frontcover&img=1&zoom=1&source=gbs_api',
    infoLink: 'https://books.google.com/books?id=Vl_kAwAAQBAJ',
    publishedDate: '1946',
    categories: ['Meaning', 'Psychology', 'Resilience'],
    source: 'curated',
  },
  {
    id: 'curated-miracle-mindfulness',
    title: 'The Miracle of Mindfulness',
    authors: ['Thích Nhất Hạnh'],
    description: 'Zen master Thích Nhất Hạnh introduces the gentle art of mindful presence in everyday routines—washing dishes, walking, breathing, and conscious awareness.',
    thumbnail: 'https://books.google.com/books/content?id=7h8XAAAAQBAJ&printsec=frontcover&img=1&zoom=1&source=gbs_api',
    infoLink: 'https://books.google.com/books?id=7h8XAAAAQBAJ',
    publishedDate: '1975',
    categories: ['Mindfulness', 'Zen', 'Inner Peace'],
    source: 'curated',
  },
  {
    id: 'curated-wherever-you-go',
    title: 'Wherever You Go, There You Are',
    authors: ['Jon Kabat-Zinn'],
    description: 'A warm, accessible guide to mindfulness meditation in daily life from the founder of Mindfulness-Based Stress Reduction (MBSR).',
    thumbnail: 'https://books.google.com/books/content?id=p5nZAgAAQBAJ&printsec=frontcover&img=1&zoom=1&source=gbs_api',
    infoLink: 'https://books.google.com/books?id=p5nZAgAAQBAJ',
    publishedDate: '1994',
    categories: ['Mindfulness', 'Meditation', 'Presence'],
    source: 'curated',
  },
  {
    id: 'curated-letters-young-poet',
    title: 'Letters to a Young Poet',
    authors: ['Rainer Maria Rilke'],
    description: 'Rilke’s ten timeless letters exploring solitude, patience, love, the inward creative life, and the beauty of living the questions.',
    thumbnail: 'https://books.google.com/books/content?id=Ym1cAAAAMAAJ&printsec=frontcover&img=1&zoom=1&source=gbs_api',
    infoLink: 'https://books.google.com/books?id=Ym1cAAAAMAAJ',
    publishedDate: '1929',
    categories: ['Creative Writing', 'Solitude', 'Introspection'],
    source: 'curated',
  },
  {
    id: 'curated-artists-way',
    title: "The Artist's Way",
    authors: ['Julia Cameron'],
    description: 'A transformative spiritual path to higher creativity, introducing the iconic practice of Morning Pages and mindful creative recovery.',
    thumbnail: 'https://books.google.com/books/content?id=zB3eDQAAQBAJ&printsec=frontcover&img=1&zoom=1&source=gbs_api',
    infoLink: 'https://books.google.com/books?id=zB3eDQAAQBAJ',
    publishedDate: '1992',
    categories: ['Creative Writing', 'Journaling', 'Growth'],
    source: 'curated',
  },
  {
    id: 'curated-atomic-habits',
    title: 'Atomic Habits',
    authors: ['James Clear'],
    description: 'An actionable framework for building good habits, breaking bad ones, and mastering the tiny behaviors that lead to remarkable personal transformation.',
    thumbnail: 'https://books.google.com/books/content?id=XfFvDwAAQBAJ&printsec=frontcover&img=1&zoom=1&source=gbs_api',
    infoLink: 'https://books.google.com/books?id=XfFvDwAAQBAJ',
    publishedDate: '2018',
    categories: ['Habits', 'Productivity', 'Intentional Living'],
    source: 'curated',
  },
  {
    id: 'curated-four-thousand-weeks',
    title: 'Four Thousand Weeks: Time Management for Mortals',
    authors: ['Oliver Burkeman'],
    description: 'An uplifting philosophical critique of modern productivity culture that embraces human limitation, finitude, and authentic priority.',
    thumbnail: 'https://books.google.com/books/content?id=lU8UEAAAQBAJ&printsec=frontcover&img=1&zoom=1&source=gbs_api',
    infoLink: 'https://books.google.com/books?id=lU8UEAAAQBAJ',
    publishedDate: '2021',
    categories: ['Meaning', 'Time', 'Philosophy'],
    source: 'curated',
  },
  {
    id: 'curated-zen-mind',
    title: 'Zen Mind, Beginner’s Mind',
    authors: ['Shunryu Suzuki'],
    description: 'Informal talks on Zen meditation and practice emphasizing the open, eager, and beginner’s attitude to experience reality clearly.',
    thumbnail: 'https://books.google.com/books/content?id=N7g8DwAAQBAJ&printsec=frontcover&img=1&zoom=1&source=gbs_api',
    infoLink: 'https://books.google.com/books?id=N7g8DwAAQBAJ',
    publishedDate: '1970',
    categories: ['Zen', 'Mindfulness', 'Clarity'],
    source: 'curated',
  },
  {
    id: 'curated-walden',
    title: 'Walden; or, Life in the Woods',
    authors: ['Henry David Thoreau'],
    description: 'Thoreau’s classic account of two years of deliberate, simple living in a cabin near Walden Pond, exploring self-reliance and nature.',
    thumbnail: 'https://books.google.com/books/content?id=F-MNAAAAYAAJ&printsec=frontcover&img=1&zoom=1&source=gbs_api',
    infoLink: 'https://books.google.com/books?id=F-MNAAAAYAAJ',
    publishedDate: '1854',
    categories: ['Nature', 'Solitude', 'Simplicity'],
    source: 'curated',
  },
  {
    id: 'curated-radical-acceptance',
    title: 'Radical Acceptance',
    authors: ['Tara Brach'],
    description: 'Embracing your life with the heart of a Buddha, guiding readers to break free from the trance of unworthiness through compassionate self-awareness.',
    thumbnail: 'https://books.google.com/books/content?id=tB9-AgAAQBAJ&printsec=frontcover&img=1&zoom=1&source=gbs_api',
    infoLink: 'https://books.google.com/books?id=tB9-AgAAQBAJ',
    publishedDate: '2003',
    categories: ['Emotional Agility', 'Self-Compassion', 'Clarity'],
    source: 'curated',
  },
  {
    id: 'curated-letters-stoic',
    title: 'Letters from a Stoic',
    authors: ['Lucius Annaeus Seneca'],
    description: 'Moral epistles offering practical Stoic wisdom on overcoming anxiety, valuing time, confronting adversity, and cultivating enduring tranquility.',
    thumbnail: 'https://books.google.com/books/content?id=p5HqAAAAMAAJ&printsec=frontcover&img=1&zoom=1&source=gbs_api',
    infoLink: 'https://books.google.com/books?id=p5HqAAAAMAAJ',
    publishedDate: '65',
    categories: ['Stoicism', 'Resilience', 'Wisdom'],
    source: 'curated',
  },
  {
    id: 'curated-gifts-imperfection',
    title: 'The Gifts of Imperfection',
    authors: ['Brené Brown'],
    description: 'Let go of who you think you’re supposed to be and embrace who you are. A guide to wholehearted living and cultivating self-compassion.',
    thumbnail: 'https://books.google.com/books/content?id=e7wPDwAAQBAJ&printsec=frontcover&img=1&zoom=1&source=gbs_api',
    infoLink: 'https://books.google.com/books?id=e7wPDwAAQBAJ',
    publishedDate: '2010',
    categories: ['Clarity', 'Self-Discovery', 'Courage'],
    source: 'curated',
  },
  {
    id: 'curated-writing-life',
    title: 'The Writing Life',
    authors: ['Annie Dillard'],
    description: 'Pulitzer Prize–winning author Annie Dillard’s vivid, poetic account of the solitude, discipline, and devotion of the writer’s craft.',
    thumbnail: 'https://books.google.com/books/content?id=7n3sAgAAQBAJ&printsec=frontcover&img=1&zoom=1&source=gbs_api',
    infoLink: 'https://books.google.com/books?id=7n3sAgAAQBAJ',
    publishedDate: '1989',
    categories: ['Creative Writing', 'Reflection', 'Discipline'],
    source: 'curated',
  },
  {
    id: 'curated-essentialism',
    title: 'Essentialism: The Disciplined Pursuit of Less',
    authors: ['Greg McKeown'],
    description: 'A systematic discipline for discerning what is absolutely essential, eliminating everything that is not, and making the highest contribution.',
    thumbnail: 'https://books.google.com/books/content?id=0s5fDwAAQBAJ&printsec=frontcover&img=1&zoom=1&source=gbs_api',
    infoLink: 'https://books.google.com/books?id=0s5fDwAAQBAJ',
    publishedDate: '2014',
    categories: ['Habits', 'Focus', 'Intentionality'],
    source: 'curated',
  },
];

// In-memory cache for book queries
const bookQueryCache = new Map<string, BookRecommendation[]>();

// Filter curated books by query matching
function matchCuratedBooks(query: string, maxResults = 12): BookRecommendation[] {
  const terms = query.toLowerCase().split(/\s+/).filter(Boolean);
  if (terms.length === 0) return CURATED_REFLECTIVE_CLASSICS.slice(0, maxResults);

  const scored = CURATED_REFLECTIVE_CLASSICS.map((b) => {
    const hay = `${b.title} ${b.authors.join(' ')} ${b.description} ${b.categories?.join(' ')}`.toLowerCase();
    let score = 0;
    for (const term of terms) {
      if (hay.includes(term)) score += 1;
    }
    return { book: b, score };
  });

  scored.sort((a, b) => b.score - a.score);
  const matched = scored.filter((s) => s.score > 0).map((s) => s.book);

  if (matched.length === 0) {
    return CURATED_REFLECTIVE_CLASSICS.slice(0, maxResults);
  }
  if (matched.length < maxResults) {
    const extras = CURATED_REFLECTIVE_CLASSICS.filter((b) => !matched.some((m) => m.id === b.id));
    return [...matched, ...extras].slice(0, maxResults);
  }
  return matched.slice(0, maxResults);
}

// Fallback search via Open Library API (public, no API key needed, high rate limit)
async function searchOpenLibrary(query: string, maxResults = 12): Promise<BookRecommendation[]> {
  try {
    const cleanQuery = encodeURIComponent(query.trim() || 'mindfulness meditation reflection');
    const res = await fetch(`https://openlibrary.org/search.json?q=${cleanQuery}&limit=${maxResults}`, {
      headers: { Accept: 'application/json' },
    });
    if (!res.ok) return [];

    const data = await res.json();
    const docs = Array.isArray(data.docs) ? data.docs : [];
    if (docs.length === 0) return [];

    return docs.map((doc: any): BookRecommendation => {
      const coverId = doc.cover_i;
      const thumbnail = coverId
        ? `https://covers.openlibrary.org/b/id/${coverId}-M.jpg`
        : undefined;
      const key = doc.key || '';
      const infoLink = key
        ? `https://openlibrary.org${key}`
        : `https://www.google.com/search?q=${encodeURIComponent(doc.title + ' ' + (doc.author_name?.[0] || ''))}`;

      return {
        id: doc.key || `ol-${Math.random().toString(36).substring(2, 9)}`,
        title: doc.title || 'Reflective Book',
        authors: Array.isArray(doc.author_name) ? doc.author_name.slice(0, 3) : ['Various Authors'],
        description: doc.first_sentence?.[0] || `Published in ${doc.first_publish_year || 'classic edition'}. Available for mindful exploration.`,
        thumbnail,
        infoLink,
        publishedDate: doc.first_publish_year ? String(doc.first_publish_year) : undefined,
        categories: Array.isArray(doc.subject) ? doc.subject.slice(0, 3) : ['Mindfulness & Literature'],
        source: 'openlibrary',
      };
    });
  } catch (e) {
    console.warn('[OpenLibrary Fallback Warning]:', e);
    return [];
  }
}

export async function searchGoogleBooks(
  query: string,
  filter: 'all' | 'free' | 'preview' = 'all',
  maxResults = 12
): Promise<GoogleBookItem[]> {
  const cleanQuery = encodeURIComponent(query.trim() || 'mindfulness habits creative growth');
  let url = `https://www.googleapis.com/books/v1/volumes?q=${cleanQuery}&maxResults=${maxResults}`;

  if (filter === 'free') {
    url += '&filter=free-ebooks';
  }

  try {
    const res = await fetch(url);
    if (!res.ok) {
      console.warn(`[Google Books Status ${res.status}] Engaging resilient fallback.`);
      return [];
    }

    const data = await res.json();
    const items = Array.isArray(data.items) ? data.items : [];

    return items.map((item: any): GoogleBookItem => {
      const volume = item.volumeInfo || {};
      const access = item.accessInfo || {};

      const publicDomain = Boolean(access.publicDomain);
      const embeddable = Boolean(access.embeddable);
      const viewability = access.viewability || 'UNKNOWN';

      let accessStatus: 'read_free' | 'preview' | 'view_on_google' = 'view_on_google';
      if (viewability === 'ALL_PAGES' || publicDomain === true) {
        accessStatus = 'read_free';
      } else if (viewability === 'PARTIAL') {
        accessStatus = 'preview';
      }

      let coverUrl = volume.imageLinks?.thumbnail || volume.imageLinks?.smallThumbnail || '';
      if (coverUrl.startsWith('http://')) {
        coverUrl = coverUrl.replace('http://', 'https://');
      }

      return {
        id: item.id,
        title: volume.title || 'Untitled Work',
        authors: Array.isArray(volume.authors) ? volume.authors : ['Various Authors'],
        description: volume.description || 'No summary available for this edition.',
        coverUrl: coverUrl || undefined,
        publishedDate: volume.publishedDate || '',
        categories: Array.isArray(volume.categories) ? volume.categories : ['Mindfulness & Philosophy'],
        publicDomain,
        embeddable,
        viewability,
        webReaderLink: access.webReaderLink || undefined,
        previewLink: volume.previewLink || undefined,
        infoLink: volume.infoLink || `https://books.google.com/books?id=${item.id}`,
        accessStatus,
        source: 'google',
      };
    });
  } catch (err) {
    console.warn('[Google Books API Network Warning]:', err);
    return [];
  }
}

export async function searchReflectiveBooks(
  query: string,
  maxResults = 12
): Promise<BookRecommendation[]> {
  const cacheKey = `${query.trim().toLowerCase()}_${maxResults}`;
  if (bookQueryCache.has(cacheKey)) {
    return bookQueryCache.get(cacheKey)!;
  }

  // Tier 1: Try Google Books API
  try {
    const items = await searchGoogleBooks(query, 'all', maxResults);
    if (items.length > 0) {
      const mapped: BookRecommendation[] = items.map((item) => ({
        id: item.id,
        title: item.title,
        authors: item.authors,
        description: item.description,
        thumbnail: item.coverUrl,
        infoLink: item.infoLink,
        publishedDate: item.publishedDate,
        categories: item.categories,
        source: 'google',
      }));
      bookQueryCache.set(cacheKey, mapped);
      return mapped;
    }
  } catch (err) {
    console.warn('[searchReflectiveBooks Tier 1 error, proceeding to Tier 2]:', err);
  }

  // Tier 2: Open Library API
  try {
    const openLibraryResults = await searchOpenLibrary(query, maxResults);
    if (openLibraryResults.length > 0) {
      bookQueryCache.set(cacheKey, openLibraryResults);
      return openLibraryResults;
    }
  } catch (err) {
    console.warn('[searchReflectiveBooks Tier 2 error, proceeding to Tier 3]:', err);
  }

  // Tier 3: Curated Classic Library
  const curatedFallback = matchCuratedBooks(query, maxResults);
  bookQueryCache.set(cacheKey, curatedFallback);
  return curatedFallback;
}
