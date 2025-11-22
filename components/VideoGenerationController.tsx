
import React from 'react';
// FIX: Import VideoAssetState from types.ts to solve module resolution and circular dependency issues.
import { Channel, VideoAssetState } from '../types';
import { VideoCameraIcon } from './icons/VideoCameraIcon';
import { TaskProgressBar } from './TaskProgressBar';

interface VideoGenerationControllerProps {
    recommendedChannels: (Channel & { category: string })[];
    videoAssets: Record<string, VideoAssetState>;
    onGenerateVideo: (channelName: string) => void;
    isApiKeySelected: boolean;
}

const VIDEO_CAPABLE_CHANNELS = [
    'TikTok',
    'YouTube',
    'Instagram',
    'Facebook',
    'TV',
    'In-Airport Digital Screens',
    'LinkedIn',
    'LinkedIn Ads',
    'X (Twitter) Ads',
    'Display Ads'
];

const channelConfigs: Record<string, { icon: string }> = {
    'Instagram': { icon: '📸' },
    'Facebook': { icon: '👥' },
    'TikTok': { icon: '🎵' },
    'YouTube': { icon: '📺' },
    'TV': { icon: '📺' },
    'In-Airport Digital Screens': { icon: '✈️' },
    'LinkedIn': { icon: '💼' },
    'LinkedIn Ads': { icon: '💼' },
    'X (Twitter) Ads': { icon: '✖️' },
    'Display Ads': { icon: '🖼️' },
    'default': { icon: '✨' }
};

export const VideoGenerationController: React.FC<VideoGenerationControllerProps> = ({
    recommendedChannels,
    videoAssets,
    onGenerateVideo,
    isApiKeySelected,
}) => {
    const videoChannels = recommendedChannels.filter(ch => VIDEO_CAPABLE_CHANNELS.includes(ch.channelName));

    if (videoChannels.length === 0) {
        return null;
    }

    const handleSelectKey = () => {
        if (window.aistudio) {
            window.aistudio.openSelectKey();
        }
    };

    return (
        <div className="mt-8 bg-white rounded-xl p-6 border border-slate-200 shadow-sm">
            <div className="flex items-center space-x-3 mb-4">
                <VideoCameraIcon className="w-6 h-6 text-purple-600" />
                <h3 className="font-bold text-lg text-slate-900">AI-Powered Video Factory</h3>
            </div>

            {!isApiKeySelected && (
                 <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6 text-sm text-yellow-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div>
                        <p className="font-bold text-yellow-900">API Key Required for Video Generation</p>
                        <p className="text-yellow-700 mt-1">
                            The Veo model requires a personal API key. Please select a key to enable video generation.
                            For more details on billing, visit{' '}
                            <a href="https://ai.google.dev/gemini-api/docs/billing" target="_blank" rel="noopener noreferrer" className="underline hover:text-yellow-900 font-medium">
                                ai.google.dev/gemini-api/docs/billing
                            </a>.
                        </p>
                    </div>
                    <button
                        onClick={handleSelectKey}
                        className="flex-shrink-0 px-4 py-2 bg-yellow-600 text-white font-semibold rounded-md hover:bg-yellow-700 transition-colors shadow-sm"
                    >
                        Select API Key
                    </button>
                </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {videoChannels.map(channel => {
                    const state = videoAssets[channel.channelName] || { status: 'pending' };
                    const config = channelConfigs[channel.channelName] || channelConfigs.default;
                    const isLoading = state.status === 'loading';

                    return (
                        <div key={channel.channelName} className="bg-slate-50 rounded-lg p-4 flex flex-col justify-between border border-slate-200">
                           <div className="w-full">
                                <div className="flex items-center space-x-3 mb-3">
                                    <span className="text-2xl">{config.icon}</span>
                                    <p className="font-bold text-slate-800">{channel.channelName}</p>
                                </div>
                                <div className="min-h-[3em] flex items-center w-full">
                                    {isLoading ? (
                                        <TaskProgressBar 
                                            estimatedDuration={60} 
                                            label="Generating..." 
                                            progressColor="bg-purple-600"
                                        />
                                    ) : state.status === 'error' ? (
                                        <p className="text-xs text-red-600">{state.error}</p>
                                    ) : state.status === 'done' ? (
                                        <p className="text-xs text-green-600 font-medium">✓ Video generation complete.</p>
                                    ) : (
                                        <p className="text-xs text-slate-500">Generate a short video asset for this channel.</p>
                                    )}
                                </div>
                           </div>
                           {!isLoading && (
                               <button
                                    onClick={() => onGenerateVideo(channel.channelName)}
                                    disabled={isLoading || !isApiKeySelected}
                                    className="mt-4 w-full px-4 py-2 bg-purple-600 text-white font-semibold rounded-md hover:bg-purple-700 disabled:bg-slate-300 disabled:cursor-not-allowed transition-colors flex items-center justify-center shadow-sm text-sm"
                               >
                                   Generate Video
                               </button>
                           )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
};
