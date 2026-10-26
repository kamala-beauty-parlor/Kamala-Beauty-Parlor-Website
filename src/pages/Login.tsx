import React, { useState } from 'react';
import { 
  Lock, 
  Mail, 
  User as UserIcon, 
  Phone, 
  Eye, 
  EyeOff, 
  ShieldCheck, 
  ArrowRight, 
  AlertCircle, 
  CheckCircle2,
  LogOut,
  KeyRound 
} from 'lucide-react';
import { sendPasswordResetEmail } from 'firebase/auth';
import { useAuth } from '../context/AuthContext';
import { auth, ADMIN_EMAIL } from '../lib/firebase';

interface LoginProps {
  setCurrentTab: (tab: string) => void;
  returnToTab?: string;
}

export const Login: React.FC<LoginProps> = ({ setCurrentTab, returnToTab = 'my-bookings' }) => {
  const { loginWithEmail, registerWithEmail, loginWithGoogle, currentUser, isAdmin, logout } = useAuth();

  const [isRegister, setIsRegister] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [isDomainAuthError, setIsDomainAuthError] = useState(false);
  const [resetSuccess, setResetSuccess] = useState(false);
  const [showForgotModal, setShowForgotModal] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const [resetModalError, setResetModalError] = useState('');
  const [resetLoading, setResetLoading] = useState(false);

  const handleAuthRedirect = (userEmail: string | null) => {
    if (userEmail && userEmail.toLowerCase() === ADMIN_EMAIL.toLowerCase()) {
      setCurrentTab('admin');
    } else {
      setCurrentTab(returnToTab || 'my-bookings');
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setIsDomainAuthError(false);
    setIsLoading(true);

    try {
      if (isRegister) {
        if (password.length < 6) {
          setErrorMessage('Password must be at least 6 characters long.');
          setIsLoading(false);
          return;
        }
        if (password !== confirmPassword) {
          setErrorMessage('Passwords do not match. Please re-enter your password.');
          setIsLoading(false);
          return;
        }

        const user = await registerWithEmail(email, password, fullName);
        handleAuthRedirect(user.email);
      } else {
        const user = await loginWithEmail(email, password);
        handleAuthRedirect(user.email);
      }
    } catch (err: any) {
      if (err.code === 'auth/operation-not-allowed') {
        setErrorMessage("Please check your email and password, or use Google Sign In above.");
      } else if (!isRegister) {
        setErrorMessage(err.message || "Unable to sign in. Please verify your email and password.");
      } else {
        if (err.code === 'auth/email-already-in-use') {
          setErrorMessage("An account with this email already exists. Please switch to Sign In.");
        } else if (err.code === 'auth/weak-password') {
          setErrorMessage("Password is too weak. Please use at least 6 characters.");
        } else {
          setErrorMessage(err.message || "Registration error. Please check your details.");
        }
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setErrorMessage('');
    setIsDomainAuthError(false);
    setIsLoading(true);
    try {
      const user = await loginWithGoogle();
      handleAuthRedirect(user.email);
    } catch (err: any) {
      console.warn('Google sign in warning:', err);
      if (err.code === 'auth/unauthorized-domain') {
        setIsDomainAuthError(true);
      } else if (err.code === 'auth/popup-closed-by-user') {
        setErrorMessage('Google sign in popup was closed. Please try again.');
      } else {
        setErrorMessage(err.message || 'Google sign in was cancelled or failed. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    const targetEmail = (resetEmail || email).trim();
    if (!targetEmail) {
      setResetModalError('Please enter your email address to receive the password reset link.');
      return;
    }

    setResetModalError('');
    setResetLoading(true);

    try {
      await sendPasswordResetEmail(auth, targetEmail);
      setResetSuccess(true);
      setTimeout(() => {
        setShowForgotModal(false);
      }, 3500);
    } catch (err: any) {
      console.error('Password reset error:', err);
      if (err.code === 'auth/user-not-found') {
        setResetModalError('No account found with this email address.');
      } else if (err.code === 'auth/invalid-email') {
        setResetModalError('Please enter a valid email address.');
      } else if (err.code === 'auth/too-many-requests') {
        setResetModalError('Too many attempts. Please wait a few moments and try again.');
      } else {
        setResetModalError(err.message || 'Unable to send password reset email. Please try again.');
      }
    } finally {
      setResetLoading(false);
    }
  };

  if (currentUser) {
    return (
      <div className="max-w-md mx-auto my-16 px-4 bg-white">
        <div className="bg-white rounded-3xl p-8 border border-pink-200 shadow-xl text-center space-y-4">
          <div className="w-14 h-14 rounded-full bg-pink-50 text-pink-600 flex items-center justify-center mx-auto border border-pink-200">
            <CheckCircle2 className="w-8 h-8 text-pink-600" />
          </div>
          <h2 className="font-serif text-2xl font-bold text-pink-950">
            Welcome back!
          </h2>
          <p className="text-sm text-stone-600">
            You are signed in as <strong>{currentUser.email}</strong>.
          </p>

          <div className="pt-4 flex flex-col gap-2.5">
            {isAdmin ? (
              <button
                onClick={() => setCurrentTab('admin')}
                className="w-full bg-pink-600 hover:bg-pink-700 text-white py-3 rounded-xl font-bold text-sm shadow transition"
              >
                Go to Admin Dashboard
              </button>
            ) : (
              <button
                onClick={() => setCurrentTab('my-bookings')}
                className="w-full bg-pink-600 hover:bg-pink-700 text-white py-3 rounded-xl font-bold text-sm shadow transition"
              >
                Go to Dashboard (My Bookings)
              </button>
            )}

            {/* Logout button returning to auth screen */}
            <button
              onClick={async () => {
                await logout();
              }}
              className="w-full border-2 border-pink-300 text-pink-700 hover:bg-pink-50 py-2.5 rounded-xl text-sm font-bold transition flex items-center justify-center gap-2"
            >
              <LogOut className="w-4 h-4" />
              <span>Log Out</span>
            </button>

            <button
              onClick={() => setCurrentTab('booking')}
              className="w-full bg-pink-50/60 hover:bg-pink-100 text-stone-700 py-2.5 rounded-xl text-sm font-semibold transition border border-pink-100"
            >
              Book an Appointment
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto px-4 py-12 sm:py-20 bg-white">
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-pink-200 shadow-xl space-y-6">
        
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="w-14 h-14 rounded-full bg-gradient-to-tr from-pink-400 to-rose-500 p-0.5 mx-auto mb-2 shadow-md">
            <img
              src="/assets/aistudio/Kamala_Beauty_Parlor_Gold_Emblem_f4a21eee.png"
              alt="Kamala Beauty Parlor"
              className="w-full h-full object-cover rounded-full bg-white"
            />
          </div>

          <h1 className="font-serif text-2xl sm:text-3xl font-bold text-pink-950">
            {isRegister ? 'Create an Account' : 'Welcome to Kamala Beauty Parlor Login Page'}
          </h1>
          <p className="text-xs sm:text-sm text-stone-500">
            {isRegister
              ? 'Join to book appointments & view your service history'
              : 'Sign in to access your appointments or admin suite'}
          </p>
        </div>

        {/* Google One-Click Sign In Button */}
        <button
          type="button"
          onClick={handleGoogleSignIn}
          disabled={isLoading}
          className="w-full bg-white hover:bg-pink-50/60 text-stone-800 border-2 border-pink-200 py-3 rounded-2xl text-xs sm:text-sm font-bold flex items-center justify-center gap-3 shadow-xs hover:border-pink-400 transition active:scale-98 cursor-pointer disabled:opacity-50"
        >
          <svg className="w-5 h-5 flex-shrink-0" viewBox="0 0 24 24">
            <path
              fill="#4285F4"
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            />
            <path
              fill="#34A853"
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            />
            <path
              fill="#FBBC05"
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
            />
            <path
              fill="#EA4335"
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
            />
          </svg>
          <span>Sign In with Google</span>
        </button>

        <div className="relative my-1">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-pink-100" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-white px-3 text-stone-400 font-medium">or continue with email</span>
          </div>
        </div>

        {/* Tab switch in Pink & White */}
        <div className="grid grid-cols-2 p-1 bg-pink-50 rounded-xl text-xs font-bold border border-pink-200">
          <button
            type="button"
            onClick={() => {
              setIsRegister(false);
              setErrorMessage('');
              setConfirmPassword('');
            }}
            className={`py-2 rounded-lg transition-all ${
              !isRegister ? 'bg-white text-pink-700 shadow-xs' : 'text-stone-500'
            }`}
          >
            Sign In
          </button>
          <button
            type="button"
            onClick={() => {
              setIsRegister(true);
              setErrorMessage('');
              setConfirmPassword('');
            }}
            className={`py-2 rounded-lg transition-all ${
              isRegister ? 'bg-white text-pink-700 shadow-xs' : 'text-stone-500'
            }`}
          >
            New Account
          </button>
        </div>

        {resetSuccess && (
          <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-start gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-bold">Password Reset Email Sent!</p>
              <p className="text-[11px] text-emerald-700 mt-0.5">Please check your inbox ({resetEmail || email}) for a link to reset your password.</p>
            </div>
          </div>
        )}

        {isDomainAuthError && (
          <div className="p-4 rounded-2xl bg-amber-50 border border-amber-300 text-amber-950 text-xs space-y-2.5 animate-in fade-in">
            <div className="flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-bold text-amber-900">Google Domain Authorization Pending</p>
                <p className="text-[11px] text-amber-800 mt-0.5 leading-relaxed">
                  Firebase Authentication requires <strong>{typeof window !== 'undefined' ? window.location.hostname : 'this domain'}</strong> to be added in <em>Firebase Console &gt; Authentication &gt; Settings &gt; Authorized domains</em> for Google popups.
                </p>
              </div>
            </div>
            <p className="text-[11px] text-amber-900 font-semibold pt-1 border-t border-amber-200">
              Please sign in using your email and password below.
            </p>
          </div>
        )}

        {errorMessage && (
          <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-start gap-2">
            <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0 mt-0.5" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4 text-sm">
          {isRegister && (
            <>
              <div>
                <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1">
                  Full Name *
                </label>
                <div className="relative">
                  <UserIcon className="w-4 h-4 text-pink-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="e.g. Binita Shrestha"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-pink-200 focus:outline-none focus:border-pink-500 focus:ring-1 focus:ring-pink-500 bg-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1">
                  Phone Number (Nepal) *
                </label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-pink-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="tel"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="e.g. 9841234567"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-pink-200 focus:outline-none focus:border-pink-500 focus:ring-1 focus:ring-pink-500 bg-white"
                  />
                </div>
              </div>
            </>
          )}

          <div>
            <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1">
              Email Address *
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-pink-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your.email@example.com"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-pink-200 focus:outline-none focus:border-pink-500 focus:ring-1 focus:ring-pink-500 bg-white"
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider">
                Password *
              </label>
              {!isRegister && (
                <button
                  type="button"
                  onClick={() => {
                    setResetEmail(email ? email.trim() : '');
                    setResetModalError('');
                    setShowForgotModal(true);
                  }}
                  className="text-xs text-pink-600 hover:text-pink-700 hover:underline font-medium transition cursor-pointer"
                >
                  Forgot Password?
                </button>
              )}
            </div>
            <div className="relative">
              <Lock className="w-4 h-4 text-pink-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-10 pr-10 py-2.5 rounded-xl border border-pink-200 focus:outline-none focus:border-pink-500 focus:ring-1 focus:ring-pink-500 bg-white"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Confirm Password field when registering an account */}
          {isRegister && (
            <div>
              <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1">
                Confirm Password *
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-pink-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                  className={`w-full pl-10 pr-10 py-2.5 rounded-xl border ${
                    confirmPassword && confirmPassword !== password
                      ? 'border-rose-400 focus:border-rose-500 focus:ring-rose-300'
                      : 'border-pink-200 focus:border-pink-500 focus:ring-pink-500'
                  } text-sm focus:outline-none focus:ring-1 bg-white`}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600"
                >
                  {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>

              {confirmPassword && confirmPassword !== password && (
                <p className="text-[11px] text-rose-500 mt-1 flex items-center gap-1 font-medium">
                  <AlertCircle className="w-3.5 h-3.5" />
                  Passwords do not match
                </p>
              )}
              {confirmPassword && confirmPassword === password && (
                <p className="text-[11px] text-emerald-600 mt-1 flex items-center gap-1 font-medium">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                  Passwords match
                </p>
              )}
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 text-white py-3 rounded-xl font-bold text-sm shadow-md transition disabled:opacity-50 flex items-center justify-center gap-2 active:scale-95"
          >
            <span>{isLoading ? 'Processing...' : isRegister ? 'Create Account' : 'Sign In'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>
      </div>

      {/* Forgot Password Modal */}
      {showForgotModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-sm w-full space-y-4 border border-pink-200 shadow-2xl relative">
            <div className="w-12 h-12 rounded-full bg-pink-50 text-pink-600 flex items-center justify-center mx-auto border border-pink-200">
              <KeyRound className="w-6 h-6 text-pink-600" />
            </div>

            <div className="text-center space-y-1">
              <h3 className="font-serif text-xl font-bold text-pink-950">
                Reset Your Password
              </h3>
              <p className="text-xs text-stone-500">
                Enter your account email. Firebase Auth will send a secure password reset link directly to your inbox.
              </p>
            </div>

            {resetSuccess && (
              <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-xl flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                <span>Password reset link sent! Check your email.</span>
              </div>
            )}

            {resetModalError && (
              <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 text-xs rounded-xl flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0 mt-0.5" />
                <span>{resetModalError}</span>
              </div>
            )}

            <form onSubmit={handleResetPassword} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1">
                  Email Address *
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-pink-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    required
                    value={resetEmail}
                    onChange={(e) => {
                      setResetEmail(e.target.value);
                      if (resetModalError) setResetModalError('');
                    }}
                    placeholder="name@example.com"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-pink-200 text-sm focus:outline-none focus:border-pink-500 focus:ring-1 focus:ring-pink-500 bg-white"
                  />
                </div>
              </div>

              <div className="flex items-center gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setShowForgotModal(false);
                    setResetModalError('');
                  }}
                  className="flex-1 py-2.5 text-xs font-semibold text-stone-600 hover:bg-stone-100 rounded-xl transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={resetLoading}
                  className="flex-1 py-2.5 text-xs font-bold bg-pink-600 text-white rounded-xl hover:bg-pink-700 shadow-xs transition disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer"
                >
                  {resetLoading ? (
                    <span>Sending...</span>
                  ) : (
                    <span>Send Reset Email</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
