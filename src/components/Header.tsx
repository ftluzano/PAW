import React from 'react';
import { User, UserRole } from '../types.ts';
import { LogOut, Info } from 'lucide-react';
import { BrandLogo } from './BrandLogo.tsx';

interface HeaderProps {
  user: User;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onOpenScopeModal: () => void;
  onLogout: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  user,
  activeTab,
  setActiveTab,
  onOpenScopeModal,
  onLogout,
}) => {
  const isStaff = user.role === 'staff';

  const navLinks = user.role === 'admin'
    ? [
        { id: 'admin-dashboard', label: 'Overview' },
        { id: 'admin-posts', label: 'Pet Posts' },
        { id: 'admin-reports', label: 'Reports' },
      ]
    : isStaff
    ? [
        { id: 'records', label: 'Animal Records' },
        { id: 'clinical', label: 'In-Care Health Monitoring' },
        { id: 'pipeline', label: 'Adoption Pipeline' },
        { id: 'applications', label: 'Review Applications' },
        { id: 'followups', label: 'Follow-ups & Reports' },
      ]
    : [
        { id: 'browse', label: 'Available Pets' },
        { id: 'my-applications', label: 'My Applications' },
        { id: 'adopter-followup', label: 'Post-Adoption Care' },
        { id: 'care-guide', label: 'Responsible Adoption' },
      ];

  return (
    <header className="bg-slate-900 border-b border-slate-800 text-white sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between gap-8 h-16">
        
        {/* Zone 1: Single element brand wordmark */}
        <div className="flex items-center gap-3 shrink-0">
          <BrandLogo />
          <span className="rounded border border-amber-400/30 bg-amber-400/10 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider text-amber-300">
            Demo
          </span>
        </div>

        {/* Zone 2: 4-5 single-line navigation links */}
        <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-300">
          {navLinks.map((link) => (
            <button
              key={link.id}
              onClick={() => setActiveTab(link.id)}
              className={`whitespace-nowrap shrink-0 transition-colors py-1 ${
                activeTab === link.id
                  ? 'text-teal-400 font-semibold border-b-2 border-teal-400'
                  : 'hover:text-white'
              }`}
            >
              {link.label}
            </button>
          ))}
          
          <button
            onClick={onOpenScopeModal}
            className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-teal-300 whitespace-nowrap shrink-0 transition-colors"
          >
            <Info className="w-3.5 h-3.5" />
            <span>Scope & Rules</span>
          </button>
        </nav>

        {/* Zone 3: Account role and sign out */}
        <div className="flex items-center gap-3 shrink-0">
          <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 text-xs font-medium rounded-lg bg-slate-800 border border-slate-700 text-slate-200 whitespace-nowrap shrink-0">
            <span className={`w-2 h-2 rounded-full ${user.role === 'admin' ? 'bg-amber-400' : isStaff ? 'bg-teal-400' : 'bg-rose-400'}`} />
            <span>{user.role === 'admin' ? 'Administrator' : isStaff ? 'Shelter Staff' : 'Adopter'}</span>
          </div>

          {/* User Profile & Sign out */}
          <div className="flex items-center gap-2.5 pl-2 border-l border-slate-800">
            <div className="text-right hidden lg:block">
              <p className="text-xs font-semibold text-white leading-tight truncate max-w-[120px]">
                {user.name}
              </p>
              <p className="text-[10px] text-slate-400 leading-tight">
                {user.role === 'admin' ? 'Administrator' : isStaff ? 'Shelter Staff' : 'Adopter'}
              </p>
            </div>
            
            <button
              onClick={onLogout}
              title="Sign Out"
              className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-slate-800 transition-colors shrink-0"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Mobile nav bar */}
      <div className="md:hidden border-t border-slate-800 px-4 py-2 flex items-center gap-3 overflow-x-auto text-xs no-scrollbar">
        {navLinks.map((link) => (
          <button
            key={link.id}
            onClick={() => setActiveTab(link.id)}
            className={`whitespace-nowrap px-2.5 py-1 rounded ${
              activeTab === link.id
                ? 'bg-teal-600 text-white font-semibold'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            {link.label}
          </button>
        ))}
        <button
          onClick={onOpenScopeModal}
          className="whitespace-nowrap px-2.5 py-1 rounded text-teal-400 bg-teal-950/60 border border-teal-800/50"
        >
          Scope
        </button>
      </div>
    </header>
  );
};
