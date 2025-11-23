
import { 
    createUserWithEmailAndPassword, 
    signInWithEmailAndPassword, 
    signOut, 
    updateProfile, 
    sendEmailVerification, 
    sendPasswordResetEmail,
    onAuthStateChanged,
    User as FirebaseUser,
    GoogleAuthProvider,
    GithubAuthProvider,
    FacebookAuthProvider,
    OAuthProvider,
    signInWithPopup
} from "firebase/auth";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { auth, storage } from "./firebaseClient";
import { databaseService } from './databaseService';
import { User, ConnectedAccount, AuthProvider } from '../types';
import { initialChannelConnections } from '../data/channels';

export const authService = {
  async register(data: { fullName: string; email: string; password: string; photoFile?: File }): Promise<void> {
    try {
        // 1. Create User in Firebase Auth
        const userCredential = await createUserWithEmailAndPassword(auth, data.email, data.password);
        const firebaseUser = userCredential.user;

        let photoURL = "";

        // 2. Upload Photo if provided (Try/Catch to be safe if Storage isn't enabled)
        if (data.photoFile && storage) {
            try {
                const storageRef = ref(storage, `profile_photos/${firebaseUser.uid}`);
                await uploadBytes(storageRef, data.photoFile);
                photoURL = await getDownloadURL(storageRef);
            } catch (storageError) {
                console.warn("Profile photo upload failed (Storage might be disabled):", storageError);
            }
        }

        // 3. Update Firebase Profile
        await updateProfile(firebaseUser, {
            displayName: data.fullName,
            photoURL: photoURL || null
        });

        // 4. Create Local Profile
        const newProfile: Partial<User> = {
            id: firebaseUser.uid,
            email: data.email,
            fullName: data.fullName,
            authProvider: 'email',
            role: 'User',
            channelConnections: initialChannelConnections,
            accountStatus: 'trial',
            trialStartDate: new Date().toISOString(),
            trialEndDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days trial
            trialCampaignsUsed: 0
        };
        await databaseService.createProfile(newProfile);

        // 5. Send Verification Email
        await sendEmailVerification(firebaseUser);

        // 6. Sign Out immediately. User must not be logged in until verified.
        await signOut(auth);

    } catch (error: any) {
        console.error("Registration Error:", error);
        if (error.code === 'auth/email-already-in-use') {
            throw new Error('user already exists. Sign in?');
        }
        throw error;
    }
  },

  async login(email: string, password: string): Promise<User> {
    try {
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        const firebaseUser = userCredential.user;

        // 1. ENSURE PROFILE EXISTS FIRST
        // We do this BEFORE checking verification so that we don't end up with an authenticated
        // but profile-less user if the verification check throws.
        let userProfile = await databaseService.getProfile(firebaseUser.uid);
        if (!userProfile) {
             const newProfile: Partial<User> = {
                id: firebaseUser.uid,
                email: firebaseUser.email || email,
                fullName: firebaseUser.displayName || 'User',
                authProvider: 'email',
                role: 'User',
                channelConnections: initialChannelConnections,
                accountStatus: 'trial',
                trialStartDate: new Date().toISOString(),
                trialEndDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
                trialCampaignsUsed: 0
            };
            userProfile = await databaseService.createProfile(newProfile);
        }

        // 2. Reload user to get the latest emailVerified status
        await firebaseUser.reload();

        // 3. Check Verification
        if (!firebaseUser.emailVerified) {
            // Resend verification email to ensure user has it. 
            // Wrap in try/catch to avoid failing the flow if rate limited or network error occurs on resend.
            try {
                await sendEmailVerification(firebaseUser);
            } catch (emailError) {
                console.warn("Failed to resend verification email during login attempt:", emailError);
            }
            
            // DO NOT signOut here. If we signOut, the onAuthStateChanged listener in App.tsx
            // will receive null and redirect the user to the Landing Page.
            // We throw the error so LoginForm can handle it and show the Verification screen.
            throw new Error('EMAIL_NOT_VERIFIED');
        }

        return userProfile as User;

    } catch (error: any) {
        // Suppress console logging for expected flow control errors
        if (error.message !== 'EMAIL_NOT_VERIFIED') {
            console.error("Login Error:", error);
        }

        if (error.message === 'EMAIL_NOT_VERIFIED') {
            throw error;
        }
        if (error.code === 'auth/invalid-credential' || error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password' || error.code === 'auth/invalid-email') {
            throw new Error('Password or email incorrect');
        }
        throw error;
    }
  },

  async loginWithProvider(providerName: Exclude<AuthProvider, 'email'>): Promise<void> {
    try {
        let provider: any;
        switch (providerName) {
            case 'google': 
                provider = new GoogleAuthProvider(); 
                provider.addScope('profile');
                provider.addScope('email');
                break;
            case 'github': provider = new GithubAuthProvider(); break;
            case 'facebook': provider = new FacebookAuthProvider(); break;
            case 'azure': provider = new OAuthProvider('microsoft.com'); break;
            default: throw new Error(`Provider ${providerName} not supported`);
        }

        const result = await signInWithPopup(auth, provider);
        const firebaseUser = result.user;

        // Check/Create Profile
        let userProfile = await databaseService.getProfile(firebaseUser.uid);
        if (!userProfile) {
             const newProfile: Partial<User> = {
                id: firebaseUser.uid,
                email: firebaseUser.email || '',
                fullName: firebaseUser.displayName || `New ${providerName} User`,
                authProvider: providerName,
                role: 'User',
                channelConnections: initialChannelConnections,
                accountStatus: 'trial',
                trialStartDate: new Date().toISOString(),
                trialEndDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
                trialCampaignsUsed: 0
            };
            await databaseService.createProfile(newProfile);
        }

    } catch (error: any) {
        console.error("Social Login Error:", error);
        
        // Provide specific, helpful instructions for common auth errors
        if (error.code === 'auth/unauthorized-domain') {
            const hostname = window.location.hostname;
            throw new Error(`Domain unauthorized: "${hostname}". Add this domain to Firebase Console > Authentication > Settings > Authorized Domains.`);
        }
        if (error.code === 'auth/popup-closed-by-user') {
            throw new Error('Sign-in cancelled by user.');
        }
        if (error.code === 'auth/popup-blocked') {
            throw new Error('Sign-in popup was blocked by your browser. Please allow popups for this site.');
        }
        
        throw new Error(error.message || 'Social login failed. Please try again.');
    }
  },

  async logout(): Promise<void> {
    await signOut(auth);
  },

  async getCurrentUser(): Promise<User | null> {
    return new Promise((resolve) => {
        const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
            unsubscribe();
            if (firebaseUser) {
                // We fetch the profile regardless of verification status.
                // App.tsx will decide whether to let the user into the app or show the auth/verification screen.
                let profile = await databaseService.getProfile(firebaseUser.uid);
                
                // If profile is missing but auth is valid (e.g., cleared localStorage), recreate it.
                if (!profile) {
                    const newProfile: Partial<User> = {
                        id: firebaseUser.uid,
                        email: firebaseUser.email || '',
                        fullName: firebaseUser.displayName || 'User',
                        authProvider: 'email',
                        role: 'User',
                        channelConnections: initialChannelConnections,
                        accountStatus: 'trial',
                        trialStartDate: new Date().toISOString(),
                        trialEndDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
                        trialCampaignsUsed: 0
                    };
                    profile = await databaseService.createProfile(newProfile);
                }
                resolve(profile);
            } else {
                resolve(null);
            }
        });
    });
  },

  async updateUserConnection(userId: string, channelId: string, account: ConnectedAccount | null): Promise<User | null> {
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
    await databaseService.updateProfile(userId, updates);
    
    if (auth.currentUser && updates.fullName) {
        await updateProfile(auth.currentUser, { displayName: updates.fullName });
    }

    const updatedUser = await databaseService.getProfile(userId);
    if (!updatedUser) throw new Error("Failed to fetch updated user profile.");
    
    return updatedUser;
  },

  async changePassword(userId: string, currentPassword: string, newPassword: string): Promise<void> {
      if (auth.currentUser && auth.currentUser.email) {
          await sendPasswordResetEmail(auth, auth.currentUser.email);
      }
  },

  async sendPasswordResetEmail(email: string): Promise<void> {
      await sendPasswordResetEmail(auth, email);
  },

  onAuthStateChanged(callback: (user: User | null) => void): () => void {
      return onAuthStateChanged(auth, async (firebaseUser) => {
          if (firebaseUser) {
              // Always return profile, verification check moves to UI layer
              let profile = await databaseService.getProfile(firebaseUser.uid);
              if (!profile) {
                    const newProfile: Partial<User> = {
                        id: firebaseUser.uid,
                        email: firebaseUser.email || '',
                        fullName: firebaseUser.displayName || 'User',
                        authProvider: 'email',
                        role: 'User',
                        channelConnections: initialChannelConnections,
                        accountStatus: 'trial',
                        trialStartDate: new Date().toISOString(),
                        trialEndDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
                        trialCampaignsUsed: 0
                    };
                    profile = await databaseService.createProfile(newProfile);
              }
              callback(profile);
          } else {
              callback(null);
          }
      });
  }
};
