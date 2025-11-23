import React from 'react';
// FIX: Import AssetGenerationProgress from types.ts to solve module resolution and circular dependency issues.
import { AssetGenerationProgress, Channel } from '../types';

interface AssetGenerationControllerProps {
    progress: AssetGenerationProgress;
    onGenerateForChannel: (channelName: string, channelCategory: string) => void;
    onGenerateForAll: () => void;
    onReset: () => void;
    recommendedChannels: (Channel & { category: string })[];
}

const channelConfigs: Record<string, { icon: string; estimatedTime: number; }> = {
    'Instagram': { icon: '📸', estimatedTime: 45 },
    'Facebook': { icon: '👥', estimatedTime: 45 },
    'Email Marketing': { icon: '📧', estimatedTime: 40 },
    'Website': { icon: '🌐', estimatedTime: 50 },
    'TikTok': { icon: '🎵', estimatedTime: 45 },
    'LinkedIn': { icon: '💼', estimatedTime: 40 },
    'LinkedIn Ads': { icon: '💼', estimatedTime: 40 },
    'X (Twitter) Ads': { icon: '✖️', estimatedTime: 40 },
    'YouTube': { icon: '📺', estimatedTime: 60 },
    'Billboards': { icon: '🏞️', estimatedTime: 35 },
    'In-Airport Digital Screens': { icon: '✈️', estimatedTime: 40 },
    'TV': { icon: '📺', estimatedTime: 70 },
    'Radio': { icon: '📻', estimatedTime: 50 },
    'Print Ads': { icon: '📰', estimatedTime: 40 },
    'SMS': { icon: '💬', estimatedTime: 30 },
    'Direct Mail': { icon: '📮', estimatedTime: 35 },
    'Display Ads': { icon: '🖼️', estimatedTime: 30 },
    'Events': { icon: '🎉', estimatedTime: 40 },
    'default': { icon: '✨', estimatedTime: 40 }
};

const formatTime = (seconds: number): string => {
    if (seconds <= 0) return '--';
    if (seconds < 60) return `${Math.round(seconds)}s`;
    const minutes = Math.floor(seconds / 60);
    const secs = Math.round(seconds % 60);
    return `${minutes}m ${secs}s`;
};

export const AssetGenerationController: React.FC<AssetGenerationControllerProps> = ({
    progress,
    onGenerateForChannel,
    onGenerateForAll,
    onReset,
    recommendedChannels,
}) => {
    const overallPercentage = progress.totalChannels > 0 ? (progress.completedChannels / progress.totalChannels) * 100 : 0;
    
    const totalEstimatedTime = recommendedChannels.reduce((acc, ch) => {
        const status = progress.channelProgress[ch.channelName]?.status;
        if (status === 'pending' || status === 'in-progress' || status === 'error') {
            return acc + (channelConfigs[ch.channelName]?.estimatedTime || channelConfigs.default.estimatedTime);
        }
        return acc;
    }, 0);

    const groupedChannels = recommendedChannels.reduce((acc, channel) => {
        const category = channel.category || 'Other';
        if (!acc[category]) {
            acc[category] = [];
        }
        acc[category].push(channel);
        return acc;
    }, {} as Record<string, (Channel & { category: string })[]>);

    return (
        <div className="mt-10 bg-white rounded-3xl p-8 border border-slate-200 shadow-lg shadow-slate-200/50">
            <div className="flex justify-between items-center mb-6">
                <h3 className="font-bold text-2xl text-slate-900">Asset Generation Engine</h3>
                <div className="bg-orange-50 text-orange-700 px-3 py-1 rounded-full text-xs font-bold border border-orange-100 uppercase tracking-wider">
                    AI Powered
                </div>
            </div>

            {/* Overall Progress */}
            <div className="bg-slate-50 rounded-2xl p-6 mb-8 border border-slate-100">
                <div className="flex justify-between items-center text-sm mb-3">
                    <span className="font-bold text-slate-700">Overall Progress</span>
                    <span className="font-medium text-slate-500">{progress.completedChannels} / {progress.totalChannels} channels completed</span>
                </div>
                <div className="w-full bg-white rounded-full h-3 overflow-hidden border border-slate-200">
                    <div
                        className="bg-gradient-to-r from-teal-400 to-teal-500 h-3 rounded-full transition-all duration-500"
                        style={{ width: `${overallPercentage}%` }}
                    ></div>
                </div>
                 <div className="text-right text-xs font-medium text-slate-400 mt-2">
                    Est. time remaining: {formatTime(totalEstimatedTime)}
                </div>
            </div>

            {/* Channel Buttons */}
            <div className="space-y-8">
                {/* FIX: Explicitly type `channels` to resolve 'unknown' type error. */}
                {Object.entries(groupedChannels).map(([category, channels]: [string, (Channel & { category: string })[]]) => (
                    <div key={category}>
                        <h4 className="font-bold text-sm text-slate-400 uppercase tracking-wider mb-4 border-b border-slate-100 pb-2">{category}</h4>
                        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-5">
                            {channels.map(channel => {
                                const channelProgress = progress.channelProgress[channel.channelName];
                                const config = channelConfigs[channel.channelName] || channelConfigs.default;
                                const status = channelProgress?.status || 'pending';

                                const getStatusText = () => {
                                    switch (status) {
                                        case 'in-progress': return `Generating... ${Math.round(channelProgress.percentage)}%`;
                                        case 'completed': return 'Complete';
                                        case 'error': return 'Error';
                                        default: return 'Ready';
                                    }
                                };
                                
                                const getCardStyles = () => {
                                    switch (status) {
                                        case 'in-progress': return 'border-cyan-500 ring-2 ring-cyan-100 bg-cyan-50/30';
                                        case 'completed': return 'border-teal-500 ring-2 ring-teal-100 bg-teal-50/30';
                                        case 'error': return 'border-red-500 ring-2 ring-red-100 bg-red-50/30';
                                        default: return 'border-slate-200 bg-white hover:border-orange-300 hover:shadow-md hover:-translate-y-0.5';
                                    }
                                };

                                return (
                                    <button
                                        key={channel.channelName}
                                        onClick={() => onGenerateForChannel(channel.channelName, channel.category)}
                                        disabled={status === 'in-progress' || progress.isGeneratingAll}
                                        className={`relative text-left p-4 rounded-xl border ${getCardStyles()} transition-all disabled:opacity-80 disabled:cursor-wait shadow-sm flex flex-col items-start justify-between h-24`}
                                    >
                                        <span className="text-2xl mb-2 block">{config.icon}</span>
                                        <div className="w-full">
                                            <p className="font-bold text-sm text-slate-900 truncate">{channel.channelName}</p>
                                            <p className={`text-xs font-medium mt-0.5 ${status === 'completed' ? 'text-teal-600' : 'text-slate-500'}`}>{getStatusText()}</p>
                                        </div>
                                        {status === 'in-progress' && (
                                            <div className="absolute bottom-0 left-0 right-0 h-1 bg-slate-100 rounded-b-xl overflow-hidden">
                                                <div className="bg-cyan-500 h-1" style={{ width: `${channelProgress.percentage}%` }}></div>
                                            </div>
                                        )}
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                ))}
            </div>
            
            {/* Bulk Actions */}
            <div className="mt-10 pt-8 border-t border-slate-100 flex flex-col sm:flex-row gap-4">
                 <button
                    onClick={onGenerateForAll}
                    disabled={progress.isGeneratingAll || progress.completedChannels === progress.totalChannels}
                    className="flex-1 px-6 py-3 bg-teal-600 text-white font-bold rounded-xl hover:bg-teal-700 disabled:bg-slate-200 disabled:text-slate-400 disabled:cursor-not-allowed transition-all shadow-lg shadow-teal-600/20 hover:shadow-xl hover:-translate-y-0.5"
                >
                    {progress.isGeneratingAll ? 'Generating Assets...' : 'Generate All Selected Channels'}
                </button>
                <button
                    onClick={onReset}
                    disabled={progress.isGeneratingAll}
                    className="flex-1 sm:flex-initial px-6 py-3 bg-white text-slate-700 border border-slate-300 font-bold rounded-xl hover:bg-slate-50 disabled:opacity-50 transition-colors shadow-sm"
                >
                    Reset Progress
                </button>
            </div>
        </div>
    );
};