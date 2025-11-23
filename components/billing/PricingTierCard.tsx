import React from 'react';
import { SubscriptionPlan, BillingType } from '../../types';
import { CheckCircleIcon } from '../icons/CheckCircleIcon';

interface PricingTierCardProps {
    plan: SubscriptionPlan;
    billingType: BillingType;
    onSubscribe: () => void;
    isMostPopular?: boolean;
}

const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
    }).format(price);
};

export const PricingTierCard: React.FC<PricingTierCardProps> = ({ plan, billingType, onSubscribe, isMostPopular }) => {
    const isAnnual = billingType === 'annual';
    const displayPrice = isAnnual ? plan.annualPrice / 12 : plan.monthlyPrice;
    const pricePeriod = isAnnual ? 'per month, billed annually' : 'per month';

    const getFeatureText = (plan: SubscriptionPlan) => {
        const campaigns = `${plan.campaignQuota} campaigns`;
        const period = `per ${plan.billingCycleMonths > 1 ? `${plan.billingCycleMonths} months` : 'month'}`;
        return `${campaigns} ${period}`;
    };

    return (
        <div className={`bg-white rounded-xl p-6 border flex flex-col hover:shadow-xl transition-all duration-300 shadow-sm relative ${isMostPopular ? 'border-indigo-500 ring-1 ring-indigo-500 shadow-lg' : 'border-slate-200'}`}>
            {isMostPopular && (
                <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2">
                    <span className="bg-indigo-600 text-white text-xs font-bold px-4 py-1 rounded-full uppercase tracking-wider shadow-sm">Most Popular</span>
                </div>
            )}
            <h3 className="text-xl font-bold text-slate-900">{plan.name}</h3>
            <p className="text-sm text-slate-500 mt-2 flex-grow">{plan.name === 'Individual' ? 'For individuals and small teams.' : plan.name === 'Small Team' ? 'For growing businesses.' : 'For large-scale enterprises.'}</p>
            
            <div className="my-6">
                <span className="text-4xl font-extrabold text-slate-900">{formatPrice(displayPrice)}</span>
                <span className="text-slate-500">/{pricePeriod.split(',')[0]}</span>
                {isAnnual && <p className="text-xs text-slate-400 mt-1">Billed as {formatPrice(plan.annualPrice)} per year</p>}
            </div>

            <ul className="space-y-3 text-sm text-slate-600">
                <li className="flex items-center">
                    <CheckCircleIcon className="w-5 h-5 text-green-500 mr-3 flex-shrink-0" />
                    <span>{getFeatureText(plan)}</span>
                </li>
                <li className="flex items-center">
                    <CheckCircleIcon className="w-5 h-5 text-green-500 mr-3 flex-shrink-0" />
                    <span>Full Feature Access</span>
                </li>
                 <li className="flex items-center">
                    <CheckCircleIcon className="w-5 h-5 text-green-500 mr-3 flex-shrink-0" />
                    <span>Standard Support</span>
                </li>
            </ul>

            <button
                onClick={onSubscribe}
                className={`w-full mt-8 px-6 py-3 font-bold rounded-lg transition-colors shadow-sm ${isMostPopular ? 'bg-indigo-600 text-white hover:bg-indigo-700 hover:shadow-indigo-200' : 'bg-slate-100 text-slate-900 hover:bg-slate-200'}`}
            >
                Choose Plan
            </button>
        </div>
    );
};