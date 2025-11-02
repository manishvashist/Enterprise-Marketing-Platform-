
// This is a simulated authentication service that uses localStorage to mimic a user database and session management.
// In a real application, these methods would make API calls to a secure backend server.

import { User, UserRole, ConnectedAccount } from '../types';
import { initialChannelConnections } from '../data/channels';
import { databaseService } from './databaseService';

const SESSION_KEY = 'marketing_app_session';

export const authService = {
  async register(data: { fullName: string; email: string; password: string; role: UserRole }): Promise<User> {
    const existingUser = await databaseService.findUserByEmail(data.email);
    if (existingUser) {
      throw new Error('An account with this email already exists.');
    }
    
    // Create the user with trial data
    const newUser = await databaseService.createUser({
      ...data,
      channelConnections: JSON.parse(JSON.stringify(initialChannelConnections)), // Deep copy
    });
    
    return newUser;
  },

  async login(email: string, password: string): Promise<User> {
    const user = await databaseService.findUserByEmail(email);

    // In a real app, password comparison would be async (bcrypt.compare)
    const isPasswordCorrect = user ? user.passwordHash === `hashed_${password}_somesalt` : false;

    if (!user || !isPasswordCorrect) {
      throw new Error('Invalid email or password.');
    }

    // Simulate creating a JWT. In a real app, this would be a signed token from the server.
    const sessionToken = btoa(JSON.stringify({ userId: user.id, email: user.email, role: user.role, expires: Date.now() + 86400000 }));
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
        // Simulate token expiration check
        if (payload.expires < Date.now()) {
            this.logout();
            return null;
        }

        return await databaseService.findUserById(payload.userId);
    } catch (e) {
        // Invalid token
        this.logout();
        return null;
    }
  },

  async updateUserConnection(userId: string, channelId: string, account: ConnectedAccount | null): Promise<User | null> {
    const user = await databaseService.findUserById(userId);
    if (!user) {
        console.error("User not found for update");
        return null;
    }

    const updatedUser = { ...user };
    
    if (!updatedUser.channelConnections[channelId]) {
        console.error("Channel config not found for user");
        return null;
    }
    
    if (account) {
        updatedUser.channelConnections[channelId].connectionStatus = 'connected';
        updatedUser.channelConnections[channelId].connectedAccount = account;
    } else {
        updatedUser.channelConnections[channelId].connectionStatus = 'disconnected';
        updatedUser.channelConnections[channelId].connectedAccount = null;
    }
    
    return await databaseService.updateUser(updatedUser);
  }
};
