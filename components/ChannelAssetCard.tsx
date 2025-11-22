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
        <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm animate-fade-in">
            <div className="flex justify-between items-center pb-3 mb-4 border-b border-slate-100">
                <h4 className="font-bold text-lg text-teal-700">{result.channel} - Assets</h4>
                <button
                    onClick={downloadJson}
                    className="px-3 py-1.5 bg-slate-100 text-xs text-slate-700 font-semibold rounded-md hover:bg-slate-200 transition-colors border border-slate-200"
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