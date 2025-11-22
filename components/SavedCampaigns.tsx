import React, { useState } from 'react';
import { Campaign, User } from '../types';
import { CampaignCard } from './CampaignCard';
import { ConfirmationModal } from './ConfirmationModal';
import { InformationCircleIcon } from './icons/HeroIcons';

interface SavedCampaignsProps {
  user: User;
  campaigns: Campaign[];
  onLoad: (campaign: Campaign) => void;
  onEdit: (campaign: Campaign) => void;
  onDelete: (campaignId: string) => void;
  isFetching: boolean;
  deletingId: string | null;
  onSetGlobalSuccess: (message: string | null) => void;
}

export const SavedCampaigns: React.FC<SavedCampaignsProps> = ({ user, campaigns, onLoad, onEdit, onDelete, isFetching, deletingId, onSetGlobalSuccess }) => {
  const [campaignToDelete, setCampaignToDelete] = useState<Campaign | null>(null);

  const handleDeleteRequest = (campaign: Campaign) => {
    setCampaignToDelete(campaign);
  };

  const handleConfirmDelete = () => {
    if (campaignToDelete?.id) {
      onDelete(campaignToDelete.id);
    }
    setCampaignToDelete(null);
  };

  const renderContent = () => {
    if (isFetching) {
      return (
        <div className="text-center py-12">
          <svg className="animate-spin h-8 w-8 text-orange-600 mx-auto mb-3" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <p className="text-slate-500">Loading saved campaigns...</p>
        </div>
      );
    }

    if (campaigns.length === 0) {
      return (
        <div className="text-center py-12 border-2 border-dashed border-slate-300 rounded-lg bg-slate-50">
          <h4 className="text-lg font-semibold text-slate-700">No Saved Campaigns</h4>
          <p className="text-slate-500 mt-1">Generate your first campaign above to get started!</p>
        </div>
      );
    }
    
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {campaigns.map(c => (
          <CampaignCard 
            key={c.id}
            campaign={c}
            onLoad={onLoad}
            onEdit={onEdit}
            onDelete={handleDeleteRequest}
            isDeleting={deletingId === c.id}
            isTrial={c.isTrialCampaign}
          />
        ))}
      </div>
    );
  };

  return (
    <>
      <ConfirmationModal
        isOpen={!!campaignToDelete}
        onClose={() => setCampaignToDelete(null)}
        onConfirm={handleConfirmDelete}
        title={`Move "${campaignToDelete?.name}" to Trash?`}
      >
        <p className="text-slate-600">Are you sure you want to delete this campaign? It will be hidden from view but not permanently erased (soft delete).</p>
        <div className="mt-3 flex items-start space-x-2 text-xs p-2 bg-slate-50 border border-slate-200 rounded-md">
            <InformationCircleIcon className="w-5 h-5 text-slate-400 flex-shrink-0" />
            <p className="text-slate-500">
                This action will not affect your campaign usage quota. Usage data is preserved for billing and analytics.
            </p>
        </div>
      </ConfirmationModal>

      <div className="w-full max-w-6xl mx-auto mt-12 mb-8 animate-fade-in">
        <div className="mb-6 border-b border-slate-200 pb-2">
          <h2 className="text-2xl font-bold text-slate-900">Your Saved Campaigns</h2>
          <p className="text-slate-500">Load a previous campaign to continue working or view its assets.</p>
        </div>
        {renderContent()}
      </div>
    </>
  );
};