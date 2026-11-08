import React, { useState } from 'react';
import { User as PawUser, UserRole } from '../types.ts';
import { FirebaseError } from '@firebase/app';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
  updateProfile,
  type User as FirebaseUser,
} from '@firebase/auth';
import { ShieldCheck, Heart, Mail, LogIn, UserPlus, Sparkles, AlertCircle, ChevronRight } from 'lucide-react';
import heroDog from '../assets/images/paw_dog_golden_mix_1794111872445.jpg';
import { BrandLogo } from './BrandLogo.tsx';
import { firebaseAuth, googleAuthProvider, resolveFirebaseUser } from '../firebase.ts';

interface AuthScreenProps {
  onLoginSuccess: (user: PawUser) => void;
}

export const AuthScreen: React.FC<AuthScreenProps> = ({ onLoginSuccess }) => {
  const [mode, setMode] = useState<'login' | 'register'>('login');

  // Form states
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (!email || !password) {
      setErrorMessage('Please fill in both email and password.');
      return;
    }

    if (mode === 'register' && !name) {
      setErrorMessage('Please enter your full name.');
      return;
    }

    if (!firebaseAuth) {
      setErrorMessage('Email sign-in is not configured. Check the Firebase web app settings in Vercel.');
      return;
    }

    setIsSubmitting(true);
    try {
      const credential = mode === 'register'
        ? await createUserWithEmailAndPassword(firebaseAuth, email.trim(), password)
        : await signInWithEmailAndPassword(firebaseAuth, email.trim(), password);

      if (mode === 'register') {
        await updateProfile(credential.user, { displayName: name.trim() });
      }

      onLoginSuccess(await resolveFirebaseUser(credential.user, true));
    } catch (error) {
      const needsVerification = error instanceof Error &&
        error.message.includes('This allowlisted email is unverified.');

      if (needsVerification) {
        setErrorMessage('This account needs a verified allowlisted email, or its Firebase UID must be added to ADMIN_UIDS in Vercel.');
      } else if (error instanceof FirebaseError) {
        const messages: Record<string, string> = {
          'auth/invalid-credential': 'Email or password is incorrect.',
          'auth/user-not-found': 'No account exists for this email.',
          'auth/wrong-password': 'Email or password is incorrect.',
          'auth/email-already-in-use': 'This email already has an account. Sign in instead.',
          'auth/weak-password': 'Choose a password with at least 6 characters.',
          'auth/invalid-email': 'Enter a valid email address.',
          'auth/operation-not-allowed': 'Enable Email/Password in Firebase Authentication sign-in providers.',
          'auth/user-disabled': 'This account has been disabled. Contact your organization administrator.',
          'auth/too-many-requests': 'Too many attempts. Wait a moment and try again.',
          'auth/network-request-failed': 'Network error. Check your connection and try again.',
        };
        setErrorMessage(messages[error.code] || 'Authentication failed. Please try again.');
      } else {
        setErrorMessage(error instanceof Error ? error.message : 'Authentication failed. Please try again.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setErrorMessage('');
    if (!firebaseAuth) {
      setErrorMessage('Google sign-in is not configured. Add the Firebase web app settings to your environment.');
      return;
    }

    setIsSubmitting(true);
    try {
      const credential = await signInWithPopup(firebaseAuth, googleAuthProvider);
      onLoginSuccess(await resolveFirebaseUser(credential.user, true));
    } catch (error) {
      if (error instanceof FirebaseError) {
        const messages: Record<string, string> = {
          'auth/popup-closed-by-user': 'Sign-in was cancelled before it finished.',
          'auth/popup-blocked': 'Your browser blocked the sign-in popup. Allow popups and try again.',
          'auth/unauthorized-domain': 'Add this site to Firebase Authentication authorized domains.',
          'auth/operation-not-allowed': 'Enable Google as a sign-in provider in Firebase Authentication.',
          'auth/network-request-failed': 'Network error. Check your connection and try again.',
        };
        setErrorMessage(messages[error.code] || 'Google sign-in failed. Please try again.');
      } else if (error instanceof Error && error.message.includes('This allowlisted email is unverified.')) {
        setErrorMessage('This account needs a verified allowlisted email, or its Firebase UID must be added to ADMIN_UIDS in Vercel.');
      } else {
        setErrorMessage('Google sign-in failed. Please try again.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleQuickDemoLogin = (targetRole: Exclude<UserRole, 'admin'>) => {
    if (!import.meta.env.DEV) return;
    if (targetRole === 'staff') {
      onLoginSuccess({
        id: 'staff-1',
        name: 'Sarah Martinez',
        email: 'sarah.martinez@example.com',
        role: 'staff',
        organization: 'Hope Sanctuary Animal Welfare',
        avatarUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
      });
    } else {
      onLoginSuccess({
        id: 'adopter-1',
        name: 'Demo Adopter',
        email: 'adopter@example.com',
        role: 'adopter',
        avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
      });
    }
  };

  return (
    <div className="auth-screen min-h-screen text-slate-100 flex flex-col justify-center items-center p-4 md:p-8 relative overflow-hidden">

      {/* Main Container */}
      <div className="auth-card w-full max-w-5xl bg-slate-800/90 border border-slate-600/60 rounded-2xl overflow-hidden grid grid-cols-1 lg:grid-cols-12">
        
        {/* Left Presentation Showcase Column */}
        <div className="auth-showcase relative overflow-hidden lg:col-span-5 bg-slate-900 p-8 flex flex-col justify-between border-b lg:border-b-0 lg:border-r border-slate-700/50">
          <img src={heroDog} alt="A rescued dog ready for a new home" className="absolute inset-0 z-0 h-full w-full object-cover opacity-45" />
          <div className="relative z-10">
            {/* PAW Brand Mark */}
            <div className="mb-6">
              <BrandLogo size="large" />
            </div>

            {/* Core Motto from Page 1 */}
            <div className="mb-6">
              <p className="text-base font-semibold text-slate-200">
                Rescue. Care. Home.
              </p>
              <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                One workspace for animal care and adoption.
              </p>
            </div>

            {/* 3 Pillars of Scope (From Page 3) */}
            <div className="space-y-3 pt-4 border-t border-slate-800">
              <div className="flex items-start gap-3 p-2.5 rounded-lg bg-slate-800/40 border border-slate-700/40">
                <div className="p-1.5 rounded-md bg-teal-500/20 text-teal-300 shrink-0 mt-0.5">
                  <ShieldCheck className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-semibold text-slate-200">Animal Records</h4>
                  <p className="text-[11px] text-slate-400">Intake, health, and care history.</p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-2.5 rounded-lg bg-slate-800/40 border border-slate-700/40">
                <div className="p-1.5 rounded-md bg-rose-500/20 text-rose-300 shrink-0 mt-0.5">
                  <Heart className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-semibold text-slate-200">Adoption Process</h4>
                  <p className="text-[11px] text-slate-400">Listings, applications, and review.</p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-2.5 rounded-lg bg-slate-800/40 border border-slate-700/40">
                <div className="p-1.5 rounded-md bg-amber-500/20 text-amber-300 shrink-0 mt-0.5">
                  <Sparkles className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-semibold text-slate-200">Management & Tracking</h4>
                  <p className="text-[11px] text-slate-400">Placement tracking and follow-ups.</p>
                </div>
              </div>
            </div>
          </div>

          {/* Limitation Callout from Page 5 */}
          <div className="relative z-10 mt-8 pt-4 border-t border-slate-700/80">
            <div className="flex items-center gap-2 text-[11px] text-amber-300/90 font-medium">
              <AlertCircle className="w-3.5 h-3.5 shrink-0" />
              <span>Care standard</span>
            </div>
            <p className="text-[11px] text-slate-400 mt-1 italic leading-snug">
              Veterinary decisions stay with your care team.
            </p>
          </div>
        </div>

        {/* Right Authentication Form Column */}
        <div className="auth-form lg:col-span-7 p-6 sm:p-10 flex flex-col justify-center bg-slate-850">
          
          {/* Header & Tabs */}
          <div className="flex items-center justify-between pb-4 border-b border-slate-700/60">
            <div>
              <h2 className="text-2xl font-bold tracking-tight text-white">
                {mode === 'login' ? 'Sign In to PAW' : 'Create an Adopter Account'}
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                {mode === 'login' ? 'Sign in with Google or email.' : 'Register as an adopter with Google or email.'}
              </p>
            </div>

            {/* Mode Switcher */}
            <div className="flex p-1 bg-slate-800 border border-slate-700 rounded-lg">
              <button
                type="button"
                onClick={() => { setMode('login'); setErrorMessage(''); }}
                className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-all ${
                  mode === 'login' ? 'bg-teal-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'
                }`}
              >
                Sign In
              </button>
              <button
                type="button"
                onClick={() => { setMode('register'); setErrorMessage(''); }}
                className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-all ${
                  mode === 'register' ? 'bg-teal-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'
                }`}
              >
                Register
              </button>
            </div>
          </div>

          {/* Firebase Google sign-in */}
          <div className="mt-6">
            <button
              type="button"
              onClick={handleGoogleSignIn}
              disabled={isSubmitting}
              className="w-full flex items-center justify-center gap-3 py-2.5 px-4 bg-white hover:bg-slate-100 text-slate-800 font-semibold rounded-xl text-sm border border-slate-300 shadow-sm transition-all focus:outline-none focus:ring-2 focus:ring-teal-500 disabled:cursor-wait disabled:opacity-70"
            >
              {isSubmitting ? (
                <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-slate-500 border-t-transparent" />
              ) : (
                <Mail className="h-4 w-4 shrink-0" />
              )}
              <span>Connect to Gmail</span>
            </button>
          </div>

          {/* Error Message */}
          {errorMessage && (
            <div className="mb-4 p-3 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Form */}
          <form key={mode} onSubmit={handleFormSubmit} className="space-y-4">
            
            {/* Adopter registration details */}
            {mode === 'register' && (
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Full Name
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Your name"
                  className="w-full px-3.5 py-2 text-sm bg-slate-900 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500"
                />
              </div>
            )}

            {/* Email Address */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Email Address
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full px-3.5 py-2 text-sm bg-slate-900 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500"
              />
            </div>

            {/* Password */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-semibold text-slate-300">
                  Password
                </label>
              </div>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                className="w-full px-3.5 py-2 text-sm bg-slate-900 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500"
              />
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full mt-2 py-2.5 px-4 bg-teal-600 hover:bg-teal-500 active:bg-teal-700 text-white font-semibold rounded-xl text-sm transition-all shadow-md shadow-teal-900/40 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-70"
            >
              {isSubmitting ? (
                <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : mode === 'login' ? (
                <>
                  <LogIn className="w-4 h-4" />
                  <span>Enter PAW System</span>
                </>
              ) : (
                <>
                  <UserPlus className="w-4 h-4" />
                  <span>Complete Registration</span>
                </>
              )}
            </button>
          </form>

          {/* Quick Demo Access Bar */}
          {import.meta.env.DEV && (
          <div className="mt-6 pt-5 border-t border-slate-800">
              <p className="text-[11px] font-semibold text-slate-400 mb-2 uppercase tracking-wider">
              Demo accounts
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => handleQuickDemoLogin('staff')}
                className="px-3 py-2 bg-slate-800 hover:bg-slate-700/80 border border-slate-700 text-slate-200 rounded-lg text-xs font-medium transition-all text-left flex items-center justify-between"
              >
                <div>
                  <p className="font-semibold text-teal-400">Shelter Staff</p>
                  <p className="text-[10px] text-slate-400">Sarah Martinez (Staff)</p>
                </div>
                <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
              </button>

              <button
                type="button"
                onClick={() => handleQuickDemoLogin('adopter')}
                className="px-3 py-2 bg-slate-800 hover:bg-slate-700/80 border border-slate-700 text-slate-200 rounded-lg text-xs font-medium transition-all text-left flex items-center justify-between"
              >
                <div>
                  <p className="font-semibold text-rose-400">Adopter Portal</p>
                  <p className="text-[10px] text-slate-400">Demo Adopter</p>
                </div>
                <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
              </button>

            </div>
          </div>
          )}
        </div>
      </div>

    </div>
  );
};
