import { GoogleGenAI, Type } from '@google/genai';
import { Campaign, NodeType, ChannelAssetGenerationResult } from '../types';

// Per coding guidelines, API key is assumed to be available in process.env.API_KEY.
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const campaignSchema = {
  type: Type.OBJECT,
  properties: {
    name: { type: Type.STRING, description: 'A concise, descriptive name for the marketing campaign.' },
    description: { type: Type.STRING, description: 'A one-sentence summary of the campaign\'s purpose.' },
    audienceQuery: { type: Type.STRING, description: 'The natural language query used to define the target audience, based on the user prompt.' },
    estimatedSize: { type: Type.INTEGER, description: 'A realistic, simulated number of people in this segment.' },
    keyAttributes: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
      description: 'A list of 3-5 key demographic, behavioral, or predictive attributes that define this segment (e.g., "High Purchase Intent", "Located in North America", "Engaged with \'Mobile App\'").'
    },
    kpis: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
      description: 'A list of 2-3 key performance indicators (KPIs) to measure success.'
    },
    strategy: {
      type: Type.OBJECT,
      description: 'The AI-prescribed high-level strategy for the campaign.',
      properties: {
        recommendations: { type: Type.STRING, description: 'A 2-3 sentence summary of the recommended strategic approach.' },
        budgetAllocation: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              channel: { type: Type.STRING },
              percentage: { type: Type.INTEGER },
              rationale: { type: Type.STRING }
            },
            required: ['channel', 'percentage', 'rationale']
          }
        },
        timing: {
          type: Type.OBJECT,
          properties: {
            launchDate: { type: Type.STRING, description: 'A suggested launch date (e.g., "Next Monday").' },
            duration: { type: Type.STRING, description: 'The estimated campaign duration (e.g., "3 weeks").' },
            rationale: { type: Type.STRING, description: 'Reasoning for the suggested timing.' }
          },
          required: ['launchDate', 'duration', 'rationale']
        }
      },
      required: ['recommendations', 'budgetAllocation', 'timing']
    },
    governancePlan: {
      type: Type.OBJECT,
      description: 'A comprehensive plan for ensuring the campaign adheres to governance, privacy, and deliverability best practices.',
      properties: {
        frequencyManagement: {
          type: Type.OBJECT,
          properties: {
            globalCaps: {
              type: Type.OBJECT,
              properties: {
                messagesPerWeek: { type: Type.INTEGER },
                rationale: { type: Type.STRING }
              },
              required: ['messagesPerWeek', 'rationale']
            },
            channelSpecificCaps: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  channel: { type: Type.STRING },
                  limit: { type: Type.STRING }
                },
                required: ['channel', 'limit']
              }
            },
            intelligentSuppression: {
              type: Type.OBJECT,
              properties: {
                enabled: { type: Type.BOOLEAN },
                description: { type: Type.STRING }
              },
              required: ['enabled', 'description']
            }
          },
          required: ['globalCaps', 'channelSpecificCaps', 'intelligentSuppression']
        },
        complianceAndConsent: {
          type: Type.OBJECT,
          properties: {
            primaryRegulations: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: 'List of applicable regulations (e.g., "GDPR", "CCPA") based on the target audience.'
            },
            consentModel: { type: Type.STRING, description: 'The recommended consent model (e.g., "Granular Double Opt-In").' },
            privacyPolicyLink: { type: Type.STRING, description: 'A placeholder link to the privacy policy.' },
            complianceChecklist: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  regulation: { type: Type.STRING },
                  action: { type: Type.STRING, description: 'A key data subject right (e.g., "Right to Erasure").' },
                  plan: { type: Type.STRING, description: 'A brief description of how the platform supports this right.' }
                },
                required: ['regulation', 'action', 'plan']
              }
            }
          },
          required: ['primaryRegulations', 'consentModel', 'privacyPolicyLink', 'complianceChecklist']
        },
        aiDrivenDeliverability: {
          type: Type.OBJECT,
          properties: {
            senderReputationStrategy: { type: Type.STRING },
            listHygienePlan: { type: Type.STRING },
            predictiveSpamCheck: {
              type: Type.OBJECT,
              properties: {
                simulatedScore: { type: Type.STRING, description: 'A simulated spam score (e.g., "5/100 - Low Risk").' },
                recommendations: {
                  type: Type.ARRAY,
                  items: { type: Type.STRING }
                }
              },
              required: ['simulatedScore', 'recommendations']
            }
          },
          required: ['senderReputationStrategy', 'listHygienePlan', 'predictiveSpamCheck']
        }
      },
      required: ['frequencyManagement', 'complianceAndConsent', 'aiDrivenDeliverability']
    },
    channelSelection: {
        type: Type.OBJECT,
        description: 'A detailed channel selection interface based on the campaign strategy.',
        properties: {
            channelCategories: {
                type: Type.ARRAY,
                items: {
                    type: Type.OBJECT,
                    properties: {
                        categoryName: { type: Type.STRING },
                        channels: {
                            type: Type.ARRAY,
                            items: {
                                type: Type.OBJECT,
                                properties: {
                                    channelName: { type: Type.STRING },
                                    isRecommended: { type: Type.BOOLEAN },
                                    rationale: { type: Type.STRING, description: 'A 1-2 sentence rationale if recommended.' },
                                    estimatedReach: { type: Type.STRING },
                                    costTier: { type: Type.STRING, enum: ['low', 'medium', 'high'] },
                                    bestFor: { type: Type.STRING, enum: ['awareness', 'consideration', 'conversion'] }
                                },
                                required: ['channelName', 'isRecommended', 'rationale', 'estimatedReach', 'costTier', 'bestFor']
                            }
                        }
                    },
                    required: ['categoryName', 'channels']
                }
            },
            executionPriority: {
                type: Type.ARRAY,
                items: { type: Type.STRING }
            },
            budgetAllocationSuggestion: {
              type: Type.ARRAY,
              description: 'A list of recommended channels and their suggested budget percentage.',
              items: {
                type: Type.OBJECT,
                properties: {
                  channel: { type: Type.STRING },
                  percentage: { type: Type.STRING, description: 'The percentage of the budget as a string, e.g., "30%"' }
                },
                required: ['channel', 'percentage']
              }
            }
        },
        required: ['channelCategories', 'executionPriority', 'budgetAllocationSuggestion']
    },
    nodes: {
      type: Type.ARRAY,
      description: 'The sequence of steps in the customer journey, represented as nodes.',
      items: {
        type: Type.OBJECT,
        properties: {
          id: { type: Type.INTEGER, description: 'A unique integer ID for the node, starting from 1.' },
          type: {
            type: Type.STRING,
            enum: Object.values(NodeType),
            description: 'The type of the journey node.'
          },
          title: { type: Type.STRING, description: 'A short, clear title for the node (e.g., "User Submits Form", "Send Welcome Email").' },
          description: { type: Type.STRING, description: 'A detailed description of what happens at this step.' },
          details: {
            type: Type.OBJECT,
            description: 'Context-specific details for the node.',
            properties: {
                channel: { type: Type.STRING, enum: ['Email', 'SMS', 'Push', 'WhatsApp', 'In-App'], description: 'For ACTION nodes, the communication channel used.' },
                condition: { type: Type.STRING, description: 'For DECISION nodes, the condition being evaluated (e.g., "User opened email?").' },
                predictionModel: { type: Type.STRING, description: 'For predictive DECISION nodes, the name of the AI model used (e.g., "Churn Prediction v3").' },
                duration: { type: Type.STRING, description: 'For WAIT nodes, the time duration (e.g., "24 hours", "3 days").' },
                personalization: {
                  type: Type.OBJECT,
                  description: 'AI-generated personalized content for the message.',
                  properties: {
                    headline: { type: Type.STRING, description: 'The headline or subject line of the message.' },
                    body: { type: Type.STRING, description: 'The main body copy of the message.' },
                    offer: { type: Type.STRING, description: 'A specific offer or call-to-action, if applicable.' },
                    variables: {
                      type: Type.ARRAY,
                      items: { type: Type.STRING },
                      description: 'A list of dynamic personalization variables used in the content (e.g., "{{user.firstName}}").'
                    }
                  },
                  required: ['headline', 'body', 'variables']
                },
                optimization: {
                    type: Type.OBJECT,
                    description: 'AI-driven suggestions for optimizing this engagement touchpoint.',
                    properties: {
                        rationale: { type: Type.STRING, description: 'The reasoning behind selecting this specific channel for this audience and goal.' },
                        sendTime: { type: Type.STRING, description: 'Recommendation for send-time optimization (e.g., "Mornings, based on user engagement history").' },
                        frequency: { type: Type.STRING, description: 'Considerations for frequency capping (e.g., "Part of a 3-part series, ensure 24h cooldown").' }
                    }
                },
                abTest: {
                  type: Type.OBJECT,
                  description: 'For SPLIT nodes, details of the A/B test.',
                  properties: {
                    hypothesis: { type: Type.STRING, description: 'The hypothesis being tested.' },
                    testType: { type: Type.STRING, enum: ['A/B'], description: 'The type of test being run.' },
                    primaryMetric: { type: Type.STRING, description: 'The main KPI to determine the winner (e.g., "Open Rate").' },
                    trafficSplit: { type: Type.STRING, description: 'The audience distribution for the test (e.g., "50% / 50%").' },
                    estimatedDuration: { type: Type.STRING, description: 'The suggested duration for the test to reach significance.' }
                  },
                  required: ['hypothesis', 'testType', 'primaryMetric', 'trafficSplit', 'estimatedDuration']
                }
            }
          },
          children: {
            type: Type.ARRAY,
            description: 'A list of branches leading to the next node(s).',
            items: {
              type: Type.OBJECT,
              properties: {
                label: { type: Type.STRING, description: 'A label for the branch, especially for DECISION/SPLIT nodes (e.g., "Yes", "No", "Variant A"). Empty for simple linear flows.' },
                nodeId: { type: Type.INTEGER, description: 'The ID of the next node in this branch.' }
              },
              required: ['label', 'nodeId']
            }
          }
        },
        required: ['id', 'type', 'title', 'description', 'children']
      }
    }
  },
  required: ['name', 'description', 'audienceQuery', 'estimatedSize', 'keyAttributes', 'kpis', 'strategy', 'governancePlan', 'channelSelection', 'nodes']
};


const channelAssetGenerationSchema = {
    type: Type.OBJECT,
    properties: {
        channel: { type: Type.STRING },
        category: { type: Type.STRING },
        generationTimestamp: { type: Type.STRING },
        implementationGuidance: {
            type: Type.OBJECT,
            properties: {
                postingSchedule: { type: Type.STRING },
                keyMetrics: { type: Type.ARRAY, items: { type: Type.STRING } },
                optimizationTips: { type: Type.ARRAY, items: { type: Type.STRING } },
            },
            required: ['postingSchedule', 'keyMetrics', 'optimizationTips']
        },
        assets: {
            type: Type.ARRAY,
            items: {
                type: Type.OBJECT,
                properties: {
                    assetType: { type: Type.STRING },
                    assetId: { type: Type.STRING },
                    content: {
                        type: Type.OBJECT,
                        properties: {
                            headline: { type: Type.STRING },
                            bodyCopy: { type: Type.STRING },
                            caption: { type: Type.STRING },
                            hashtags: { type: Type.ARRAY, items: { type: Type.STRING } },
                            cta: { type: Type.STRING },
                            visualDescription: { type: Type.STRING },
                            script: {
                                type: Type.OBJECT,
                                properties: {
                                    '15s': { type: Type.STRING },
                                    '30s': { type: Type.STRING },
                                    '60s': { type: Type.STRING },
                                }
                            },
                            specifications: {
                                type: Type.OBJECT,
                                properties: {
                                    dimensions: { type: Type.STRING },
                                    format: { type: Type.STRING },
                                    characterLimit: { type: Type.INTEGER },
                                }
                            },
                            bestPractices: { type: Type.ARRAY, items: { type: Type.STRING } },
                            variants: {
                                type: Type.ARRAY,
                                description: "A list of A/B test variants, where each item represents a full version of the content.",
                                items: {
                                    type: Type.OBJECT,
                                    properties: {
                                        id: { type: Type.STRING },
                                        caption: { type: Type.STRING },
                                        headline: { type: Type.STRING },
                                        bodyCopy: { type: Type.STRING },
                                        reasoning: { type: Type.STRING },
                                    },
                                    required: ['id', 'reasoning']
                                }
                            }
                        },
                    }
                },
                required: ['assetType', 'assetId', 'content']
            }
        }
    },
    required: ['channel', 'category', 'generationTimestamp', 'assets', 'implementationGuidance']
};


export const generateCampaignJourney = async (prompt: string): Promise<Campaign> => {
  const systemInstruction = `You are a world-class AI marketing platform, acting as an expert strategist and media planner. Your task is to transform a user's campaign request into a single, detailed, structured JSON object.

The user provides a 'Campaign Goal' and a 'Target Audience'.

**1. Channel Selection & Orchestration (New Requirement):**
*   First, act as an expert media planner. Analyze the user's strategy to generate a comprehensive 'channelSelection' interface.
*   Organize channels into these exact categories: 'Physical Spaces', 'Digital Channels', 'TV', 'Radio', 'Social Media', 'Print Media', 'Out-of-Home (OOH)'.
*   For each category, analyze the campaign strategy and recommend 3-5 of the most relevant channels by setting 'isRecommended' to true.
*   For each recommended channel, provide a brief 'rationale'.
*   For EVERY channel, provide 'estimatedReach', 'costTier', and 'bestFor' funnel stage.
*   Provide a top-level 'executionPriority' list and a 'budgetAllocationSuggestion' array of objects.

**2. Governance & Compliance:**
*   Create a comprehensive 'governancePlan'. This is mandatory.
*   **Frequency Management:** Set sensible global and channel-specific frequency caps.
*   **Compliance & Consent:** Based on the target audience (e.g., European customers -> GDPR), identify primary regulations. Provide a 'complianceChecklist' detailing the plan for key data rights like "Right to Erasure", "Right to Access", and "Data Portability".
*   **AI-Driven Deliverability:** Perform a simulated 'predictiveSpamCheck' on one of the campaign's generated messages. Provide a 'simulatedScore' and at least two actionable 'recommendations' for improvement.

**3. Prescriptive Strategy (Top-Level):**
*   Devise an overall 'strategy'. This is mandatory.
*   Provide high-level 'recommendations' (2-3 sentences).
*   Create a sensible 'budgetAllocation' across 2-4 relevant channels with percentages and rationale.
*   Suggest optimal 'timing' with a launch date, duration, and rationale.

**4. Predictive Segmentation (CDP Simulation):**
*   Define the audience with 'audienceQuery', 'estimatedSize', and 'keyAttributes'.

**5. Generative Journey Orchestration:**
*   Design a multi-step journey starting with a TRIGGER (ID 1).
*   For **WAIT** nodes, specify the 'duration'.
*   **Predictive AI in Decisions**: For at least one **DECISION** node, base the 'condition' on a predictive model (e.g., "Churn Score > 80%"). You MUST specify the model's name in 'details.predictionModel'.

**6. Testing & Optimization (AI-Driven Experiment Design):**
*   Use at least one **SPLIT** node to represent an A/B test.
*   For this SPLIT node, you MUST populate the entire 'details.abTest' object.
*   The branches from a SPLIT node MUST be labeled "Variant A" and "Variant B".
*   **Crucially**, the first ACTION node following "Variant A" and "Variant B" MUST have different 'details.personalization' content that reflects the 'hypothesis'.

**7. Omnichannel & Content Intelligence:**
*   For each **ACTION** node that sends a message:
    *   Choose the most effective channel.
    *   In 'details.personalization', create a 'headline', 'body', and optional 'offer', and list the dynamic 'variables' used.
    *   In 'details.optimization', provide 'rationale' for channel choice, 'sendTime', and 'frequency' advice.

**Structure Rules:**
*   Ensure all node connections are logical and 'nodeId's are valid.
*   Return a single, valid JSON object matching the schema. Do not wrap it in markdown.`;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        systemInstruction,
        responseMimeType: 'application/json',
        responseSchema: campaignSchema,
        temperature: 0.5,
      },
    });

    const jsonString = response.text.trim();
    
    if (!jsonString) {
      throw new Error('API returned an empty response.');
    }
    
    const parsedCampaign = JSON.parse(jsonString);

    if (!parsedCampaign.nodes || parsedCampaign.nodes.length === 0) {
        throw new Error("Generated campaign has no journey nodes.");
    }
    if (!parsedCampaign.keyAttributes || parsedCampaign.keyAttributes.length === 0) {
        throw new Error("Generated campaign has no key audience attributes.");
    }
     if (!parsedCampaign.strategy) {
        throw new Error("Generated campaign is missing the overall strategy section.");
    }
    if (!parsedCampaign.governancePlan) {
        throw new Error("Generated campaign is missing the Governance & Compliance plan.");
    }
    if (!parsedCampaign.channelSelection) {
        throw new Error("Generated campaign is missing the Channel Selection interface.");
    }


    return parsedCampaign as Campaign;

  } catch (error) {
    console.error("Error calling Gemini API:", error);
    if (error instanceof Error && error.message.includes('json')) {
        throw new Error("Failed to generate campaign. The AI model returned an invalid structure. Please try rephrasing your request.");
    }
    throw new Error("Failed to generate campaign. The AI model may be experiencing issues. Please try again later.");
  }
};

export const generateAssetsForChannel = async (campaign: Campaign, channelName: string, channelCategory: string): Promise<ChannelAssetGenerationResult> => {
    const systemInstruction = `You are a JSON generation machine. Your ONLY function is to output a single, valid JSON object that strictly follows the provided schema.

**THE MOST IMPORTANT RULE:**
Every double quote (") character within any JSON string value MUST be escaped with a backslash (\\).
- CORRECT: { "text": "This is a \\"quote\\"." }
- INCORRECT: { "text": "This is a "quote"." }
Failure to follow this rule will result in an error.

**SECONDARY RULES:**
- Do not add any text, explanation, or markdown (like \`\`\`json) before or after the JSON object. The entire output must be the JSON itself.
- All keys and string values must be enclosed in double quotes.

With those rules in mind, act as an expert creative director. Generate comprehensive marketing assets for the SINGLE CHANNEL specified in the user prompt, based on the provided campaign strategy.`;

    const prompt = `
Generate platform-specific marketing assets for THIS CHANNEL ONLY.

CAMPAIGN STRATEGY:
- Name: ${campaign.name}
- Description: ${campaign.description}
- Target Audience: ${campaign.audienceQuery}
- Core Message: ${campaign.strategy.recommendations}

TARGET CHANNEL:
${channelName}

CHANNEL CATEGORY:
${channelCategory}

YOUR TASK:
Generate production-ready marketing assets for the target channel, following the rules for its category and formatting the output as a single JSON object. Create at least 2 A/B test variants for each asset.

ASSET GENERATION RULES:
1. IF CHANNEL IS DIGITAL (e.g., Website, Email, SMS, Display Ads):
   - Headline: Attention-grabbing, platform-appropriate
   - Body Copy: Optimized length for platform
   - CTA: Action-oriented, clear
   - Visual Description: Detailed description of imagery/graphics
   - A/B Test Variants: 2-3 variations with different headlines/CTAs

2. IF CHANNEL IS SOCIAL MEDIA (e.g., Facebook, Instagram, TikTok, LinkedIn):
   - Post Caption: Platform-optimized length and style
   - Hashtags: 5-10 relevant, trending hashtags
   - Visual Concept: Image/video concept description
   - Post Format: Suggest a suitable format (e.g., Carousel, Reel)
   - Engagement Strategy: How to encourage interaction
   - A/B Test Variants: 2-3 caption variations

3. IF CHANNEL IS PHYSICAL/PRINT (e.g., Billboards, Print Ads, Direct Mail):
   - Primary Message: Large, bold headline
   - Supporting Copy: Concise body text
   - Visual Layout: Description of layout and brand elements
   - Location Strategy: Where to place for maximum impact
   - Design Variants: 2-3 different visual approaches

4. IF CHANNEL IS BROADCAST (e.g., TV, Radio, Podcast):
   - Script: 15-second and 30-second versions
   - Audio/Visual Elements: Description of scenes, sounds, music
   - Voice Direction: Tone, pace, emotion
   - Script Variants: 2 different approaches (e.g., emotional vs. informational)
`;

    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-pro',
            contents: prompt,
            config: {
                systemInstruction,
                responseMimeType: 'application/json',
                responseSchema: channelAssetGenerationSchema,
                temperature: 0.2,
            },
        });

        const jsonString = response.text.trim();
        if (!jsonString) {
            throw new Error(`Asset generation API returned an empty response for ${channelName}.`);
        }
        
        return JSON.parse(jsonString) as ChannelAssetGenerationResult;

    } catch (error) {
        console.error(`Error calling Gemini API for ${channelName} asset generation:`, error);
        if (error instanceof Error && error.message.includes('json')) {
            throw new Error(`Failed to generate assets for ${channelName}. The AI model returned an invalid structure.`);
        }
        throw new Error(`Failed to generate assets for ${channelName}. The AI model may be experiencing issues. Please try again later.`);
    }
};