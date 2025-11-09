
import React from 'react';
import { MicrophoneIcon } from './icons/MicrophoneIcon';
import { User, UsageInfo } from '../types';
import { FolderOpenIcon } from './icons/FolderOpenIcon';

interface CampaignInputProps {
  user: User;
  goalPrompt: string;
  setGoalPrompt: (prompt: string) => void;
  audiencePrompt: string;
  setAudiencePrompt: (prompt: string) => void;
  onGenerate: () => void;
  isLoading: boolean;
  recordingField: 'goal' | 'audience' | null;
  onToggleRecording: (field: 'goal' | 'audience') => void;
  onToggleLoadModal: () => void;
  usageInfo: UsageInfo | null;
}

export const CampaignInput: React.FC<CampaignInputProps> = ({ 
  user,
  goalPrompt, 
  setGoalPrompt, 
  audiencePrompt, 
  setAudiencePrompt, 
  onGenerate, 
  isLoading,
  recordingField,
  onToggleRecording,
  onToggleLoadModal,
  usageInfo,
}) => {
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
      e.preventDefault();
      onGenerate();
    }
  };

  const MicButton: React.FC<{field: 'goal' | 'audience'}> = ({ field }) => {
    const isRecording = recordingField === field;
    return (
      <button
        onClick={() => onToggleRecording(field)}
        disabled={isLoading}
        className={`absolute right-3 bottom-3 p-2 rounded-full transition-all duration-300 ${
          isRecording 
            ? 'bg-indigo-600 text-white animate-pulse-ring scale-110' 
            : 'bg-slate-700 text-gray-400 hover:bg-slate-600 hover:text-white'
        } disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500`}
        aria-label={isRecording ? `Stop recording ${field}` : `Start recording ${field}`}
      >
        <MicrophoneIcon className="w-5 h-5" />
      </button>
    );
  };
  
  const isGenerateDisabled = isLoading || !goalPrompt.trim() || !audiencePrompt.trim() || !usageInfo?.canGenerate;
  const generateButtonTooltip = (): string => {
      if (!usageInfo) return "Checking usage limits...";
      if (usageInfo.canGenerate) return "";
      switch (usageInfo.reason) {
          case 'quota_exceeded': return "You've reached your campaign limit for this period.";
          case 'trial_expired': return "Your free trial has ended. Please subscribe to continue.";
          case 'subscription_required': return "A subscription is required to generate campaigns.";
          default: return "Cannot generate campaign at this time.";
      }
  };

  return (
    <div className="bg-slate-800/50 rounded-xl shadow-lg p-6 md:p-8 border border-white/10">
      <h2 className="text-2xl font-bold mb-1 text-white">Generative Campaign Builder</h2>
      <p className="text-gray-400 mb-6">Define your goal and audience to let our AI build your next campaign.</p>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="relative">
          <label htmlFor="campaign-goal" className="block text-sm font-medium text-gray-300 mb-2">
            1. Describe your campaign goal
          </label>
          <textarea
            id="campaign-goal"
            value={goalPrompt}
            onChange={(e) => setGoalPrompt(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={`e.g., "Increase e-commerce sales by 15% in Q3"`}
            className="w-full h-32 p-4 pr-14 bg-slate-900 border border-slate-700 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all resize-none text-gray-200 placeholder-gray-500"
            disabled={isLoading}
          />
          <MicButton field="goal" />
        </div>

        <div className="relative">
            <label htmlFor="target-audience" className="block text-sm font-medium text-gray-300 mb-2">
                2. Define your target audience
            </label>
            <textarea
                id="target-audience"
                value={audiencePrompt}
                onChange={(e) => setAudiencePrompt(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={`e.g., "Customers who viewed product X but didn't purchase"`}
                className="w-full h-32 p-4 pr-14 bg-slate-900 border border-slate-700 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all resize-none text-gray-200 placeholder-gray-500"
                disabled={isLoading}
            />
            <MicButton field="audience" />
        </div>
      </div>

      <div className="mt-8 flex justify-between items-center">
        <p className="text-xs text-gray-500 hidden sm:block">
            Pro-tip: Use <kbd className="font-sans px-1.5 py-0.5 border border-slate-600 rounded bg-slate-700/50">Ctrl</kbd> + <kbd className="font-sans px-1.5 py-0.5 border border-slate-600 rounded bg-slate-700/50">Enter</kbd> to generate.
        </p>
        <div className="flex items-center gap-4 w-full sm:w-auto">
            {user.role !== 'User' && (
                <button
                    onClick={onToggleLoadModal}
                    disabled={isLoading}
                    className="px-4 py-2.5 bg-slate-700 text-white font-semibold rounded-md hover:bg-slate-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center gap-2"
                >
                    <FolderOpenIcon className="w-5 h-5" />
                    <span className="hidden md:inline">Load Campaign</span>
                </button>
            )}
            <div className="relative w-full sm:w-auto" title={generateButtonTooltip()}>
                <button
                  onClick={onGenerate}
                  disabled={isGenerateDisabled}
                  className="w-full px-8 py-3 bg-indigo-600 text-white font-bold rounded-lg hover:bg-indigo-500 disabled:bg-slate-600 disabled:cursor-not-allowed transition-all shadow-lg shadow-indigo-600/20 hover:shadow-xl hover:shadow-indigo-600/30 flex items-center justify-center"
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
                    '✨ Generate Campaign'
                  )}
                </button>
            </div>
        </div>
      </div>
    </div>
  );
};

const styles = `
@keyframes pulse-ring {
  0% { box-shadow: 0 0 0 0 rgba(165, 180, 252, 0.4); }
  70% { box-shadow: 0 0 0 10px rgba(165, 180, 252, 0); }
  100% { box-shadow: 0 0 0 0 rgba(165, 180, 252, 0); }
}
.animate-pulse-ring {
  animation: pulse-ring 1.5s infinite;
}
`;
const styleSheet = document.createElement("style");
styleSheet.innerText = styles;
document.head.appendChild(styleSheet);