export type ThemeMode = 'light' | 'dark';

function getStorageKey(uid?: string | null): string {
  if (uid) {
    return `mindtrail_theme_${uid}`;
  }
  return 'mindtrail_theme_guest';
}

/**
 * Reads the stored theme for the specified user.
 * Unauthenticated / guest state always defaults to 'light'.
 */
export function getStoredTheme(uid?: string | null): ThemeMode {
  if (!uid) return 'light';
  if (typeof window === 'undefined') return 'light';

  try {
    const key = getStorageKey(uid);
    const saved = localStorage.getItem(key);
    if (saved === 'light' || saved === 'dark') {
      return saved;
    }
  } catch (err) {
    console.warn('[Theme]: Could not read theme from localStorage', err);
  }
  return 'light';
}

/**
 * Applies the given theme.
 * If uid is not provided (unauthenticated session), strictly enforces Light mode
 * by removing the .dark class from the document root.
 */
export function applyTheme(theme: ThemeMode, uid?: string | null) {
  if (typeof window === 'undefined') return;

  if (!uid) {
    // Unauthenticated / guest: strictly enforce Light theme
    document.documentElement.classList.remove('dark');
    return;
  }

  try {
    const key = getStorageKey(uid);
    localStorage.setItem(key, theme);
  } catch (err) {
    console.warn('[Theme]: Could not save theme to localStorage', err);
  }

  if (theme === 'dark') {
    document.documentElement.classList.add('dark');
  } else {
    document.documentElement.classList.remove('dark');
  }

  // Notify active UI listeners
  try {
    window.dispatchEvent(new CustomEvent('mindtrail-theme-change', { detail: theme }));
  } catch {
    // Ignore in restricted environments
  }
}

/**
 * Resets the theme to Light upon sign out, ensuring the authentication
 * and landing pages never display dark mode or leak the previous user's theme.
 */
export function resetThemeOnSignOut() {
  if (typeof window === 'undefined') return;
  document.documentElement.classList.remove('dark');
}

/**
 * Initializes the theme for the current user session.
 * If there is no authenticated user, strictly removes .dark.
 */
export function initThemeListener(getCurrentUid?: () => string | null | undefined) {
  const currentUid = getCurrentUid ? getCurrentUid() : null;

  if (!currentUid) {
    if (typeof window !== 'undefined') {
      document.documentElement.classList.remove('dark');
    }
    return () => {};
  }

  const initialTheme = getStoredTheme(currentUid);
  applyTheme(initialTheme, currentUid);

  const handleStorage = (e: StorageEvent) => {
    if (e.key === getStorageKey(currentUid) && e.newValue) {
      if (e.newValue === 'light' || e.newValue === 'dark') {
        applyTheme(e.newValue as ThemeMode, currentUid);
      }
    }
  };

  window.addEventListener('storage', handleStorage);
  return () => {
    window.removeEventListener('storage', handleStorage);
  };
}
