
import React, { useMemo } from 'react';
import { markdownToHtml } from './markdownParser';
import { BudgetModifier } from './BudgetModifier';

interface MediaPlanDisplayProps {
    plan: string;
    onRegenerate: (newBudget: string, constraints: string) => void;
    isRegenerating: boolean;
    readOnly?: boolean; // New prop for PDF view
}

export const MediaPlanDisplay: React.FC<MediaPlanDisplayProps> = ({ plan, onRegenerate, isRegenerating, readOnly = false }) => {
    
    const planHtml = useMemo(() => markdownToHtml(plan), [plan]);

    return (
        <div className={`bg-white rounded-3xl p-10 border border-slate-200 shadow-lg shadow-slate-200/50 ${!readOnly ? 'animate-fade-in' : ''}`}>
            <div className="flex items-center gap-4 mb-8 pb-6 border-b border-slate-100">
                <div className="h-10 w-1.5 bg-gradient-to-b from-indigo-500 to-purple-600 rounded-full"></div>
                <div>
                    <h3 className="font-bold text-2xl text-slate-900">Strategic Media Plan</h3>
                    <p className="text-slate-500 text-sm mt-1">Comprehensive budget allocation and channel strategy.</p>
                </div>
            </div>

            <div 
                className="prose prose-slate max-w-none prose-p:text-slate-600 prose-p:leading-7 prose-li:text-slate-600"
                dangerouslySetInnerHTML={{ __html: planHtml }} 
            />
            
            {!readOnly && (
                <div className="mt-16 pt-10 border-t border-slate-100">
                    <BudgetModifier 
                        onRegenerate={onRegenerate} 
                        isRegenerating={isRegenerating}
                    />
                </div>
            )}
        </div>
    );
};
