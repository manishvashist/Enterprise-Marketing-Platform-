import React from 'react';
import { Campaign } from '../types';
import { PencilSquareIcon, EyeIcon, TrashIcon } from './icons/HeroIcons';

interface CampaignCardProps {
  campaign: Campaign;
  onLoad: (campaign: Campaign) => void;
  onEdit: (campaign: Campaign) => void;
  onDelete: (campaign: Campaign) => void;
  isDeleting: boolean;
  isTrial: boolean;
}

const truncate = (str: string | null | undefined, maxLength: number): string => {
  if (!str) return '';
  if (str.length <= maxLength) return str;
  return str.substring(0, maxLength) + '...';
};

const ActionButton: React.FC<{ icon: React.ReactNode; label: string; onClick: (e: React.MouseEvent) => void; disabled: boolean; className: string; }> = ({ icon, label, onClick, disabled, className }) => (
    <button
        onClick={onClick}
        disabled={disabled}
        className={`flex items-center justify-center space-x-2 px-3 py-1.5 text-xs font-semibold rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${className}`}
    >
        {icon}
        <span>{label}</span>
    </button>
);

const Spinner = () => (
    <svg className="animate-spin h-4 w-4 text-slate-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
    </svg>
);

export const CampaignCard: React.FC<CampaignCardProps> = ({ campaign, onLoad, onEdit, onDelete, isDeleting, isTrial }) => {
  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    onDelete(campaign);
  };

  const handleActionClick = (e: React.MouseEvent, action: () => void) => {
      e.stopPropagation();
      action();
  };

  const cardClasses = `
    bg-white rounded-lg p-5 border border-slate-200 flex flex-col justify-between shadow-sm 
    transition-all duration-300 group hover:shadow-lg hover:border-orange-200 hover:-translate-y-1
  `;

  return (
    <div className={cardClasses} title={`Campaign: ${campaign.name}`}>
      <div className="flex-grow">
        <div className="flex justify-between items-start">
            <h3 className="text-lg font-bold text-slate-900 group-hover:text-orange-600 transition-colors pr-2 line-clamp-2 flex-grow">{campaign.name}</h3>
             {isTrial && (
                <span className="flex-shrink-0 text-xs font-semibold bg-yellow-100 text-yellow-700 px-2 py-0.5 rounded-full border border-yellow-200">Trial</span>
             )}
        </div>
        <p className="text-xs text-slate-400 mt-1">
            Created: {new Date(campaign.createdAt!).toLocaleDateString()}
        </p>

        <div className="mt-4 space-y-4">
            <p className="text-sm text-slate-600 h-20">{truncate(campaign.description, 150)}</p>
            <div>
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Target Audience</p>
                <p className="text-sm text-slate-700 mt-1 italic line-clamp-2">"{campaign.audienceQuery}"</p>
            </div>
        </div>
      </div>

      <div className="mt-5 pt-4 border-t border-slate-100 flex justify-end items-center space-x-2">
        <ActionButton 
            icon={<EyeIcon className="w-4 h-4" />} 
            label="View" 
            onClick={(e) => handleActionClick(e, () => onLoad(campaign))}
            disabled={isDeleting}
            className="text-slate-500 hover:bg-slate-50 hover:text-slate-900"
        />
        <ActionButton 
            icon={<PencilSquareIcon className="w-4 h-4" />} 
            label="Edit" 
            onClick={(e) => handleActionClick(e, () => onEdit(campaign))}
            disabled={isDeleting}
            className="text-slate-500 hover:bg-slate-50 hover:text-slate-900"
        />
         <ActionButton 
            icon={isDeleting ? <Spinner /> : <TrashIcon className="w-4 h-4" />}
            label={isDeleting ? '' : 'Delete'}
            onClick={handleDelete}
            disabled={isDeleting}
            className="text-red-500 hover:bg-red-50 hover:text-red-600 w-[75px] justify-center"
        />
      </div>
    </div>
  );
};