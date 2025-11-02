import React from 'react';
import { UsageInfo } from '../types';

type BillingSubView = 'subscription' | 'profile';

interface UsageMessageProps {
  usageInfo: UsageInfo | null;
  setView: (view: 'billing', tab?: BillingSubView) => void;
}

export const UsageMessage: React.FC<UsageMessageProps> = ({ usageInfo, setView }) => {
  if (!usageInfo) return null;

  const { canGenerate, reason, remaining, limit, trialDaysRemaining, daysUntilReset } = usageInfo;

  const getMessageAndButton = (): { message: string, buttonText: string | null } | null => {
    if (canGenerate) {
        if (reason === 'trial') {
            const daysText = trialDaysRemaining! > 1 ? `${trialDaysRemaining} days` : '1 day';
            return { message: `You are on a free trial with ${daysText} left. You have ${remaining} of ${limit} free campaigns remaining.`, buttonText: "Upgrade" };
        }
        // Paid user with quota
        return { message: `You have generated ${limit - remaining} of ${limit} campaigns. Your quota resets in ${daysUntilReset || 0} days.`, buttonText: "Manage Plan" };
    }

    // Cannot generate
    switch (reason) {
        case 'quota_exceeded':
            // For trial user who exceeded quota
            if (trialDaysRemaining !== undefined) {
                return { message: "You have generated 1 of 1 free campaigns. Subscribe for a monthly or annual plan to continue.", buttonText: "Subscribe Now" };
            }
            // For paid user who exceeded quota
            return { message: `You have generated ${limit} of ${limit} campaigns. Upgrade your plan to generate more campaigns.`, buttonText: "Upgrade Plan" };
        case 'trial_expired':
            return { message: "Your free trial has expired. Please subscribe to continue using the platform.", buttonText: "View Plans" };
        case 'subscription_required':
             return { message: "A subscription is required to generate campaigns.", buttonText: "Subscribe Now" };
        default:
            return null;
    }
  };
  
  const content = getMessageAndButton();
  if (!content) return null;

  const bgColor = canGenerate ? 'bg-gray-800' : 'bg-yellow-900/30';
  const textColor = canGenerate ? 'text-gray-300' : 'text-yellow-200';
  const borderColor = canGenerate ? 'border-gray-700' : 'border-yellow-700';

  return (
    <div className="container mx-auto px-4 md:px-8 -mt-4 mb-4">
        <div className={`p-3 rounded-lg border ${borderColor} ${bgColor} flex items-center justify-center text-center gap-x-4`}>
            <p className={`text-sm ${textColor}`}>
                {content.message}
            </p>
            {content.buttonText && (
                <button
                    onClick={() => setView('billing', 'subscription')}
                    className="flex-shrink-0 px-3 py-1 bg-indigo-600 text-white text-xs font-semibold rounded-md hover:bg-indigo-500 transition-colors"
                >
                    {content.buttonText}
                </button>
            )}
        </div>
    </div>
  );
};
