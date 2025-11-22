import React from 'react';
import { AvailableAccount, ConnectedAccount } from '../types';
import { UsersIcon } from './icons/UsersIcon';
import { CashIcon } from './icons/CashIcon';

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
                  onClick={() => onSelect(account)}
                  className="w-full text-left p-4 bg-gray-900 rounded-md border border-gray-700 hover:bg-gray-700/50 hover:border-indigo-500 transition-all"
                >
                  <div className="flex justify-between items-start">
                      <p className="font-semibold text-white pr-4">{account.accountName}</p>
                      <span className="flex-shrink-0 text-xs bg-gray-700 text-gray-300 px-2 py-1 rounded-full capitalize">{account.accountType.replace('_', ' ')}</span>
                  </div>

                  <div className="mt-3 pt-3 border-t border-gray-700/50 space-y-2">
                      {account.followers != null && (
                          <div className="flex items-center text-sm text-gray-400">
                              <UsersIcon className="w-4 h-4 mr-2 text-gray-500" />
                              <span>{account.followers.toLocaleString()} followers</span>
                          </div>
                      )}

                      {/* Details for when the account itself is an ad_account */}
                      {account.accountType === 'ad_account' && (
                          <>
                              {account.totalSpend != null && (
                                  <div className="flex items-center text-sm text-gray-400">
                                      <CashIcon className="w-4 h-4 mr-2 text-gray-500" />
                                      <span><strong>Lifetime Spend:</strong> {account.currency} {account.totalSpend.toLocaleString(undefined, { maximumFractionDigits: 2 })}</span>
                                  </div>
                              )}
                              {account.balance != null && (
                                  <div className="flex items-center text-sm text-gray-400">
                                      <CashIcon className="w-4 h-4 mr-2 text-gray-500" />
                                      <span><strong>Balance:</strong> {account.currency} {account.balance.toLocaleString(undefined, { maximumFractionDigits: 2 })}</span>
                                  </div>
                              )}
                          </>
                      )}

                      {/* Details for nested ad accounts (e.g., under a Facebook Page) */}
                      {account.adAccounts && account.adAccounts.map(adAcct => (
                          <div key={adAcct.adAccountId} className="p-2 bg-gray-800/50 rounded-md mt-2">
                              <p className="text-xs font-semibold text-indigo-300 mb-1">{adAcct.adAccountName}</p>
                              {adAcct.totalSpend != null && (
                                  <div className="flex items-center text-xs text-gray-400">
                                      <CashIcon className="w-3 h-3 mr-1.5 text-gray-500" />
                                      <span><strong>Spend:</strong> {adAcct.currency} {adAcct.totalSpend.toLocaleString(undefined, { maximumFractionDigits: 2 })}</span>
                                  </div>
                              )}
                              {adAcct.balance != null && (
                                  <div className="flex items-center text-xs text-gray-400 mt-1">
                                      <CashIcon className="w-3 h-3 mr-1.5 text-gray-500" />
                                      <span><strong>Balance:</strong> {adAcct.currency} {adAcct.balance.toLocaleString(undefined, { maximumFractionDigits: 2 })}</span>
                                  </div>
                              )}
                          </div>
                      ))}
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
    </div>
  );
};
