import React from 'react';
import { AvailableAccount, ConnectedAccount } from '../types';

interface AccountSelectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  channelName: string;
  accounts: AvailableAccount[];
  onSelect: (account: ConnectedAccount) => void;
}

export const AccountSelectionModal: React.FC<AccountSelectionModalProps> = ({ isOpen, onClose, channelName, accounts, onSelect }) => {
  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div 
        className="bg-gray-800 rounded-lg shadow-xl w-full max-w-lg border border-gray-700 animate-fade-in-up"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-6 border-b border-gray-700">
          <h2 className="text-xl font-bold text-white">Connect {channelName}</h2>
          <p className="text-gray-400 mt-1 text-sm">Select the account you want to use for your campaigns.</p>
        </div>
        
        <div className="p-6 max-h-[60vh] overflow-y-auto">
          {accounts.length > 0 ? (
            <div className="space-y-3">
              {accounts.map(account => (
                <button
                  key={account.accountId}
                  onClick={() => onSelect({ accountId: account.accountId, accountName: account.accountName, followers: account.followers })}
                  className="w-full text-left p-4 bg-gray-900 rounded-md border border-gray-700 hover:bg-gray-700/50 hover:border-indigo-500 transition-all"
                >
                  <p className="font-semibold text-white">{account.accountName}</p>
                  <div className="flex items-center text-xs text-gray-400 mt-1 space-x-4">
                    <span>Type: <span className="font-medium text-gray-300 capitalize">{account.accountType}</span></span>
                    {account.followers && (
                      <span>Followers: <span className="font-medium text-gray-300">{account.followers.toLocaleString()}</span></span>
                    )}
                  </div>
                </button>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-center">No available accounts found for this channel.</p>
          )}
        </div>

        <div className="p-4 bg-gray-900/50 border-t border-gray-700 text-right">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-600 text-white font-semibold rounded-md hover:bg-gray-500 transition-colors text-sm"
          >
            Cancel
          </button>
        </div>
      </div>
       <style>{`
        @keyframes fadeInTop {
            from { opacity: 0; transform: translateY(-20px); }
            to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in-up {
            animation: fadeInTop 0.3s ease-out forwards;
        }
    `}</style>
    </div>
  );
};