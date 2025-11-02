
import React from 'react';
import { SubscriptionPlan, BillingType } from '../../types';
import { CheckCircleIcon } from '../icons/CheckCircleIcon';

interface PricingTierCardProps {
    plan: SubscriptionPlan;
    billingType: BillingType;
    onSubscribe: () => void;
}

const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
    }).format(price);
};

export const PricingTierCard: React.FC<PricingTierCardProps> = ({ plan, billingType, onSubscribe }) => {
    const isAnnual = billingType === 'annual';
    const displayPrice = isAnnual ? plan.annualPrice / 12 : plan.monthlyPrice;
    const pricePeriod = isAnnual ? 'per month, billed annually' : 'per month';

    const getFeatureText = (plan: SubscriptionPlan) => {
        const campaigns = `${plan.campaignQuota} campaigns`;
        const period = `per ${plan.billingCycleMonths > 1 ? `${plan.billingCycleMonths} months` : 'month'}`;
        return `${campaigns} ${period}`;
    };

    return (
        <div className="bg-gray-800 rounded-lg p-6 border border-gray-700 flex flex-col hover:border-indigo-500/80 transition-all duration-300 shadow-lg">
            <h3 className="text-xl font-bold text-indigo-400">{plan.name}</h3>
            <p className="text-sm text-gray-400 mt-2 flex-grow">{plan.name === 'Pro' ? 'For individuals and small teams.' : plan.name === 'Pro Plus' ? 'For growing businesses.' : 'For large-scale enterprises.'}</p>
            
            <div className="my-6">
                <span className="text-4xl font-extrabold text-white">{formatPrice(displayPrice)}</span>
                <span className="text-gray-400">/{pricePeriod.split(',')[0]}</span>
                {isAnnual && <p className="text-xs text-gray-500">Billed as {formatPrice(plan.annualPrice)} per year</p>}
            </div>

            <ul className="space-y-3 text-sm text-gray-300">
                <li className="flex items-center">
                    <CheckCircleIcon className="w-5 h-5 text-green-400 mr-3 flex-shrink-0" />
                    <span>{getFeatureText(plan)}</span>
                </li>
                <li className="flex items-center">
                    <CheckCircleIcon className="w-5 h-5 text-green-400 mr-3 flex-shrink-0" />
                    <span>Full Feature Access</span>
                </li>
                 <li className="flex items-center">
                    <CheckCircleIcon className="w-5 h-5 text-green-400 mr-3 flex-shrink-0" />
                    <span>Standard Support</span>
                </li>
            </ul>

            <button
                onClick={onSubscribe}
                className="w-full mt-8 px-6 py-3 bg-indigo-600 text-white font-semibold rounded-md hover:bg-indigo-700 transition-colors"
            >
                Choose Plan
            </button>
        </div>
    );
};
