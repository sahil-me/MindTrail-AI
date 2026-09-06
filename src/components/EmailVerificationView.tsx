import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Mail, CheckCircle2, RefreshCw, Send, LogOut, AlertCircle, ShieldAlert, Sparkles } from 'lucide-react';
import { auth, sendEmailVerification, onIdTokenChanged } from '../firebase';
import { getAuthErrorMessage } from '../utils/authErrors';

interface EmailVerificationViewProps {
  userEmail: string | null;
  onVerified: () => void;
  onSignOut: () => Promise<void>;
}

export const EmailVerificationView: React.FC<EmailVerificationViewProps> = ({
  userEmail,
  onVerified,
  onSignOut,
}) => {
  const [isVerified, setIsVerified] = useState(false);
  const [isChecking, setIsChecking] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [cooldown, setCooldown] = useState(0);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error' | 'info'; text: string } | null>(null);

  // References to prevent duplicate concurrent checks, race conditions, or unmount state updates
  const isMountedRef = useRef(true);
  const isCheckingRef = useRef(false);
  const isVerifiedRef = useRef(false);
  const lastCheckTimeRef = useRef(0);

  // Handle countdown timer for resending verification email
  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = setInterval(() => {
      setCooldown((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, [cooldown]);

  // Handle verified transition with smooth feedback
  const handleVerifiedSuccess = useCallback(() => {
    if (isVerifiedRef.current) return;
    isVerifiedRef.current = true;

    if (isMountedRef.current) {
      setIsVerified(true);
      setFeedback({
        type: 'success',
        text: 'Email verified! Welcome to MindTrail.',
      });
    }

    // Brief delay so user experiences the positive confirmation before automatically entering the dashboard
    setTimeout(() => {
      if (isMountedRef.current) {
        onVerified();
      }
    }, 1200);
  }, [onVerified]);

  // Core verification status checker: reloads current user to bypass cached claims
  const checkVerificationStatus = useCallback(
    async (isManualOrInitial = false) => {
      if (!isMountedRef.current || isVerifiedRef.current || isCheckingRef.current) {
        return;
      }

      // Debounce checks: minimum 2000ms between calls unless initial
      const now = Date.now();
      if (!isManualOrInitial && now - lastCheckTimeRef.current < 2000) {
        return;
      }

      const user = auth.currentUser;
      if (!user) return;

      // Fast path: if already marked emailVerified on current instance
      if (user.emailVerified) {
        handleVerifiedSuccess();
        return;
      }

      try {
        isCheckingRef.current = true;
        lastCheckTimeRef.current = now;
        if (isMountedRef.current) setIsChecking(true);

        // Fetch the fresh verification state directly from Firebase Authentication servers
        await user.reload();

        const refreshedUser = auth.currentUser;
        if (refreshedUser?.emailVerified) {
          handleVerifiedSuccess();
        }
      } catch (err: any) {
        console.warn('[Email Verification Check]:', err);
        // If the user was deleted or session expired in the meantime, display clear notice
        if (err?.code === 'auth/user-token-expired' || err?.code === 'auth/user-not-found') {
          if (isMountedRef.current) {
            setFeedback({
              type: 'error',
              text: 'Your session has expired. Please sign in again.',
            });
          }
        }
      } finally {
        isCheckingRef.current = false;
        if (isMountedRef.current) {
          setIsChecking(false);
        }
      }
    },
    [handleVerifiedSuccess]
  );

  // 1. Initial check when verification view mounts
  useEffect(() => {
    isMountedRef.current = true;
    checkVerificationStatus(true);
    return () => {
      isMountedRef.current = false;
    };
  }, [checkVerificationStatus]);

  // 2. Re-check when browser tab becomes visible again (e.g., user returns from their email client)
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible' && !isVerifiedRef.current) {
        checkVerificationStatus();
      }
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [checkVerificationStatus]);

  // 3. Re-check when the browser window receives focus
  useEffect(() => {
    const handleWindowFocus = () => {
      if (!isVerifiedRef.current) {
        checkVerificationStatus();
      }
    };
    window.addEventListener('focus', handleWindowFocus);
    return () => {
      window.removeEventListener('focus', handleWindowFocus);
    };
  }, [checkVerificationStatus]);

  // 4. Subtle fallback interval: checks every 4.5 seconds ONLY while tab is active/visible
  useEffect(() => {
    const interval = setInterval(() => {
      if (document.visibilityState === 'visible' && !isVerifiedRef.current) {
        checkVerificationStatus();
      }
    }, 4500);

    return () => clearInterval(interval);
  }, [checkVerificationStatus]);

  // 5. Listen to ID token / Auth changes
  useEffect(() => {
    const unsubscribe = onIdTokenChanged(auth, (user) => {
      if (user?.emailVerified && !isVerifiedRef.current) {
        handleVerifiedSuccess();
      }
    });
    return () => unsubscribe();
  }, [handleVerifiedSuccess]);

  // Handle "Resend verification email" action
  const handleResendEmail = async () => {
    if (cooldown > 0 || isResending || isVerified) return;
    setIsResending(true);
    setFeedback(null);
    try {
      const user = auth.currentUser;
      if (!user) {
        throw new Error('No active user session. Please sign in again.');
      }
      await sendEmailVerification(user);
      setCooldown(60);
      setFeedback({
        type: 'success',
        text: `A fresh verification link has been sent to ${userEmail || 'your email'}. Please check your inbox and spam folder.`,
      });
    } catch (err: any) {
      console.warn('[Resend Verification]:', err);
      setFeedback({
        type: 'error',
        text: getAuthErrorMessage(err),
      });
    } finally {
      if (isMountedRef.current) {
        setIsResending(false);
      }
    }
  };

  return (
    <div
      id="email-verification-view"
      className="min-h-[85vh] flex flex-col justify-center items-center px-4 py-12"
    >
      <div
        id="email-verification-card"
        className="max-w-md w-full rounded-3xl border border-stone-200/90 bg-white/95 shadow-sm p-6 sm:p-8 text-center transition-all"
      >
        {/* Animated icon container */}
        <div
          id="verification-icon-container"
          className={`w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-5 shadow-xs transition-colors ${
            isVerified
              ? 'bg-emerald-50 border border-emerald-200 text-emerald-700'
              : 'bg-amber-50 border border-amber-200/80 text-amber-800'
          }`}
        >
          {isVerified ? (
            <CheckCircle2 className="w-8 h-8 text-emerald-600 animate-in zoom-in-75 duration-300" />
          ) : (
            <Mail className="w-8 h-8 text-amber-700" />
          )}
        </div>

        {/* Header Badge */}
        <span
          id="verification-status-badge"
          className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium border mb-3 transition-colors ${
            isVerified
              ? 'bg-emerald-100/70 text-emerald-900 border-emerald-200'
              : 'bg-amber-100/70 text-amber-900 border-amber-200'
          }`}
        >
          {isVerified ? (
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-700" />
          ) : (
            <Sparkles className="w-3.5 h-3.5 text-amber-700" />
          )}
          {isVerified ? 'Verification Complete' : 'Email Verification Required'}
        </span>

        <h1
          id="verification-heading"
          className="font-serif-title text-2xl sm:text-3xl font-semibold text-stone-900 tracking-tight mb-2"
        >
          {isVerified ? 'Email verified!' : 'Verify your email address'}
        </h1>

        {/* Explicit instructions */}
        <p
          id="verification-explanation"
          className="text-stone-600 text-sm leading-relaxed mb-4"
        >
          {isVerified
            ? 'Welcome to MindTrail. Opening your journal dashboard now...'
            : "Check your inbox to verify your email. Open the verification link in the email, then return to MindTrail. We'll automatically continue once your email is verified."}
        </p>

        {/* User's email badge */}
        <div
          id="user-email-display-badge"
          className="bg-stone-50 border border-stone-200 rounded-xl px-4 py-2.5 mb-5 text-xs text-stone-800 font-mono break-all inline-block max-w-full"
        >
          {userEmail || 'Your registered email'}
        </div>

        {/* Dynamic Status / Success Card */}
        {isVerified ? (
          <div
            id="verification-success-banner"
            className="mb-6 p-4 bg-emerald-50/90 border border-emerald-200 rounded-2xl text-xs text-emerald-900 flex items-center justify-center gap-2.5 animate-in fade-in duration-300"
          >
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span className="font-semibold text-sm">Email verified! Welcome to MindTrail.</span>
          </div>
        ) : (
          <div
            id="verification-waiting-status"
            className="mb-6 p-3.5 bg-stone-50/80 border border-stone-200/90 rounded-2xl text-xs text-stone-600 flex items-center justify-center gap-2.5"
          >
            <RefreshCw
              className={`w-3.5 h-3.5 text-amber-600 ${
                isChecking ? 'animate-spin' : 'animate-spin duration-1000'
              }`}
            />
            <span className="font-medium text-stone-700">Waiting for email verification…</span>
          </div>
        )}

        {/* Feedback Alert for Resend / Errors */}
        {feedback && !isVerified && (
          <div
            id="verification-feedback-alert"
            className={`mb-6 p-3.5 rounded-xl border text-xs text-left flex items-start gap-2.5 ${
              feedback.type === 'success'
                ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
                : feedback.type === 'error'
                ? 'bg-rose-50 border-rose-200 text-rose-900'
                : 'bg-amber-50 border-amber-200 text-amber-900'
            }`}
          >
            {feedback.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
            ) : feedback.type === 'error' ? (
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
            ) : (
              <ShieldAlert className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
            )}
            <span className="flex-1 leading-relaxed">{feedback.text}</span>
          </div>
        )}

        {/* Actions */}
        {!isVerified && (
          <div className="space-y-3">
            {/* Kept: Resend verification email button */}
            <button
              id="btn-resend-verification-email"
              onClick={handleResendEmail}
              disabled={isResending || cooldown > 0}
              className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-stone-200 bg-white hover:bg-stone-50 text-stone-700 text-xs sm:text-sm font-medium transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed active:scale-98 shadow-2xs"
            >
              <Send className="w-3.5 h-3.5 text-stone-500" />
              <span>
                {isResending
                  ? 'Sending link...'
                  : cooldown > 0
                  ? `Resend in ${cooldown}s`
                  : 'Resend verification email'}
              </span>
            </button>
          </div>
        )}

        {/* Helpful instructions */}
        <div className="mt-6 pt-5 border-t border-stone-100 text-left text-xs text-stone-500 space-y-1.5">
          <p className="font-medium text-stone-700">Didn't receive the email?</p>
          <ul className="list-disc list-inside space-y-1 text-stone-500">
            <li>Check your spam, junk, or promotions folder.</li>
            <li>Verification links are typically delivered within 60 seconds.</li>
            <li>If you entered a typo in your email address, sign out below to re-register.</li>
          </ul>
        </div>

        {/* Sign out / switch account */}
        <div className="mt-6">
          <button
            id="btn-verification-sign-out"
            onClick={onSignOut}
            className="inline-flex items-center gap-1.5 text-xs text-stone-500 hover:text-stone-800 transition-colors cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Sign out / Use a different account</span>
          </button>
        </div>
      </div>
    </div>
  );
};
