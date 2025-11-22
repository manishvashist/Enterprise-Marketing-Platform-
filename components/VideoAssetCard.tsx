import React from 'react';

interface VideoAssetCardProps {
    channelName: string;
    videoUrl: string;
}

export const VideoAssetCard: React.FC<VideoAssetCardProps> = ({ channelName, videoUrl }) => {
    return (
        <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-sm">
            <h5 className="font-bold text-base text-purple-700 mb-3">{channelName} - Video Ad</h5>
            <div className="aspect-video bg-black rounded-lg overflow-hidden shadow-md">
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