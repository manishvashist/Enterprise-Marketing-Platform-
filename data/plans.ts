
import { SubscriptionPlan } from '../types';

export const initialSubscriptionPlans: Record<string, SubscriptionPlan> = {
    individual: {
        id: 'plan_ind_1',
        name: 'Individual',
        planCode: 'individual',
        monthlyPrice: 10,
        billingCycleMonths: 1,
        campaignQuota: 10,
        quotaPeriodDays: 30,
        annualPrice: 96,
        annualDiscountPercent: 20,
        isActive: true,
    },
    small_team: {
        id: 'plan_smt_1',
        name: 'Small Team',
        planCode: 'small_team',
        monthlyPrice: 20,
        billingCycleMonths: 1,
        campaignQuota: 25,
        quotaPeriodDays: 30,
        annualPrice: 192,
        annualDiscountPercent: 20,
        isActive: true,
    },
    agency: {
        id: 'plan_age_1',
        name: 'Agency',
        planCode: 'agency',
        monthlyPrice: 40,
        billingCycleMonths: 1,
        campaignQuota: 60,
        quotaPeriodDays: 30,
        annualPrice: 384,
        annualDiscountPercent: 20,
        isActive: true,
    }
};
