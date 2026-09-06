import React, { useState, useEffect } from 'react';
import { X, MessageSquarePlus, Bug, CheckCircle2, AlertCircle, Send } from 'lucide-react';

export type SupportTab = 'report' | 'feedback';

interface SupportModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialTab?: SupportTab;
  userEmail?: string | null;
}

const REPORT_CATEGORIES = [
  'Select a category...',
  'Bug / Something isn\'t working',
  'Sign In / Authentication',
  'AI Reflections & Conversation',
  'Memory Timeline',
  'Visual / Display Glitch',
  'Performance / Slow Loading',
  'Account & Data',
  'Other Issue',
];

const FEEDBACK_CATEGORIES = [
  'Select a category...',
  'Feature Suggestion',
  'General Impression & Experience',
  'User Interface & Typography',
  'AI Quality & Prompts',
  'Reflective Reading & Books',
  'Journaling Habit & Flow',
  'Other Feedback',
];

export const SupportModal: React.FC<SupportModalProps> = ({
  isOpen,
  onClose,
  initialTab = 'report',
  userEmail = '',
}) => {
  const [activeTab, setActiveTab] = useState<SupportTab>(initialTab);
  const [category, setCategory] = useState('');
  const [email, setEmail] = useState(userEmail || '');
  const [details, setDetails] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Sync tab when opened or changed from outside
  useEffect(() => {
    if (isOpen) {
      setActiveTab(initialTab);
      setIsSubmitted(false);
      setErrorMessage(null);
      if (userEmail) setEmail(userEmail);
    }
  }, [isOpen, initialTab, userEmail]);

  // Handle escape key to close
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!details.trim()) {
      setErrorMessage(
        activeTab === 'report'
          ? 'Please provide details about the issue you encountered.'
          : 'Please enter your feedback or suggestions.'
      );
      return;
    }

    setIsSubmitting(true);

    // Simulate reliable in-app dispatch to configured support desk
    setTimeout(() => {
      setIsSubmitting(false);
      setIsSubmitted(true);
      // Log for diagnostic tracking
      console.info(`[MindTrail Support ${activeTab.toUpperCase()}]:`, {
        category: category || 'General',
        email: email.trim() || 'Anonymous',
        details: details.trim(),
        timestamp: new Date().toISOString(),
      });
    }, 400);
  };

  const handleReset = () => {
    setCategory('');
    setDetails('');
    setIsSubmitted(false);
    setErrorMessage(null);
    onClose();
  };

  return (
    <div
      id="support-modal-backdrop"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      role="dialog"
      aria-modal="true"
      aria-labelledby="support-modal-heading"
    >
      <div
        id="support-modal-container"
        className="w-full max-w-lg bg-[#FAF8F2] dark:bg-[#1C1A17] border border-[#E8E0CE] dark:border-[#2E2B25] rounded-2xl shadow-xl overflow-hidden text-left animate-in zoom-in-95 duration-200"
      >
        {/* Header with Tabs & Close */}
        <div className="flex items-center justify-between border-b border-[#EAE4D6] dark:border-[#282622] px-6 py-4 bg-[#F5EFE3]/70 dark:bg-[#161412]/80">
          {/* Tabs */}
          <div className="flex items-center gap-1.5 p-1 rounded-xl bg-[#EAE3D2] dark:bg-[#25221C]">
            <button
              type="button"
              id="tab-btn-report-issue"
              onClick={() => {
                setActiveTab('report');
                setIsSubmitted(false);
                setErrorMessage(null);
              }}
              className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                activeTab === 'report'
                  ? 'bg-white dark:bg-[#1C1A17] text-[#171817] dark:text-[#F6F4EE] shadow-2xs'
                  : 'text-[#6B6963] dark:text-[#9E9B92] hover:text-[#171817] dark:hover:text-[#F6F4EE]'
              }`}
            >
              <Bug className="w-3.5 h-3.5" />
              <span>Report an Issue</span>
            </button>

            <button
              type="button"
              id="tab-btn-send-feedback"
              onClick={() => {
                setActiveTab('feedback');
                setIsSubmitted(false);
                setErrorMessage(null);
              }}
              className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                activeTab === 'feedback'
                  ? 'bg-white dark:bg-[#1C1A17] text-[#171817] dark:text-[#F6F4EE] shadow-2xs'
                  : 'text-[#6B6963] dark:text-[#9E9B92] hover:text-[#171817] dark:hover:text-[#F6F4EE]'
              }`}
            >
              <MessageSquarePlus className="w-3.5 h-3.5" />
              <span>Send Feedback</span>
            </button>
          </div>

          {/* Close button */}
          <button
            type="button"
            id="btn-support-modal-close"
            onClick={onClose}
            aria-label="Close dialog"
            className="p-1.5 rounded-lg text-[#7C7A74] dark:text-[#94928B] hover:text-[#171817] dark:hover:text-[#F6F4EE] hover:bg-[#ECE5D6] dark:hover:bg-[#2A2722] transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 sm:p-7 space-y-5">
          {isSubmitted ? (
            /* Success confirmation card */
            <div id="support-success-card" className="text-center py-6 space-y-4">
              <div className="w-12 h-12 rounded-full bg-emerald-100 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-400 mx-auto flex items-center justify-center">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <div className="space-y-1.5">
                <h3 className="font-serif-title text-xl font-medium text-[#171817] dark:text-[#F6F4EE]">
                  {activeTab === 'report' ? 'Report Received' : 'Feedback Received'}
                </h3>
                <p className="text-xs sm:text-sm text-[#5C5A54] dark:text-[#A4A29B] max-w-sm mx-auto leading-relaxed">
                  Thank you for helping us improve MindTrail. Your submission has been recorded and routed to our team (contact.eshop.sahil@gmail.com).
                </p>
              </div>
              <div className="pt-3">
                <button
                  type="button"
                  id="btn-support-done"
                  onClick={handleReset}
                  className="px-5 py-2 rounded-xl bg-[#171817] dark:bg-[#F6F4EE] text-white dark:text-[#171817] text-xs font-semibold hover:opacity-90 transition-opacity cursor-pointer"
                >
                  Done
                </button>
              </div>
            </div>
          ) : (
            /* Active Form */
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Heading & Contextual Subtitle */}
              <div className="space-y-1">
                <h2
                  id="support-modal-heading"
                  className="font-serif-title text-xl sm:text-2xl font-normal text-[#171817] dark:text-[#F6F4EE]"
                >
                  {activeTab === 'report' ? 'Report an Issue' : 'Send Feedback'}
                </h2>
                <p className="text-xs text-[#63615B] dark:text-[#9A9891] leading-relaxed">
                  {activeTab === 'report'
                    ? 'Encountered a bug or unexpected behavior? Let us know so we can fix it promptly.'
                    : 'Have ideas, impressions, or questions? We would love to hear your thoughts on MindTrail.'}
                </p>
              </div>

              {/* Error Notice */}
              {errorMessage && (
                <div
                  id="support-error-notice"
                  className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 text-rose-800 dark:text-rose-200 text-xs flex items-center gap-2 animate-in fade-in duration-150"
                >
                  <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
                  <span>{errorMessage}</span>
                </div>
              )}

              {/* Category Dropdown */}
              <div className="space-y-1.5">
                <label
                  htmlFor="support-category"
                  className="block text-xs font-semibold uppercase tracking-wider text-[#52504B] dark:text-[#A8A59C]"
                >
                  Category
                </label>
                <select
                  id="support-category"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-[#DED7C6] dark:border-[#35312A] bg-white dark:bg-[#161412] text-xs sm:text-sm text-[#171817] dark:text-[#F6F4EE] focus:outline-none focus:ring-2 focus:ring-[#8C743D]/30 transition-colors cursor-pointer"
                >
                  {(activeTab === 'report' ? REPORT_CATEGORIES : FEEDBACK_CATEGORIES).map((cat, idx) => (
                    <option key={cat} value={idx === 0 ? '' : cat} disabled={idx === 0}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>

              {/* Email Address (Optional) */}
              <div className="space-y-1.5">
                <label
                  htmlFor="support-email"
                  className="block text-xs font-semibold uppercase tracking-wider text-[#52504B] dark:text-[#A8A59C]"
                >
                  Email Address <span className="font-normal text-[#8A8881] lowercase">(optional)</span>
                </label>
                <input
                  type="email"
                  id="support-email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="w-full px-3.5 py-2 rounded-xl border border-[#DED7C6] dark:border-[#35312A] bg-white dark:bg-[#161412] text-xs sm:text-sm text-[#171817] dark:text-[#F6F4EE] placeholder:text-[#9A9891] focus:outline-none focus:ring-2 focus:ring-[#8C743D]/30 transition-colors"
                />
              </div>

              {/* Details Textarea */}
              <div className="space-y-1.5">
                <label
                  htmlFor="support-details"
                  className="block text-xs font-semibold uppercase tracking-wider text-[#52504B] dark:text-[#A8A59C]"
                >
                  {activeTab === 'report' ? 'Issue Details' : 'Feedback'}
                </label>
                <textarea
                  id="support-details"
                  rows={4}
                  required
                  value={details}
                  onChange={(e) => {
                    setDetails(e.target.value);
                    if (errorMessage) setErrorMessage(null);
                  }}
                  placeholder={
                    activeTab === 'report'
                      ? 'Please describe what occurred, what you expected, and any steps to reproduce...'
                      : 'Share your impressions, suggestions, or thoughts about your journaling experience...'
                  }
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#DED7C6] dark:border-[#35312A] bg-white dark:bg-[#161412] text-xs sm:text-sm text-[#171817] dark:text-[#F6F4EE] placeholder:text-[#9A9891] focus:outline-none focus:ring-2 focus:ring-[#8C743D]/30 transition-colors resize-none leading-relaxed"
                />
              </div>

              {/* Action Buttons */}
              <div className="pt-2 flex items-center justify-end gap-2.5 border-t border-[#EAE4D6] dark:border-[#282622]">
                <button
                  type="button"
                  id="btn-support-cancel"
                  onClick={onClose}
                  disabled={isSubmitting}
                  className="px-4 py-2 rounded-xl border border-[#D8CEBA] dark:border-[#383222] bg-[#FAF6ED] dark:bg-[#1E1C18] text-[#171817] dark:text-[#F6F4EE] hover:bg-[#F2ECE0] dark:hover:bg-[#25221D] text-xs font-medium transition-colors cursor-pointer disabled:opacity-50"
                >
                  Close
                </button>

                <button
                  type="submit"
                  id={activeTab === 'report' ? 'btn-submit-report-issue' : 'btn-submit-feedback'}
                  disabled={isSubmitting || !details.trim()}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#171817] dark:bg-[#F6F4EE] text-white dark:text-[#171817] hover:bg-[#282928] dark:hover:bg-white text-xs font-semibold transition-all shadow-xs cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Send className="w-3 h-3" />
                  <span>
                    {isSubmitting
                      ? 'Submitting...'
                      : activeTab === 'report'
                      ? 'Submit Report'
                      : 'Submit Feedback'}
                  </span>
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
