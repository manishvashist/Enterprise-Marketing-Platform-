

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
        <div className="bg-white rounded-xl p-6 md:p-8 border border-slate-200 shadow-sm animate-fade-in">
            <div 
                className="prose prose-slate prose-sm sm:prose-base max-w-none prose-headings:text-slate-900 prose-strong:text-slate-900 prose-p:text-slate-600"
                dangerouslySetInnerHTML={{ __html: planHtml }} 
            />
            
            <hr className="my-8 border-slate-200" />

            <BudgetModifier 
                onRegenerate={onRegenerate} 
                isRegenerating={isRegenerating}
            />
        </div>
    );
};