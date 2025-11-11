import React, { useState, useCallback, useEffect, useRef } from 'react';
import { User, MediaPlanInputs, Campaign } from '../../types';
import { MediaPlanInput } from './MediaPlanInput';
import { MediaPlanDisplay } from './MediaPlanDisplay';
import { generateMediaPlan, regenerateMediaPlanWithNewBudget } from '../../services/geminiService';
import { DocumentDuplicateIcon } from '../icons/HeroIcons';

interface MediaPlanViewProps {
    user: User;
    campaign: Campaign;
    onSetGlobalSuccess: (message: string | null) => void;
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


export const MediaPlanView: React.FC<MediaPlanViewProps> = ({ user, campaign, onSetGlobalSuccess }) => {
    const [inputs, setInputs] = useState<MediaPlanInputs>(() => deriveInputsFromCampaign(campaign));
    const [mediaPlan, setMediaPlan] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const isInitialMount = useRef(true);

    const handleGenerate = useCallback(async (inputsToUse: MediaPlanInputs) => {
        setIsLoading(true);
        setError(null);
        try {
            const result = await generateMediaPlan(inputsToUse);
            setMediaPlan(result);
            if (!isInitialMount.current) {
                onSetGlobalSuccess("Media plan regenerated successfully with new parameters.");
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : 'An unknown error occurred.');
        } finally {
            setIsLoading(false);
        }
    }, [onSetGlobalSuccess]);

    const handleRegenerate = useCallback(async (newBudget: string, constraints: string) => {
        if (!mediaPlan) return;
        setIsLoading(true);
        setError(null);
        try {
            const result = await regenerateMediaPlanWithNewBudget(mediaPlan, newBudget, constraints);
            setMediaPlan(result);
            onSetGlobalSuccess("Media plan successfully updated with the new budget.");
        } catch (err) {
            setError(err instanceof Error ? err.message : 'An unknown error occurred during regeneration.');
        } finally {
            setIsLoading(false);
        }
    }, [mediaPlan, onSetGlobalSuccess]);

    useEffect(() => {
        if (campaign && isInitialMount.current) {
            const derivedInputs = deriveInputsFromCampaign(campaign);
            setInputs(derivedInputs);
            handleGenerate(derivedInputs);
            isInitialMount.current = false;
        }
    }, [campaign, handleGenerate]);
    
    return (
        <div className="w-full animate-fade-in">
            <MediaPlanInput 
                inputs={inputs}
                setInputs={setInputs}
                onGenerate={() => handleGenerate(inputs)}
                isLoading={isLoading && !mediaPlan} // Only show main loading state on the button when regenerating
            />

            {error && (
                <div className="w-full mt-4 p-4 bg-red-900/30 border border-red-500/50 rounded-lg text-red-300 flex justify-between items-center animate-fade-in">
                    <span>{error}</span>
                    <button onClick={() => setError(null)} className="p-1 rounded-full hover:bg-red-800/50">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>
            )}

            <div className="mt-8">
                {isLoading && !mediaPlan ? ( // Initial loading state
                     <div className="w-full h-full flex flex-col items-center justify-center bg-slate-800/50 rounded-lg p-8 border-2 border-dashed border-slate-700">
                        <div className="text-center">
                            <svg className="animate-spin h-12 w-12 text-indigo-500 mx-auto mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            <h3 className="text-xl font-semibold text-white">Generating Your Media Plan...</h3>
                            <p className="text-gray-400 mt-2">The AI is analyzing your campaign context to build a data-driven plan.</p>
                        </div>
                    </div>
                ) : mediaPlan ? (
                    <MediaPlanDisplay 
                        plan={mediaPlan}
                        onRegenerate={handleRegenerate}
                        isRegenerating={isLoading}
                    />
                ) : !isLoading && !error ? (
                    <div className="w-full h-full flex items-center justify-center bg-slate-800/50 rounded-lg p-8 border-2 border-dashed border-slate-700">
                        <div className="text-center">
                        <DocumentDuplicateIcon className="h-16 w-16 text-slate-600 mx-auto mb-4" />
                        <h3 className="text-xl font-semibold text-gray-300">Your media plan will appear here</h3>
                        <p className="text-gray-500 mt-2">The AI is preparing your plan based on the campaign context.</p>
                        </div>
                    </div>
                ) : null}
            </div>
        </div>
    );
};