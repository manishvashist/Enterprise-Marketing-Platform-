
import React, { useState } from 'react';
import { authService } from '../../services/authService';

interface ForgotPasswordFormProps {
  initialEmail: string;
  onSuccess: (email: string) => void;
  onBack: () => void;
}

export const ForgotPasswordForm: React.FC<ForgotPasswordFormProps> = ({ initialEmail, onSuccess, onBack }) => {
  const [email, setEmail] = useState(initialEmail);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      await authService.sendPasswordResetEmail(email);
      onSuccess(email);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'An unknown error occurred.';
      setError(message);
      setIsLoading(false);
    }
  };

  return (
    <div>
      <h2 className="text-2xl font-bold text-slate-900 text-center mb-2">Reset Password</h2>
      <p className="text-slate-500 text-center mb-6">Enter your email to receive a password reset link.</p>
      
      <form onSubmit={handleSubmit}>
        <div className="space-y-4">
          <div>
            <label htmlFor="email-reset" className="block text-sm font-medium text-slate-700 mb-1">
              Email Address
            </label>
            <input
              id="email-reset"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              required
              className="w-full p-3 bg-slate-50 border border-slate-200 rounded-md focus:ring-2 focus:ring-orange-500 focus:border-orange-500 text-slate-900 placeholder-slate-400 transition-all"
            />
          </div>
        </div>
        
        {error && <p className="text-red-600 text-sm text-center mt-4 bg-red-50 p-2 rounded border border-red-100">{error}</p>}

        <div className="mt-6">
          <button
            type="submit"
            disabled={isLoading}
            className="w-full px-6 py-3 bg-orange-600 text-white font-semibold rounded-md hover:bg-orange-700 disabled:bg-slate-300 disabled:cursor-not-allowed transition-all flex items-center justify-center shadow-md shadow-orange-600/20 hover:shadow-lg"
          >
            {isLoading ? (
              <>
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Sending...
              </>
            ) : 'Get reset link'}
          </button>
        </div>
      </form>

      <div className="mt-6 text-center">
        <button onClick={onBack} className="text-sm font-medium text-slate-500 hover:text-slate-700 transition-colors">
          &larr; Back to Sign In
        </button>
      </div>
    </div>
  );
};
