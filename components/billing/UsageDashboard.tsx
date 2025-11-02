
import React, { useMemo } from 'react';
import { User, UsageInfo } from '../../types';

interface UsageDashboardProps {
    user: User;
    usageInfo: UsageInfo;
}

const formatDate = (dateString: string | null | undefined) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
    });
};

export const UsageDashboard: React.FC<UsageDashboardProps> = ({ user, usageInfo }) => {
    const { activeSubscription } = user;
    if (!activeSubscription) return null;

    const { plan } = activeSubscription;
    const usagePercentage = usageInfo.limit > 0 ? ((usageInfo.limit - usageInfo.remaining) / usageInfo.limit) * 100 : 0;
    
    return (
        <div className="bg-gray-800 rounded-lg p-8 border border-gray-700">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {/* Current Plan */}
                <div className="md:col-span-1">
                    <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider">Current Plan</h2>
                    <p className="text-3xl font-bold text-indigo-400 mt-2">{plan?.name}</p>
                    <p className="text-gray-300 capitalize">{activeSubscription.billingType} Billing</p>
                    <button className="mt-4 text-sm text-indigo-400 hover:text-indigo-300 font-semibold">
                        Manage Subscription
                    </button>
                </div>
                
                {/* Usage Details */}
                <div className="md:col-span-2 bg-gray-900/50 p-6 rounded-lg">
                    <div className="flex justify-between items-center text-sm mb-2">
                        <span className="font-medium text-gray-200">Campaign Usage</span>
                        <span className="text-gray-400 font-semibold">
                            {usageInfo.limit - usageInfo.remaining} / {usageInfo.limit}
                        </span>
                    </div>
                    <div className="w-full bg-gray-700 rounded-full h-4 overflow-hidden">
                        <div
                            className="bg-indigo-500 h-4 rounded-full transition-all duration-500"
                            style={{ width: `${usagePercentage}%` }}
                        ></div>
                    </div>
                    <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                        <div>
                            <p className="text-gray-400">Quota Resets On</p>
                            <p className="font-semibold text-white">{formatDate(activeSubscription.quotaResetDate)}</p>
                        </div>
                        <div>
                            <p className="text-gray-400">Next Billing Date</p>
                            <p className="font-semibold text-white">{formatDate(activeSubscription.nextBillingDate)}</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
