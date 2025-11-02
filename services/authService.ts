
// This is a simulated authentication service that uses localStorage to mimic a user database and session management.
// In a real application, these methods would make API calls to a secure backend server.

import { User, ConnectedAccount, AuthProvider } from '../types';
import { initialChannelConnections } from '../data/channels';
import { databaseService } from './databaseService';

const SESSION_KEY = 'marketing_app_session';

export const authService = {
  async register(data: { fullName: string; email: string; password: string; }): Promise<User> {
    const existingUser = await databaseService.findUserByEmail(data.email);
    if (existingUser) {
      throw new Error('An account with this email already exists.');
    }
    
    const newUser = await databaseService.createUser({
      ...data,
      authProvider: 'email',
      channelConnections: JSON.parse(JSON.stringify(initialChannelConnections)), // Deep copy
    });
    
    return newUser;
  },

  async login(email: string, password: string): Promise<User> {
    let user = await databaseService.findUserByEmail(email);

    const isPasswordCorrect = user ? user.passwordHash === `hashed_${password}_somesalt` : false;

    if (!user || !isPasswordCorrect) {
      throw new Error('Invalid email or password.');
    }
    
    // Update last login time
    user.lastLogin = new Date().toISOString();
    user = await databaseService.updateUser(user);

    // Simulate creating a JWT
    const sessionToken = btoa(JSON.stringify({ userId: user.id, email: user.email, expires: Date.now() + 86400000 }));
    localStorage.setItem(SESSION_KEY, sessionToken);

    return user;
  },

  async loginWithProvider(provider: AuthProvider): Promise<User> {
    // Simulate OAuth flow
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const mockEmail = `user.${provider}@example.com`;
    const mockName = `${provider.charAt(0).toUpperCase() + provider.slice(1)} User`;
    
    let user = await databaseService.findUserByEmail(mockEmail);

    if (!user) {
        user = await databaseService.createUser({
            fullName: mockName,
            email: mockEmail,
            authProvider: provider,
            channelConnections: JSON.parse(JSON.stringify(initialChannelConnections)),
        });
    }
    
    // Update last login time
    user.lastLogin = new Date().toISOString();
    user = await databaseService.updateUser(user);

    // Simulate creating a JWT
    const sessionToken = btoa(JSON.stringify({ userId: user.id, email: user.email, expires: Date.now() + 86400000 }));
    localStorage.setItem(SESSION_KEY, sessionToken);

    return user;
  },

  logout(): void {
    localStorage.removeItem(SESSION_KEY);
  },

  async getCurrentUser(): Promise<User | null> {
    const token = localStorage.getItem(SESSION_KEY);
    if (!token) {
      return null;
    }
    
    try {
        const payload = JSON.parse(atob(token));
        if (payload.expires < Date.now()) {
            this.logout();
            return null;
        }
        return await databaseService.findUserById(payload.userId);
    } catch (e) {
        this.logout();
        return null;
    }
  },

  async updateUserConnection(userId: string, channelId: string, account: ConnectedAccount | null): Promise<User | null> {
    const user = await databaseService.findUserById(userId);
    if (!user) return null;

    const updatedUser = { ...user };
    if (!updatedUser.channelConnections[channelId]) return null;
    
    if (account) {
        updatedUser.channelConnections[channelId].connectionStatus = 'connected';
        updatedUser.channelConnections[channelId].connectedAccount = account;
    } else {
        updatedUser.channelConnections[channelId].connectionStatus = 'disconnected';
        updatedUser.channelConnections[channelId].connectedAccount = null;
    }
    
    return await databaseService.updateUser(updatedUser);
  },

  async updateProfile(userId: string, updates: { fullName?: string; email?: string }): Promise<User> {
    return await databaseService.updateUserProfile(userId, updates);
  },

  async changePassword(userId: string, currentPassword: string, newPassword: string): Promise<void> {
    await databaseService.updateUserPassword(userId, currentPassword, newPassword);
  }
};
