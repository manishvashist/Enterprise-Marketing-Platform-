import React, { useState } from 'react';
import { SingleMarketingAsset } from '../types';

interface SingleAssetCardProps {
    asset: SingleMarketingAsset;
}

const renderContentField = (label: string, value: any) => {
    if (!value || (Array.isArray(value) && value.length === 0)) return null;
    return (
        <div className="text-sm">
            <p className="font-semibold text-gray-300">{label}:</p>
            {Array.isArray(value) ? (
                 <div className="flex flex-wrap gap-2 mt-1">
                    {value.map((item, index) => (
                        <code key={index} className="text-xs bg-gray-700 text-teal-300 px-1.5 py-0.5 rounded">{item}</code>
                    ))}
                </div>
            ) : typeof value === 'object' ? (
                <div className="text-xs text-gray-400 mt-1 space-y-1 p-2 bg-gray-800 rounded">
                    {Object.entries(value).map(([key, val]) => val && <p key={key}><strong className="font-medium text-gray-300">{key}:</strong> {String(val)}</p>)}
                </div>
            ) : (
                <p className="text-gray-400 mt-0.5 italic">"{String(value)}"</p>
            )}
        </div>
    );
};

export const SingleAssetCard: React.FC<SingleAssetCardProps> = ({ asset }) => {
    const [activeIndex, setActiveIndex] = useState(0);
    const variants = asset.content.variants || [];
    const hasVariants = variants.length > 0;

    const currentVariant = hasVariants ? variants[activeIndex] : null;

    // We show base content, and then show the variant-specific fields from the active variant.
    const displayContent = {
        ...asset.content,
        ...(currentVariant || {})
    };

    return (
        <div className="bg-gray-800/70 rounded-lg p-4">
            <div className="flex justify-between items-start mb-3">
                <div>
                    <h5 className="font-semibold text-base text-gray-100">{asset.assetType}</h5>
                </div>
                 {hasVariants && (
                    <div className="flex items-center bg-gray-900/70 rounded-lg p-1">
                        {variants.map((v, index) => (
                            <button
                                key={v.id}
                                onClick={() => setActiveIndex(index)}
                                className={`px-2.5 py-1 text-xs font-semibold rounded-md transition-colors ${activeIndex === index ? 'bg-teal-600 text-white' : 'text-gray-300 hover:bg-gray-700'}`}
                            >
                                Variant {v.id}
                            </button>
                        ))}
                    </div>
                )}
            </div>

            <div className="space-y-3">
                {renderContentField('Headline', displayContent.headline)}
                {renderContentField('Body / Caption', displayContent.bodyCopy || displayContent.caption)}
                {renderContentField('Call to Action', displayContent.cta)}
                {renderContentField('Hashtags', displayContent.hashtags)}
                {renderContentField('Visual Description', displayContent.visualDescription)}
                {displayContent.script && renderContentField('Script', displayContent.script)}

                {(displayContent.specifications || displayContent.bestPractices) && (
                     <div className="pt-3 mt-2 border-t border-gray-700/50">
                         {renderContentField('Specifications', displayContent.specifications)}
                         {renderContentField('Best Practices', displayContent.bestPractices?.join(', '))}
                    </div>
                )}
                {currentVariant?.reasoning && (
                    <div className="pt-2 text-xs">
                        <p className="font-semibold text-teal-400">Variant Rationale:</p>
                        <p className="text-gray-400 italic">"{currentVariant.reasoning}"</p>
                    </div>
                )}
            </div>
        </div>
    );
};