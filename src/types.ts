export type ReflectionMode = 'deep_reflection' | 'brainstorm' | 'summary' | 'chat';

export interface ChatMessage {
  id: string;
  sender: 'user' | 'gemini';
  text: string;
  timestamp: string;
  modelUsed?: string;
}

export interface EntryLocation {
  name: string;
  address?: string;
  latitude?: number;
  longitude?: number;
  placeId?: string;
}

export interface JournalEntry {
  id: string;
  userId: string;
  title: string;
  mood: string;
  originalJournal: string;
  messages: ChatMessage[];
  summarySnippet?: string;
  createdAt: string;
  updatedAt: string;
  entryDate?: string;
  entryTime?: string;
  lastReflectionMode?: ReflectionMode;
  location?: EntryLocation;
}

export interface NotificationPreferences {
  reflectionReminders: 'OFF' | 'Daily' | 'Weekly';
  reminderTime?: string;
  reminderDay?: string;
  updatedAt?: string;
}

export type AvatarType = 'google' | 'custom' | 'preset' | 'initials';

export interface UserProfile {
  uid: string;
  email: string | null;
  phoneNumber?: string | null;
  displayName: string | null;
  firstName?: string | null;
  lastName?: string | null;
  photoURL: string | null;
  avatarType?: AvatarType;
  avatarId?: string | null;
  customPhotoUrl?: string | null;
  emailVerified: boolean;
  providerId?: string;
  themePreference?: 'light' | 'dark';
  hasCompletedFirstVisit?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface MemoryInquiry {
  id: string;
  question: string;
  answer: string;
  memoriesAnalyzedCount: number;
  modelUsed: string;
  timestamp: string;
}

export interface BookRecommendation {
  id: string;
  title: string;
  authors: string[];
  description: string;
  thumbnail?: string;
  infoLink: string;
  publishedDate?: string;
  categories?: string[];
  source?: 'google' | 'openlibrary' | 'curated';
}

