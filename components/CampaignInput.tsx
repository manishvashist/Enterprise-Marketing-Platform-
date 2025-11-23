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
        className={`absolute right-4 bottom-4 p-2.5 rounded-full transition-all duration-300 ${
          isRecording 
            ? 'bg-orange-600 text-white animate-pulse-ring scale-110 shadow-lg shadow-orange-600/30' 
            : 'bg-white border border-slate-200 text-slate-400 hover:bg-slate-50 hover:text-slate-600 shadow-sm hover:shadow-md'
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
    <div className="bg-white rounded-3xl shadow-xl shadow-slate-200/60 p-8 md:p-10 border border-slate-100">
      <div className="mb-8 text-center max-w-2xl mx-auto">
        <h2 className="text-3xl font-bold mb-3 text-slate-900 tracking-tight">What are we building today?</h2>
        <p className="text-lg text-slate-500">Define your goal and audience, and let our AI engine orchestrate the rest.</p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="relative group">
          <label htmlFor="campaign-goal" className="block text-sm font-bold text-slate-700 mb-3 uppercase tracking-wider">
            1. Campaign Goal
          </label>
          <div className="relative">
            <textarea
                id="campaign-goal"
                value={goalPrompt}
                onChange={(e) => setGoalPrompt(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={`e.g., "Increase e-commerce sales for our new summer line by 15% in Q3"`}
                className="w-full h-40 p-5 pr-16 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all resize-none text-slate-900 placeholder-slate-400 shadow-inner text-lg leading-relaxed group-hover:bg-white group-hover:border-slate-300"
                disabled={isLoading}
            />
            <MicButton field="goal" />
          </div>
        </div>

        <div className="relative group">
            <label htmlFor="target-audience" className="block text-sm font-bold text-slate-700 mb-3 uppercase tracking-wider">
                2. Target Audience
            </label>
            <div className="relative">
                <textarea
                    id="target-audience"
                    value={audiencePrompt}
                    onChange={(e) => setAudiencePrompt(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder={`e.g., "Urban millennials aged 25-35 who have visited our site but haven't purchased"`}
                    className="w-full h-40 p-5 pr-16 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all resize-none text-slate-900 placeholder-slate-400 shadow-inner text-lg leading-relaxed group-hover:bg-white group-hover:border-slate-300"
                    disabled={isLoading}
                />
                <MicButton field="audience" />
            </div>
        </div>
      </div>

      <div className="mt-10 flex flex-col sm:flex-row sm:justify-between items-center gap-6 pt-8 border-t border-slate-100">
        <div className="text-sm text-slate-400 flex items-center gap-2 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-200/50">
            <span className="w-2 h-2 bg-orange-400 rounded-full animate-pulse"></span>
            Pro-tip: Use <kbd className="font-mono font-bold text-slate-600 mx-1">Ctrl + Enter</kbd> to generate instantly.
        </div>
        <div className="relative w-full sm:w-auto" title={generateButtonTooltip()}>
            <button
              onClick={onGenerate}
              disabled={isGenerateDisabled}
              className="w-full sm:w-auto px-10 py-4 bg-orange-600 text-white text-lg font-bold rounded-full hover:bg-orange-700 disabled:bg-slate-200 disabled:text-slate-400 disabled:cursor-not-allowed transition-all shadow-xl shadow-orange-600/25 hover:shadow-2xl hover:shadow-orange-600/40 hover:-translate-y-1 flex items-center justify-center gap-3"
            >
              {isLoading ? (
                <>
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Orchestrating Campaign...
                </>
              ) : (
                <>
                    <span>Generate Campaign</span>
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                </>
              )}
            </button>
        </div>
      </div>
    </div>
  );
};