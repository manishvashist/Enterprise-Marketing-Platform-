import React from 'react';
import { ChannelConnection, User } from '../types';
import { FacebookIcon } from './icons/FacebookIcon';
import { GoogleAdsIcon } from './icons/GoogleAdsIcon';
import { MailchimpIcon } from './icons/MailchimpIcon';
import { LinkedInIcon } from './icons/LinkedInIcon';
import { XIcon } from './icons/XIcon';
import { TikTokIcon } from './icons/TikTokIcon';
import { GoogleAnalyticsIcon } from './icons/GoogleAnalyticsIcon';

interface ChannelConnectionCardProps {
    channel: ChannelConnection;
    user: User;
    onConnect: () => void;
    onDisconnect: () => void;
}

const iconMap: Record<string, React.FC<React.SVGProps<SVGSVGElement>>> = {
    facebook: FacebookIcon,
    google_ads: GoogleAdsIcon,
    mailchimp: MailchimpIcon,
    linkedin: LinkedInIcon,
    x_twitter: XIcon,
    tiktok: TikTokIcon,
    google_analytics: GoogleAnalyticsIcon,
};

export const getIcon = (channelId: string) => {
    const Icon = iconMap[channelId];
    return Icon ? <Icon className="w-8 h-8" /> : null;
};

export const ChannelConnectionCard: React.FC<ChannelConnectionCardProps> = ({ channel, user, onConnect, onDisconnect }) => {
    const isConnected = channel.connectionStatus === 'connected';
    const isUserRole = user.role === 'User';

    return (
        <div className="bg-gray-800 rounded-lg p-5 border border-gray-700 flex flex-col justify-between shadow-md hover:shadow-lg hover:border-indigo-500/50 transition-all duration-300">
            <div>
                <div className="flex items-start justify-between">
                    <div className="w-12 h-12 flex items-center justify-center rounded-lg bg-gray-700">
                        {getIcon(channel.channelId)}
                    </div>
                    <div className={`px-2 py-0.5 rounded-full text-xs font-semibold ${
                        isConnected ? 'bg-green-900/70 text-green-300' : 'bg-gray-700 text-gray-300'
                    }`}>
                        {isConnected ? 'Connected' : 'Disconnected'}
                    </div>
                </div>
                <h3 className="text-lg font-bold text-white mt-4">{channel.channelName}</h3>
                {isConnected && channel.connectedAccount ? (
                     <p className="text-sm text-gray-400 mt-1 truncate">
                        Account: <span className="font-medium text-gray-200">{channel.connectedAccount.accountName}</span>
                     </p>
                ) : (
                    <p className="text-sm text-gray-500 mt-1">Connect to publish campaigns.</p>
                )}
            </div>
            <div className="mt-6">
                {isConnected ? (
                     <button
                        onClick={onDisconnect}
                        disabled={isUserRole}
                        title={isUserRole ? "You do not have permission to manage connections." : ""}
                        className="w-full px-4 py-2 bg-red-800/80 text-white font-semibold rounded-md hover:bg-red-700 disabled:bg-gray-600 disabled:cursor-not-allowed transition-colors text-sm"
                    >
                        Disconnect
                    </button>
                ) : (
                    <button
                        onClick={onConnect}
                        disabled={isUserRole}
                        title={isUserRole ? "You do not have permission to manage connections." : ""}
                        className="w-full px-4 py-2 bg-indigo-600 text-white font-semibold rounded-md hover:bg-indigo-700 disabled:bg-gray-600 disabled:cursor-not-allowed transition-colors text-sm"
                    >
                        Connect
                    </button>
                )}
            </div>
        </div>
    );
};
