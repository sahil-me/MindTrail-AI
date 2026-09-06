import React, { useState, useEffect, useRef } from 'react';
import { MindTrailLogo } from './MindTrailLogo';
import {
  Mail,
  Sparkles,
  Lock,
  Eye,
  EyeOff,
  AlertCircle,
  CheckCircle2,
  ChevronLeft,
  Phone,
  RefreshCw,
  X,
} from 'lucide-react';
import {
  auth,
  db,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  sendPasswordResetEmail,
  sendEmailVerification,
  updateProfile,
  RecaptchaVerifier,
  signInWithPhoneNumber,
} from '../firebase';
import { doc, setDoc } from 'firebase/firestore';

export type AuthFlow = 'signin' | 'signup';
export type AuthSubView = 'select' | 'email' | 'phone' | 'forgot_password';

interface AuthLandingProps {
  onGoogleSignIn: () => Promise<void>;
  isGoogleLoading: boolean;
  externalError: string | null;
  authFlow?: AuthFlow;
  onSwitchFlow?: (flow: AuthFlow) => void;
  onClose?: () => void;
}

export const AuthLanding: React.FC<AuthLandingProps> = ({
  onGoogleSignIn,
  isGoogleLoading,
  externalError,
  authFlow: controlledFlow,
  onSwitchFlow,
  onClose,
}) => {
  // Main mode: Sign Up vs Sign In
  const [internalFlow, setInternalFlow] = useState<AuthFlow>(controlledFlow || 'signup');
  const activeFlow = controlledFlow || internalFlow;

  // Sub-view: initial selection vs email form vs phone form vs forgot password
  const [authSubView, setAuthSubView] = useState<AuthSubView>('select');

  // Sync with prop if changed from header
  useEffect(() => {
    if (controlledFlow) {
      setInternalFlow(controlledFlow);
      setAuthSubView('select');
      setErrorMessage(null);
      setSuccessNotice(null);
    }
  }, [controlledFlow]);

  // Form fields for Email registration & login
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // Touched states for progressive inline validation
  const [touched, setTouched] = useState<{ [key: string]: boolean }>({});

  // UI state
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isPasswordFocused, setIsPasswordFocused] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successNotice, setSuccessNotice] = useState<string | null>(null);

  // Phone Authentication states
  const [phoneCountryCode, setPhoneCountryCode] = useState('+1');
  const [phoneNumberInput, setPhoneNumberInput] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [confirmationResult, setConfirmationResult] = useState<any>(null);
  const [isSendingCode, setIsSendingCode] = useState(false);
  const [isVerifyingCode, setIsVerifyingCode] = useState(false);
  const recaptchaVerifierRef = useRef<any>(null);

  // Cleanup recaptcha on unmount
  useEffect(() => {
    return () => {
      if (recaptchaVerifierRef.current) {
        try {
          recaptchaVerifierRef.current.clear();
        } catch {
          // ignore
        }
      }
    };
  }, []);

  // Field validation helpers
  const isValidEmail = (val: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val.trim());

  // Phone is optional for sign-up: valid if blank, or valid format with at least 7 digits if entered
  const isValidPhone = (val: string) => {
    const clean = val.trim();
    if (!clean) return true;
    const digitCount = (clean.match(/\d/g) || []).length;
    const formatValid = /^[+]?[\d\s().-]{7,25}$/.test(clean);
    return formatValid && digitCount >= 7;
  };

  // Live password policy requirements
  const passwordRequirements = [
    { id: 'min_length', label: 'At least 8 characters', met: password.length >= 8 },
    { id: 'uppercase', label: 'One uppercase letter', met: /[A-Z]/.test(password) },
    { id: 'lowercase', label: 'One lowercase letter', met: /[a-z]/.test(password) },
    { id: 'number', label: 'One number', met: /[0-9]/.test(password) },
    { id: 'special', label: 'One special character', met: /[^A-Za-z0-9]/.test(password) },
  ];

  const satisfiedCount = passwordRequirements.filter((req) => req.met).length;
  const isPasswordValid = satisfiedCount === passwordRequirements.length;
  const isEmailValid = isValidEmail(email);
  const isPhoneNumberValid = isValidPhone(phone);
  const isPasswordsMatch = confirmPassword.length > 0 && confirmPassword === password;

  // Comprehensive Create Account Form Validity
  const isSignUpFormValid =
    firstName.trim().length > 0 &&
    lastName.trim().length > 0 &&
    isEmailValid &&
    isPhoneNumberValid &&
    isPasswordValid &&
    isPasswordsMatch;

  const markTouched = (field: string) => {
    setTouched((prev) => ({ ...prev, [field]: true }));
  };

  // Switch between Sign-In and Sign-Up flows
  const handleSwitchFlow = (flow: AuthFlow) => {
    setInternalFlow(flow);
    if (onSwitchFlow) {
      onSwitchFlow(flow);
    }
    setAuthSubView('select');
    setErrorMessage(null);
    setSuccessNotice(null);
    setShowPassword(false);
    setShowConfirmPassword(false);
    setTouched({});
    setConfirmationResult(null);
    setVerificationCode('');
  };

  // Switch sub-views within the current flow
  const handleSwitchSubView = (subView: AuthSubView) => {
    setAuthSubView(subView);
    setErrorMessage(null);
    setSuccessNotice(null);
    setShowPassword(false);
    setShowConfirmPassword(false);
    setTouched({});
  };

  // Map Firebase Auth Errors to clean, secure user-friendly explanations
  const getAuthErrorMessage = (err: any): string => {
    const code = err?.code || '';
    switch (code) {
      case 'auth/user-not-found':
      case 'auth/wrong-password':
      case 'auth/invalid-credential':
        return 'Incorrect email or password. Please double check and try again.';
      case 'auth/email-already-in-use':
        return 'An account already exists with this email. Please sign in instead.';
      case 'auth/invalid-email':
        return 'Please provide a valid email address.';
      case 'auth/weak-password':
        return 'Password must be at least 8 characters with upper, lower, number, and special character.';
      case 'auth/too-many-requests':
        return 'Too many attempts. Access is temporarily paused for security. Please try again in a few moments.';
      case 'auth/network-request-failed':
        return 'Network connection issue. Please check your internet connection.';
      case 'auth/popup-closed-by-user':
        return 'Sign in was cancelled before completing.';
      case 'auth/invalid-phone-number':
        return 'The phone number entered is invalid. Please check the country code and digits.';
      case 'auth/quota-exceeded':
        return 'SMS quota exceeded for now. Please use Google or Email to sign in.';
      case 'auth/invalid-verification-code':
        return 'Invalid verification code. Please check and try again.';
      case 'auth/code-expired':
        return 'Verification code has expired. Please request a new code.';
      default:
        return err?.message || 'Authentication encountered an issue. Please try again.';
    }
  };

  // 1. Handle Email & Password Sign In
  const handleEmailSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanEmail = email.trim();
    if (!cleanEmail) {
      setErrorMessage('Enter a valid email address.');
      return;
    }
    if (!password) {
      setErrorMessage('Please enter your password.');
      return;
    }

    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      await signInWithEmailAndPassword(auth, cleanEmail, password);
    } catch (err: any) {
      console.warn('[Sign-In Error]:', err);
      setErrorMessage(getAuthErrorMessage(err));
    } finally {
      setIsSubmitting(false);
    }
  };

  // 2. Handle Create Account
  const handleEmailSignUp = async (e: React.FormEvent) => {
    e.preventDefault();

    setTouched({
      firstName: true,
      lastName: true,
      email: true,
      phone: true,
      password: true,
      confirmPassword: true,
    });

    const cleanFirstName = firstName.trim();
    const cleanLastName = lastName.trim();
    const cleanEmail = email.trim();
    const cleanPhone = phone.trim();

    if (!cleanFirstName) {
      setErrorMessage('First name is required.');
      return;
    }
    if (!cleanLastName) {
      setErrorMessage('Last name is required.');
      return;
    }
    if (!cleanEmail || !isValidEmail(cleanEmail)) {
      setErrorMessage('Enter a valid email address.');
      return;
    }
    if (cleanPhone && !isValidPhone(cleanPhone)) {
      setErrorMessage('Enter a valid phone number or leave blank.');
      return;
    }
    if (!isPasswordValid) {
      setErrorMessage("Your password doesn't meet the requirements below.");
      return;
    }
    if (password !== confirmPassword) {
      setErrorMessage('Passwords do not match.');
      return;
    }

    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, cleanEmail, password);
      const combinedName = `${cleanFirstName} ${cleanLastName}`.trim();

      if (userCredential.user) {
        // 1. Update Firebase Auth Profile with full display name
        try {
          await updateProfile(userCredential.user, { displayName: combinedName });
        } catch (nameErr) {
          console.warn('[Display Name Update]:', nameErr);
        }

        // 2. Persist profile attributes in isolated user Firestore document and cache
        const initialProfileData = {
          uid: userCredential.user.uid,
          firstName: cleanFirstName,
          lastName: cleanLastName,
          displayName: combinedName,
          email: cleanEmail,
          phoneNumber: cleanPhone || null,
          avatarType: 'initials' as const,
          photoURL: null,
          emailVerified: false,
          providerId: 'password',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };

        try {
          localStorage.setItem(
            `mindtrail_profile_${userCredential.user.uid}`,
            JSON.stringify(initialProfileData)
          );
        } catch {
          // Ignore
        }

        try {
          await setDoc(
            doc(db, 'users', userCredential.user.uid),
            initialProfileData,
            { merge: true }
          );
        } catch (dbErr) {
          console.warn('[User Doc Init]:', dbErr);
        }

        // 3. Send verification email
        await sendEmailVerification(userCredential.user);
      }
    } catch (err: any) {
      console.warn('[Sign-Up]:', err);
      setErrorMessage(getAuthErrorMessage(err));
    } finally {
      setIsSubmitting(false);
    }
  };

  // 3. Handle Password Reset
  const handlePasswordReset = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanEmail = email.trim();
    if (!cleanEmail) {
      setErrorMessage('Enter a valid email address.');
      return;
    }

    setIsSubmitting(true);
    setErrorMessage(null);
    setSuccessNotice(null);

    try {
      await sendPasswordResetEmail(auth, cleanEmail);
      setSuccessNotice(
        `If an account exists for ${cleanEmail}, a password reset link has been sent. Check your inbox.`
      );
    } catch (err: any) {
      console.warn('[Password Reset]:', err);
      setErrorMessage(getAuthErrorMessage(err));
    } finally {
      setIsSubmitting(false);
    }
  };

  // 4. Handle Phone Number Authentication: Send Code
  const handleSendPhoneCode = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanDigits = phoneNumberInput.trim().replace(/[\s()-]/g, '');
    if (!cleanDigits || cleanDigits.length < 5) {
      setErrorMessage('Please enter a valid phone number.');
      return;
    }

    const fullPhoneNumber = `${phoneCountryCode}${cleanDigits}`;
    setIsSendingCode(true);
    setErrorMessage(null);

    try {
      if (!recaptchaVerifierRef.current) {
        recaptchaVerifierRef.current = new RecaptchaVerifier(auth, 'recaptcha-verifier-container', {
          size: 'invisible',
        });
      }

      const confirmation = await signInWithPhoneNumber(
        auth,
        fullPhoneNumber,
        recaptchaVerifierRef.current
      );
      setConfirmationResult(confirmation);
      setSuccessNotice(`Verification code sent to ${fullPhoneNumber}.`);
    } catch (err: any) {
      console.warn('[Phone Auth Send Code]:', err);
      if (recaptchaVerifierRef.current) {
        try {
          recaptchaVerifierRef.current.clear();
        } catch {
          // ignore
        }
        recaptchaVerifierRef.current = null;
      }
      setErrorMessage(getAuthErrorMessage(err));
    } finally {
      setIsSendingCode(false);
    }
  };

  // 5. Handle Phone Number Authentication: Verify Code
  const handleVerifyPhoneCode = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanCode = verificationCode.trim();
    if (!cleanCode || cleanCode.length < 6) {
      setErrorMessage('Please enter the 6-digit verification code.');
      return;
    }

    setIsVerifyingCode(true);
    setErrorMessage(null);

    try {
      const userCredential = await confirmationResult.confirm(cleanCode);
      if (userCredential.user) {
        const userDocRef = doc(db, 'users', userCredential.user.uid);
        await setDoc(
          userDocRef,
          {
            uid: userCredential.user.uid,
            phoneNumber: userCredential.user.phoneNumber,
            providerId: 'phone',
            updatedAt: new Date().toISOString(),
          },
          { merge: true }
        );
      }
    } catch (err: any) {
      console.warn('[Phone Auth Confirm]:', err);
      setErrorMessage('Invalid or expired verification code. Please try again.');
    } finally {
      setIsVerifyingCode(false);
    }
  };

  const handleResetPhoneFlow = () => {
    setConfirmationResult(null);
    setVerificationCode('');
    setErrorMessage(null);
    setSuccessNotice(null);
    if (recaptchaVerifierRef.current) {
      try {
        recaptchaVerifierRef.current.clear();
      } catch {
        // ignore
      }
      recaptchaVerifierRef.current = null;
    }
  };

  const activeError = errorMessage || externalError;
  const isBusy = isSubmitting || isGoogleLoading || isSendingCode || isVerifyingCode;
  const showRequirements =
    isPasswordFocused || password.length > 0 || touched.password;

  return (
    <div
      id="auth-landing-view"
      className="min-h-[calc(100vh-140px)] flex flex-col justify-center items-center px-4 py-8 sm:py-12 pb-24 sm:pb-28"
    >
      {/* Invisible container for phone authentication reCAPTCHA */}
      <div id="recaptcha-verifier-container" />

      <div className="w-full max-w-[460px]">
        {/* Centered Card */}
        <div
          id="auth-container-card"
          className="relative bg-white dark:bg-stone-900 rounded-2xl border border-stone-200/90 dark:border-stone-800 shadow-sm p-6 sm:p-8 transition-all"
        >
          {/* Optional Close Button */}
          {onClose && (
            <button
              type="button"
              id="btn-close-auth-card"
              onClick={onClose}
              className="absolute top-4 right-4 p-1.5 rounded-lg text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors cursor-pointer"
              aria-label="Close dialog"
            >
              <X className="w-4 h-4" />
            </button>
          )}

          {/* Back Button (Only for sub-views) */}
          {authSubView !== 'select' && (
            <button
              type="button"
              id={
                authSubView === 'forgot_password'
                  ? 'btn-back-to-signin-from-forgot'
                  : activeFlow === 'signup'
                  ? 'btn-back-to-signup-select'
                  : 'btn-back-to-signin-select'
              }
              onClick={() => {
                if (authSubView === 'forgot_password') {
                  handleSwitchSubView('email');
                } else {
                  handleSwitchSubView('select');
                }
                handleResetPhoneFlow();
              }}
              className="inline-flex items-center gap-1.5 text-xs text-stone-500 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-100 mb-4 transition-colors cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4" />
              <span>
                {authSubView === 'forgot_password' ? 'Back to Sign In' : 'Back to options'}
              </span>
            </button>
          )}

          {/* Header & Branding */}
          <div className="flex flex-col items-center text-center mb-6">
            <div id="auth-brand-badge" className="mb-3 flex items-center justify-center">
              <MindTrailLogo size={40} />
            </div>

            <h1
              id="landing-hero-heading"
              className="font-serif-title text-2xl sm:text-[26px] font-semibold tracking-tight text-stone-900 dark:text-stone-100 leading-tight"
            >
              {authSubView === 'forgot_password'
                ? 'Reset your password'
                : authSubView === 'phone'
                ? 'Sign in with Phone'
                : activeFlow === 'signup'
                ? 'Create your account'
                : 'Welcome back!'}
            </h1>

            <p
              id="landing-hero-description"
              className="text-stone-500 dark:text-stone-400 text-sm mt-1.5"
            >
              {authSubView === 'forgot_password'
                ? 'Enter your email address to receive a recovery link.'
                : authSubView === 'phone'
                ? 'Enter your mobile number to receive a one-time verification code.'
                : activeFlow === 'signup'
                ? 'Start your private AI journal.'
                : authSubView === 'email'
                ? 'Sign in to continue your private reflection journal.'
                : 'Your private space for reflection.'}
            </p>
          </div>

          {/* Active Error Notice */}
          {activeError && (
            <div
              id="auth-error-alert"
              className="mb-5 p-3.5 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/50 text-rose-900 dark:text-rose-200 text-xs flex items-start gap-2.5 animate-in fade-in duration-200"
            >
              <AlertCircle className="w-4 h-4 text-rose-600 dark:text-rose-400 shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="font-medium leading-relaxed">{activeError}</p>
              </div>
            </div>
          )}

          {/* Active Success Notice */}
          {successNotice && (
            <div
              id="auth-success-alert"
              className="mb-5 p-3.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900/50 text-emerald-900 dark:text-emerald-200 text-xs flex items-start gap-2.5 animate-in fade-in duration-200"
            >
              <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="leading-relaxed">{successNotice}</p>
              </div>
            </div>
          )}

          {/* ============================================================ */}
          {/* VIEW A: INITIAL AUTHENTICATION SELECTION SCREEN              */}
          {/* ============================================================ */}
          {authSubView === 'select' && (
            <div className="space-y-4">
              {/* Primary Option: Google Authentication */}
              <button
                id={activeFlow === 'signup' ? 'btn-google-sign-up' : 'btn-google-sign-in'}
                type="button"
                onClick={onGoogleSignIn}
                disabled={isBusy}
                className="w-full inline-flex items-center justify-center gap-3 px-4 py-2.5 rounded-xl bg-white dark:bg-stone-850 border border-stone-200 dark:border-stone-750 hover:bg-stone-50 dark:hover:bg-stone-800 hover:border-stone-300 text-stone-750 dark:text-stone-200 font-medium text-sm transition-all shadow-2xs cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed active:scale-98"
              >
                {isGoogleLoading ? (
                  <RefreshCw className="w-4 h-4 animate-spin text-stone-500" />
                ) : (
                  <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                    <path
                      fill="#4285F4"
                      d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17z"
                    />
                    <path
                      fill="#34A853"
                      d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.33 24 12 24z"
                    />
                    <path
                      fill="#FBBC05"
                      d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 9.99 0 12s.45 3.82 1.25 5.42l4.03-3.15z"
                    />
                    <path
                      fill="#EA4335"
                      d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
                    />
                  </svg>
                )}
                <span>
                  {isGoogleLoading
                    ? 'Connecting...'
                    : activeFlow === 'signup'
                    ? 'Sign up with Google'
                    : 'Continue with Google'}
                </span>
              </button>

              {/* ──────── OR ──────── Divider */}
              <div className="relative flex items-center justify-center my-5">
                <div className="border-t border-stone-200 dark:border-stone-800 w-full" />
                <span className="bg-white dark:bg-stone-900 px-3 text-[11px] font-medium text-stone-400 uppercase tracking-wider shrink-0">
                  OR
                </span>
                <div className="border-t border-stone-200 dark:border-stone-800 w-full" />
              </div>

              {/* Email Option */}
              <button
                id={activeFlow === 'signup' ? 'btn-select-email-signup' : 'btn-select-email-signin'}
                type="button"
                onClick={() => handleSwitchSubView('email')}
                disabled={isBusy}
                className="w-full inline-flex items-center justify-center gap-2.5 px-4 py-2.5 rounded-xl bg-stone-900 dark:bg-stone-100 hover:bg-stone-800 dark:hover:bg-white text-stone-50 dark:text-stone-900 font-medium text-sm transition-all shadow-xs cursor-pointer disabled:opacity-60 active:scale-98"
              >
                <Mail className="w-4 h-4 text-stone-300 dark:text-stone-700" />
                <span>
                  {activeFlow === 'signup' ? 'Sign up with Email' : 'Continue with Email'}
                </span>
              </button>

              {/* Bottom Switch between Sign-Up and Sign-In */}
              <div className="pt-4 border-t border-stone-100 dark:border-stone-800 text-center mt-6">
                {activeFlow === 'signup' ? (
                  <p className="text-xs text-stone-500 dark:text-stone-400">
                    Already have an account?{' '}
                    <button
                      id="btn-switch-to-signin-from-selection"
                      type="button"
                      onClick={() => handleSwitchFlow('signin')}
                      className="font-semibold text-amber-700 dark:text-amber-400 hover:text-amber-800 dark:hover:text-amber-300 cursor-pointer hover:underline"
                    >
                      Sign in
                    </button>
                  </p>
                ) : (
                  <p className="text-xs text-stone-500 dark:text-stone-400">
                    Don't have an account?{' '}
                    <button
                      id="btn-switch-to-signup-from-selection"
                      type="button"
                      onClick={() => handleSwitchFlow('signup')}
                      className="font-semibold text-amber-700 dark:text-amber-400 hover:text-amber-800 dark:hover:text-amber-300 cursor-pointer hover:underline"
                    >
                      Create account
                    </button>
                  </p>
                )}
              </div>
            </div>
          )}

          {/* ============================================================ */}
          {/* VIEW B: EMAIL SIGN-IN FORM                                   */}
          {/* ============================================================ */}
          {authSubView === 'email' && activeFlow === 'signin' && (
            <form onSubmit={handleEmailSignIn} className="space-y-4">
              <div>
                <label
                  htmlFor="input-signin-email"
                  className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1.5"
                >
                  Email address
                </label>
                <input
                  id="input-signin-email"
                  type="email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (errorMessage) setErrorMessage(null);
                  }}
                  placeholder="sahil@example.com"
                  required
                  autoComplete="email"
                  disabled={isBusy}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 dark:border-stone-750 bg-stone-50/40 dark:bg-stone-800 text-sm text-stone-900 dark:text-stone-100 focus:outline-none focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500 transition-all placeholder:text-stone-400 placeholder:opacity-60"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label
                    htmlFor="input-signin-password"
                    className="block text-xs font-semibold text-stone-700 dark:text-stone-300"
                  >
                    Password
                  </label>
                  <button
                    type="button"
                    id="btn-goto-forgot-password"
                    onClick={() => handleSwitchSubView('forgot_password')}
                    className="text-xs text-amber-700 dark:text-amber-400 hover:text-amber-800 font-medium cursor-pointer transition-colors"
                  >
                    Forgot password?
                  </button>
                </div>
                <div className="relative">
                  <input
                    id="input-signin-password"
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      if (errorMessage) setErrorMessage(null);
                    }}
                    placeholder="Enter your password"
                    required
                    autoComplete="current-password"
                    disabled={isBusy}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 dark:border-stone-750 bg-stone-50/40 dark:bg-stone-800 text-sm text-stone-900 dark:text-stone-100 focus:outline-none focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500 transition-all placeholder:text-stone-400 placeholder:opacity-60 pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    tabIndex={-1}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600 dark:hover:text-stone-300 p-1 cursor-pointer"
                    title={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>

              <button
                id="btn-submit-email-signin"
                type="submit"
                disabled={isBusy || !email || !password}
                className="w-full mt-2 inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-medium text-sm transition-all shadow-2xs cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed active:scale-98"
              >
                {isSubmitting ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Signing in...</span>
                  </>
                ) : (
                  <span>Sign In</span>
                )}
              </button>

              {/* Bottom Switch to Sign-Up */}
              <div className="pt-4 border-t border-stone-100 dark:border-stone-800 text-center mt-5">
                <p className="text-xs text-stone-500 dark:text-stone-400">
                  Don't have an account?{' '}
                  <button
                    id="btn-switch-to-signup"
                    type="button"
                    onClick={() => handleSwitchFlow('signup')}
                    className="font-semibold text-amber-700 dark:text-amber-400 hover:text-amber-800 dark:hover:text-amber-300 cursor-pointer hover:underline"
                  >
                    Create account
                  </button>
                </p>
              </div>
            </form>
          )}

          {/* ============================================================ */}
          {/* VIEW C: EMAIL SIGN-UP (CREATE ACCOUNT) FORM                  */}
          {/* ============================================================ */}
          {authSubView === 'email' && activeFlow === 'signup' && (
            <form onSubmit={handleEmailSignUp} className="space-y-3.5">
              {/* First Name & Last Name Row */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label
                    htmlFor="input-signup-firstname"
                    className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1"
                  >
                    First Name <span className="text-amber-600">*</span>
                  </label>
                  <input
                    id="input-signup-firstname"
                    type="text"
                    value={firstName}
                    onChange={(e) => {
                      setFirstName(e.target.value);
                      if (errorMessage) setErrorMessage(null);
                    }}
                    onBlur={() => markTouched('firstName')}
                    placeholder="Sahil"
                    required
                    autoComplete="given-name"
                    disabled={isBusy}
                    className={`w-full px-3.5 py-2.5 rounded-xl border text-sm text-stone-900 dark:text-stone-100 bg-stone-50/40 dark:bg-stone-800 transition-all placeholder:text-stone-400 placeholder:opacity-60 focus:outline-none focus:ring-2 ${
                      touched.firstName && !firstName.trim()
                        ? 'border-rose-300 focus:ring-rose-500/20 focus:border-rose-500'
                        : 'border-stone-200 dark:border-stone-750 focus:ring-amber-500/30 focus:border-amber-500'
                    }`}
                  />
                  {touched.firstName && !firstName.trim() && (
                    <p className="text-[11px] text-rose-600 dark:text-rose-400 mt-1">First name is required</p>
                  )}
                </div>

                <div>
                  <label
                    htmlFor="input-signup-lastname"
                    className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1"
                  >
                    Last Name <span className="text-amber-600">*</span>
                  </label>
                  <input
                    id="input-signup-lastname"
                    type="text"
                    value={lastName}
                    onChange={(e) => {
                      setLastName(e.target.value);
                      if (errorMessage) setErrorMessage(null);
                    }}
                    onBlur={() => markTouched('lastName')}
                    placeholder="Sharma"
                    required
                    autoComplete="family-name"
                    disabled={isBusy}
                    className={`w-full px-3.5 py-2.5 rounded-xl border text-sm text-stone-900 dark:text-stone-100 bg-stone-50/40 dark:bg-stone-800 transition-all placeholder:text-stone-400 placeholder:opacity-60 focus:outline-none focus:ring-2 ${
                      touched.lastName && !lastName.trim()
                        ? 'border-rose-300 focus:ring-rose-500/20 focus:border-rose-500'
                        : 'border-stone-200 dark:border-stone-750 focus:ring-amber-500/30 focus:border-amber-500'
                    }`}
                  />
                  {touched.lastName && !lastName.trim() && (
                    <p className="text-[11px] text-rose-600 dark:text-rose-400 mt-1">Last name is required</p>
                  )}
                </div>
              </div>

              {/* Email Address */}
              <div>
                <label
                  htmlFor="input-signup-email"
                  className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1"
                >
                  Email Address <span className="text-amber-600">*</span>
                </label>
                <input
                  id="input-signup-email"
                  type="email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (errorMessage) setErrorMessage(null);
                  }}
                  onBlur={() => markTouched('email')}
                  placeholder="sahil@example.com"
                  required
                  autoComplete="email"
                  disabled={isBusy}
                  className={`w-full px-3.5 py-2.5 rounded-xl border text-sm text-stone-900 dark:text-stone-100 bg-stone-50/40 dark:bg-stone-800 transition-all placeholder:text-stone-400 placeholder:opacity-60 focus:outline-none focus:ring-2 ${
                    touched.email && !isEmailValid
                      ? 'border-rose-300 focus:ring-rose-500/20 focus:border-rose-500'
                      : 'border-stone-200 dark:border-stone-750 focus:ring-amber-500/30 focus:border-amber-500'
                  }`}
                />
                {touched.email && !isEmailValid && (
                  <p className="text-[11px] text-rose-600 dark:text-rose-400 mt-1">Enter a valid email address</p>
                )}
              </div>

              {/* Password */}
              <div>
                <label
                  htmlFor="input-signup-password"
                  className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1"
                >
                  Password <span className="text-amber-600">*</span>
                </label>
                <div className="relative">
                  <input
                    id="input-signup-password"
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      if (errorMessage) setErrorMessage(null);
                    }}
                    onFocus={() => setIsPasswordFocused(true)}
                    onBlur={() => {
                      setIsPasswordFocused(false);
                      markTouched('password');
                    }}
                    placeholder="Enter a password"
                    required
                    autoComplete="new-password"
                    disabled={isBusy}
                    className={`w-full px-3.5 py-2.5 rounded-xl border text-sm text-stone-900 dark:text-stone-100 bg-stone-50/40 dark:bg-stone-800 transition-all placeholder:text-stone-400 placeholder:opacity-60 focus:outline-none focus:ring-2 pr-10 ${
                      touched.password && !isPasswordValid
                        ? 'border-rose-300 focus:ring-rose-500/20 focus:border-rose-500'
                        : 'border-stone-200 dark:border-stone-750 focus:ring-amber-500/30 focus:border-amber-500'
                    }`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    tabIndex={-1}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600 dark:hover:text-stone-300 p-1 cursor-pointer"
                    title={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                </div>

                {/* Password Requirements Checklist (Live Feedback) */}
                {showRequirements && (
                  <div
                    id="password-requirements-checklist"
                    className="mt-2 p-3 rounded-xl bg-stone-50/80 dark:bg-stone-850/80 border border-stone-200/70 dark:border-stone-800 text-[11px] space-y-1 animate-in fade-in duration-150"
                  >
                    <div className="flex items-center justify-between font-medium text-stone-700 dark:text-stone-300 mb-1">
                      <span>Password requirements:</span>
                      <span
                        className={
                          isPasswordValid
                            ? 'text-emerald-600 dark:text-emerald-400 font-semibold'
                            : 'text-stone-400'
                        }
                      >
                        {satisfiedCount} of 5 satisfied
                      </span>
                    </div>
                    {passwordRequirements.map((req) => (
                      <div
                        key={req.id}
                        id={`req-${req.id}`}
                        className={`flex items-center gap-2 ${
                          req.met
                            ? 'text-emerald-700 dark:text-emerald-400'
                            : 'text-stone-400 dark:text-stone-500'
                        }`}
                      >
                        <span className="w-3.5 h-3.5 flex items-center justify-center shrink-0">
                          {req.met ? (
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                          ) : (
                            <span className="w-1.5 h-1.5 rounded-full bg-stone-300 dark:bg-stone-600" />
                          )}
                        </span>
                        <span>{req.label}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Confirm Password */}
              <div>
                <label
                  htmlFor="input-signup-confirm-password"
                  className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1"
                >
                  Confirm Password <span className="text-amber-600">*</span>
                </label>
                <div className="relative">
                  <input
                    id="input-signup-confirm-password"
                    type={showConfirmPassword ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={(e) => {
                      setConfirmPassword(e.target.value);
                      if (errorMessage) setErrorMessage(null);
                    }}
                    onBlur={() => markTouched('confirmPassword')}
                    placeholder="Re-enter your password"
                    required
                    autoComplete="new-password"
                    disabled={isBusy}
                    className={`w-full px-3.5 py-2.5 rounded-xl border text-sm text-stone-900 dark:text-stone-100 bg-stone-50/40 dark:bg-stone-800 transition-all placeholder:text-stone-400 placeholder:opacity-60 focus:outline-none focus:ring-2 pr-10 ${
                      touched.confirmPassword && !isPasswordsMatch
                        ? 'border-rose-300 focus:ring-rose-500/20 focus:border-rose-500'
                        : isPasswordsMatch
                        ? 'border-emerald-300 focus:ring-emerald-500/20 focus:border-emerald-500'
                        : 'border-stone-200 dark:border-stone-750 focus:ring-amber-500/30 focus:border-amber-500'
                    }`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    tabIndex={-1}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600 dark:hover:text-stone-300 p-1 cursor-pointer"
                    title={showConfirmPassword ? 'Hide password' : 'Show password'}
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                </div>

                {/* Password Match Status */}
                {confirmPassword.length > 0 && (
                  <p
                    id="confirm-password-status"
                    className={`text-[11px] mt-1 flex items-center gap-1.5 ${
                      isPasswordsMatch
                        ? 'text-emerald-600 dark:text-emerald-400'
                        : 'text-rose-600 dark:text-rose-400'
                    }`}
                  >
                    {isPasswordsMatch ? (
                      <>
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                        <span>Passwords match</span>
                      </>
                    ) : (
                      <>
                        <AlertCircle className="w-3.5 h-3.5 text-rose-600 dark:text-rose-400" />
                        <span>Passwords do not match</span>
                      </>
                    )}
                  </p>
                )}
              </div>

              {/* Submit Create Account */}
              <button
                id="btn-submit-signup"
                type="submit"
                disabled={isBusy || !isSignUpFormValid}
                className="w-full mt-2 inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-medium text-sm transition-all shadow-2xs cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed active:scale-98"
              >
                {isSubmitting ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Creating account...</span>
                  </>
                ) : (
                  <span>Create Account</span>
                )}
              </button>

              {/* Bottom Switch to Sign-In */}
              <div className="pt-3 border-t border-stone-100 dark:border-stone-800 text-center mt-4">
                <p className="text-xs text-stone-500 dark:text-stone-400">
                  Already have an account?{' '}
                  <button
                    id="btn-switch-to-signin-from-signup"
                    type="button"
                    onClick={() => handleSwitchFlow('signin')}
                    className="font-semibold text-amber-700 dark:text-amber-400 hover:text-amber-800 dark:hover:text-amber-300 cursor-pointer hover:underline"
                  >
                    Sign in
                  </button>
                </p>
              </div>
            </form>
          )}

          {/* ============================================================ */}
          {/* VIEW D: FORGOT PASSWORD FORM                                 */}
          {/* ============================================================ */}
          {authSubView === 'forgot_password' && (
            <form onSubmit={handlePasswordReset} className="space-y-4">
              <div>
                <label
                  htmlFor="input-reset-email"
                  className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1.5"
                >
                  Account email address
                </label>
                <input
                  id="input-reset-email"
                  type="email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (errorMessage) setErrorMessage(null);
                  }}
                  placeholder="sahil@example.com"
                  required
                  autoComplete="email"
                  disabled={isBusy}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 dark:border-stone-750 bg-stone-50/40 dark:bg-stone-800 text-sm text-stone-900 dark:text-stone-100 focus:outline-none focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500 transition-all placeholder:text-stone-400 placeholder:opacity-60"
                />
              </div>

              <button
                id="btn-submit-reset-password"
                type="submit"
                disabled={isBusy || !email}
                className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-medium text-sm transition-all shadow-2xs cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed active:scale-98"
              >
                {isSubmitting ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Sending reset link...</span>
                  </>
                ) : (
                  <span>Send Reset Link</span>
                )}
              </button>

              <div className="pt-3 text-center">
                <button
                  type="button"
                  onClick={() => handleSwitchSubView('email')}
                  className="text-xs text-amber-700 dark:text-amber-400 hover:text-amber-800 font-medium cursor-pointer"
                >
                  Remember your password? Sign In
                </button>
              </div>
            </form>
          )}

          {/* ============================================================ */}
          {/* VIEW E: PHONE NUMBER AUTHENTICATION (ALTERNATE METHOD)       */}
          {/* ============================================================ */}
          {authSubView === 'phone' && (
            <div className="space-y-4">
              {!confirmationResult ? (
                <form onSubmit={handleSendPhoneCode} className="space-y-4">
                  <div>
                    <label
                      htmlFor="input-phone-number-field"
                      className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1.5"
                    >
                      Phone Number
                    </label>
                    <div className="flex gap-2">
                      <select
                        id="select-phone-country-code"
                        value={phoneCountryCode}
                        onChange={(e) => setPhoneCountryCode(e.target.value)}
                        className="px-2.5 py-2.5 rounded-xl border border-stone-200 dark:border-stone-750 bg-stone-50/40 dark:bg-stone-800 text-sm text-stone-900 dark:text-stone-100 focus:outline-none focus:ring-2 focus:ring-amber-500/30 cursor-pointer"
                      >
                        <option value="+1">🇺🇸 +1 (US/CA)</option>
                        <option value="+91">🇮🇳 +91 (IN)</option>
                        <option value="+44">🇬🇧 +44 (UK)</option>
                        <option value="+61">🇦🇺 +61 (AU)</option>
                        <option value="+49">🇩🇪 +49 (DE)</option>
                        <option value="+33">🇫🇷 +33 (FR)</option>
                        <option value="+81">🇯🇵 +81 (JP)</option>
                        <option value="+65">🇸🇬 +65 (SG)</option>
                      </select>
                      <input
                        id="input-phone-number-field"
                        type="tel"
                        value={phoneNumberInput}
                        onChange={(e) => {
                          setPhoneNumberInput(e.target.value);
                          if (errorMessage) setErrorMessage(null);
                        }}
                        placeholder="97000 00000"
                        required
                        disabled={isBusy}
                        className="flex-1 px-3.5 py-2.5 rounded-xl border border-stone-200 dark:border-stone-750 bg-stone-50/40 dark:bg-stone-800 text-sm text-stone-900 dark:text-stone-100 focus:outline-none focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500 placeholder:text-stone-400 placeholder:opacity-60"
                      />
                    </div>
                    <p className="text-[11px] text-stone-400 dark:text-stone-500 mt-1">
                      Standard SMS carrier rates may apply.
                    </p>
                  </div>

                  <button
                    id="btn-send-phone-code"
                    type="submit"
                    disabled={isBusy || !phoneNumberInput.trim()}
                    className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-medium text-sm transition-all shadow-2xs cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed active:scale-98"
                  >
                    {isSendingCode ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin" />
                        <span>Sending code...</span>
                      </>
                    ) : (
                      <span>Send Verification Code</span>
                    )}
                  </button>
                </form>
              ) : (
                <form onSubmit={handleVerifyPhoneCode} className="space-y-4">
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label
                        htmlFor="input-phone-verification-code"
                        className="block text-xs font-semibold text-stone-700 dark:text-stone-300"
                      >
                        6-digit Verification Code
                      </label>
                      <button
                        type="button"
                        onClick={handleResetPhoneFlow}
                        className="text-[11px] text-amber-700 dark:text-amber-400 hover:underline cursor-pointer"
                      >
                        Change number
                      </button>
                    </div>
                    <input
                      id="input-phone-verification-code"
                      type="text"
                      maxLength={6}
                      value={verificationCode}
                      onChange={(e) => {
                        setVerificationCode(e.target.value.replace(/\D/g, ''));
                        if (errorMessage) setErrorMessage(null);
                      }}
                      placeholder="123456"
                      required
                      autoFocus
                      disabled={isBusy}
                      className="w-full tracking-widest text-center text-lg font-mono px-3.5 py-2.5 rounded-xl border border-stone-200 dark:border-stone-750 bg-stone-50/40 dark:bg-stone-800 text-stone-900 dark:text-stone-100 focus:outline-none focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500"
                    />
                  </div>

                  <button
                    id="btn-verify-phone-code"
                    type="submit"
                    disabled={isBusy || verificationCode.trim().length < 6}
                    className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-medium text-sm transition-all shadow-2xs cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed active:scale-98"
                  >
                    {isVerifyingCode ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin" />
                        <span>Verifying...</span>
                      </>
                    ) : (
                      <span>Verify & Continue</span>
                    )}
                  </button>
                </form>
              )}

              {/* Bottom Switch between flows */}
              <div className="pt-3 border-t border-stone-100 dark:border-stone-800 text-center mt-4">
                <p className="text-xs text-stone-500 dark:text-stone-400">
                  Don't have an account?{' '}
                  <button
                    type="button"
                    onClick={() => handleSwitchFlow('signup')}
                    className="font-semibold text-amber-700 dark:text-amber-400 hover:underline cursor-pointer"
                  >
                    Create account
                  </button>
                </p>
              </div>
            </div>
          )}

          {/* Privacy & Encryption Security Footnote */}
          <div className="mt-6 pt-4 border-t border-stone-100 dark:border-stone-800 flex items-center justify-center gap-1.5 text-[11px] text-stone-400 dark:text-stone-500">
            <Lock className="w-3 h-3 text-stone-400 shrink-0" />
            <span>Private journal • Isolated data</span>
          </div>
        </div>
      </div>
    </div>
  );
};
