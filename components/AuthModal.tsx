import React, { useState, useEffect } from 'react';
import { ChannelConnection } from '../types';
import { getIcon } from './ChannelConnectionCard'; // Assuming getIcon is exported

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  channel: ChannelConnection;
  onAuthSuccess: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose, channel, onAuthSuccess }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      // Reset form on open
      setEmail('');
      setPassword('');
      setIsLoading(false);
      setError(null);
    }
  }, [isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    // Simulate API call for authentication
    await new Promise(resolve => setTimeout(resolve, 1500));

    // Simple validation for simulation purposes
    if (password === 'password123') {
        onAuthSuccess();
    } else {
        setError('Invalid credentials. Use "password123" to continue.');
        setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div 
        className="bg-gray-800 rounded-lg shadow-xl w-full max-w-md border border-gray-700 animate-fade-in-up"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-6 text-center border-b border-gray-700">
            <div className="w-16 h-16 flex items-center justify-center rounded-lg bg-gray-700 mx-auto mb-4">
                {getIcon(channel.channelId)}
            </div>
          <h2 className="text-xl font-bold text-white">Connect to {channel.channelName}</h2>
          <p className="text-gray-400 mt-1 text-sm">Enter your credentials to continue.</p>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6">
          <div className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-1">
                Email or Username
              </label>
              <input
                id="email"
                type="text"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                required
                className="w-full p-2 bg-gray-900 border border-gray-600 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-gray-200"
              />
            </div>
            <div>
              <label htmlFor="password"className="block text-sm font-medium text-gray-300 mb-1">
                Password
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                className="w-full p-2 bg-gray-900 border border-gray-600 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-gray-200"
              />
            </div>
          </div>
            
          {error && <p className="text-red-400 text-xs text-center mt-4">{error}</p>}

          <div className="mt-6">
            <button
              type="submit"
              disabled={isLoading}
              className="w-full px-6 py-2.5 bg-indigo-600 text-white font-semibold rounded-md hover:bg-indigo-700 disabled:bg-gray-600 disabled:cursor-not-allowed transition-all flex items-center justify-center"
            >
              {isLoading ? (
                <>
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Connecting...
                </>
              ) : 'Connect'}
            </button>
          </div>
        </form>

        <div className="p-4 bg-gray-900/50 border-t border-gray-700 text-right">
          <button
            onClick={onClose}
            disabled={isLoading}
            className="px-4 py-2 bg-gray-600 text-white font-semibold rounded-md hover:bg-gray-500 transition-colors text-sm disabled:opacity-50"
          >
            Cancel
          </button>
        </div>
      </div>
       <style>{`
        @keyframes fadeInTop {
            from { opacity: 0; transform: translateY(-20px); }
            to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in-up {
            animation: fadeInTop 0.3s ease-out forwards;
        }
    `}</style>
    </div>
  );
};
