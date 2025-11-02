
import { User, Campaign, SubscriptionPlan, PlanCode, UserSubscription, BillingType, AuthProvider } from '../types';
import { initialSubscriptionPlans } from '../data/plans';

// This is a simulated asynchronous database service that uses localStorage.
// It mimics network latency with a short delay.

const DB_KEY = 'EMP_DATABASE_V2';
const SIMULATED_LATENCY_MS = 100;

interface Database {
    users: Record<string, User>; // key is email
    campaigns: Record<string, Campaign>; // key is campaignId
    subscription_plans: Record<string, SubscriptionPlan>;
    user_subscriptions: Record<string, UserSubscription>;
}

// In a real app, this would be a secure hashing function on the server.
export const mockHash = (password: string): string => `hashed_${password}_somesalt`;

const _getDb = (): Database => {
    try {
        const dbString = localStorage.getItem(DB_KEY);
        if (dbString) {
            const parsed = JSON.parse(dbString);
            // Ensure all tables exist
            return {
                users: parsed.users || {},
                campaigns: parsed.campaigns || {},
                subscription_plans: parsed.subscription_plans || initialSubscriptionPlans,
                user_subscriptions: parsed.user_subscriptions || {}
            };
        }
    } catch (e) {
        console.error("Failed to parse DB from localStorage", e);
    }
    // Return a default structure if DB doesn't exist or is corrupt
    const defaultDb: Database = { 
        users: {}, 
        campaigns: {},
        subscription_plans: initialSubscriptionPlans,
        user_subscriptions: {},
    };
    _saveDb(defaultDb);
    return defaultDb;
};

const _saveDb = (db: Database): void => {
    localStorage.setItem(DB_KEY, JSON.stringify(db));
};

const _simulateLatency = (): Promise<void> => {
    return new Promise(resolve => setTimeout(resolve, SIMULATED_LATENCY_MS));
};


export const databaseService = {
    // --- User Methods ---
    async findUserByEmail(email: string): Promise<User | null> {
        await _simulateLatency();
        const db = _getDb();
        const normalizedEmail = email.toLowerCase();
        return db.users[normalizedEmail] || null;
    },

    async findUserById(id: string): Promise<User | null> {
        await _simulateLatency();
        const db = _getDb();
        return Object.values(db.users).find(u => u.id === id) || null;
    },

    async createUser(data: { fullName: string; email: string; password?: string; authProvider: AuthProvider; channelConnections: Record<string, any> }): Promise<User> {
        await _simulateLatency();
        const db = _getDb();
        const normalizedEmail = data.email.toLowerCase();
        if (db.users[normalizedEmail]) {
            throw new Error('User already exists.');
        }

        const now = new Date();
        const trialEndDate = new Date(now);
        trialEndDate.setDate(now.getDate() + 7);

        const newUser: User = {
            id: `user_${Date.now()}`,
            fullName: data.fullName,
            email: normalizedEmail,
            // Use provided password or a random one for OAuth users
            passwordHash: mockHash(data.password || `social_${Date.now()}`),
            role: 'User', // Assign default role
            createdAt: now.toISOString(),
            lastLogin: now.toISOString(),
            authProvider: data.authProvider,
            channelConnections: data.channelConnections,
            accountStatus: 'trial',
            trialStartDate: now.toISOString(),
            trialEndDate: trialEndDate.toISOString(),
            trialCampaignsUsed: 0,
            activeSubscription: null,
        };

        db.users[normalizedEmail] = newUser;
        _saveDb(db);
        return newUser;
    },
    
    async updateUser(updatedUser: User): Promise<User> {
        await _simulateLatency();
        const db = _getDb();
        if (!db.users[updatedUser.email]) {
            // Find by ID if email has changed
            const oldUser = Object.values(db.users).find(u => u.id === updatedUser.id);
            if(oldUser && oldUser.email !== updatedUser.email) {
                delete db.users[oldUser.email]; // remove old email key
            } else if (!oldUser) {
                throw new Error("User not found for update.");
            }
        }
        db.users[updatedUser.email] = updatedUser;
        _saveDb(db);
        return updatedUser;
    },

    async updateUserProfile(userId: string, updates: { fullName?: string; email?: string }): Promise<User> {
        await _simulateLatency();
        const db = _getDb();
        const user = await this.findUserById(userId);
        if(!user) throw new Error("User not found.");

        const updatedUser = { ...user, ...updates };
        
        // If email changed, we need to re-key the user in our mock DB
        if(updates.email && updates.email.toLowerCase() !== user.email) {
            delete db.users[user.email];
            if(db.users[updates.email.toLowerCase()]) {
                throw new Error("New email address is already in use.");
            }
            db.users[updates.email.toLowerCase()] = updatedUser;
        } else {
            db.users[user.email] = updatedUser;
        }

        _saveDb(db);
        return updatedUser;
    },

    async updateUserPassword(userId: string, currentPassword: string, newPassword: string): Promise<void> {
        await _simulateLatency();
        const db = _getDb();
        const user = await this.findUserById(userId);

        if(!user) throw new Error("User not found.");
        if(user.passwordHash !== mockHash(currentPassword)) {
            throw new Error("Incorrect current password.");
        }
        
        user.passwordHash = mockHash(newPassword);
        db.users[user.email] = user;
        _saveDb(db);
    },
    
    // --- Campaign Methods ---
    async getCampaignsForUser(userId: string): Promise<Campaign[]> {
        await _simulateLatency();
        const db = _getDb();
        return Object.values(db.campaigns)
            .filter(c => c.userId === userId)
            .sort((a, b) => new Date(b.updatedAt!).getTime() - new Date(a.updatedAt!).getTime());
    },

    async saveCampaign(userId: string, campaignData: Campaign): Promise<Campaign> {
        await _simulateLatency();
        const db = _getDb();
        const now = new Date().toISOString();
        
        if (campaignData.id && db.campaigns[campaignData.id]) {
            // Update existing campaign
            const updatedCampaign = {
                ...campaignData,
                updatedAt: now,
            };
            db.campaigns[campaignData.id] = updatedCampaign;
            _saveDb(db);
            return updatedCampaign;
        } else {
            // This path should ideally not be hit if we create campaign on generation
            const newCampaign: Campaign = {
                ...campaignData,
                id: campaignData.id || `camp_${Date.now()}`,
                userId: userId,
                createdAt: now,
                updatedAt: now,
            };
            db.campaigns[newCampaign.id!] = newCampaign;
            _saveDb(db);
            return newCampaign;
        }
    },
     async createCampaign(campaignData: Omit<Campaign, 'id'>): Promise<Campaign> {
        await _simulateLatency();
        const db = _getDb();
        const now = new Date().toISOString();
        
        const newCampaign: Campaign = {
            ...campaignData,
            id: `camp_${Date.now()}`,
            createdAt: now,
            updatedAt: now,
        };
        db.campaigns[newCampaign.id] = newCampaign;
        _saveDb(db);
        return newCampaign;
    },
    
    async deleteCampaign(campaignId: string): Promise<void> {
        await _simulateLatency();
        const db = _getDb();
        if (!db.campaigns[campaignId]) {
            throw new Error("Campaign not found.");
        }
        delete db.campaigns[campaignId];
        _saveDb(db);
    },

    // --- Subscription Methods ---
    async getSubscriptionPlans(): Promise<SubscriptionPlan[]> {
        await _simulateLatency();
        const db = _getDb();
        return Object.values(db.subscription_plans).filter(p => p.isActive);
    },

    async findPlanByCode(planCode: PlanCode): Promise<SubscriptionPlan | null> {
        await _simulateLatency();
        const db = _getDb();
        return Object.values(db.subscription_plans).find(p => p.planCode === planCode) || null;
    },

    async getActiveSubscriptionForUser(userId: string): Promise<UserSubscription | null> {
        await _simulateLatency();
        const db = _getDb();
        const subscriptions = Object.values(db.user_subscriptions)
            .filter(s => s.userId === userId && s.status === 'active')
            .sort((a, b) => new Date(b.startDate).getTime() - new Date(a.startDate).getTime());
        return subscriptions[0] || null;
    },

    async createSubscription(subData: Omit<UserSubscription, 'id' | 'plan'>): Promise<UserSubscription> {
        await _simulateLatency();
        const db = _getDb();
        const newSub: UserSubscription = {
            ...subData,
            id: `sub_${Date.now()}`,
        };
        db.user_subscriptions[newSub.id] = newSub;
        _saveDb(db);
        return newSub;
    },

    async updateSubscription(updatedSub: UserSubscription): Promise<UserSubscription> {
        await _simulateLatency();
        const db = _getDb();
        if (!db.user_subscriptions[updatedSub.id]) {
            throw new Error("Subscription not found for update.");
        }
        db.user_subscriptions[updatedSub.id] = updatedSub;
        _saveDb(db);
        return updatedSub;
    }
};
