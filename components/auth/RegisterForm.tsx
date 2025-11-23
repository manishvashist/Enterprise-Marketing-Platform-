import React, { useState, useMemo } from 'react';
import { authService } from '../../services/authService';
import { SocialLogins } from './SocialLogins';
import { User } from '../../types';

interface RegisterFormProps {
  onVerificationSent: (email: string) => void;
  onToggleView: () => void;
  onSocialLogin: (user: User) => void;
  onTermsClick: () => void;
  onPrivacyClick: () => void;
}

const passwordStrength = (password: string) => {
  let score = 0;
  if (password.length > 8) score++;
  if (/[A-Z]/.test(password)) score++;
  if (/[a-z]/.test(password)) score++;
  if (/[0-9]/.test(password)) score++;
  if (/[^A-Za-z0-9]/.test(password)) score++;
  return score;
};

export const RegisterForm: React.FC<RegisterFormProps> = ({ onVerificationSent, onToggleView, onSocialLogin, onTermsClick, onPrivacyClick }) => {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const strength = useMemo(() => passwordStrength(password), [password]);
  const passwordMatch = useMemo(() => password && password === confirmPassword, [password, confirmPassword]);
  const isFormValid = strength >= 4 && passwordMatch && agreedToTerms;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files && e.target.files[0]) {
          setPhotoFile(e.target.files[0]);
      }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isFormValid) {
        if (strength < 4) setError('Password is too weak.');
        else if (!passwordMatch) setError('Passwords do not match.');
        else if (!agreedToTerms) setError('You must agree to the Terms of Service and Privacy Policy.');
        return;
    }
    
    setIsLoading(true);
    setError(null);

    try {
      await authService.register({ fullName, email, password, photoFile: photoFile || undefined });
      onVerificationSent(email);
    } catch (err: any) {
      // Display user-friendly error for duplicates
      if (err.message === 'user already exists. Sign in?') {
          setError('user already exists. Sign in?');
      } else {
          setError(err.message || 'An unknown error occurred.');
      }
      setIsLoading(false);
    }
  };

  return (
    <div>
      <h2 className="text-2xl font-bold text-slate-900 text-center mb-2">Create an Account</h2>
      <p className="text-slate-500 text-center mb-6">Join the platform to start building campaigns.</p>
      
      <SocialLogins onSocialLogin={onSocialLogin} context="Sign up" />

      <div className="my-6 flex items-center">
          <div className="flex-grow border-t border-slate-200"></div>
          <span className="flex-shrink mx-4 text-slate-400 text-sm">Or with email</span>
          <div className="flex-grow border-t border-slate-200"></div>
      </div>
      
      <form onSubmit={handleSubmit}>
        <div className="space-y-4">
          <div>
            <label htmlFor="fullName-register" className="block text-sm font-medium text-slate-700 mb-1">
              Full Name
            </label>
            <input
              id="fullName-register"
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              required
              minLength={2}
              className="w-full p-3 bg-slate-50 border border-slate-200 rounded-md focus:ring-2 focus:ring-orange-500 focus:border-orange-500 text-slate-900 placeholder-slate-400 transition-all"
            />
          </div>
          
          <div>
            <label htmlFor="profile-photo" className="block text-sm font-medium text-slate-700 mb-1">
                Profile Photo (Optional)
            </label>
            <input 
                type="file" 
                id="profile-photo" 
                accept="image/*"
                onChange={handleFileChange}
                className="w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-orange-50 file:text-orange-700 hover:file:bg-orange-100"
            />
          </div>

          <div>
            <label htmlFor="email-register" className="block text-sm font-medium text-slate-700 mb-1">
              Email Address
            </label>
            <input
              id="email-register"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full p-3 bg-slate-50 border border-slate-200 rounded-md focus:ring-2 focus:ring-orange-500 focus:border-orange-500 text-slate-900 placeholder-slate-400 transition-all"
            />
          </div>
          <div>
            <label htmlFor="password-register" className="block text-sm font-medium text-slate-700 mb-1">
              Password
            </label>
            <input
              id="password-register"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full p-3 bg-slate-50 border border-slate-200 rounded-md focus:ring-2 focus:ring-orange-500 focus:border-orange-500 text-slate-900 placeholder-slate-400 transition-all"
            />
            {password.length > 0 && (
              <div className="flex items-center mt-2">
                <div className="w-full bg-slate-200 rounded-full h-1.5 mr-2">
                  <div className={`h-1.5 rounded-full ${strength <= 2 ? 'bg-red-500' : strength <= 4 ? 'bg-yellow-500' : 'bg-green-500'}`} style={{ width: `${strength * 20}%`}}></div>
                </div>
                <span className="text-xs text-slate-500">{['Weak', 'Weak', 'Medium', 'Medium', 'Strong', 'Very Strong'][strength]}</span>
              </div>
            )}
          </div>
          <div>
            <label htmlFor="confirmPassword-register" className="block text-sm font-medium text-slate-700 mb-1">
              Repeat Password
            </label>
            <input
              id="confirmPassword-register"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              className={`w-full p-3 bg-slate-50 border rounded-md focus:ring-2 focus:border-orange-500 text-slate-900 placeholder-slate-400 transition-all ${confirmPassword.length > 0 ? (passwordMatch ? 'border-green-500' : 'border-red-500') : 'border-slate-200'}`}
            />
          </div>
          <div className="flex items-start">
              <div className="flex items-center h-5">
                  <input
                      id="terms"
                      name="terms"
                      type="checkbox"
                      checked={agreedToTerms}
                      onChange={(e) => setAgreedToTerms(e.target.checked)}
                      className="focus:ring-orange-500 h-4 w-4 text-orange-600 border-slate-300 rounded bg-white"
                  />
              </div>
              <div className="ml-3 text-sm">
                  <label htmlFor="terms" className="font-medium text-slate-500">
                      I agree to the{' '}
                      <button 
                        type="button" 
                        onClick={onTermsClick}
                        className="text-orange-600 hover:text-orange-700 underline focus:outline-none"
                      >
                          Terms of Service
                      </button>{' '}
                      and{' '}
                      <button 
                        type="button" 
                        onClick={onPrivacyClick}
                        className="text-orange-600 hover:text-orange-700 underline focus:outline-none"
                      >
                          Privacy Policy
                      </button>
                      .
                  </label>
              </div>
          </div>
        </div>
        
        {error && <p className="text-red-600 text-sm text-center mt-4 bg-red-50 p-2 rounded border border-red-100">{error}</p>}

        <div className="mt-6">
          <button
            type="submit"
            disabled={isLoading || !agreedToTerms}
            className="w-full px-6 py-3 bg-orange-600 text-white font-semibold rounded-md hover:bg-orange-700 disabled:bg-slate-300 disabled:cursor-not-allowed transition-all flex items-center justify-center shadow-md hover:shadow-lg"
          >
            {isLoading ? 'Creating Account...' : 'Sign Up'}
          </button>
        </div>
      </form>

      <p className="text-center text-sm text-slate-500 mt-6">
        Already have an account?{' '}
        <button onClick={onToggleView} className="font-medium text-orange-600 hover:text-orange-700">
          Sign in
        </button>
      </p>
    </div>
  );
};