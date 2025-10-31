import React, { useMemo, useState, useEffect } from 'react';
import { Campaign, Channel, ChannelConnection, CampaignExecutionPlan, ExecutionStatus } from '../types';
import { RocketLaunchIcon } from './icons/RocketLaunchIcon';
import { PreLaunchChecklist } from './PreLaunchChecklist';
import { ExecutionChannelCard } from './ExecutionChannelCard';

interface CampaignExecutionManagerProps {
    campaign: Campaign;
    connections: Record<string, ChannelConnection>;
    recommendedChannels: (Channel & { category: string })[];
}

export const CampaignExecutionManager: React.FC<CampaignExecutionManagerProps> = ({ campaign, connections, recommendedChannels }) => {
    
    const executableChannels = useMemo(() => {
        const generatedChannels = new Set(Object.keys(campaign.channelAssets || {}));
        const connectedChannelNames = new Set(Object.values(connections)
            .filter(c => c.connectionStatus === 'connected')
            .map(c => c.channelName));
        
        return recommendedChannels.filter(rc => 
            generatedChannels.has(rc.channelName) && connectedChannelNames.has(rc.channelName)
        );
    }, [campaign.channelAssets, connections, recommendedChannels]);
    
    const [executionPlan, setExecutionPlan] = useState<CampaignExecutionPlan>({});
    const [isLaunching, setIsLaunching] = useState(false);

    useEffect(() => {
        const initialPlan = executableChannels.reduce((acc, channel) => {
            acc[channel.channelName] = { channelId: channel.channelName, status: 'pending', scheduledTime: null };
            return acc;
        }, {} as CampaignExecutionPlan);
        setExecutionPlan(initialPlan);
    }, [executableChannels]);


    const handleScheduleChange = (channelName: string, date: Date | null) => {
        setExecutionPlan(prev => ({
            ...prev,
            [channelName]: {
                ...prev[channelName],
                scheduledTime: date,
                status: date ? 'scheduled' : 'pending',
            }
        }));
    };

    const handleLaunchCampaign = async () => {
        setIsLaunching(true);
        const channelsToLaunch = Object.keys(executionPlan);

        for (const channelName of channelsToLaunch) {
            setExecutionPlan(prev => ({ ...prev, [channelName]: { ...prev[channelName], status: 'publishing' } }));
            // Simulate API call delay
            await new Promise(resolve => setTimeout(resolve, 1500 + Math.random() * 1000));
            // Simulate success/failure
            const isSuccess = Math.random() > 0.1; // 90% success rate
            setExecutionPlan(prev => ({
                ...prev,
                [channelName]: {
                    ...prev[channelName],
                    status: isSuccess ? 'published' : 'failed',
                    error: isSuccess ? undefined : 'An unknown API error occurred.',
                }
            }));
        }
        setIsLaunching(false);
    };

    if (executableChannels.length === 0) {
        return null;
    }
    
    return (
        <div className="mt-8 bg-gray-700/50 rounded-lg p-6 border border-gray-600/50">
            <div className="flex items-center space-x-3 mb-4">
                <RocketLaunchIcon className="w-6 h-6 text-green-400" />
                <h3 className="font-semibold text-lg text-white">Campaign Launchpad</h3>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-6">
                    {executableChannels.map(channel => {
                        const connection = Object.values(connections).find(c => c.channelName === channel.channelName);
                        if (!connection || !executionPlan[channel.channelName]) return null;
                        
                        return (
                           <ExecutionChannelCard
                             key={channel.channelName}
                             channel={channel}
                             assetResult={campaign.channelAssets![channel.channelName]}
                             connection={connection}
                             executionItem={executionPlan[channel.channelName]}
                             onScheduleChange={handleScheduleChange}
                           />
                        );
                    })}
                </div>
                
                <div className="lg:col-span-1">
                    <div className="sticky top-8 bg-gray-800/60 rounded-lg p-5 border border-gray-700">
                        <h4 className="font-semibold text-base text-white mb-4">Pre-Launch Summary</h4>
                        <PreLaunchChecklist 
                            channels={executableChannels}
                            assets={campaign.channelAssets || {}}
                            connections={connections}
                        />
                        <button
                            onClick={handleLaunchCampaign}
                            disabled={isLaunching}
                            className="w-full mt-6 px-6 py-3 bg-green-600 text-white font-semibold rounded-md hover:bg-green-700 disabled:bg-gray-600 disabled:cursor-not-allowed transition-all flex items-center justify-center"
                        >
                            {isLaunching ? (
                                <>
                                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    Launching Campaign...
                                </>
                            ) : 'Launch Campaign'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};