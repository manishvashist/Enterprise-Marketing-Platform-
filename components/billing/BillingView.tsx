
import React, { useEffect, useState } from 'react';
import { User, UsageInfo, SubscriptionPlan } from '../../types';
import { subscriptionService } from '../../services/subscriptionService';
import { PricingPage } from './PricingPage';
import { UsageDashboard } from './UsageDashboard';

interface BillingViewProps {
    user: User;
    onSubscriptionChange: (updatedUser: User) => void;
}

export const BillingView: React.FC<BillingViewProps> = ({ user, onSubscriptionChange }) => {
    const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
    const [usageInfo, setUsageInfo] = useState<UsageInfo | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            setIsLoading(true);
            try {
                const [plansData, usageData] = await Promise.all([
                    subscriptionService.getAvailablePlans(),
                    subscriptionService.getUsageInfo(user.id),
                ]);
                setPlans(plansData);
                setUsageInfo(usageData);
            } catch (error) {
                console.error("Failed to fetch billing data:", error);
            } finally {
                setIsLoading(false);
            }
        };
        fetchData();
    }, [user]);

    if (isLoading) {
        return (
            <div className="w-full max-w-6xl mx-auto flex items-center justify-center">
                <div className="loader ease-linear rounded-full border-4 border-t-4 border-gray-500 h-12 w-12 animate-spin" style={{borderTopColor: '#6366F1'}}></div>
            </div>
        );
    }
    
    return (
        <div className="w-full max-w-6xl mx-auto animate-fade-in">
             <div className="mb-8">
                <h1 className="text-3xl font-bold text-white">Billing & Usage</h1>
                <p className="text-gray-400 mt-2">
                    Manage your subscription, view usage, and explore upgrade options.
                </p>
            </div>
            {user.accountStatus === 'active' && user.activeSubscription && usageInfo ? (
                <UsageDashboard user={user} usageInfo={usageInfo} />
            ) : (
                <PricingPage user={user} plans={plans} onSubscriptionChange={onSubscriptionChange} />
            )}
        </div>
    );
};
