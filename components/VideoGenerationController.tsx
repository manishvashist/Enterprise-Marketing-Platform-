import React from 'react';
import { Channel } from '../types';
import { VideoAssetState } from '../App';
import { VideoCameraIcon } from './icons/VideoCameraIcon';

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
        <div className="mt-8 bg-gray-700/50 rounded-lg p-6 border border-gray-600/50">
            <div className="flex items-center space-x-3 mb-4">
                <VideoCameraIcon className="w-6 h-6 text-purple-400" />
                <h3 className="font-semibold text-lg text-white">AI-Powered Video Factory</h3>
            </div>

            {!isApiKeySelected && (
                 <div className="bg-yellow-900/30 border border-yellow-700 rounded-lg p-4 mb-6 text-sm text-yellow-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div>
                        <p className="font-semibold">API Key Required for Video Generation</p>
                        <p className="text-yellow-300/80 mt-1">
                            The Veo model requires a personal API key. Please select a key to enable video generation.
                            For more details on billing, visit{' '}
                            <a href="https://ai.google.dev/gemini-api/docs/billing" target="_blank" rel="noopener noreferrer" className="underline hover:text-yellow-100">
                                ai.google.dev/gemini-api/docs/billing
                            </a>.
                        </p>
                    </div>
                    <button
                        onClick={handleSelectKey}
                        className="flex-shrink-0 px-4 py-2 bg-yellow-600 text-white font-semibold rounded-md hover:bg-yellow-700 transition-colors"
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
                        <div key={channel.channelName} className="bg-gray-800 rounded-lg p-4 flex flex-col justify-between border border-gray-700">
                           <div>
                                <div className="flex items-center space-x-3 mb-3">
                                    <span className="text-2xl">{config.icon}</span>
                                    <p className="font-semibold text-gray-100">{channel.channelName}</p>
                                </div>
                                <div className="text-xs text-gray-400 min-h-[3em] flex items-center">
                                    {isLoading ? (
                                        <p>{state.progressMessage}</p>
                                    ) : state.status === 'error' ? (
                                        <p className="text-red-400">{state.error}</p>
                                    ) : state.status === 'done' ? (
                                        <p className="text-green-400">✓ Video generation complete.</p>
                                    ) : (
                                        <p>Generate a short video asset for this channel.</p>
                                    )}
                                </div>
                           </div>
                           <button
                                onClick={() => onGenerateVideo(channel.channelName)}
                                disabled={isLoading || !isApiKeySelected}
                                className="mt-4 w-full px-4 py-2 bg-purple-600 text-white font-semibold rounded-md hover:bg-purple-700 disabled:bg-gray-600 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
                           >
                               {isLoading ? (
                                <>
                                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    Generating...
                                </>
                               ) : (
                                 'Generate Video'
                               )}
                           </button>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};
