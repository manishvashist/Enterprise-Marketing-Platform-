
import React, { useState, useMemo } from 'react';
import { authService } from '../../services/authService';
import { UserRole } from '../../types';

interface RegisterFormProps {
  onRegisterSuccess: () => void;
  onToggleView: () => void;
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

export const RegisterForm: React.FC<RegisterFormProps> = ({ onRegisterSuccess, onToggleView }) => {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [role, setRole] = useState<UserRole>('User');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const strength = useMemo(() => passwordStrength(password), [password]);
  const passwordMatch = useMemo(() => password && password === confirmPassword, [password, confirmPassword]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (strength < 4) {
      setError('Password is too weak.');
      return;
    }
    if (!passwordMatch) {
      setError('Passwords do not match.');
      return;
    }
    
    setIsLoading(true);
    setError(null);
    setSuccess(null);

    try {
      await authService.register({ fullName, email, password, role });
      setSuccess('Registration successful! Please sign in.');
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
          <div>
            <label htmlFor="role-register" className="block text-sm font-medium text-gray-300 mb-1">
              Select Your Role
            </label>
            <select
                id="role-register"
                value={role}
                onChange={(e) => setRole(e.target.value as UserRole)}
                className="w-full p-3 bg-gray-900 border border-gray-600 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-gray-200"
            >
                <option value="User">User</option>
                <option value="Manager">Manager</option>
            </select>
          </div>
        </div>
        
        {error && <p className="text-red-400 text-sm text-center mt-4">{error}</p>}
        {success && <p className="text-green-400 text-sm text-center mt-4">{success}</p>}

        <div className="mt-6">
          <button
            type="submit"
            disabled={isLoading || !!success}
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
