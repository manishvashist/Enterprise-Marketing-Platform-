export enum NodeType {
  TRIGGER = 'TRIGGER',
  ACTION = 'ACTION',
  DECISION = 'DECISION',
  WAIT = 'WAIT',
  SPLIT = 'SPLIT',
  END = 'END',
}

export interface Branch {
  label: string;
  nodeId: number;
}

export interface OptimizationDetails {
  rationale?: string;
  sendTime?: string;
  frequency?: string;
}

export interface PersonalizationDetails {
  headline: string;
  body: string;
  offer?: string;
  variables: string[];
}

export interface NodeDetails {
  channel?: 'Email' | 'SMS' | 'Push' | 'WhatsApp' | 'In-App';
  condition?: string;
  predictionModel?: string; // For predictive DECISION nodes
  duration?: string;
  personalization?: PersonalizationDetails;
  optimization?: OptimizationDetails;
  abTest?: {
    hypothesis: string;
    testType: 'A/B';
    primaryMetric: string;
    trafficSplit: string;
    estimatedDuration: string;
  };
}

export interface JourneyNode {
  id: number;
  type: NodeType;
  title: string;
  description: string;
  details?: NodeDetails;
  children: Branch[];
}

export interface CampaignStrategy {
  recommendations: string;
  budgetAllocation: {
    channel: string;
    percentage: number;
    rationale: string;
  }[];
  timing: {
    launchDate: string;
    duration: string;
    rationale: string;
  };
}

export interface GovernancePlan {
  frequencyManagement: {
    globalCaps: {
      messagesPerWeek: number;
      rationale: string;
    };
    channelSpecificCaps: {
      channel: string;
      limit: string;
    }[];
    intelligentSuppression: {
      enabled: boolean;
      description: string;
    };
  };
  complianceAndConsent: {
    primaryRegulations: string[];
    consentModel: string;
    privacyPolicyLink: string;
    complianceChecklist: {
      regulation: string;
      action: string;
      plan: string;
    }[];
  };
  aiDrivenDeliverability: {
    senderReputationStrategy: string;
    listHygienePlan: string;
    predictiveSpamCheck: {
      simulatedScore: string;
      recommendations: string[];
    };
  };
}

export interface Channel {
  channelName: string;
  isRecommended: boolean;
  rationale: string;
  estimatedReach: string;
  costTier: 'low' | 'medium' | 'high';
  bestFor: 'awareness' | 'consideration' | 'conversion';
}

export interface ChannelCategory {
  categoryName: string;
  channels: Channel[];
}

export interface BudgetAllocation {
  channel: string;
  percentage: string;
}

export interface ChannelSelectionInterface {
  channelCategories: ChannelCategory[];
  executionPriority: string[];
  budgetAllocationSuggestion: BudgetAllocation[];
}


// --- NEW ASSET TYPES for Per-Channel Generation ---

export interface AssetVariant {
  id: string;
  caption?: string;
  headline?: string;
  bodyCopy?: string;
  reasoning: string;
}

export interface SingleAssetContent {
  headline?: string;
  bodyCopy?: string;
  caption?: string;
  hashtags?: string[];
  cta?: string;
  visualDescription?: string;
  script?: {
    '15s'?: string;
    '30s'?: string;
    '60s'?: string;
  };
  specifications?: {
    dimensions?: string;
    format?: string;
    characterLimit?: number;
  };
  bestPractices?: string[];
  variants?: AssetVariant[];
}

export interface SingleMarketingAsset {
    assetType: string;
    assetId: string;
    content: SingleAssetContent;
}

export interface ImplementationGuidance {
    postingSchedule: string;
    keyMetrics: string[];
    optimizationTips: string[];
}

export interface ChannelAssetGenerationResult {
    channel: string;
    category: string;
    generationTimestamp: string;
    assets: SingleMarketingAsset[];
    implementationGuidance: ImplementationGuidance;
}


export interface Campaign {
  name: string;
  description: string;
  audienceQuery: string;
  estimatedSize: number;
  keyAttributes: string[];
  kpis: string[];
  strategy: CampaignStrategy;
  governancePlan: GovernancePlan;
  channelSelection?: ChannelSelectionInterface;
  channelAssets?: Record<string, ChannelAssetGenerationResult>;
  nodes: JourneyNode[];
}