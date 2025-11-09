
import { databaseService } from './databaseService';
// FIX: Import SubscriptionPlan to resolve 'Cannot find name' error.
import { User, Campaign, UsageInfo, PlanCode, BillingType, UserSubscription, SubscriptionPlan } from '../types';

export const subscriptionService = {
  async getSubscriptionForUser(userId: string): Promise<UserSubscription | null> {
    return await databaseService.getActiveSubscriptionForUser(userId);
  },

  async canGenerateCampaign(userId: string): Promise<{ canGenerate: boolean, reason: UsageInfo['reason'] }> {
    // FIX: Corrected method name from findUserById to getProfile.
    const user = await databaseService.getProfile(userId);
    if (!user) {
      throw new Error("User not found.");
    }

    if (user.accountStatus === 'trial') {
      const isExpired = new Date(user.trialEndDate!) < new Date();
      if (isExpired) {
        // Automatically expire the user's status if not already done by a cron job
        user.accountStatus = 'expired';
        // FIX: Corrected method name from updateUser to updateProfile and adjusted arguments.
        await databaseService.updateProfile(user.id, user);
        return { canGenerate: false, reason: 'trial_expired' };
      }
      if (user.trialCampaignsUsed < 1) {
        return { canGenerate: true, reason: 'trial' };
      }
      return { canGenerate: false, reason: 'quota_exceeded' };
    }

    if (user.accountStatus === 'active' && user.activeSubscription) {
      const sub = user.activeSubscription;
      if (sub.campaignsUsedCurrentPeriod < sub.campaignQuota) {
        return { canGenerate: true, reason: 'subscription' };
      }
      return { canGenerate: false, reason: 'quota_exceeded' };
    }

    return { canGenerate: false, reason: 'subscription_required' };
  },

  async createCampaignUsage(userId: string, campaignData: Omit<Campaign, 'id'|'userId'|'subscriptionId'|'isTrialCampaign'|'createdAt'|'updatedAt'>): Promise<Campaign> {
    // FIX: Corrected method name from findUserById to getProfile.
    const user = await databaseService.getProfile(userId);
    if (!user) throw new Error("User not found.");

    let updatedUser = { ...user };
    let isTrialCampaign = false;
    let subscriptionId: string | null = null;
    
    // Start Transaction
    if (user.accountStatus === 'trial') {
      updatedUser.trialCampaignsUsed += 1;
      isTrialCampaign = true;
    } else if (user.accountStatus === 'active' && user.activeSubscription) {
      const sub = { ...user.activeSubscription };
      sub.campaignsUsedCurrentPeriod += 1;
      await databaseService.updateSubscription(sub);
      updatedUser.activeSubscription = sub;
      subscriptionId = sub.id;
    } else {
        throw new Error("User is not eligible to create a campaign.");
    }
    
    // FIX: Corrected method name from updateUser to updateProfile and adjusted arguments.
    await databaseService.updateProfile(updatedUser.id, updatedUser);

    // FIX: Add createdAt and updatedAt to satisfy the type of createCampaign parameter.
    // The createCampaign method in databaseService has a slightly mismatched type signature where it expects
    // these fields but also overwrites them. This change resolves the compile error.
    const newCampaign = await databaseService.createCampaign({
        ...campaignData,
        userId: user.id,
        isTrialCampaign,
        subscriptionId,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
    });
    // End Transaction

    return newCampaign;
  },

  async getUsageInfo(userId: string): Promise<UsageInfo> {
    // FIX: Corrected method name from findUserById to getProfile.
    const user = await databaseService.getProfile(userId);
    if (!user) throw new Error("User not found.");

    if (user.accountStatus === 'trial') {
      const trialEndDate = new Date(user.trialEndDate!);
      const now = new Date();
      if (trialEndDate < now) {
         return { canGenerate: false, reason: 'trial_expired', remaining: 0, limit: 1 };
      }
      const trialDaysRemaining = Math.ceil((trialEndDate.getTime() - now.getTime()) / (1000 * 3600 * 24));
      const remaining = 1 - user.trialCampaignsUsed;
      return {
        canGenerate: remaining > 0,
        reason: remaining > 0 ? 'trial' : 'quota_exceeded',
        remaining,
        limit: 1,
        trialDaysRemaining,
      };
    }

    if (user.accountStatus === 'active' && user.activeSubscription) {
       const sub = user.activeSubscription;
       const remaining = sub.campaignQuota - sub.campaignsUsedCurrentPeriod;
       const resetDate = new Date(sub.quotaResetDate);
       const daysUntilReset = Math.ceil((resetDate.getTime() - new Date().getTime()) / (1000 * 3600 * 24));
       return {
            canGenerate: remaining > 0,
            reason: remaining > 0 ? 'subscription' : 'quota_exceeded',
            remaining,
            limit: sub.campaignQuota,
            daysUntilReset,
       };
    }
    
    // Default for expired, cancelled etc.
    return { canGenerate: false, reason: 'subscription_required', remaining: 0, limit: 0 };
  },

  async getAvailablePlans(): Promise<SubscriptionPlan[]> {
      return await databaseService.getSubscriptionPlans();
  },

  async createSubscription(userId: string, planCode: PlanCode, billingType: BillingType): Promise<User> {
      // FIX: Corrected method name from findUserById to getProfile.
      const user = await databaseService.getProfile(userId);
      const plan = await databaseService.findPlanByCode(planCode);

      if (!user) throw new Error("User not found.");
      if (!plan) throw new Error("Invalid plan selected.");
      if (user.activeSubscription && user.activeSubscription.status === 'active') {
        throw new Error("User already has an active subscription.");
      }

      const now = new Date();
      const periodEnd = new Date(now);
      const quotaResetDate = new Date(now);

      if (billingType === 'annual') {
          periodEnd.setFullYear(periodEnd.getFullYear() + 1);
      } else {
          periodEnd.setDate(periodEnd.getDate() + plan.quotaPeriodDays);
      }
      
      quotaResetDate.setDate(quotaResetDate.getDate() + plan.quotaPeriodDays); // Quota always resets monthly (based on plan's quotaPeriodDays)

      const newSubData: Omit<UserSubscription, 'id' | 'plan'> = {
        userId,
        planId: plan.id,
        billingType,
        status: 'active',
        startDate: now.toISOString(),
        currentPeriodStart: now.toISOString(),
        currentPeriodEnd: periodEnd.toISOString(),
        nextBillingDate: periodEnd.toISOString(),
        cancellationDate: null,
        campaignsUsedCurrentPeriod: 0,
        campaignQuota: plan.campaignQuota,
        quotaResetDate: quotaResetDate.toISOString(),
        autoRenew: true,
      };

      const newSub = await databaseService.createSubscription(newSubData);
      
      const updatedUser: User = {
          ...user,
          accountStatus: 'active',
          activeSubscription: newSub,
      };
      
      // FIX: Corrected method name from updateUser to updateProfile and adjusted arguments.
      return await databaseService.updateProfile(updatedUser.id, updatedUser);
  }
};