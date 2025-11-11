

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
  id: string; // Now mandatory after creation
  userId: string;
  subscriptionId?: string | null;
  isTrialCampaign: boolean;
  createdAt: string;
  updatedAt: string;
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

// --- NEW TYPES for Channel Connection & Execution ---

export type ChannelConnectionStatus = 'disconnected' | 'connected' | 'error';
export type AuthMethod = 'OAuth 2.0' | 'API Key';

export interface ChannelFeatures {
  canPublishPosts: boolean;
  canCreateAds: boolean;
  canSchedulePosts: boolean;
  canAccessAnalytics: boolean;
  canManageBudget: boolean;
}

export interface ConnectedAccount {
    accountId: string;
    accountName: string;
    [key: string]: any; // For extra details like followers, ad account info etc.
}
export interface ChannelConnection {
  channelId: string;
  channelName: string;
  category: string;
  connectionStatus: ChannelConnectionStatus;
  authMethod: AuthMethod;
  requiredScopes: string[];
  connectedAccount: ConnectedAccount | null;
  features: ChannelFeatures;
  apiEndpoint: string;
  setupInstructions: string;
}

export interface AvailableAdAccount {
  adAccountId: string;
  adAccountName: string;
  currency: string;
  balance: number;
  spendCap: number;
  totalSpend?: number; // Lifetime spend on the ad account
}
export interface AvailableAccount {
  accountId: string;
  accountName: string;
  accountType: 'page' | 'profile' | 'ad_account' | 'channel' | 'list';
  followers?: number;
  isActive: boolean;
  adAccounts?: AvailableAdAccount[]; // For pages that might have associated ad accounts
  // Direct properties for when the account itself is an ad_account
  currency?: string;
  balance?: number;
  spendCap?: number;
  totalSpend?: number;
}

export type ExecutionStatus = 'pending' | 'scheduled' | 'publishing' | 'published' | 'failed';

export interface ExecutionItem {
  channelId: string;
  status: ExecutionStatus;
  scheduledTime: Date | null;
  error?: string;
}

export type CampaignExecutionPlan = Record<string, ExecutionItem>;

// FIX: Add AssetGenerationProgress and VideoAssetState interfaces to centralize types and resolve circular dependencies.
// --- NEW TYPES for Asset Generation Progress & Video State ---
export interface AssetGenerationProgress {
  totalChannels: number;
  completedChannels: number;
  isGeneratingAll: boolean;
  channelProgress: Record<string, {
    status: 'pending' | 'in-progress' | 'completed' | 'error';
    percentage: number;
    error?: string;
  }>;
}

export interface VideoAssetState {
  status: 'pending' | 'loading' | 'done' | 'error';
  url?: string;
  error?: string;
  progressMessage?: string;
}

// --- NEW TYPES for Subscriptions & Billing ---
export type AccountStatus = 'trial' | 'active' | 'expired' | 'cancelled';
export type SubscriptionStatus = 'active' | 'cancelled' | 'expired' | 'past_due';
export type PlanCode = 'individual' | 'small_team' | 'agency';
export type BillingType = 'monthly' | 'annual';

export interface SubscriptionPlan {
  id: string;
  name: string;
  planCode: PlanCode;
  monthlyPrice: number;
  billingCycleMonths: number;
  campaignQuota: number;
  quotaPeriodDays: number;
  annualPrice: number;
  annualDiscountPercent: number;
  isActive: boolean;
}

export interface UserSubscription {
  id: string;
  userId: string;
  planId: string;
  plan?: SubscriptionPlan; // populated for convenience
  billingType: BillingType;
  status: SubscriptionStatus;
  startDate: string;
  currentPeriodStart: string;
  currentPeriodEnd: string;
  nextBillingDate: string | null;
  cancellationDate: string | null;
  campaignsUsedCurrentPeriod: number;
  campaignQuota: number;
  quotaResetDate: string;
  autoRenew: boolean;
}

export interface UsageInfo {
  canGenerate: boolean;
  reason: 'trial' | 'subscription' | 'quota_exceeded' | 'subscription_required' | 'trial_expired';
  remaining: number;
  limit: number;
  daysUntilReset?: number;
  trialDaysRemaining?: number;
}

// --- UPDATED User type ---
export type UserRole = 'Admin' | 'Manager' | 'User';
// FIX: Changed 'microsoft' to 'azure' to align with Supabase's OAuth provider name.
export type AuthProvider = 'email' | 'google' | 'github' | 'azure' | 'facebook';

export interface User {
  id: string;
  fullName: string;
  email: string;
  role: UserRole;
  createdAt: string;
  lastLogin: string;
  authProvider: AuthProvider;
  channelConnections: Record<string, ChannelConnection>;
  // New subscription fields
  accountStatus: AccountStatus;
  trialStartDate: string | null;
  trialEndDate: string | null;
  trialCampaignsUsed: number;
  activeSubscription: UserSubscription | null;
}

// --- NEW TYPES for Media Plan ---
export interface MediaPlanInputs {
    campaignName: string;
    objectives: string;
    audience: string;
    geo: string;
    industry: string;
    product: string;
    competitors: string;
    keywords: string;
    duration: string;
}
