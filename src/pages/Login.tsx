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
  X,
  KeyRound 
} from 'lucide-react';
import { sendPasswordResetEmail } from 'firebase/auth';
import { useAuth } from '../context/AuthContext';
import { auth, ADMIN_EMAIL } from '../lib/firebase';
import { useLanguage } from '../context/LanguageContext';

interface LoginProps {
  setCurrentTab: (tab: string) => void;
  returnToTab?: string;
}

export const Login: React.FC<LoginProps> = ({ setCurrentTab, returnToTab = 'my-bookings' }) => {
  const { loginWithEmail, registerWithEmail, loginWithGoogle, currentUser, isAdmin } = useAuth();
  const { t } = useLanguage();

  const [activeTab, setActiveTab] = useState<'login' | 'register'>('login');
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

  // Forgot password state
  const [showForgotModal, setShowForgotModal] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const [resetModalError, setResetModalError] = useState('');
  const [resetSuccess, setResetSuccess] = useState(false);
  const [resetLoading, setResetLoading] = useState(false);

  const handleAuthRedirect = (userEmail: string | null) => {
    if (userEmail && userEmail.toLowerCase() === ADMIN_EMAIL.toLowerCase()) {
      setCurrentTab('admin');
    } else {
      // Check if user was in the middle of a booking draft
      const hasDraft = sessionStorage.getItem('kamala_booking_draft');
      if (hasDraft) {
        setCurrentTab('booking');
      } else {
        setCurrentTab(returnToTab || 'my-bookings');
      }
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setIsDomainAuthError(false);
    setIsLoading(true);

    try {
      if (activeTab === 'register') {
        if (!fullName.trim()) {
          setErrorMessage('Please enter your full name.');
          setIsLoading(false);
          return;
        }
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

        const user = await registerWithEmail(email.trim(), password, fullName.trim(), phone.trim());
        handleAuthRedirect(user.email);
      } else {
        const user = await loginWithEmail(email.trim(), password);
        handleAuthRedirect(user.email);
      }
    } catch (err: any) {
      if (err.code === 'auth/invalid-credential' || err.code === 'auth/wrong-password' || err.code === 'auth/user-not-found') {
        setErrorMessage("Invalid email or password. Please verify and try again.");
      } else if (err.code === 'auth/email-already-in-use') {
        setErrorMessage("An account with this email already exists. Please switch to Sign In.");
      } else if (err.code === 'auth/weak-password') {
        setErrorMessage("Password is too weak. Please use at least 6 characters.");
      } else if (err.code === 'auth/invalid-email') {
        setErrorMessage("Please enter a valid email address.");
      } else {
        setErrorMessage("Unable to sign in. Please check your credentials or reset your password.");
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
      console.warn('Google sign in notice:', err);
      if (err.code === 'auth/unauthorized-domain') {
        setIsDomainAuthError(true);
      } else if (err.code === 'auth/popup-closed-by-user') {
        setErrorMessage('Sign in window was closed. Please try again.');
      } else {
        setErrorMessage('Google sign in was cancelled. Please use email & password below.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    const targetEmail = (resetEmail || email).trim();
    if (!targetEmail) {
      setResetModalError('Please enter your email address.');
      return;
    }

    setResetModalError('');
    setResetLoading(true);

    try {
      await sendPasswordResetEmail(auth, targetEmail);
      setResetSuccess(true);
      setTimeout(() => {
        setShowForgotModal(false);
        setResetSuccess(false);
      }, 4000);
    } catch (err: any) {
      if (err.code === 'auth/user-not-found') {
        setResetModalError('No account found with this email address.');
      } else if (err.code === 'auth/invalid-email') {
        setResetModalError('Please enter a valid email address.');
      } else {
        setResetModalError('Unable to send reset email. Please verify the address.');
      }
    } finally {
      setResetLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto px-4 py-8 sm:py-16 space-y-6">
      
      {/* Brand Header */}
      <div className="text-center space-y-2">
        <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-pink-300 shadow-lg mx-auto bg-pink-50 p-1">
          <img
            src="/assets/aistudio/Kamala_Beauty_Parlor_Gold_Emblem_f4a21eee.png"
            alt="Kamala Logo"
            className="w-full h-full object-cover rounded-full"
            width={64}
            height={64}
          />
        </div>
        <h1 className="font-serif text-2xl sm:text-3xl font-bold text-pink-950">
          Kamala Beauty Parlor
        </h1>
        <p className="text-xs sm:text-sm text-stone-500">
          Sign in to manage appointments, track services & explore exclusive offers.
        </p>
      </div>

      {/* Main Card */}
      <div className="bg-white rounded-3xl p-5 sm:p-7 border-2 border-pink-200 shadow-xl space-y-5">
        
        {/* Two Segmented Tabs: Login & Sign Up */}
        <div className="grid grid-cols-2 p-1 bg-pink-50 rounded-2xl border border-pink-200">
          <button
            type="button"
            onClick={() => {
              setActiveTab('login');
              setErrorMessage('');
            }}
            className={`py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer min-h-[44px] ${
              activeTab === 'login'
                ? 'bg-white text-[#8A2E44] shadow-sm'
                : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            Sign In
          </button>
          <button
            type="button"
            onClick={() => {
              setActiveTab('register');
              setErrorMessage('');
            }}
            className={`py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer min-h-[44px] ${
              activeTab === 'register'
                ? 'bg-white text-[#8A2E44] shadow-sm'
                : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            Create Account
          </button>
        </div>

        {/* 1-Tap Google Sign In */}
        <button
          type="button"
          onClick={handleGoogleSignIn}
          disabled={isLoading}
          className="w-full py-3 px-4 border border-stone-300 hover:bg-stone-50 rounded-2xl text-xs sm:text-sm font-bold text-stone-800 flex items-center justify-center gap-3 transition cursor-pointer active:scale-98 min-h-[48px] shadow-xs disabled:opacity-50"
        >
          <svg className="w-4 h-4" viewBox="0 0 24 24">
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
          <span>Continue with Google</span>
        </button>

        <div className="flex items-center gap-3">
          <div className="flex-1 h-px bg-pink-100" />
          <span className="text-[11px] font-bold uppercase tracking-wider text-stone-400">or with email</span>
          <div className="flex-1 h-px bg-pink-100" />
        </div>

        {isDomainAuthError && (
          <div className="p-3.5 rounded-2xl bg-amber-50 border border-amber-300 text-amber-950 text-xs space-y-1">
            <p className="font-bold">Google Domain Authorization</p>
            <p className="text-[11px] text-amber-800">
              Please sign in directly using your email and password below.
            </p>
          </div>
        )}

        {errorMessage && (
          <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2 animate-in fade-in">
            <AlertCircle className="w-4 h-4 flex-shrink-0 text-rose-600" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Email & Password Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {activeTab === 'register' && (
            <>
              <div>
                <label className="text-xs font-bold text-stone-700 uppercase block mb-1">
                  Full Name *
                </label>
                <div className="relative">
                  <UserIcon className="w-4 h-4 text-pink-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    required
                    autoComplete="name"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="e.g. Pooja Shrestha"
                    className="w-full pl-10 pr-3 py-3 border border-pink-200 rounded-xl text-base sm:text-sm focus:outline-none focus:border-pink-500 bg-white min-h-[48px]"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-stone-700 uppercase block mb-1">
                  Phone Number (Nepal)
                </label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-pink-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="tel"
                    autoComplete="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="e.g. 9841234567"
                    className="w-full pl-10 pr-3 py-3 border border-pink-200 rounded-xl text-base sm:text-sm focus:outline-none focus:border-pink-500 bg-white min-h-[48px]"
                  />
                </div>
              </div>
            </>
          )}

          <div>
            <label className="text-xs font-bold text-stone-700 uppercase block mb-1">
              Email Address *
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-pink-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                required
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@gmail.com"
                className="w-full pl-10 pr-3 py-3 border border-pink-200 rounded-xl text-base sm:text-sm focus:outline-none focus:border-pink-500 bg-white min-h-[48px]"
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs font-bold text-stone-700 uppercase">
                Password *
              </label>
              {activeTab === 'login' && (
                <button
                  type="button"
                  onClick={() => {
                    setResetEmail(email);
                    setShowForgotModal(true);
                  }}
                  className="text-xs font-bold text-pink-600 hover:underline cursor-pointer"
                >
                  Forgot password?
                </button>
              )}
            </div>
            <div className="relative">
              <Lock className="w-4 h-4 text-pink-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type={showPassword ? 'text' : 'password'}
                required
                autoComplete={activeTab === 'register' ? 'new-password' : 'current-password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-10 pr-10 py-3 border border-pink-200 rounded-xl text-base sm:text-sm focus:outline-none focus:border-pink-500 bg-white min-h-[48px]"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-700 p-1 cursor-pointer"
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {activeTab === 'register' && (
            <div>
              <label className="text-xs font-bold text-stone-700 uppercase block mb-1">
                Confirm Password *
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-pink-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  required
                  autoComplete="new-password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-10 py-3 border border-pink-200 rounded-xl text-base sm:text-sm focus:outline-none focus:border-pink-500 bg-white min-h-[48px]"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-700 p-1 cursor-pointer"
                  aria-label={showConfirmPassword ? 'Hide confirm password' : 'Show confirm password'}
                >
                  {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3.5 bg-gradient-to-r from-pink-600 via-rose-600 to-[#8A2E44] hover:opacity-95 text-white font-bold rounded-2xl text-sm shadow-md transition active:scale-98 cursor-pointer flex items-center justify-center gap-2 min-h-[48px] disabled:opacity-50"
          >
            <span>{isLoading ? 'Processing...' : activeTab === 'login' ? 'Sign In' : 'Create Account'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>
      </div>

      {/* Forgot Password Modal */}
      {showForgotModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 sm:p-7 max-w-sm w-full space-y-4 border border-pink-200 shadow-2xl text-left animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between border-b pb-3">
              <div className="flex items-center gap-2">
                <KeyRound className="w-5 h-5 text-pink-600" />
                <h3 className="font-serif font-bold text-lg text-pink-950">Reset Password</h3>
              </div>
              <button
                type="button"
                onClick={() => setShowForgotModal(false)}
                className="text-stone-400 hover:text-stone-700 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {resetSuccess ? (
              <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-900 rounded-2xl text-xs space-y-1 text-center">
                <CheckCircle2 className="w-8 h-8 text-emerald-600 mx-auto" />
                <p className="font-bold">Password reset email sent!</p>
                <p className="text-stone-600">
                  Please check your inbox at <strong>{resetEmail}</strong> for the reset link.
                </p>
              </div>
            ) : (
              <form onSubmit={handleResetPassword} className="space-y-3">
                <p className="text-xs text-stone-600 leading-relaxed">
                  Enter your email address and we will send you a secure link to reset your account password.
                </p>

                {resetModalError && (
                  <p className="text-xs text-rose-600 font-semibold">{resetModalError}</p>
                )}

                <div>
                  <label className="text-[11px] font-bold text-stone-700 uppercase block mb-1">
                    Your Email
                  </label>
                  <input
                    type="email"
                    required
                    value={resetEmail}
                    onChange={(e) => setResetEmail(e.target.value)}
                    placeholder="name@gmail.com"
                    className="w-full p-2.5 border border-pink-200 rounded-xl text-base sm:text-sm focus:outline-none focus:border-pink-500 bg-white min-h-[44px]"
                  />
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowForgotModal(false)}
                    className="px-4 py-2 border rounded-xl text-xs font-bold text-stone-600 hover:bg-stone-50 cursor-pointer min-h-[44px]"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={resetLoading}
                    className="px-5 py-2 bg-[#8A2E44] text-white rounded-xl text-xs font-bold shadow transition cursor-pointer min-h-[44px] disabled:opacity-50"
                  >
                    {resetLoading ? 'Sending...' : 'Send Reset Link'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

    </div>
  );
};
