
import React, { useState } from 'react';
import { LoginForm } from './LoginForm';
import { RegisterForm } from './RegisterForm';
import { User } from '../../types';

interface AuthPageProps {
  onLogin: (user: User) => void;
  onBackToHome: () => void;
}

export const AuthPage: React.FC<AuthPageProps> = ({ onLogin, onBackToHome }) => {
  const [isLoginView, setIsLoginView] = useState(true);

  const toggleView = () => {
    setIsLoginView(!isLoginView);
  };

  return (
    <div className="min-h-screen bg-gray-900 flex flex-col items-center justify-center p-4">
        <div className="flex items-center mb-8 cursor-pointer group" onClick={onBackToHome} title="Back to Home">
           <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-indigo-400 mr-4 group-hover:scale-110 transition-transform" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm-1-13h2v6h-2zm0 8h2v2h-2z" opacity=".3"/>
              <path d="M12.88 4.62l-1.76.81L12 2l.88 3.43zM6.12 6.12l.81 1.76L4.62 7.12 2 6l3.43-.88zM4.62 16.88l1.76-.81L6 22l-.88-3.43zM16.88 19.38l.81-1.76L19.38 16.88 22 18l-3.43.88zM19.38 7.12l-1.76-.81L18 2l.88 3.43zM12 5c-3.87 0-7 3.13-7 7s3.13 7 7 7 7-3.13 7-7-3.13-7-7-7zm0 12c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5z"/>
              <path d="M12.88 19.38l-1.76-.81L12 22l.88-3.43zM7.12 4.62l1.76.81L8 2l-.88 3.43z"/>
           </svg>
          <h1 className="text-3xl font-bold text-white tracking-tight group-hover:text-indigo-300 transition-colors">
            Enterprise Marketing Platform
          </h1>
        </div>
      <div className="w-full max-w-md bg-gray-800 rounded-lg shadow-xl p-8 border border-gray-700">
        {isLoginView ? (
          <LoginForm onLogin={onLogin} onToggleView={toggleView} />
        ) : (
          <RegisterForm onRegisterSuccess={toggleView} onToggleView={toggleView} onSocialLogin={onLogin} />
        )}
      </div>
    </div>
  );
};
