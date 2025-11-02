
import React, { useState } from 'react';
import { authService } from '../../services/authService';
import { AuthProvider, User } from '../../types';
import { GoogleIcon } from '../icons/GoogleIcon';
import { GitHubIcon } from '../icons/GitHubIcon';
import { MicrosoftIcon } from '../icons/MicrosoftIcon';
import { FacebookIcon } from '../icons/FacebookIcon';

interface SocialLoginsProps {
    onSocialLogin: (user: User) => void;
    context: 'Sign in' | 'Sign up';
}

export const SocialLogins: React.FC<SocialLoginsProps> = ({ onSocialLogin, context }) => {
    const [isLoading, setIsLoading] = useState<AuthProvider | null>(null);
    const [error, setError] = useState<string | null>(null);

    const handleLogin = async (provider: AuthProvider) => {
        setIsLoading(provider);
        setError(null);
        try {
            const user = await authService.loginWithProvider(provider);
            onSocialLogin(user);
        } catch (err) {
            setError(err instanceof Error ? err.message : `Failed to ${context.toLowerCase()} with ${provider}.`);
            setIsLoading(null);
        }
    };
    
    const providers: { name: AuthProvider; icon: React.ReactNode; }[] = [
        { name: 'google', icon: <GoogleIcon className="w-5 h-5" /> },
        { name: 'github', icon: <GitHubIcon className="w-5 h-5" /> },
        { name: 'microsoft', icon: <MicrosoftIcon className="w-5 h-5" /> },
        { name: 'facebook', icon: <FacebookIcon className="w-5 h-5" /> },
    ];

    return (
        <div>
            <div className="grid grid-cols-2 gap-3">
                {providers.map(provider => (
                    <button
                        key={provider.name}
                        type="button"
                        onClick={() => handleLogin(provider.name)}
                        disabled={!!isLoading}
                        className="w-full inline-flex justify-center items-center py-2.5 px-4 border border-gray-600 rounded-md shadow-sm bg-gray-700 text-sm font-medium text-gray-300 hover:bg-gray-600 disabled:bg-gray-800 disabled:cursor-not-allowed"
                        aria-label={`${context} with ${provider.name}`}
                    >
                        {isLoading === provider.name ? (
                            <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                        ) : (
                            provider.icon
                        )}
                         <span className="ml-3 capitalize hidden sm:inline">{provider.name}</span>
                    </button>
                ))}
            </div>
            {error && <p className="text-red-400 text-sm text-center mt-3">{error}</p>}
        </div>
    );
};
