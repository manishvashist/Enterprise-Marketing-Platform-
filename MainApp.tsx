
import React, { useState, useCallback, useMemo, useEffect, useRef } from 'react';
import { Header } from './Header';
import { CampaignInput } from './CampaignInput';
import { JourneyCanvas } from './JourneyCanvas';
import { ImageEditor } from './ImageEditor';
import { generateCampaignJourney, generateAssetsForChannel, generateVideoForChannel, startTranscriptionSession, createBlob } from '../services/geminiService';
import { databaseService } from '../services/databaseService';
import { subscriptionService } from '../services/subscriptionService';
import { Campaign, User, AssetGenerationProgress, VideoAssetState, UsageInfo } from '../types';
import { ConnectionsView } from './ConnectionsView';
import { LoadCampaignModal } from './LoadCampaignModal';
import { BillingView } from './billing/BillingView';
import { UsageMessage } from './UsageMessage';
import { authService } from '../services/authService';

type LiveSession = Awaited<ReturnType<typeof startTranscriptionSession>>;
type AppView = 'campaign' | 'admin' | 'billing';
type BillingSubView = 'subscription' | 'profile';

interface MainAppProps {
    user: User;
    onLogout: () => void;
    onUserUpdate: (user: User) => void;
}

const UpgradeRequired: React.FC<{ setView: (view: AppView) => void }> = ({ setView }) => (
    <div className="w-full h-full flex flex-col items-center justify-center bg-gray-800/50 rounded-lg p-8 border-2 border-dashed border-gray-700">
        <div className="text-center">
             <svg xmlns="http://www.w3.org/2000/svg" className="mx-auto h-12 w-12 text-yellow-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <h3 className="mt-4 text-xl font-semibold text-white">Subscription Required</h3>
            <p className="mt-2 text-gray-400">Your trial has ended. Please subscribe to continue using the platform.</p>
            <button
                onClick={() => setView('billing')}
                className="mt-6 px-6 py-2.5 bg-indigo-600 text-white font-semibold rounded-md hover:bg-indigo-700 transition-all"
            >
                View Plans
            </button>
        </div>
    </div>
);

export const MainApp: React.FC<MainAppProps> = ({ user, onLogout, onUserUpdate }) => {
  const [view, setView] = useState<AppView>('campaign');
  const [initialBillingTab, setInitialBillingTab] = useState<BillingSubView>('subscription');
  const [goalPrompt, setGoalPrompt] = useState<string>('');
  const [audiencePrompt, setAudiencePrompt] = useState<string>('');
  const [campaign, setCampaign] = useState<Campaign | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [videoAssets, setVideoAssets] = useState<Record<string, VideoAssetState>>({});
  const [isApiKeySelected, setIsApiKeySelected] = useState(false);
  const [recordingField, setRecordingField] = useState<'goal' | 'audience' | null>(null);
  const [savedCampaigns, setSavedCampaigns] = useState<Campaign[]>([]);
  const [isLoadModalOpen, setIsLoadModalOpen] = useState(false);
  const [usageInfo, setUsageInfo] = useState<UsageInfo | null>(null);
  
  const [isFetchingCampaigns, setIsFetchingCampaigns] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [deletingCampaignId, setDeletingCampaignId] = useState<string | null>(null);

  const liveSessionRef = useRef<LiveSession | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const scriptProcessorRef = useRef<ScriptProcessorNode | null>(null);
  const baseTextRef = useRef<string>('');
  
  const [assetGenerationProgress, setAssetGenerationProgress] = useState<AssetGenerationProgress>({
    totalChannels: 0,
    completedChannels: 0,
    isGeneratingAll: false,
    channelProgress: {},
  });

  const handleSetView = (newView: AppView, initialTab: BillingSubView = 'subscription') => {
      setView(newView);
      if (newView === 'billing') {
          setInitialBillingTab(initialTab);
      }
  };

  useEffect(() => {
    const checkKey = async () => {
        if (window.aistudio) {
            const hasKey = await window.aistudio.hasSelectedApiKey();
            setIsApiKeySelected(hasKey);
        }
    };
    checkKey();
  }, []);

  useEffect(() => {
    const checkUsage = async () => {
        const info = await subscriptionService.getUsageInfo(user.id);
        setUsageInfo(info);
    };
    checkUsage();
  }, [user]);

  useEffect(() => {
    if (user && user.role !== 'User') {
        const fetchCampaigns = async () => {
            setIsFetchingCampaigns(true);
            setError(null);
            try {
                const campaigns = await databaseService.getCampaignsForUser(user.id);
                setSavedCampaigns(campaigns);
            } catch (err) {
                console.error("Failed to load campaigns:", err);
                setError("Could not load your saved campaigns. Please try refreshing the page.");
            } finally {
                setIsFetchingCampaigns(false);
            }
        };
        fetchCampaigns();
    }
  }, [user]);

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
    setVideoAssets({});
    setAssetGenerationProgress({ totalChannels: 0, completedChannels: 0, isGeneratingAll: false, channelProgress: {} });

    const fullPrompt = `Campaign Goal: ${goalPrompt}\nTarget Audience: ${audiencePrompt}`;

    try {
      const generatedCampaignData = await generateCampaignJourney(fullPrompt, user);
      
      const newCampaign = await subscriptionService.createCampaignUsage(user.id, generatedCampaignData);

      setCampaign(newCampaign);
      // FIX: Replaced direct database call 'findUserById' with 'authService.getCurrentUser()' to correctly fetch the updated user profile after campaign generation, resolving a method not found error.
      const updatedUser = await authService.getCurrentUser();
      if (updatedUser) {
        onUserUpdate(updatedUser);
      }

      // Initialize progress state for recommended channels
      const recommended = newCampaign.channelSelection?.channelCategories.flatMap(cat => cat.channels.filter(ch => ch.isRecommended)) || [];
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
  }, [goalPrompt, audiencePrompt, user, onUserUpdate]);

  const handleSaveCampaign = useCallback(async () => {
    if (!campaign || !user || user.role === 'User' || campaign.isTrialCampaign) return;
    setIsSaving(true);
    setError(null);
    try {
        const saved = await databaseService.saveCampaign(user.id, campaign);
        setCampaign(saved);
        const campaigns = await databaseService.getCampaignsForUser(user.id);
        setSavedCampaigns(campaigns);
    } catch(err) {
        console.error("Failed to save campaign", err);
        setError("Failed to save the campaign. Please try again.");
    } finally {
        setIsSaving(false);
    }
  }, [campaign, user]);

  const handleLoadCampaign = useCallback((campaignToLoad: Campaign) => {
    setCampaign(campaignToLoad);
    setIsLoadModalOpen(false);
    setAssetGenerationProgress({ totalChannels: 0, completedChannels: 0, isGeneratingAll: false, channelProgress: {} });
    setVideoAssets({});
    setError(null);
  }, []);

  const handleDeleteCampaign = useCallback(async (campaignId: string) => {
    if (!user || user.role === 'User') return;
    setDeletingCampaignId(campaignId);
    setError(null);
    try {
        await databaseService.deleteCampaign(campaignId);
        if (campaign?.id === campaignId) {
            setCampaign(null);
        }
        const campaigns = await databaseService.getCampaignsForUser(user.id);
        setSavedCampaigns(campaigns);
    } catch(err) {
        console.error("Failed to delete campaign", err);
        setError("Failed to delete the campaign. Please try again.");
    } finally {
        setDeletingCampaignId(null);
    }
  }, [user, campaign]);
  
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

  const handleGenerateVideoForChannel = useCallback(async (channelName: string) => {
    if (!campaign) return;

    if (window.aistudio) {
        let hasKey = await window.aistudio.hasSelectedApiKey();
        if (!hasKey) {
            await window.aistudio.openSelectKey();
            // Assume success after opening dialog to avoid race conditions
            hasKey = true; 
        }
        setIsApiKeySelected(hasKey);
        if (!hasKey) {
            setVideoAssets(prev => ({ ...prev, [channelName]: { status: 'error', error: 'API Key selection is required to generate videos.' }}));
            return;
        }
    }

    setVideoAssets(prev => ({ ...prev, [channelName]: { status: 'loading', progressMessage: 'Initializing...' }}));
    
    const updateProgress = (message: string) => {
        setVideoAssets(prev => ({ ...prev, [channelName]: { ...prev[channelName], status: 'loading', progressMessage: message }}));
    };

    try {
        const videoUrl = await generateVideoForChannel(campaign, channelName, updateProgress);
        setVideoAssets(prev => ({ ...prev, [channelName]: { status: 'done', url: videoUrl }}));
    } catch (err) {
        const errorMessage = err instanceof Error ? err.message : String(err);
        if (errorMessage.includes('Requested entity was not found')) {
             setIsApiKeySelected(false);
             setVideoAssets(prev => ({ ...prev, [channelName]: { status: 'error', error: 'Invalid API Key. Please select a valid key and try again.' }}));
        } else {
             setVideoAssets(prev => ({ ...prev, [channelName]: { status: 'error', error: errorMessage }}));
        }
        console.error(`Error generating video for ${channelName}:`, err);
    }
  }, [campaign]);

  const stopRecording = useCallback(() => {
    mediaStreamRef.current?.getTracks().forEach(track => track.stop());
    scriptProcessorRef.current?.disconnect();
    audioContextRef.current?.close();
    liveSessionRef.current?.close();

    mediaStreamRef.current = null;
    scriptProcessorRef.current = null;
    audioContextRef.current = null;
    liveSessionRef.current = null;
    setRecordingField(null);
  }, []);

  const startRecording = useCallback(async (field: 'goal' | 'audience') => {
    try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        mediaStreamRef.current = stream;

        const onTranscriptionUpdate = (text: string, isFinal: boolean) => {
            const currentBaseText = baseTextRef.current ? baseTextRef.current + ' ' : '';
            if (field === 'goal') {
                setGoalPrompt(currentBaseText + text);
            } else {
                setAudiencePrompt(currentBaseText + text);
            }
            if (isFinal) {
                baseTextRef.current = currentBaseText + text;
            }
        };

        const sessionPromise = startTranscriptionSession(onTranscriptionUpdate);
        liveSessionRef.current = await sessionPromise;

        const context = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 16000 });
        audioContextRef.current = context;

        const source = context.createMediaStreamSource(stream);
        const processor = context.createScriptProcessor(4096, 1, 1);
        scriptProcessorRef.current = processor;

        processor.onaudioprocess = (audioProcessingEvent) => {
            const inputData = audioProcessingEvent.inputBuffer.getChannelData(0);
            const pcmBlob = createBlob(inputData);
            sessionPromise.then((session) => {
                session.sendRealtimeInput({ media: pcmBlob });
            });
        };

        source.connect(processor);
        processor.connect(context.destination);
        
        baseTextRef.current = field === 'goal' ? goalPrompt : audiencePrompt;
        setRecordingField(field);

    } catch (err) {
        console.error("Error starting recording:", err);
        setError("Microphone access was denied or an error occurred.");
        stopRecording();
    }
  }, [goalPrompt, audiencePrompt, stopRecording]);

  const handleToggleRecording = useCallback((field: 'goal' | 'audience') => {
    if (recordingField === field) {
        stopRecording();
    } else {
        if (liveSessionRef.current) {
            stopRecording();
        }
        startRecording(field);
    }
  }, [recordingField, startRecording, stopRecording]);
  
  // Cleanup on unmount
  useEffect(() => {
    return () => {
        if (liveSessionRef.current) {
            stopRecording();
        }
    };
  }, [stopRecording]);

  const isAccessBlocked = user.accountStatus === 'expired';

  const renderCurrentView = () => {
    if (isAccessBlocked && view !== 'billing') {
        return <UpgradeRequired setView={setView} />;
    }
    switch (view) {
        case 'campaign':
            return (
                <>
                    <div className="w-full max-w-4xl mx-auto">
                        <CampaignInput
                            user={user}
                            goalPrompt={goalPrompt}
                            setGoalPrompt={setGoalPrompt}
                            audiencePrompt={audiencePrompt}
                            setAudiencePrompt={setAudiencePrompt}
                            onGenerate={handleGenerateCampaign}
                            isLoading={isLoading}
                            recordingField={recordingField}
                            onToggleRecording={handleToggleRecording}
                            onToggleLoadModal={() => setIsLoadModalOpen(prev => !prev)}
                            usageInfo={usageInfo}
                        />
                    </div>
                    {error && (
                        <div className="w-full max-w-4xl mx-auto mt-4 p-4 bg-red-900/30 border border-red-500/50 rounded-lg text-red-300 flex justify-between items-center animate-fade-in">
                            <span>{error}</span>
                            <button onClick={() => setError(null)} className="p-1 rounded-full hover:bg-red-800/50">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>
                    )}
                    <div className="flex-grow mt-8">
                        <JourneyCanvas
                            user={user}
                            campaign={campaign}
                            isLoading={isLoading}
                            error={error}
                            assetGenerationProgress={assetGenerationProgress}
                            onGenerateForChannel={handleGenerateForChannel}
                            onGenerateForAll={handleGenerateForAllChannels}
                            onResetAssets={handleResetAssets}
                            recommendedChannels={recommendedChannels}
                            videoAssets={videoAssets}
                            onGenerateVideoForChannel={handleGenerateVideoForChannel}
                            isApiKeySelected={isApiKeySelected}
                            channelConnections={user.channelConnections}
                            onSaveCampaign={handleSaveCampaign}
                            isSaving={isSaving}
                        />
                    </div>
                    <LoadCampaignModal
                        user={user}
                        isOpen={isLoadModalOpen}
                        onClose={() => setIsLoadModalOpen(false)}
                        campaigns={savedCampaigns}
                        onLoad={handleLoadCampaign}
                        onDelete={handleDeleteCampaign}
                        isFetching={isFetchingCampaigns}
                        deletingId={deletingCampaignId}
                    />
                </>
            );
        case 'billing':
            return <BillingView user={user} onSubscriptionChange={onUserUpdate} initialTab={initialBillingTab} />;
        case 'admin':
            return user.role === 'Admin' ? <div><h1 className="text-white text-2xl">Admin Dashboard</h1><p className="text-gray-400">User management and system settings will be here.</p></div> : null;
        default:
            return null;
    }
  };


  return (
    <div className="min-h-screen bg-gray-900 text-gray-100 flex flex-col">
      <Header currentView={view} setView={handleSetView} user={user} onLogout={onLogout} />
      <UsageMessage usageInfo={usageInfo} setView={handleSetView} />
      <main className="flex-grow container mx-auto px-4 md:p-8 flex flex-col">
        {renderCurrentView()}
      </main>
    </div>
  );
};
