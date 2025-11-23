import React, { useState } from 'react';
import { UsageInfo } from '../types';

type BillingSubView = 'subscription' | 'profile';

interface UsageMessageProps {
  usageInfo: UsageInfo | null;
  setView: (view: 'billing', tab?: BillingSubView) => void;
}

export const UsageMessage: React.FC<UsageMessageProps> = ({ usageInfo, setView }) => {
  const [isVisible, setIsVisible] = useState(true);

  if (!usageInfo || !isVisible) return null;

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

  const bgColor = canGenerate ? 'bg-white' : 'bg-yellow-50';
  const textColor = canGenerate ? 'text-slate-600' : 'text-yellow-800';
  const borderColor = canGenerate ? 'border-slate-200' : 'border-yellow-200';

  return (
    <div className="container mx-auto px-4 md:px-8 -mt-4 mb-4">
        <div className={`relative p-3 pr-10 rounded-lg border ${borderColor} ${bgColor} flex items-center justify-center text-center gap-x-4 shadow-sm transition-colors`}>
            <p className={`text-sm ${textColor} font-medium`}>
                {content.message}
            </p>
            {content.buttonText && (
                <button
                    onClick={() => setView('billing', 'subscription')}
                    className="flex-shrink-0 px-3 py-1 bg-orange-600 text-white text-xs font-semibold rounded-md hover:bg-orange-700 transition-colors"
                >
                    {content.buttonText}
                </button>
            )}
            
            {/* Close Button */}
            <button 
                onClick={() => setIsVisible(false)}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
                aria-label="Close message"
            >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
            </button>
        </div>
    </div>
  );
};