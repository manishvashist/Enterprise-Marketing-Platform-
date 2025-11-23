import React, { useState, useEffect } from 'react';
import { LoginForm } from './LoginForm';
import { RegisterForm } from './RegisterForm';
import { VerificationSent } from './VerificationSent';
import { ForgotPasswordForm } from './ForgotPasswordForm';
import { ResetLinkSent } from './ResetLinkSent';
import { User } from '../../types';
import { TermsOfService } from '../legal/TermsOfService';
import { PrivacyPolicy } from '../legal/PrivacyPolicy';

type AuthView = 'login' | 'register' | 'verification' | 'forgot-password' | 'reset-sent';

interface AuthPageProps {
  onLogin: (user: User) => void;
  onBackToHome: () => void;
  initialView?: AuthView;
  initialEmail?: string;
}

export const AuthPage: React.FC<AuthPageProps> = ({ onLogin, onBackToHome, initialView = 'login', initialEmail = '' }) => {
  const [view, setView] = useState<AuthView>(initialView);
  const [emailForContext, setEmailForContext] = useState<string>(initialEmail);
  const [showTerms, setShowTerms] = useState(false);
  const [showPrivacy, setShowPrivacy] = useState(false);

  useEffect(() => {
    setView(initialView);
  }, [initialView]);

  useEffect(() => {
    if (initialEmail) {
        setEmailForContext(initialEmail);
    }
  }, [initialEmail]);

  const handleVerificationSent = (email: string) => {
    setEmailForContext(email);
    setView('verification');
  };

  const handleForgotPassword = (email: string) => {
    setEmailForContext(email);
    setView('forgot-password');
  };

  const handleResetSent = (email: string) => {
    setEmailForContext(email);
    setView('reset-sent');
  };

  return (
    <>
      {showTerms && <TermsOfService onClose={() => setShowTerms(false)} />}
      {showPrivacy && <PrivacyPolicy onClose={() => setShowPrivacy(false)} />}
      
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4">
          <div className="flex items-center mb-8 cursor-pointer group" onClick={onBackToHome} title="Back to Home">
             <div className="bg-white p-2 rounded-lg shadow-sm border border-slate-200 mr-4 group-hover:scale-110 transition-transform">
               <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-orange-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21 7.5l-9-5.25L3 7.5m18 0l-9 5.25m9-5.25v9l-9 5.25M3 7.5l9 5.25M3 7.5v9l9 5.25m0-9v9" />
               </svg>
             </div>
            <h1 className="text-3xl font-bold text-slate-900 tracking-tight group-hover:text-orange-600 transition-colors">
              Campaign<span className="text-orange-600">Gen</span>
            </h1>
          </div>
        <div className="w-full max-w-md bg-white rounded-xl shadow-lg p-8 border border-slate-200 transition-all duration-500">
          {view === 'login' && (
            <LoginForm 
              onLogin={onLogin} 
              onToggleView={() => setView('register')} 
              onVerificationNeeded={handleVerificationSent}
              onForgotPassword={handleForgotPassword}
            />
          )}
          {view === 'register' && (
            <RegisterForm 
              onVerificationSent={handleVerificationSent} 
              onToggleView={() => setView('login')} 
              onSocialLogin={onLogin}
              onTermsClick={() => setShowTerms(true)}
              onPrivacyClick={() => setShowPrivacy(true)} 
            />
          )}
          {view === 'verification' && (
            <VerificationSent 
              email={emailForContext} 
              onGoToLogin={() => setView('login')} 
            />
          )}
          {view === 'forgot-password' && (
            <ForgotPasswordForm
              initialEmail={emailForContext}
              onSuccess={handleResetSent}
              onBack={() => setView('login')}
            />
          )}
          {view === 'reset-sent' && (
            <ResetLinkSent
              email={emailForContext}
              onGoToLogin={() => setView('login')}
            />
          )}
        </div>
      </div>
    </>
  );
};