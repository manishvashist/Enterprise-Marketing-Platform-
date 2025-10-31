import React from 'react';
import { MicrophoneIcon } from './icons/MicrophoneIcon';

interface CampaignInputProps {
  goalPrompt: string;
  setGoalPrompt: (prompt: string) => void;
  audiencePrompt: string;
  setAudiencePrompt: (prompt: string) => void;
  onGenerate: () => void;
  isLoading: boolean;
  recordingField: 'goal' | 'audience' | null;
  onToggleRecording: (field: 'goal' | 'audience') => void;
  onToggleLoadModal: () => void;
}

export const CampaignInput: React.FC<CampaignInputProps> = ({ 
  goalPrompt, 
  setGoalPrompt, 
  audiencePrompt, 
  setAudiencePrompt, 
  onGenerate, 
  isLoading,
  recordingField,
  onToggleRecording,
  onToggleLoadModal,
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
        className={`absolute right-3 bottom-3 p-2 rounded-full transition-colors ${
          isRecording 
            ? 'bg-purple-600 text-white animate-pulse-ring' 
            : 'bg-gray-700 text-gray-400 hover:bg-gray-600'
        } disabled:opacity-50 disabled:cursor-not-allowed`}
        aria-label={isRecording ? `Stop recording ${field}` : `Start recording ${field}`}
      >
        <MicrophoneIcon className="w-5 h-5" />
      </button>
    );
  };
  
  return (
    <div className="bg-gray-800 rounded-lg shadow-lg p-6">
      <h2 className="text-xl font-semibold mb-4 text-indigo-300">Generative Campaign Builder</h2>
      
      <div className="space-y-6">
        <div className="relative">
          <label htmlFor="campaign-goal" className="block text-sm font-medium text-gray-300 mb-2">
            1. Describe your campaign goal
          </label>
          <textarea
            id="campaign-goal"
            value={goalPrompt}
            onChange={(e) => setGoalPrompt(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={`e.g., "Increase e-commerce sales by 15% in Q3" or "Drive app downloads for a new fitness tracker"`}
            className="w-full h-24 p-4 pr-14 bg-gray-900 border border-gray-700 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all resize-none text-gray-200 placeholder-gray-500"
            disabled={isLoading}
          />
          <MicButton field="goal" />
        </div>

        <div className="relative">
            <label htmlFor="target-audience" className="block text-sm font-medium text-gray-300 mb-2">
                2. Define your target audience (using AI Smart Segments)
            </label>
            <textarea
                id="target-audience"
                value={audiencePrompt}
                onChange={(e) => setAudiencePrompt(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={`e.g., "Customers who viewed product X but didn't purchase in the last 30 days"`}
                className="w-full h-24 p-4 pr-14 bg-gray-900 border border-gray-700 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all resize-none text-gray-200 placeholder-gray-500"
                disabled={isLoading}
            />
            <MicButton field="audience" />
        </div>
      </div>

      <div className="mt-6 flex justify-between items-center">
        <p className="text-xs text-gray-500">
            Press <kbd className="font-sans px-1.5 py-0.5 border border-gray-600 rounded">Ctrl</kbd> + <kbd className="font-sans px-1.5 py-0.5 border border-gray-600 rounded">Enter</kbd> to generate.
        </p>
        <div className="flex items-center gap-4">
            <button
                onClick={onToggleLoadModal}
                disabled={isLoading}
                className="px-6 py-2.5 bg-gray-700 text-white font-semibold rounded-md hover:bg-gray-600 disabled:bg-gray-600 disabled:cursor-not-allowed transition-all"
            >
                Load Campaign
            </button>
            <button
              onClick={onGenerate}
              disabled={isLoading || !goalPrompt.trim() || !audiencePrompt.trim()}
              className="px-6 py-2.5 bg-indigo-600 text-white font-semibold rounded-md hover:bg-indigo-700 disabled:bg-gray-600 disabled:cursor-not-allowed transition-all flex items-center justify-center"
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
                'Generate Campaign'
              )}
            </button>
        </div>
      </div>
    </div>
  );
};

const styles = `
@keyframes pulse-ring {
  0% { box-shadow: 0 0 0 0 rgba(129, 140, 248, 0.7); }
  70% { box-shadow: 0 0 0 10px rgba(129, 140, 248, 0); }
  100% { box-shadow: 0 0 0 0 rgba(129, 140, 248, 0); }
}
.animate-pulse-ring {
  animation: pulse-ring 1.5s infinite;
}
`;
const styleSheet = document.createElement("style");
styleSheet.innerText = styles;
document.head.appendChild(styleSheet);