
import React from 'react';
import { EmailIcon } from '../icons/EmailIcon';

interface ResetLinkSentProps {
  email: string;
  onGoToLogin: () => void;
}

export const ResetLinkSent: React.FC<ResetLinkSentProps> = ({ email, onGoToLogin }) => {
  return (
    <div className="text-center animate-fade-in">
      <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
        <EmailIcon className="w-8 h-8 text-blue-600" />
      </div>
      
      <h2 className="text-2xl font-bold text-slate-900 mb-3">Check your inbox</h2>
      
      <p className="text-slate-600 mb-8 leading-relaxed">
        We sent you a password change link to <br/>
        <span className="font-semibold text-slate-800">{email}</span>.
      </p>

      <div className="space-y-4">
        <button
          onClick={onGoToLogin}
          className="w-full px-6 py-3 bg-orange-600 text-white font-semibold rounded-md hover:bg-orange-700 transition-all shadow-md shadow-orange-600/20 hover:shadow-lg hover:-translate-y-0.5"
        >
          Sign In
        </button>
        
        <p className="text-sm text-slate-500">
          Did not receive the email? Check your spam folder.
        </p>
      </div>
    </div>
  );
};
