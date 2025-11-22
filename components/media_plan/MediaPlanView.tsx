
import React, { useState, useCallback, useEffect, useRef } from 'react';
import { User, MediaPlanInputs, Campaign } from '../../types';
import { MediaPlanInput } from './MediaPlanInput';
import { MediaPlanDisplay } from './MediaPlanDisplay';
import { generateMediaPlan, regenerateMediaPlanWithNewBudget } from '../../services/geminiService';
import { DocumentDuplicateIcon } from '../icons/HeroIcons';
import { TaskProgressBar } from '../TaskProgressBar';

interface MediaPlanViewProps {
    user: User;
    campaign: Campaign;
    onSetGlobalSuccess: (message: string | null) => void;
    onUpdateCampaign?: (updates: Partial<Campaign>) => void;
}

const deriveInputsFromCampaign = (campaign: Campaign): MediaPlanInputs => ({
    campaignName: campaign.name,
    objectives: `${campaign.description} Key KPIs include: ${campaign.kpis.join(', ')}.`,
    audience: `${campaign.audienceQuery} Key attributes are: ${campaign.keyAttributes.join(', ')}.`,
    geo: 'USA & Canada', // Default value, can be inferred by AI
    industry: 'Inferred from campaign context (e.g., B2B SaaS, E-commerce)',
    product: `The product/service from "${campaign.name}"`,
    competitors: '', // User to fill for more accuracy
    keywords: '', // User to fill for more accuracy
    duration: campaign.strategy.timing.duration,
});


export const MediaPlanView: React.FC<MediaPlanViewProps> = ({ user, campaign, onSetGlobalSuccess, onUpdateCampaign }) => {
    const [inputs, setInputs] = useState<MediaPlanInputs>(() => 
        campaign.mediaPlanInputs || deriveInputsFromCampaign(campaign)
    );
    const [mediaPlan, setMediaPlan] = useState<string | null>(campaign.mediaPlan || null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const isInitialMount = useRef(true);

    const handleGenerate = useCallback(async (inputsToUse: MediaPlanInputs) => {
        setIsLoading(true);
        setError(null);
        try {
            const result = await generateMediaPlan(inputsToUse);
            setMediaPlan(result);
            
            if (onUpdateCampaign) {
                onUpdateCampaign({
                    mediaPlan: result,
                    mediaPlanInputs: inputsToUse
                });
            }

            if (!isInitialMount.current) {
                onSetGlobalSuccess("Media plan generated and saved successfully.");
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : 'An unknown error occurred.');
        } finally {
            setIsLoading(false);
        }
    }, [onSetGlobalSuccess, onUpdateCampaign]);

    const handleRegenerate = useCallback(async (newBudget: string, constraints: string) => {
        if (!mediaPlan) return;
        setIsLoading(true);
        setError(null);
        try {
            const result = await regenerateMediaPlanWithNewBudget(mediaPlan, newBudget, constraints);
            setMediaPlan(result);
            
            if (onUpdateCampaign) {
                onUpdateCampaign({
                    mediaPlan: result,
                    // We keep the original inputs or update them if we had fields for budget/constraints
                });
            }

            onSetGlobalSuccess("Media plan successfully updated and saved.");
        } catch (err) {
            setError(err instanceof Error ? err.message : 'An unknown error occurred during regeneration.');
        } finally {
            setIsLoading(false);
        }
    }, [mediaPlan, onSetGlobalSuccess, onUpdateCampaign]);

    useEffect(() => {
        if (campaign && isInitialMount.current) {
            // If we already have a plan saved in the campaign object, use it.
            if (campaign.mediaPlan) {
                setMediaPlan(campaign.mediaPlan);
                if (campaign.mediaPlanInputs) {
                    setInputs(campaign.mediaPlanInputs);
                }
            } else {
                // If no plan exists, auto-generate one using default derived inputs
                const derivedInputs = deriveInputsFromCampaign(campaign);
                setInputs(derivedInputs);
                handleGenerate(derivedInputs);
            }
            isInitialMount.current = false;
        }
    }, [campaign, handleGenerate]);
    
    return (
        <div className="w-full animate-fade-in">
            <MediaPlanInput 
                inputs={inputs}
                setInputs={setInputs}
                onGenerate={() => handleGenerate(inputs)}
                isLoading={isLoading && !!mediaPlan} // Show loading on button if we are regenerating
            />

            {error && (
                <div className="w-full mt-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 flex justify-between items-center animate-fade-in">
                    <span>{error}</span>
                    <button onClick={() => setError(null)} className="p-1 rounded-full hover:bg-red-100">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>
            )}

            <div className="mt-8">
                {isLoading && !mediaPlan ? ( // Initial loading state
                     <div className="w-full h-full flex flex-col items-center justify-center bg-white rounded-lg p-8 border-2 border-dashed border-slate-300 min-h-[300px]">
                        <TaskProgressBar 
                            estimatedDuration={15} 
                            label="Generating Media Plan..." 
                            subLabel="Analyzing competitive landscape and benchmarks"
                            progressColor="bg-indigo-600"
                        />
                    </div>
                ) : mediaPlan ? (
                    <MediaPlanDisplay 
                        plan={mediaPlan}
                        onRegenerate={handleRegenerate}
                        isRegenerating={isLoading}
                    />
                ) : !isLoading && !error ? (
                    <div className="w-full h-full flex items-center justify-center bg-white rounded-lg p-8 border-2 border-dashed border-slate-300 min-h-[300px]">
                        <div className="text-center">
                        <DocumentDuplicateIcon className="h-16 w-16 text-slate-300 mx-auto mb-4" />
                        <h3 className="text-xl font-semibold text-slate-700">Your media plan will appear here</h3>
                        <p className="text-slate-500 mt-2">The AI is preparing your plan based on the campaign context.</p>
                        </div>
                    </div>
                ) : null}
            </div>
        </div>
    );
};
