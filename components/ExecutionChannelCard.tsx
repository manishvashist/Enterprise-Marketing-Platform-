import React from 'react';
import { Channel, ChannelAssetGenerationResult, ChannelConnection, ExecutionItem } from '../types';

interface ExecutionChannelCardProps {
    channel: (Channel & { category: string });
    assetResult: ChannelAssetGenerationResult;
    connection: ChannelConnection;
    executionItem: ExecutionItem;
    onScheduleChange: (channelName: string, date: Date | null) => void;
}

const getStatusPill = (status: ExecutionItem['status']) => {
    switch (status) {
        case 'pending':
            return <span className="bg-gray-700 text-gray-300">Pending</span>;
        case 'scheduled':
            return <span className="bg-blue-900/80 text-blue-300">Scheduled</span>;
        case 'publishing':
            return <span className="bg-yellow-900/80 text-yellow-300 animate-pulse">Publishing...</span>;
        case 'published':
            return <span className="bg-green-900/80 text-green-300">Published</span>;
        case 'failed':
            return <span className="bg-red-900/80 text-red-300">Failed</span>;
    }
};

export const ExecutionChannelCard: React.FC<ExecutionChannelCardProps> = ({
    channel,
    assetResult,
    connection,
    executionItem,
    onScheduleChange,
}) => {
    const mainAsset = assetResult.assets[0];
    const isPublished = executionItem.status === 'published' || executionItem.status === 'publishing';

    const handleDateTimeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const date = e.target.value ? new Date(e.target.value) : null;
        onScheduleChange(channel.channelName, date);
    };

    return (
        <div className="bg-gray-800/60 rounded-lg p-5 border border-gray-700">
            <div className="flex justify-between items-start mb-4">
                <div>
                    <h4 className="font-bold text-lg text-white">{channel.channelName}</h4>
                    <p className="text-sm text-gray-400">Publishing to: <span className="font-medium text-gray-200">{connection.connectedAccount?.accountName}</span></p>
                </div>
                <div className="px-2.5 py-1 rounded-full text-xs font-semibold">
                    {getStatusPill(executionItem.status)}
                </div>
            </div>
            
            {/* Asset Preview */}
            <div className="bg-gray-900/50 p-4 rounded-md mb-4 border border-gray-700/70">
                <p className="text-xs text-gray-400 font-semibold mb-2 uppercase">Asset Preview</p>
                <p className="font-semibold text-gray-200">{mainAsset.content.headline || mainAsset.assetType}</p>
                <p className="text-sm text-gray-400 mt-1 line-clamp-2">{mainAsset.content.bodyCopy || mainAsset.content.caption}</p>
            </div>

            {/* Scheduling */}
            <div>
                <label htmlFor={`schedule-${channel.channelName}`} className="text-sm font-medium text-gray-300">
                    Schedule
                </label>
                <input
                    id={`schedule-${channel.channelName}`}
                    type="datetime-local"
                    disabled={isPublished}
                    onChange={handleDateTimeChange}
                    value={executionItem.scheduledTime ? executionItem.scheduledTime.toISOString().slice(0, 16) : ''}
                    placeholder="Publish Now"
                    className="mt-1 w-full p-2 bg-gray-900 border border-gray-600 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-gray-200 disabled:opacity-50"
                />
            </div>
            {executionItem.status === 'failed' && (
                <p className="text-xs text-red-400 mt-2">Error: {executionItem.error}</p>
            )}
        </div>
    );
};