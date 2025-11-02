
import React from 'react';
import { UsageInfo } from '../types';

interface TrialBannerProps {
  usageInfo: UsageInfo;
  setView: (view: 'campaign' | 'editor' | 'connections' | 'admin' | 'billing') => void;
}

export const TrialBanner: React.FC<TrialBannerProps> = ({ usageInfo, setView }) => {
  if (usageInfo.reason !== 'trial' || usageInfo.trialDaysRemaining === undefined) {
    return null;
  }
  
  const daysText = usageInfo.trialDaysRemaining > 1 ? `${usageInfo.trialDaysRemaining} days` : '1 day';
  const campaignsText = `${3 - usageInfo.remaining} of ${usageInfo.limit} campaigns used`;

  return (
    <div className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white text-sm font-medium">
        <div className="container mx-auto px-4 md:px-8 py-2 flex items-center justify-center text-center gap-x-6">
             <div className="flex items-center gap-x-2">
                <span className="font-bold">TRIAL:</span>
                <span>You have {daysText} left.</span>
             </div>
             <div className="hidden md:block w-px h-4 bg-white/30"></div>
             <div className="hidden md:block">
                 <span>{campaignsText}.</span>
             </div>
            <button
                onClick={() => setView('billing')}
                className="ml-4 px-3 py-1 bg-white/20 rounded-full hover:bg-white/30 transition-colors text-xs font-semibold"
            >
                Upgrade Now
            </button>
        </div>
    </div>
  );
};
