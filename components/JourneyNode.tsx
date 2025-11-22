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
    color: 'bg-green-100 text-green-600',
    title: 'Trigger',
  },
  [NodeType.ACTION]: {
    icon: ActionIcon,
    color: 'bg-blue-100 text-blue-600',
    title: 'Action',
  },
  [NodeType.DECISION]: {
    icon: DecisionIcon,
    color: 'bg-amber-100 text-amber-600',
    title: 'Decision',
  },
  [NodeType.WAIT]: {
    icon: WaitIcon,
    color: 'bg-purple-100 text-purple-600',
    title: 'Wait',
  },
  [NodeType.SPLIT]: {
    icon: SplitIcon,
    color: 'bg-orange-100 text-orange-600',
    title: 'A/B Test',
  },
  [NodeType.END]: {
    icon: () => <div className="w-3 h-3 bg-red-500 rounded-full"></div>,
    color: 'bg-red-100 text-red-600',
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
  Push: 'bg-purple-50 text-purple-600 border border-purple-200',
  WhatsApp: 'bg-teal-50 text-teal-600 border border-teal-200',
  'In-App': 'bg-orange-50 text-orange-600 border border-orange-200',
};

const ChannelBadge: React.FC<{ details: NodeDetails }> = ({ details }) => {
    if (!details?.channel) return null;
    const ChannelIcon = channelIcons[details.channel];
    const colorClasses = channelColors[details.channel] || 'bg-slate-100 text-slate-600 border border-slate-200';
    return (
        <span className={`flex items-center ${colorClasses} text-xs font-medium px-2 py-1 rounded-full shadow-sm`}>
            {ChannelIcon && <ChannelIcon className="w-3 h-3 mr-1.5" />}
            {details.channel}
        </span>
    );
}

const PredictiveModelBadge: React.FC<{ details: NodeDetails }> = ({ details }) => {
    if (!details?.predictionModel) return null;
    return (
         <span title={`Powered by: ${details.predictionModel}`} className="flex items-center bg-amber-50 text-amber-700 border border-amber-200 text-xs font-medium px-2 py-1 rounded-full shadow-sm">
            <BrainIcon className="w-4 h-4 mr-1.5" />
            Predictive
        </span>
    );
};

const ABTestDetails: React.FC<{ details: NodeDetails }> = ({ details }) => {
    if (!details?.abTest) return null;
    const { hypothesis, primaryMetric, trafficSplit, estimatedDuration } = details.abTest;

    return (
         <div className="mt-3">
            <div className="flex items-center space-x-2 mb-2">
                <TestTubeIcon className="w-5 h-5 text-orange-500 flex-shrink-0" />
                <h4 className="font-semibold text-sm text-orange-700">A/B Test Details</h4>
            </div>
            <div className="space-y-2 text-sm ml-7">
                <p className="text-slate-600"><strong className="font-semibold text-slate-800">Hypothesis:</strong> "{hypothesis}"</p>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs p-2 bg-slate-50 rounded-md border border-slate-100">
                    <div>
                        <p className="font-medium text-slate-500">Primary Metric</p>
                        <p className="font-semibold text-slate-700">{primaryMetric}</p>
                    </div>
                    <div>
                        <p className="font-medium text-slate-500">Traffic Split</p>
                        <p className="font-semibold text-slate-700">{trafficSplit}</p>
                    </div>
                     <div>
                        <p className="font-medium text-slate-500">Est. Duration</p>
                        <p className="font-semibold text-slate-700">{estimatedDuration}</p>
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
        <div className="mt-3">
            <div className="flex items-center space-x-2 mb-2">
                <SparklesIcon className="w-5 h-5 text-orange-500 flex-shrink-0" />
                <h4 className="font-semibold text-sm text-orange-700">AI Optimization Insights</h4>
            </div>
            <dl className="space-y-1 text-xs text-slate-500 pl-7">
                {rationale && (
                    <div><dt className="font-medium text-slate-700">Rationale:</dt><dd>{rationale}</dd></div>
                )}
                {sendTime && (
                    <div><dt className="font-medium text-slate-700">Send Time:</dt><dd>{sendTime}</dd></div>
                )}
                {frequency && (
                     <div><dt className="font-medium text-slate-700">Frequency:</dt><dd>{frequency}</dd></div>
                )}
            </dl>
        </div>
    );
};

const PersonalizedContent: React.FC<{ details: NodeDetails }> = ({ details }) => {
    if (!details?.personalization) return null;
    const { headline, body, offer, variables } = details.personalization;

    return (
         <div className="mt-3">
            <div className="flex items-center space-x-2 mb-2">
                <PersonalizationIcon className="w-5 h-5 text-teal-500 flex-shrink-0" />
                <h4 className="font-semibold text-sm text-teal-700">Personalized Content</h4>
            </div>
            <div className="space-y-2 text-sm text-slate-600 p-3 bg-slate-50 rounded-md border border-slate-100 ml-7">
                <p><strong className="font-semibold text-slate-800">Headline:</strong> "{headline}"</p>
                <p><strong className="font-semibold text-slate-800">Body:</strong> "{body}"</p>
                {offer && <p><strong className="font-semibold text-slate-800">Offer:</strong> "{offer}"</p>}
                {variables.length > 0 && (
                    <div className="pt-2 flex flex-wrap gap-2 items-center">
                        <span className="text-xs text-slate-400">Variables:</span>
                        {variables.map((v, i) => (
                            <code key={i} className="text-xs bg-white text-teal-600 border border-teal-200 px-1.5 py-0.5 rounded">{v}</code>
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
    <div className="flex items-start space-x-4">
      {/* Icon */}
      <div className={`mt-1 flex-shrink-0 w-10 h-10 rounded-full ${config.color} flex items-center justify-center shadow-sm border border-white/50 ring-4 ring-white`}>
        <IconComponent className="w-5 h-5" />
      </div>
      {/* Content */}
      <div className="flex-grow bg-white border border-slate-200 rounded-xl p-5 shadow-sm hover:shadow-md transition-shadow">
        <div className="flex justify-between items-start">
            <div>
                <p className="font-bold text-lg text-slate-900 pr-16">{node.title}</p>
                <p className="text-slate-500 mt-1">{node.description}</p>
            </div>
            <div className="flex items-center gap-2 flex-shrink-0">
                {node.type === NodeType.ACTION && <ChannelBadge details={node.details || {}} />}
                {node.type === NodeType.DECISION && <PredictiveModelBadge details={node.details || {}} />}
            </div>
        </div>
        
        {node.details?.condition && (
            <div className="mt-3 p-2 bg-amber-50 border border-amber-100 rounded-md inline-block">
                <p className="text-sm text-amber-800"><span className="font-semibold">Condition:</span> {node.details.condition}</p>
            </div>
        )}

        {node.details?.duration && (
             <div className="mt-2">
                <p className="text-sm text-purple-700 bg-purple-50 px-2 py-1 rounded-md inline-block border border-purple-100"><span className="font-semibold">Duration:</span> {node.details.duration}</p>
            </div>
        )}
        
        {showToggleButton && (
            <div className="mt-4 pt-3 border-t border-slate-100">
                <button 
                    onClick={() => setIsExpanded(!isExpanded)}
                    className="flex items-center text-sm font-medium text-slate-500 hover:text-slate-800 transition-colors"
                >
                    {isExpanded ? 'Hide' : 'Show'} Details
                    <ChevronDownIcon className={`w-5 h-5 ml-1 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
                </button>
            </div>
        )}
        
        {isExpanded && (
            <div className="mt-4 space-y-4 animate-fade-in">
                {node.type === NodeType.SPLIT && <ABTestDetails details={node.details || {}} />}
                <PersonalizedContent details={node.details || {}} />
                <OptimizationInsights details={node.details || {}} />
            </div>
        )}

      </div>
    </div>
  );
};