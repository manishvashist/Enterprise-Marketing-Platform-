import React from 'react';
import { MicrophoneIcon } from './icons/MicrophoneIcon';
import { User, UsageInfo } from '../types';

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
            ? 'bg-orange-600 text-white animate-pulse-ring scale-110' 
            : 'bg-white border border-slate-200 text-slate-400 hover:bg-slate-50 hover:text-slate-600 shadow-sm'
        } disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus-visible:ring-2 focus-visible:ring-orange-500`}
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
    <div className="bg-white rounded-xl shadow-sm p-6 md:p-8 border border-slate-200">
      <h2 className="text-2xl font-bold mb-1 text-slate-900">Generative Campaign Builder</h2>
      <p className="text-slate-500 mb-6">Define your goal and audience to let our AI build your next campaign.</p>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="relative">
          <label htmlFor="campaign-goal" className="block text-sm font-medium text-slate-700 mb-2">
            1. Describe your campaign goal
          </label>
          <textarea
            id="campaign-goal"
            value={goalPrompt}
            onChange={(e) => setGoalPrompt(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={`e.g., "Increase e-commerce sales by 15% in Q3"`}
            className="w-full h-32 p-4 pr-14 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all resize-none text-slate-900 placeholder-slate-400 shadow-inner"
            disabled={isLoading}
          />
          <MicButton field="goal" />
        </div>

        <div className="relative">
            <label htmlFor="target-audience" className="block text-sm font-medium text-slate-700 mb-2">
                2. Define your target audience
            </label>
            <textarea
                id="target-audience"
                value={audiencePrompt}
                onChange={(e) => setAudiencePrompt(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={`e.g., "Customers who viewed product X but didn't purchase"`}
                className="w-full h-32 p-4 pr-14 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all resize-none text-slate-900 placeholder-slate-400 shadow-inner"
                disabled={isLoading}
            />
            <MicButton field="audience" />
        </div>
      </div>

      <div className="mt-8 flex flex-col sm:flex-row sm:justify-between items-center gap-4">
        <p className="text-xs text-slate-400 order-2 sm:order-1 self-start sm:self-center bg-slate-50 px-2 py-1 rounded border border-slate-200">
            Pro-tip: Use <kbd className="font-sans font-bold">Ctrl</kbd> + <kbd className="font-sans font-bold">Enter</kbd> to generate.
        </p>
        <div className="relative w-full sm:w-auto order-1 sm:order-2" title={generateButtonTooltip()}>
            <button
              onClick={onGenerate}
              disabled={isGenerateDisabled}
              className="w-full px-8 py-3 bg-orange-600 text-white font-bold rounded-lg hover:bg-orange-700 disabled:bg-slate-300 disabled:cursor-not-allowed transition-all shadow-lg shadow-orange-600/20 hover:shadow-xl hover:shadow-orange-600/30 hover:-translate-y-0.5 flex items-center justify-center"
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
  );
};