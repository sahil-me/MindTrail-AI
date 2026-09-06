import React, { useState, useRef, useEffect } from 'react';
import {
  ArrowLeft,
  User,
  Sliders,
  Shield,
  Trash2,
  AlertTriangle,
  LogOut,
  CheckCircle2,
  AlertCircle,
  Edit3,
  Camera,
  Check,
  RefreshCw,
  Sun,
  Moon,
  Sparkles,
  Lock,
  Phone,
  Grid,
  X,
  Mail,
} from 'lucide-react';
import { UserProfile, AvatarType } from '../types';
import { auth, sendEmailVerification } from '../firebase';
import { ThemeMode, getStoredTheme, applyTheme } from '../utils/theme';
import { PRESET_AVATARS, AvatarBadge } from '../utils/avatarPresets';
import {
  saveUserProfile,
  compressAndResizeAvatar,
} from '../utils/userProfile';

interface AccountPageProps {
  user: UserProfile;
  entriesCount: number;
  onBackToJournal: () => void;
  onSignOut: () => Promise<void>;
  onDeleteAccount: () => Promise<{ success: boolean; error?: string }>;
  onUpdateProfile: (updated: Partial<UserProfile>) => void;
}

export const AccountPage: React.FC<AccountPageProps> = ({
  user,
  entriesCount,
  onBackToJournal,
  onSignOut,
  onDeleteAccount,
  onUpdateProfile,
}) => {
  // Display Name editing
  const [isEditingDisplayName, setIsEditingDisplayName] = useState(false);
  const [displayNameInput, setDisplayNameInput] = useState(user.displayName || '');
  const [isSavingDisplayName, setIsSavingDisplayName] = useState(false);
  const [displayNameError, setDisplayNameError] = useState<string | null>(null);
  const [displayNameSuccess, setDisplayNameSuccess] = useState(false);

  // First Name editing
  const [isEditingFirstName, setIsEditingFirstName] = useState(false);
  const [firstNameInput, setFirstNameInput] = useState(user.firstName || '');
  const [isSavingFirstName, setIsSavingFirstName] = useState(false);
  const [firstNameError, setFirstNameError] = useState<string | null>(null);
  const [firstNameSuccess, setFirstNameSuccess] = useState(false);

  // Last Name editing
  const [isEditingLastName, setIsEditingLastName] = useState(false);
  const [lastNameInput, setLastNameInput] = useState(user.lastName || '');
  const [isSavingLastName, setIsSavingLastName] = useState(false);
  const [lastNameError, setLastNameError] = useState<string | null>(null);
  const [lastNameSuccess, setLastNameSuccess] = useState(false);

  // Phone Number editing
  const [isEditingPhone, setIsEditingPhone] = useState(false);
  const [phoneInput, setPhoneInput] = useState(user.phoneNumber || '');
  const [isSavingPhone, setIsSavingPhone] = useState(false);
  const [phoneError, setPhoneError] = useState<string | null>(null);
  const [phoneSuccess, setPhoneSuccess] = useState(false);

  // Avatar Management
  const [showPresetPicker, setShowPresetPicker] = useState(false);
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);
  const [photoError, setPhotoError] = useState<string | null>(null);
  const [photoSuccessMessage, setPhotoSuccessMessage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Email verification resend
  const [isSendingVerification, setIsSendingVerification] = useState(false);
  const [verificationSent, setVerificationSent] = useState(false);

  // Preferences: Theme
  const [currentTheme, setCurrentTheme] = useState<ThemeMode>(() => getStoredTheme(user.uid));

  // Danger Zone: Delete Account Dialog
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const isGoogleAccount =
    user.providerId === 'google.com' ||
    auth.currentUser?.providerData.some((p) => p.providerId === 'google.com');

  const googleProviderPhoto =
    auth.currentUser?.providerData.find((p) => p.providerId === 'google.com')?.photoURL || null;

  const effectiveGooglePhotoUrl =
    (auth.currentUser?.photoURL && !auth.currentUser.photoURL.startsWith('data:')
      ? auth.currentUser.photoURL
      : null) ||
    googleProviderPhoto ||
    (user.photoURL && !user.photoURL.startsWith('data:') ? user.photoURL : null);

  const hasGooglePhoto = Boolean(
    effectiveGooglePhotoUrl &&
      (effectiveGooglePhotoUrl.includes('googleusercontent.com') ||
        effectiveGooglePhotoUrl.includes('google.com') ||
        isGoogleAccount)
  );

  // 1. Save Display Name
  const handleSaveDisplayName = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const trimmed = displayNameInput.trim();
    if (!trimmed) {
      setDisplayNameError('Display name cannot be empty.');
      return;
    }
    if (trimmed.length > 50) {
      setDisplayNameError('Display name must be 50 characters or less.');
      return;
    }

    setIsSavingDisplayName(true);
    setDisplayNameError(null);

    try {
      await saveUserProfile(user.uid, { displayName: trimmed });
      onUpdateProfile({ displayName: trimmed });
      setDisplayNameSuccess(true);
      setIsEditingDisplayName(false);
      setTimeout(() => setDisplayNameSuccess(false), 3000);
    } catch (err: any) {
      console.warn('[AccountPage] Display name update error:', err);
      setDisplayNameError('Failed to save display name. Please try again.');
    } finally {
      setIsSavingDisplayName(false);
    }
  };

  // 2. Save First Name
  const handleSaveFirstName = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const trimmed = firstNameInput.trim();

    setIsSavingFirstName(true);
    setFirstNameError(null);

    try {
      await saveUserProfile(user.uid, { firstName: trimmed || null });
      onUpdateProfile({ firstName: trimmed || null });
      setFirstNameSuccess(true);
      setIsEditingFirstName(false);
      setTimeout(() => setFirstNameSuccess(false), 3000);
    } catch (err: any) {
      console.warn('[AccountPage] First name update error:', err);
      setFirstNameError('Failed to save first name. Please try again.');
    } finally {
      setIsSavingFirstName(false);
    }
  };

  // 3. Save Last Name
  const handleSaveLastName = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const trimmed = lastNameInput.trim();

    setIsSavingLastName(true);
    setLastNameError(null);

    try {
      await saveUserProfile(user.uid, { lastName: trimmed || null });
      onUpdateProfile({ lastName: trimmed || null });
      setLastNameSuccess(true);
      setIsEditingLastName(false);
      setTimeout(() => setLastNameSuccess(false), 3000);
    } catch (err: any) {
      console.warn('[AccountPage] Last name update error:', err);
      setLastNameError('Failed to save last name. Please try again.');
    } finally {
      setIsSavingLastName(false);
    }
  };

  // 4. Save Phone Number
  const handleSavePhone = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const trimmed = phoneInput.trim();

    if (trimmed) {
      const phoneRegex = /^[+]?[0-9\s\-()]{7,20}$/;
      if (!phoneRegex.test(trimmed)) {
        setPhoneError('Please enter a valid phone number (e.g. +91 97000 00000).');
        return;
      }
    }

    setIsSavingPhone(true);
    setPhoneError(null);

    try {
      await saveUserProfile(user.uid, { phoneNumber: trimmed || null });
      onUpdateProfile({ phoneNumber: trimmed || null });
      setPhoneSuccess(true);
      setIsEditingPhone(false);
      setTimeout(() => setPhoneSuccess(false), 3000);
    } catch (err: any) {
      console.warn('[AccountPage] Phone update error:', err);
      setPhoneError('Failed to save phone number. Please try again.');
    } finally {
      setIsSavingPhone(false);
    }
  };

  // 5. Custom Photo Upload
  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploadingPhoto(true);
    setPhotoError(null);

    try {
      const compressedDataUri = await compressAndResizeAvatar(file);

      // Save custom compressed image to Firestore user doc
      await saveUserProfile(user.uid, {
        customPhotoUrl: compressedDataUri,
        avatarId: null,
        avatarType: 'custom' as AvatarType,
      });

      onUpdateProfile({
        customPhotoUrl: compressedDataUri,
        avatarId: null,
        avatarType: 'custom' as AvatarType,
      });

      setPhotoSuccessMessage('Profile photo updated successfully.');
      setShowPresetPicker(false);
      setTimeout(() => setPhotoSuccessMessage(null), 3000);
    } catch (err: any) {
      console.warn('[AccountPage] Photo upload error:', err);
      // Clean, user-facing error message without raw Firebase codes
      setPhotoError(err?.message || "Photo couldn't be uploaded. Please try another image.");
    } finally {
      setIsUploadingPhoto(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  // 6. Select Preset Avatar
  const handleSelectPreset = async (presetId: string) => {
    setIsUploadingPhoto(true);
    setPhotoError(null);

    try {
      await saveUserProfile(user.uid, {
        avatarId: presetId,
        customPhotoUrl: null,
        avatarType: 'preset' as AvatarType,
      });

      onUpdateProfile({
        avatarId: presetId,
        customPhotoUrl: null,
        avatarType: 'preset' as AvatarType,
      });

      setPhotoSuccessMessage('Profile avatar updated successfully.');
      setShowPresetPicker(false);
      setTimeout(() => setPhotoSuccessMessage(null), 3000);
    } catch (err: any) {
      console.warn('[AccountPage] Preset avatar selection error:', err);
      setPhotoError("Couldn't set preset avatar. Please try again.");
    } finally {
      setIsUploadingPhoto(false);
    }
  };

  // 7. Use Google Photo
  const handleUseGooglePhoto = async () => {
    if (!effectiveGooglePhotoUrl) return;

    setIsUploadingPhoto(true);
    setPhotoError(null);

    try {
      await saveUserProfile(user.uid, {
        photoURL: effectiveGooglePhotoUrl,
        customPhotoUrl: null,
        avatarId: null,
        avatarType: 'google' as AvatarType,
      });

      onUpdateProfile({
        photoURL: effectiveGooglePhotoUrl,
        customPhotoUrl: null,
        avatarId: null,
        avatarType: 'google' as AvatarType,
      });

      setPhotoSuccessMessage('Switched to Google profile photo.');
      setShowPresetPicker(false);
      setTimeout(() => setPhotoSuccessMessage(null), 3000);
    } catch (err: any) {
      console.warn('[AccountPage] Restore Google photo error:', err);
      setPhotoError("Couldn't switch to Google photo. Please try again.");
    } finally {
      setIsUploadingPhoto(false);
    }
  };

  // 8. Remove Custom Photo
  const handleRemovePhoto = async () => {
    setIsUploadingPhoto(true);
    setPhotoError(null);

    try {
      const fallbackType: AvatarType = user.avatarId
        ? 'preset'
        : isGoogleAccount && hasGooglePhoto && effectiveGooglePhotoUrl
        ? 'google'
        : 'initials';

      await saveUserProfile(user.uid, {
        customPhotoUrl: null,
        avatarType: fallbackType,
        ...(fallbackType === 'google' && effectiveGooglePhotoUrl ? { photoURL: effectiveGooglePhotoUrl } : {}),
      });

      onUpdateProfile({
        customPhotoUrl: null,
        avatarType: fallbackType,
        ...(fallbackType === 'google' && effectiveGooglePhotoUrl ? { photoURL: effectiveGooglePhotoUrl } : {}),
      });

      setPhotoSuccessMessage(
        fallbackType === 'google'
          ? 'Custom photo removed. Switched back to Google profile photo.'
          : 'Profile photo removed successfully.'
      );
      setTimeout(() => setPhotoSuccessMessage(null), 3000);
    } catch (err: any) {
      console.warn('[AccountPage] Photo remove error:', err);
      setPhotoError('Failed to remove photo.');
    } finally {
      setIsUploadingPhoto(false);
    }
  };

  // 8b. Remove Preset Avatar
  const handleRemovePreset = async () => {
    setIsUploadingPhoto(true);
    setPhotoError(null);

    try {
      const fallbackType: AvatarType =
        isGoogleAccount && hasGooglePhoto && effectiveGooglePhotoUrl
          ? 'google'
          : 'initials';

      await saveUserProfile(user.uid, {
        avatarId: null,
        customPhotoUrl: null,
        avatarType: fallbackType,
        ...(fallbackType === 'google' && effectiveGooglePhotoUrl ? { photoURL: effectiveGooglePhotoUrl } : {}),
      });

      onUpdateProfile({
        avatarId: null,
        customPhotoUrl: null,
        avatarType: fallbackType,
        ...(fallbackType === 'google' && effectiveGooglePhotoUrl ? { photoURL: effectiveGooglePhotoUrl } : {}),
      });

      setPhotoSuccessMessage(
        fallbackType === 'google'
          ? 'Preset avatar removed. Switched back to Google profile photo.'
          : 'Preset avatar removed.'
      );
      setShowPresetPicker(false);
      setTimeout(() => setPhotoSuccessMessage(null), 3000);
    } catch (err: any) {
      console.warn('[AccountPage] Preset avatar remove error:', err);
      setPhotoError('Failed to remove avatar.');
    } finally {
      setIsUploadingPhoto(false);
    }
  };

  // 9. Change Theme Preference
  const handleThemeChange = (newTheme: ThemeMode) => {
    setCurrentTheme(newTheme);
    applyTheme(newTheme, user.uid);

    saveUserProfile(user.uid, {
      themePreference: newTheme,
    }).catch((err) => console.warn('[AccountPage] Theme preference sync notice:', err));
  };

  // 10. Resend verification email
  const handleResendVerification = async () => {
    if (!auth.currentUser) return;
    setIsSendingVerification(true);
    try {
      await sendEmailVerification(auth.currentUser);
      setVerificationSent(true);
      setTimeout(() => setVerificationSent(false), 5000);
    } catch (err: any) {
      console.warn('[AccountPage] Resend verification failed:', err);
    } finally {
      setIsSendingVerification(false);
    }
  };

  // 11. Delete Account
  const handleConfirmDelete = async () => {
    setIsDeleting(true);
    setDeleteError(null);

    const result = await onDeleteAccount();
    if (!result.success) {
      setIsDeleting(false);
      setDeleteError(result.error || 'Failed to delete account. Please re-authenticate and try again.');
    } else {
      setIsDeleting(false);
      setShowDeleteDialog(false);
    }
  };

  return (
    <div id="account-page-view" className="w-full max-w-3xl mx-auto py-4 sm:py-8 px-4">
      {/* Top Breadcrumb & Navigation */}
      <div className="mb-6">
        <button
          id="btn-back-to-journal"
          type="button"
          onClick={onBackToJournal}
          className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-medium text-stone-600 dark:text-stone-300 hover:text-stone-900 dark:hover:text-white hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Journal</span>
        </button>
      </div>

      {/* Page Header */}
      <div id="account-page-header" className="mb-8">
        <h1 className="text-2xl sm:text-3xl font-serif-title font-semibold text-stone-900 dark:text-stone-50 tracking-tight">
          Account
        </h1>
        <p className="text-sm text-stone-500 dark:text-stone-400 mt-1">
          Manage your profile, preferences, privacy, and account settings.
        </p>
      </div>

      {/* Main Content Sections */}
      <div className="space-y-8">
        {/* ================================================== */}
        {/* 1. PROFILE SECTION                                */}
        {/* ================================================== */}
        <section id="section-account-profile" className="space-y-3">
          <div className="flex items-center gap-2">
            <User className="w-4 h-4 text-stone-500 dark:text-stone-400" />
            <h2 className="text-xs font-bold uppercase tracking-wider text-stone-600 dark:text-stone-300">
              Profile
            </h2>
          </div>

          <div className="bg-white dark:bg-stone-900 rounded-2xl border border-stone-200 dark:border-stone-800 shadow-2xs divide-y divide-stone-100 dark:divide-stone-800/80 overflow-hidden">
            {/* Profile Photo Item */}
            <div className="p-5 sm:p-6 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="space-y-1">
                  <h3 className="text-sm font-semibold text-stone-900 dark:text-stone-100">
                    Profile Photo
                  </h3>
                  <p className="text-xs text-stone-500 dark:text-stone-400">
                    Your personal avatar shown throughout MindTrail.
                  </p>
                </div>

                <div className="flex items-center gap-3 sm:gap-4">
                  {/* Unified Avatar Display */}
                  <AvatarBadge user={user} size="xl" idPrefix="account-page-avatar" />

                  {/* Photo Actions */}
                  <div className="flex flex-col gap-1.5">
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/png,image/jpeg,image/webp,image/jpg"
                      onChange={handlePhotoUpload}
                      className="hidden"
                      id="account-photo-file-input"
                    />

                    <div className="flex items-center gap-2">
                      <button
                        id="btn-upload-photo"
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        disabled={isUploadingPhoto}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 hover:bg-stone-100 dark:hover:bg-stone-750 text-stone-700 dark:text-stone-200 text-xs font-medium transition-colors cursor-pointer disabled:opacity-50"
                      >
                        {isUploadingPhoto ? (
                          <RefreshCw className="w-3.5 h-3.5 animate-spin text-stone-500" />
                        ) : (
                          <Camera className="w-3.5 h-3.5 text-stone-500 dark:text-stone-400" />
                        )}
                        <span>{isUploadingPhoto ? 'Uploading...' : 'Upload photo'}</span>
                      </button>

                      <button
                        id="btn-choose-avatar"
                        type="button"
                        onClick={() => setShowPresetPicker(!showPresetPicker)}
                        disabled={isUploadingPhoto}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 hover:bg-stone-100 dark:hover:bg-stone-750 text-stone-700 dark:text-stone-200 text-xs font-medium transition-colors cursor-pointer disabled:opacity-50"
                      >
                        <Grid className="w-3.5 h-3.5 text-stone-500 dark:text-stone-400" />
                        <span>Choose avatar</span>
                      </button>
                    </div>

                    <div className="flex items-center gap-3">
                      {/* Option to revert to Google Photo if custom or preset is currently active */}
                      {isGoogleAccount && hasGooglePhoto && (user.avatarType === 'custom' || user.avatarType === 'preset') && (
                        <button
                          id="btn-use-google-photo"
                          type="button"
                          onClick={handleUseGooglePhoto}
                          disabled={isUploadingPhoto}
                          className="text-xs text-amber-700 hover:text-amber-850 dark:text-amber-400 dark:hover:text-amber-300 font-medium transition-colors text-left cursor-pointer"
                        >
                          Use Google photo
                        </button>
                      )}

                      {/* Remove Custom Photo */}
                      {user.avatarType === 'custom' && (
                        <button
                          id="btn-remove-photo"
                          type="button"
                          onClick={handleRemovePhoto}
                          disabled={isUploadingPhoto}
                          className="text-xs text-stone-500 hover:text-rose-600 dark:text-stone-400 dark:hover:text-rose-400 transition-colors text-left font-medium cursor-pointer"
                        >
                          Remove photo
                        </button>
                      )}

                      {/* Remove Preset Avatar */}
                      {user.avatarType === 'preset' && (
                        <button
                          id="btn-remove-preset"
                          type="button"
                          onClick={handleRemovePreset}
                          disabled={isUploadingPhoto}
                          className="text-xs text-stone-500 hover:text-rose-600 dark:text-stone-400 dark:hover:text-rose-400 transition-colors text-left font-medium cursor-pointer"
                        >
                          {isGoogleAccount && hasGooglePhoto ? 'Reset to Google photo' : 'Remove avatar'}
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Preset Avatar Selection Grid (collapsible) */}
              {showPresetPicker && (
                <div
                  id="preset-avatar-picker-panel"
                  className="p-4 rounded-xl bg-stone-50/80 dark:bg-stone-850/60 border border-stone-200 dark:border-stone-800 space-y-3 animate-in fade-in duration-150"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-xs font-semibold text-stone-900 dark:text-stone-100">
                        Choose a Mindful Preset Avatar
                      </h4>
                      <p className="text-[11px] text-stone-500 dark:text-stone-400">
                        Minimalist illustrations designed for quiet personal reflection.
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setShowPresetPicker(false)}
                      className="text-stone-400 hover:text-stone-600 dark:hover:text-stone-200 p-1 rounded-lg"
                      title="Close"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-1">
                    {PRESET_AVATARS.map((preset) => {
                      const isSelected =
                        user.avatarType === 'preset' && user.avatarId === preset.id;
                      return (
                        <button
                          key={preset.id}
                          id={`preset-option-${preset.id}`}
                          type="button"
                          onClick={() => handleSelectPreset(preset.id)}
                          disabled={isUploadingPhoto}
                          className={`flex items-center gap-2.5 p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                            isSelected
                              ? 'border-amber-500 bg-amber-50/60 dark:bg-amber-950/40 ring-1 ring-amber-500/40'
                              : 'border-stone-200 dark:border-stone-750 bg-white dark:bg-stone-800 hover:border-stone-300 dark:hover:border-stone-700'
                          }`}
                        >
                          <div
                            className={`w-9 h-9 rounded-xl bg-linear-to-br ${preset.bgGradient} flex items-center justify-center shrink-0 border`}
                          >
                            {preset.renderIcon('w-5 h-5')}
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="text-xs font-semibold text-stone-900 dark:text-stone-100 truncate">
                              {preset.name}
                            </p>
                            <p className="text-[10px] text-stone-500 dark:text-stone-400 truncate">
                              {preset.subtitle}
                            </p>
                          </div>
                          {isSelected && (
                            <Check className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400 shrink-0" />
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Photo Feedback Messages */}
              {(photoError || photoSuccessMessage) && (
                <div
                  id="photo-feedback-message"
                  className="px-3.5 py-2 rounded-xl bg-stone-50 dark:bg-stone-850 border border-stone-200/60 dark:border-stone-800 text-xs"
                >
                  {photoError && (
                    <p className="text-rose-600 dark:text-rose-400 font-medium">{photoError}</p>
                  )}
                  {photoSuccessMessage && (
                    <p className="text-emerald-600 dark:text-emerald-400 font-medium">
                      ✓ {photoSuccessMessage}
                    </p>
                  )}
                </div>
              )}
            </div>

            {/* Display Name Item */}
            <div className="p-5 sm:p-6 space-y-2">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-semibold text-stone-900 dark:text-stone-100">
                    Display Name
                  </h3>
                  <p className="text-xs text-stone-500 dark:text-stone-400">
                    Your name displayed in your reflections and journal headers.
                  </p>
                </div>

                {!isEditingDisplayName && (
                  <button
                    id="btn-edit-display-name"
                    type="button"
                    onClick={() => {
                      setDisplayNameInput(user.displayName || '');
                      setDisplayNameError(null);
                      setIsEditingDisplayName(true);
                    }}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-800 hover:bg-stone-100 dark:hover:bg-stone-750 text-xs font-medium text-stone-700 dark:text-stone-200 transition-colors cursor-pointer"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                    <span>Edit</span>
                  </button>
                )}
              </div>

              {isEditingDisplayName ? (
                <form onSubmit={handleSaveDisplayName} className="pt-2 space-y-2">
                  <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                    <input
                      id="input-display-name"
                      type="text"
                      value={displayNameInput}
                      onChange={(e) => setDisplayNameInput(e.target.value)}
                      placeholder="e.g. Sahil S."
                      maxLength={50}
                      className="flex-1 px-3.5 py-2 rounded-xl border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-800 text-sm text-stone-900 dark:text-stone-100 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-600"
                      autoFocus
                    />
                    <div className="flex items-center gap-2">
                      <button
                        id="btn-save-display-name"
                        type="submit"
                        disabled={isSavingDisplayName}
                        className="inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl bg-stone-900 dark:bg-stone-100 text-stone-50 dark:text-stone-900 text-xs font-semibold hover:bg-stone-800 dark:hover:bg-white transition-colors cursor-pointer disabled:opacity-50"
                      >
                        {isSavingDisplayName ? (
                          <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                        ) : (
                          <Check className="w-3.5 h-3.5" />
                        )}
                        <span>Save</span>
                      </button>
                      <button
                        id="btn-cancel-display-name"
                        type="button"
                        onClick={() => {
                          setIsEditingDisplayName(false);
                          setDisplayNameError(null);
                        }}
                        disabled={isSavingDisplayName}
                        className="px-3.5 py-2 rounded-xl border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-800 text-stone-600 dark:text-stone-300 text-xs font-medium hover:bg-stone-100 dark:hover:bg-stone-750 transition-colors cursor-pointer"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                  {displayNameError && (
                    <p className="text-xs text-rose-600 dark:text-rose-400">{displayNameError}</p>
                  )}
                </form>
              ) : (
                <div className="flex items-center justify-between pt-1">
                  <span
                    id="account-display-name-val"
                    className="text-sm font-medium text-stone-800 dark:text-stone-200"
                  >
                    {user.displayName || 'No display name set'}
                  </span>
                </div>
              )}

              {displayNameSuccess && (
                <p className="text-xs text-emerald-600 dark:text-emerald-400 pt-1">
                  ✓ Display name updated successfully.
                </p>
              )}
            </div>

            {/* First Name Item */}
            <div className="p-5 sm:p-6 space-y-2">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-semibold text-stone-900 dark:text-stone-100">
                    First Name
                  </h3>
                  <p className="text-xs text-stone-500 dark:text-stone-400">
                    Your profile first name identity.
                  </p>
                </div>

                {!isEditingFirstName && (
                  <button
                    id="btn-edit-first-name"
                    type="button"
                    onClick={() => {
                      setFirstNameInput(user.firstName || '');
                      setFirstNameError(null);
                      setIsEditingFirstName(true);
                    }}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-800 hover:bg-stone-100 dark:hover:bg-stone-750 text-xs font-medium text-stone-700 dark:text-stone-200 transition-colors cursor-pointer"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                    <span>Edit</span>
                  </button>
                )}
              </div>

              {isEditingFirstName ? (
                <form onSubmit={handleSaveFirstName} className="pt-2 space-y-2">
                  <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                    <input
                      id="input-first-name"
                      type="text"
                      value={firstNameInput}
                      onChange={(e) => setFirstNameInput(e.target.value)}
                      placeholder="e.g. Sahil"
                      maxLength={50}
                      className="flex-1 px-3.5 py-2 rounded-xl border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-800 text-sm text-stone-900 dark:text-stone-100 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-600"
                      autoFocus
                    />
                    <div className="flex items-center gap-2">
                      <button
                        id="btn-save-first-name"
                        type="submit"
                        disabled={isSavingFirstName}
                        className="inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl bg-stone-900 dark:bg-stone-100 text-stone-50 dark:text-stone-900 text-xs font-semibold hover:bg-stone-800 dark:hover:bg-white transition-colors cursor-pointer disabled:opacity-50"
                      >
                        {isSavingFirstName ? (
                          <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                        ) : (
                          <Check className="w-3.5 h-3.5" />
                        )}
                        <span>Save</span>
                      </button>
                      <button
                        id="btn-cancel-first-name"
                        type="button"
                        onClick={() => {
                          setIsEditingFirstName(false);
                          setFirstNameError(null);
                        }}
                        disabled={isSavingFirstName}
                        className="px-3.5 py-2 rounded-xl border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-800 text-stone-600 dark:text-stone-300 text-xs font-medium hover:bg-stone-100 dark:hover:bg-stone-750 transition-colors cursor-pointer"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                  {firstNameError && (
                    <p className="text-xs text-rose-600 dark:text-rose-400">{firstNameError}</p>
                  )}
                </form>
              ) : (
                <div className="flex items-center justify-between pt-1">
                  <span
                    id="account-first-name-val"
                    className="text-sm font-medium text-stone-800 dark:text-stone-200"
                  >
                    {user.firstName || 'Not provided'}
                  </span>
                </div>
              )}

              {firstNameSuccess && (
                <p className="text-xs text-emerald-600 dark:text-emerald-400 pt-1">
                  ✓ First name updated successfully.
                </p>
              )}
            </div>

            {/* Last Name Item */}
            <div className="p-5 sm:p-6 space-y-2">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-semibold text-stone-900 dark:text-stone-100">
                    Last Name
                  </h3>
                  <p className="text-xs text-stone-500 dark:text-stone-400">
                    Your profile last name identity.
                  </p>
                </div>

                {!isEditingLastName && (
                  <button
                    id="btn-edit-last-name"
                    type="button"
                    onClick={() => {
                      setLastNameInput(user.lastName || '');
                      setLastNameError(null);
                      setIsEditingLastName(true);
                    }}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-800 hover:bg-stone-100 dark:hover:bg-stone-750 text-xs font-medium text-stone-700 dark:text-stone-200 transition-colors cursor-pointer"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                    <span>Edit</span>
                  </button>
                )}
              </div>

              {isEditingLastName ? (
                <form onSubmit={handleSaveLastName} className="pt-2 space-y-2">
                  <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                    <input
                      id="input-last-name"
                      type="text"
                      value={lastNameInput}
                      onChange={(e) => setLastNameInput(e.target.value)}
                      placeholder="e.g. Sharma"
                      maxLength={50}
                      className="flex-1 px-3.5 py-2 rounded-xl border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-800 text-sm text-stone-900 dark:text-stone-100 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-600"
                      autoFocus
                    />
                    <div className="flex items-center gap-2">
                      <button
                        id="btn-save-last-name"
                        type="submit"
                        disabled={isSavingLastName}
                        className="inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl bg-stone-900 dark:bg-stone-100 text-stone-50 dark:text-stone-900 text-xs font-semibold hover:bg-stone-800 dark:hover:bg-white transition-colors cursor-pointer disabled:opacity-50"
                      >
                        {isSavingLastName ? (
                          <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                        ) : (
                          <Check className="w-3.5 h-3.5" />
                        )}
                        <span>Save</span>
                      </button>
                      <button
                        id="btn-cancel-last-name"
                        type="button"
                        onClick={() => {
                          setIsEditingLastName(false);
                          setLastNameError(null);
                        }}
                        disabled={isSavingLastName}
                        className="px-3.5 py-2 rounded-xl border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-800 text-stone-600 dark:text-stone-300 text-xs font-medium hover:bg-stone-100 dark:hover:bg-stone-750 transition-colors cursor-pointer"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                  {lastNameError && (
                    <p className="text-xs text-rose-600 dark:text-rose-400">{lastNameError}</p>
                  )}
                </form>
              ) : (
                <div className="flex items-center justify-between pt-1">
                  <span
                    id="account-last-name-val"
                    className="text-sm font-medium text-stone-800 dark:text-stone-200"
                  >
                    {user.lastName || 'Not provided'}
                  </span>
                </div>
              )}

              {lastNameSuccess && (
                <p className="text-xs text-emerald-600 dark:text-emerald-400 pt-1">
                  ✓ Last name updated successfully.
                </p>
              )}
            </div>

            {/* Email Address Item */}
            <div className="p-5 sm:p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="space-y-1">
                <h3 className="text-sm font-semibold text-stone-900 dark:text-stone-100">
                  Email Address
                </h3>
                <p className="text-xs text-stone-500 dark:text-stone-400">
                  The email address associated with your sign-in account.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                <span className="text-xs sm:text-sm font-medium text-stone-800 dark:text-stone-200 break-all">
                  {user.email || '—'}
                </span>

                {user.emailVerified ? (
                  <span
                    id="badge-email-verified"
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/80 w-fit"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                    <span>Email verified</span>
                  </span>
                ) : (
                  <div className="flex items-center gap-2">
                    <span
                      id="badge-email-unverified"
                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-50 dark:bg-amber-950/50 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-800/80"
                    >
                      <AlertCircle className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
                      <span>Email not verified</span>
                    </span>

                    {!verificationSent ? (
                      <button
                        type="button"
                        onClick={handleResendVerification}
                        disabled={isSendingVerification}
                        className="text-xs text-amber-800 dark:text-amber-300 underline font-medium hover:text-amber-900 cursor-pointer"
                      >
                        {isSendingVerification ? 'Sending...' : 'Resend link'}
                      </button>
                    ) : (
                      <span className="text-xs text-emerald-600 dark:text-emerald-400">
                        Link sent!
                      </span>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Phone Number Item */}
            <div className="p-5 sm:p-6 space-y-2">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-semibold text-stone-900 dark:text-stone-100">
                    Phone Number <span className="text-stone-400 font-normal text-xs">(Optional)</span>
                  </h3>
                  <p className="text-xs text-stone-500 dark:text-stone-400">
                    Optional contact number saved in your private profile.
                  </p>
                </div>

                {!isEditingPhone && (
                  <button
                    id="btn-edit-phone-number"
                    type="button"
                    onClick={() => {
                      setPhoneInput(user.phoneNumber || '');
                      setPhoneError(null);
                      setIsEditingPhone(true);
                    }}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-800 hover:bg-stone-100 dark:hover:bg-stone-750 text-xs font-medium text-stone-700 dark:text-stone-200 transition-colors cursor-pointer"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                    <span>{user.phoneNumber ? 'Edit' : 'Add'}</span>
                  </button>
                )}
              </div>

              {isEditingPhone ? (
                <form onSubmit={handleSavePhone} className="pt-2 space-y-2">
                  <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                    <input
                      id="input-account-phone"
                      type="tel"
                      value={phoneInput}
                      onChange={(e) => setPhoneInput(e.target.value)}
                      placeholder="+91 97000 00000"
                      className="flex-1 px-3.5 py-2 rounded-xl border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-800 text-sm text-stone-900 dark:text-stone-100 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-600"
                      autoFocus
                    />
                    <div className="flex items-center gap-2">
                      <button
                        id="btn-save-phone"
                        type="submit"
                        disabled={isSavingPhone}
                        className="inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl bg-stone-900 dark:bg-stone-100 text-stone-50 dark:text-stone-900 text-xs font-semibold hover:bg-stone-800 dark:hover:bg-white transition-colors cursor-pointer disabled:opacity-50"
                      >
                        {isSavingPhone ? (
                          <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                        ) : (
                          <Check className="w-3.5 h-3.5" />
                        )}
                        <span>Save</span>
                      </button>
                      <button
                        id="btn-cancel-phone"
                        type="button"
                        onClick={() => {
                          setIsEditingPhone(false);
                          setPhoneError(null);
                        }}
                        disabled={isSavingPhone}
                        className="px-3.5 py-2 rounded-xl border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-800 text-stone-600 dark:text-stone-300 text-xs font-medium hover:bg-stone-100 dark:hover:bg-stone-750 transition-colors cursor-pointer"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                  {phoneError && (
                    <p className="text-xs text-rose-600 dark:text-rose-400">{phoneError}</p>
                  )}
                </form>
              ) : (
                <div className="flex items-center justify-between pt-1">
                  <span
                    id="account-phone-val"
                    className={`text-sm font-medium ${
                      user.phoneNumber
                        ? 'text-stone-800 dark:text-stone-200'
                        : 'text-stone-400 dark:text-stone-500 italic'
                    }`}
                  >
                    {user.phoneNumber || 'Not added'}
                  </span>
                </div>
              )}

              {phoneSuccess && (
                <p className="text-xs text-emerald-600 dark:text-emerald-400 pt-1">
                  ✓ Phone number updated successfully.
                </p>
              )}
            </div>

            {/* Sign-in Method Item */}
            <div className="p-5 sm:p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div className="space-y-1">
                <h3 className="text-sm font-semibold text-stone-900 dark:text-stone-100">
                  Sign-in Method
                </h3>
                <p className="text-xs text-stone-500 dark:text-stone-400">
                  Primary authentication provider for this session.
                </p>
              </div>

              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-xs font-medium text-stone-700 dark:text-stone-200">
                {isGoogleAccount ? (
                  <>
                    <Sparkles className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
                    <span>Signed in with Google</span>
                  </>
                ) : user.providerId === 'phone' ? (
                  <>
                    <Phone className="w-3.5 h-3.5 text-stone-500 dark:text-stone-400" />
                    <span>Signed in with Phone</span>
                  </>
                ) : (
                  <>
                    <Lock className="w-3.5 h-3.5 text-stone-500 dark:text-stone-400" />
                    <span>Signed in with Email & Password</span>
                  </>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* ================================================== */}
        {/* 2. PREFERENCES SECTION                            */}
        {/* ================================================== */}
        <section id="section-account-preferences" className="space-y-3">
          <div className="flex items-center gap-2">
            <Sliders className="w-4 h-4 text-stone-500 dark:text-stone-400" />
            <h2 className="text-xs font-bold uppercase tracking-wider text-stone-600 dark:text-stone-300">
              Preferences
            </h2>
          </div>

          <div className="bg-white dark:bg-stone-900 rounded-2xl border border-stone-200 dark:border-stone-800 shadow-2xs divide-y divide-stone-100 dark:divide-stone-800/80 overflow-hidden">
            {/* Appearance Switcher (Light / Dark only, no System mode) */}
            <div className="p-5 sm:p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="space-y-1">
                <h3 className="text-sm font-semibold text-stone-900 dark:text-stone-100">
                  Appearance
                </h3>
                <p className="text-xs text-stone-500 dark:text-stone-400">
                  Choose your preferred theme.
                </p>
              </div>

              <div
                id="appearance-segmented-control"
                className="inline-flex items-center p-1 bg-stone-100 dark:bg-stone-800 rounded-xl border border-stone-200/80 dark:border-stone-700 text-xs"
              >
                <button
                  id="btn-theme-light"
                  type="button"
                  onClick={() => handleThemeChange('light')}
                  className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-lg font-medium transition-all cursor-pointer ${
                    currentTheme === 'light'
                      ? 'bg-white dark:bg-stone-700 text-stone-900 dark:text-white shadow-xs font-semibold'
                      : 'text-stone-600 dark:text-stone-300 hover:text-stone-900 dark:hover:text-stone-100'
                  }`}
                >
                  <Sun className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
                  <span>Light</span>
                </button>
                <button
                  id="btn-theme-dark"
                  type="button"
                  onClick={() => handleThemeChange('dark')}
                  className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-lg font-medium transition-all cursor-pointer ${
                    currentTheme === 'dark'
                      ? 'bg-stone-900 dark:bg-stone-700 text-white shadow-xs font-semibold'
                      : 'text-stone-600 dark:text-stone-300 hover:text-stone-900 dark:hover:text-stone-100'
                  }`}
                >
                  <Moon className="w-3.5 h-3.5 text-amber-400" />
                  <span>Dark</span>
                </button>
              </div>
            </div>

            {/* AI Reflection Intelligence */}
            <div className="p-5 sm:p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="space-y-1">
                <h3 className="text-sm font-semibold text-stone-900 dark:text-stone-100">
                  AI Reflection Intelligence
                </h3>
                <p className="text-xs text-stone-500 dark:text-stone-400">
                  Powers conversational reflections and Ask Memories
                </p>
              </div>

              <span
                id="badge-gemini-model"
                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-amber-100/80 dark:bg-amber-950/60 text-amber-900 dark:text-amber-200 border border-amber-200 dark:border-amber-800/80 w-fit"
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
                <span>Gemini 3.6 Flash</span>
              </span>
            </div>

            {/* Saved Reflections Count */}
            <div className="p-5 sm:p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div className="space-y-1">
                <h3 className="text-sm font-semibold text-stone-900 dark:text-stone-100">
                  Saved Reflections
                </h3>
                <p className="text-xs text-stone-500 dark:text-stone-400">
                  Your personal journal entries
                </p>
              </div>

              <span
                id="count-saved-reflections"
                className="text-xs sm:text-sm font-semibold text-stone-800 dark:text-stone-200"
              >
                {entriesCount} {entriesCount === 1 ? 'reflection' : 'reflections'}
              </span>
            </div>
          </div>
        </section>

        {/* ================================================== */}
        {/* 3. PRIVACY & SECURITY SECTION                     */}
        {/* ================================================== */}
        <section id="section-account-privacy" className="space-y-3">
          <div className="flex items-center gap-2">
            <Shield className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            <h2 className="text-xs font-bold uppercase tracking-wider text-stone-600 dark:text-stone-300">
              Privacy & Security
            </h2>
          </div>

          <div className="bg-emerald-50/40 dark:bg-emerald-950/20 rounded-2xl border border-emerald-200/80 dark:border-emerald-800/50 p-5 sm:p-6 space-y-4">
            <div className="flex items-start gap-3.5">
              <div className="w-9 h-9 rounded-xl bg-emerald-100 dark:bg-emerald-900/40 text-emerald-800 dark:text-emerald-300 flex items-center justify-center shrink-0 mt-0.5">
                <Lock className="w-4 h-4" />
              </div>
              <div className="space-y-1">
                <h3 className="text-sm font-semibold text-emerald-950 dark:text-emerald-100">
                  🔒 Private journal protection enabled
                </h3>
                <p className="text-xs text-emerald-900/80 dark:text-emerald-200/70 leading-relaxed">
                  Your reflections and conversations are protected by user-specific access controls.
                  Only your authenticated account can access your journal.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-3 border-t border-emerald-200/60 dark:border-emerald-800/40 text-xs">
              <div className="flex items-center gap-2 text-emerald-900 dark:text-emerald-200">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                <span className="font-medium">User-isolated access control</span>
              </div>
              <div className="flex items-center gap-2 text-emerald-900 dark:text-emerald-200">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                <span className="font-medium">Confidential AI prompts</span>
              </div>
            </div>
          </div>
        </section>

        {/* ================================================== */}
        {/* 4. ACCOUNT SECTION                                */}
        {/* ================================================== */}
        <section id="section-account-actions" className="space-y-3">
          <div className="flex items-center gap-2">
            <LogOut className="w-4 h-4 text-stone-500 dark:text-stone-400" />
            <h2 className="text-xs font-bold uppercase tracking-wider text-stone-600 dark:text-stone-300">
              Account
            </h2>
          </div>

          <div className="bg-white dark:bg-stone-900 rounded-2xl border border-stone-200 dark:border-stone-800 shadow-2xs p-5 sm:p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <h3 className="text-sm font-semibold text-stone-900 dark:text-stone-100">
                Sign Out
              </h3>
              <p className="text-xs text-stone-500 dark:text-stone-400">
                Sign out of MindTrail on this browser.
              </p>
            </div>

            <button
              id="btn-account-page-sign-out"
              type="button"
              onClick={onSignOut}
              className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-stone-100 dark:bg-stone-800 hover:bg-stone-200 dark:hover:bg-stone-750 text-stone-700 dark:text-stone-200 border border-stone-200 dark:border-stone-700 text-xs font-semibold transition-colors cursor-pointer w-fit"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Sign Out</span>
            </button>
          </div>
        </section>

        {/* ================================================== */}
        {/* 5. DANGER ZONE SECTION                            */}
        {/* ================================================== */}
        <section id="section-account-danger-zone" className="space-y-3 pt-4 border-t border-stone-200 dark:border-stone-800">
          <div className="flex items-center gap-2">
            <Trash2 className="w-4 h-4 text-rose-600 dark:text-rose-400" />
            <h2 className="text-xs font-bold uppercase tracking-wider text-rose-600 dark:text-rose-400">
              Danger Zone
            </h2>
          </div>

          <div className="bg-rose-50/40 dark:bg-rose-950/20 rounded-2xl border border-rose-200/80 dark:border-rose-900/50 p-5 sm:p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <h3 className="text-sm font-semibold text-stone-900 dark:text-stone-100">
                Delete Account
              </h3>
              <p className="text-xs text-stone-500 dark:text-stone-400">
                Permanently delete your account and associated journal data. This action cannot be undone.
              </p>
            </div>

            <button
              id="btn-open-delete-account-dialog"
              type="button"
              onClick={() => {
                setShowDeleteDialog(true);
                setDeleteError(null);
              }}
              className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold transition-colors shadow-2xs cursor-pointer shrink-0 w-fit"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Delete Account</span>
            </button>
          </div>
        </section>
      </div>

      {/* Confirmation Dialog for Delete Account */}
      {showDeleteDialog && (
        <div
          id="delete-account-dialog-backdrop"
          className="fixed inset-0 z-50 bg-stone-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto"
          role="dialog"
          aria-modal="true"
          aria-labelledby="delete-dialog-title"
        >
          <div
            id="delete-account-dialog"
            className="bg-white dark:bg-stone-900 rounded-3xl border border-stone-200 dark:border-stone-800 shadow-2xl max-w-md w-full p-6 space-y-4 animate-in fade-in zoom-in-95 duration-150"
          >
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-2xl bg-rose-100 dark:bg-rose-950/70 text-rose-600 dark:text-rose-400 flex items-center justify-center shrink-0">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div className="space-y-1">
                <h3
                  id="delete-dialog-title"
                  className="text-base font-semibold text-stone-900 dark:text-stone-100"
                >
                  Delete your account?
                </h3>
                <p className="text-xs text-stone-500 dark:text-stone-400">
                  This will permanently delete:
                </p>
              </div>
            </div>

            <ul className="text-xs text-stone-600 dark:text-stone-300 list-disc list-inside space-y-1 bg-stone-50 dark:bg-stone-850 p-3.5 rounded-xl border border-stone-200/60 dark:border-stone-800">
              <li>Your MindTrail account and profile data</li>
              <li>Your saved reflections ({entriesCount} entries)</li>
              <li>Your Gemini conversation history</li>
              <li>Personal journal memories associated with your account</li>
            </ul>

            <p className="text-xs font-semibold text-rose-600 dark:text-rose-400">
              This action cannot be undone.
            </p>

            {deleteError && (
              <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 text-xs border border-rose-200 dark:border-rose-800">
                {deleteError}
              </div>
            )}

            <div className="flex items-center justify-end gap-2.5 pt-2">
              <button
                id="btn-cancel-delete-dialog"
                type="button"
                onClick={() => setShowDeleteDialog(false)}
                disabled={isDeleting}
                className="px-4 py-2 rounded-xl border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-800 hover:bg-stone-50 dark:hover:bg-stone-750 text-stone-700 dark:text-stone-200 text-xs font-medium cursor-pointer"
              >
                Cancel
              </button>
              <button
                id="btn-confirm-delete-dialog"
                type="button"
                onClick={handleConfirmDelete}
                disabled={isDeleting}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold transition-colors cursor-pointer disabled:opacity-50"
              >
                {isDeleting ? (
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Trash2 className="w-3.5 h-3.5" />
                )}
                <span>{isDeleting ? 'Deleting account...' : 'Delete Account'}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
