import React from 'react';

interface MindTrailLogoProps {
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | number;
  className?: string;
  showWordmark?: boolean;
  tagline?: string;
  variant?: 'mark' | 'horizontal';
}

export const MindTrailLogo: React.FC<MindTrailLogoProps> = ({
  size = 'md',
  className = '',
  showWordmark = false,
  tagline,
  variant = 'mark',
}) => {
  const dim = typeof size === 'number' ? size : {
    xs: 20,
    sm: 28,
    md: 36,
    lg: 46,
    xl: 56,
  }[size];

  return (
    <div className={`inline-flex items-center gap-3 select-none ${className}`}>
      <svg
        width={dim}
        height={dim}
        viewBox="0 0 48 48"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="shrink-0 transition-transform duration-200"
        aria-label="MindTrail AI Logo"
      >
        {/* Warm Architectural Tile */}
        <rect
          width="48"
          height="48"
          rx="12"
          className="fill-[#FFFDF8] dark:fill-[#1A1917] stroke-[#E8E5DE] dark:stroke-[#2B2925]"
          strokeWidth="1.2"
        />

        {/* Subtle Warm Atmospheric Glow Behind Reflection Horizon */}
        <circle cx="28" cy="22" r="13" className="fill-[#C5A45D]/8 dark:fill-[#D4B774]/10" />

        {/* Open Journal - Left Page (Memories) */}
        <path
          d="M 24 35.5 C 19.5 34.2 15 33.5 11 34.2 V 18.2 C 15 17.5 19.5 18.2 24 19.8 Z"
          className="fill-[#F4F0E6] dark:fill-[#24221F] stroke-[#171817] dark:stroke-[#F6F4EE]"
          strokeWidth="1.75"
          strokeLinejoin="round"
        />

        {/* Open Journal - Right Page (Memories) */}
        <path
          d="M 24 35.5 C 28.5 34.2 33 33.5 37 34.2 V 18.2 C 33 17.5 28.5 18.2 24 19.8 Z"
          className="fill-[#FFFDF8] dark:fill-[#1E1D1B] stroke-[#171817] dark:stroke-[#F6F4EE]"
          strokeWidth="1.75"
          strokeLinejoin="round"
        />

        {/* Center Journal Spine (Muted Sage) */}
        <path
          d="M 24 19.8 V 35.5"
          className="stroke-[#7C8B7A] dark:stroke-[#8FA08E]"
          strokeWidth="1.6"
          strokeLinecap="round"
        />

        {/* MindTrail: Curved Personal Journey Trail Emerging from Journal Pages */}
        <path
          d="M 24 31 C 21 26.5 22.5 21 26 18 C 29 15.5 31.5 13 33 10.5"
          className="stroke-[#C5A45D] dark:stroke-[#D4B774]"
          strokeWidth="1.8"
          strokeLinecap="round"
        />

        {/* Intelligent Reflection Aura */}
        <circle cx="33" cy="10.5" r="2.8" className="fill-[#C5A45D]/20 dark:fill-[#D4B774]/25" />

        {/* Subtle Discovery / Intelligent Reflection Endpoint */}
        <path
          d="M 33 7.2 L 33.8 9.7 L 36.3 10.5 L 33.8 11.3 L 33 13.8 L 32.2 11.3 L 29.7 10.5 L 32.2 9.7 Z"
          className="fill-[#C5A45D] dark:fill-[#D4B774]"
        />

        {/* Micro-Node in Muted Sage */}
        <circle cx="33" cy="10.5" r="0.8" className="fill-[#7C8B7A] dark:fill-[#8FA08E]" />
      </svg>

      {(showWordmark || variant === 'horizontal') && (
        <div className="flex flex-col text-left">
          <span className="font-serif-title text-xl font-medium tracking-tight text-[#171817] dark:text-[#F6F4EE] leading-tight">
            MindTrail AI
          </span>
          <span className="text-[9.5px] tracking-wider uppercase font-semibold text-[#686862] dark:text-[#A3A199] mt-0.5">
            {tagline || 'PRIVATE AI JOURNAL'}
          </span>
        </div>
      )}
    </div>
  );
};
