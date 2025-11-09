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
             <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 00-2.456 2.456zM16.898 20.572L16.25 21.75l-.648-1.178a3.375 3.375 0 00-2.456-2.456L12 17.25l1.178-.648a3.375 3.375 0 002.456-2.456L16.25 13.5l.648 1.178a3.375 3.375 0 002.456 2.456L20.25 18l-1.178.648a3.375 3.375 0 00-2.456 2.456z" />
           </svg>
          <h1 className="text-xl font-bold text-white tracking-tight hidden sm:block">
            AI Marketing Platform
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