import React from 'react';
import { Compass, Feather, Sparkles, Bookmark, Calendar, ArrowUpRight } from 'lucide-react';

interface JournalHeroVisualProps {
  imageSrc?: string;
  onExplore?: () => void;
}

export const JournalHeroVisual: React.FC<JournalHeroVisualProps> = ({
  imageSrc,
  onExplore,
}) => {
  return (
    <div className="relative w-full max-w-xl lg:max-w-none mx-auto select-none">
      {/* Outer ambient lighting & desk surface halo */}
      <div className="absolute -inset-4 sm:-inset-6 bg-gradient-to-tr from-[#EADDC2]/30 via-[#FAF6ED]/20 to-transparent dark:from-[#242017]/30 dark:via-[#191816]/20 rounded-3xl blur-2xl -z-10 pointer-events-none" />

      {/* Main Journal Composition Container */}
      <div className="relative rounded-3xl bg-[#F6F3EB] dark:bg-[#1A1917] p-4 sm:p-7 md:p-9 border border-[#E8E2D3] dark:border-[#2C2A26] shadow-xl dark:shadow-2xl/60 overflow-hidden">
        {/* Soft sunlight angle overlay */}
        <div className="absolute top-0 right-0 w-3/4 h-3/4 bg-gradient-to-bl from-amber-100/35 via-[#FFFDF8]/15 to-transparent dark:from-amber-900/10 dark:via-transparent pointer-events-none" />

        {/* If an external photography asset is supplied, display it seamlessly */}
        {imageSrc ? (
          <div className="relative rounded-2xl overflow-hidden shadow-inner border border-[#E8E2D3] dark:border-[#2C2A26] aspect-[4/3]">
            <img
              src={imageSrc}
              alt="MindTrail private journal environment"
              className="w-full h-full object-cover"
              referrerPolicy="no-referrer"
            />
          </div>
        ) : (
          /* Editorial Journal Environment (Handcrafted SVG & Typography Art) */
          <div className="relative">
            {/* Loose memory card floating above the journal (top-right) */}
            <div className="absolute -top-1 sm:-top-2 right-2 sm:right-6 z-20 transform rotate-3 hover:rotate-0 transition-transform duration-300">
              <div className="bg-[#FFFDF8] dark:bg-[#22201D] border border-[#E5DFD1] dark:border-[#38342C] rounded-xl px-3.5 py-2 sm:px-4 sm:py-2.5 shadow-md flex items-center gap-2.5">
                <span className="w-2 h-2 rounded-full bg-[#7C8B7A] dark:bg-[#8FA08E]" />
                <div className="text-left">
                  <p className="text-[10px] uppercase font-semibold tracking-wider text-[#7C8B7A] dark:text-[#8FA08E]">
                    Memory Connection
                  </p>
                  <p className="text-xs font-serif text-[#171817] dark:text-[#F6F4EE]">
                    Morning Walk & Calmness
                  </p>
                </div>
              </div>
            </div>

            {/* The Open Luxury Notebook */}
            <div className="relative rounded-2xl bg-[#FFFDF8] dark:bg-[#1E1D1B] border border-[#E6DEC9] dark:border-[#333029] shadow-md p-4 sm:p-7 sm:pb-8">
              {/* Center stitched book spine seam */}
              <div className="absolute top-0 bottom-0 left-1/2 -translate-x-1/2 w-8 pointer-events-none hidden sm:flex justify-center items-center">
                <div className="w-[1.5px] h-full bg-[#E5DFD1] dark:bg-[#2C2923]" />
                {/* Center ribbon bookmark */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-2.5 h-16 bg-[#C5A45D] dark:bg-[#A88741] rounded-b-sm shadow-xs opacity-80" />
              </div>

              {/* Two-page spread layout */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 sm:gap-10">
                {/* Left Page: Handwritten reflection */}
                <div className="space-y-3 sm:space-y-4 pr-1 sm:pr-4">
                  <div className="flex items-center justify-between border-b border-[#EFE9DC] dark:border-[#2C2923] pb-2">
                    <div className="flex items-center gap-1.5 text-[11px] font-medium text-[#7C8B7A] dark:text-[#8FA08E]">
                      <Calendar className="w-3.5 h-3.5" />
                      <span>October 14 • Morning</span>
                    </div>
                    <span className="text-[10px] text-[#A69E8F] dark:text-[#7C786E] font-serif italic">
                      Page 42
                    </span>
                  </div>

                  <p className="font-serif text-sm sm:text-base text-[#171817] dark:text-[#E8E5DD] leading-relaxed italic">
                    “Walking along the autumn ridge today, the fog was beginning to lift. I realized how much clearer my thoughts feel when given unhurried space to unfold.”
                  </p>

                  <div className="pt-1 space-y-1.5 text-xs text-[#52504B] dark:text-[#B5B2AA] leading-relaxed">
                    <p className="line-clamp-3 font-serif">
                      The stillness reminded me of the reflection from two months ago — the choice isn’t between moving fast or slow, but choosing what actually matters.
                    </p>
                  </div>

                  {/* Gentle Ink journey trail sketched across bottom */}
                  <div className="pt-2 flex items-center gap-2">
                    <div className="h-[1.5px] flex-1 bg-gradient-to-r from-transparent via-[#C5A45D]/60 to-[#7C8B7A]/70" />
                    <span className="text-[10px] uppercase font-mono tracking-widest text-[#9C9484] dark:text-[#7A756C]">
                      MindTrail
                    </span>
                    <div className="h-[1.5px] w-4 bg-[#C5A45D]/60" />
                  </div>
                </div>

                {/* Right Page: AI Reflection synthesis & memory prompt */}
                <div className="space-y-3 sm:space-y-4 sm:pl-4 sm:border-l border-[#F2ECE0] dark:border-[#262420]">
                  <div className="flex items-center justify-between border-b border-[#EFE9DC] dark:border-[#2C2923] pb-2">
                    <div className="flex items-center gap-1.5 text-[11px] font-medium text-[#C5A45D] dark:text-[#D4B774]">
                      <Compass className="w-3.5 h-3.5" />
                      <span>Intelligent Reflection</span>
                    </div>
                    <span className="px-2 py-0.5 rounded-full text-[9px] font-medium bg-[#FAF6ED] dark:bg-[#25221B] text-[#8C743D] dark:text-[#D4B774] border border-[#E6D8B5] dark:border-[#3A3320]">
                      Gemini Grounded
                    </span>
                  </div>

                  {/* AI reflection note card */}
                  <div className="rounded-xl bg-[#FAF8F3] dark:bg-[#1B1917] p-3 sm:p-3.5 border border-[#E8E2D3] dark:border-[#2C2923] space-y-2">
                    <p className="text-xs text-[#4A4740] dark:text-[#D4D0C5] leading-relaxed">
                      <span className="font-serif italic font-medium text-[#171817] dark:text-[#F6F4EE]">Pattern Rediscovered:</span> Whenever you write outdoors in the morning, your entries exhibit 35% more gratitude and forward-looking clarity.
                    </p>
                    <div className="flex items-center gap-2 text-[10px] text-[#7C8B7A] dark:text-[#8FA08E]">
                      <span>Related: August 22 • High Ridge Trail</span>
                    </div>
                  </div>

                  {/* Question for reflection */}
                  <div className="rounded-xl bg-[#FFFDF8] dark:bg-[#1E1C1A] p-2.5 sm:p-3 border border-[#EBE5D8] dark:border-[#2C2923]">
                    <p className="text-[11px] text-[#636058] dark:text-[#A8A49B] italic font-serif">
                      “What small decision today would honor this morning’s clarity?”
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Refined Executive Pen (Slim Dark Body, Antique-Brass Details, Grounded Contact Shadow) */}
            <div
              id="hero-journal-pen"
              className="absolute bottom-1.5 sm:bottom-2.5 left-5 sm:left-10 z-20 pointer-events-none transform -rotate-6 transition-transform duration-300"
              aria-hidden="true"
            >
              <svg
                className="w-48 sm:w-60 md:w-64 h-auto drop-shadow-2xs"
                viewBox="0 0 240 26"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <defs>
                  {/* Subtle realistic contact shadows */}
                  <filter id="penSoftShadow" x="0" y="8" width="240" height="18" filterUnits="userSpaceOnUse">
                    <feGaussianBlur stdDeviation="2.5" />
                  </filter>
                  <filter id="penContactShadow" x="10" y="11" width="220" height="12" filterUnits="userSpaceOnUse">
                    <feGaussianBlur stdDeviation="0.8" />
                  </filter>

                  {/* Cylindrical deep ink/lacquer pen body */}
                  <linearGradient id="penBarrelGradient" x1="0" y1="6" x2="0" y2="15" gradientUnits="userSpaceOnUse">
                    <stop offset="0%" stopColor="#383632" />
                    <stop offset="22%" stopColor="#1E1D1B" />
                    <stop offset="65%" stopColor="#121110" />
                    <stop offset="100%" stopColor="#252320" />
                  </linearGradient>

                  {/* Antique brass metallic gradients */}
                  <linearGradient id="antiqueBrassGold" x1="0" y1="5" x2="0" y2="16" gradientUnits="userSpaceOnUse">
                    <stop offset="0%" stopColor="#EAD8A6" />
                    <stop offset="30%" stopColor="#C9AA62" />
                    <stop offset="70%" stopColor="#967B38" />
                    <stop offset="100%" stopColor="#5E4C20" />
                  </linearGradient>

                  <linearGradient id="clipGradient" x1="0" y1="4" x2="0" y2="9" gradientUnits="userSpaceOnUse">
                    <stop offset="0%" stopColor="#F8ECCB" />
                    <stop offset="45%" stopColor="#C9AA62" />
                    <stop offset="100%" stopColor="#7D652D" />
                  </linearGradient>
                </defs>

                {/* 1. Realistic Surface Contact Shadows */}
                <ellipse cx="120" cy="18" rx="100" ry="3.5" fill="#17140E" opacity="0.14" filter="url(#penSoftShadow)" />
                <ellipse cx="124" cy="15.5" rx="92" ry="1.6" fill="#100E0A" opacity="0.28" filter="url(#penContactShadow)" />

                {/* 2. Front Nib & Writing Cone (Antique Brass) */}
                <circle cx="9.5" cy="10.5" r="1" fill="url(#antiqueBrassGold)" />
                <path
                  d="M9.5 10.5L24 7.2V13.8L9.5 10.5Z"
                  fill="url(#antiqueBrassGold)"
                />
                <line x1="20" y1="7.8" x2="20" y2="13.2" stroke="#6D5523" strokeWidth="0.5" opacity="0.7" />

                {/* 3. Front Grip Section (Matte Graphite / Deep Obsidian) */}
                <rect x="24" y="7" width="34" height="7" rx="0.5" fill="#1C1B19" />
                <line x1="25" y1="8.2" x2="57" y2="8.2" stroke="#48453F" strokeWidth="0.6" strokeLinecap="round" opacity="0.6" />

                {/* 4. Dual Antique-Brass Center Bands */}
                <rect x="58" y="6.4" width="3" height="8.2" rx="0.4" fill="url(#antiqueBrassGold)" />
                <rect x="61" y="6.7" width="1.2" height="7.6" fill="#171614" />
                <rect x="62.2" y="6.4" width="2.8" height="8.2" rx="0.4" fill="url(#antiqueBrassGold)" />

                {/* 5. Main Barrel (Slim cylindrical dark lacquer body) */}
                <rect x="65" y="6.5" width="86" height="8" rx="0.6" fill="url(#penBarrelGradient)" />
                <line x1="66" y1="7.8" x2="150" y2="7.8" stroke="#5A564F" strokeWidth="0.7" strokeLinecap="round" opacity="0.45" />

                {/* 6. Cap Junction Ring */}
                <rect x="151" y="6.4" width="2.2" height="8.2" rx="0.3" fill="url(#antiqueBrassGold)" />

                {/* 7. Pen Cap Section */}
                <rect x="153.2" y="6.3" width="64" height="8.4" rx="0.6" fill="url(#penBarrelGradient)" />
                <line x1="154" y1="7.6" x2="216" y2="7.6" stroke="#5A564F" strokeWidth="0.7" strokeLinecap="round" opacity="0.45" />

                {/* 8. Slender Antique Brass Pocket Clip */}
                <path d="M168 5.8H212V7H168Z" fill="#0D0C0B" opacity="0.4" />
                <rect x="210" y="4.5" width="3" height="4" rx="0.5" fill="url(#antiqueBrassGold)" />
                <path
                  d="M211.5 5H170C168 5 167 6.2 167.5 7.2C168 8 169.5 8 171 8H211.5V5Z"
                  fill="url(#clipGradient)"
                />
                <line x1="211" y1="5.5" x2="171" y2="5.5" stroke="#FFF7DB" strokeWidth="0.5" strokeLinecap="round" opacity="0.8" />

                {/* 9. Rear Crown / Antique Brass Finial */}
                <path
                  d="M217.2 6.5H221C222.5 6.5 223.5 7.4 223.5 10.5C223.5 13.6 222.5 14.5 221 14.5H217.2V6.5Z"
                  fill="url(#antiqueBrassGold)"
                />
                <circle cx="223.5" cy="10.5" r="0.8" fill="#F8ECCB" opacity="0.9" />
              </svg>
            </div>

            {/* Subtle Pressed Botanical Sage leaf detail */}
            <div className="absolute -bottom-2 right-8 sm:right-14 opacity-75 pointer-events-none">
              <svg width="36" height="24" viewBox="0 0 36 24" fill="none">
                <path
                  d="M2 22C10 18 18 10 24 2C28 8 32 16 34 22"
                  className="stroke-[#7C8B7A] dark:stroke-[#8FA08E]"
                  strokeWidth="1.2"
                  strokeLinecap="round"
                />
                <path
                  d="M12 16C15 13 18 12 21 11"
                  className="stroke-[#7C8B7A] dark:stroke-[#8FA08E]"
                  strokeWidth="0.8"
                />
              </svg>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
