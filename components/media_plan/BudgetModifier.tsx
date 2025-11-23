
import React, { useState } from 'react';

interface BudgetModifierProps {
    onRegenerate: (newBudget: string, constraints: string) => void;
    isRegenerating: boolean;
}

export const BudgetModifier: React.FC<BudgetModifierProps> = ({ onRegenerate, isRegenerating }) => {
    const [newBudget, setNewBudget] = useState('');
    const [constraints, setConstraints] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onRegenerate(newBudget, constraints);
    };

    return (
        <div className="bg-slate-50 rounded-2xl p-8 border border-slate-200">
            <div className="flex items-start gap-4 mb-6">
                <div className="p-2 bg-white rounded-xl border border-slate-200 text-indigo-600 shadow-sm">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0 3.181 3.183a8.25 8.25 0 0 0 13.803-3.7M4.031 9.865a8.25 8.25 0 0 1 13.803-3.7l3.181 3.182m0-4.991v4.99" />
                    </svg>
                </div>
                <div>
                    <h3 className="text-lg font-bold text-slate-900">Adapt Strategy</h3>
                    <p className="text-slate-500 mt-1 text-sm">Adjust the budget or add constraints to see how the AI recalculates the plan instantly.</p>
                </div>
            </div>
            
            <form onSubmit={handleSubmit}>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="md:col-span-1">
                        <label htmlFor="new-budget" className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">New Total Budget</label>
                        <div className="relative group">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <span className="text-slate-400 font-bold group-focus-within:text-indigo-500 transition-colors">$</span>
                            </div>
                            <input
                                type="number"
                                id="new-budget"
                                value={newBudget}
                                onChange={(e) => setNewBudget(e.target.value)}
                                placeholder="e.g., 50000"
                                required
                                className="w-full pl-7 p-3 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all text-slate-900 placeholder-slate-400 shadow-sm font-medium"
                            />
                        </div>
                    </div>
                    <div className="md:col-span-2">
                        <label htmlFor="constraints" className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Strategic Constraints (Optional)</label>
                        <input
                            type="text"
                            id="constraints"
                            value={constraints}
                            onChange={(e) => setConstraints(e.target.value)}
                            placeholder="e.g., Prioritize LinkedIn Ads, reduce OOH spend..."
                            className="w-full p-3 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all text-slate-900 placeholder-slate-400 shadow-sm"
                        />
                    </div>
                </div>
                <div className="mt-6 text-right">
                    <button 
                        type="submit"
                        disabled={isRegenerating || !newBudget}
                        className="px-6 py-3 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 disabled:bg-slate-200 disabled:text-slate-400 disabled:cursor-not-allowed transition-all shadow-lg shadow-indigo-600/20 hover:shadow-xl hover:-translate-y-0.5"
                    >
                        {isRegenerating ? 'Calculating...' : 'Recalculate Plan'}
                    </button>
                </div>
            </form>
        </div>
    );
};
