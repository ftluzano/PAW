import React from 'react';
import { User, UserRole } from '../types.ts';
import { LogOut } from 'lucide-react';
import { BrandLogo } from './BrandLogo.tsx';

interface HeaderProps {
  user: User;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onLogout: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  user,
  activeTab,
  setActiveTab,
  onLogout,
}) => {
  const isStaff = user.role === 'staff';

  const navLinks = user.role === 'admin'
    ? [
        { id: 'admin-dashboard', label: 'OVERVIEW' },
        { id: 'admin-posts', label: 'PET POSTS' },
        { id: 'admin-reports', label: 'REPORTS' },
      ]
    : isStaff
    ? [
        { id: 'records', label: 'ANIMAL RECORDS' },
        { id: 'clinical', label: 'IN-CARE HEALTH MONITORING' },
        { id: 'pipeline', label: 'ADOPTION PIPELINE' },
        { id: 'applications', label: 'REVIEW APPLICATIONS' },
        { id: 'followups', label: 'FOLLOW-UPS & REPORTS' },
      ]
    : [
        { id: 'browse', label: 'AVAILABLE PETS' },
        { id: 'my-applications', label: 'MY APPLICATIONS' },
        { id: 'adopter-followup', label: 'POST-ADOPTION CARE' },
        { id: 'care-guide', label: 'CARE GUIDE' },
      ];

  return (
    <header className="bg-slate-900 border-b border-slate-800 text-white sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between gap-8 h-16">
        
        {/* Zone 1: Single element brand wordmark */}
        <div className="flex items-center gap-3 shrink-0">
          <BrandLogo />
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
      </div>
    </header>
  );
};
