import React, { useState, useCallback, useMemo } from 'react';
import { Header } from './components/Header';
import { CampaignInput } from './components/CampaignInput';
import { JourneyCanvas } from './components/JourneyCanvas';
import { generateCampaignJourney, generateAssetsForChannel } from './services/geminiService';
import { Campaign, ChannelAssetGenerationResult } from './types';

export interface AssetGenerationProgress {
  totalChannels: number;
  completedChannels: number;
  isGeneratingAll: boolean;
  channelProgress: Record<string, {
    status: 'pending' | 'in-progress' | 'completed' | 'error';
    percentage: number;
    error?: string;
  }>;
}

const App: React.FC = () => {
  const [goalPrompt, setGoalPrompt] = useState<string>('');
  const [audiencePrompt, setAudiencePrompt] = useState<string>('');
  const [campaign, setCampaign] = useState<Campaign | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  
  const [assetGenerationProgress, setAssetGenerationProgress] = useState<AssetGenerationProgress>({
    totalChannels: 0,
    completedChannels: 0,
    isGeneratingAll: false,
    channelProgress: {},
  });

  const recommendedChannels = useMemo(() => {
    if (!campaign?.channelSelection) return [];
    return campaign.channelSelection.channelCategories.flatMap(cat => 
        cat.channels.filter(ch => ch.isRecommended).map(ch => ({ ...ch, category: cat.categoryName }))
    );
  }, [campaign]);

  const handleGenerateCampaign = useCallback(async () => {
    if (!goalPrompt.trim() || !audiencePrompt.trim()) {
      setError('Please describe both the campaign goal and the target audience.');
      return;
    }

    setIsLoading(true);
    setError(null);
    setCampaign(null);
    setAssetGenerationProgress({ totalChannels: 0, completedChannels: 0, isGeneratingAll: false, channelProgress: {} });

    const fullPrompt = `Campaign Goal: ${goalPrompt}\nTarget Audience: ${audiencePrompt}`;

    try {
      const generatedCampaign = await generateCampaignJourney(fullPrompt);
      setCampaign(generatedCampaign);
      // Initialize progress state for recommended channels
      const recommended = generatedCampaign.channelSelection?.channelCategories.flatMap(cat => cat.channels.filter(ch => ch.isRecommended)) || [];
      setAssetGenerationProgress(prev => ({
        ...prev,
        totalChannels: recommended.length,
        channelProgress: recommended.reduce((acc, ch) => {
          acc[ch.channelName] = { status: 'pending', percentage: 0 };
          return acc;
        }, {} as AssetGenerationProgress['channelProgress'])
      }));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred.');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }, [goalPrompt, audiencePrompt]);
  
  const handleGenerateForChannel = useCallback(async (channelName: string, channelCategory: string) => {
    if (!campaign) return;

    setAssetGenerationProgress(prev => ({
      ...prev,
      channelProgress: {
        ...prev.channelProgress,
        [channelName]: { status: 'in-progress', percentage: 0 }
      }
    }));
    
    // Simulate progress
    const estimatedTime = 45; // seconds
    let elapsed = 0;
    const interval = setInterval(() => {
      elapsed += 1;
      const percentage = Math.min(95, (elapsed / estimatedTime) * 100);
      setAssetGenerationProgress(prev => ({
        ...prev,
        channelProgress: { ...prev.channelProgress, [channelName]: { ...prev.channelProgress[channelName], status: 'in-progress', percentage } }
      }));
    }, 1000);

    try {
        const generatedAssets = await generateAssetsForChannel(campaign, channelName, channelCategory);
        setCampaign(prev => prev ? { 
            ...prev, 
            channelAssets: {
                ...prev.channelAssets,
                [channelName]: generatedAssets
            } 
        } : null);

        setAssetGenerationProgress(prev => ({
          ...prev,
          completedChannels: prev.channelProgress[channelName]?.status !== 'completed' ? prev.completedChannels + 1 : prev.completedChannels,
          channelProgress: {
            ...prev.channelProgress,
            [channelName]: { status: 'completed', percentage: 100 }
          }
        }));
    } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Unknown error during asset generation.';
        setAssetGenerationProgress(prev => ({
          ...prev,
          channelProgress: {
            ...prev.channelProgress,
            [channelName]: { status: 'error', percentage: 0, error: errorMessage }
          }
        }));
        console.error(`Error generating assets for ${channelName}:`, err);
    } finally {
        clearInterval(interval);
    }
  }, [campaign]);

  const handleGenerateForAllChannels = useCallback(async () => {
    setAssetGenerationProgress(prev => ({ ...prev, isGeneratingAll: true }));
    for (const channel of recommendedChannels) {
        // Check if already completed or failed
        const status = assetGenerationProgress.channelProgress[channel.channelName]?.status;
        if (status !== 'completed' && status !== 'in-progress') {
            await handleGenerateForChannel(channel.channelName, channel.category);
            // Add a small delay between requests
            await new Promise(resolve => setTimeout(resolve, 1000));
        }
    }
    setAssetGenerationProgress(prev => ({ ...prev, isGeneratingAll: false }));
  }, [recommendedChannels, assetGenerationProgress.channelProgress, handleGenerateForChannel]);

  const handleResetAssets = useCallback(() => {
    setCampaign(prev => prev ? { ...prev, channelAssets: {} } : null);
    setAssetGenerationProgress(prev => ({
      ...prev,
      completedChannels: 0,
      channelProgress: Object.keys(prev.channelProgress).reduce((acc, key) => {
        acc[key] = { status: 'pending', percentage: 0 };
        return acc;
      }, {} as AssetGenerationProgress['channelProgress'])
    }));
  }, []);

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100 flex flex-col">
      <Header />
      <main className="flex-grow container mx-auto p-4 md:p-8 flex flex-col">
        <div className="w-full max-w-4xl mx-auto">
          <CampaignInput
            goalPrompt={goalPrompt}
            setGoalPrompt={setGoalPrompt}
            audiencePrompt={audiencePrompt}
            setAudiencePrompt={setAudiencePrompt}
            onGenerate={handleGenerateCampaign}
            isLoading={isLoading}
          />
        </div>
        <div className="flex-grow mt-8">
          <JourneyCanvas
            campaign={campaign}
            isLoading={isLoading}
            error={error}
            assetGenerationProgress={assetGenerationProgress}
            onGenerateForChannel={handleGenerateForChannel}
            onGenerateForAll={handleGenerateForAllChannels}
            onResetAssets={handleResetAssets}
            recommendedChannels={recommendedChannels}
          />
        </div>
      </main>
    </div>
  );
};

export default App;