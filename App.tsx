import React, { useState, useCallback, useMemo, useEffect, useRef } from 'react';
import { Header } from './components/Header';
import { CampaignInput } from './components/CampaignInput';
import { JourneyCanvas } from './components/JourneyCanvas';
import { ImageEditor } from './components/ImageEditor';
import { generateCampaignJourney, generateAssetsForChannel, generateVideoForChannel, startTranscriptionSession, createBlob } from './services/geminiService';
import { Campaign, ChannelAssetGenerationResult } from './types';
// @google/genai Coding Guidelines: Do not import `LiveSession` as it is not an exported member. The type should be inferred.

// Infer the LiveSession type from the return value of startTranscriptionSession to avoid import errors.
type LiveSession = Awaited<ReturnType<typeof startTranscriptionSession>>;

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

export interface VideoAssetState {
  status: 'pending' | 'loading' | 'done' | 'error';
  url?: string;
  error?: string;
  progressMessage?: string;
}

const App: React.FC = () => {
  const [view, setView] = useState<'campaign' | 'editor'>('campaign');
  const [goalPrompt, setGoalPrompt] = useState<string>('');
  const [audiencePrompt, setAudiencePrompt] = useState<string>('');
  const [campaign, setCampaign] = useState<Campaign | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [videoAssets, setVideoAssets] = useState<Record<string, VideoAssetState>>({});
  const [isApiKeySelected, setIsApiKeySelected] = useState(false);
  const [recordingField, setRecordingField] = useState<'goal' | 'audience' | null>(null);

  const liveSessionRef = useRef<LiveSession | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const scriptProcessorRef = useRef<ScriptProcessorNode | null>(null);
  const baseTextRef = useRef<string>('');
  const currentTranscriptionRef = useRef<string>('');
  
  const [assetGenerationProgress, setAssetGenerationProgress] = useState<AssetGenerationProgress>({
    totalChannels: 0,
    completedChannels: 0,
    isGeneratingAll: false,
    channelProgress: {},
  });

  useEffect(() => {
    const checkKey = async () => {
        if (window.aistudio) {
            const hasKey = await window.aistudio.hasSelectedApiKey();
            setIsApiKeySelected(hasKey);
        }
    };
    checkKey();
  }, []);

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
        const errorMessage = err instanceof Error ? err.message : 'Unknown error during video generation.';
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

        // FIX: Property 'webkitAudioContext' does not exist on type 'Window'. Cast to `any` for compatibility with older browsers.
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

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100 flex flex-col">
      <Header currentView={view} setView={setView} />
      <main className="flex-grow container mx-auto p-4 md:p-8 flex flex-col">
        {view === 'campaign' ? (
          <>
            <div className="w-full max-w-4xl mx-auto">
              <CampaignInput
                goalPrompt={goalPrompt}
                setGoalPrompt={setGoalPrompt}
                audiencePrompt={audiencePrompt}
                setAudiencePrompt={setAudiencePrompt}
                onGenerate={handleGenerateCampaign}
                isLoading={isLoading}
                recordingField={recordingField}
                onToggleRecording={handleToggleRecording}
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
                videoAssets={videoAssets}
                onGenerateVideoForChannel={handleGenerateVideoForChannel}
                isApiKeySelected={isApiKeySelected}
              />
            </div>
          </>
        ) : (
          <ImageEditor />
        )}
      </main>
    </div>
  );
};

export default App;