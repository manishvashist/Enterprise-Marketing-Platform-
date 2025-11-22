import React, { useState, useMemo } from 'react';
import { User } from '../../types';
import { authService } from '../../services/authService';

interface ProfileSettingsProps {
    user: User;
    onUserUpdate: (user: User) => void;
    onSetGlobalSuccess: (message: string | null) => void;
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

export const ProfileSettings: React.FC<ProfileSettingsProps> = ({ user, onUserUpdate, onSetGlobalSuccess }) => {
    const [fullName, setFullName] = useState(user.fullName);
    const [email, setEmail] = useState(user.email);
    const [isProfileLoading, setIsProfileLoading] = useState(false);
    const [profileError, setProfileError] = useState<string | null>(null);

    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [isPasswordLoading, setIsPasswordLoading] = useState(false);
    const [passwordError, setPasswordError] = useState<string | null>(null);

    const strength = useMemo(() => passwordStrength(newPassword), [newPassword]);
    const passwordMatch = useMemo(() => newPassword && newPassword === confirmPassword, [newPassword, confirmPassword]);

    const handleProfileUpdate = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsProfileLoading(true);
        setProfileError(null);
        onSetGlobalSuccess(null); // Clear previous success messages
        try {
            const updatedUser = await authService.updateProfile(user.id, { fullName, email });
            onUserUpdate(updatedUser);
            onSetGlobalSuccess('Profile updated successfully!');
        } catch (err) {
            setProfileError(err instanceof Error ? err.message : 'Failed to update profile.');
        } finally {
            setIsProfileLoading(false);
        }
    };

    const handlePasswordChange = async (e: React.FormEvent) => {
        e.preventDefault();
        setPasswordError(null);
        onSetGlobalSuccess(null);

        if(strength < 4) {
            setPasswordError('New password is too weak.');
            return;
        }
        if(!passwordMatch) {
            setPasswordError('New passwords do not match.');
            return;
        }

        setIsPasswordLoading(true);
        try {
            await authService.changePassword(user.id, currentPassword, newPassword);
            onSetGlobalSuccess('Password changed successfully! You have been logged out for security. Please log in again.');
            // No need to reset loading state to false; the component will unmount upon logout.
        } catch (err) {
            setPasswordError(err instanceof Error ? err.message : 'Failed to change password.');
            setIsPasswordLoading(false); // Reset loading state only on error.
        }
    };

    return (
        <div className="space-y-12">
            {/* Account Information */}
            <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm">
                <h3 className="text-lg font-bold text-slate-900 mb-4">Account Information</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                    <InfoItem label="Account Created" value={new Date(user.createdAt).toLocaleDateString()} />
                    <InfoItem label="Last Login" value={new Date(user.lastLogin).toLocaleString()} />
                    <InfoItem label="Authentication Method" value={user.authProvider} isCapitalized />
                </div>
            </div>
            
            {/* Profile Details Form */}
            <form onSubmit={handleProfileUpdate} className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm">
                <h3 className="text-lg font-bold text-slate-900 mb-4">Profile Details</h3>
                <div className="space-y-4">
                    <InputField label="Full Name" id="fullName" value={fullName} onChange={e => setFullName(e.target.value)} />
                    <InputField label="Email Address" id="email" type="email" value={email} onChange={e => setEmail(e.target.value)} />
                </div>
                 {profileError && <p className={`text-sm text-center mt-4 text-red-600`}>{profileError}</p>}
                <div className="mt-6 text-right">
                    <button type="submit" disabled={isProfileLoading} className="px-5 py-2 bg-indigo-600 text-white font-semibold rounded-md hover:bg-indigo-700 disabled:bg-slate-300 disabled:cursor-not-allowed transition-colors shadow-sm">
                        {isProfileLoading ? 'Saving...' : 'Save Changes'}
                    </button>
                </div>
            </form>

            {/* Change Password Form */}
            {user.authProvider === 'email' && (
                <form onSubmit={handlePasswordChange} className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm">
                    <h3 className="text-lg font-bold text-slate-900 mb-4">Change Password</h3>
                    <div className="space-y-4">
                        <InputField label="Current Password" id="currentPassword" type="password" value={currentPassword} onChange={e => setCurrentPassword(e.target.value)} />
                        <div>
                            <InputField label="New Password" id="newPassword" type="password" value={newPassword} onChange={e => setNewPassword(e.target.value)} />
                            {newPassword.length > 0 && (
                                <div className="flex items-center mt-2">
                                    <div className="w-full bg-slate-200 rounded-full h-1.5 mr-2">
                                        <div className={`h-1.5 rounded-full ${strength <= 2 ? 'bg-red-500' : strength <= 4 ? 'bg-yellow-500' : 'bg-green-500'}`} style={{ width: `${strength * 20}%` }}></div>
                                    </div>
                                    <span className="text-xs text-slate-500">{['Weak', 'Weak', 'Medium', 'Medium', 'Strong', 'Very Strong'][strength]}</span>
                                </div>
                            )}
                        </div>
                        <InputField label="Confirm New Password" id="confirmPassword" type="password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)}
                         className={`${confirmPassword.length > 0 ? (passwordMatch ? 'border-green-500 focus:border-green-500' : 'border-red-500 focus:border-red-500') : 'border-slate-300'}`} />
                    </div>
                     {passwordError && <p className={`text-sm text-center mt-4 text-red-600`}>{passwordError}</p>}
                    <div className="mt-6 text-right">
                        <button type="submit" disabled={isPasswordLoading} className="px-5 py-2 bg-indigo-600 text-white font-semibold rounded-md hover:bg-indigo-700 disabled:bg-slate-300 disabled:cursor-not-allowed transition-colors shadow-sm">
                            {isPasswordLoading ? 'Updating...' : 'Change Password'}
                        </button>
                    </div>
                </form>
            )}
        </div>
    );
};


const InfoItem: React.FC<{ label: string; value: string; isCapitalized?: boolean; }> = ({ label, value, isCapitalized }) => (
    <div className="bg-slate-50 p-3 rounded-md border border-slate-200">
        <p className="text-xs text-slate-500">{label}</p>
        <p className={`font-semibold text-slate-800 ${isCapitalized ? 'capitalize' : ''}`}>{value}</p>
    </div>
);

const InputField: React.FC<React.InputHTMLAttributes<HTMLInputElement> & { label: string; id: string; }> = ({ label, id, ...props }) => (
    <div>
        <label htmlFor={id} className="block text-sm font-medium text-slate-700 mb-1">{label}</label>
        <input
            id={id}
            {...props}
            className={`w-full p-2 bg-white border border-slate-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-slate-900 placeholder-slate-400 shadow-sm transition-all ${props.className || ''}`}
        />
    </div>
);