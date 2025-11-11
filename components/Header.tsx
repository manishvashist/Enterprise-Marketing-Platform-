import React from 'react';
import { ProfileDropdown } from './ProfileDropdown';
import { User } from '../types';

type AppView = 'campaign' | 'admin' | 'billing';
type BillingSubView = 'subscription' | 'profile';

interface HeaderProps {
  currentView: AppView;
  setView: (view: AppView, initialTab?: BillingSubView) => void;
  user: User;
  onLogout: () => void;
}

export const Header: React.FC<HeaderProps> = ({ currentView, setView, user, onLogout }) => {
  const navButtonStyle = "px-4 py-2 rounded-md text-sm font-medium transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-800";
  const activeStyle = "bg-slate-700 text-white";
  const inactiveStyle = "text-gray-400 hover:bg-slate-700/50 hover:text-white";

  const handleGoToProfile = () => {
    setView('billing', 'profile');
  };

  return (
    <header className="bg-slate-800/80 backdrop-blur-lg sticky top-0 z-40 border-b border-white/10">
      <div className="container mx-auto px-4 md:px-8 py-3 flex items-center justify-between">
        <div className="flex items-center">
           <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-indigo-400 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.59 14.37a6 6 0 01-5.84 7.38v-4.82m5.84-2.56a6 6 0 01-2.56 5.84m-2.56-5.84a6 6 0 01-5.84-2.56m11.2 0a6 6 0 01-5.84 2.56M12 21a9 9 0 110-18 9 9 0 010 18z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 10.5h6m-3.75-3.75v7.5" />
           </svg>
          <h1 className="text-xl font-bold text-white tracking-tight hidden sm:block">
            AI Campaign Generator
          </h1>
        </div>
        
        <div className="flex items-center space-x-4">
            <nav className="flex items-center space-x-2 bg-slate-900/50 p-1 rounded-lg">
                <button 
                  onClick={() => setView('campaign')}
                  className={`${navButtonStyle} ${currentView === 'campaign' ? activeStyle : inactiveStyle}`}
                  aria-current={currentView === 'campaign' ? 'page' : undefined}
                >
                  Campaign Generator
                </button>
                <button 
                  onClick={() => setView('billing', 'subscription')}
                  className={`${navButtonStyle} ${currentView === 'billing' ? activeStyle : inactiveStyle}`}
                  aria-current={currentView === 'billing' ? 'page' : undefined}
                >
                  Billing & Usage
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
            <ProfileDropdown user={user} onLogout={onLogout} onGoToProfile={handleGoToProfile} />
        </div>
      </div>
    </header>
  );
};