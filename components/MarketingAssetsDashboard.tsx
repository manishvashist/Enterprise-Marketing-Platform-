import React from 'react';
import { ChannelAssetGenerationResult } from '../types';
import { DocumentTextIcon } from './icons/DocumentTextIcon';
import { LinkIcon } from './icons/LinkIcon';
import { CalendarIcon } from './icons/CalendarIcon';
import { AssetCard } from './AssetCard';

interface MarketingAssetsDashboardProps {
    assets: ChannelAssetGenerationResult;
}

export const MarketingAssetsDashboard: React.FC<MarketingAssetsDashboardProps> = ({ assets }) => {
    const { assets: creativeAssets } = assets;

    return (
        <div className="bg-gray-700/50 rounded-lg p-4 border border-gray-600/50">
            <div className="flex items-start space-x-4">
                <div className="mt-1 flex-shrink-0 w-8 h-8 rounded-full bg-teal-600 flex items-center justify-center">
                    <DocumentTextIcon className="w-5 h-5 text-white" />
                </div>
                <div className="flex-grow">
                    <h3 className="font-semibold text-lg text-white">AI-Powered Content Factory</h3>
                    
                    
                    {/* Creative Assets */}
                    <div className="mt-6">
                        <h4 className="font-medium text-base text-gray-100 mb-3">Creative Assets</h4>
                        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                            {creativeAssets.map((asset, index) => (
                                <AssetCard key={index} asset={{...asset, channel: assets.channel}} />
                            ))}
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
};