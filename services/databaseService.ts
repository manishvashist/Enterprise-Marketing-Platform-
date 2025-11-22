

import { User, Campaign, SubscriptionPlan, PlanCode, UserSubscription } from '../types';
import { supabase } from './supabaseClient';

// --- Data Mapping Utilities ---

const mapDbProfileToUser = (dbProfile: any): User => {
    return {
        id: dbProfile.id,
        fullName: dbProfile.full_name,
        email: dbProfile.email,
        role: dbProfile.role,
        createdAt: dbProfile.created_at,
        lastLogin: dbProfile.last_login,
        authProvider: dbProfile.auth_provider,
        channelConnections: dbProfile.channel_connections,
        accountStatus: dbProfile.account_status,
        trialStartDate: dbProfile.trial_start_date,
        trialEndDate: dbProfile.trial_end_date,
        trialCampaignsUsed: dbProfile.trial_campaigns_used,
        activeSubscription: dbProfile.active_subscription,
    };
};

const mapUserToDbProfile = (user: Partial<User>): any => {
    const dbProfile: { [key: string]: any } = {};
    if (user.id) dbProfile.id = user.id;
    if (user.fullName) dbProfile.full_name = user.fullName;
    if (user.email) dbProfile.email = user.email;
    if (user.role) dbProfile.role = user.role;
    if (user.authProvider) dbProfile.auth_provider = user.authProvider;
    if (user.channelConnections) dbProfile.channel_connections = user.channelConnections;
    if (user.accountStatus) dbProfile.account_status = user.accountStatus;
    if (user.trialStartDate) dbProfile.trial_start_date = user.trialStartDate;
    if (user.trialEndDate) dbProfile.trial_end_date = user.trialEndDate;
    if (user.trialCampaignsUsed !== undefined) dbProfile.trial_campaigns_used = user.trialCampaignsUsed;
    if (user.activeSubscription !== undefined) dbProfile.active_subscription = user.activeSubscription;
    return dbProfile;
};

const mapDbCampaignToCampaign = (dbCampaign: any): Campaign => {
    return {
        id: dbCampaign.id,
        userId: dbCampaign.user_id,
        subscriptionId: dbCampaign.subscription_id,
        isTrialCampaign: dbCampaign.is_trial_campaign,
        isDeleted: dbCampaign.is_deleted,
        createdAt: dbCampaign.created_at,
        updatedAt: dbCampaign.updated_at,
        name: dbCampaign.name,
        description: dbCampaign.description,
        audienceQuery: dbCampaign.audience_query,
        estimatedSize: dbCampaign.estimated_size,
        keyAttributes: dbCampaign.key_attributes,
        kpis: dbCampaign.kpis,
        strategy: dbCampaign.strategy,
        governancePlan: dbCampaign.governance_plan,
        channelSelection: dbCampaign.channel_selection,
        channelAssets: dbCampaign.channel_assets,
        nodes: dbCampaign.nodes,
    };
};

const mapCampaignToDbCampaign = (campaign: Partial<Campaign>): any => {
    const dbCampaign: { [key: string]: any } = {};
    if (campaign.id !== undefined) dbCampaign.id = campaign.id;
    if (campaign.userId !== undefined) dbCampaign.user_id = campaign.userId;
    if (campaign.subscriptionId !== undefined) dbCampaign.subscription_id = campaign.subscriptionId;
    if (campaign.isTrialCampaign !== undefined) dbCampaign.is_trial_campaign = campaign.isTrialCampaign;
    if (campaign.isDeleted !== undefined) dbCampaign.is_deleted = campaign.isDeleted;
    if (campaign.createdAt !== undefined) dbCampaign.created_at = campaign.createdAt;
    if (campaign.updatedAt !== undefined) dbCampaign.updated_at = campaign.updatedAt;
    if (campaign.name !== undefined) dbCampaign.name = campaign.name;
    if (campaign.description !== undefined) dbCampaign.description = campaign.description;
    if (campaign.audienceQuery !== undefined) dbCampaign.audience_query = campaign.audienceQuery;
    if (campaign.estimatedSize !== undefined) dbCampaign.estimated_size = campaign.estimatedSize;
    if (campaign.keyAttributes !== undefined) dbCampaign.key_attributes = campaign.keyAttributes;
    if (campaign.kpis !== undefined) dbCampaign.kpis = campaign.kpis;
    if (campaign.strategy !== undefined) dbCampaign.strategy = campaign.strategy;
    if (campaign.governancePlan !== undefined) dbCampaign.governance_plan = campaign.governancePlan;
    if (campaign.channelSelection !== undefined) dbCampaign.channel_selection = campaign.channelSelection;
    if (campaign.channelAssets !== undefined) dbCampaign.channel_assets = campaign.channelAssets;
    if (campaign.nodes !== undefined) dbCampaign.nodes = campaign.nodes;
    return dbCampaign;
};

const mapDbPlanToPlan = (dbPlan: any): SubscriptionPlan => ({
    id: dbPlan.id,
    name: dbPlan.name,
    planCode: dbPlan.plan_code,
    monthlyPrice: dbPlan.monthly_price,
    billingCycleMonths: dbPlan.billing_cycle_months,
    campaignQuota: dbPlan.campaign_quota,
    quotaPeriodDays: dbPlan.quota_period_days,
    annualPrice: dbPlan.annual_price,
    annualDiscountPercent: dbPlan.annual_discount_percent,
    isActive: dbPlan.is_active,
});

const mapDbSubToSub = (dbSub: any): UserSubscription => ({
    id: dbSub.id,
    userId: dbSub.user_id,
    planId: dbSub.plan_id,
    plan: dbSub.subscription_plans ? mapDbPlanToPlan(dbSub.subscription_plans) : undefined,
    billingType: dbSub.billing_type,
    status: dbSub.status,
    startDate: dbSub.start_date,
    currentPeriodStart: dbSub.current_period_start,
    currentPeriodEnd: dbSub.current_period_end,
    nextBillingDate: dbSub.next_billing_date,
    cancellationDate: dbSub.cancellation_date,
    campaignsUsedCurrentPeriod: dbSub.campaigns_used_current_period,
    campaignQuota: dbSub.campaign_quota,
    quotaResetDate: dbSub.quota_reset_date,
    autoRenew: dbSub.auto_renew,
});

const mapSubToDbSub = (sub: Omit<UserSubscription, 'id' | 'plan'>): any => ({
    user_id: sub.userId,
    plan_id: sub.planId,
    billing_type: sub.billingType,
    status: sub.status,
    start_date: sub.startDate,
    current_period_start: sub.currentPeriodStart,
    current_period_end: sub.currentPeriodEnd,
    next_billing_date: sub.nextBillingDate,
    cancellation_date: sub.cancellationDate,
    campaigns_used_current_period: sub.campaignsUsedCurrentPeriod,
    campaign_quota: sub.campaignQuota,
    quota_reset_date: sub.quotaResetDate,
    auto_renew: sub.autoRenew,
});


export const databaseService = {
    // --- Profile Methods (replaces User methods) ---
    async getProfile(id: string): Promise<User | null> {
        if (!supabase) throw new Error("Supabase is not configured.");
        const { data, error } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', id)
            .single();

        if (error) {
            if (error.code === 'PGRST116') { // 'exact one row' error for non-existent profiles
                return null;
            }
            console.error("Error fetching profile:", error.message);
            if (error.message.includes("does not exist") || error.message.includes("schema cache")) {
                 throw new Error("Database setup incomplete: The 'profiles' table is missing. Please run the setup SQL script provided in the instructions.");
            }
            throw new Error(error.message); // Rethrow other unexpected errors
        }
        return data ? mapDbProfileToUser(data) : null;
    },

    async createProfile(profileData: Partial<User>): Promise<User | null> {
        if (!supabase) throw new Error("Supabase is not configured.");
        const dbProfile = mapUserToDbProfile(profileData);

        const { data, error } = await supabase
            .from('profiles')
            .insert([dbProfile])
            .select()
            .single();

        if (error) {
            if (error.message.includes("does not exist") || error.message.includes("schema cache")) {
                 throw new Error("Database setup incomplete: The 'profiles' table is missing. Please run the setup SQL script in your Supabase project's SQL Editor.");
            }
            console.error("Error creating profile:", error.message);
            throw new Error(error.message);
        }
        return data ? mapDbProfileToUser(data) : null;
    },

    async updateProfile(id: string, updates: Partial<User>): Promise<User | null> {
        if (!supabase) throw new Error("Supabase is not configured.");
        const dbUpdates = mapUserToDbProfile(updates);
        dbUpdates.updated_at = new Date().toISOString();
        
        const { data, error } = await supabase
            .from('profiles')
            .update(dbUpdates)
            .eq('id', id)
            .select()
            .single();
        
        if (error) {
            console.error("Error updating profile:", error.message);
            throw new Error(error.message);
        }
        return data ? mapDbProfileToUser(data) : null;
    },
    
    // --- Campaign Methods ---
    async getCampaignsForUser(userId: string): Promise<Campaign[]> {
        if (!supabase) throw new Error("Supabase is not configured.");
        const { data, error } = await supabase
            .from('campaigns')
            .select('*')
            .eq('user_id', userId)
            .order('updated_at', { ascending: false });

        if (error) {
            console.error('Error fetching campaigns:', error.message);
            throw new Error(error.message);
        }
        return (data || []).map(mapDbCampaignToCampaign);
    },

    async saveCampaign(userId: string, campaignData: Campaign): Promise<Campaign> {
        if (!supabase) throw new Error("Supabase is not configured.");
        
        const dbCampaign = mapCampaignToDbCampaign(campaignData);
        dbCampaign.updated_at = new Date().toISOString();

        if (campaignData.id) {
            // Update existing campaign
            const { id, ...updateData } = dbCampaign;
            const { data, error } = await supabase
                .from('campaigns')
                .update(updateData)
                .eq('id', campaignData.id)
                .select()
                .single();
            
            if (error) {
                console.error('Error updating campaign:', error.message);
                throw new Error(error.message);
            }
            return mapDbCampaignToCampaign(data);

        } else {
            // This path is for creating a new campaign after generation
            dbCampaign.user_id = userId;
             const { data, error } = await supabase
                .from('campaigns')
                .insert([dbCampaign])
                .select()
                .single();
            
            if (error) {
                console.error('Error creating campaign:', error.message);
                throw new Error(error.message);
            }
            return mapDbCampaignToCampaign(data);
        }
    },
     async createCampaign(campaignData: Omit<Campaign, 'id'>): Promise<Campaign> {
        if (!supabase) throw new Error("Supabase is not configured.");
        const dbCampaign = mapCampaignToDbCampaign(campaignData);
        const { data, error } = await supabase
            .from('campaigns')
            .insert([dbCampaign])
            .select()
            .single();
            
        if (error) {
            console.error('Error creating campaign:', error.message);
            throw new Error(error.message);
        }
        return mapDbCampaignToCampaign(data);
    },
    
    async softDeleteCampaign(campaignId: string): Promise<void> {
        if (!supabase) throw new Error("Supabase is not configured.");
        const { error } = await supabase
            .from('campaigns')
            .update({ is_deleted: true, updated_at: new Date().toISOString() })
            .eq('id', campaignId);
        
        if (error) {
            console.error('Error soft-deleting campaign:', error.message);
            throw new Error(error.message);
        }
    },

    // --- Subscription Methods ---
    async getSubscriptionPlans(): Promise<SubscriptionPlan[]> {
        if (!supabase) throw new Error("Supabase is not configured.");
        const { data, error } = await supabase
            .from('subscription_plans')
            .select('*')
            .eq('is_active', true)
            .order('monthly_price', { ascending: true });
        
        if (error) {
            console.error("Error fetching subscription plans:", error.message);
            throw new Error(error.message);
        }
        return data.map(mapDbPlanToPlan);
    },

    async findPlanByCode(planCode: PlanCode): Promise<SubscriptionPlan | null> {
        if (!supabase) throw new Error("Supabase is not configured.");
        const { data, error } = await supabase
            .from('subscription_plans')
            .select('*')
            .eq('plan_code', planCode)
            .single();
        
        if (error) {
            if (error.code === 'PGRST116') return null; // Not found is not an error
            console.error(`Error finding plan by code ${planCode}:`, error.message);
            throw new Error(error.message);
        }
        return data ? mapDbPlanToPlan(data) : null;
    },

    async getActiveSubscriptionForUser(userId: string): Promise<UserSubscription | null> {
         if (!supabase) throw new Error("Supabase is not configured.");
        const { data, error } = await supabase
            .from('user_subscriptions')
            .select('*, subscription_plans(*)') // Join with plans
            .eq('user_id', userId)
            .in('status', ['active', 'past_due'])
            .single();

        if (error) {
            if (error.code === 'PGRST116') return null; // Not found is not an error
            console.error(`Error fetching active sub for user ${userId}:`, error.message);
            throw new Error(error.message);
        }
        return data ? mapDbSubToSub(data) : null;
    },

    async createSubscription(subData: Omit<UserSubscription, 'id' | 'plan'>): Promise<UserSubscription> {
        if (!supabase) throw new Error("Supabase is not configured.");
        const dbSubData = mapSubToDbSub(subData);
        const { data, error } = await supabase
            .from('user_subscriptions')
            .insert([dbSubData])
            .select('*, subscription_plans(*)')
            .single();

        if (error) {
            console.error('Error creating subscription:', error.message);
            throw new Error(error.message);
        }
        return mapDbSubToSub(data);
    },

    async updateSubscription(updatedSub: UserSubscription): Promise<UserSubscription> {
        if (!supabase) throw new Error("Supabase is not configured.");
        const { id, plan, ...subData } = updatedSub;
        const dbSubData = mapSubToDbSub(subData as Omit<UserSubscription, 'id' | 'plan'>);
        
        const { data, error } = await supabase
            .from('user_subscriptions')
            .update(dbSubData)
            .eq('id', id)
            .select('*, subscription_plans(*)')
            .single();
        
        if (error) {
            console.error('Error updating subscription:', error.message);
            throw new Error(error.message);
        }
        return mapDbSubToSub(data);
    }
};