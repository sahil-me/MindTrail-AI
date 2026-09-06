import React from 'react';
import { UserProfile } from '../types';
import { auth } from '../firebase';

export interface PresetAvatarOption {
  id: string;
  name: string;
  subtitle: string;
  bgGradient: string;
  renderIcon: (className?: string) => React.ReactNode;
}

export const PRESET_AVATARS: PresetAvatarOption[] = [
  {
    id: 'preset-quiet-mountain',
    name: 'Quiet Mountain',
    subtitle: 'Stillness & Focus',
    bgGradient: 'bg-[#F2EFE8] dark:bg-[#232220] border-[#E8E5DE] dark:border-[#2B2A27] text-[#171817] dark:text-[#F6F4EE]',
    renderIcon: (className = 'w-5 h-5') => (
      <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
        <path d="m8 4 4 7 5-4 5 13H2L8 4z" />
        <path d="m4.5 15.5 3-3 3.5 3.5" className="stroke-[#7C8B7A] dark:stroke-[#8FA08E]" />
      </svg>
    ),
  },
  {
    id: 'preset-moonlit-journal',
    name: 'Moonlit Journal',
    subtitle: 'Night Reflection',
    bgGradient: 'bg-[#FAF6ED] dark:bg-[#211E18] border-[#E6D8B5] dark:border-[#42371D] text-[#C5A45D] dark:text-[#D4B774]',
    renderIcon: (className = 'w-5 h-5') => (
      <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z" />
        <path d="M19 3v4" className="stroke-[#C5A45D] dark:stroke-[#D4B774]" />
        <path d="M21 5h-4" className="stroke-[#C5A45D] dark:stroke-[#D4B774]" />
      </svg>
    ),
  },
  {
    id: 'preset-forest-path',
    name: 'Forest Path',
    subtitle: 'Journey & Balance',
    bgGradient: 'bg-[#F0F3EF] dark:bg-[#1C221D] border-[#D6DFD4] dark:border-[#2A362B] text-[#7C8B7A] dark:text-[#8FA08E]',
    renderIcon: (className = 'w-5 h-5') => (
      <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
        <path d="m12 3-5 7h3l-4 7h12l-4-7h3l-5-7z" />
        <path d="M12 17v4" />
      </svg>
    ),
  },
  {
    id: 'preset-open-book',
    name: 'Open Book',
    subtitle: 'Memory & Story',
    bgGradient: 'bg-[#FFFDF8] dark:bg-[#1B1A18] border-[#E8E5DE] dark:border-[#292825] text-[#171817] dark:text-[#F6F4EE]',
    renderIcon: (className = 'w-5 h-5') => (
      <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
        <path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1-2.5-2.5Z" />
        <path d="M6 6h10" className="stroke-[#686862] dark:stroke-[#A3A199]" />
        <path d="M6 10h10" className="stroke-[#686862] dark:stroke-[#A3A199]" />
      </svg>
    ),
  },
  {
    id: 'preset-starlit-sky',
    name: 'Starlit Sky',
    subtitle: 'Wonder & Clarity',
    bgGradient: 'bg-[#FAF6ED] dark:bg-[#221F17] border-[#E8DFC9] dark:border-[#383321] text-[#C5A45D] dark:text-[#D4B774]',
    renderIcon: (className = 'w-5 h-5') => (
      <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
        <path d="m12 3 2.2 4.8L19 10l-3.8 3.5 1.1 5.5-4.3-2.6-4.3 2.6 1.1-5.5L5 10l4.8-2.2L12 3z" />
      </svg>
    ),
  },
  {
    id: 'preset-morning-light',
    name: 'Morning Light',
    subtitle: 'Renewal & Dawn',
    bgGradient: 'bg-[#F9F6EE] dark:bg-[#22201B] border-[#E8DEC7] dark:border-[#3B3525] text-[#C5A45D] dark:text-[#D4B774]',
    renderIcon: (className = 'w-5 h-5') => (
      <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="4" />
        <path d="M12 2v2" />
        <path d="M12 20v2" />
        <path d="m4.93 4.93 1.41 1.41" />
        <path d="m17.66 17.66 1.41 1.41" />
        <path d="M2 12h2" />
        <path d="M20 12h2" />
      </svg>
    ),
  },
  {
    id: 'preset-ink-paper',
    name: 'Ink & Paper',
    subtitle: 'Thought & Craft',
    bgGradient: 'bg-[#F4F1EA] dark:bg-[#201F1D] border-[#DDD8CD] dark:border-[#33312C] text-[#171817] dark:text-[#F6F4EE]',
    renderIcon: (className = 'w-5 h-5') => (
      <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
        <path d="m18 2 4 4-12 12H6v-4L18 2z" />
        <path d="M14 6l4 4" />
        <path d="M3 22h18" className="stroke-[#C5A45D] dark:stroke-[#D4B774]" />
      </svg>
    ),
  },
  {
    id: 'preset-calm-lake',
    name: 'Calm Lake',
    subtitle: 'Serenity & Depth',
    bgGradient: 'bg-[#EFF3F0] dark:bg-[#1A211D] border-[#D2DDD6] dark:border-[#27352B] text-[#7C8B7A] dark:text-[#8FA08E]',
    renderIcon: (className = 'w-5 h-5') => (
      <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
        <path d="M2 12c3-1.5 6-1.5 9 0s6 1.5 9 0" />
        <path d="M2 17c3-1.5 6-1.5 9 0s6 1.5 9 0" />
        <circle cx="12" cy="7" r="2.5" className="fill-[#C5A45D] stroke-[#C5A45D]" />
      </svg>
    ),
  },
];

export const getPresetAvatarById = (id?: string | null): PresetAvatarOption => {
  return PRESET_AVATARS.find((p) => p.id === id) || PRESET_AVATARS[0];
};

interface AvatarBadgeProps {
  user: Partial<UserProfile> | null;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  idPrefix?: string;
}

export const AvatarBadge: React.FC<AvatarBadgeProps> = ({
  user,
  size = 'md',
  className = '',
  idPrefix = 'avatar',
}) => {
  const sizeMap = {
    xs: 'w-6 h-6 text-[10px] rounded-full',
    sm: 'w-[34px] h-[34px] text-xs rounded-full',
    md: 'w-10 h-10 text-sm rounded-full',
    lg: 'w-14 h-14 text-lg rounded-full',
    xl: 'w-20 h-20 text-xl rounded-full',
  };

  const iconSizeMap = {
    xs: 'w-3.5 h-3.5',
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-7 h-7',
    xl: 'w-8 h-8',
  };

  const containerClasses = sizeMap[size];
  const iconClasses = iconSizeMap[size];

  // Derive initial
  const displayName = user?.displayName || [user?.firstName, user?.lastName].filter(Boolean).join(' ') || user?.email || 'U';
  const initial = displayName.charAt(0).toUpperCase();

  // Resolve available Google photo URL safely (not data URL)
  const googlePhotoUrl =
    (user?.photoURL && !user.photoURL.startsWith('data:') ? user.photoURL : null) ||
    (auth.currentUser?.photoURL && !auth.currentUser.photoURL.startsWith('data:') ? auth.currentUser.photoURL : null) ||
    auth.currentUser?.providerData.find((p) => p.providerId === 'google.com')?.photoURL ||
    null;

  // 1. Explicitly uploaded custom photo
  if (user?.avatarType === 'custom' && user.customPhotoUrl) {
    return (
      <img
        id={`${idPrefix}-custom`}
        src={user.customPhotoUrl}
        alt={displayName}
        className={`object-cover border border-stone-200 dark:border-stone-700 shadow-2xs shrink-0 ring-1 ring-stone-200/80 dark:ring-stone-800 ${containerClasses} ${className}`}
        referrerPolicy="no-referrer"
      />
    );
  }

  // 2. Explicitly chosen MindTrail preset avatar
  if (user?.avatarType === 'preset' && user.avatarId) {
    const preset = getPresetAvatarById(user.avatarId);
    return (
      <div
        id={`${idPrefix}-preset-${preset.id}`}
        className={`inline-flex items-center justify-center bg-linear-to-br ${preset.bgGradient} border shadow-2xs shrink-0 select-none ${containerClasses} ${className}`}
        title={preset.name}
      >
        {preset.renderIcon(iconClasses)}
      </div>
    );
  }

  // 3. Google Sign-In profile photo when available (when no custom/preset is selected or avatarType is google)
  if (googlePhotoUrl && (user?.avatarType === 'google' || !user?.avatarType || (user?.avatarType !== 'custom' && user?.avatarType !== 'preset'))) {
    return (
      <img
        id={`${idPrefix}-google`}
        src={googlePhotoUrl}
        alt={displayName}
        className={`object-cover border border-stone-200 dark:border-stone-700 shadow-2xs shrink-0 ring-1 ring-stone-200/80 dark:ring-stone-800 ${containerClasses} ${className}`}
        referrerPolicy="no-referrer"
      />
    );
  }

  // 4. Default fallback (Initials)
  return (
    <div
      id={`${idPrefix}-initials`}
      className={`inline-flex items-center justify-center bg-amber-100 dark:bg-amber-950/70 border border-amber-200 dark:border-amber-900/70 text-amber-900 dark:text-amber-200 font-serif-title font-semibold shadow-2xs shrink-0 select-none ${containerClasses} ${className}`}
    >
      <span>{initial}</span>
    </div>
  );
};
