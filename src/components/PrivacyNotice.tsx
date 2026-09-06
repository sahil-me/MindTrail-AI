import React, { useState, useEffect } from 'react';
import { ShieldCheck, Lock, X, Sparkles, Check, ChevronRight } from 'lucide-react';
import { MindTrailLogo } from './MindTrailLogo';

interface PrivacyNoticeProps {
  externalShowModal?: boolean;
  onCloseExternalModal?: () => void;
}

export const PrivacyNotice: React.FC<PrivacyNoticeProps> = ({
  externalShowModal,
  onCloseExternalModal,
}) => {
  const [isDismissed, setIsDismissed] = useState<boolean>(true);
  const [showDetailsModal, setShowDetailsModal] = useState<boolean>(false);

  const isModalVisible = showDetailsModal || Boolean(externalShowModal);

  const handleCloseModal = () => {
    setShowDetailsModal(false);
    onCloseExternalModal?.();
  };

  useEffect(() => {
    try {
      const stored = localStorage.getItem('mindtrail_privacy_notice_acknowledged');
      if (!stored) {
        setIsDismissed(false);
      }
    } catch {
      setIsDismissed(false);
    }
  }, []);

  const handleDismiss = () => {
    try {
      localStorage.setItem('mindtrail_privacy_notice_acknowledged', 'true');
    } catch {
      // safe fallback
    }
    setIsDismissed(true);
  };

  if (isDismissed && !isModalVisible) {
    return null;
  }

  return (
    <>
      {/* Quiet, Refined Privacy Banner */}
      {!isDismissed && (
        <aside
          id="privacy-notice-banner"
          aria-label="Privacy notice"
          className="fixed bottom-5 sm:bottom-6 left-4 right-4 sm:left-1/2 sm:right-auto sm:-translate-x-1/2 w-auto sm:w-full sm:max-w-[540px] z-40 animate-in fade-in slide-in-from-bottom-3 duration-200"
        >
          <div className="bg-[#FFFDF8]/95 dark:bg-[#1C1B19]/95 border border-[#E6D8B5]/90 dark:border-[#383120] rounded-2xl p-3.5 sm:p-4 shadow-lg shadow-black/5 dark:shadow-2xl/40 backdrop-blur-md">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-xl bg-[#FAF6ED] dark:bg-[#26241F] border border-[#E6D8B5] dark:border-[#383120] flex items-center justify-center text-[#7C8B7A] dark:text-[#8FA08E] shrink-0 mt-0.5">
                <ShieldCheck className="w-4 h-4 text-[#7C8B7A] dark:text-[#8FA08E]" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs sm:text-[13px] text-[#171817] dark:text-[#F6F4EE] leading-relaxed font-normal">
                  MindTrail AI respects your privacy. Your memories and reflections are private by design, isolated to your account, and never used to train public AI models.
                </p>
                <div className="mt-2.5 flex flex-wrap items-center gap-2">
                  <button
                    id="btn-privacy-got-it"
                    type="button"
                    onClick={handleDismiss}
                    className="px-3.5 py-1.5 rounded-xl bg-[#171817] dark:bg-[#F6F4EE] hover:opacity-90 text-[#FFFDF8] dark:text-[#171817] text-xs font-medium tracking-wide transition-all cursor-pointer shadow-2xs active:scale-98"
                  >
                    Got it
                  </button>
                  <button
                    id="btn-privacy-details"
                    type="button"
                    onClick={() => setShowDetailsModal(true)}
                    className="px-3 py-1.5 rounded-xl bg-[#FAF6ED] dark:bg-[#24221D] hover:bg-[#F4EDDD] dark:hover:bg-[#2C2923] border border-[#E6D8B5] dark:border-[#383120] text-[#171817] dark:text-[#F6F4EE] text-xs font-medium transition-colors cursor-pointer"
                  >
                    Privacy Details
                  </button>
                </div>
              </div>
              <button
                type="button"
                onClick={handleDismiss}
                className="text-[#8C8B83] dark:text-[#7A7872] hover:text-[#171817] dark:hover:text-[#F6F4EE] p-1 rounded-lg transition-colors cursor-pointer shrink-0"
                title="Dismiss notice"
                aria-label="Close privacy notice"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        </aside>
      )}

      {/* Privacy Details Modal */}
      {isModalVisible && (
        <div
          id="privacy-details-modal"
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-in fade-in duration-200"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              handleCloseModal();
            }
          }}
        >
          <div
            className="bg-[#FFFDF8] dark:bg-[#1C1B19] border border-[#E8E5DE] dark:border-[#2C2A26] rounded-2xl max-w-lg w-full p-6 sm:p-7 shadow-2xl space-y-5"
          >
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#FAF6ED] dark:bg-[#26241F] border border-[#E6D8B5] dark:border-[#383120] flex items-center justify-center">
                  <MindTrailLogo size={24} />
                </div>
                <div>
                  <h3 className="font-serif-title text-lg font-semibold text-[#171817] dark:text-[#F6F4EE]">
                    Privacy by Design
                  </h3>
                  <p className="text-[11px] text-[#7C8B7A] dark:text-[#8FA08E] font-medium tracking-wide uppercase">
                    Our Commitment to Your Thoughts
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={handleCloseModal}
                className="text-[#8C8B83] dark:text-[#7A7872] hover:text-[#171817] dark:hover:text-[#F6F4EE] p-1 rounded-lg cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs sm:text-sm text-[#686862] dark:text-[#9E9D96] leading-relaxed">
              MindTrail AI was founded on the belief that personal journals must remain sacred and uncompromised. Here is how your data is isolated:
            </p>

            <div className="space-y-3 text-xs text-[#171817] dark:text-[#F6F4EE]">
              <div className="flex items-start gap-2.5 p-3 rounded-xl bg-[#FAF6ED]/60 dark:bg-[#23211B] border border-[#E6D8B5]/50 dark:border-[#332D1E]">
                <Lock className="w-4 h-4 text-[#7C8B7A] dark:text-[#8FA08E] shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold">User-Isolated Storage</p>
                  <p className="text-[#686862] dark:text-[#9E9D96] mt-0.5 leading-normal">
                    Entries are stored in Cloud Firestore under strict owner-only security rules. No other user or account can read or index your reflections.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-2.5 p-3 rounded-xl bg-[#FAF6ED]/60 dark:bg-[#23211B] border border-[#E6D8B5]/50 dark:border-[#332D1E]">
                <Sparkles className="w-4 h-4 text-[#C5A45D] dark:text-[#D4B774] shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold">No Model Training</p>
                  <p className="text-[#686862] dark:text-[#9E9D96] mt-0.5 leading-normal">
                    Gemini API calls are conducted server-side with strict confidentiality. Your words are never fed back to train public foundation models.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-2.5 p-3 rounded-xl bg-[#FAF6ED]/60 dark:bg-[#23211B] border border-[#E6D8B5]/50 dark:border-[#332D1E]">
                <ShieldCheck className="w-4 h-4 text-[#7C8B7A] dark:text-[#8FA08E] shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold">Full Data Sovereignty</p>
                  <p className="text-[#686862] dark:text-[#9E9D96] mt-0.5 leading-normal">
                    You can delete any single reflection or permanently erase your entire account and all associated Firestore documents at any time.
                  </p>
                </div>
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                type="button"
                onClick={handleCloseModal}
                className="px-4 py-2 rounded-xl bg-[#171817] dark:bg-[#F6F4EE] text-[#FFFDF8] dark:text-[#171817] text-xs font-semibold hover:opacity-90 transition-opacity cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
