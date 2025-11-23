import React, { useState } from 'react';
import { SingleMarketingAsset } from '../types';

interface SingleAssetCardProps {
    asset: SingleMarketingAsset;
}

const renderContentField = (label: string, value: any) => {
    if (!value || (Array.isArray(value) && value.length === 0)) return null;
    return (
        <div className="text-sm">
            <p className="font-bold text-slate-800 mb-1">{label}</p>
            {Array.isArray(value) ? (
                 <div className="flex flex-wrap gap-2">
                    {value.map((item, index) => (
                        <code key={index} className="text-xs bg-white text-teal-700 border border-slate-200 px-2 py-1 rounded-md shadow-sm font-medium">{item}</code>
                    ))}
                </div>
            ) : typeof value === 'object' ? (
                <div className="text-xs text-slate-600 mt-1 space-y-2 p-3 bg-white border border-slate-200 rounded-lg shadow-sm">
                    {Object.entries(value).map(([key, val]) => val && <p key={key}><strong className="font-semibold text-slate-900">{key}:</strong> {String(val)}</p>)}
                </div>
            ) : (
                <div className="p-3 bg-white border border-slate-200 rounded-lg shadow-sm">
                    <p className="text-slate-600 text-sm leading-relaxed whitespace-pre-wrap">{String(value)}</p>
                </div>
            )}
        </div>
    );
};

export const SingleAssetCard: React.FC<SingleAssetCardProps> = ({ asset }) => {
    const [activeIndex, setActiveIndex] = useState(0);
    const variants = asset.content.variants || [];
    const hasVariants = variants.length > 0;

    const currentVariant = hasVariants ? variants[activeIndex] : null;

    const displayContent = {
        ...asset.content,
        ...(currentVariant || {})
    };

    return (
        <div className="bg-slate-50 rounded-xl p-6 border border-slate-200 transition-all hover:border-slate-300">
            <div className="flex flex-col sm:flex-row justify-between items-start mb-6 gap-4">
                <div>
                    <h5 className="font-bold text-lg text-slate-800">{asset.assetType}</h5>
                    <span className="text-xs font-medium text-slate-400 uppercase tracking-wider">Generated Asset</span>
                </div>
                 {hasVariants && (
                    <div className="flex items-center bg-white rounded-lg p-1.5 border border-slate-200 shadow-sm">
                        {variants.map((v, index) => (
                            <button
                                key={v.id}
                                onClick={() => setActiveIndex(index)}
                                className={`px-3 py-1.5 text-xs font-bold rounded-md transition-all ${activeIndex === index ? 'bg-teal-600 text-white shadow-md' : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'}`}
                            >
                                Variant {v.id}
                            </button>
                        ))}
                    </div>
                )}
            </div>

            <div className="space-y-5">
                {renderContentField('Headline', displayContent.headline)}
                {renderContentField('Body / Caption', displayContent.bodyCopy || displayContent.caption)}
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    {renderContentField('Call to Action', displayContent.cta)}
                    {renderContentField('Hashtags', displayContent.hashtags)}
                </div>

                {displayContent.visualDescription && renderContentField('Visual Description', displayContent.visualDescription)}
                {displayContent.script && renderContentField('Script', displayContent.script)}

                {(displayContent.specifications || displayContent.bestPractices) && (
                     <div className="pt-5 mt-2 border-t border-slate-200/60 grid grid-cols-1 md:grid-cols-2 gap-5">
                         {renderContentField('Specifications', displayContent.specifications)}
                         {renderContentField('Best Practices', displayContent.bestPractices?.join(', '))}
                    </div>
                )}
                {currentVariant?.reasoning && (
                    <div className="pt-3 mt-2">
                        <div className="text-xs bg-teal-50/50 p-3 rounded-lg border border-teal-100">
                            <p className="font-bold text-teal-800 uppercase tracking-wide text-[10px] mb-1">Variant Rationale</p>
                            <p className="text-teal-700 italic leading-relaxed">"{currentVariant.reasoning}"</p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};