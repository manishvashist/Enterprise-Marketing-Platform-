
import React, { useState } from 'react';
import { User, SubscriptionPlan, BillingType } from '../../types';
import { PricingTierCard } from './PricingTierCard';
import { PaymentModal } from './PaymentModal';

interface PricingPageProps {
    user: User;
    plans: SubscriptionPlan[];
    onSubscriptionChange: (updatedUser: User) => void;
}

export const PricingPage: React.FC<PricingPageProps> = ({ user, plans, onSubscriptionChange }) => {
    const [billingType, setBillingType] = useState<BillingType>('monthly');
    const [selectedPlan, setSelectedPlan] = useState<SubscriptionPlan | null>(null);
    const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
    
    const handleSubscribeClick = (plan: SubscriptionPlan) => {
        setSelectedPlan(plan);
        setIsPaymentModalOpen(true);
    };

    const handlePaymentSuccess = (updatedUser: User) => {
        onSubscriptionChange(updatedUser);
        setIsPaymentModalOpen(false);
        setSelectedPlan(null);
    };

    return (
        <div className="w-full">
            {/* Billing Cycle Toggle */}
            <div className="flex justify-center mb-10">
                <div className="relative flex items-center p-1 bg-slate-100 rounded-full border border-slate-200">
                    <button
                        onClick={() => setBillingType('monthly')}
                        className={`relative z-10 w-28 py-2 text-sm font-semibold rounded-full transition-colors ${billingType === 'monthly' ? 'text-slate-900' : 'text-slate-500 hover:text-slate-700'}`}
                    >
                        Monthly
                    </button>
                    <button
                        onClick={() => setBillingType('annual')}
                        className={`relative z-10 w-28 py-2 text-sm font-semibold rounded-full transition-colors ${billingType === 'annual' ? 'text-slate-900' : 'text-slate-500 hover:text-slate-700'}`}
                    >
                        Annual
                    </button>
                    <div
                        className={`absolute top-1 h-10 w-28 bg-white rounded-full shadow-sm border border-slate-200 transition-transform duration-300 ease-in-out ${
                            billingType === 'annual' ? 'transform translate-x-full' : ''
                        }`}
                        style={{ transform: billingType === 'annual' ? 'translateX(100%)' : 'translateX(0)' }}
                    ></div>
                </div>
                 <div className="ml-4 flex items-center">
                    <span className="text-xs font-bold text-emerald-700 bg-emerald-100 border border-emerald-200 px-3 py-1 rounded-full">Save 20%</span>
                </div>
            </div>

            {/* Pricing Tiers */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {plans.map(plan => (
                    <PricingTierCard 
                        key={plan.planCode}
                        plan={plan}
                        billingType={billingType}
                        onSubscribe={() => handleSubscribeClick(plan)}
                        isMostPopular={plan.planCode === 'small_team'}
                    />
                ))}
            </div>

            {isPaymentModalOpen && selectedPlan && (
                <PaymentModal
                    isOpen={isPaymentModalOpen}
                    onClose={() => setIsPaymentModalOpen(false)}
                    plan={selectedPlan}
                    billingType={billingType}
                    user={user}
                    onSuccess={handlePaymentSuccess}
                />
            )}
        </div>
    );
};
