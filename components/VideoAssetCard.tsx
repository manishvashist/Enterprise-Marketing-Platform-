import React from 'react';

interface VideoAssetCardProps {
    channelName: string;
    videoUrl: string;
}

export const VideoAssetCard: React.FC<VideoAssetCardProps> = ({ channelName, videoUrl }) => {
    return (
        <div className="bg-gray-900/50 rounded-lg p-4 border border-gray-700/80">
            <h5 className="font-bold text-base text-purple-300 mb-3">{channelName} - Video Ad</h5>
            <div className="aspect-video bg-black rounded-md overflow-hidden">
                <video
                    src={videoUrl}
                    controls
                    className="w-full h-full object-contain"
                    preload="metadata"
                >
                    Your browser does not support the video tag.
                </video>
            </div>
        </div>
    );
};
