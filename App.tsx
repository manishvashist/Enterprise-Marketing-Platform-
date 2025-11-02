
import React, { useState, useCallback, useEffect } from 'react';
import { authService } from './services/authService';
import { subscriptionService } from './services/subscriptionService';
import { User } from './types';
import { AuthPage } from './components/auth/AuthPage';
import { MainApp } from './components/MainApp';
import { LandingPage } from './components/landing/LandingPage';

const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoadingSession, setIsLoadingSession] = useState(true);
  const [view, setView] = useState<'landing' | 'auth' | 'app'>('landing');

  const fetchUserWithSubscription = async (baseUser: User): Promise<User> => {
    const subscription = await subscriptionService.getSubscriptionForUser(baseUser.id);
    return { ...baseUser, activeSubscription: subscription };
  };

  useEffect(() => {
    // On initial load, check if there's an active session.
    const checkSession = async () => {
      try {
        const sessionUser = await authService.getCurrentUser();
        if (sessionUser) {
          const fullUser = await fetchUserWithSubscription(sessionUser);
          setUser(fullUser);
          setView('app');
        } else {
            setView('landing');
        }
      } catch (error) {
        console.error("Session check failed:", error);
        // If session is invalid, ensure user is logged out.
        authService.logout();
        setView('landing');
      } finally {
        setIsLoadingSession(false);
      }
    };
    checkSession();
  }, []);

  const handleLogin = useCallback(async (loggedInUser: User) => {
    const fullUser = await fetchUserWithSubscription(loggedInUser);
    setUser(fullUser);
    setView('app');
  }, []);

  const handleLogout = useCallback(() => {
    authService.logout();
    setUser(null);
    setView('landing');
  }, []);
  
  const handleUserUpdate = useCallback(async (updatedUser: User) => {
     const fullUser = await fetchUserWithSubscription(updatedUser);
     setUser(fullUser);
  }, []);

  if (isLoadingSession) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="loader ease-linear rounded-full border-4 border-t-4 border-gray-500 h-12 w-12 animate-spin" style={{borderTopColor: '#6366F1'}}></div>
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
            return <MainApp user={user} onLogout={handleLogout} onUserUpdate={handleUserUpdate} />;
        }
        // Fallback if user is somehow null
        setView('landing');
        return null;
    default:
        return <LandingPage onStartTrial={() => setView('auth')} />;
  }
};

export default App;
