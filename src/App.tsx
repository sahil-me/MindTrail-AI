import React, { useState, useEffect } from 'react';
import {
  collection,
  doc,
  getDoc,
  setDoc,
  updateDoc,
  deleteDoc,
  getDocs,
  onSnapshot,
  query,
  orderBy,
} from 'firebase/firestore';
import { onAuthStateChanged, User, GoogleAuthProvider } from 'firebase/auth';
import { auth, db, googleProvider, signInWithPopup, signOut, deleteUser } from './firebase';
import { JournalEntry, ChatMessage, ReflectionMode, UserProfile, EntryLocation } from './types';
import { sanitizePayload } from './utils/sanitize';
import { callGeminiReflect } from './utils/api';
import { getAuthErrorMessage } from './utils/authErrors';
import { fetchOrCreateUserProfile } from './utils/userProfile';
import { formatLocalDate, formatLocalTime } from './utils/dateUtils';
import { Header } from './components/Header';
import { AuthLanding } from './components/AuthLanding';
import { LandingPage } from './components/LandingPage';
import { EmailVerificationView } from './components/EmailVerificationView';
import { AccountPage } from './components/AccountPage';
import { EntryEditor } from './components/EntryEditor';
import { ConversationThread } from './components/ConversationThread';
import { EntryHistory } from './components/EntryHistory';
import { ErrorBanner } from './components/ErrorBanner';
import { AskMemories } from './components/AskMemories';
import { Dashboard } from './components/Dashboard';
import { MemoryTimeline } from './components/MemoryTimeline';
import { BooksPage } from './components/BooksPage';
import { GlobalFooter } from './components/GlobalFooter';
import { AboutPage } from './components/AboutPage';
import { PrivacyPolicyPage } from './components/PrivacyPolicyPage';
import { TermsPage } from './components/TermsPage';
import { FAQPage } from './components/FAQPage';
import { HowItWorksPage } from './components/HowItWorksPage';
import { SupportModal, SupportTab } from './components/SupportModal';
import { PrivacyNotice } from './components/PrivacyNotice';
import {
  initThemeListener,
  applyTheme,
  getStoredTheme,
  resetThemeOnSignOut,
} from './utils/theme';

export default function App() {
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const [isAuthLoading, setIsAuthLoading] = useState(true);
  const [authError, setAuthError] = useState<string | null>(null);
  const [isEmailUnverified, setIsEmailUnverified] = useState(false);
  const [authFlow, setAuthFlow] = useState<'signin' | 'signup'>('signup');
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [showPrivacyModal, setShowPrivacyModal] = useState(false);
  const [supportModal, setSupportModal] = useState<{ isOpen: boolean; tab: SupportTab }>({
    isOpen: false,
    tab: 'report',
  });

  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [isEntriesLoading, setIsEntriesLoading] = useState(false);
  const [selectedEntryId, setSelectedEntryId] = useState<string | null>(null);
  const [isWritingNew, setIsWritingNew] = useState(true);
  const [activeView, setActiveView] = useState<
    | 'home'
    | 'dashboard'
    | 'journal'
    | 'timeline'
    | 'memories'
    | 'books'
    | 'account'
    | 'signin'
    | 'signup'
    | 'about'
    | 'privacy'
    | 'terms'
    | 'faq'
    | 'how-it-works'
  >(() => {
    if (typeof window !== 'undefined') {
      const path = window.location.pathname;
      const hash = window.location.hash;
      const searchParams = new URLSearchParams(window.location.search);
      const authParam = searchParams.get('auth');

      if (path === '/signin' || authParam === 'signin' || hash === '#signin') return 'signin';
      if (path === '/signup' || authParam === 'signup' || hash === '#signup') return 'signup';
      if (path === '/about' || hash === '#about') return 'about';
      if (path === '/privacy' || hash === '#privacy') return 'privacy';
      if (path === '/terms' || hash === '#terms') return 'terms';
      if (path === '/faq' || hash === '#faq') return 'faq';
      if (path === '/how-it-works' || hash === '#how-it-works') return 'how-it-works';
      if (path === '/account') return 'account';
      if (path === '/journal') return 'journal';
      if (path === '/timeline') return 'timeline';
      if (path === '/memories') return 'memories';
      if (path === '/books') return 'books';
      if (path === '/map') return 'dashboard';
      if (path === '/dashboard') return 'dashboard';
    }
    return 'dashboard';
  });

  const [isAiProcessing, setIsAiProcessing] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [failedSaveAction, setFailedSaveAction] = useState<(() => Promise<void>) | null>(null);
  const [initialDraftTitle, setInitialDraftTitle] = useState('');
  const [initialDraftText, setInitialDraftText] = useState('');

  // Initialize theme listener for the authenticated user session
  useEffect(() => {
    const cleanup = initThemeListener(() => currentUser?.uid);
    return cleanup;
  }, [currentUser?.uid]);

  // Synchronize theme with Firestore when active user session changes
  useEffect(() => {
    if (currentUser?.uid) {
      const uid = currentUser.uid;
      // Fetch preference from Firestore user document
      getDoc(doc(db, 'users', uid))
        .then((docSnap) => {
          const data = docSnap.exists() ? docSnap.data() : null;
          const cloudTheme = data?.themePreference;
          if (cloudTheme === 'light' || cloudTheme === 'dark') {
            applyTheme(cloudTheme, uid);
          } else {
            const localTheme = getStoredTheme(uid);
            applyTheme(localTheme, uid);
            setDoc(doc(db, 'users', uid), { themePreference: localTheme }, { merge: true }).catch(() => {});
          }
        })
        .catch(() => {
          const localTheme = getStoredTheme(uid);
          applyTheme(localTheme, uid);
        });
    } else {
      resetThemeOnSignOut();
    }
  }, [currentUser?.uid]);

  // Browser navigation popstate support (/account <-> /)
  useEffect(() => {
    const handlePopState = () => {
      const path = window.location.pathname;
      const hash = window.location.hash;
      const searchParams = new URLSearchParams(window.location.search);
      const authParam = searchParams.get('auth');

      if (path === '/signin' || authParam === 'signin' || hash === '#signin') {
        setActiveView('signin');
        setAuthFlow('signin');
      } else if (path === '/signup' || authParam === 'signup' || hash === '#signup') {
        setActiveView('signup');
        setAuthFlow('signup');
      } else if (path === '/about' || hash === '#about') {
        setActiveView('about');
      } else if (path === '/privacy' || hash === '#privacy') {
        setActiveView('privacy');
      } else if (path === '/terms' || hash === '#terms') {
        setActiveView('terms');
      } else if (path === '/faq' || hash === '#faq') {
        setActiveView('faq');
      } else if (path === '/how-it-works' || hash === '#how-it-works') {
        setActiveView('how-it-works');
      } else if (path === '/account') {
        setActiveView('account');
      } else if (path === '/journal') {
        setActiveView('journal');
      } else if (path === '/timeline') {
        setActiveView('timeline');
      } else if (path === '/memories') {
        setActiveView('memories');
      } else if (path === '/books') {
        setActiveView('books');
      } else if (path === '/map') {
        setActiveView('dashboard');
      } else if (path === '/dashboard') {
        setActiveView('dashboard');
      } else {
        setActiveView(currentUser ? 'dashboard' : 'home');
      }
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [currentUser]);

  // Check URL triggers for signin/signup
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const searchParams = new URLSearchParams(window.location.search);
      const authParam = searchParams.get('auth');
      const path = window.location.pathname;
      const hash = window.location.hash;

      if (path === '/signin' || authParam === 'signin' || hash === '#signin') {
        setAuthFlow('signin');
        setActiveView('signin');
      } else if (path === '/signup' || authParam === 'signup' || hash === '#signup') {
        setAuthFlow('signup');
        setActiveView('signup');
      } else if (path === '/about' || hash === '#about') {
        setActiveView('about');
      } else if (path === '/privacy' || hash === '#privacy') {
        setActiveView('privacy');
      } else if (path === '/terms' || hash === '#terms') {
        setActiveView('terms');
      } else if (path === '/faq' || hash === '#faq') {
        setActiveView('faq');
      } else if (path === '/how-it-works' || hash === '#how-it-works') {
        setActiveView('how-it-works');
      } else if (path === '/map') {
        setActiveView('map');
      }
    }
  }, []);

  const navigateToSignIn = () => {
    setActiveView('signin');
    setAuthFlow('signin');
    if (window.location.pathname !== '/signin') {
      window.history.pushState(null, '', '/signin');
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
    setErrorMessage(null);
  };

  const navigateToSignUp = () => {
    setActiveView('signup');
    setAuthFlow('signup');
    if (window.location.pathname !== '/signup') {
      window.history.pushState(null, '', '/signup');
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
    setErrorMessage(null);
  };

  const navigateToAbout = () => {
    setActiveView('about');
    if (window.location.pathname !== '/about') {
      window.history.pushState(null, '', '/about');
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
    setErrorMessage(null);
  };

  const navigateToPrivacy = () => {
    setActiveView('privacy');
    if (window.location.pathname !== '/privacy') {
      window.history.pushState(null, '', '/privacy');
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
    setErrorMessage(null);
  };

  const navigateToTerms = () => {
    setActiveView('terms');
    if (window.location.pathname !== '/terms') {
      window.history.pushState(null, '', '/terms');
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
    setErrorMessage(null);
  };

  const navigateToFAQ = () => {
    if (activeView === 'home') {
      const el = document.getElementById('faq') || document.getElementById('faq-section');
      if (el) {
        el.scrollIntoView({ behavior: 'smooth' });
        window.history.replaceState(null, '', '#faq');
        return;
      }
    }
    setActiveView('faq');
    if (window.location.pathname !== '/faq') {
      window.history.pushState(null, '', '/faq');
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
    setErrorMessage(null);
  };

  const navigateToHowItWorks = () => {
    setActiveView('how-it-works');
    if (window.location.pathname !== '/how-it-works') {
      window.history.pushState(null, '', '/how-it-works');
    }
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;
    setErrorMessage(null);
  };

  const openReportIssue = () => {
    setSupportModal({ isOpen: true, tab: 'report' });
  };

  const openFeedback = () => {
    setSupportModal({ isOpen: true, tab: 'feedback' });
  };

  const navigateToAccount = () => {
    setActiveView('account');
    if (window.location.pathname !== '/account') {
      window.history.pushState(null, '', '/account');
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
    setErrorMessage(null);
  };

  const openDashboard = () => {
    setActiveView('dashboard');
    if (window.location.pathname !== '/' && window.location.pathname !== '/dashboard') {
      window.history.pushState(null, '', '/');
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
    setErrorMessage(null);
  };

  const navigateHome = () => {
    if (!currentUser) {
      setActiveView('home');
      if (window.location.pathname !== '/') {
        window.history.pushState(null, '', '/');
      }
    } else {
      openDashboard();
    }
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;
    setErrorMessage(null);
  };

  const backToJournal = () => {
    setActiveView('journal');
    if (window.location.pathname !== '/journal') {
      window.history.pushState(null, '', '/journal');
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
    setErrorMessage(null);
  };

  const openTimeline = () => {
    setActiveView('timeline');
    if (window.location.pathname !== '/timeline') {
      window.history.pushState(null, '', '/timeline');
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
    setErrorMessage(null);
  };

  const openMemories = () => {
    setActiveView('memories');
    if (window.location.pathname !== '/memories') {
      window.history.pushState(null, '', '/memories');
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
    setErrorMessage(null);
  };

  const openBooks = () => {
    setActiveView('books');
    if (window.location.pathname !== '/books') {
      window.history.pushState(null, '', '/books');
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
    setErrorMessage(null);
  };

  const openNewEntry = () => {
    setSelectedEntryId(null);
    setIsWritingNew(true);
    setInitialDraftTitle('');
    setInitialDraftText('');
    setActiveView('journal');
    if (window.location.pathname !== '/journal') {
      window.history.pushState(null, '', '/journal');
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
    setErrorMessage(null);
  };

  const handleFooterNavigate = (view: string) => {
    if (view === 'home') navigateHome();
    else if (view === 'about') navigateToAbout();
    else if (view === 'privacy') navigateToPrivacy();
    else if (view === 'terms') navigateToTerms();
    else if (view === 'faq') navigateToFAQ();
    else if (view === 'how-it-works') {
      navigateToHowItWorks();
    } else if (view === 'report-issue') {
      openReportIssue();
    } else if (view === 'feedback') {
      openFeedback();
    } else if (view === 'journal') {
      if (currentUser) backToJournal();
      else navigateToSignIn();
    } else if (view === 'timeline') {
      if (currentUser) openTimeline();
      else navigateToSignIn();
    } else if (view === 'memories') {
      if (currentUser) openMemories();
      else navigateToSignIn();
    } else if (view === 'books') {
      if (currentUser) openBooks();
      else navigateToSignIn();
    } else if (view === 'account') {
      if (currentUser) navigateToAccount();
      else navigateToSignIn();
    } else if (view === 'signin') {
      navigateToSignIn();
    } else if (view === 'signup') {
      navigateToSignUp();
    }
  };

  // Listen to Firebase Auth state & load user profile
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user: User | null) => {
      if (user) {
        const isPasswordProvider = user.providerData.some((p) => p.providerId === 'password');
        const requiresVerification = isPasswordProvider && !user.emailVerified;

        try {
          const profile = await fetchOrCreateUserProfile(user);
          setCurrentUser(profile);
          if (profile.themePreference) {
            applyTheme(profile.themePreference, user.uid);
          }
        } catch (err) {
          console.warn('[Profile load fallback]:', err);
          setCurrentUser({
            uid: user.uid,
            email: user.email,
            phoneNumber: user.phoneNumber,
            displayName: user.displayName,
            photoURL: user.photoURL,
            emailVerified: user.emailVerified,
            providerId: user.providerData[0]?.providerId || (user.phoneNumber ? 'phone' : 'password'),
          });
        }

        setIsEmailUnverified(requiresVerification);
        setAuthError(null);
        setActiveView((prev) => (prev === 'signin' || prev === 'signup' || prev === 'home' ? 'dashboard' : prev));
      } else {
        resetThemeOnSignOut();
        setCurrentUser(null);
        setIsEmailUnverified(false);
        setEntries([]);
        setSelectedEntryId(null);
        setIsWritingNew(true);
        setActiveView((prev) => {
          if (prev === 'dashboard' || prev === 'journal' || prev === 'timeline' || prev === 'memories' || prev === 'account') {
            window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
            document.documentElement.scrollTop = 0;
            document.body.scrollTop = 0;
            return 'home';
          }
          return prev;
        });
      }
      setIsAuthLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // Listen to user's isolated Firestore entries collection
  useEffect(() => {
    if (!currentUser || isEmailUnverified) return;

    setIsEntriesLoading(true);
    const entriesRef = collection(db, 'users', currentUser.uid, 'entries');
    const q = query(entriesRef, orderBy('createdAt', 'desc'));

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const loaded: JournalEntry[] = [];
        snapshot.forEach((docSnapshot) => {
          const data = docSnapshot.data() as Omit<JournalEntry, 'id'>;
          loaded.push({
            id: docSnapshot.id,
            ...data,
          });
        });
        setEntries(loaded);
        setIsEntriesLoading(false);
      },
      (error) => {
        console.warn('[Firestore onSnapshot]:', error);
        setErrorMessage(`Failed to load entries from Firestore: ${error.message}`);
        setIsEntriesLoading(false);
      }
    );

    return () => unsubscribe();
  }, [currentUser]);

  // Google Sign In Handler
  const handleSignIn = async () => {
    setIsAuthLoading(true);
    setAuthError(null);
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (err: any) {
      const code = err?.code || '';
      if (code === 'auth/popup-closed-by-user' || code === 'auth/cancelled-popup-request') {
        // User voluntarily closed or cancelled the popup window. This is expected user action, not a system failure.
        console.info('[Google Sign-In]: Popup window closed by user.');
        setAuthError(null);
      } else if (code === 'auth/popup-blocked') {
        console.warn('[Google Sign-In]: Authentication popup was blocked by the browser.');
        setAuthError(
          'The sign-in popup was blocked by your browser. Please allow popups for this site or open the app in a new tab.'
        );
      } else if (code === 'auth/unauthorized-domain') {
        console.warn('[Google Sign-In]: Unauthorized domain for Firebase Auth:', window.location.hostname);
        setAuthError(
          `Domain ${window.location.hostname} is not authorized in Firebase. Please add it to Authorized Domains in the Firebase Console.`
        );
      } else {
        console.warn('[Google Sign-In]:', err);
        setAuthError(err?.message || 'Unable to sign in with Google. Please try again.');
      }
    } finally {
      setIsAuthLoading(false);
    }
  };

  // Sign Out Handler
  const handleSignOut = async () => {
    try {
      resetThemeOnSignOut();
      await signOut(auth);
      if (window.location.pathname !== '/') {
        window.history.pushState(null, '', '/');
      }
      setActiveView('home');
      window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
      document.documentElement.scrollTop = 0;
      document.body.scrollTop = 0;
    } catch (err: any) {
      console.warn('[Sign-Out]:', err);
    }
  };

  // Secure Account & Data Deletion Handler
  const handleDeleteAccount = async (): Promise<{ success: boolean; error?: string }> => {
    if (!auth.currentUser) {
      return { success: false, error: 'No active authentication session found.' };
    }

    try {
      const targetUid = auth.currentUser.uid;

      // 1. Delete all user reflections from isolated Firestore path: /users/{targetUid}/entries
      const entriesRef = collection(db, 'users', targetUid, 'entries');
      const snapshot = await getDocs(entriesRef);
      const batchDeletes = snapshot.docs.map((docSnap) => deleteDoc(docSnap.ref));
      await Promise.all(batchDeletes);

      // 2. Delete user root document if exists
      try {
        await deleteDoc(doc(db, 'users', targetUid));
      } catch (docErr) {
        console.warn('[Delete Account] User root doc cleanup notice:', docErr);
      }

      // 3. Delete Firebase Auth user record
      await deleteUser(auth.currentUser);

      // 4. Reset local application state
      resetThemeOnSignOut();
      setCurrentUser(null);
      setIsEmailUnverified(false);
      setEntries([]);
      setSelectedEntryId(null);
      setIsWritingNew(true);
      if (window.location.pathname !== '/') {
        window.history.pushState(null, '', '/');
      }
      setActiveView('home');
      window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
      document.documentElement.scrollTop = 0;
      document.body.scrollTop = 0;

      return { success: true };
    } catch (err: any) {
      console.warn('[Delete Account]:', err);
      const friendlyMessage = getAuthErrorMessage(err);
      return { success: false, error: friendlyMessage };
    }
  };

  // Submit a new Journal Entry to Gemini & Save to Firestore
  const handleCreateEntry = async (
    title: string,
    journalText: string,
    mood: string,
    mode: ReflectionMode,
    location?: EntryLocation
  ) => {
    if (!currentUser) return;

    setIsAiProcessing(true);
    setErrorMessage(null);
    setFailedSaveAction(null);

    try {
      // 1. Call full-stack Gemini API endpoint with CORS & retry resilience
      const data = await callGeminiReflect({
        journalText,
        reflectionType: mode,
        userMood: mood,
        history: [],
      });

      const reflectionText = data.reflection || 'No reflection generated.';
      const modelUsed = data.modelUsed || 'gemini-3.6-flash';

      // 2. Prepare user message & Gemini response
      const nowDate = new Date();
      const nowIso = nowDate.toISOString();
      const entryDate = formatLocalDate(nowDate);
      const entryTime = formatLocalTime(nowDate);

      const userMessage: ChatMessage = {
        id: `user-${Date.now()}`,
        sender: 'user',
        text: journalText,
        timestamp: nowIso,
      };

      const geminiMessage: ChatMessage = {
        id: `gemini-${Date.now()}`,
        sender: 'gemini',
        text: reflectionText,
        timestamp: nowIso,
        modelUsed,
      };

      // 3. Assemble document payload
      const entryId = `entry-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
      const newEntry: JournalEntry = {
        id: entryId,
        userId: currentUser.uid,
        title,
        mood,
        originalJournal: journalText,
        messages: [userMessage, geminiMessage],
        summarySnippet: reflectionText.slice(0, 140),
        createdAt: nowIso,
        updatedAt: nowIso,
        entryDate,
        entryTime,
        lastReflectionMode: mode,
        ...(location && location.name ? { location } : {}),
      };

      // Strict Undefined-Stripping before passing to Firestore SDK
      const sanitized = sanitizePayload(newEntry);

      // 4. Guaranteed Transaction Verification
      const saveToFirestore = async () => {
        const docRef = doc(db, 'users', currentUser.uid, 'entries', entryId);
        await setDoc(docRef, sanitized);

        // Also persist to /interactions subcollection to satisfy production directives
        const interactionRef = doc(db, 'users', currentUser.uid, 'interactions', entryId);
        await setDoc(interactionRef, {
          entryId,
          userId: currentUser.uid,
          prompt: journalText,
          response: reflectionText,
          modelUsed,
          timestamp: nowIso,
        });
      };

      try {
        await saveToFirestore();
        setSelectedEntryId(entryId);
        setIsWritingNew(false);
      } catch (dbErr: any) {
        console.warn('[Firestore Write]:', dbErr);
        setErrorMessage(`Journal response was generated, but failed to save to Firestore: ${dbErr.message}`);
        // Store retry closure so user can re-trigger save without losing input
        setFailedSaveAction(() => saveToFirestore);
      }
    } catch (err: any) {
      console.warn('[Submit Reflection]:', err);
      setErrorMessage(err.message || 'Failed to generate reflection with Gemini.');
    } finally {
      setIsAiProcessing(false);
    }
  };

  // Follow-up conversation turn in multi-turn thread
  const handleFollowUp = async (followUpText: string, mode: ReflectionMode = 'chat') => {
    if (!currentUser || !selectedEntry) return;

    setIsAiProcessing(true);
    setErrorMessage(null);

    const now = new Date().toISOString();
    const newUserMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text: followUpText,
      timestamp: now,
    };

    const updatedMessages = [...selectedEntry.messages, newUserMsg];

    try {
      // 1. Call Gemini with multi-turn conversation history and CORS & retry resilience
      const data = await callGeminiReflect({
        journalText: selectedEntry.originalJournal,
        reflectionType: mode,
        userMood: selectedEntry.mood,
        history: updatedMessages,
      });

      const geminiReply: ChatMessage = {
        id: `gemini-${Date.now()}`,
        sender: 'gemini',
        text: data.reflection || 'No response generated.',
        timestamp: data.timestamp || new Date().toISOString(),
        modelUsed: data.modelUsed || 'gemini-3.6-flash',
      };

      const finalMessages = [...updatedMessages, geminiReply];

      // 2. Guaranteed Firestore persistence
      const saveFollowUp = async () => {
        const entryRef = doc(db, 'users', currentUser.uid, 'entries', selectedEntry.id);
        await updateDoc(
          entryRef,
          sanitizePayload({
            messages: finalMessages,
            updatedAt: new Date().toISOString(),
          })
        );
      };

      try {
        await saveFollowUp();
      } catch (dbErr: any) {
        console.warn('[Firestore Follow-up Save]:', dbErr);
        setErrorMessage(`Response received from Gemini, but failed to save to Firestore: ${dbErr.message}`);
        setFailedSaveAction(() => saveFollowUp);
      }
    } catch (err: any) {
      console.warn('[Follow-up]:', err);
      setErrorMessage(err.message || 'Failed to continue conversation with Gemini.');
    } finally {
      setIsAiProcessing(false);
    }
  };

  // Delete an entry from Firestore
  const handleDeleteEntry = async (entryId: string) => {
    if (!currentUser) return;
    try {
      await deleteDoc(doc(db, 'users', currentUser.uid, 'entries', entryId));
      if (selectedEntryId === entryId) {
        setSelectedEntryId(null);
        setIsWritingNew(true);
      }
    } catch (err: any) {
      console.warn('[Delete Entry]:', err);
      setErrorMessage(`Failed to delete entry: ${err.message}`);
    }
  };

  const selectedEntry = entries.find((e) => e.id === selectedEntryId) || null;

  return (
    <div className="min-h-screen bg-[#fcfbf9] dark:bg-[#121110] text-stone-900 dark:text-stone-100 flex flex-col font-sans selection:bg-amber-100 dark:selection:bg-amber-950 selection:text-amber-900 dark:selection:text-amber-100 transition-colors">
      {/* Top Application Header */}
      <Header
        user={currentUser}
        onSignOut={handleSignOut}
        onNewEntry={openNewEntry}
        onOpenMemories={openMemories}
        onOpenTimeline={openTimeline}
        onOpenDashboard={openDashboard}
        onOpenBooks={openBooks}
        onNavigateToAccount={navigateToAccount}
        onBackToJournal={backToJournal}
        onNavigateHome={navigateHome}
        activeView={activeView}
        entriesCount={entries.length}
        onOpenSignIn={navigateToSignIn}
        onOpenSignUp={navigateToSignUp}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8">
        {/* Error notification banner if any action fails */}
        <ErrorBanner
          message={errorMessage || ''}
          onRetry={
            failedSaveAction
              ? async () => {
                  try {
                    await failedSaveAction();
                    setErrorMessage(null);
                    setFailedSaveAction(null);
                  } catch (e: any) {
                    setErrorMessage(`Retry failed: ${e.message}`);
                  }
                }
              : undefined
          }
          onDismiss={() => setErrorMessage(null)}
          retryLabel="Retry Save to Firestore"
        />

        {/* View: Dedicated Sign In / Sign Up View */}
        {activeView === 'signin' || activeView === 'signup' ? (
          <div id="auth-page-container" className="w-full flex-1 flex flex-col items-center justify-center py-8 sm:py-16 px-4">
            <div className="w-full max-w-[460px]">
              <AuthLanding
                onGoogleSignIn={handleSignIn}
                isGoogleLoading={isAuthLoading}
                externalError={authError}
                authFlow={activeView === 'signin' ? 'signin' : 'signup'}
                onSwitchFlow={(flow) => {
                  if (flow === 'signin') {
                    navigateToSignIn();
                  } else {
                    navigateToSignUp();
                  }
                }}
                onClose={navigateHome}
              />
            </div>
          </div>
        ) : activeView === 'about' ? (
          <AboutPage onBack={navigateHome} onStartJournal={navigateToSignUp} />
        ) : activeView === 'privacy' ? (
          <PrivacyPolicyPage onBack={navigateHome} />
        ) : activeView === 'terms' ? (
          <TermsPage onBack={navigateHome} />
        ) : activeView === 'faq' ? (
          <FAQPage onBack={navigateHome} />
        ) : activeView === 'how-it-works' ? (
          <HowItWorksPage
            onBack={navigateHome}
            onStartJournal={() => {
              if (currentUser) {
                backToJournal();
              } else {
                navigateToSignUp();
              }
            }}
          />
        ) : !currentUser ? (
          <>
            <LandingPage
              onStartJournal={() => {
                navigateToSignUp();
              }}
              onExplorePrivacy={() => navigateToPrivacy()}
            />

            {/* Accessible Auth Dialog / Modal */}
            <div
              id="auth-modal-dialog"
              role="dialog"
              aria-modal="true"
              aria-labelledby="landing-hero-heading"
              className={
                isAuthModalOpen
                  ? "fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 dark:bg-black/75 backdrop-blur-xs overflow-y-auto animate-in fade-in duration-150"
                  : "hidden"
              }
              onClick={(e) => {
                if (e.target === e.currentTarget) {
                  setIsAuthModalOpen(false);
                }
              }}
            >
              <div className="relative w-full max-w-[460px] my-auto">
                <AuthLanding
                  onGoogleSignIn={handleSignIn}
                  isGoogleLoading={isAuthLoading}
                  externalError={authError}
                  authFlow={authFlow}
                  onSwitchFlow={setAuthFlow}
                  onClose={() => setIsAuthModalOpen(false)}
                />
              </div>
            </div>
          </>
        ) : isEmailUnverified ? (
          /* View 2: Unverified Email Prompt */
          <EmailVerificationView
            userEmail={currentUser.email}
            onVerified={async () => {
              if (auth.currentUser) {
                if (auth.currentUser.emailVerified) {
                  setIsEmailUnverified(false);
                  setCurrentUser((prev) =>
                    prev ? { ...prev, emailVerified: true } : null
                  );
                } else {
                  await auth.currentUser.reload().catch(() => {});
                  if (auth.currentUser.emailVerified) {
                    setIsEmailUnverified(false);
                    setCurrentUser((prev) =>
                      prev ? { ...prev, emailVerified: true } : null
                    );
                  }
                }
              }
            }}
            onSignOut={handleSignOut}
          />
        ) : activeView === 'account' ? (
          /* View 3: Dedicated Account Page */
          <AccountPage
            user={currentUser}
            entriesCount={entries.length}
            onBackToJournal={openDashboard}
            onSignOut={handleSignOut}
            onDeleteAccount={handleDeleteAccount}
            onUpdateProfile={(updated) => {
              setCurrentUser((prev) => (prev ? { ...prev, ...updated } : null));
            }}
          />
        ) : activeView === 'dashboard' ? (
          /* View 4: Quiet Luxury Personal Reflection Space / Dashboard */
          <Dashboard
            user={currentUser}
            entries={entries}
            onSelectEntry={(entry) => {
              setSelectedEntryId(entry.id);
              setIsWritingNew(false);
              setActiveView('journal');
              setErrorMessage(null);
            }}
            onNewEntryClick={openNewEntry}
            onOpenMemories={openMemories}
            onOpenTimeline={openTimeline}
          />
        ) : activeView === 'timeline' ? (
          /* View 5: Chronological Memory Timeline */
          <MemoryTimeline
            entries={entries}
            onSelectEntry={(entry) => {
              setSelectedEntryId(entry.id);
              setIsWritingNew(false);
              setActiveView('journal');
              setErrorMessage(null);
            }}
            onNewEntryClick={openNewEntry}
          />
        ) : activeView === 'memories' ? (
          /* View 6: Ask My Memories AI Synthesis */
          <AskMemories
            user={currentUser}
            entriesCount={entries.length}
            entries={entries}
            onNewEntryClick={openNewEntry}
          />
        ) : activeView === 'books' ? (
          /* View 6B: Reflective Reading (Google Books) */
          <BooksPage
            entries={entries}
            onReflectOnBook={(bookTitle, author) => {
              setSelectedEntryId(null);
              setIsWritingNew(true);
              setInitialDraftTitle(`Reflections on ${bookTitle}`);
              setInitialDraftText(`Reading "${bookTitle}" by ${author}.\n\nWhat thoughts or personal reflections did this spark?\n\n`);
              setActiveView('journal');
              if (window.location.pathname !== '/journal') {
                window.history.pushState(null, '', '/journal');
              }
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            onBackToJournal={openDashboard}
          />
        ) : (
          /* View 7: Journal Studio (Entry Editor or Conversation Thread + Reflection History) */
          <div id="authenticated-dashboard" className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* Left Sidebar: Reflection History (4 cols on lg) */}
            <aside className="lg:col-span-4 order-2 lg:order-1 h-[680px] sticky top-20">
              <EntryHistory
                entries={entries}
                selectedEntryId={selectedEntryId}
                onSelectEntry={(entry) => {
                  setSelectedEntryId(entry.id);
                  setIsWritingNew(false);
                  setActiveView('journal');
                  setErrorMessage(null);
                }}
                onDeleteEntry={handleDeleteEntry}
                onNewEntryClick={openNewEntry}
                onOpenMemories={openMemories}
                activeView={activeView}
                isLoading={isEntriesLoading}
              />
            </aside>

            {/* Right Main Stage: Editor or Conversation Thread (8 cols on lg) */}
            <section className="lg:col-span-8 order-1 lg:order-2">
              {isWritingNew || !selectedEntry ? (
                <EntryEditor
                  onSubmit={async (title, journalText, mood, mode, location) => {
                    await handleCreateEntry(title, journalText, mood, mode, location);
                    setInitialDraftTitle('');
                    setInitialDraftText('');
                  }}
                  isSubmitting={isAiProcessing}
                  initialTitle={initialDraftTitle}
                  initialJournalText={initialDraftText}
                />
              ) : (
                <ConversationThread
                  entry={selectedEntry}
                  onSendFollowUp={handleFollowUp}
                  isResponding={isAiProcessing}
                  onBack={() => {
                    setIsWritingNew(true);
                    setSelectedEntryId(null);
                  }}
                />
              )}
            </section>
          </div>
        )}
      </main>

      {/* Global Footer reused identically across all routes */}
      <GlobalFooter
        onNavigate={handleFooterNavigate}
        onNavigateHome={navigateHome}
        onOpenPrivacy={navigateToPrivacy}
        onOpenReportIssue={openReportIssue}
        onOpenFeedback={openFeedback}
      />

      {/* Support (Report Issue / Feedback) In-App Dialogue */}
      <SupportModal
        isOpen={supportModal.isOpen}
        onClose={() => setSupportModal((prev) => ({ ...prev, isOpen: false }))}
        initialTab={supportModal.tab}
        userEmail={currentUser?.email || ''}
      />

      {/* Quiet, Refined Privacy Notice */}
      <PrivacyNotice
        externalShowModal={showPrivacyModal}
        onCloseExternalModal={() => setShowPrivacyModal(false)}
      />
    </div>
  );
}
