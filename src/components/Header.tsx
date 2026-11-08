import React from 'react';
import { User, UserRole } from '../types.ts';
import { PawPrint, LogOut, Info, ArrowLeftRight } from 'lucide-react';

interface HeaderProps {
  user: User;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onRoleToggle: () => void;
  onOpenScopeModal: () => void;
  onLogout: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  user,
  activeTab,
  setActiveTab,
  onRoleToggle,
  onOpenScopeModal,
  onLogout,
}) => {
  const isStaff = user.role === 'staff';

  const navLinks = isStaff
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
          <div className="w-9 h-9 rounded-lg bg-teal-500/20 border border-teal-500/30 flex items-center justify-center text-teal-400">
            <PawPrint className="w-5 h-5" />
          </div>
          <span className="text-lg font-bold tracking-tight text-white whitespace-nowrap">
            PAW System
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

        {/* Zone 3: 1 primary action / Profile & Role Switcher */}
        <div className="flex items-center gap-3 shrink-0">
          {/* Role badge and switch button */}
          <button
            onClick={onRoleToggle}
            title={`Switch to ${isStaff ? 'Potential Adopter' : 'Shelter Staff'} view`}
            className="hidden sm:flex items-center gap-2 px-3 py-1.5 text-xs font-medium rounded-lg bg-slate-800 hover:bg-slate-700/80 border border-slate-700 text-slate-200 transition-colors whitespace-nowrap shrink-0"
          >
            <span className={`w-2 h-2 rounded-full ${isStaff ? 'bg-teal-400' : 'bg-rose-400'}`} />
            <span>Mode: {isStaff ? 'Staff' : 'Adopter'}</span>
            <ArrowLeftRight className="w-3 h-3 text-slate-400" />
          </button>

          {/* User Profile & Sign out */}
          <div className="flex items-center gap-2.5 pl-2 border-l border-slate-800">
            <div className="text-right hidden lg:block">
              <p className="text-xs font-semibold text-white leading-tight truncate max-w-[120px]">
                {user.name}
              </p>
              <p className="text-[10px] text-slate-400 leading-tight">
                {isStaff ? 'Shelter Lead' : 'Adopter'}
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
        <button
          onClick={onRoleToggle}
          className="whitespace-nowrap px-2.5 py-1 rounded text-slate-300 bg-slate-800"
        >
          Toggle: {isStaff ? 'Staff' : 'Adopter'}
        </button>
      </div>
    </header>
  );
};
