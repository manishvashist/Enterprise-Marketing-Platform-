
import React, { useState, useEffect } from 'react';
// FIX: Import AssetGenerationProgress and VideoAssetState from types.ts to solve module resolution and circular dependency issues.
import { Campaign, JourneyNode as JourneyNodeType, Branch, CampaignStrategy, Channel, ChannelConnection, User, AssetGenerationProgress, VideoAssetState } from '../types';
import { JourneyNode } from './JourneyNode';
import { UserGroupIcon } from './icons/UserGroupIcon';
import { SparklesIcon } from './icons/SparklesIcon';
import { GovernanceDashboard } from './GovernanceDashboard';
import { ChannelSelectionDashboard } from './ChannelSelectionDashboard';
import { AssetGenerationController } from './AssetGenerationController';
import { ChannelAssetCard } from './ChannelAssetCard';
import { VideoGenerationController } from './VideoGenerationController';
import { VideoAssetCard } from './VideoAssetCard';
import { AnalyticsDashboard } from './AnalyticsDashboard';
import { CampaignExecutionManager } from './CampaignExecutionManager';
import { ConfirmationModal } from './ConfirmationModal';
import { DocumentDuplicateIcon, DocumentArrowDownIcon, PencilSquareIcon, InformationCircleIcon } from './icons/HeroIcons';
import { MediaPlanView } from './media_plan/MediaPlanView';
import { TaskProgressBar } from './TaskProgressBar';

interface JourneyCanvasProps {
  user: User; // User is now required
  campaign: Campaign | null;
  isLoading: boolean;
  error: string | null;
  assetGenerationProgress: AssetGenerationProgress;
  onGenerateForChannel: (channelName: string, channelCategory: string) => void;
  onGenerateForAll: () => void;
  onResetAssets: () => void;
  recommendedChannels: (Channel & { category: string })[];
  videoAssets: Record<string, VideoAssetState>;
  onGenerateVideoForChannel: (channelName: string) => void;
  isApiKeySelected: boolean;
  channelConnections: Record<string, ChannelConnection>;
  onSaveCampaign: () => void;
  isSaving: boolean;
  onSetGlobalSuccess: (message: string | null) => void;
  onCampaignUpdate?: (updates: Partial<Campaign>) => void;
}

type CanvasTab = 'overview' | 'journey' | 'governance' | 'channels' | 'mediaPlan' | 'assets' | 'launchpad';

const BranchConnector: React.FC<{ label: string }> = ({ label }) => {
    if (!label) return null;
    return (
        <div className="absolute left-[-1rem] top-1/2 -translate-y-1/2 w-max">
            <div className="relative px-2 py-0.5 bg-white rounded-md border border-slate-300 shadow-sm">
                <span className="text-xs font-semibold text-slate-600">{label}</span>
                <div className="absolute left-[-4px] top-1/2 -translate-y-1/2 w-2 h-2 bg-white border-l border-b border-slate-300 transform rotate-45"></div>
            </div>
        </div>
    );
};

const renderTree = (nodes: JourneyNodeType[], nodeId: number = 1, renderedIds: Set<number> = new Set(), isAnimating: boolean = false, delay: number = 0): React.ReactNode => {
    const nodeMap = new Map(nodes.map(n => [n.id, n]));
    const parentNode = nodeMap.get(nodeId);

    if (!parentNode || renderedIds.has(parentNode.id)) return null;

    renderedIds.add(parentNode.id);

    const animationStyle = isAnimating ? { animationDelay: `${delay}ms` } : {};
    const animationClass = isAnimating ? 'animate-journey-element' : '';

    return (
        <div key={parentNode.id} className={`relative ${animationClass}`} style={animationStyle}>
            <JourneyNode node={parentNode} />
            {parentNode.children.length > 0 && (
                 <div className="pl-8 relative before:absolute before:left-4 before:top-0 before:h-full before:border-l-2 before:border-dashed before:border-slate-300">
                    {parentNode.children.map((branch: Branch, index: number) => (
                        <div key={`${parentNode.id}-${branch.nodeId}-${index}`} className="relative pt-4">
                            <BranchConnector label={branch.label} />
                            {renderTree(nodes, branch.nodeId, renderedIds, isAnimating, delay + 150)}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

const PrescriptiveStrategy: React.FC<{ strategy: CampaignStrategy }> = ({ strategy }) => (
    <div className="bg-white rounded-xl p-6 mb-6 border border-slate-200 shadow-sm">
        <div className="flex items-start space-x-4">
            <div className="mt-1 flex-shrink-0 w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center">
                <SparklesIcon className="w-6 h-6 text-orange-600" />
            </div>
            <div className="flex-grow">
                <h3 className="font-semibold text-lg text-slate-900">AI-Prescribed Strategy</h3>
                <p className="text-sm text-slate-600 mt-2">{strategy.recommendations}</p>
                
                <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <h4 className="font-medium text-sm text-slate-800 mb-2">Budget Allocation</h4>
                        <ul className="space-y-2 text-sm">
                            {strategy.budgetAllocation.map((item, index) => (
                                <li key={index} className="flex justify-between items-center p-3 bg-slate-50 border border-slate-100 rounded-md">
                                    <span className="text-slate-600">{item.channel}: <em className="text-slate-400 text-xs not-italic">{item.rationale}</em></span>
                                    <span className="font-bold text-orange-600 text-lg">{item.percentage}%</span>
                                </li>
                            ))}
                        </ul>
                    </div>
                    <div>
                        <h4 className="font-medium text-sm text-slate-800 mb-2">Timing & Duration</h4>
                        <div className="p-3 bg-slate-50 border border-slate-100 rounded-md text-sm space-y-2">
                           <div>
                             <p className="text-xs text-slate-500">Launch</p>
                             <p className="font-semibold text-slate-800">{strategy.timing.launchDate}</p>
                           </div>
                           <div>
                              <p className="text-xs text-slate-500">Duration</p>
                              <p className="font-semibold text-slate-800">{strategy.timing.duration}</p>
                           </div>
                            <p className="text-slate-500 text-xs pt-2 border-t border-slate-200"><em>{strategy.timing.rationale}</em></p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
);


const AudienceSegment: React.FC<{ campaign: Campaign }> = ({ campaign }) => (
    <div className="bg-white rounded-xl p-6 mb-6 border border-slate-200 shadow-sm">
        <div className="flex items-start space-x-4">
            <div className="mt-1 flex-shrink-0 w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center">
                <UserGroupIcon className="w-6 h-6 text-emerald-600" />
            </div>
            <div className="flex-grow">
                <h3 className="font-semibold text-lg text-slate-900">Target Audience Segment</h3>
                <p className="text-sm text-slate-500 italic mt-1">"{campaign.audienceQuery}"</p>
                <div className="mt-4 flex flex-wrap items-center gap-x-6 gap-y-2">
                    <div className="flex items-center">
                        <span className="text-3xl font-bold text-emerald-600 mr-2">{campaign.estimatedSize.toLocaleString()}</span>
                        <span className="text-sm text-slate-500">Estimated Profiles</span>
                    </div>
                    <div className="flex flex-wrap gap-2 items-center">
                        {campaign.keyAttributes.map((attr, index) => (
                            <span key={index} className="bg-slate-100 text-slate-600 border border-slate-200 text-xs font-medium px-2.5 py-1 rounded-full">{attr}</span>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    </div>
);


export const JourneyCanvas: React.FC<JourneyCanvasProps> = ({ 
    user,
    campaign, 
    isLoading, 
    error,
    assetGenerationProgress,
    onGenerateForChannel,
    onGenerateForAll,
    onResetAssets,
    recommendedChannels,
    videoAssets,
    onGenerateVideoForChannel,
    isApiKeySelected,
    channelConnections,
    onSaveCampaign,
    isSaving,
    onSetGlobalSuccess,
    onCampaignUpdate,
}) => {
  const [isAnimating, setIsAnimating] = useState(false);
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [downloadType, setDownloadType] = useState<'json' | 'pdf' | null>(null);
  const [activeTab, setActiveTab] = useState<CanvasTab>('overview');

  useEffect(() => {
    // Trigger animation only when the campaign object itself changes
    if (campaign) {
      setActiveTab('overview');
      setIsAnimating(true);
      const animationDuration = (campaign.nodes.length * 150) + 500;
      const timer = setTimeout(() => setIsAnimating(false), animationDuration);
      return () => clearTimeout(timer);
    }
  }, [campaign?.id]); // Depend on a stable property like ID

  if (isLoading) {
    return (
      <div className="w-full h-full flex flex-col items-center justify-center bg-white rounded-xl p-8 border-2 border-dashed border-slate-300 min-h-[400px]">
        <TaskProgressBar 
            estimatedDuration={20} 
            label="Generating Campaign Strategy..." 
            subLabel="Building smart segments and crafting multi-step journey"
            progressColor="bg-orange-600"
        />
      </div>
    );
  }

  if (error && !campaign) { // Only show full-screen error if there's no campaign data to display
    return (
      <div className="w-full h-full flex items-center justify-center bg-red-50 rounded-xl p-8 border border-red-200 min-h-[400px]">
        <div className="text-center">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-red-500 mx-auto mb-4" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
          <h3 className="text-xl font-semibold text-red-700">Error Generating Campaign</h3>
          <p className="text-red-600 mt-2">{error}</p>
        </div>
      </div>
    );
  }

  if (!campaign) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-white rounded-xl p-8 border-2 border-dashed border-slate-300 min-h-[400px]">
        <div className="text-center">
          <DocumentDuplicateIcon className="h-16 w-16 text-slate-300 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-slate-700">Your campaign will appear here</h3>
          <p className="text-slate-500 mt-2">Enter a goal and audience above to get started.</p>
        </div>
      </div>
    );
  }

  const handleDownloadJson = () => {
    setDownloadType('json');
    setIsConfirmModalOpen(true);
  };

  const handleDownloadPdf = () => {
    setDownloadType('pdf');
    setIsConfirmModalOpen(true);
  };

  const handleConfirmDownload = () => {
    if (!campaign) return;

    if (downloadType === 'json') {
        const jsonString = JSON.stringify(campaign, null, 2);
        const blob = new Blob([jsonString], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${campaign.name.replace(/\s+/g, '_').toLowerCase()}_journey.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    } else if (downloadType === 'pdf') {
        const element = document.getElementById('journey-print-area');
        // @ts-ignore
        if (element && window.html2pdf) {
            // Add class to handle styling during PDF generation
            element.classList.add('pdf-generating');
            
            const opt = {
                margin: 10,
                filename: `${campaign.name.replace(/\s+/g, '_').toLowerCase()}_campaign.pdf`,
                image: { type: 'jpeg', quality: 0.98 },
                html2canvas: { scale: 2, useCORS: true, logging: false },
                jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
            };

            // @ts-ignore
            window.html2pdf().set(opt).from(element).save().then(() => {
                element.classList.remove('pdf-generating');
            }).catch((err: any) => {
                console.error("PDF Generation Failed:", err);
                element.classList.remove('pdf-generating');
                // Fallback to print if generation fails
                window.print();
            });
        } else {
            window.print();
        }
    }
    
    setIsConfirmModalOpen(false);
    setDownloadType(null);
  };

  const firstNodeId = campaign.nodes.find(n => n.id === 1) ? 1 : (campaign.nodes[0]?.id || null);
  const generatedAssetChannels = Object.keys(campaign.channelAssets || {});
  // FIX: Explicitly type 'state' to resolve type inference issue.
  const generatedVideoAssets = Object.entries(videoAssets).filter(([, state]: [string, VideoAssetState]) => state.status === 'done' && !!state.url);
  const hasGeneratedAssets = generatedAssetChannels.length > 0 || generatedVideoAssets.length > 0;
  
  const getSaveButtonStatus = () => {
    // The consumption of the trial credit happens on this first save.
    return { disabled: false, title: "Save campaign progress" };
  }
  const saveButtonStatus = getSaveButtonStatus();

  const getSaveStatusText = () => {
    if (isSaving) {
        return <span className="text-orange-500 animate-pulse font-medium">Saving...</span>;
    }
    if (campaign.isTrialCampaign && !campaign.id) {
        return <span className="text-yellow-700 bg-yellow-100 px-2 py-1 rounded-md text-xs font-medium border border-yellow-200">Unsaved Trial</span>;
    }
    if (campaign.updatedAt) {
        return `Saved: ${new Date(campaign.updatedAt).toLocaleTimeString()}`;
    }
    return 'Unsaved';
  };

  const tabs: { id: CanvasTab; label: string; visible: boolean }[] = [
    { id: 'overview', label: 'Overview', visible: true },
    { id: 'journey', label: 'Journey Flow', visible: true },
    { id: 'governance', label: 'Governance', visible: true },
    { id: 'channels', label: 'Channel Strategy', visible: true },
    { id: 'mediaPlan', label: 'Media Plan', visible: !!campaign },
    { id: 'assets', label: 'Creative Assets', visible: true },
    { id: 'launchpad', label: 'Launchpad', visible: hasGeneratedAssets && user.role !== 'User' },
  ];

  const TabButton: React.FC<{id: CanvasTab, label: string}> = ({id, label}) => (
    <button
      onClick={() => setActiveTab(id)}
      className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${activeTab === id ? 'bg-slate-100 text-slate-900 font-bold shadow-sm border border-slate-200' : 'text-slate-500 hover:bg-slate-50 hover:text-slate-700'}`}
    >
      {label}
    </button>
  );

  return (
    <div className="bg-white rounded-xl p-6 md:p-8 border border-slate-200 shadow-lg">
      <style>{`
        @keyframes journey-element-fade-in {
          from { opacity: 0; transform: translateX(-20px); }
          to { opacity: 1; transform: translateX(0); }
        }
        .animate-journey-element {
          animation: journey-element-fade-in 0.5s ease-out forwards;
          opacity: 0;
        }
        .print-only-header { display: none; }
        
        /* PDF Generation Styles */
        .pdf-generating .no-print { display: none !important; }
        .pdf-generating .print-only-header { display: block !important; margin-bottom: 1.5rem; padding-bottom: 1rem; border-bottom: 1px solid #e5e7eb; }
        .pdf-generating { padding: 20px !important; background: white !important; }
        .pdf-generating .overflow-x-auto { overflow: visible !important; }
        .pdf-generating * { animation: none !important; opacity: 1 !important; transform: none !important; }

        @media print {
          body, html {
            background-color: #fff !important;
            color: #111827 !important;
          }
          .no-print {
            display: none !important;
          }
          .print-only-header {
              display: block;
              padding-bottom: 1rem;
              border-bottom: 1px solid #e5e7eb;
              margin-bottom: 1.5rem;
          }
          .animate-journey-element {
            animation: none !important;
            opacity: 1 !important;
            transform: none !important;
          }
          body * {
            visibility: hidden;
            background-color: transparent !important;
            color: #111827 !important;
            box-shadow: none !important;
            border-color: #d1d5db !important;
          }
          #journey-print-area, #journey-print-area * {
            visibility: visible;
          }
          #journey-print-area {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            padding: 20px;
          }
           #journey-print-area svg {
              color: #111827 !important;
          }
        }
      `}</style>
       <ConfirmationModal
        isOpen={isConfirmModalOpen}
        onClose={() => setIsConfirmModalOpen(false)}
        onConfirm={handleConfirmDownload}
        title={`Confirm Download`}
      >
        {`Are you sure you want to download the campaign journey as a ${downloadType?.toUpperCase()} file?`}
      </ConfirmationModal>

      <div className="border-b border-slate-200 pb-6 mb-6 no-print">
        <div className="flex justify-between items-start">
            <div>
              <h2 className="text-2xl font-bold text-slate-900">{campaign.name}</h2>
              <p className="text-slate-500 mt-1 max-w-2xl">{campaign.description}</p>
            </div>
            <div className="flex flex-col items-end flex-shrink-0 ml-4">
                 <div className="flex items-center gap-2">
                     <button onClick={handleDownloadJson} className="p-2 bg-white border border-slate-200 text-slate-600 rounded-md hover:bg-slate-50 hover:text-slate-900 transition-colors shadow-sm" aria-label="Download as JSON" title="Download as JSON"><DocumentArrowDownIcon className="w-5 h-5"/></button>
                     <button onClick={handleDownloadPdf} className="p-2 bg-white border border-slate-200 text-slate-600 rounded-md hover:bg-slate-50 hover:text-slate-900 transition-colors shadow-sm" aria-label="Download as PDF" title="Download as PDF"><PencilSquareIcon className="w-5 h-5"/></button>
                    <button
                        onClick={onSaveCampaign}
                        disabled={saveButtonStatus.disabled || isSaving}
                        title={saveButtonStatus.title}
                        className="px-4 py-2 bg-orange-600 text-white font-semibold rounded-md hover:bg-orange-700 disabled:bg-slate-300 disabled:cursor-not-allowed transition-all text-sm flex items-center justify-center min-w-[90px] shadow-md hover:shadow-lg"
                    >
                        {isSaving ? (
                             <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                        ) : (campaign.id ? 'Update' : 'Save')}
                    </button>
                 </div>
                 <p className="text-xs text-slate-400 mt-2 h-4">{getSaveStatusText()}</p>
            </div>
        </div>
        <div className="mt-4">
            <div className="flex flex-wrap gap-2">
                {campaign.kpis.map((kpi, index) => (
                    <span key={index} className="bg-orange-50 text-orange-700 border border-orange-100 text-xs font-medium px-2.5 py-1 rounded-full">{kpi}</span>
                ))}
            </div>
        </div>
      </div>
      
      <div id="journey-print-area">
        <div className="print-only-header">
            <h2 className="text-2xl font-bold">{campaign.name}</h2>
            <p className="mt-1">{campaign.description}</p>
        </div>

        {/* Tabs for non-print view */}
        <div className="mb-6 no-print">
            <div className="border-b border-slate-200">
                <nav className="-mb-px flex space-x-2 overflow-x-auto pb-2" aria-label="Tabs">
                    {tabs.filter(tab => tab.visible).map(tab => <TabButton key={tab.id} id={tab.id} label={tab.label} />)}
                </nav>
            </div>
        </div>

        {/* Tab Content */}
        <div className="mt-6">
            {activeTab === 'overview' && (
                <div className="animate-fade-in">
                    {campaign.strategy && <PrescriptiveStrategy strategy={campaign.strategy} />}
                    <AudienceSegment campaign={campaign} />
                    {campaign && <AnalyticsDashboard kpis={campaign.kpis} />}
                </div>
            )}
            {activeTab === 'journey' && (
                 <div>
                    <h3 className="font-semibold text-lg text-slate-900 mb-4">Customer Journey Flow</h3>
                    <div className="bg-slate-50 p-8 rounded-xl border border-slate-200 overflow-x-auto">
                        {firstNodeId ? renderTree(campaign.nodes, firstNodeId, new Set(), isAnimating, 0) : <p className="text-slate-500">No valid starting node found in the journey.</p>}
                    </div>
                 </div>
            )}
             {activeTab === 'governance' && campaign.governancePlan && <GovernanceDashboard plan={campaign.governancePlan} />}
             {activeTab === 'channels' && campaign.channelSelection && <ChannelSelectionDashboard selection={campaign.channelSelection} />}
             {activeTab === 'mediaPlan' && campaign && (
                <MediaPlanView 
                    user={user} 
                    campaign={campaign} 
                    onSetGlobalSuccess={onSetGlobalSuccess} 
                    onUpdateCampaign={onCampaignUpdate}
                />
             )}
             {activeTab === 'assets' && (
                <div className="space-y-8">
                     <AssetGenerationController
                        progress={assetGenerationProgress}
                        onGenerateForChannel={onGenerateForChannel}
                        onGenerateForAll={onGenerateForAll}
                        onReset={onResetAssets}
                        recommendedChannels={recommendedChannels}
                    />
                    
                    <VideoGenerationController 
                        recommendedChannels={recommendedChannels}
                        videoAssets={videoAssets}
                        onGenerateVideo={onGenerateVideoForChannel}
                        isApiKeySelected={isApiKeySelected}
                    />

                    {generatedAssetChannels.length > 0 && (
                        <div>
                            <h3 className="font-semibold text-lg text-slate-900 mb-4">Generated Content</h3>
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

                    {generatedVideoAssets.length > 0 && (
                        <div>
                            <h3 className="font-semibold text-lg text-slate-900 mb-4">Generated Video</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {/* FIX: Explicitly type `videoState` to resolve the 'unknown' type error when accessing `.url`. */}
                                {generatedVideoAssets.map(([channelName, videoState]: [string, VideoAssetState]) => (
                                <VideoAssetCard key={channelName} channelName={channelName} videoUrl={videoState.url!} />
                                ))}
                            </div>
                        </div>
                    )}
                </div>
             )}
             {activeTab === 'launchpad' && hasGeneratedAssets && user.role !== 'User' && (
                <CampaignExecutionManager
                    campaign={campaign}
                    connections={channelConnections}
                    recommendedChannels={recommendedChannels}
                />
             )}
        </div>
      </div>
    </div>
  );
};
