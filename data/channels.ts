import { ChannelConnection, AvailableAccount } from '../types';

export const initialChannelConnections: Record<string, ChannelConnection> = {
    facebook: {
        channelId: "facebook",
        channelName: "Facebook",
        category: "Social Media",
        connectionStatus: "disconnected",
        authMethod: "OAuth 2.0",
        requiredScopes: ["pages_manage_posts", "ads_management", "pages_read_engagement"],
        connectedAccount: null,
        features: { canPublishPosts: true, canCreateAds: true, canSchedulePosts: true, canAccessAnalytics: true, canManageBudget: true },
        apiEndpoint: "https://graph.facebook.com/v18.0",
        setupInstructions: "Click connect and follow the OAuth flow to grant permissions."
    },
    google_ads: {
        channelId: "google_ads",
        channelName: "Google Ads",
        category: "Digital Advertising",
        connectionStatus: "disconnected",
        authMethod: "OAuth 2.0",
        requiredScopes: ["https://www.googleapis.com/auth/adwords"],
        connectedAccount: null,
        features: { canPublishPosts: false, canCreateAds: true, canSchedulePosts: false, canAccessAnalytics: true, canManageBudget: true },
        apiEndpoint: "https://googleads.googleapis.com/v15",
        setupInstructions: "Connect your Google account and select your Google Ads ID."
    },
    mailchimp: {
        channelId: "mailchimp",
        channelName: "Mailchimp",
        category: "Email & SMS",
        connectionStatus: "disconnected",
        authMethod: "OAuth 2.0",
        requiredScopes: ["campaigns", "lists"],
        connectedAccount: null,
        features: { canPublishPosts: true, canCreateAds: false, canSchedulePosts: true, canAccessAnalytics: true, canManageBudget: false },
        apiEndpoint: "https://usX.api.mailchimp.com/3.0/",
        setupInstructions: "Log in with your Mailchimp credentials to authorize access."
    },
    linkedin: {
        channelId: "linkedin",
        channelName: "LinkedIn",
        category: "Social Media",
        connectionStatus: "disconnected",
        authMethod: "OAuth 2.0",
        requiredScopes: ["r_organization_social", "w_organization_social", "rw_ads"],
        connectedAccount: null,
        features: { canPublishPosts: true, canCreateAds: true, canSchedulePosts: true, canAccessAnalytics: true, canManageBudget: true },
        apiEndpoint: "https://api.linkedin.com/v2/",
        setupInstructions: "Connect your LinkedIn profile and select your company page."
    },
    x_twitter: {
        channelId: "x_twitter",
        channelName: "X (Twitter)",
        category: "Social Media",
        connectionStatus: "disconnected",
        authMethod: "OAuth 2.0",
        requiredScopes: ["tweet.read", "tweet.write", "users.read", "ads_read", "ads_write"],
        connectedAccount: null,
        features: { canPublishPosts: true, canCreateAds: true, canSchedulePosts: true, canAccessAnalytics: true, canManageBudget: true },
        apiEndpoint: "https://api.twitter.com/2/",
        setupInstructions: "Authorize the application with your X account."
    },
    tiktok: {
        channelId: "tiktok",
        channelName: "TikTok",
        category: "Social Media",
        connectionStatus: "disconnected",
        authMethod: "OAuth 2.0",
        requiredScopes: ["video.publish", "ads_management"],
        connectedAccount: null,
        features: { canPublishPosts: true, canCreateAds: true, canSchedulePosts: true, canAccessAnalytics: true, canManageBudget: true },
        apiEndpoint: "https://open.tiktokapis.com/v2/",
        setupInstructions: "Connect your TikTok for Business account."
    },
    google_analytics: {
        channelId: "google_analytics",
        channelName: "Google Analytics",
        category: "Analytics & Tracking",
        connectionStatus: "disconnected",
        authMethod: "OAuth 2.0",
        requiredScopes: ["https://www.googleapis.com/auth/analytics.readonly"],
        connectedAccount: null,
        features: { canPublishPosts: false, canCreateAds: false, canSchedulePosts: false, canAccessAnalytics: true, canManageBudget: false },
        apiEndpoint: "https://analyticsdata.googleapis.com/v1beta",
        setupInstructions: "Connect your Google account and select your GA4 Property."
    },
};

export const availableAccounts: Record<string, AvailableAccount[]> = {
    facebook: [
        { accountId: "fb_page_101", accountName: "Quantum Innovations Inc.", accountType: "page", followers: 125032, isActive: true },
        { accountId: "fb_page_102", accountName: "Project Nebula Showcase", accountType: "page", followers: 4823, isActive: true },
    ],
    google_ads: [
        { accountId: "g_ads_201", accountName: "Main Ad Account (USD)", accountType: "ad_account", isActive: true },
        { accountId: "g_ads_202", accountName: "International Campaigns (EUR)", accountType: "ad_account", isActive: true },
    ],
    mailchimp: [
        { accountId: "mc_list_301", accountName: "Newsletter Subscribers", accountType: "list", followers: 89450, isActive: true },
    ],
    linkedin: [
        { accountId: "li_page_401", accountName: "Quantum Innovations Inc.", accountType: "page", followers: 67211, isActive: true },
    ],
     x_twitter: [
        { accountId: "x_profile_501", accountName: "@QuantumInnovate", accountType: "profile", followers: 32987, isActive: true },
    ],
    tiktok: [
         { accountId: "tt_profile_601", accountName: "QuantumInnovations", accountType: "profile", followers: 210400, isActive: true },
    ],
    google_analytics: [
        { accountId: "ga_prop_701", accountName: "Main Website GA4 Property", accountType: "channel", isActive: true },
    ]
};