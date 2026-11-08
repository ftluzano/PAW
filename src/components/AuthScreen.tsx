import React, { useState } from 'react';
import { User, UserRole } from '../types.ts';
import { ShieldCheck, Heart, PawPrint, UserRound, LogIn, UserPlus, Sparkles, AlertCircle, CheckCircle2, ChevronRight, X } from 'lucide-react';
import heroDog from '../assets/images/paw_dog_golden_mix_1794111872445.jpg';

interface AuthScreenProps {
  onLoginSuccess: (user: User) => void;
}

export const AuthScreen: React.FC<AuthScreenProps> = ({ onLoginSuccess }) => {
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [role, setRole] = useState<Exclude<UserRole, 'admin'>>('staff');

  // Form states
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [organization, setOrganization] = useState('Hope Haven Animal Rescue');
  const [errorMessage, setErrorMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Google OAuth modal state
  const [showGoogleModal, setShowGoogleModal] = useState(false);
  const [googleSelectedEmail, setGoogleSelectedEmail] = useState('adopter@example.com');
  const [googleRole, setGoogleRole] = useState<Exclude<UserRole, 'admin'>>('adopter');

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (!import.meta.env.DEV) {
      setErrorMessage('Sign-in is unavailable until Firebase Authentication is configured.');
      return;
    }

    if (!email || !password) {
      setErrorMessage('Please fill in both email and password.');
      return;
    }

    if (mode === 'register' && !name) {
      setErrorMessage('Please enter your full name.');
      return;
    }

    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      const user: User = {
        id: `user-${Date.now()}`,
        name: mode === 'register' ? name : email.split('@')[0],
        email: email,
        role: role,
        organization: role === 'staff' ? organization : undefined,
        avatarUrl: role === 'staff' 
          ? 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80'
          : 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
      };
      onLoginSuccess(user);
    }, 400);
  };

  const handleDemoLogin = (selectedEmail: string, selectedRole: Exclude<UserRole, 'admin'>) => {
    if (!import.meta.env.DEV) return;
    setIsSubmitting(true);
    setShowGoogleModal(false);
    setTimeout(() => {
      setIsSubmitting(false);
      const user: User = {
        id: `google-${Date.now()}`,
        name: selectedRole === 'staff' ? 'Demo Shelter Staff' : 'Demo Adopter',
        email: selectedEmail,
        role: selectedRole,
        organization: selectedRole === 'staff' ? 'Hope Haven Animal Welfare' : undefined,
        avatarUrl: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
      };
      onLoginSuccess(user);
    }, 350);
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
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 rounded-xl bg-teal-500/20 border border-teal-500/30 flex items-center justify-center text-teal-400 shadow-inner">
                <PawPrint className="w-7 h-7" />
              </div>
              <div>
                <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
                  PAW
                  <span className="text-xs uppercase tracking-wider font-semibold text-teal-400 bg-teal-950/80 px-2 py-0.5 rounded border border-teal-800/60">
                    System
                  </span>
                </h1>
                <p className="text-xs text-slate-400 font-medium">PET ADOPTION AND CARE SYSTEM</p>
              </div>
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
                {mode === 'login' ? 'Sign In to PAW' : 'Create an Account'}
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Demo mode. Firebase Authentication is not connected yet.
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

          {/* Demo account picker */}
          <div className="mt-6">
            <button
              type="button"
              onClick={() => setShowGoogleModal(true)}
              className="w-full flex items-center justify-center gap-3 py-2.5 px-4 bg-white hover:bg-slate-100 text-slate-800 font-semibold rounded-xl text-sm border border-slate-300 shadow-sm transition-all focus:outline-none focus:ring-2 focus:ring-teal-500"
            >
              <UserRound className="h-4 w-4 shrink-0" />
              <span>Choose a demo account</span>
            </button>
          </div>

          {/* Divider */}
          <div className="relative my-5">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-700" />
            </div>
            <div className="relative flex justify-center text-xs">
              <span className="bg-slate-850 px-3 text-slate-400">or continue with email</span>
            </div>
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
            
            {/* Register specific: Full Name & Role Choice */}
            {mode === 'register' && (
              <>
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

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    Account Type (Select Role)
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => setRole('staff')}
                      className={`p-3 text-left rounded-lg border transition-all ${
                        role === 'staff'
                          ? 'border-teal-500 bg-teal-950/40 text-teal-300'
                          : 'border-slate-700 bg-slate-900 text-slate-400 hover:border-slate-600'
                      }`}
                    >
                      <p className="text-xs font-bold text-white flex items-center justify-between">
                        Shelter / Rescue Staff
                        {role === 'staff' && <CheckCircle2 className="w-3.5 h-3.5 text-teal-400" />}
                      </p>
                      <p className="text-[11px] text-slate-400 mt-1">Manage intake, care records & review adoption requests</p>
                    </button>

                    <button
                      type="button"
                      onClick={() => setRole('adopter')}
                      className={`p-3 text-left rounded-lg border transition-all ${
                        role === 'adopter'
                          ? 'border-teal-500 bg-teal-950/40 text-teal-300'
                          : 'border-slate-700 bg-slate-900 text-slate-400 hover:border-slate-600'
                      }`}
                    >
                      <p className="text-xs font-bold text-white flex items-center justify-between">
                        Potential Adopter
                        {role === 'adopter' && <CheckCircle2 className="w-3.5 h-3.5 text-teal-400" />}
                      </p>
                      <p className="text-[11px] text-slate-400 mt-1">Browse pets, apply for adoption & track follow-ups</p>
                    </button>
                  </div>
                </div>

                {role === 'staff' && (
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      Welfare Organization / Shelter Name
                    </label>
                    <input
                      type="text"
                      value={organization}
                      onChange={(e) => setOrganization(e.target.value)}
                      placeholder="e.g. Hope Sanctuary Animal Welfare"
                      className="w-full px-3.5 py-2 text-sm bg-slate-900 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-teal-500"
                    />
                  </div>
                )}
              </>
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

      {/* Demo account selection */}
      {showGoogleModal && import.meta.env.DEV && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="auth-modal bg-white text-slate-900 rounded-2xl w-full max-w-md p-6 shadow-2xl relative">
            <button
              onClick={() => setShowGoogleModal(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-700 p-1 rounded-lg"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-2 mb-4">
              <UserRound className="h-5 w-5 text-teal-700" />
              <h3 className="font-bold text-base text-slate-800">Select a demo account</h3>
            </div>

            <p className="text-xs text-slate-500 mb-4">
              Demo-only sign-in. Firebase Authentication is not connected yet.
            </p>

            <div className="space-y-3 mb-5">
              <button
                type="button"
                aria-pressed={googleSelectedEmail === 'adopter@example.com'}
                onClick={() => setGoogleSelectedEmail('adopter@example.com')}
                className={`w-full p-3 rounded-xl border flex items-center justify-between text-left transition-all ${
                  googleSelectedEmail === 'adopter@example.com'
                    ? 'border-teal-600 bg-teal-50/70 ring-1 ring-teal-500'
                    : 'border-slate-200 hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-teal-600 text-white font-bold flex items-center justify-center text-xs">
                    FL
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-900">Demo Adopter</p>
                    <p className="text-[11px] text-slate-500">adopter@example.com</p>
                  </div>
                </div>
                {googleSelectedEmail === 'adopter@example.com' && (
                  <CheckCircle2 className="w-4 h-4 text-teal-600" />
                )}
              </button>

              <button
                type="button"
                aria-pressed={googleSelectedEmail === 'rescue.volunteer@example.com'}
                onClick={() => setGoogleSelectedEmail('rescue.volunteer@example.com')}
                className={`w-full p-3 rounded-xl border flex items-center justify-between text-left transition-all ${
                  googleSelectedEmail === 'rescue.volunteer@example.com'
                    ? 'border-teal-600 bg-teal-50/70 ring-1 ring-teal-500'
                    : 'border-slate-200 hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-slate-700 text-white font-bold flex items-center justify-center text-xs">
                    RV
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-900">Demo Volunteer</p>
                    <p className="text-[11px] text-slate-500">rescue.volunteer@example.com</p>
                  </div>
                </div>
                {googleSelectedEmail === 'rescue.volunteer@example.com' && (
                  <CheckCircle2 className="w-4 h-4 text-teal-600" />
                )}
              </button>
            </div>

            {/* Demo account role */}
            <div className="mb-5">
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Demo role:
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setGoogleRole('staff')}
                  className={`py-2 px-3 text-xs font-medium rounded-lg border text-center transition-all ${
                    googleRole === 'staff'
                      ? 'border-teal-600 bg-teal-600 text-white shadow-sm'
                      : 'border-slate-300 text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  Shelter Staff
                </button>
                <button
                  type="button"
                  onClick={() => setGoogleRole('adopter')}
                  className={`py-2 px-3 text-xs font-medium rounded-lg border text-center transition-all ${
                    googleRole === 'adopter'
                      ? 'border-teal-600 bg-teal-600 text-white shadow-sm'
                      : 'border-slate-300 text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  Potential Adopter
                </button>
              </div>
            </div>

            <button
              type="button"
              onClick={() => handleDemoLogin(googleSelectedEmail, googleRole)}
              className="w-full py-2.5 px-4 bg-teal-600 hover:bg-teal-700 text-white font-semibold rounded-xl text-sm transition-all"
            >
              Continue as {googleRole === 'staff' ? 'Staff' : 'Adopter'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
