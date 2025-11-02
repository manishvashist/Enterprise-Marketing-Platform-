import React, { useEffect, useState } from 'react';
import { User, UsageInfo, SubscriptionPlan } from '../../types';
import { subscriptionService } from '../../services/subscriptionService';
import { PricingPage } from './PricingPage';
import { UsageDashboard } from './UsageDashboard';
import { ProfileSettings } from './ProfileSettings';

type BillingSubView = 'subscription' | 'profile';

interface BillingViewProps {
    user: User;
    onSubscriptionChange: (updatedUser: User) => void;
    initialTab?: BillingSubView;
}

export const BillingView: React.FC<BillingViewProps> = ({ user, onSubscriptionChange, initialTab }) => {
    const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
    const [usageInfo, setUsageInfo] = useState<UsageInfo | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<BillingSubView>(initialTab || 'subscription');

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

    useEffect(() => {
        if (initialTab) {
            setActiveTab(initialTab);
        }
    }, [initialTab]);


    const renderSubscriptionContent = () => {
        if (isLoading) {
            return (
                <div className="w-full flex items-center justify-center py-20">
                    <div className="loader ease-linear rounded-full border-4 border-t-4 border-gray-500 h-12 w-12 animate-spin" style={{borderTopColor: '#6366F1'}}></div>
                </div>
            );
        }
        if (user.accountStatus === 'active' && user.activeSubscription && usageInfo) {
            return <UsageDashboard user={user} usageInfo={usageInfo} />;
        }
        return <PricingPage user={user} plans={plans} onSubscriptionChange={onSubscriptionChange} />;
    };

    const navButtonStyle = "px-4 py-2.5 text-sm font-semibold transition-colors rounded-md";
    const activeStyle = "bg-gray-800 text-white";
    const inactiveStyle = "text-gray-400 hover:bg-gray-700/50 hover:text-white";

    return (
        <div className="w-full max-w-6xl mx-auto animate-fade-in">
             <div className="mb-8">
                <h1 className="text-3xl font-bold text-white">Settings</h1>
                <p className="text-gray-400 mt-2">
                    Manage your subscription, profile, and account settings.
                </p>
            </div>
            
            <div className="flex items-center space-x-2 border-b border-gray-700 mb-8">
                <button 
                    onClick={() => setActiveTab('subscription')} 
                    className={`pb-3 border-b-2 ${activeTab === 'subscription' ? 'border-indigo-500 text-white' : 'border-transparent text-gray-400 hover:text-white'} font-medium transition-colors`}
                >
                    Subscription & Usage
                </button>
                <button 
                    onClick={() => setActiveTab('profile')} 
                    className={`pb-3 border-b-2 ${activeTab === 'profile' ? 'border-indigo-500 text-white' : 'border-transparent text-gray-400 hover:text-white'} font-medium transition-colors`}
                >
                    Profile Settings
                </button>
            </div>

            {activeTab === 'subscription' && renderSubscriptionContent()}
            {activeTab === 'profile' && <ProfileSettings user={user} onUserUpdate={onSubscriptionChange} />}
        </div>
    );
};
