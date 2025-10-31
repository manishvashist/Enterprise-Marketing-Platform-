import React, { useState } from 'react';
import { SingleMarketingAsset, SingleAssetContent } from '../types';
import { LightBulbIcon } from './icons/LightBulbIcon';

interface AssetCardProps {
    asset: SingleMarketingAsset & { channel: string };
}

const renderContentField = (label: string, value: any) => {
    if (!value) return null;
    return (
        <div>
            <p className="font-semibold text-gray-300 text-sm">{label}:</p>
            {Array.isArray(value) ? (
                 <div className="flex flex-wrap gap-2 mt-1">
                    {value.map((item, index) => (
                        <code key={index} className="text-xs bg-gray-700 text-teal-300 px-1.5 py-0.5 rounded">{item}</code>
                    ))}
                </div>
            ) : typeof value === 'object' ? (
                <div className="text-xs text-gray-400 mt-1 space-y-1">
                    {Object.entries(value).map(([key, val]) => val && <p key={key}><strong className="font-medium text-gray-300">{key}:</strong> {String(val)}</p>)}
                </div>
            ) : (
                <p className="text-sm text-gray-400 mt-0.5 italic">"{String(value)}"</p>
            )}
        </div>
    );
};

export const AssetCard: React.FC<AssetCardProps> = ({ asset }) => {
    const [activeVariant, setActiveVariant] = useState('A');
    
    const variantsArray = asset.content.variants || [];
    const hasVariants = variantsArray.length > 0;

    const variants = variantsArray.reduce((acc, variant) => {
        acc[variant.id] = { ...asset.content, ...variant };
        return acc;
    }, { 'A': asset.content } as Record<string, SingleAssetContent>);
    
    const currentContent = variants[activeVariant] || asset.content;
    
    return (
        <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-700/50">
            <div className="flex justify-between items-center mb-3">
                <div>
                    <h5 className="font-bold text-base text-teal-300">{asset.channel}</h5>
                    <p className="text-xs text-gray-400">{asset.assetType}</p>
                </div>
                 {hasVariants && (
                    <div className="flex items-center bg-gray-900/70 rounded-lg p-1">
                        {Object.keys(variants).map(vKey => (
                            <button
                                key={vKey}
                                onClick={() => setActiveVariant(vKey)}
                                className={`px-2.5 py-1 text-xs font-semibold rounded-md transition-colors ${activeVariant === vKey ? 'bg-teal-600 text-white' : 'text-gray-300 hover:bg-gray-700'}`}
                            >
                                Variant {vKey}
                            </button>
                        ))}
                    </div>
                )}
            </div>

            <div className="space-y-3">
                {renderContentField('Headline', currentContent.headline)}
                {renderContentField('Body / Caption', currentContent.bodyCopy || currentContent.caption)}
                {renderContentField('Call to Action', currentContent.cta)}
                {renderContentField('Hashtags', currentContent.hashtags)}
                {renderContentField('Visual Description', currentContent.visualDescription)}
                {currentContent.script && renderContentField('Script', currentContent.script)}

                {(currentContent.specifications || currentContent.bestPractices) && (
                     <div className="pt-3 border-t border-gray-700/50">
                         <h6 className="font-semibold text-gray-300 text-sm mb-1">Details & Specs</h6>
                         {renderContentField('Specifications', currentContent.specifications)}
                         {renderContentField('Best Practices', currentContent.bestPractices?.join(', '))}
                    </div>
                )}
            </div>
        </div>
    );
};