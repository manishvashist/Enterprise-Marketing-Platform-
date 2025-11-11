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
        <div>
            <h3 className="text-xl font-bold text-white">Modify Budget & Recalculate</h3>
            <p className="text-gray-400 mt-1 mb-4 text-sm">Enter a new total budget to see how the plan adapts.</p>
            
            <form onSubmit={handleSubmit} className="p-4 bg-gray-900/50 rounded-lg border border-gray-700">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="md:col-span-1">
                        <label htmlFor="new-budget" className="block text-sm font-medium text-gray-300 mb-2">New Total Budget ($)</label>
                        <input
                            type="number"
                            id="new-budget"
                            value={newBudget}
                            onChange={(e) => setNewBudget(e.target.value)}
                            placeholder="e.g., 250000"
                            required
                            className="w-full p-3 bg-slate-900 border border-slate-700 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all text-gray-200 placeholder-gray-500"
                        />
                    </div>
                    <div className="md:col-span-2">
                        <label htmlFor="constraints" className="block text-sm font-medium text-gray-300 mb-2">Channel Priorities or Constraints (Optional)</label>
                        <input
                            type="text"
                            id="constraints"
                            value={constraints}
                            onChange={(e) => setConstraints(e.target.value)}
                            placeholder="e.g., Must-have channels: Google Search, LinkedIn. Reduce display ads first."
                            className="w-full p-3 bg-slate-900 border border-slate-700 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all text-gray-200 placeholder-gray-500"
                        />
                    </div>
                </div>
                <div className="mt-4 text-right">
                    <button 
                        type="submit"
                        disabled={isRegenerating || !newBudget}
                        className="px-6 py-2.5 bg-indigo-600 text-white font-semibold rounded-md hover:bg-indigo-700 disabled:bg-slate-600 disabled:cursor-not-allowed transition-all"
                    >
                        {isRegenerating ? 'Recalculating...' : 'Recalculate Plan'}
                    </button>
                </div>
            </form>
        </div>
    );
};
