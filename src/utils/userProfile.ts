import { User } from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { auth, db, updateProfile } from '../firebase';
import { UserProfile, AvatarType } from '../types';

/**
 * Strips undefined properties to guarantee zero-crash Firestore writes
 */
export function sanitizePayload<T extends Record<string, any>>(obj: T): Partial<T> {
  const sanitized: Record<string, any> = {};
  for (const [key, value] of Object.entries(obj)) {
    if (value !== undefined) {
      sanitized[key] = value;
    }
  }
  return sanitized as Partial<T>;
}

const LOCAL_STORAGE_PROFILE_PREFIX = 'mindtrail_profile_';

/**
 * Validates, center-crops, and compresses an uploaded profile image client-side.
 * Produces a crisp 160x160 JPEG data URI (~10-15KB) that saves securely in Firestore.
 */
export async function compressAndResizeAvatar(file: File): Promise<string> {
  const allowedMimeTypes = ['image/png', 'image/jpeg', 'image/webp', 'image/jpg'];
  if (!allowedMimeTypes.includes(file.type.toLowerCase())) {
    throw new Error('Please select a valid image file (PNG, JPG, or WebP).');
  }

  // 5MB max upload limit
  if (file.size > 5 * 1024 * 1024) {
    throw new Error('Image size must be under 5MB.');
  }

  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const img = new Image();
      img.onload = () => {
        try {
          const canvas = document.createElement('canvas');
          const targetSize = 160;
          canvas.width = targetSize;
          canvas.height = targetSize;
          const ctx = canvas.getContext('2d');
          if (!ctx) {
            reject(new Error('Canvas processing unavailable in this browser.'));
            return;
          }

          // Center crop to a square
          const minDim = Math.min(img.width, img.height);
          const startX = (img.width - minDim) / 2;
          const startY = (img.height - minDim) / 2;

          ctx.drawImage(img, startX, startY, minDim, minDim, 0, 0, targetSize, targetSize);
          const compressedDataUri = canvas.toDataURL('image/jpeg', 0.82);
          resolve(compressedDataUri);
        } catch (err) {
          reject(new Error('Failed to process image canvas.'));
        }
      };
      img.onerror = () => reject(new Error('Failed to decode image file.'));
      img.src = reader.result as string;
    };
    reader.onerror = () => reject(new Error('Failed to read image file.'));
    reader.readAsDataURL(file);
  });
}

/**
 * Fetches or initializes the user's UID-scoped profile from Firestore.
 * Accurately derives and preserves firstName, lastName, displayName, avatar, and preferences.
 */
export async function fetchOrCreateUserProfile(authUser: User): Promise<UserProfile> {
  const uid = authUser.uid;
  const userDocRef = doc(db, 'users', uid);

  // Parse names from authUser.displayName if available (e.g. Google or signup)
  const authDisplayName = authUser.displayName || '';
  const nameParts = authDisplayName.trim().split(/\s+/);
  const derivedFirstName = nameParts[0] || '';
  const derivedLastName = nameParts.slice(1).join(' ') || '';

  const isGoogle = authUser.providerData.some((p) => p.providerId === 'google.com');
  const googleProvider = authUser.providerData.find((p) => p.providerId === 'google.com');
  const providerId = authUser.providerData[0]?.providerId || (authUser.phoneNumber ? 'phone' : 'password');

  // Safely extract Google Photo URL (must be valid HTTPS URL, never data URL)
  const googlePhotoUrl =
    (googleProvider?.photoURL && !googleProvider.photoURL.startsWith('data:')
      ? googleProvider.photoURL
      : null) ||
    (authUser.photoURL && !authUser.photoURL.startsWith('data:')
      ? authUser.photoURL
      : null);

  try {
    const snap = await getDoc(userDocRef);

    if (snap.exists()) {
      const data = snap.data();

      // Determine firstName & lastName (handle existing accounts gracefully)
      const firstName = data.firstName !== undefined ? data.firstName : derivedFirstName;
      const lastName = data.lastName !== undefined ? data.lastName : derivedLastName;
      const displayName = data.displayName || authDisplayName || [firstName, lastName].filter(Boolean).join(' ') || authUser.email || 'User';
      const phoneNumber = data.phoneNumber !== undefined ? data.phoneNumber : (authUser.phoneNumber || null);

      const customPhotoUrl = data.customPhotoUrl || null;
      const avatarId = data.avatarId || null;

      // Handle avatar resolution with exact precedence:
      // 1. Explicitly uploaded custom photo
      // 2. Explicitly chosen MindTrail preset avatar
      // 3. Authenticated Firebase user's photoURL (Google profile photo) when no custom/preset is selected
      // 4. Fallback to initials
      let avatarType: AvatarType = data.avatarType;

      if (customPhotoUrl && avatarType === 'custom') {
        avatarType = 'custom';
      } else if (avatarId && avatarType === 'preset') {
        avatarType = 'preset';
      } else if (isGoogle && googlePhotoUrl) {
        avatarType = 'google';
      } else if (!avatarType || avatarType === 'google') {
        avatarType = 'initials';
      }

      // Safe photoURL resolution
      const resolvedPhotoURL =
        googlePhotoUrl ||
        (data.photoURL && !data.photoURL.startsWith('data:') ? data.photoURL : null);

      // If document was missing attributes or needs Google photo sync, backfill non-destructively
      const needsBackfill =
        (data.firstName === undefined && derivedFirstName) ||
        (data.lastName === undefined && derivedLastName) ||
        !data.avatarType ||
        (isGoogle && googlePhotoUrl && data.photoURL !== googlePhotoUrl) ||
        (isGoogle && googlePhotoUrl && !customPhotoUrl && !avatarId && data.avatarType !== 'google');

      if (needsBackfill) {
        setDoc(
          userDocRef,
          sanitizePayload({
            firstName,
            lastName,
            displayName,
            avatarType,
            photoURL: resolvedPhotoURL,
            updatedAt: new Date().toISOString(),
          }),
          { merge: true }
        ).catch((err) => console.warn('[UserProfile backfill sync]:', err));
      }

      const profile: UserProfile = {
        uid,
        email: authUser.email,
        displayName,
        firstName: firstName || null,
        lastName: lastName || null,
        phoneNumber: phoneNumber || null,
        photoURL: resolvedPhotoURL,
        avatarType,
        avatarId: data.avatarId || null,
        customPhotoUrl: data.customPhotoUrl || null,
        emailVerified: authUser.emailVerified,
        providerId,
        themePreference: data.themePreference || undefined,
        hasCompletedFirstVisit: data.hasCompletedFirstVisit !== undefined ? data.hasCompletedFirstVisit : true,
        createdAt: data.createdAt,
        updatedAt: data.updatedAt,
      };

      try {
        localStorage.setItem(`${LOCAL_STORAGE_PROFILE_PREFIX}${uid}`, JSON.stringify(profile));
      } catch {
        // Ignore quota/storage errors
      }

      return profile;
    } else {
      // Document does not exist yet. Initialize it immediately.
      const initialAvatarType: AvatarType = isGoogle && googlePhotoUrl ? 'google' : 'initials';
      const initialProfile: UserProfile = {
        uid,
        email: authUser.email,
        displayName: authDisplayName || [derivedFirstName, derivedLastName].filter(Boolean).join(' ') || 'User',
        firstName: derivedFirstName || null,
        lastName: derivedLastName || null,
        phoneNumber: authUser.phoneNumber || null,
        photoURL: googlePhotoUrl || null,
        avatarType: initialAvatarType,
        avatarId: null,
        customPhotoUrl: null,
        emailVerified: authUser.emailVerified,
        providerId,
        hasCompletedFirstVisit: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      try {
        await setDoc(
          userDocRef,
          sanitizePayload({
            uid: initialProfile.uid,
            email: initialProfile.email,
            displayName: initialProfile.displayName,
            firstName: initialProfile.firstName,
            lastName: initialProfile.lastName,
            phoneNumber: initialProfile.phoneNumber,
            photoURL: initialProfile.photoURL,
            avatarType: initialProfile.avatarType,
            hasCompletedFirstVisit: false,
            createdAt: initialProfile.createdAt,
            updatedAt: initialProfile.updatedAt,
          }),
          { merge: true }
        );
      } catch (writeErr) {
        console.warn('[UserProfile init write error]:', writeErr);
      }

      try {
        localStorage.setItem(`${LOCAL_STORAGE_PROFILE_PREFIX}${uid}`, JSON.stringify(initialProfile));
      } catch {
        // Ignore
      }

      return initialProfile;
    }
  } catch (err) {
    console.warn('[fetchOrCreateUserProfile fallback]:', err);

    // Check local storage cache as graceful offline fallback
    try {
      const cached = localStorage.getItem(`${LOCAL_STORAGE_PROFILE_PREFIX}${uid}`);
      if (cached) {
        return JSON.parse(cached);
      }
    } catch {
      // Ignore
    }

    return {
      uid,
      email: authUser.email,
      displayName: authDisplayName || 'User',
      firstName: derivedFirstName || null,
      lastName: derivedLastName || null,
      phoneNumber: authUser.phoneNumber || null,
      photoURL: googlePhotoUrl || null,
      avatarType: isGoogle && googlePhotoUrl ? 'google' : 'initials',
      emailVerified: authUser.emailVerified,
      providerId,
    };
  }
}

/**
 * Persists partial profile updates to Firestore and keeps local state & Auth synchronized.
 */
export async function saveUserProfile(
  uid: string,
  updates: Partial<UserProfile>
): Promise<void> {
  const userDocRef = doc(db, 'users', uid);
  const now = new Date().toISOString();

  // 1. Persist to Firestore with undefined-stripping
  await setDoc(
    userDocRef,
    sanitizePayload({
      ...updates,
      updatedAt: now,
    }),
    { merge: true }
  );

  // 2. Safely sync displayName with Firebase Auth if updated
  if (updates.displayName && auth.currentUser) {
    try {
      await updateProfile(auth.currentUser, {
        displayName: updates.displayName.trim(),
      });
    } catch (authErr) {
      console.warn('[Auth Profile DisplayName sync notice]:', authErr);
    }
  }

  // 3. For Google photo synchronization, safely update Firebase Auth photoURL if it is a valid https URL.
  // Never pass long base64 data URIs to Firebase Auth to prevent "Photo URL too long" errors.
  // Never clear auth.currentUser.photoURL when switching to custom or preset to preserve the Google profile photo on the auth user.
  if (auth.currentUser) {
    if (updates.avatarType === 'google' && updates.photoURL && !updates.photoURL.startsWith('data:')) {
      try {
        await updateProfile(auth.currentUser, { photoURL: updates.photoURL });
      } catch (authErr) {
        console.warn('[Auth Profile Google Photo sync notice]:', authErr);
      }
    }
  }

  // 4. Update local storage cache
  try {
    const cacheKey = `${LOCAL_STORAGE_PROFILE_PREFIX}${uid}`;
    const existing = localStorage.getItem(cacheKey);
    const merged = existing ? { ...JSON.parse(existing), ...updates, updatedAt: now } : updates;
    localStorage.setItem(cacheKey, JSON.stringify(merged));
  } catch {
    // Ignore
  }
}

export interface NotificationPreferences {
  enabled: boolean;
  frequency: 'daily' | 'weekly';
  time: string; // e.g. "08:00", "20:00"
  dayOfWeek?: string; // e.g. "Monday", "Sunday"
  updatedAt?: string;
}

export async function fetchNotificationPreferences(uid: string): Promise<NotificationPreferences> {
  try {
    const prefDocRef = doc(db, 'users', uid, 'preferences', 'notifications');
    const snap = await getDoc(prefDocRef);
    if (snap.exists()) {
      const data = snap.data();
      return {
        enabled: Boolean(data.enabled),
        frequency: data.frequency === 'weekly' ? 'weekly' : 'daily',
        time: data.time || '20:00',
        dayOfWeek: data.dayOfWeek || 'Sunday',
        updatedAt: data.updatedAt,
      };
    }
  } catch (err) {
    console.warn('[fetchNotificationPreferences error]:', err);
  }
  return {
    enabled: false,
    frequency: 'daily',
    time: '20:00',
    dayOfWeek: 'Sunday',
  };
}

export async function saveNotificationPreferences(
  uid: string,
  prefs: NotificationPreferences
): Promise<void> {
  const prefDocRef = doc(db, 'users', uid, 'preferences', 'notifications');
  await setDoc(
    prefDocRef,
    sanitizePayload({
      ...prefs,
      updatedAt: new Date().toISOString(),
    }),
    { merge: true }
  );
}

