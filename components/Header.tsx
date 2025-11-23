import React from 'react';
import { ProfileDropdown } from './ProfileDropdown';
import { User } from '../types';

type AppView = 'campaign' | 'admin' | 'billing' | 'connections';
type BillingSubView = 'subscription' | 'profile';

interface HeaderProps {
  currentView: AppView;
  setView: (view: AppView, initialTab?: BillingSubView) => void;
  user: User;
  onLogout: () => void;
}

export const Header: React.FC<HeaderProps> = ({ currentView, setView, user, onLogout }) => {
  // Updated styling for pill-shaped nav
  const navButtonStyle = "px-5 py-2 rounded-full text-sm font-semibold transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-orange-500 focus-visible:ring-offset-2";
  const activeStyle = "bg-slate-900 text-white shadow-md transform scale-105";
  const inactiveStyle = "text-slate-500 hover:bg-white hover:text-slate-900 hover:shadow-sm";

  const handleGoToProfile = () => {
    setView('billing', 'profile');
  };

  return (
    <header className="bg-slate-50/80 backdrop-blur-xl sticky top-0 z-40 border-b border-slate-200/60 h-20 flex items-center">
      <div className="container mx-auto px-6 md:px-12 flex items-center justify-between">
        <div className="flex items-center cursor-pointer group" onClick={() => setView('campaign')}>
           <div className="bg-gradient-to-br from-orange-500 to-orange-600 w-9 h-9 rounded-xl flex items-center justify-center text-white shadow-lg shadow-orange-500/30 mr-3 group-hover:scale-110 transition-transform duration-300">
             <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 7.5l-9-5.25L3 7.5m18 0l-9 5.25m9-5.25v9l-9 5.25M3 7.5l9 5.25M3 7.5v9l9 5.25m0-9v9" />
             </svg>
           </div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight hidden sm:block">
            Campaign<span className="text-orange-600">Gen</span>
          </h1>
        </div>
        
        <div className="flex items-center gap-6">
            <nav className="flex items-center p-1 bg-slate-200/50 rounded-full border border-slate-200/50 hidden md:flex">
                <button 
                  onClick={() => setView('campaign')}
                  className={`${navButtonStyle} ${currentView === 'campaign' ? activeStyle : inactiveStyle}`}
                  aria-current={currentView === 'campaign' ? 'page' : undefined}
                >
                  Generator
                </button>
                {/* Connections Tab Hidden 
                <button 
                  onClick={() => setView('connections')}
                  className={`${navButtonStyle} ${currentView === 'connections' ? activeStyle : inactiveStyle}`}
                  aria-current={currentView === 'connections' ? 'page' : undefined}
                >
                  Connections
                </button>
                */}
                <button 
                  onClick={() => setView('billing', 'subscription')}
                  className={`${navButtonStyle} ${currentView === 'billing' ? activeStyle : inactiveStyle}`}
                  aria-current={currentView === 'billing' ? 'page' : undefined}
                >
                  Billing
                </button>
                {user.role === 'Admin' && (
                   <button 
                      onClick={() => setView('admin')}
                      className={`${navButtonStyle} ${currentView === 'admin' ? activeStyle : inactiveStyle}`}
                      aria-current={currentView === 'admin' ? 'page' : undefined}
                    >
                      Admin
                    </button>
                )}
            </nav>
            <div className="h-8 w-px bg-slate-200 hidden md:block"></div>
            <ProfileDropdown user={user} onLogout={onLogout} onGoToProfile={handleGoToProfile} />
        </div>
      </div>
    </header>
  );
};