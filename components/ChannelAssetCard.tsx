import React from 'react';
import { ChannelAssetGenerationResult } from '../types';
import { SingleAssetCard } from './SingleAssetCard';

interface ChannelAssetCardProps {
    result: ChannelAssetGenerationResult;
}

export const ChannelAssetCard: React.FC<ChannelAssetCardProps> = ({ result }) => {
    
    const downloadJson = () => {
        const dataStr = JSON.stringify(result, null, 2);
        const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
        const linkElement = document.createElement('a');
        linkElement.setAttribute('href', dataUri);
        linkElement.setAttribute('download', `${result.channel}_assets.json`);
        linkElement.click();
    };

    return (
        <div className="bg-gray-900/50 rounded-lg p-5 border border-gray-700/80 animate-fade-in">
            <div className="flex justify-between items-center pb-3 mb-4 border-b border-gray-700">
                <h4 className="font-bold text-lg text-teal-300">{result.channel} - Assets</h4>
                <button
                    onClick={downloadJson}
                    className="px-3 py-1.5 bg-gray-700 text-xs text-gray-200 font-semibold rounded-md hover:bg-gray-600 transition-colors"
                >
                    Download JSON
                </button>
            </div>
            <div className="space-y-4">
                {result.assets.map(asset => (
                    <SingleAssetCard key={asset.assetId} asset={asset} />
                ))}
            </div>
        </div>
    );
};
