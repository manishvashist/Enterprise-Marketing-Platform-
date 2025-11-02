

import React, { useState, useMemo } from 'react';
import { ChannelConnection, ConnectedAccount, User } from '../types';
import { availableAccounts } from '../data/channels';
import { ChannelConnectionCard } from './ChannelConnectionCard';
import { AccountSelectionModal } from './AccountSelectionModal';
import { AuthModal } from './AuthModal';
import { authService } from '../services/authService';

interface ConnectionsViewProps {
  user: User;
  onUserUpdate: (user: User) => void;
}

export const ConnectionsView: React.FC<ConnectionsViewProps> = ({ user, onUserUpdate }) => {
  const [authStep, setAuthStep] = useState<'auth' | 'account_selection' | null>(null);
  const [selectedChannel, setSelectedChannel] = useState<ChannelConnection | null>(null);

  const handleConnectClick = (channel: ChannelConnection) => {
    if (user.role === 'User') return;
    setSelectedChannel(channel);
    setAuthStep('auth');
  };
  
  const handleCloseModals = () => {
    setAuthStep(null);
    setSelectedChannel(null);
  };

  const handleAuthSuccess = async () => {
    if (!selectedChannel) return;

    const potentialAccounts = availableAccounts[selectedChannel.channelId] || [];
    
    // If there are accounts to choose from, show the selection modal.
    if (potentialAccounts.length > 0) {
        setAuthStep('account_selection');
    } else {
        // If no specific accounts are listed, connect with a generic one.
        const updatedUser = await authService.updateUserConnection(user.id, selectedChannel.channelId, { 
            accountId: `${selectedChannel.channelId}_acct`, 
            accountName: `${selectedChannel.channelName} Account` 
        });
        if (updatedUser) onUserUpdate(updatedUser);
        handleCloseModals();
    }
  };

  const handleAccountSelect = async (account: ConnectedAccount) => {
    if (selectedChannel) {
        const updatedUser = await authService.updateUserConnection(user.id, selectedChannel.channelId, account);
        if (updatedUser) onUserUpdate(updatedUser);
    }
    handleCloseModals();
  };

  const handleDisconnect = async (channelId: string) => {
    if (user.role === 'User') return;
    const updatedUser = await authService.updateUserConnection(user.id, channelId, null);
    if (updatedUser) onUserUpdate(updatedUser);
  };


  const groupedConnections = useMemo(() => {
    // FIX: Explicitly type 'conn' to resolve type inference issue.
    return Object.values(user.channelConnections).reduce((acc, conn: ChannelConnection) => {
      const category = conn.category;
      if (!acc[category]) {
        acc[category] = [];
      }
      acc[category].push(conn);
      return acc;
    }, {} as Record<string, ChannelConnection[]>);
  }, [user.channelConnections]);

  return (
    <div className="w-full max-w-6xl mx-auto animate-fade-in">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white">Channel Connections</h1>
        <p className="text-gray-400 mt-2">
          Connect your marketing and advertising accounts to enable direct campaign execution from the platform.
        </p>
      </div>

      <div className="space-y-8">
        {/* FIX: Explicitly type `channels` to resolve the 'unknown' type error. */}
        {Object.entries(groupedConnections).map(([category, channels]: [string, ChannelConnection[]]) => (
          <div key={category}>
            <h2 className="text-xl font-semibold text-indigo-300 mb-4">{category}</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {channels.map(channel => (
                <ChannelConnectionCard 
                  key={channel.channelId}
                  channel={channel}
                  user={user}
                  onConnect={() => handleConnectClick(channel)}
                  onDisconnect={() => handleDisconnect(channel.channelId)}
                />
              ))}
            </div>
          </div>
        ))}
      </div>
      
      {selectedChannel && (
         <>
            <AuthModal
                isOpen={authStep === 'auth'}
                onClose={handleCloseModals}
                channel={selectedChannel}
                onAuthSuccess={handleAuthSuccess}
            />
            <AccountSelectionModal
                isOpen={authStep === 'account_selection'}
                onClose={handleCloseModals}
                channelName={selectedChannel.channelName}
                accounts={availableAccounts[selectedChannel.channelId] || []}
                onSelect={handleAccountSelect}
            />
         </>
      )}
    </div>
  );
};

// Add a simple fade-in animation
const styles = `
@keyframes fadeIn {
    from { opacity: 0; transform: translateY(10px); }
    to { opacity: 1; transform: translateY(0); }
}
.animate-fade-in {
    animation: fadeIn 0.5s ease-out forwards;
}
`;
const styleSheet = document.createElement("style");
styleSheet.innerText = styles;
document.head.appendChild(styleSheet);