import React, { useState, useCallback, useMemo, useEffect, useRef } from 'react';
import { Header } from './Header';
import { CampaignInput } from './CampaignInput';
import { JourneyCanvas } from './JourneyCanvas';
import { generateCampaignJourney, generateAssetsForChannel, generateVideoForChannel, startTranscriptionSession, createBlob } from '../services/geminiService';
import { databaseService } from '../services/databaseService';
import { subscriptionService } from '../services/subscriptionService';
import { Campaign, User, AssetGenerationProgress, VideoAssetState, UsageInfo } from '../types';
import { SavedCampaigns } from './SavedCampaigns';
import { BillingView } from './billing/BillingView';
import { UsageMessage } from './UsageMessage';
import { authService } from '../services/authService';
import { seedDatabase } from '../services/seedDatabase';
import { ConnectionsView } from './ConnectionsView';

type LiveSession = Awaited<ReturnType<typeof startTranscriptionSession>>;
type AppView = 'campaign' | 'admin' | 'billing' | 'connections';
type BillingSubView = 'subscription' | 'profile';

interface MainAppProps {
    user: User;
    onLogout: () => void;
    onUserUpdate: (user: User) => void;
    onSetGlobalSuccess: (message: string | null) => void;
}

const UpgradeRequired: React.FC<{ setView: (view: AppView) => void }> = ({ setView }) => (
    <div className="w-full h-full flex flex-col items-center justify-center bg-white rounded-3xl p-12 border border-slate-200 shadow-sm max-w-2xl mx-auto mt-20">
        <div className="text-center">
             <div className="w-16 h-16 bg-orange-50 rounded-full flex items-center justify-center mx-auto mb-6 border border-orange-100">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-orange-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
             </div>
            <h3 className="text-2xl font-bold text-slate-900">Subscription Required</h3>
            <p className="mt-3 text-slate-500 max-w-md mx-auto text-lg">Your trial has ended. Please subscribe to continue generating high-converting campaigns.</p>
            <button
                onClick={() => setView('billing')}
                className="mt-8 px-8 py-3 bg-orange-600 text-white font-bold rounded-full hover:bg-orange-700 transition-all shadow-lg shadow-orange-600/20 hover:-translate-y-0.5"
            >
                View Plans
            </button>
        </div>
    </div>
);

export const MainApp: React.FC<MainAppProps> = ({ user, onLogout, onUserUpdate, onSetGlobalSuccess }) => {
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
  const [usageInfo, setUsageInfo] = useState<UsageInfo | null>(null);
  
  const [isFetchingCampaigns, setIsFetchingCampaigns] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [deletingCampaignId, setDeletingCampaignId] = useState<string | null>(null);
  const [isSeeding, setIsSeeding] = useState(false);

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
    if (user) {
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

    try {
      const fullPrompt = `Campaign Goal: ${goalPrompt}\nTarget Audience: ${audiencePrompt}`;
      const generatedCampaignData = await generateCampaignJourney(fullPrompt, user);
      
      const usage = await subscriptionService.getUsageInfo(user.id);

      const unsavedCampaign: Campaign = {
          ...generatedCampaignData,
          userId: user.id,
          isTrialCampaign: usage.reason === 'trial',
          channelAssets: {},
      };
      
      setCampaign(unsavedCampaign);

      const recommended = unsavedCampaign.channelSelection?.channelCategories.flatMap(cat => cat.channels.filter(ch => ch.isRecommended)) || [];
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
  }, [goalPrompt, audiencePrompt, user]);

  const handleSaveCampaign = useCallback(async () => {
    if (!campaign || !user) return;
    setIsSaving(true);
    setError(null);
    try {
        let savedCampaign: Campaign;
        if (campaign.id) {
            savedCampaign = await databaseService.saveCampaign(user.id, campaign);
            onSetGlobalSuccess("Campaign updated successfully!");
        } else {
            const { userId, isTrialCampaign, ...campaignData } = campaign;
            savedCampaign = await subscriptionService.createCampaignUsage(user.id, campaignData as Omit<Campaign, 'id'|'userId'|'subscriptionId'|'isTrialCampaign'|'createdAt'|'updatedAt'>);
            onSetGlobalSuccess("Campaign saved successfully!");

            const updatedUser = await authService.getCurrentUser();
            if (updatedUser) {
              onUserUpdate(updatedUser);
            }
        }
        setCampaign(savedCampaign);
        const campaigns = await databaseService.getCampaignsForUser(user.id);
        setSavedCampaigns(campaigns);

    } catch(err) {
        console.error("Failed to save campaign", err);
        setError("Failed to save the campaign. Please try again.");
    } finally {
        setIsSaving(false);
    }
  }, [campaign, user, onSetGlobalSuccess, onUserUpdate]);

  const handleCampaignUpdate = useCallback(async (updates: Partial<Campaign>) => {
    if (!campaign || !user) return;
    const updatedCampaign = { ...campaign, ...updates };
    setCampaign(updatedCampaign);
    
    if (updatedCampaign.id) {
        try {
           await databaseService.saveCampaign(user.id, updatedCampaign);
        } catch(e) {
           console.error("Autosave failed", e);
        }
    }
  }, [campaign, user]);

  const handleLoadCampaign = useCallback((campaignToLoad: Campaign) => {
    setCampaign(campaignToLoad);
    setAssetGenerationProgress({ totalChannels: 0, completedChannels: 0, isGeneratingAll: false, channelProgress: {} });
    setVideoAssets({});
    setError(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  const handleEditAsNewCampaign = useCallback((campaignToEdit: Campaign) => {
    setGoalPrompt(campaignToEdit.description || '');
    setAudiencePrompt(campaignToEdit.audienceQuery || '');
    setCampaign(null);
    setError(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
    onSetGlobalSuccess("Campaign loaded as a new template. Modify the prompts and generate a new version.");
  }, [onSetGlobalSuccess]);

  const handleDeleteCampaign = useCallback(async (campaignId: string) => {
    if (!user || !campaignId) return;
    
    const originalCampaigns = [...savedCampaigns];
    setDeletingCampaignId(campaignId);
    setSavedCampaigns(prevCampaigns => prevCampaigns.filter(c => c.id !== campaignId));
    setError(null);

    try {
        await databaseService.softDeleteCampaign(campaignId);
        if (campaign?.id === campaignId) {
            setCampaign(null);
        }
        onSetGlobalSuccess("Campaign moved to trash successfully.");
    } catch(err) {
        console.error("Failed to delete campaign", err);
        setError("Failed to delete the campaign. Please try again.");
        setSavedCampaigns(originalCampaigns);
    } finally {
        setDeletingCampaignId(null);
    }
  }, [user, campaign, onSetGlobalSuccess, savedCampaigns]);
  
  const handleGenerateForChannel = useCallback(async (channelName: string, channelCategory: string) => {
    if (!campaign) return;

    setAssetGenerationProgress(prev => ({
      ...prev,
      channelProgress: {
        ...prev.channelProgress,
        [channelName]: { status: 'in-progress', percentage: 0 }
      }
    }));
    
    const estimatedTime = 45;
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
        const status = assetGenerationProgress.channelProgress[channel.channelName]?.status;
        if (status !== 'completed' && status !== 'in-progress') {
            await handleGenerateForChannel(channel.channelName, channel.category);
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
  
  useEffect(() => {
    return () => {
        if (liveSessionRef.current) {
            stopRecording();
        }
    };
  }, [stopRecording]);

  const handleSeedDatabase = async () => {
    setIsSeeding(true);
    try {
      const message = await seedDatabase();
      onSetGlobalSuccess(message);
    } catch (err) {
      console.error(err);
      setError(err instanceof Error ? err.message : 'Seeding failed');
    } finally {
      setIsSeeding(false);
    }
  };

  const isAccessBlocked = user.accountStatus === 'expired';

  const renderCurrentView = () => {
    if (isAccessBlocked && view !== 'billing') {
        return <UpgradeRequired setView={setView} />;
    }
    switch (view) {
        case 'campaign':
            return (
                <div className="space-y-12">
                    <div className="w-full max-w-5xl mx-auto">
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
                            usageInfo={usageInfo}
                        />
                    </div>
                    {error && (
                        <div className="w-full max-w-5xl mx-auto p-6 bg-red-50 border border-red-200 rounded-xl text-red-700 flex justify-between items-center animate-fade-in shadow-sm">
                            <span className="font-medium flex items-center gap-2">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                {error}
                            </span>
                            <button onClick={() => setError(null)} className="p-2 rounded-full hover:bg-red-100 text-red-600 transition-colors">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>
                    )}
                    <div className="flex-grow">
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
                            onSetGlobalSuccess={onSetGlobalSuccess}
                            onCampaignUpdate={handleCampaignUpdate}
                        />
                    </div>
                     <SavedCampaigns
                        user={user}
                        campaigns={savedCampaigns}
                        onLoad={handleLoadCampaign}
                        onEdit={handleEditAsNewCampaign}
                        onDelete={handleDeleteCampaign}
                        isFetching={isFetchingCampaigns}
                        deletingId={deletingCampaignId}
                        onSetGlobalSuccess={onSetGlobalSuccess}
                    />
                </div>
            );
        case 'billing':
            return <BillingView user={user} onSubscriptionChange={onUserUpdate} initialTab={initialBillingTab} onSetGlobalSuccess={onSetGlobalSuccess} />;
        case 'admin':
            return user.role === 'Admin' ? (
                <div className="max-w-4xl mx-auto">
                    <h1 className="text-3xl font-bold text-slate-900 mb-8">Admin Dashboard</h1>
                    
                    <div className="bg-white rounded-2xl p-8 border border-slate-200 shadow-sm">
                        <h2 className="text-xl font-bold text-slate-900 mb-4">Database Maintenance</h2>
                        <p className="text-slate-500 mb-8 leading-relaxed">
                            Initialize or reset the Firestore database collections with default schemas and sample data.
                            <br />
                            <span className="text-xs font-semibold text-orange-700 bg-orange-50 px-2 py-1 rounded mt-2 inline-block border border-orange-100">
                                Warning: This creates dummy data associated with your user ID.
                            </span>
                        </p>
                        <button 
                            onClick={handleSeedDatabase}
                            disabled={isSeeding}
                            className="px-6 py-3 bg-slate-900 text-white font-bold rounded-full hover:bg-slate-800 disabled:bg-slate-300 transition-all flex items-center shadow-lg hover:shadow-xl hover:-translate-y-0.5"
                        >
                            {isSeeding ? (
                                <>
                                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    Seeding Database...
                                </>
                            ) : 'Generate Collections & Seed Data'}
                        </button>
                    </div>
                </div>
            ) : <div className="text-center p-12 text-slate-500">You do not have access to this area.</div>;
        case 'connections':
            return <ConnectionsView user={user} onUserUpdate={onUserUpdate} />;
        default:
            return null;
    }
  };


  return (
    <div className="min-h-screen bg-slate-50 text-slate-600 flex flex-col font-sans selection:bg-orange-100 selection:text-orange-900">
      <Header currentView={view} setView={handleSetView} user={user} onLogout={onLogout} />
      <UsageMessage usageInfo={usageInfo} setView={handleSetView} />
      <main className="flex-grow container mx-auto px-6 md:px-12 py-12 flex flex-col">
        {renderCurrentView()}
      </main>
    </div>
  );
};