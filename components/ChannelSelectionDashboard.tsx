import React from 'react';
import { ChannelSelectionInterface } from '../types';
import { ChannelsIcon } from './icons/ChannelsIcon';
import { StarIcon } from './icons/StarIcon';
import { TargetIcon } from './icons/TargetIcon';
import { UsersIcon } from './icons/UsersIcon';
import { CashIcon } from './icons/CashIcon';

interface ChannelSelectionDashboardProps {
    selection: ChannelSelectionInterface;
}

const getCostTierColor = (tier: string) => {
    switch (tier) {
        case 'low': return 'text-green-400';
        case 'medium': return 'text-yellow-400';
        case 'high': return 'text-red-400';
        default: return 'text-gray-400';
    }
};

export const ChannelSelectionDashboard: React.FC<ChannelSelectionDashboardProps> = ({ selection }) => {
    const { channelCategories, executionPriority, budgetAllocationSuggestion } = selection;

    return (
        <div className="bg-gray-700/50 rounded-lg p-4 mb-6 border border-gray-600/50">
            <div className="flex items-start space-x-4">
                <div className="mt-1 flex-shrink-0 w-8 h-8 rounded-full bg-cyan-600 flex items-center justify-center">
                    <ChannelsIcon className="w-5 h-5 text-white" />
                </div>
                <div className="flex-grow">
                    <h3 className="font-semibold text-lg text-white">AI-Powered Channel Selection & Orchestration</h3>
                    
                    <div className="mt-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {/* Execution & Budget */}
                        <div className="md:col-span-2 lg:col-span-3 bg-gray-800/50 rounded-lg p-4 grid grid-cols-1 lg:grid-cols-2 gap-6">
                            <div>
                                <h4 className="font-medium text-base text-gray-100 mb-2">Execution Priority</h4>
                                <ol className="list-decimal list-inside space-y-1 text-sm text-gray-300">
                                    {executionPriority.map((channel, i) => <li key={i}>{channel}</li>)}
                                </ol>
                            </div>
                             <div>
                                <h4 className="font-medium text-base text-gray-100 mb-3">Budget Allocation Suggestion</h4>
                                <div className="w-full bg-gray-900 rounded-full h-6">
                                    <div className="flex h-full rounded-full overflow-hidden">
                                        {budgetAllocationSuggestion.map(({ channel, percentage }, i) => (
                                            <div
                                                key={channel}
                                                className={`flex items-center justify-center text-xs font-medium text-white ${['bg-cyan-500', 'bg-indigo-500', 'bg-purple-500', 'bg-teal-500', 'bg-sky-500'][i % 5]}`}
                                                style={{ width: percentage }}
                                                title={`${channel}: ${percentage}`}
                                            >
                                                {parseFloat(percentage) > 10 ? channel : ''}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Channel Categories */}
                        {channelCategories.map(category => (
                            <div key={category.categoryName} className="bg-gray-800/50 rounded-lg p-4">
                                <h4 className="font-medium text-base text-gray-100 mb-3">{category.categoryName}</h4>
                                <div className="space-y-3">
                                    {category.channels.map(channel => (
                                        <div key={channel.channelName} className={`p-3 rounded-md transition-all ${channel.isRecommended ? 'bg-gray-900/70 border border-cyan-500/30' : 'bg-gray-900/40'}`}>
                                            <div className="flex justify-between items-start">
                                                <p className={`font-semibold text-sm ${channel.isRecommended ? 'text-cyan-300' : 'text-gray-300'}`}>{channel.channelName}</p>
                                                {channel.isRecommended && <StarIcon className="w-4 h-4 text-cyan-400 flex-shrink-0" />}
                                            </div>
                                            {channel.isRecommended && <p className="text-xs text-gray-400 mt-1 italic">"{channel.rationale}"</p>}
                                            <div className="flex items-center justify-between text-xs text-gray-400 mt-2 pt-2 border-t border-gray-700/50">
                                               <div className="flex items-center space-x-1" title="Best For">
                                                    <TargetIcon className="w-3 h-3"/>
                                                    <span>{channel.bestFor}</span>
                                               </div>
                                               <div className="flex items-center space-x-1" title="Estimated Reach">
                                                    <UsersIcon className="w-3 h-3"/>
                                                    <span>{channel.estimatedReach}</span>
                                               </div>
                                               <div className={`flex items-center space-x-1 font-medium ${getCostTierColor(channel.costTier)}`} title="Cost Tier">
                                                    <CashIcon className="w-3 h-3"/>
                                                    <span>{channel.costTier}</span>
                                               </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};