
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
    onSetGlobalSuccess: (message: string | null) => void;
}

export const BillingView: React.FC<BillingViewProps> = ({ user, onSubscriptionChange, initialTab, onSetGlobalSuccess }) => {
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
                    <div className="loader ease-linear rounded-full border-4 border-t-4 border-slate-200 h-12 w-12 animate-spin" style={{borderTopColor: '#4F46E5'}}></div>
                </div>
            );
        }
        if (user.accountStatus === 'active' && user.activeSubscription && usageInfo) {
            return <UsageDashboard user={user} usageInfo={usageInfo} />;
        }
        return <PricingPage user={user} plans={plans} onSubscriptionChange={onSubscriptionChange} />;
    };

    return (
        <div className="w-full max-w-6xl mx-auto animate-fade-in">
             <div className="mb-8">
                <h1 className="text-3xl font-bold text-slate-900">Settings</h1>
                <p className="text-slate-500 mt-2">
                    Manage your subscription, profile, and account settings.
                </p>
            </div>
            
            <div className="flex items-center space-x-6 border-b border-slate-200 mb-8">
                <button 
                    onClick={() => setActiveTab('subscription')} 
                    className={`pb-3 border-b-2 font-medium transition-colors ${activeTab === 'subscription' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
                >
                    Subscription & Usage
                </button>
                <button 
                    onClick={() => setActiveTab('profile')} 
                    className={`pb-3 border-b-2 font-medium transition-colors ${activeTab === 'profile' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
                >
                    Profile Settings
                </button>
            </div>

            {activeTab === 'subscription' && renderSubscriptionContent()}
            {activeTab === 'profile' && <ProfileSettings user={user} onUserUpdate={onSubscriptionChange} onSetGlobalSuccess={onSetGlobalSuccess} />}
        </div>
    );
};
