
import React, { useState, useMemo } from 'react';
import { authService } from '../../services/authService';
import { SocialLogins } from './SocialLogins';
import { User } from '../../types';

interface RegisterFormProps {
  onRegisterSuccess: () => void;
  onToggleView: () => void;
  onSocialLogin: (user: User) => void;
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

export const RegisterForm: React.FC<RegisterFormProps> = ({ onRegisterSuccess, onToggleView, onSocialLogin }) => {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const strength = useMemo(() => passwordStrength(password), [password]);
  const passwordMatch = useMemo(() => password && password === confirmPassword, [password, confirmPassword]);
  const isFormValid = strength >= 4 && passwordMatch && agreedToTerms;

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
    setSuccess(null);

    try {
      await authService.register({ fullName, email, password });
      setSuccess('Registration successful! Redirecting to sign in...');
      setTimeout(() => {
        onRegisterSuccess();
      }, 2000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred.');
      setIsLoading(false);
    }
  };

  return (
    <div>
      <h2 className="text-2xl font-bold text-white text-center mb-2">Create an Account</h2>
      <p className="text-gray-400 text-center mb-6">Join the platform to start building campaigns.</p>
      
      <SocialLogins onSocialLogin={onSocialLogin} context="Sign up" />

      <div className="my-6 flex items-center">
          <div className="flex-grow border-t border-gray-600"></div>
          <span className="flex-shrink mx-4 text-gray-400 text-sm">Or with email</span>
          <div className="flex-grow border-t border-gray-600"></div>
      </div>
      
      <form onSubmit={handleSubmit}>
        <div className="space-y-4">
          <div>
            <label htmlFor="fullName-register" className="block text-sm font-medium text-gray-300 mb-1">
              Full Name
            </label>
            <input
              id="fullName-register"
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              required
              minLength={2}
              className="w-full p-3 bg-gray-900 border border-gray-600 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-gray-200 placeholder-gray-500"
            />
          </div>
          <div>
            <label htmlFor="email-register" className="block text-sm font-medium text-gray-300 mb-1">
              Email Address
            </label>
            <input
              id="email-register"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full p-3 bg-gray-900 border border-gray-600 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-gray-200 placeholder-gray-500"
            />
          </div>
          <div>
            <label htmlFor="password-register" className="block text-sm font-medium text-gray-300 mb-1">
              Password
            </label>
            <input
              id="password-register"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full p-3 bg-gray-900 border border-gray-600 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-gray-200 placeholder-gray-500"
            />
            {password.length > 0 && (
              <div className="flex items-center mt-2">
                <div className="w-full bg-gray-700 rounded-full h-1.5 mr-2">
                  <div className={`h-1.5 rounded-full ${strength <= 2 ? 'bg-red-500' : strength <= 4 ? 'bg-yellow-500' : 'bg-green-500'}`} style={{ width: `${strength * 20}%`}}></div>
                </div>
                <span className="text-xs text-gray-400">{['Weak', 'Weak', 'Medium', 'Medium', 'Strong', 'Very Strong'][strength]}</span>
              </div>
            )}
          </div>
          <div>
            <label htmlFor="confirmPassword-register" className="block text-sm font-medium text-gray-300 mb-1">
              Confirm Password
            </label>
            <input
              id="confirmPassword-register"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              className={`w-full p-3 bg-gray-900 border rounded-md focus:ring-2 focus:border-indigo-500 text-gray-200 placeholder-gray-500 ${confirmPassword.length > 0 ? (passwordMatch ? 'border-green-500' : 'border-red-500') : 'border-gray-600'}`}
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
                      className="focus:ring-indigo-500 h-4 w-4 text-indigo-600 border-gray-500 rounded bg-gray-700"
                  />
              </div>
              <div className="ml-3 text-sm">
                  <label htmlFor="terms" className="font-medium text-gray-400">
                      I agree to the{' '}
                      <a href="#" className="text-indigo-400 hover:text-indigo-300">
                          Terms of Service
                      </a>{' '}
                      and{' '}
                      <a href="#" className="text-indigo-400 hover:text-indigo-300">
                          Privacy Policy
                      </a>
                      .
                  </label>
              </div>
          </div>
        </div>
        
        {error && <p className="text-red-400 text-sm text-center mt-4">{error}</p>}
        {success && <p className="text-green-400 text-sm text-center mt-4">{success}</p>}

        <div className="mt-6">
          <button
            type="submit"
            disabled={isLoading || !!success || !agreedToTerms}
            className="w-full px-6 py-3 bg-indigo-600 text-white font-semibold rounded-md hover:bg-indigo-700 disabled:bg-gray-600 disabled:cursor-not-allowed transition-all flex items-center justify-center"
          >
            {isLoading ? 'Creating Account...' : 'Sign Up'}
          </button>
        </div>
      </form>

      <p className="text-center text-sm text-gray-400 mt-6">
        Already have an account?{' '}
        <button onClick={onToggleView} className="font-medium text-indigo-400 hover:text-indigo-300">
          Sign in
        </button>
      </p>
    </div>
  );
};
