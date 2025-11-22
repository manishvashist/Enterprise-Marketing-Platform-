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
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4">
        <div className="flex items-center mb-8 cursor-pointer group" onClick={onBackToHome} title="Back to Home">
           <div className="bg-white p-2 rounded-lg shadow-sm border border-slate-200 mr-4 group-hover:scale-110 transition-transform">
             <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-orange-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.59 14.37a6 6 0 01-5.84 7.38v-4.82m5.84-2.56a6 6 0 01-2.56 5.84m-2.56-5.84a6 6 0 01-5.84-2.56m11.2 0a6 6 0 01-5.84 2.56M12 21a9 9 0 110-18 9 9 0 010 18z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 10.5h6m-3.75-3.75v7.5" />
             </svg>
           </div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight group-hover:text-orange-600 transition-colors">
            Campaign<span className="text-orange-600">Gen</span>
          </h1>
        </div>
      <div className="w-full max-w-md bg-white rounded-xl shadow-lg p-8 border border-slate-200">
        {isLoginView ? (
          <LoginForm onLogin={onLogin} onToggleView={toggleView} />
        ) : (
          <RegisterForm onRegisterSuccess={toggleView} onToggleView={toggleView} onSocialLogin={onLogin} />
        )}
      </div>
    </div>
  );
};