import React, { useState, useRef, useEffect } from 'react';
import { LogOut, Plus, BookOpen, Brain, ChevronDown, User, ArrowLeft, Compass, Sparkles, LayoutDashboard, Library } from 'lucide-react';
import { UserProfile } from '../types';
import { AvatarBadge } from '../utils/avatarPresets';
import { MindTrailLogo } from './MindTrailLogo';

interface HeaderProps {
  user: UserProfile | null;
  onSignOut: () => void;
  onNewEntry: () => void;
  onOpenMemories: () => void;
  onOpenTimeline: () => void;
  onOpenDashboard?: () => void;
  onOpenBooks?: () => void;
  onNavigateToAccount: () => void;
  onBackToJournal: () => void;
  activeView?: 'home' | 'dashboard' | 'journal' | 'timeline' | 'memories' | 'books' | 'account' | 'signin' | 'signup' | 'about' | 'privacy' | 'terms' | 'faq' | string;
  entriesCount: number;
  onOpenSignIn?: () => void;
  onOpenSignUp?: () => void;
  onNavigateHome?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  user,
  onSignOut,
  onNewEntry,
  onOpenMemories,
  onOpenTimeline,
  onOpenDashboard,
  onOpenBooks,
  onNavigateToAccount,
  onBackToJournal,
  activeView,
  onOpenSignIn,
  onOpenSignUp,
  onNavigateHome,
}) => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [dropdownPos, setDropdownPos] = useState<{ left?: number }>({});
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Position dropdown centered around avatar trigger while keeping comfortable spacing from viewport edge
  useEffect(() => {
    if (!isDropdownOpen || !dropdownRef.current) return;

    const updatePosition = () => {
      if (!dropdownRef.current) return;
      const rect = dropdownRef.current.getBoundingClientRect();
      const dropdownWidth = 256; // 16rem / w-64
      const viewportWidth = window.innerWidth;
      const margin = 16; // comfortable spacing from viewport edge

      const triggerCenter = rect.left + rect.width / 2;
      let targetLeft = triggerCenter - dropdownWidth / 2;

      // Keep within viewport boundaries
      if (targetLeft + dropdownWidth > viewportWidth - margin) {
        targetLeft = viewportWidth - margin - dropdownWidth;
      }
      if (targetLeft < margin) {
        targetLeft = margin;
      }

      const relativeLeft = Math.round(targetLeft - rect.left);
      setDropdownPos({ left: relativeLeft });
    };

    updatePosition();
    window.addEventListener('resize', updatePosition);
    return () => window.removeEventListener('resize', updatePosition);
  }, [isDropdownOpen]);

  const handleBrandClick = () => {
    if (onNavigateHome) {
      onNavigateHome();
    } else if (onOpenDashboard) {
      onOpenDashboard();
    } else if (onBackToJournal) {
      onBackToJournal();
    }
  };

  // Close dropdown on click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        setIsDropdownOpen(false);
      }
    }

    if (isDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isDropdownOpen]);

  return (
    <header
      id="app-header"
      className="sticky top-0 z-30 border-b border-[#E8E5DE] dark:border-[#282724] bg-[#F8F6F0]/90 dark:bg-[#141312]/90 backdrop-blur-md px-4 sm:px-8 py-3 transition-colors"
    >
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4 relative">
        {/* Brand identity (Left) */}
        <div id="brand-container" className="flex items-center shrink-0 z-10">
          <button
            id="btn-brand-home"
            type="button"
            onClick={handleBrandClick}
            aria-label="MindTrail AI - Go to home"
            className="flex items-center gap-3 text-left cursor-pointer group px-2.5 py-1.5 -ml-2.5 rounded-xl hover:bg-[#EFECE4]/70 dark:hover:bg-[#1E1D1B]/70 active:scale-[0.99] transition-all duration-150 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C5A45D]/40"
          >
            <div className="shrink-0 transition-transform duration-150 ease-out group-hover:scale-[1.03]">
              <MindTrailLogo size="sm" />
            </div>
            <div>
              <span
                id="brand-title"
                className="font-serif-title text-xl font-medium text-[#171817] dark:text-[#F6F4EE] tracking-tight group-hover:text-[#0D0E0D] dark:group-hover:text-white transition-colors duration-150 block leading-tight"
              >
                MindTrail AI
              </span>
              <p className="text-[9.5px] tracking-wider uppercase font-semibold text-[#686862] dark:text-[#A3A199] hidden sm:block mt-0.5">
                PRIVATE AI JOURNAL
              </p>
            </div>
          </button>
        </div>

        {/* Primary Desktop Navigation (Horizontally Centered) */}
        {user && activeView !== 'account' && (
          <nav
            id="header-center-nav"
            aria-label="Primary Navigation"
            className="hidden md:flex items-center justify-center absolute left-1/2 -translate-x-1/2 z-10 pointer-events-auto"
          >
            <div className="flex items-center p-1 bg-[#EFECE4] dark:bg-[#1E1D1B] rounded-xl border border-[#E8E5DE] dark:border-[#292825] text-xs font-medium shadow-2xs">
              <button
                id="tab-dashboard-view"
                onClick={onOpenDashboard || onBackToJournal}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                  activeView === 'dashboard'
                    ? 'bg-[#FFFDF8] dark:bg-[#282724] text-[#171817] dark:text-[#F6F4EE] shadow-2xs font-semibold'
                    : 'text-[#686862] dark:text-[#A3A199] hover:text-[#171817] dark:hover:text-[#F6F4EE]'
                }`}
                title="View your personal reflection dashboard"
              >
                <BookOpen className="w-3.5 h-3.5" />
                <span>Dashboard</span>
              </button>
              <button
                id="tab-journal-view"
                onClick={onBackToJournal}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                  activeView === 'journal'
                    ? 'bg-[#FFFDF8] dark:bg-[#282724] text-[#171817] dark:text-[#F6F4EE] shadow-2xs font-semibold'
                    : 'text-[#686862] dark:text-[#A3A199] hover:text-[#171817] dark:hover:text-[#F6F4EE]'
                }`}
                title="Open journal editor and reflection history"
              >
                <LayoutDashboard className="w-3.5 h-3.5" />
                <span>Journal</span>
              </button>
              <button
                id="tab-timeline-view"
                onClick={onOpenTimeline}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                  activeView === 'timeline'
                    ? 'bg-[#FFFDF8] dark:bg-[#282724] text-[#171817] dark:text-[#F6F4EE] shadow-2xs font-semibold'
                    : 'text-[#686862] dark:text-[#A3A199] hover:text-[#171817] dark:hover:text-[#F6F4EE]'
                }`}
                title="View chronological memory journey"
              >
                <Compass className="w-3.5 h-3.5" />
                <span>Timeline</span>
              </button>
              <button
                id="tab-ask-memories-view"
                onClick={onOpenMemories}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                  activeView === 'memories'
                    ? 'bg-[#FFFDF8] dark:bg-[#282724] text-[#171817] dark:text-[#F6F4EE] shadow-2xs font-semibold'
                    : 'text-[#686862] dark:text-[#A3A199] hover:text-[#171817] dark:hover:text-[#F6F4EE]'
                }`}
                title="Ask questions about your journal history"
              >
                <Brain className="w-3.5 h-3.5" />
                <span>Memories</span>
              </button>
              <button
                id="tab-books-view"
                onClick={onOpenBooks}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                  activeView === 'books'
                    ? 'bg-[#FFFDF8] dark:bg-[#282724] text-[#171817] dark:text-[#F6F4EE] shadow-2xs font-semibold'
                    : 'text-[#686862] dark:text-[#A3A199] hover:text-[#171817] dark:hover:text-[#F6F4EE]'
                }`}
                title="Discover books matching your reflective themes"
              >
                <Library className="w-3.5 h-3.5" />
                <span>Books</span>
              </button>
            </div>
          </nav>
        )}

        {/* User context & profile actions (Right) */}
        {user ? (
          <div id="header-user-actions" className="flex items-center gap-2 sm:gap-3 shrink-0 z-10 ml-auto md:ml-0">
            {/* If on Account page, show quick "Back to Journal" shortcut */}
            {activeView === 'account' && (
              <button
                id="btn-header-back-to-journal"
                onClick={onOpenDashboard || onBackToJournal}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-[#E8E5DE] dark:border-[#2B2A27] bg-[#FFFDF8] dark:bg-[#1B1A18] hover:bg-[#F2EFE8] dark:hover:bg-[#232220] text-xs font-medium text-[#171817] dark:text-[#F6F4EE] transition-colors cursor-pointer"
              >
                <ArrowLeft className="w-3.5 h-3.5 text-[#7C8B7A] dark:text-[#8FA08E]" />
                <span>Back to Reflections</span>
              </button>
            )}

            {/* Profile Dropdown Menu */}
            <div className="relative pl-1" ref={dropdownRef}>
              <button
                id="btn-profile-menu-trigger"
                type="button"
                onClick={() => setIsDropdownOpen((prev) => !prev)}
                className="flex items-center gap-2 px-1.5 py-1 rounded-full hover:bg-[#EFECE4] dark:hover:bg-[#201F1D] border border-transparent hover:border-[#E8E5DE] dark:hover:border-[#292825] transition-all cursor-pointer group text-left"
                aria-expanded={isDropdownOpen}
                aria-haspopup="true"
                title="User profile menu"
              >
                {/* 32-34px circular avatar with subtle sage border */}
                <AvatarBadge
                  user={user}
                  size="sm"
                  idPrefix="header-user-avatar"
                  className="w-[34px] h-[34px] border border-[#7C8B7A]/50 dark:border-[#8FA08E]/50"
                />
                <span
                  id="header-user-display-name"
                  className="font-medium text-xs sm:text-sm text-[#171817] dark:text-[#F6F4EE] max-w-[120px] sm:max-w-[150px] truncate"
                >
                  {user.displayName || 'Account'}
                </span>
                <ChevronDown
                  className={`w-3.5 h-3.5 text-[#8C8B83] dark:text-[#7A7872] transition-transform duration-150 ${
                    isDropdownOpen ? 'rotate-180 text-[#171817] dark:text-[#F6F4EE]' : ''
                  }`}
                />
              </button>

              {/* Polished Dropdown Menu */}
              {isDropdownOpen && (
                <div
                  id="profile-dropdown-menu"
                  style={dropdownPos.left !== undefined ? { left: `${dropdownPos.left}px` } : undefined}
                  className={`absolute mt-2 w-64 max-w-[calc(100vw-2rem)] rounded-2xl bg-[#FFFDF8] dark:bg-[#1B1A18] border border-[#E8E5DE] dark:border-[#292825] shadow-xl py-1.5 z-50 animate-in fade-in zoom-in-95 duration-100 text-[#171817] dark:text-[#F6F4EE] ${
                    dropdownPos.left === undefined ? 'right-0 sm:left-1/2 sm:-translate-x-1/2 sm:right-auto' : ''
                  }`}
                  role="menu"
                >
                  {/* Dropdown Header */}
                  <div className="px-4 py-3 flex items-center gap-3">
                    <AvatarBadge
                      user={user}
                      size="md"
                      idPrefix="dropdown-avatar"
                      className="border border-[#7C8B7A]/50 dark:border-[#8FA08E]/50"
                    />
                    <div className="flex-1 min-w-0">
                      <p
                        id="dropdown-display-name"
                        className="text-sm font-semibold text-[#171817] dark:text-[#F6F4EE] truncate"
                      >
                        {user.displayName || 'MindTrail Member'}
                      </p>
                      <p
                        id="dropdown-email"
                        className="text-xs text-[#686862] dark:text-[#A3A199] truncate"
                        title={user.email || ''}
                      >
                        {user.email || 'No email associated'}
                      </p>
                    </div>
                  </div>

                  <div className="border-t border-[#E8E5DE] dark:border-[#292825] my-1" />

                  {/* Profile & Preferences */}
                  <div className="px-1.5 py-0.5 space-y-0.5">
                    <button
                      id="menu-item-profile-preferences"
                      type="button"
                      onClick={() => {
                        setIsDropdownOpen(false);
                        onNavigateToAccount();
                      }}
                      className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-medium rounded-xl text-[#171817] dark:text-[#F6F4EE] hover:bg-[#F2EFE8] dark:hover:bg-[#232220] transition-colors cursor-pointer text-left"
                      role="menuitem"
                    >
                      <User className="w-4 h-4 text-[#7C8B7A] dark:text-[#8FA08E]" />
                      <span>Profile & Preferences</span>
                    </button>
                  </div>

                  <div className="border-t border-[#E8E5DE] dark:border-[#292825] my-1" />

                  {/* Sign Out */}
                  <div className="px-1.5 py-0.5">
                    <button
                      id="menu-item-sign-out"
                      type="button"
                      onClick={() => {
                        setIsDropdownOpen(false);
                        onSignOut();
                      }}
                      className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-medium rounded-xl text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors cursor-pointer text-left"
                      role="menuitem"
                    >
                      <LogOut className="w-4 h-4 text-rose-600 dark:text-rose-400" />
                      <span>Sign Out</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div id="header-auth-actions" className="flex items-center gap-2 sm:gap-2.5">
            <button
              id="btn-header-sign-in"
              type="button"
              onClick={onOpenSignIn}
              className="px-3.5 py-1.5 rounded-xl text-xs sm:text-sm font-medium text-[#171817] dark:text-[#F6F4EE] hover:bg-[#F2EFE8] dark:hover:bg-[#232220] transition-colors cursor-pointer"
            >
              Sign In
            </button>
            <button
              id="btn-header-create-account"
              type="button"
              onClick={onOpenSignUp}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-[#171817] dark:bg-[#F6F4EE] text-[#FFFDF8] dark:text-[#171817] hover:opacity-90 text-xs sm:text-sm font-semibold tracking-wide transition-all shadow-xs cursor-pointer active:scale-98"
            >
              Create Account
            </button>
          </div>
        )}
      </div>

      {/* Mobile sub-navigation row (visible only on < md screens when authenticated) */}
      {user && activeView !== 'account' && (
        <div className="md:hidden pt-2.5 pb-0.5 flex items-center justify-center w-full overflow-x-auto no-scrollbar">
          <div className="flex items-center p-1 bg-[#EFECE4] dark:bg-[#1E1D1B] rounded-xl border border-[#E8E5DE] dark:border-[#292825] text-xs font-medium shrink-0">
            <button
              id="mobile-tab-dashboard-view"
              onClick={onOpenDashboard || onBackToJournal}
              className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg transition-all cursor-pointer ${
                activeView === 'dashboard'
                  ? 'bg-[#FFFDF8] dark:bg-[#282724] text-[#171817] dark:text-[#F6F4EE] shadow-2xs font-semibold'
                  : 'text-[#686862] dark:text-[#A3A199] hover:text-[#171817] dark:hover:text-[#F6F4EE]'
              }`}
              title="Dashboard"
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span>Dashboard</span>
            </button>
            <button
              id="mobile-tab-journal-view"
              onClick={onBackToJournal}
              className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg transition-all cursor-pointer ${
                activeView === 'journal'
                  ? 'bg-[#FFFDF8] dark:bg-[#282724] text-[#171817] dark:text-[#F6F4EE] shadow-2xs font-semibold'
                  : 'text-[#686862] dark:text-[#A3A199] hover:text-[#171817] dark:hover:text-[#F6F4EE]'
              }`}
              title="Journal"
            >
              <LayoutDashboard className="w-3.5 h-3.5" />
              <span>Journal</span>
            </button>
            <button
              id="mobile-tab-timeline-view"
              onClick={onOpenTimeline}
              className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg transition-all cursor-pointer ${
                activeView === 'timeline'
                  ? 'bg-[#FFFDF8] dark:bg-[#282724] text-[#171817] dark:text-[#F6F4EE] shadow-2xs font-semibold'
                  : 'text-[#686862] dark:text-[#A3A199] hover:text-[#171817] dark:hover:text-[#F6F4EE]'
              }`}
              title="Timeline"
            >
              <Compass className="w-3.5 h-3.5" />
              <span>Timeline</span>
            </button>
            <button
              id="mobile-tab-ask-memories-view"
              onClick={onOpenMemories}
              className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg transition-all cursor-pointer ${
                activeView === 'memories'
                  ? 'bg-[#FFFDF8] dark:bg-[#282724] text-[#171817] dark:text-[#F6F4EE] shadow-2xs font-semibold'
                  : 'text-[#686862] dark:text-[#A3A199] hover:text-[#171817] dark:hover:text-[#F6F4EE]'
              }`}
              title="Memories"
            >
              <Brain className="w-3.5 h-3.5" />
              <span>Memories</span>
            </button>
            <button
              id="mobile-tab-books-view"
              onClick={onOpenBooks}
              className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg transition-all cursor-pointer ${
                activeView === 'books'
                  ? 'bg-[#FFFDF8] dark:bg-[#282724] text-[#171817] dark:text-[#F6F4EE] shadow-2xs font-semibold'
                  : 'text-[#686862] dark:text-[#A3A199] hover:text-[#171817] dark:hover:text-[#F6F4EE]'
              }`}
              title="Books"
            >
              <Library className="w-3.5 h-3.5" />
              <span>Books</span>
            </button>
          </div>
        </div>
      )}
    </header>
  );
};
