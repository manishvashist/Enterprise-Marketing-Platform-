
import React from 'react';
import { Campaign, User } from '../types';

interface LoadCampaignModalProps {
  isOpen: boolean;
  onClose: () => void;
  campaigns: Campaign[];
  onLoad: (campaign: Campaign) => void;
  onDelete: (campaignId: string) => void;
  user: User;
  isFetching: boolean;
  deletingId: string | null;
}

export const LoadCampaignModal: React.FC<LoadCampaignModalProps> = ({
  isOpen,
  onClose,
  campaigns,
  onLoad,
  onDelete,
  user,
  isFetching,
  deletingId,
}) => {
  if (!isOpen) return null;

  const handleDelete = (e: React.MouseEvent, campaignId: string) => {
    e.stopPropagation(); // Prevent the row click from firing
    if (window.confirm("Are you sure you want to delete this campaign? This action cannot be undone.")) {
        onDelete(campaignId);
    }
  }

  return (
    <div 
      className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div 
        className="bg-gray-800 rounded-lg shadow-xl w-full max-w-2xl border border-gray-700 animate-fade-in-up"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-6 border-b border-gray-700">
          <h2 className="text-xl font-bold text-white">Load Saved Campaign</h2>
          <p className="text-gray-400 mt-1 text-sm">Select a previously saved campaign to continue working on it.</p>
        </div>
        
        <div className="p-6 max-h-[60vh] overflow-y-auto">
          {isFetching ? (
            <div className="text-center py-8">
                <svg className="animate-spin h-8 w-8 text-indigo-400 mx-auto mb-3" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <p className="text-gray-400">Loading saved campaigns...</p>
            </div>
          ) : campaigns.length > 0 ? (
            <div className="space-y-3">
              {campaigns.map(c => {
                const isDeleting = deletingId === c.id;
                return (
                    <div
                    key={c.id}
                    onClick={() => !c.isTrialCampaign && onLoad(c)}
                    title={c.isTrialCampaign ? "Trial campaigns cannot be loaded or edited." : ""}
                    className={`w-full text-left p-4 bg-gray-900 rounded-md border border-gray-700 flex justify-between items-center transition-all ${c.isTrialCampaign ? 'opacity-60 cursor-not-allowed' : 'hover:bg-gray-700/50 hover:border-indigo-500 cursor-pointer'}`}
                    >
                        <div>
                            <div className="flex items-center gap-3">
                                <p className="font-semibold text-white">{c.name}</p>
                                {c.isTrialCampaign && (
                                    <span className="text-xs font-semibold bg-yellow-800/80 text-yellow-300 px-2 py-0.5 rounded-full">Trial</span>
                                )}
                            </div>
                            <p className="text-sm text-gray-400 mt-1 line-clamp-1">{c.description}</p>
                            <p className="text-xs text-gray-500 mt-2">Last updated: {new Date(c.updatedAt!).toLocaleString()}</p>
                        </div>
                        {user.role !== 'User' && (
                            <button
                                onClick={(e) => handleDelete(e, c.id!)}
                                disabled={isDeleting}
                                className="ml-4 flex-shrink-0 px-3 py-1.5 bg-red-800/80 text-white font-semibold rounded-md hover:bg-red-700 transition-colors text-xs w-20 flex justify-center items-center disabled:bg-gray-600"
                            >
                                {isDeleting ? (
                                    <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                ) : 'Delete'}
                            </button>
                        )}
                    </div>
                );
            })}
            </div>
          ) : (
            <p className="text-gray-500 text-center py-8">You have no saved campaigns.</p>
          )}
        </div>

        <div className="p-4 bg-gray-900/50 border-t border-gray-700 text-right">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-600 text-white font-semibold rounded-md hover:bg-gray-500 transition-colors text-sm"
          >
            Close
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
