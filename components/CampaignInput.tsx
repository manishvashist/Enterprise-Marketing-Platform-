import React from 'react';

interface CampaignInputProps {
  goalPrompt: string;
  setGoalPrompt: (prompt: string) => void;
  audiencePrompt: string;
  setAudiencePrompt: (prompt: string) => void;
  onGenerate: () => void;
  isLoading: boolean;
}

export const CampaignInput: React.FC<CampaignInputProps> = ({ 
  goalPrompt, 
  setGoalPrompt, 
  audiencePrompt, 
  setAudiencePrompt, 
  onGenerate, 
  isLoading 
}) => {
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
      e.preventDefault();
      onGenerate();
    }
  };

  return (
    <div className="bg-gray-800 rounded-lg shadow-lg p-6">
      <h2 className="text-xl font-semibold mb-4 text-indigo-300">Generative Campaign Builder</h2>
      
      <div className="space-y-6">
        <div>
          <label htmlFor="campaign-goal" className="block text-sm font-medium text-gray-300 mb-2">
            1. Describe your campaign goal
          </label>
          <textarea
            id="campaign-goal"
            value={goalPrompt}
            onChange={(e) => setGoalPrompt(e.target.value)}
            onKeyDown={handleKeyDown}
            // FIX: Using template literal for placeholder to avoid escaping issues.
            placeholder={`e.g., "Launch a cart abandonment campaign for mobile users"`}
            className="w-full h-24 p-4 bg-gray-900 border border-gray-700 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all resize-none text-gray-200 placeholder-gray-500"
            disabled={isLoading}
          />
        </div>

        <div>
            <label htmlFor="target-audience" className="block text-sm font-medium text-gray-300 mb-2">
                2. Define your target audience (using AI Smart Segments)
            </label>
            <textarea
                id="target-audience"
                value={audiencePrompt}
                onChange={(e) => setAudiencePrompt(e.target.value)}
                onKeyDown={handleKeyDown}
                // FIX: Using template literal for placeholder to avoid escaping issues with the apostrophe.
                placeholder={`e.g., "Customers who viewed product X but didn't purchase in the last 30 days"`}
                className="w-full h-24 p-4 bg-gray-900 border border-gray-700 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all resize-none text-gray-200 placeholder-gray-500"
                disabled={isLoading}
            />
        </div>
      </div>

      <div className="mt-6 flex justify-between items-center">
        <p className="text-xs text-gray-500">
            Press <kbd className="font-sans px-1.5 py-0.5 border border-gray-600 rounded">Ctrl</kbd> + <kbd className="font-sans px-1.5 py-0.5 border border-gray-600 rounded">Enter</kbd> to generate.
        </p>
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
  );
};