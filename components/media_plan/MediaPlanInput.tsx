
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

    const isGenerateDisabled = isLoading || Object.values(inputs).some(v => typeof v === 'string' && v.trim() === '');

    return (
        <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-lg shadow-slate-200/50 transition-all">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="flex items-start space-x-5">
                    <div className="mt-1 flex-shrink-0 w-14 h-14 rounded-2xl bg-gradient-to-br from-indigo-500 to-indigo-600 flex items-center justify-center shadow-md shadow-indigo-500/30 text-white">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-7 h-7">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 6h9.75M10.5 6a1.5 1.5 0 1 1-3 0m3 0a1.5 1.5 0 1 0-3 0M3.75 6H7.5m3 12h9.75m-9.75 0a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m-3.75 0H7.5m9-6h3.75m-3.75 0a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m-9.75 0h9.75" />
                        </svg>
                    </div>
                    <div>
                        <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Generative Media Planner</h2>
                        <p className="text-slate-500 mt-1.5 leading-relaxed text-lg">Define your parameters and let AI structure your budget.</p>
                    </div>
                </div>
                <button 
                    onClick={() => setIsExpanded(!isExpanded)}
                    className="flex-shrink-0 px-6 py-3 bg-white text-sm font-bold text-slate-700 rounded-xl hover:bg-slate-50 transition-all flex items-center border border-slate-200 shadow-sm hover:shadow-md"
                >
                    {isExpanded ? 'Hide Parameters' : 'Edit Parameters'}
                    <ChevronDownIcon className={`w-4 h-4 ml-2 transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`} />
                </button>
            </div>
            
            {isExpanded && (
                <div className="mt-8 pt-8 border-t border-slate-100 animate-fade-in">
                    <div className="space-y-8">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <InputField label="Campaign Name" name="campaignName" value={inputs.campaignName} onChange={handleChange} placeholder="e.g., Q3 Product Launch" />
                            <InputField label="Industry / Sector" name="industry" value={inputs.industry} onChange={handleChange} placeholder="e.g., B2B SaaS" />
                            <InputField label="Product / Service Category" name="product" value={inputs.product} onChange={handleChange} placeholder="e.g., Project Management Software" />
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <TextAreaField label="Campaign Objectives & KPIs" name="objectives" value={inputs.objectives} onChange={handleChange} placeholder="e.g., Generate 500 qualified leads (MQLs) with a target CPL of $150." />
                            <TextAreaField label="Target Audience" name="audience" value={inputs.audience} onChange={handleChange} placeholder="e.g., Marketing managers at mid-size tech companies (50-500 employees) in North America." />
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <InputField label="Geographic Markets" name="geo" value={inputs.geo} onChange={handleChange} placeholder="e.g., USA & Canada" />
                            <InputField label="Campaign Duration" name="duration" value={inputs.duration} onChange={handleChange} placeholder="e.g., 3 Months" />
                            <InputField label="Key Competitors" name="competitors" value={inputs.competitors} onChange={handleChange} placeholder="e.g., Asana, Monday.com, ClickUp" />
                        </div>
                        <div>
                            <TextAreaField label="Primary Keywords & Search Terms" name="keywords" value={inputs.keywords} onChange={handleChange} placeholder="e.g., agile project management tools, team collaboration software, best task management app" />
                        </div>
                    </div>
                    <div className="mt-10 flex justify-end border-t border-slate-50 pt-6">
                        <button
                            onClick={onGenerate}
                            disabled={isGenerateDisabled}
                            className="w-full sm:w-auto px-8 py-4 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 disabled:bg-slate-200 disabled:text-slate-400 disabled:cursor-not-allowed transition-all shadow-lg shadow-indigo-600/20 hover:shadow-xl hover:shadow-indigo-600/30 hover:-translate-y-0.5 flex items-center justify-center"
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
                                'Update & Regenerate Plan'
                            )}
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

const InputField: React.FC<React.InputHTMLAttributes<HTMLInputElement> & { label: string }> = ({ label, ...props }) => (
    <div className="group">
        <label htmlFor={props.name} className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 group-focus-within:text-indigo-600 transition-colors">{label}</label>
        <input 
            id={props.name}
            {...props} 
            className="w-full p-3.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all text-slate-900 placeholder-slate-400 group-hover:bg-white group-hover:border-slate-300 shadow-sm"
        />
    </div>
);

const TextAreaField: React.FC<React.TextareaHTMLAttributes<HTMLTextAreaElement> & { label: string }> = ({ label, ...props }) => (
    <div className="group">
        <label htmlFor={props.name} className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 group-focus-within:text-indigo-600 transition-colors">{label}</label>
        <textarea 
            id={props.name}
            {...props} 
            rows={3}
            className="w-full p-3.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all resize-none text-slate-900 placeholder-slate-400 group-hover:bg-white group-hover:border-slate-300 shadow-sm"
        />
    </div>
);
