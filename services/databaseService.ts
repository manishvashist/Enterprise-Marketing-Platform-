import { User, Campaign } from '../types';

// This is a simulated asynchronous database service that uses localStorage.
// It mimics network latency with a short delay.

const DB_KEY = 'EMP_DATABASE';
const SIMULATED_LATENCY_MS = 150;

interface Database {
    users: Record<string, User>; // key is email
    campaigns: Record<string, Campaign>; // key is campaignId
}

// In a real app, this would be a secure hashing function on the server.
const mockHash = (password: string): string => `hashed_${password}_somesalt`;

const _getDb = (): Database => {
    try {
        const dbString = localStorage.getItem(DB_KEY);
        if (dbString) {
            return JSON.parse(dbString);
        }
    } catch (e) {
        console.error("Failed to parse DB from localStorage", e);
    }
    // Return a default structure if DB doesn't exist or is corrupt
    return { users: {}, campaigns: {} };
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

    async createUser(data: { fullName: string; email: string; password: string; role: 'Admin' | 'Manager' | 'User'; channelConnections: Record<string, any> }): Promise<User> {
        await _simulateLatency();
        const db = _getDb();
        const normalizedEmail = data.email.toLowerCase();
        if (db.users[normalizedEmail]) {
            throw new Error('User already exists.');
        }

        const newUser: User = {
            id: `user_${Date.now()}`,
            fullName: data.fullName,
            email: normalizedEmail,
            passwordHash: mockHash(data.password),
            role: data.role,
            createdAt: new Date().toISOString(),
            channelConnections: data.channelConnections,
        };

        db.users[normalizedEmail] = newUser;
        _saveDb(db);
        return newUser;
    },
    
    async updateUser(updatedUser: User): Promise<User> {
        await _simulateLatency();
        const db = _getDb();
        if (!db.users[updatedUser.email]) {
            throw new Error("User not found for update.");
        }
        db.users[updatedUser.email] = updatedUser;
        _saveDb(db);
        return updatedUser;
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
            // Create new campaign
            const newCampaign: Campaign = {
                ...campaignData,
                id: `camp_${Date.now()}`,
                userId: userId,
                createdAt: now,
                updatedAt: now,
            };
            db.campaigns[newCampaign.id!] = newCampaign;
            _saveDb(db);
            return newCampaign;
        }
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
};
