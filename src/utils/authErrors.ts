/**
 * Formats Firebase Authentication error codes into clear, user-friendly messages.
 */
export function getAuthErrorMessage(error: any): string {
  if (!error) return 'An unknown authentication error occurred. Please try again.';

  const code = error?.code || '';
  const message = error?.message || (typeof error === 'string' ? error : '');
  const lowerMsg = message.toLowerCase();

  // 1. Weak password or password policy failure
  if (
    code === 'auth/weak-password' ||
    code === 'auth/password-does-not-meet-requirements' ||
    lowerMsg.includes('password does not meet') ||
    lowerMsg.includes('weak-password') ||
    lowerMsg.includes('password policy') ||
    lowerMsg.includes('password should contain') ||
    lowerMsg.includes('password must contain')
  ) {
    return "Your password doesn't meet the requirements below.";
  }

  // 2. Email already in use
  if (code === 'auth/email-already-in-use' || lowerMsg.includes('email-already-in-use')) {
    return 'An account with this email already exists. Try signing in instead.';
  }

  // 3. Invalid email address format
  if (code === 'auth/invalid-email' || lowerMsg.includes('invalid-email')) {
    return 'Enter a valid email address.';
  }

  // 4. Incorrect sign-in credentials (security-conscious: does not reveal whether email or password was wrong)
  if (
    code === 'auth/wrong-password' ||
    code === 'auth/user-not-found' ||
    code === 'auth/invalid-credential' ||
    code === 'auth/invalid-login-credentials' ||
    lowerMsg.includes('invalid-credential') ||
    lowerMsg.includes('user-not-found') ||
    lowerMsg.includes('wrong-password')
  ) {
    return 'Incorrect email or password. Please try again.';
  }

  // 5. Rate limiting / Too many requests
  if (code === 'auth/too-many-requests' || lowerMsg.includes('too-many-requests')) {
    return 'Too many failed attempts. For your security, please wait a few minutes before trying again.';
  }

  // 6. Network connectivity errors
  if (
    code === 'auth/network-request-failed' ||
    lowerMsg.includes('network-request-failed') ||
    lowerMsg.includes('network error')
  ) {
    return 'Unable to connect. Check your internet connection and try again.';
  }

  switch (code) {
    case 'auth/user-disabled':
      return 'This account has been disabled. Please contact support for assistance.';
    case 'auth/missing-email':
      return 'Please enter your email address.';
    case 'auth/missing-password':
      return 'Please enter your password.';

    // Password Reset Errors
    case 'auth/expired-action-code':
      return 'The password reset link has expired. Please request a new link.';
    case 'auth/invalid-action-code':
      return 'The password reset link is invalid or has already been used.';

    // Google & Popup Sign-In Errors
    case 'auth/popup-closed-by-user':
    case 'auth/cancelled-popup-request':
      return 'Sign-in popup was closed before completing. Please try again.';
    case 'auth/popup-blocked':
      return 'The sign-in popup was blocked by your browser. Please allow popups for this site or open the app in a new window.';
    case 'auth/unauthorized-domain':
      return 'This domain is not authorized in Firebase Auth. Please verify Authorized Domains in the Firebase Console.';

    case 'auth/operation-not-allowed':
      return 'This authentication method is not enabled. Please check Firebase Console Sign-In Methods.';
    case 'auth/quota-exceeded':
      return 'Authentication quota exceeded. Please try again later.';

    // Account Management
    case 'auth/requires-recent-login':
      return 'For your security, this action requires a recent sign-in. Please sign in again and retry.';

    case 'auth/internal-error':
      return 'An internal authentication error occurred. Please try again in a moment.';

    default: {
      // Clean up "Firebase: Error (auth/...)" prefix if present
      const cleanMsg = message.replace(/^Firebase:\s*(Error\s*)?(\(auth\/[^)]+\)\.?\s*)?/i, '').trim();
      return cleanMsg || 'Authentication failed. Please verify your details and try again.';
    }
  }
}

