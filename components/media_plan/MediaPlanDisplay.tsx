import React, { useMemo } from 'react';
import { markdownToHtml } from './markdownParser';
import { BudgetModifier } from './BudgetModifier';

interface MediaPlanDisplayProps {
    plan: string;
    onRegenerate: (newBudget: string, constraints: string) => void;
    isRegenerating: boolean;
}

export const MediaPlanDisplay: React.FC<MediaPlanDisplayProps> = ({ plan, onRegenerate, isRegenerating }) => {
    
    const planHtml = useMemo(() => markdownToHtml(plan), [plan]);

    return (
        <div className="bg-slate-800/50 rounded-xl p-6 md:p-8 border border-white/10 shadow-2xl shadow-slate-900/50 animate-fade-in">
            <div 
                className="prose prose-invert prose-sm sm:prose-base max-w-none prose-headings:text-indigo-300 prose-strong:text-white"
                dangerouslySetInnerHTML={{ __html: planHtml }} 
            />
            
            <hr className="my-8 border-gray-700" />

            <BudgetModifier 
                onRegenerate={onRegenerate} 
                isRegenerating={isRegenerating}
            />
        </div>
    );
};
