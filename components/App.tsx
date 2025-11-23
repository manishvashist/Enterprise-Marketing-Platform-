
import React, { useState, useCallback, useEffect, useRef } from 'react';
import { authService } from '../services/authService';
import { subscriptionService } from '../services/subscriptionService';
import { User } from '../types';
import { AuthPage } from '../components/auth/AuthPage';
import { MainApp } from '../components/MainApp';
import { LandingPage } from '../components/landing/LandingPage';

const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoadingSession, setIsLoadingSession] = useState(true);
  const [view, setView] = useState<'landing' | 'auth' | 'app'>('landing');
  const [globalError, setGlobalError] = useState<string | null>(null);
  const [globalSuccess, setGlobalSuccess] = useState<string | null>(null);

  const fetchUserWithSubscription = useCallback(async (baseUser: User): Promise<User> => {
    const subscription = await subscriptionService.getSubscriptionForUser(baseUser.id);
    return { ...baseUser, activeSubscription: subscription };
  }, []);

  useEffect(() => {
    if (globalSuccess) {
        const timer = setTimeout(() => setGlobalSuccess(null), 5000);
        return () => clearTimeout(timer);
    }
  }, [globalSuccess]);

  useEffect(() => {
    // Use the mock auth service listener
    const unsubscribe = authService.onAuthStateChanged(async (authUser) => {
        setIsLoadingSession(true);
        try {
            if (authUser) {
                const fullUser = await fetchUserWithSubscription(authUser);
                setUser(fullUser);
                setView('app');
            } else {
                setUser(null);
                setView('landing');
            }
        } catch (err) {
            console.error("Auth State Change Error:", err);
            setGlobalError("An error occurred during session initialization.");
        } finally {
            setIsLoadingSession(false);
        }
    });

    return () => unsubscribe();
  }, [fetchUserWithSubscription]);

  const handleLogin = useCallback(async (loggedInUser: User) => {
    // onAuthStateChanged handles the state update
  }, []);

  const handleLogout = useCallback(async () => {
    try {
      await authService.logout();
      // onAuthStateChanged will update state to null/landing
    } catch (err) {
      console.error("Logout failed:", err);
      setGlobalError("Logout failed. Please try again.");
    }
  }, [setGlobalError]);
  
  const handleUserUpdate = useCallback(async (updatedUser: User) => {
     const fullUser = await fetchUserWithSubscription(updatedUser);
     setUser(fullUser);
  }, [fetchUserWithSubscription]);

  const renderContent = () => {
    if (isLoadingSession) {
      return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center">
          <svg className="animate-spin h-10 w-10 text-orange-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
        </div>
      );
    }

    switch (view) {
      case 'landing':
          return <LandingPage onStartTrial={() => setView('auth')} />;
      case 'auth':
          return <AuthPage onLogin={handleLogin} onBackToHome={() => setView('landing')} />;
      case 'app':
          if (user) {
              return <MainApp user={user} onLogout={handleLogout} onUserUpdate={handleUserUpdate} onSetGlobalSuccess={setGlobalSuccess} />;
          }
          // Fallback if user is somehow null but auth state thought otherwise
          return <LandingPage onStartTrial={() => setView('auth')} />;
      default:
          return <LandingPage onStartTrial={() => setView('auth')} />;
    }
  }; 

  return (
    <>
      {globalError && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 w-full max-w-xl bg-white border border-red-200 text-red-700 p-4 rounded-lg shadow-lg text-center z-50 flex justify-between items-center animate-fade-in-up">
            <span className="font-medium">{globalError}</span>
            <button onClick={() => setGlobalError(null)} className="p-1 rounded-full hover:bg-red-50 transition-colors text-red-500">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
            </button>
        </div>
      )}
      {globalSuccess && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 w-full max-w-xl bg-white border border-green-200 text-green-700 p-4 rounded-lg shadow-lg text-center z-50 flex justify-between items-center animate-fade-in-up">
            <span className="font-medium">{globalSuccess}</span>
            <button onClick={() => setGlobalSuccess(null)} className="p-1 rounded-full hover:bg-green-50 transition-colors text-green-500">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
            </button>
        </div>
      )}
      {renderContent()}
    </>
  );
};

export default App;
