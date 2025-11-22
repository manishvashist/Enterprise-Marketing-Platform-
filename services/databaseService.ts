

import { 
  doc, 
  getDoc, 
  setDoc, 
  updateDoc, 
  collection, 
  query, 
  where, 
  getDocs, 
  addDoc, 
  Timestamp,
  serverTimestamp
} from 'firebase/firestore';
import { db } from './firebaseClient';
import { User, Campaign, SubscriptionPlan, PlanCode, UserSubscription } from '../types';

// Hardcoded plans for the demo
const hardcodedPlans: SubscriptionPlan[] = [
  { id: 'plan_ind_1', name: 'Individual', planCode: 'individual', monthlyPrice: 10, billingCycleMonths: 1, campaignQuota: 10, quotaPeriodDays: 30, annualPrice: 96, annualDiscountPercent: 20, isActive: true },
  { id: 'plan_smt_1', name: 'Small Team', planCode: 'small_team', monthlyPrice: 20, billingCycleMonths: 1, campaignQuota: 25, quotaPeriodDays: 30, annualPrice: 192, annualDiscountPercent: 20, isActive: true },
  { id: 'plan_age_1', name: 'Agency', planCode: 'agency', monthlyPrice: 40, billingCycleMonths: 1, campaignQuota: 60, quotaPeriodDays: 30, annualPrice: 384, annualDiscountPercent: 20, isActive: true }
];

// --- HELPER FUNCTIONS FOR SCHEMA MAPPING ---

const toAppUser = (docId: string, data: any): User => {
  return {
    ...data,
    id: docId,
    // Map DB snake_case to App camelCase
    fullName: data.display_name || data.fullName || '', 
    createdAt: data.created_at?.toDate?.()?.toISOString() || data.created_at || new Date().toISOString(),
    lastLogin: data.last_login?.toDate?.()?.toISOString() || data.last_login || new Date().toISOString(),
    // Complex objects stored as maps in Firestore
    channelConnections: data.channel_connections || data.channelConnections || {},
    activeSubscription: data.subscription_details || data.activeSubscription || null,
    // Trial fields
    trialStartDate: data.trial_start_date || data.trialStartDate || null,
    trialEndDate: data.trial_end_date || data.trialEndDate || null,
    trialCampaignsUsed: data.trial_campaigns_used ?? data.trialCampaignsUsed ?? 0,
    accountStatus: data.account_status || data.accountStatus || 'trial',
  } as User;
};

const toDbUser = (user: Partial<User>) => {
  // Destructure known fields to handle them explicitly. 
  // We treat `...rest` carefully or avoid it to prevent passing undefined.
  const { id, fullName, createdAt, lastLogin, channelConnections, activeSubscription, trialStartDate, trialEndDate, trialCampaignsUsed, accountStatus, authProvider, role, email } = user;
  
  return {
    email: email || null,
    role: role || 'User',
    authProvider: authProvider || 'email',
    display_name: fullName || null,
    created_at: createdAt ? Timestamp.fromDate(new Date(createdAt)) : serverTimestamp(),
    last_login: lastLogin ? Timestamp.fromDate(new Date(lastLogin)) : serverTimestamp(),
    channel_connections: channelConnections || {},
    subscription_details: activeSubscription || null, // Ensure null, not undefined
    trial_start_date: trialStartDate || null,
    trial_end_date: trialEndDate || null,
    trial_campaigns_used: trialCampaignsUsed ?? 0,
    account_status: accountStatus || 'trial'
  };
};

const toAppCampaign = (docId: string, data: any): Campaign => {
  return {
    ...data,
    id: docId,
    userId: data.user_id,
    isDeleted: data.is_archived || false,
    createdAt: data.created_at?.toDate?.()?.toISOString(),
    updatedAt: data.updated_at?.toDate?.()?.toISOString(),
    mediaPlan: data.media_plan || undefined,
    mediaPlanInputs: data.media_plan_inputs || undefined,
    // Map other fields if necessary, mostly direct mapping for campaign content
  } as Campaign;
};

const toDbCampaign = (campaign: Partial<Campaign>) => {
  const { id, userId, isDeleted, createdAt, updatedAt, ...rest } = campaign;
  return {
    ...rest,
    user_id: userId,
    is_archived: isDeleted || false,
    media_plan: rest.mediaPlan || null,
    media_plan_inputs: rest.mediaPlanInputs || null,
    created_at: createdAt ? Timestamp.fromDate(new Date(createdAt)) : serverTimestamp(),
    updated_at: updatedAt ? Timestamp.fromDate(new Date(updatedAt)) : serverTimestamp(),
  };
};

export const databaseService = {
    // --- Profile Methods ---
    async getProfile(userId: string): Promise<User | null> {
        try {
            const docRef = doc(db, 'users', userId);
            const docSnap = await getDoc(docRef);
            if (docSnap.exists()) {
                return toAppUser(docSnap.id, docSnap.data());
            }
            return null;
        } catch (e) {
            console.error("Error fetching profile:", e);
            return null;
        }
    },

    async createProfile(profileData: Partial<User>): Promise<User | null> {
        if (!profileData.id) return null;
        try {
            const dbData = toDbUser({
                ...profileData,
                role: profileData.role || 'User',
                accountStatus: profileData.accountStatus || 'trial',
                trialCampaignsUsed: profileData.trialCampaignsUsed || 0,
            });
            
            await setDoc(doc(db, 'users', profileData.id), dbData, { merge: true });
            
            // Return the app-formatted user
            return this.getProfile(profileData.id);
        } catch (e) {
            console.error("Error creating profile:", e);
            throw e;
        }
    },

    async updateProfile(id: string, updates: Partial<User>): Promise<User | null> {
        try {
            // Only convert fields that are present in updates
            const dbUpdates: any = {};
            
            if (updates.fullName !== undefined) dbUpdates.display_name = updates.fullName;
            if (updates.email !== undefined) dbUpdates.email = updates.email;
            if (updates.lastLogin !== undefined) dbUpdates.last_login = Timestamp.fromDate(new Date(updates.lastLogin));
            if (updates.channelConnections !== undefined) dbUpdates.channel_connections = updates.channelConnections;
            
            // Handle null explicitely for subscription removal/update
            if (updates.activeSubscription !== undefined) {
                dbUpdates.subscription_details = updates.activeSubscription || null;
            }
            
            if (updates.accountStatus !== undefined) dbUpdates.account_status = updates.accountStatus;
            if (updates.trialCampaignsUsed !== undefined) dbUpdates.trial_campaigns_used = updates.trialCampaignsUsed;
            if (updates.trialStartDate !== undefined) dbUpdates.trial_start_date = updates.trialStartDate || null;
            if (updates.trialEndDate !== undefined) dbUpdates.trial_end_date = updates.trialEndDate || null;

            // Add updated_at if not present
            dbUpdates.updated_at = serverTimestamp();

            await updateDoc(doc(db, 'users', id), dbUpdates);
            return this.getProfile(id);
        } catch (e) {
            console.error("Error updating profile:", e);
            return null;
        }
    },
    
    // --- Campaign Methods ---
    async getCampaignsForUser(userId: string): Promise<Campaign[]> {
        try {
            const q = query(
                collection(db, 'campaigns'), 
                where('user_id', '==', userId),
                where('is_archived', '==', false) // Soft delete check
            );
            
            const querySnapshot = await getDocs(q);
            const campaigns: Campaign[] = [];
            querySnapshot.forEach((doc) => {
                campaigns.push(toAppCampaign(doc.id, doc.data()));
            });
            
            // Sort by updated date desc (client side sort as fallback or primary)
            return campaigns.sort((a, b) => new Date(b.updatedAt || 0).getTime() - new Date(a.updatedAt || 0).getTime());
        } catch (e) {
            console.error("Error fetching campaigns:", e);
            throw e;
        }
    },

    async saveCampaign(userId: string, campaignData: Campaign): Promise<Campaign> {
        try {
            const dbData = toDbCampaign({
                ...campaignData,
                userId,
                updatedAt: new Date().toISOString()
            });

            if (campaignData.id) {
                // Update existing
                await updateDoc(doc(db, 'campaigns', campaignData.id), dbData);
                return { ...campaignData, updatedAt: new Date().toISOString() }; // Return updated local object
            } else {
                // Create new (should use createCampaign usually, but handling here for safety)
                dbData.created_at = serverTimestamp();
                const docRef = await addDoc(collection(db, 'campaigns'), dbData);
                return { ...campaignData, id: docRef.id, userId, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() };
            }
        } catch (e) {
            console.error("Error saving campaign:", e);
            throw e;
        }
    },

     async createCampaign(campaignData: Omit<Campaign, 'id'>): Promise<Campaign> {
        try {
            const dbData = toDbCampaign({
                ...campaignData,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
            });
            
            const docRef = await addDoc(collection(db, 'campaigns'), dbData);
            
            return {
                ...campaignData,
                id: docRef.id,
                isDeleted: false,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
            } as Campaign;
        } catch (e) {
            console.error("Error creating campaign:", e);
            throw e;
        }
    },
    
    async softDeleteCampaign(campaignId: string): Promise<void> {
        try {
            await updateDoc(doc(db, 'campaigns', campaignId), {
                is_archived: true,
                updated_at: serverTimestamp()
            });
        } catch (e) {
            console.error("Error deleting campaign:", e);
            throw e;
        }
    },

    // --- Subscription Methods ---
    // NOTE: For a production app, subscription logic often lives in a separate 'subscriptions' collection
    // or strictly within the user document. We'll use a 'subscriptions' collection for history/management.

    async getSubscriptionPlans(): Promise<SubscriptionPlan[]> {
        return hardcodedPlans;
    },

    async findPlanByCode(planCode: PlanCode): Promise<SubscriptionPlan | null> {
        return hardcodedPlans.find(p => p.planCode === planCode) || null;
    },

    async getActiveSubscriptionForUser(userId: string): Promise<UserSubscription | null> {
        try {
            // Check user profile first as it is the fastest read
            const user = await this.getProfile(userId);
            if (user?.activeSubscription && ['active', 'past_due'].includes(user.activeSubscription.status)) {
                 // Re-attach plan object details in case they are missing
                const plan = hardcodedPlans.find(p => p.id === user.activeSubscription!.planId);
                return { ...user.activeSubscription, plan };
            }
            return null;
        } catch (e) {
            console.error("Error getting subscription:", e);
            return null;
        }
    },

    async createSubscription(subData: Omit<UserSubscription, 'id' | 'plan'>): Promise<UserSubscription> {
        try {
            const dbSubData = {
                ...subData,
                created_at: serverTimestamp()
            };
            
            const docRef = await addDoc(collection(db, 'subscriptions'), dbSubData);
            const plan = hardcodedPlans.find(p => p.id === subData.planId);
            
            return { ...subData, id: docRef.id, plan } as UserSubscription;
        } catch (e) {
            console.error("Error creating subscription record:", e);
            throw e;
        }
    },

    async updateSubscription(updatedSub: UserSubscription): Promise<UserSubscription> {
        // In this architecture, we mostly update the user's copy of the subscription
        // But if we have a standalone subscriptions collection, we should update that too.
        try {
            if (updatedSub.id) {
                const { plan, ...dataToSave } = updatedSub;
                await updateDoc(doc(db, 'subscriptions', updatedSub.id), dataToSave);
            }
            return updatedSub;
        } catch (e) {
             console.error("Error updating subscription record:", e);
             // Don't block UI if history update fails, main logic depends on User profile
             return updatedSub;
        }
    }
};