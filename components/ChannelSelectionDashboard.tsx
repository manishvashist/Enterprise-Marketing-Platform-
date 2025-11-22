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
        case 'low': return 'text-green-600';
        case 'medium': return 'text-yellow-600';
        case 'high': return 'text-red-600';
        default: return 'text-slate-400';
    }
};

export const ChannelSelectionDashboard: React.FC<ChannelSelectionDashboardProps> = ({ selection }) => {
    const { channelCategories, executionPriority, budgetAllocationSuggestion } = selection;

    return (
        <div className="bg-white rounded-xl p-6 mb-6 border border-slate-200 shadow-sm">
            <div className="flex items-start space-x-4">
                <div className="mt-1 flex-shrink-0 w-10 h-10 rounded-full bg-cyan-100 flex items-center justify-center">
                    <ChannelsIcon className="w-6 h-6 text-cyan-600" />
                </div>
                <div className="flex-grow">
                    <h3 className="font-bold text-lg text-slate-900">AI-Powered Channel Selection & Orchestration</h3>
                    
                    <div className="mt-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {/* Execution & Budget */}
                        <div className="md:col-span-2 lg:col-span-3 bg-slate-50 rounded-xl p-5 border border-slate-200 grid grid-cols-1 lg:grid-cols-2 gap-6">
                            <div>
                                <h4 className="font-semibold text-base text-slate-800 mb-2">Execution Priority</h4>
                                <ol className="list-decimal list-inside space-y-1 text-sm text-slate-600">
                                    {executionPriority.map((channel, i) => <li key={i} className="font-medium">{channel}</li>)}
                                </ol>
                            </div>
                             <div>
                                <h4 className="font-semibold text-base text-slate-800 mb-3">Budget Allocation Suggestion</h4>
                                <div className="w-full bg-slate-200 rounded-full h-6 shadow-inner">
                                    <div className="flex h-full rounded-full overflow-hidden">
                                        {budgetAllocationSuggestion.map(({ channel, percentage }, i) => (
                                            <div
                                                key={channel}
                                                className={`flex items-center justify-center text-xs font-bold text-white ${['bg-cyan-500', 'bg-indigo-500', 'bg-purple-500', 'bg-teal-500', 'bg-sky-500'][i % 5]}`}
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
                            <div key={category.categoryName} className="bg-slate-50 rounded-xl p-4 border border-slate-200">
                                <h4 className="font-semibold text-base text-slate-900 mb-3">{category.categoryName}</h4>
                                <div className="space-y-3">
                                    {category.channels.map(channel => (
                                        <div key={channel.channelName} className={`p-3 rounded-lg transition-all ${channel.isRecommended ? 'bg-white border border-cyan-200 shadow-sm ring-1 ring-cyan-100' : 'bg-white border border-slate-200'}`}>
                                            <div className="flex justify-between items-start">
                                                <p className={`font-bold text-sm ${channel.isRecommended ? 'text-cyan-700' : 'text-slate-700'}`}>{channel.channelName}</p>
                                                {channel.isRecommended && <StarIcon className="w-4 h-4 text-cyan-500 flex-shrink-0" />}
                                            </div>
                                            {channel.isRecommended && <p className="text-xs text-slate-500 mt-1 italic">"{channel.rationale}"</p>}
                                            <div className="flex items-center justify-between text-xs text-slate-500 mt-2 pt-2 border-t border-slate-100">
                                               <div className="flex items-center space-x-1" title="Best For">
                                                    <TargetIcon className="w-3 h-3 text-slate-400"/>
                                                    <span>{channel.bestFor}</span>
                                               </div>
                                               <div className="flex items-center space-x-1" title="Estimated Reach">
                                                    <UsersIcon className="w-3 h-3 text-slate-400"/>
                                                    <span>{channel.estimatedReach}</span>
                                               </div>
                                               <div className={`flex items-center space-x-1 font-bold ${getCostTierColor(channel.costTier)}`} title="Cost Tier">
                                                    <CashIcon className="w-3 h-3"/>
                                                    <span className="uppercase">{channel.costTier}</span>
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