
import React, { useState, useCallback, useEffect } from 'react';
import { authService } from './services/authService';
import { subscriptionService } from './services/subscriptionService';
import { User } from './types';
import { AuthPage } from './components/auth/AuthPage';
import { MainApp } from './components/MainApp';

const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoadingSession, setIsLoadingSession] = useState(true);

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
        }
      } catch (error) {
        console.error("Session check failed:", error);
        // If session is invalid, ensure user is logged out.
        authService.logout();
      } finally {
        setIsLoadingSession(false);
      }
    };
    checkSession();
  }, []);

  const handleLogin = useCallback(async (loggedInUser: User) => {
    const fullUser = await fetchUserWithSubscription(loggedInUser);
    setUser(fullUser);
  }, []);

  const handleLogout = useCallback(() => {
    authService.logout();
    setUser(null);
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

  if (!user) {
    return <AuthPage onLogin={handleLogin} />;
  }

  return <MainApp user={user} onLogout={handleLogout} onUserUpdate={handleUserUpdate} />;
};

export default App;
