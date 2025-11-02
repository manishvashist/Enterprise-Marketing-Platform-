
import { SubscriptionPlan } from '../types';

export const initialSubscriptionPlans: Record<string, SubscriptionPlan> = {
    pro: {
        id: 'plan_pro_1',
        name: 'Pro',
        planCode: 'pro',
        monthlyPrice: 25,
        billingCycleMonths: 1,
        campaignQuota: 25,
        quotaPeriodDays: 30,
        annualPrice: 270,
        annualDiscountPercent: 10,
        isActive: true,
    },
    pro_plus: {
        id: 'plan_pro_plus_1',
        name: 'Pro Plus',
        planCode: 'pro_plus',
        monthlyPrice: 40,
        billingCycleMonths: 2,
        campaignQuota: 50,
        quotaPeriodDays: 60,
        annualPrice: 216,
        annualDiscountPercent: 10,
        isActive: true,
    },
    elite: {
        id: 'plan_elite_1',
        name: 'Elite',
        planCode: 'elite',
        monthlyPrice: 75,
        billingCycleMonths: 3,
        campaignQuota: 100,
        quotaPeriodDays: 90,
        annualPrice: 270,
        annualDiscountPercent: 10,
        isActive: true,
    }
};
