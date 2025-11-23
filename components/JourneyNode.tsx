import React, { useState } from 'react';
import { JourneyNode as JourneyNodeType, NodeType, NodeDetails } from '../types';
import { TriggerIcon } from './icons/TriggerIcon';
import { ActionIcon } from './icons/ActionIcon';
import { DecisionIcon } from './icons/DecisionIcon';
import { WaitIcon } from './icons/WaitIcon';
import { SplitIcon } from './icons/SplitIcon';
import { EmailIcon } from './icons/EmailIcon';
import { SmsIcon } from './icons/SmsIcon';
import { PushIcon } from './icons/PushIcon';
import { WhatsAppIcon } from './icons/WhatsAppIcon';
import { InAppIcon } from './icons/InAppIcon';
import { SparklesIcon } from './icons/SparklesIcon';
import { PersonalizationIcon } from './icons/PersonalizationIcon';
import { BrainIcon } from './icons/BrainIcon';
import { TestTubeIcon } from './icons/TestTubeIcon';
import { ChevronDownIcon } from './icons/ChevronDownIcon';


interface JourneyNodeProps {
  node: JourneyNodeType;
}

const nodeConfig = {
  [NodeType.TRIGGER]: {
    icon: TriggerIcon,
    color: 'bg-green-100 text-green-600 ring-green-200',
    title: 'Trigger',
  },
  [NodeType.ACTION]: {
    icon: ActionIcon,
    color: 'bg-blue-100 text-blue-600 ring-blue-200',
    title: 'Action',
  },
  [NodeType.DECISION]: {
    icon: DecisionIcon,
    color: 'bg-amber-100 text-amber-600 ring-amber-200',
    title: 'Decision',
  },
  [NodeType.WAIT]: {
    icon: WaitIcon,
    color: 'bg-slate-100 text-slate-600 ring-slate-200',
    title: 'Wait',
  },
  [NodeType.SPLIT]: {
    icon: SplitIcon,
    color: 'bg-orange-100 text-orange-600 ring-orange-200',
    title: 'A/B Test',
  },
  [NodeType.END]: {
    icon: () => <div className="w-3 h-3 bg-red-500 rounded-full shadow-sm"></div>,
    color: 'bg-red-100 text-red-600 ring-red-200',
    title: 'End',
  },
};

const channelIcons: { [key: string]: React.FC<React.SVGProps<SVGSVGElement>> } = {
  Email: EmailIcon,
  SMS: SmsIcon,
  Push: PushIcon,
  WhatsApp: WhatsAppIcon,
  'In-App': InAppIcon,
};

const channelColors: { [key: string]: string } = {
  Email: 'bg-blue-50 text-blue-600 border border-blue-200',
  SMS: 'bg-green-50 text-green-600 border border-green-200',
  Push: 'bg-orange-50 text-orange-600 border border-orange-200',
  WhatsApp: 'bg-teal-50 text-teal-600 border border-teal-200',
  'In-App': 'bg-slate-50 text-slate-600 border border-slate-200',
};

const ChannelBadge: React.FC<{ details: NodeDetails }> = ({ details }) => {
    if (!details?.channel) return null;
    const ChannelIcon = channelIcons[details.channel];
    const colorClasses = channelColors[details.channel] || 'bg-slate-100 text-slate-600 border border-slate-200';
    return (
        <span className={`flex items-center ${colorClasses} text-[10px] font-bold uppercase tracking-wide px-2 py-1 rounded-full shadow-sm`}>
            {ChannelIcon && <ChannelIcon className="w-3 h-3 mr-1.5" />}
            {details.channel}
        </span>
    );
}

const PredictiveModelBadge: React.FC<{ details: NodeDetails }> = ({ details }) => {
    if (!details?.predictionModel) return null;
    return (
         <span title={`Powered by: ${details.predictionModel}`} className="flex items-center bg-amber-50 text-amber-700 border border-amber-200 text-[10px] font-bold uppercase tracking-wide px-2 py-1 rounded-full shadow-sm">
            <BrainIcon className="w-3 h-3 mr-1.5" />
            Predictive
        </span>
    );
};

const ABTestDetails: React.FC<{ details: NodeDetails }> = ({ details }) => {
    if (!details?.abTest) return null;
    const { hypothesis, primaryMetric, trafficSplit, estimatedDuration } = details.abTest;

    return (
         <div className="mt-4 bg-orange-50/50 p-4 rounded-xl border border-orange-100">
            <div className="flex items-center space-x-2 mb-3">
                <div className="p-1 bg-orange-100 rounded text-orange-600"><TestTubeIcon className="w-4 h-4" /></div>
                <h4 className="font-bold text-xs text-orange-900 uppercase tracking-wide">A/B Test Configuration</h4>
            </div>
            <div className="space-y-3 text-sm">
                <p className="text-slate-700 italic">"{hypothesis}"</p>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div className="bg-white p-2 rounded border border-orange-100 shadow-sm">
                        <p className="text-[10px] text-slate-400 font-bold uppercase">Metric</p>
                        <p className="font-bold text-slate-800 text-xs mt-0.5">{primaryMetric}</p>
                    </div>
                    <div className="bg-white p-2 rounded border border-orange-100 shadow-sm">
                        <p className="text-[10px] text-slate-400 font-bold uppercase">Split</p>
                        <p className="font-bold text-slate-800 text-xs mt-0.5">{trafficSplit}</p>
                    </div>
                     <div className="bg-white p-2 rounded border border-orange-100 shadow-sm">
                        <p className="text-[10px] text-slate-400 font-bold uppercase">Est. Time</p>
                        <p className="font-bold text-slate-800 text-xs mt-0.5">{estimatedDuration}</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

const OptimizationInsights: React.FC<{ details: NodeDetails }> = ({ details }) => {
    if (!details?.optimization) return null;
    const { rationale, sendTime, frequency } = details.optimization;
    if (!rationale && !sendTime && !frequency) return null;

    return (
        <div className="mt-4">
            <div className="flex items-center space-x-2 mb-2">
                <SparklesIcon className="w-4 h-4 text-orange-500 flex-shrink-0" />
                <h4 className="font-bold text-xs text-slate-700 uppercase tracking-wide">AI Optimization</h4>
            </div>
            <div className="bg-slate-50 p-3 rounded-lg border border-slate-100 text-xs text-slate-600 space-y-2">
                {rationale && (
                    <div className="flex gap-2"><span className="font-semibold text-slate-900 min-w-[60px]">Why:</span><span>{rationale}</span></div>
                )}
                {sendTime && (
                    <div className="flex gap-2"><span className="font-semibold text-slate-900 min-w-[60px]">When:</span><span>{sendTime}</span></div>
                )}
                {frequency && (
                     <div className="flex gap-2"><span className="font-semibold text-slate-900 min-w-[60px]">Freq:</span><span>{frequency}</span></div>
                )}
            </div>
        </div>
    );
};

const PersonalizedContent: React.FC<{ details: NodeDetails }> = ({ details }) => {
    if (!details?.personalization) return null;
    const { headline, body, offer, variables } = details.personalization;

    return (
         <div className="mt-4">
            <div className="flex items-center space-x-2 mb-2">
                <PersonalizationIcon className="w-4 h-4 text-teal-500 flex-shrink-0" />
                <h4 className="font-bold text-xs text-slate-700 uppercase tracking-wide">Personalized Content</h4>
            </div>
            <div className="bg-white p-3 rounded-lg border border-slate-200 shadow-sm space-y-2">
                <p className="text-sm font-semibold text-slate-900">{headline}</p>
                <p className="text-xs text-slate-500 leading-relaxed">{body}</p>
                {offer && <p className="text-xs font-medium text-orange-600 bg-orange-50 inline-block px-2 py-1 rounded border border-orange-100">{offer}</p>}
                {variables.length > 0 && (
                    <div className="pt-2 flex flex-wrap gap-2 items-center border-t border-slate-100 mt-2">
                        <span className="text-[10px] text-slate-400 uppercase font-bold">Dynamic:</span>
                        {variables.map((v, i) => (
                            <code key={i} className="text-[10px] bg-slate-100 text-slate-600 border border-slate-200 px-1.5 py-0.5 rounded">{v}</code>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};


export const JourneyNode: React.FC<JourneyNodeProps> = ({ node }) => {
  const config = nodeConfig[node.type] || nodeConfig[NodeType.ACTION];
  const IconComponent = config.icon;
  const [isExpanded, setIsExpanded] = useState(false);

  const hasDetails = node.details && Object.keys(node.details).length > 0;
  const showToggleButton = hasDetails && (node.details.abTest || node.details.personalization || node.details.optimization);


  return (
    <div className="flex items-start space-x-5 group">
      {/* Icon */}
      <div className={`mt-1 flex-shrink-0 w-12 h-12 rounded-2xl ${config.color} ring-4 flex items-center justify-center shadow-sm bg-white z-10`}>
        <IconComponent className="w-6 h-6" />
      </div>
      {/* Content */}
      <div className="flex-grow bg-white border border-slate-200 rounded-2xl p-6 shadow-sm hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300 max-w-2xl">
        <div className="flex justify-between items-start">
            <div>
                <div className="flex items-center gap-3">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">{node.type}</span>
                    {node.details?.duration && (
                        <span className="text-[10px] font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full border border-slate-200 flex items-center">
                            <WaitIcon className="w-3 h-3 mr-1" /> {node.details.duration}
                        </span>
                    )}
                </div>
                <p className="font-bold text-lg text-slate-900 mt-1 pr-4">{node.title}</p>
                <p className="text-sm text-slate-500 mt-1 leading-relaxed">{node.description}</p>
            </div>
            <div className="flex items-center gap-2 flex-shrink-0">
                {node.type === NodeType.ACTION && <ChannelBadge details={node.details || {}} />}
                {node.type === NodeType.DECISION && <PredictiveModelBadge details={node.details || {}} />}
            </div>
        </div>
        
        {node.details?.condition && (
            <div className="mt-3 p-2.5 bg-amber-50 border border-amber-100 rounded-lg inline-block">
                <p className="text-sm text-amber-900 font-medium"><span className="font-bold uppercase text-xs mr-2 opacity-70">If:</span> {node.details.condition}</p>
            </div>
        )}
        
        {showToggleButton && (
            <div className="mt-5 pt-4 border-t border-slate-100">
                <button 
                    onClick={() => setIsExpanded(!isExpanded)}
                    className="flex items-center text-xs font-bold text-slate-500 hover:text-slate-800 transition-colors uppercase tracking-wide"
                >
                    {isExpanded ? 'Hide' : 'View'} Intelligence
                    <ChevronDownIcon className={`w-4 h-4 ml-1 transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`} />
                </button>
            </div>
        )}
        
        {isExpanded && (
            <div className="mt-2 animate-fade-in">
                {node.type === NodeType.SPLIT && <ABTestDetails details={node.details || {}} />}
                <PersonalizedContent details={node.details || {}} />
                <OptimizationInsights details={node.details || {}} />
            </div>
        )}

      </div>
    </div>
  );
};