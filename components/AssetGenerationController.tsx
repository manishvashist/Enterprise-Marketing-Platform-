

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
        <div className="mt-8 bg-gray-700/50 rounded-lg p-6 border border-gray-600/50">
            <h3 className="font-semibold text-lg text-white mb-4">AI-Powered Content Factory</h3>

            {/* Overall Progress */}
            <div className="bg-gray-800/50 rounded-lg p-4 mb-6">
                <div className="flex justify-between items-center text-sm mb-2">
                    <span className="font-medium text-gray-200">Overall Progress</span>
                    <span className="text-gray-400">{progress.completedChannels} / {progress.totalChannels} channels completed</span>
                </div>
                <div className="w-full bg-gray-900 rounded-full h-4 overflow-hidden">
                    <div
                        className="bg-teal-500 h-4 rounded-full transition-all duration-500"
                        style={{ width: `${overallPercentage}%` }}
                    ></div>
                </div>
                 <div className="text-right text-xs text-gray-400 mt-2">
                    Estimated time remaining: {formatTime(totalEstimatedTime)}
                </div>
            </div>

            {/* Channel Buttons */}
            <div className="space-y-6">
                {/* FIX: Explicitly type `channels` to resolve 'unknown' type error. */}
                {Object.entries(groupedChannels).map(([category, channels]: [string, (Channel & { category: string })[]]) => (
                    <div key={category}>
                        <h4 className="font-medium text-gray-300 mb-3">{category}</h4>
                        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                            {channels.map(channel => {
                                const channelProgress = progress.channelProgress[channel.channelName];
                                const config = channelConfigs[channel.channelName] || channelConfigs.default;
                                const status = channelProgress?.status || 'pending';

                                const getStatusText = () => {
                                    switch (status) {
                                        case 'in-progress': return `Generating... ${Math.round(channelProgress.percentage)}%`;
                                        case 'completed': return '✓ Complete';
                                        case 'error': return '✗ Error';
                                        default: return 'Ready';
                                    }
                                };
                                
                                const getBorderColor = () => {
                                    switch (status) {
                                        case 'in-progress': return 'border-cyan-500';
                                        case 'completed': return 'border-teal-500';
                                        case 'error': return 'border-red-500';
                                        default: return 'border-gray-600 hover:border-cyan-400';
                                    }
                                };

                                return (
                                    <button
                                        key={channel.channelName}
                                        onClick={() => onGenerateForChannel(channel.channelName, channel.category)}
                                        disabled={status === 'in-progress' || progress.isGeneratingAll}
                                        className={`relative text-left p-3 bg-gray-800 rounded-lg border-2 ${getBorderColor()} transition-all disabled:opacity-70 disabled:cursor-wait`}
                                    >
                                        <div className="flex items-center space-x-3">
                                            <span className="text-2xl">{config.icon}</span>
                                            <div>
                                                <p className="font-semibold text-sm text-gray-100">{channel.channelName}</p>
                                                <p className="text-xs text-gray-400">{getStatusText()}</p>
                                            </div>
                                        </div>
                                        {status === 'in-progress' && (
                                            <div className="absolute bottom-0 left-0 right-0 h-1 bg-gray-700 rounded-b-md overflow-hidden">
                                                <div className="bg-cyan-500 h-1" style={{ width: `${channelProgress.percentage}%` }}></div>
                                            </div>
                                        )}
                                         {status === 'completed' && (
                                            <div className="absolute bottom-0 left-0 right-0 h-1 bg-teal-500 rounded-b-md"></div>
                                        )}
                                        {status === 'error' && (
                                             <div className="absolute bottom-0 left-0 right-0 h-1 bg-red-500 rounded-b-md"></div>
                                        )}
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                ))}
            </div>
            
            {/* Bulk Actions */}
            <div className="mt-8 pt-6 border-t border-gray-600/50 flex flex-col sm:flex-row gap-4">
                 <button
                    onClick={onGenerateForAll}
                    disabled={progress.isGeneratingAll || progress.completedChannels === progress.totalChannels}
                    className="flex-1 px-5 py-2.5 bg-teal-600 text-white font-semibold rounded-md hover:bg-teal-700 disabled:bg-gray-600 disabled:cursor-not-allowed transition-colors"
                >
                    {progress.isGeneratingAll ? 'Generating...' : 'Generate All Selected Channels'}
                </button>
                <button
                    onClick={onReset}
                    disabled={progress.isGeneratingAll}
                    className="flex-1 sm:flex-initial px-5 py-2.5 bg-gray-600 text-white font-semibold rounded-md hover:bg-gray-500 disabled:opacity-50 transition-colors"
                >
                    Reset Progress
                </button>
            </div>
        </div>
    );
};