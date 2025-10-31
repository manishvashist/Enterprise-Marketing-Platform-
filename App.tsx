import React, { useState, useCallback, useEffect } from 'react';
import { authService } from './services/authService';
import { User } from './types';
import { AuthPage } from './components/auth/AuthPage';
import { MainApp } from './components/MainApp';

const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoadingSession, setIsLoadingSession] = useState(true);

  useEffect(() => {
    // On initial load, check if there's an active session.
    const checkSession = async () => {
      try {
        const sessionUser = await authService.getCurrentUser();
        if (sessionUser) {
          setUser(sessionUser);
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

  const handleLogin = useCallback((loggedInUser: User) => {
    setUser(loggedInUser);
  }, []);

  const handleLogout = useCallback(() => {
    authService.logout();
    setUser(null);
  }, []);
  
  const handleUserUpdate = useCallback((updatedUser: User) => {
    setUser(updatedUser);
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