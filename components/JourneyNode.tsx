import React from 'react';
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

interface JourneyNodeProps {
  node: JourneyNodeType;
}

const nodeConfig = {
  [NodeType.TRIGGER]: {
    icon: TriggerIcon,
    color: 'bg-green-500',
    title: 'Trigger',
  },
  [NodeType.ACTION]: {
    icon: ActionIcon,
    color: 'bg-blue-500',
    title: 'Action',
  },
  [NodeType.DECISION]: {
    icon: DecisionIcon,
    color: 'bg-yellow-500',
    title: 'Decision',
  },
  [NodeType.WAIT]: {
    icon: WaitIcon,
    color: 'bg-purple-500',
    title: 'Wait',
  },
  [NodeType.SPLIT]: {
    icon: SplitIcon,
    color: 'bg-orange-500',
    title: 'A/B Test',
  },
  [NodeType.END]: {
    icon: () => <div className="w-3 h-3 bg-red-500 rounded-full"></div>,
    color: 'bg-red-500',
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

const ChannelBadge: React.FC<{ details: NodeDetails }> = ({ details }) => {
    if (!details?.channel) return null;
    const ChannelIcon = channelIcons[details.channel];
    return (
        <span className="absolute top-2 right-2 flex items-center bg-gray-700 text-gray-300 text-xs font-medium px-2 py-1 rounded-full">
            {ChannelIcon && <ChannelIcon className="w-3 h-3 mr-1" />}
            {details.channel}
        </span>
    );
}

const PredictiveModelBadge: React.FC<{ details: NodeDetails }> = ({ details }) => {
    if (!details?.predictionModel) return null;
    return (
         <span title={`Powered by: ${details.predictionModel}`} className="absolute bottom-2 right-2 flex items-center bg-yellow-800/80 text-yellow-300 text-xs font-medium px-2 py-1 rounded-full">
            <BrainIcon className="w-3 h-3 mr-1" />
            Predictive
        </span>
    );
};

const ABTestDetails: React.FC<{ details: NodeDetails }> = ({ details }) => {
    if (!details?.abTest) return null;
    const { hypothesis, primaryMetric, trafficSplit, estimatedDuration } = details.abTest;

    return (
         <div className="mt-3 pt-3 border-t border-gray-700/50">
            <div className="flex items-center space-x-2 mb-2">
                <TestTubeIcon className="w-5 h-5 text-orange-400 flex-shrink-0" />
                <h4 className="font-semibold text-sm text-orange-300">A/B Test Details</h4>
            </div>
            <div className="space-y-2 text-sm">
                <p className="text-gray-300"><strong className="font-semibold text-gray-200">Hypothesis:</strong> "{hypothesis}"</p>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs p-2 bg-gray-800/70 rounded-md">
                    <div>
                        <p className="font-medium text-gray-400">Primary Metric</p>
                        <p className="font-semibold text-gray-200">{primaryMetric}</p>
                    </div>
                    <div>
                        <p className="font-medium text-gray-400">Traffic Split</p>
                        <p className="font-semibold text-gray-200">{trafficSplit}</p>
                    </div>
                     <div>
                        <p className="font-medium text-gray-400">Est. Duration</p>
                        <p className="font-semibold text-gray-200">{estimatedDuration}</p>
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
        <div className="mt-3 pt-3 border-t border-gray-700/50">
            <div className="flex items-center space-x-2 mb-2">
                <SparklesIcon className="w-5 h-5 text-indigo-400 flex-shrink-0" />
                <h4 className="font-semibold text-sm text-indigo-300">AI Optimization Insights</h4>
            </div>
            <dl className="space-y-1 text-xs text-gray-400 pl-1">
                {rationale && (
                    <div className="grid grid-cols-4 gap-1">
                        <dt className="font-medium text-gray-300 col-span-1">Rationale</dt>
                        <dd className="col-span-3">{rationale}</dd>
                    </div>
                )}
                {sendTime && (
                    <div className="grid grid-cols-4 gap-1">
                        <dt className="font-medium text-gray-300 col-span-1">Send Time</dt>
                        <dd className="col-span-3">{sendTime}</dd>
                    </div>
                )}
                {frequency && (
                     <div className="grid grid-cols-4 gap-1">
                        <dt className="font-medium text-gray-300 col-span-1">Frequency</dt>
                        <dd className="col-span-3">{frequency}</dd>
                    </div>
                )}
            </dl>
        </div>
    );
};

const PersonalizedContent: React.FC<{ details: NodeDetails }> = ({ details }) => {
    if (!details?.personalization) return null;
    const { headline, body, offer, variables } = details.personalization;

    return (
         <div className="mt-3 pt-3 border-t border-gray-700/50">
            <div className="flex items-center space-x-2 mb-2">
                <PersonalizationIcon className="w-5 h-5 text-teal-400 flex-shrink-0" />
                <h4 className="font-semibold text-sm text-teal-300">Personalized Content</h4>
            </div>
            <div className="space-y-2 text-sm text-gray-300 p-2 bg-gray-800/70 rounded-md">
                <p><strong className="font-semibold text-gray-200">Headline:</strong> "{headline}"</p>
                <p><strong className="font-semibold text-gray-200">Body:</strong> "{body}"</p>
                {offer && <p><strong className="font-semibold text-gray-200">Offer:</strong> "{offer}"</p>}
                {variables.length > 0 && (
                    <div className="pt-2 flex flex-wrap gap-2 items-center">
                        <span className="text-xs text-gray-400">Variables:</span>
                        {variables.map((v, i) => (
                            <code key={i} className="text-xs bg-gray-700 text-teal-300 px-1.5 py-0.5 rounded">{v}</code>
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

  return (
    <div className="flex items-start space-x-4">
      {/* Icon */}
      <div className={`mt-1 flex-shrink-0 w-8 h-8 rounded-full ${config.color} flex items-center justify-center`}>
        <IconComponent className="w-5 h-5 text-white" />
      </div>
      {/* Content */}
      <div className="flex-grow bg-gray-900 border border-gray-700 rounded-lg p-4 relative">
        {node.type === NodeType.ACTION && <ChannelBadge details={node.details || {}} />}
        {node.type === NodeType.DECISION && <PredictiveModelBadge details={node.details || {}} />}
        
        <p className="font-bold text-lg text-white pr-16">{node.title}</p>
        <p className="text-gray-400 mt-1">{node.description}</p>
        
        {node.details?.condition && (
            <div className="mt-2 p-2 bg-gray-800 border border-gray-700 rounded-md">
                <p className="text-sm text-yellow-300"><span className="font-semibold">Condition:</span> {node.details.condition}</p>
            </div>
        )}

        {node.details?.duration && (
             <div className="mt-2">
                <p className="text-sm text-purple-300"><span className="font-semibold">Duration:</span> {node.details.duration}</p>
            </div>
        )}
        
        {node.type === NodeType.SPLIT && <ABTestDetails details={node.details || {}} />}
        <PersonalizedContent details={node.details || {}} />
        <OptimizationInsights details={node.details || {}} />

      </div>
    </div>
  );
};
