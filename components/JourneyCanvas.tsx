import React from 'react';
import { Campaign, JourneyNode as JourneyNodeType, Branch, CampaignStrategy, Channel } from '../types';
import { JourneyNode } from './JourneyNode';
import { UserGroupIcon } from './icons/UserGroupIcon';
import { SparklesIcon } from './icons/SparklesIcon';
import { GovernanceDashboard } from './GovernanceDashboard';
import { ChannelSelectionDashboard } from './ChannelSelectionDashboard';
import { AssetGenerationController } from './AssetGenerationController';
import { ChannelAssetCard } from './ChannelAssetCard';
import { AssetGenerationProgress } from '../App';

interface JourneyCanvasProps {
  campaign: Campaign | null;
  isLoading: boolean;
  error: string | null;
  assetGenerationProgress: AssetGenerationProgress;
  onGenerateForChannel: (channelName: string, channelCategory: string) => void;
  onGenerateForAll: () => void;
  onResetAssets: () => void;
  recommendedChannels: (Channel & { category: string })[];
}

const BranchConnector: React.FC<{ label: string }> = ({ label }) => {
    if (!label) return null;
    return (
        <div className="absolute left-[-1rem] top-1/2 -translate-y-1/2 w-max">
            <div className="relative px-2 py-0.5 bg-gray-600 rounded-md">
                <span className="text-xs font-semibold text-gray-200">{label}</span>
                <div className="absolute left-[-4px] top-1/2 -translate-y-1/2 w-2 h-2 bg-gray-600 transform rotate-45"></div>
            </div>
        </div>
    );
};

const renderTree = (nodes: JourneyNodeType[], nodeId: number = 1, renderedIds: Set<number> = new Set()): React.ReactNode => {
    const nodeMap = new Map(nodes.map(n => [n.id, n]));
    const parentNode = nodeMap.get(nodeId);

    if (!parentNode || renderedIds.has(parentNode.id)) return null;

    renderedIds.add(parentNode.id);

    return (
        <div key={parentNode.id} className="relative">
            <JourneyNode node={parentNode} />
            {parentNode.children.length > 0 && (
                 <div className="pl-8 relative before:absolute before:left-4 before:top-0 before:h-full before:border-l-2 before:border-dashed before:border-gray-700">
                    {parentNode.children.map((branch: Branch, index: number) => (
                        <div key={`${parentNode.id}-${branch.nodeId}-${index}`} className="relative pt-4">
                            <BranchConnector label={branch.label} />
                            {renderTree(nodes, branch.nodeId, renderedIds)}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

const PrescriptiveStrategy: React.FC<{ strategy: CampaignStrategy }> = ({ strategy }) => (
    <div className="bg-gray-700/50 rounded-lg p-4 mb-6 border border-indigo-500/30">
        <div className="flex items-start space-x-4">
            <div className="mt-1 flex-shrink-0 w-8 h-8 rounded-full bg-indigo-500 flex items-center justify-center">
                <SparklesIcon className="w-5 h-5 text-white" />
            </div>
            <div className="flex-grow">
                <h3 className="font-semibold text-lg text-white">AI-Prescribed Strategy</h3>
                <p className="text-sm text-gray-300 mt-2">{strategy.recommendations}</p>
                
                <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <h4 className="font-medium text-sm text-gray-200 mb-2">Budget Allocation</h4>
                        <ul className="space-y-1 text-sm">
                            {strategy.budgetAllocation.map((item, index) => (
                                <li key={index} className="flex justify-between items-center p-2 bg-gray-800/50 rounded">
                                    <span className="text-gray-300">{item.channel}: <em className="text-gray-400 text-xs not-italic">{item.rationale}</em></span>
                                    <span className="font-bold text-indigo-300">{item.percentage}%</span>
                                </li>
                            ))}
                        </ul>
                    </div>
                    <div>
                        <h4 className="font-medium text-sm text-gray-200 mb-2">Timing & Duration</h4>
                        <div className="p-2 bg-gray-800/50 rounded text-sm">
                            <p className="text-gray-300"><strong className="font-semibold text-gray-100">Launch:</strong> {strategy.timing.launchDate}</p>
                            <p className="text-gray-300 mt-1"><strong className="font-semibold text-gray-100">Duration:</strong> {strategy.timing.duration}</p>
                            <p className="text-gray-400 text-xs mt-1"><em>{strategy.timing.rationale}</em></p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
);


const AudienceSegment: React.FC<{ campaign: Campaign }> = ({ campaign }) => (
    <div className="bg-gray-700/50 rounded-lg p-4 mb-6">
        <div className="flex items-start space-x-4">
            <div className="mt-1 flex-shrink-0 w-8 h-8 rounded-full bg-teal-500 flex items-center justify-center">
                <UserGroupIcon className="w-5 h-5 text-white" />
            </div>
            <div className="flex-grow">
                <h3 className="font-semibold text-lg text-white">Target Audience Segment</h3>
                <p className="text-sm text-gray-400 italic mt-1">"{campaign.audienceQuery}"</p>
                <div className="mt-4 flex flex-wrap items-center gap-x-6 gap-y-2">
                    <div className="flex items-center">
                        <span className="text-2xl font-bold text-teal-300 mr-2">{campaign.estimatedSize.toLocaleString()}</span>
                        <span className="text-sm text-gray-400">Estimated Profiles</span>
                    </div>
                    <div className="flex flex-wrap gap-2 items-center">
                        <span className="text-sm text-gray-400">Key Attributes:</span>
                        {campaign.keyAttributes.map((attr, index) => (
                            <span key={index} className="bg-gray-600 text-gray-300 text-xs font-medium px-2.5 py-1 rounded-full">{attr}</span>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    </div>
);


export const JourneyCanvas: React.FC<JourneyCanvasProps> = ({ 
    campaign, 
    isLoading, 
    error,
    assetGenerationProgress,
    onGenerateForChannel,
    onGenerateForAll,
    onResetAssets,
    recommendedChannels,
}) => {
  if (isLoading) {
    return (
      <div className="w-full h-full flex flex-col items-center justify-center bg-gray-800/50 rounded-lg p-8 border-2 border-dashed border-gray-700">
        <div className="text-center">
            <div className="loader ease-linear rounded-full border-4 border-t-4 border-gray-500 h-12 w-12 mb-4 mx-auto animate-spin" style={{borderTopColor: '#6366F1'}}></div>
            <h3 className="text-xl font-semibold text-white">Generating Your Campaign Journey...</h3>
            <p className="text-gray-400 mt-2">The AI is building a smart segment and crafting a multi-step strategy. This may take a moment.</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-red-900/20 rounded-lg p-8 border border-red-500">
        <div className="text-center">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-red-400 mx-auto mb-4" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
          <h3 className="text-xl font-semibold text-red-300">Error Generating Campaign</h3>
          <p className="text-red-400 mt-2">{error}</p>
        </div>
      </div>
    );
  }

  if (!campaign) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-gray-800/50 rounded-lg p-8 border-2 border-dashed border-gray-700">
        <div className="text-center">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-gray-600 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <h3 className="text-xl font-semibold text-gray-300">Your campaign journey will appear here</h3>
          <p className="text-gray-500 mt-2">Enter a goal and audience above to get started.</p>
        </div>
      </div>
    );
  }

  const firstNodeId = campaign.nodes.find(n => n.id === 1) ? 1 : (campaign.nodes[0]?.id || null);
  const generatedAssetChannels = Object.keys(campaign.channelAssets || {});

  return (
    <div className="bg-gray-800 rounded-lg p-6 md:p-8">
      <div className="border-b border-gray-700 pb-4 mb-6">
        <h2 className="text-2xl font-bold text-white">{campaign.name}</h2>
        <p className="text-gray-400 mt-1">{campaign.description}</p>
        <div className="mt-4">
            <h4 className="font-semibold text-gray-300 mb-2">Key Performance Indicators (KPIs):</h4>
            <div className="flex flex-wrap gap-2">
                {campaign.kpis.map((kpi, index) => (
                    <span key={index} className="bg-indigo-900/50 text-indigo-300 text-xs font-medium px-2.5 py-1 rounded-full">{kpi}</span>
                ))}
            </div>
        </div>
      </div>
      
      {campaign.strategy && <PrescriptiveStrategy strategy={campaign.strategy} />}
      <AudienceSegment campaign={campaign} />
      {campaign.governancePlan && <GovernanceDashboard plan={campaign.governancePlan} />}
      {campaign.channelSelection && <ChannelSelectionDashboard selection={campaign.channelSelection} />}

      <AssetGenerationController
        progress={assetGenerationProgress}
        onGenerateForChannel={onGenerateForChannel}
        onGenerateForAll={onGenerateForAll}
        onReset={onResetAssets}
        recommendedChannels={recommendedChannels}
      />

      {generatedAssetChannels.length > 0 && (
        <div className="mt-8">
            <h3 className="font-semibold text-lg text-white mb-4">Generated Assets</h3>
            <div className="space-y-6">
                {generatedAssetChannels.map(channelName => (
                    <ChannelAssetCard
                        key={channelName}
                        result={campaign.channelAssets![channelName]}
                    />
                ))}
            </div>
        </div>
      )}

      <h3 className="font-semibold text-lg text-white mb-4 mt-8">Customer Journey Flow</h3>
      <div>
        {firstNodeId ? renderTree(campaign.nodes, firstNodeId) : <p className="text-gray-500">No valid starting node found in the journey.</p>}
      </div>
    </div>
  );
};