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
        <div className="bg-white rounded-2xl p-8 border border-slate-200 shadow-lg shadow-slate-200/50 animate-fade-in">
            <div className="flex justify-between items-center pb-4 mb-6 border-b border-slate-100">
                <h4 className="font-bold text-xl text-slate-900 flex items-center gap-2">
                    <span className="w-2 h-6 bg-teal-500 rounded-full"></span>
                    {result.channel}
                </h4>
                <button
                    onClick={downloadJson}
                    className="px-4 py-2 bg-slate-50 text-xs text-slate-700 font-bold uppercase tracking-wide rounded-lg hover:bg-slate-100 transition-colors border border-slate-200"
                >
                    Download JSON
                </button>
            </div>
            <div className="space-y-6">
                {result.assets.map(asset => (
                    <SingleAssetCard key={asset.assetId} asset={asset} />
                ))}
            </div>
        </div>
    );
};