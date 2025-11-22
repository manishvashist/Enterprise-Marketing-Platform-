

import React, { useState } from 'react';
import { MediaPlanInputs } from '../../types';
import { ChevronDownIcon } from '../icons/ChevronDownIcon';

interface MediaPlanInputProps {
    inputs: MediaPlanInputs;
    setInputs: React.Dispatch<React.SetStateAction<MediaPlanInputs>>;
    onGenerate: () => void;
    isLoading: boolean;
}

export const MediaPlanInput: React.FC<MediaPlanInputProps> = ({ inputs, setInputs, onGenerate, isLoading }) => {
    const [isExpanded, setIsExpanded] = useState(false);
    
    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setInputs(prev => ({ ...prev, [name]: value }));
    };

    // FIX: Add a type guard to ensure `v` is a string before calling .trim(). This resolves the TypeScript error where `v` was inferred as `unknown`.
    const isGenerateDisabled = isLoading || Object.values(inputs).some(v => typeof v === 'string' && v.trim() === '');

    return (
        <div className="bg-white rounded-xl shadow-sm p-6 md:p-8 border border-slate-200">
            <div className="flex justify-between items-start">
                <div>
                    <h2 className="text-2xl font-bold mb-1 text-slate-900">Generative Media Planner</h2>
                    <p className="text-slate-500">The AI has generated a plan based on your campaign. You can adjust the parameters below and regenerate.</p>
                </div>
                <button 
                    onClick={() => setIsExpanded(!isExpanded)}
                    className="flex-shrink-0 ml-4 px-4 py-2 bg-slate-100 text-sm font-semibold text-slate-700 rounded-md hover:bg-slate-200 transition-colors flex items-center border border-slate-200"
                >
                    {isExpanded ? 'Hide' : 'Show'} Parameters
                    <ChevronDownIcon className={`w-5 h-5 ml-1 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
                </button>
            </div>
            
            {isExpanded && (
                <div className="mt-6 pt-6 border-t border-slate-200 animate-fade-in">
                    <div className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <InputField label="Campaign Name" name="campaignName" value={inputs.campaignName} onChange={handleChange} placeholder="e.g., Q3 Product Launch" />
                            <InputField label="Industry / Sector" name="industry" value={inputs.industry} onChange={handleChange} placeholder="e.g., B2B SaaS" />
                            <InputField label="Product / Service Category" name="product" value={inputs.product} onChange={handleChange} placeholder="e.g., Project Management Software" />
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <TextAreaField label="Campaign Objectives & KPIs" name="objectives" value={inputs.objectives} onChange={handleChange} placeholder="e.g., Generate 500 qualified leads (MQLs) with a target CPL of $150." />
                            <TextAreaField label="Target Audience" name="audience" value={inputs.audience} onChange={handleChange} placeholder="e.g., Marketing managers at mid-size tech companies (50-500 employees) in North America." />
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <InputField label="Geographic Markets" name="geo" value={inputs.geo} onChange={handleChange} placeholder="e.g., USA & Canada" />
                            <InputField label="Campaign Duration" name="duration" value={inputs.duration} onChange={handleChange} placeholder="e.g., 3 Months" />
                            <InputField label="Key Competitors" name="competitors" value={inputs.competitors} onChange={handleChange} placeholder="e.g., Asana, Monday.com, ClickUp" />
                        </div>
                        <div>
                            <TextAreaField label="Primary Keywords & Search Terms" name="keywords" value={inputs.keywords} onChange={handleChange} placeholder="e.g., agile project management tools, team collaboration software, best task management app" />
                        </div>
                    </div>
                    <div className="mt-8 flex justify-end">
                        <button
                            onClick={onGenerate}
                            disabled={isGenerateDisabled}
                            className="w-full sm:w-auto px-8 py-3 bg-indigo-600 text-white font-bold rounded-lg hover:bg-indigo-700 disabled:bg-slate-300 disabled:cursor-not-allowed transition-all shadow-lg shadow-indigo-600/20 hover:shadow-xl hover:shadow-indigo-600/30 flex items-center justify-center"
                        >
                            {isLoading ? (
                                <>
                                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    Regenerating...
                                </>
                            ) : (
                                '✨ Update & Regenerate Plan'
                            )}
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

const InputField: React.FC<React.InputHTMLAttributes<HTMLInputElement> & { label: string }> = ({ label, ...props }) => (
    <div>
        <label htmlFor={props.name} className="block text-sm font-medium text-slate-700 mb-2">{label}</label>
        <input 
            id={props.name}
            {...props} 
            className="w-full p-3 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all text-slate-900 placeholder-slate-400"
        />
    </div>
);

const TextAreaField: React.FC<React.TextareaHTMLAttributes<HTMLTextAreaElement> & { label: string }> = ({ label, ...props }) => (
    <div>
        <label htmlFor={props.name} className="block text-sm font-medium text-slate-700 mb-2">{label}</label>
        <textarea 
            id={props.name}
            {...props} 
            rows={3}
            className="w-full p-3 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all resize-none text-slate-900 placeholder-slate-400"
        />
    </div>
);