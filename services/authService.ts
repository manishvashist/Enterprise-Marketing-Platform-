


import { User, ConnectedAccount, AuthProvider } from '../types';
import { databaseService } from './databaseService';
import { supabase } from './supabaseClient';
import { initialChannelConnections } from '../data/channels';

// Helper to construct the full User object by combining Supabase auth data and our profile data
const getFullUser = async (supabaseUser: import('@supabase/supabase-js').User): Promise<User | null> => {
  if (!supabase) throw new Error("Supabase is not configured.");
  let profile = await databaseService.getProfile(supabaseUser.id);
  
  if (!profile) {
    // Profile doesn't exist, let's create it. This is crucial for first-time social logins
    // or if the DB trigger failed for any reason.
    console.warn(`Profile for user ${supabaseUser.id} not found. Creating one.`);
    try {
        const trialEndDate = new Date();
        trialEndDate.setDate(trialEndDate.getDate() + 7); // 7-day trial

        const newProfileData: Partial<User> = {
            id: supabaseUser.id,
            fullName: supabaseUser.user_metadata?.full_name || supabaseUser.email?.split('@')[0] || 'New User',
            email: supabaseUser.email!,
            role: 'User',
            authProvider: (supabaseUser.app_metadata?.provider as AuthProvider) || 'email',
            channelConnections: initialChannelConnections,
            accountStatus: 'trial',
            trialStartDate: new Date().toISOString(),
            trialEndDate: trialEndDate.toISOString(),
            trialCampaignsUsed: 0,
            activeSubscription: null,
        };
        profile = await databaseService.createProfile(newProfileData);

        if (!profile) {
            throw new Error("Profile creation returned null.");
        }

    } catch (creationError) {
        console.error("Failed to create user profile on-the-fly:", creationError);
        throw creationError; // Re-throw the specific error from databaseService.
    }
  }

  // NEW CHECK: Ensure channel connections exist, even for profiles created by the trigger.
  // This makes the app more resilient if the trigger doesn't populate defaults.
  if (profile && (!profile.channelConnections || Object.keys(profile.channelConnections).length === 0)) {
      console.warn(`Profile for user ${profile.id} is missing channel connections. Populating with defaults.`);
      const updatedProfile = await databaseService.updateProfile(profile.id, { channelConnections: initialChannelConnections });
      if (updatedProfile) {
          profile = updatedProfile;
      }
  }
  
  // Merge data from Supabase Auth and our public profiles table
  const fullUser: User = {
    ...profile,
    email: supabaseUser.email || profile.email, // Always prefer the verified email from Supabase
    createdAt: supabaseUser.created_at || profile.createdAt,
    lastLogin: supabaseUser.last_sign_in_at || profile.lastLogin,
  };
  return fullUser;
};

export const authService = {
  async register(data: { fullName: string; email: string; password: string; }): Promise<void> {
    if (!supabase) throw new Error("Supabase is not configured.");
    const { data: authData, error } = await supabase.auth.signUp({
      email: data.email,
      password: data.password,
      options: {
        data: {
          full_name: data.fullName,
          // A trigger in Supabase will use this to create the user's profile in the database
        },
        emailRedirectTo: window.location.origin,
      }
    });

    if (error) {
      throw new Error(error.message);
    }
    if (!authData.user) {
      throw new Error("Registration succeeded but no user was returned.");
    }
    // The onAuthStateChange listener in App.tsx will handle the user state.
  },

  async login(email: string, password: string): Promise<User> {
    if (!supabase) throw new Error("Supabase is not configured.");
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) throw new Error(error.message);
    if (!data.user) throw new Error("Login failed, please try again.");
    
    const user = await getFullUser(data.user);
    if (!user) throw new Error("Could not retrieve user profile after login.");
    
    return user;
  },

  // FIX: Updated provider type to exclude 'email' as it's not a valid OAuth provider for signInWithOAuth.
  // This resolves the TypeScript error where AuthProvider was not assignable to Supabase's Provider type.
  async loginWithProvider(provider: Exclude<AuthProvider, 'email'>): Promise<void> {
    if (!supabase) throw new Error("Supabase is not configured.");
    const { error } = await supabase.auth.signInWithOAuth({
      provider: provider,
      options: {
        redirectTo: window.location.origin,
      }
    });

    if (error) {
      throw new Error(`Failed to sign in with ${provider}: ${error.message}`);
    }
    // Supabase redirects, so the user object will be handled by onAuthStateChange in App.tsx
  },

  async logout(): Promise<void> {
    if (!supabase) throw new Error("Supabase is not configured.");
    const { error } = await supabase.auth.signOut();
    if (error) {
        console.error("Error logging out:", error.message);
        throw new Error(error.message);
    }
  },

  async getCurrentUser(): Promise<User | null> {
    if (!supabase) return null; // Return null if not configured, as this is called on init
    const { data: { session }, error } = await supabase.auth.getSession();
    if (error) {
      console.error("Error fetching session:", error.message);
      return null;
    }
    if (!session?.user) {
      return null;
    }
    
    return await getFullUser(session.user);
  },

  async updateUserConnection(userId: string, channelId: string, account: ConnectedAccount | null): Promise<User | null> {
    if (!supabase) throw new Error("Supabase is not configured.");
    const user = await databaseService.getProfile(userId);
    if (!user) return null;

    const updatedConnections = { ...user.channelConnections };
    
    if (account) {
        updatedConnections[channelId].connectionStatus = 'connected';
        updatedConnections[channelId].connectedAccount = account;
    } else {
        updatedConnections[channelId].connectionStatus = 'disconnected';
        updatedConnections[channelId].connectedAccount = null;
    }
    
    return await databaseService.updateProfile(userId, { channelConnections: updatedConnections });
  },

  async updateProfile(userId: string, updates: { fullName?: string; email?: string }): Promise<User> {
    if (!supabase) throw new Error("Supabase is not configured.");
    if (updates.email) {
      const { error } = await supabase.auth.updateUser({ email: updates.email });
      if (error) throw new Error(error.message);
    }

    if (updates.fullName) {
       await databaseService.updateProfile(userId, { fullName: updates.fullName });
    }
    
    const updatedUser = await this.getCurrentUser();
    if (!updatedUser) throw new Error("Failed to fetch updated user profile.");
    return updatedUser;
  },

  async changePassword(userId: string, currentPassword: string, newPassword: string): Promise<void> {
    if (!supabase) throw new Error("Supabase is not configured.");
    
    // 1. First, verify the current password is correct by trying to sign in.
    // This makes the feature behave as the user expects and refreshes the session.
    const { data: { user } } = await supabase.auth.getUser();
    if (!user || !user.email) {
        throw new Error("User not found or email is missing. Cannot verify password.");
    }

    const { error: signInError } = await supabase.auth.signInWithPassword({
        email: user.email,
        password: currentPassword,
    });

    if (signInError) {
        // Provide a more specific error message for invalid credentials.
        if (signInError.message.includes('Invalid login credentials')) {
             throw new Error("The current password you entered is incorrect.");
        }
        throw new Error(`Password verification failed: ${signInError.message}`);
    }

    // 2. If verification is successful, update to the new password.
    const { error: updateError } = await supabase.auth.updateUser({ password: newPassword });
    if (updateError) {
        throw new Error(`Failed to update to new password: ${updateError.message}`);
    }
    
    // 3. Explicitly sign out to ensure onAuthStateChange is triggered and session is cleared.
    await this.logout();
  }
};