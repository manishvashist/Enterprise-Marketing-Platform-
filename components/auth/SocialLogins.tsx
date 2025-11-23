
import React, { useState } from 'react';
import { authService } from '../../services/authService';
import { AuthProvider, User } from '../../types';
import { GoogleIcon } from '../icons/GoogleIcon';
// Import other icons but they might be unused if we comment out providers
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

    // FIX: Tightened provider type to exclude 'email' to match authService.loginWithProvider signature.
    const handleLogin = async (provider: Exclude<AuthProvider, 'email'>) => {
        setIsLoading(provider);
        setError(null);
        try {
            await authService.loginWithProvider(provider);
            // onSocialLogin is no longer called here; onAuthStateChange handles it
        } catch (err) {
            setError(err instanceof Error ? err.message : `Failed to ${context.toLowerCase()} with ${provider}.`);
            setIsLoading(null);
        }
    };
    
    // Updated provider list to focus on Google as it is the enabled provider.
    // Uncomment others as you enable them in Firebase Console.
    const providers: { name: Exclude<AuthProvider, 'email'>; icon: React.ReactNode; displayName: string; }[] = [
        { name: 'google', icon: <GoogleIcon className="w-5 h-5" />, displayName: 'Google' },
        // { name: 'github', icon: <GitHubIcon className="w-5 h-5" />, displayName: 'GitHub' },
        // { name: 'azure', icon: <MicrosoftIcon className="w-5 h-5" />, displayName: 'Microsoft' },
        // { name: 'facebook', icon: <FacebookIcon className="w-5 h-5" />, displayName: 'Facebook' },
    ];

    return (
        <div>
            <div className="grid grid-cols-1 gap-3">
                {providers.map(provider => (
                    <button
                        key={provider.name}
                        type="button"
                        onClick={() => handleLogin(provider.name)}
                        disabled={!!isLoading}
                        className="w-full inline-flex justify-center items-center py-2.5 px-4 border border-slate-200 rounded-md shadow-sm bg-white text-sm font-medium text-slate-600 hover:bg-slate-50 hover:text-slate-800 disabled:bg-slate-100 disabled:cursor-not-allowed transition-all"
                        aria-label={`${context} with ${provider.displayName}`}
                    >
                        {isLoading === provider.name ? (
                            <svg className="animate-spin h-5 w-5 text-orange-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                        ) : (
                            provider.icon
                        )}
                         <span className="ml-3 capitalize">{context} with {provider.displayName}</span>
                    </button>
                ))}
            </div>
            {error && <p className="text-red-500 text-sm text-center mt-3 bg-red-50 p-2 rounded border border-red-100">{error}</p>}
        </div>
    );
};
