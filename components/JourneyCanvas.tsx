
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
import { MediaPlanDisplay } from './media_plan/MediaPlanDisplay';

interface JourneyCanvasProps {
  user: User;
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
        <div className="absolute left-[-1rem] top-1/2 -translate-y-1/2 w-max z-10">
            <div className="relative px-3 py-1 bg-white rounded-full border border-slate-200 shadow-sm text-[10px] font-bold uppercase tracking-wide text-slate-500">
                {label}
                <div className="absolute -left-1 top-1/2 -translate-y-1/2 w-1.5 h-px bg-slate-300"></div>
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
                 <div className="pl-10 relative ml-5 before:absolute before:left-0 before:top-8 before:h-[calc(100%-2rem)] before:border-l-2 before:border-dashed before:border-slate-300">
                    {parentNode.children.map((branch: Branch, index: number) => (
                        <div key={`${parentNode.id}-${branch.nodeId}-${index}`} className="relative pt-8">
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
    <div className="bg-white rounded-2xl p-8 mb-8 border border-slate-200 shadow-sm">
        <div className="flex items-start space-x-6">
            <div className="mt-1 flex-shrink-0 w-12 h-12 rounded-2xl bg-orange-50 flex items-center justify-center border border-orange-100">
                <SparklesIcon className="w-7 h-7 text-orange-600" />
            </div>
            <div className="flex-grow">
                <h3 className="font-bold text-xl text-slate-900">AI-Prescribed Strategy</h3>
                <p className="text-base text-slate-600 mt-3 leading-relaxed max-w-4xl">{strategy.recommendations}</p>
                
                <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="bg-slate-50/50 rounded-xl p-6 border border-slate-100">
                        <h4 className="font-bold text-sm text-slate-800 mb-4 uppercase tracking-wider">Budget Allocation</h4>
                        <ul className="space-y-3 text-sm">
                            {strategy.budgetAllocation.map((item, index) => (
                                <li key={index} className="flex justify-between items-center p-4 bg-white border border-slate-200 rounded-lg shadow-sm">
                                    <div className="flex flex-col">
                                        <span className="font-bold text-slate-800">{item.channel}</span>
                                        <span className="text-slate-500 text-xs mt-0.5 italic">{item.rationale}</span>
                                    </div>
                                    <span className="font-bold text-orange-600 text-xl">{item.percentage}%</span>
                                </li>
                            ))}
                        </ul>
                    </div>
                    <div className="bg-slate-50/50 rounded-xl p-6 border border-slate-100">
                        <h4 className="font-bold text-sm text-slate-800 mb-4 uppercase tracking-wider">Timing & Duration</h4>
                        <div className="p-5 bg-white border border-slate-200 rounded-lg shadow-sm text-sm space-y-4">
                           <div className="flex justify-between border-b border-slate-100 pb-3">
                             <span className="text-slate-500 font-medium">Target Launch</span>
                             <span className="font-bold text-slate-800">{strategy.timing.launchDate}</span>
                           </div>
                           <div className="flex justify-between border-b border-slate-100 pb-3">
                              <span className="text-slate-500 font-medium">Duration</span>
                              <span className="font-bold text-slate-800">{strategy.timing.duration}</span>
                           </div>
                            <p className="text-slate-500 text-xs pt-1 italic leading-relaxed">{strategy.timing.rationale}</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
);


const AudienceSegment: React.FC<{ campaign: Campaign }> = ({ campaign }) => (
    <div className="bg-white rounded-2xl p-8 mb-8 border border-slate-200 shadow-sm">
        <div className="flex items-start space-x-6">
            <div className="mt-1 flex-shrink-0 w-12 h-12 rounded-2xl bg-emerald-50 flex items-center justify-center border border-emerald-100">
                <UserGroupIcon className="w-7 h-7 text-emerald-600" />
            </div>
            <div className="flex-grow">
                <h3 className="font-bold text-xl text-slate-900">Target Audience Segment</h3>
                <p className="text-base text-slate-500 italic mt-2 font-serif">"{campaign.audienceQuery}"</p>
                <div className="mt-6 flex flex-wrap items-center gap-x-8 gap-y-4">
                    <div className="flex flex-col">
                        <span className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Estimated Size</span>
                        <span className="text-3xl font-bold text-emerald-600 tracking-tight">{campaign.estimatedSize.toLocaleString()}</span>
                    </div>
                    <div className="h-10 w-px bg-slate-200 hidden sm:block"></div>
                    <div className="flex flex-wrap gap-2 items-center">
                        {campaign.keyAttributes.map((attr, index) => (
                            <span key={index} className="bg-white text-slate-700 border border-slate-200 text-sm font-medium px-3 py-1.5 rounded-full shadow-sm">{attr}</span>
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
  const [isPdfGenerating, setIsPdfGenerating] = useState(false);

  useEffect(() => {
    if (campaign) {
      setActiveTab('overview');
      setIsAnimating(true);
      const animationDuration = (campaign.nodes.length * 150) + 500;
      const timer = setTimeout(() => setIsAnimating(false), animationDuration);
      return () => clearTimeout(timer);
    }
  }, [campaign?.id]); 

  if (isLoading) {
    return (
      <div className="w-full h-full flex flex-col items-center justify-center bg-white rounded-3xl p-12 border border-slate-200 shadow-xl min-h-[500px]">
        <TaskProgressBar 
            estimatedDuration={20} 
            label="Generating Campaign Strategy..." 
            subLabel="Building smart segments and crafting multi-step journey"
            progressColor="bg-orange-600"
        />
      </div>
    );
  }

  if (error && !campaign) { 
    return (
      <div className="w-full h-full flex items-center justify-center bg-white rounded-3xl p-12 border border-slate-200 shadow-xl min-h-[500px]">
        <div className="text-center max-w-md">
          <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-red-500" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
          </div>
          <h3 className="text-xl font-bold text-slate-900">Generation Failed</h3>
          <p className="text-slate-500 mt-3 leading-relaxed">{error}</p>
        </div>
      </div>
    );
  }

  if (!campaign) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-white/50 rounded-3xl p-12 border-2 border-dashed border-slate-200 min-h-[500px]">
        <div className="text-center">
          <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <DocumentDuplicateIcon className="h-10 w-10 text-slate-300" />
          </div>
          <h3 className="text-xl font-bold text-slate-900">Ready to build</h3>
          <p className="text-slate-500 mt-2">Enter your campaign details above to start the AI engine.</p>
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
    setIsConfirmModalOpen(false);

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
        setDownloadType(null);
    } else if (downloadType === 'pdf') {
        // Activate PDF Generation Mode (Visible Overlay)
        setIsPdfGenerating(true);
        
        // Wait for render to complete before capturing
        setTimeout(() => {
            const element = document.getElementById('pdf-export-container');
            // @ts-ignore
            if (element && window.html2pdf) {
                const opt = {
                    margin: [10, 10, 10, 10], // Top, Left, Bottom, Right
                    filename: `${campaign.name.replace(/\s+/g, '_').toLowerCase()}_strategy.pdf`,
                    image: { type: 'jpeg', quality: 0.98 },
                    html2canvas: { 
                        scale: 2, 
                        useCORS: true, 
                        logging: false,
                        scrollY: 0, // Crucial for absolute/fixed elements
                        windowWidth: 1200
                    },
                    jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' },
                    pagebreak: { mode: ['avoid-all', 'css', 'legacy'] }
                };
                
                // @ts-ignore
                window.html2pdf().set(opt).from(element).save().then(() => {
                    setIsPdfGenerating(false);
                    setDownloadType(null);
                }).catch((err: any) => {
                    console.error("PDF Generation Failed:", err);
                    setIsPdfGenerating(false);
                    setDownloadType(null);
                });
            } else {
                console.error("PDF container or library not found");
                setIsPdfGenerating(false);
                setDownloadType(null);
            }
        }, 1500); // Extended delay to ensure all charts/maps render properly
    }
  };

  const firstNodeId = campaign.nodes.find(n => n.id === 1) ? 1 : (campaign.nodes[0]?.id || null);
  const generatedAssetChannels = Object.keys(campaign.channelAssets || {});
  const generatedVideoAssets = Object.entries(videoAssets).filter(([, state]: [string, VideoAssetState]) => state.status === 'done' && !!state.url);
  const hasGeneratedAssets = generatedAssetChannels.length > 0 || generatedVideoAssets.length > 0;
  
  const getSaveButtonStatus = () => {
    return { disabled: false, title: "Save campaign progress" };
  }
  const saveButtonStatus = getSaveButtonStatus();

  const getSaveStatusText = () => {
    if (isSaving) {
        return <span className="text-orange-500 animate-pulse font-medium">Saving...</span>;
    }
    if (campaign.isTrialCampaign && !campaign.id) {
        return <span className="text-yellow-700 bg-yellow-50 px-2 py-0.5 rounded text-xs font-bold border border-yellow-100">Trial Mode</span>;
    }
    if (campaign.updatedAt) {
        return `Saved ${new Date(campaign.updatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
    }
    return 'Unsaved';
  };

  const tabs: { id: CanvasTab; label: string; visible: boolean }[] = [
    { id: 'overview', label: 'Overview', visible: true },
    { id: 'journey', label: 'Journey', visible: true },
    { id: 'governance', label: 'Governance', visible: true },
    { id: 'channels', label: 'Channels', visible: true },
    { id: 'mediaPlan', label: 'Media Plan', visible: !!campaign },
    { id: 'assets', label: 'Assets', visible: true },
    { id: 'launchpad', label: 'Launchpad', visible: hasGeneratedAssets && user.role !== 'User' },
  ];

  const TabButton: React.FC<{id: CanvasTab, label: string}> = ({id, label}) => (
    <button
      onClick={() => setActiveTab(id)}
      className={`relative px-5 py-2 text-sm font-bold rounded-full transition-all duration-300 z-10 ${
          activeTab === id 
          ? 'bg-white text-slate-900 shadow-sm ring-1 ring-slate-200' 
          : 'text-slate-500 hover:text-slate-700 hover:bg-slate-200/50'
      }`}
    >
      {label}
    </button>
  );

  return (
    <div className="bg-white rounded-3xl border border-slate-200 shadow-xl shadow-slate-200/50 overflow-hidden relative">
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
        .pdf-generating .no-print { display: none !important; }
        .pdf-generating .print-only-header { display: block !important; margin-bottom: 1.5rem; padding-bottom: 1rem; border-bottom: 1px solid #e5e7eb; }
        .pdf-generating { padding: 40px !important; background: white !important; }
        .pdf-generating .overflow-x-auto { overflow: visible !important; }
        .pdf-generating * { animation: none !important; opacity: 1 !important; transform: none !important; }
        .html2pdf__page-break { page-break-before: always; }
        
        /* PDF Generation Visibility Styles */
        .pdf-container-hidden {
            position: absolute;
            left: -9999px;
            top: 0;
            width: 1000px;
            visibility: hidden;
            height: 0;
            overflow: hidden;
        }
        .pdf-container-visible {
            position: fixed;
            left: 0;
            top: 0;
            width: 100%;
            height: 100vh;
            overflow-y: auto;
            background: white;
            z-index: 9999;
            padding: 0;
        }
        .pdf-content-wrapper {
            width: 1000px;
            margin: 0 auto;
            background: white;
            padding: 40px;
            border: 1px solid #e2e8f0;
        }
        @media print {
          body, html { background-color: #fff !important; color: #111827 !important; }
          .no-print { display: none !important; }
          .print-only-header { display: block; padding-bottom: 1rem; border-bottom: 1px solid #e5e7eb; margin-bottom: 1.5rem; }
          body * { visibility: hidden; }
          #journey-print-area, #journey-print-area * { visibility: visible; }
          #journey-print-area { position: absolute; left: 0; top: 0; width: 100%; padding: 20px; }
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

      {/* Loading Overlay for PDF Generation */}
      {isPdfGenerating && (
          <div className="fixed inset-0 z-[10000] bg-slate-900/80 flex flex-col items-center justify-center text-white backdrop-blur-sm">
              <svg className="animate-spin h-12 w-12 mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              <h3 className="text-xl font-bold">Generating PDF Strategy Report...</h3>
              <p className="text-slate-300 mt-2">Assembling all campaign components. Please wait...</p>
          </div>
      )}

      <div className="bg-slate-50/50 border-b border-slate-200 p-8 no-print">
        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-6">
            <div>
              <div className="flex items-center gap-3 mb-2">
                  <h2 className="text-3xl font-bold text-slate-900 tracking-tight">{campaign.name}</h2>
                  <div className="px-3 py-1 rounded-full bg-slate-200 text-slate-600 text-xs font-bold uppercase tracking-wide">
                      {campaign.isTrialCampaign ? 'Trial' : 'Active'}
                  </div>
              </div>
              <p className="text-lg text-slate-500 leading-relaxed max-w-3xl">{campaign.description}</p>
              <div className="mt-4 flex flex-wrap gap-2">
                {campaign.kpis.map((kpi, index) => (
                    <span key={index} className="bg-white border border-slate-200 text-slate-600 text-xs font-bold px-3 py-1.5 rounded-lg shadow-sm">{kpi}</span>
                ))}
            </div>
            </div>
            
            <div className="flex flex-col items-end gap-4 flex-shrink-0">
                 <div className="flex items-center gap-2 bg-white p-1.5 rounded-xl border border-slate-200 shadow-sm">
                     <button onClick={handleDownloadJson} className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-50 rounded-lg transition-colors" title="Download JSON"><DocumentArrowDownIcon className="w-5 h-5"/></button>
                     <div className="w-px h-6 bg-slate-100"></div>
                     <button onClick={handleDownloadPdf} className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-50 rounded-lg transition-colors" title="Download PDF"><PencilSquareIcon className="w-5 h-5"/></button>
                     <div className="w-px h-6 bg-slate-100"></div>
                    <button
                        onClick={onSaveCampaign}
                        disabled={saveButtonStatus.disabled || isSaving}
                        title={saveButtonStatus.title}
                        className="px-5 py-2 bg-slate-900 text-white font-bold rounded-lg hover:bg-slate-800 disabled:bg-slate-200 disabled:text-slate-400 transition-all text-sm flex items-center justify-center min-w-[100px] shadow-md hover:shadow-lg hover:-translate-y-0.5"
                    >
                        {isSaving ? (
                             <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                        ) : (campaign.id ? 'Update' : 'Save')}
                    </button>
                 </div>
                 <p className="text-xs text-slate-400 font-medium">{getSaveStatusText()}</p>
            </div>
        </div>
      </div>
      
      <div id="journey-print-area" className="p-8">
        <div className="print-only-header">
            <h2 className="text-2xl font-bold">{campaign.name}</h2>
            <p className="mt-1">{campaign.description}</p>
        </div>

        {/* Modern Tabs */}
        <div className="mb-10 no-print flex justify-center">
            <div className="bg-slate-100 p-1.5 rounded-full inline-flex space-x-1">
                {tabs.filter(tab => tab.visible).map(tab => <TabButton key={tab.id} id={tab.id} label={tab.label} />)}
            </div>
        </div>

        {/* Tab Content */}
        <div className="min-h-[400px]">
            {activeTab === 'overview' && (
                <div className="animate-fade-in space-y-8">
                    {campaign.strategy && <PrescriptiveStrategy strategy={campaign.strategy} />}
                    <AudienceSegment campaign={campaign} />
                    {campaign && <AnalyticsDashboard kpis={campaign.kpis} />}
                </div>
            )}
            {activeTab === 'journey' && (
                 <div>
                    <h3 className="font-bold text-xl text-slate-900 mb-6 px-4">Customer Journey Map</h3>
                    <div className="bg-slate-50/50 p-10 rounded-3xl border border-slate-200 overflow-x-auto min-h-[500px]">
                        {firstNodeId ? renderTree(campaign.nodes, firstNodeId, new Set(), isAnimating, 0) : <p className="text-slate-500 text-center mt-20">No valid starting node found.</p>}
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
                <div className="space-y-12">
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
                            <div className="flex items-center gap-3 mb-6">
                                <div className="h-8 w-1 bg-orange-500 rounded-full"></div>
                                <h3 className="font-bold text-xl text-slate-900">Generated Content Assets</h3>
                            </div>
                            <div className="space-y-8">
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
                            <div className="flex items-center gap-3 mb-6">
                                <div className="h-8 w-1 bg-orange-500 rounded-full"></div>
                                <h3 className="font-bold text-xl text-slate-900">Generated Video Assets</h3>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
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

        {/* Container for Full PDF Generation - Toggled Visibility via CSS classes managed by state */}
        <div id="pdf-export-container" className={isPdfGenerating ? "pdf-container-visible" : "pdf-container-hidden"}>
            <div className="pdf-content-wrapper">
                {/* Header */}
                <div className="mb-10 border-b border-slate-200 pb-6">
                    <div className="flex items-center justify-between mb-4">
                        <h1 className="text-4xl font-bold text-slate-900">{campaign.name}</h1>
                        <span className="px-4 py-1 bg-slate-100 rounded-full text-slate-600 font-bold text-sm uppercase">Strategy Report</span>
                    </div>
                    <p className="text-xl text-slate-500 leading-relaxed">{campaign.description}</p>
                    <div className="mt-6 flex flex-wrap gap-2">
                        {campaign.kpis.map((kpi, i) => <span key={i} className="px-3 py-1 bg-orange-50 border border-orange-100 text-orange-700 rounded-full text-xs font-bold uppercase">{kpi}</span>)}
                    </div>
                </div>

                {/* 1. Overview */}
                <section className="mb-12 break-inside-avoid">
                    <h2 className="text-2xl font-bold text-slate-900 mb-6 pb-2 border-b border-slate-200 flex items-center">
                        <span className="w-8 h-8 rounded-lg bg-slate-900 text-white flex items-center justify-center text-sm mr-3">01</span>
                        Strategy & Overview
                    </h2>
                    {campaign.strategy && <PrescriptiveStrategy strategy={campaign.strategy} />}
                    <div className="mt-8">
                        <AudienceSegment campaign={campaign} />
                    </div>
                    {campaign && (
                        <div className="mt-8">
                            <AnalyticsDashboard kpis={campaign.kpis} />
                        </div>
                    )}
                </section>

                <div className="html2pdf__page-break"></div>

                {/* 2. Journey */}
                <section className="mb-12">
                    <h2 className="text-2xl font-bold text-slate-900 mb-6 pb-2 border-b border-slate-200 flex items-center">
                        <span className="w-8 h-8 rounded-lg bg-slate-900 text-white flex items-center justify-center text-sm mr-3">02</span>
                        Customer Journey Map
                    </h2>
                    <div className="bg-slate-50 border border-slate-200 p-8 rounded-xl">
                         {firstNodeId && renderTree(campaign.nodes, firstNodeId, new Set(), false, 0)}
                    </div>
                </section>

                <div className="html2pdf__page-break"></div>

                {/* 3. Governance */}
                <section className="mb-12 break-inside-avoid">
                    <h2 className="text-2xl font-bold text-slate-900 mb-6 pb-2 border-b border-slate-200 flex items-center">
                        <span className="w-8 h-8 rounded-lg bg-slate-900 text-white flex items-center justify-center text-sm mr-3">03</span>
                        Governance & Compliance
                    </h2>
                    {campaign.governancePlan && <GovernanceDashboard plan={campaign.governancePlan} />}
                </section>

                {/* 4. Channels */}
                <section className="mb-12 break-inside-avoid">
                    <h2 className="text-2xl font-bold text-slate-900 mb-6 pb-2 border-b border-slate-200 flex items-center">
                        <span className="w-8 h-8 rounded-lg bg-slate-900 text-white flex items-center justify-center text-sm mr-3">04</span>
                        Channel Strategy
                    </h2>
                    {campaign.channelSelection && <ChannelSelectionDashboard selection={campaign.channelSelection} />}
                </section>

                <div className="html2pdf__page-break"></div>

                {/* 5. Media Plan */}
                {campaign.mediaPlan && (
                    <section className="mb-12">
                        <h2 className="text-2xl font-bold text-slate-900 mb-6 pb-2 border-b border-slate-200 flex items-center">
                            <span className="w-8 h-8 rounded-lg bg-slate-900 text-white flex items-center justify-center text-sm mr-3">05</span>
                            Media Plan
                        </h2>
                        <MediaPlanDisplay 
                            plan={campaign.mediaPlan} 
                            onRegenerate={() => {}} 
                            isRegenerating={false} 
                            readOnly={true} 
                        />
                    </section>
                )}

                <div className="html2pdf__page-break"></div>

                {/* 6. Assets */}
                {(generatedAssetChannels.length > 0 || generatedVideoAssets.length > 0) && (
                    <section className="mb-12">
                        <h2 className="text-2xl font-bold text-slate-900 mb-6 pb-2 border-b border-slate-200 flex items-center">
                            <span className="w-8 h-8 rounded-lg bg-slate-900 text-white flex items-center justify-center text-sm mr-3">06</span>
                            Generated Creative Assets
                        </h2>
                        <div className="space-y-8">
                            {generatedAssetChannels.map(channelName => (
                                <ChannelAssetCard
                                    key={channelName}
                                    result={campaign.channelAssets![channelName]}
                                />
                            ))}
                             {generatedVideoAssets.length > 0 && (
                                <div className="grid grid-cols-1 gap-8 mt-8">
                                    {generatedVideoAssets.map(([channelName, videoState]: [string, VideoAssetState]) => (
                                        <VideoAssetCard key={channelName} channelName={channelName} videoUrl={videoState.url!} />
                                    ))}
                                </div>
                            )}
                        </div>
                    </section>
                )}
            </div>
        </div>
      </div>
    </div>
  );
};
