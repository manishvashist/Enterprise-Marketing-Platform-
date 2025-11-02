
import React from 'react';
import { Channel, ChannelAssetGenerationResult, ChannelConnection } from '../types';
import { CheckCircleIcon } from './icons/CheckCircleIcon';

interface PreLaunchChecklistProps {
    channels: (Channel & { category: string })[];
    assets: Record<string, ChannelAssetGenerationResult>;
    connections: Record<string, ChannelConnection>;
}

interface ChecklistItem {
    item: string;
    status: 'complete' | 'pending';
    details?: string;
}

export const PreLaunchChecklist: React.FC<PreLaunchChecklistProps> = ({ channels, assets, connections }) => {
    
    const checklist: ChecklistItem[] = channels.flatMap(channel => {
        const assetGenerated = !!assets[channel.channelName];
        // FIX: Explicitly type 'c' to resolve type inference issue.
        const channelConnected = !!Object.values(connections).find((c: ChannelConnection) => c.channelName === channel.channelName && c.connectionStatus === 'connected');

        return [
            {
                item: `Generate assets for ${channel.channelName}`,
                status: assetGenerated ? 'complete' : 'pending',
            },
            {
                item: `Connect ${channel.channelName} account`,
                status: channelConnected ? 'complete' : 'pending',
            }
        ];
    });

    // Remove duplicates
    const uniqueChecklist = checklist.filter((item, index, self) => 
        index === self.findIndex(t => t.item === item.item)
    );


    return (
        <div className="space-y-3">
            {uniqueChecklist.map((item, index) => (
                <div key={index} className="flex items-start space-x-3">
                    <CheckCircleIcon className={`mt-0.5 w-5 h-5 flex-shrink-0 ${item.status === 'complete' ? 'text-green-400' : 'text-gray-600'}`} />
                    <div>
                        <p className={`text-sm ${item.status === 'complete' ? 'text-gray-300' : 'text-gray-400 font-medium'}`}>
                            {item.item}
                        </p>
                    </div>
                </div>
            ))}
        </div>
    );
};
