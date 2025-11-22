
// @google/genai Coding Guidelines: Do not import `LiveSession` as an explicit return type.
import { GoogleGenAI, Type, Modality, LiveServerMessage, Blob, GenerateContentResponse } from '@google/genai';
import { Campaign, NodeType, ChannelAssetGenerationResult, User, MediaPlanInputs } from '../types';
import { subscriptionService } from './subscriptionService';

// Per coding guidelines, API key is assumed to be available in process.env.API_KEY.
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

// --- Utility: Retry Logic for API Calls ---
async function callWithRetry<T>(
    apiCall: () => Promise<T>, 
    retries = 3, 
    backoff = 1000
): Promise<T> {
    try {
        return await apiCall();
    } catch (error: any) {
        if (retries > 0 && (error.status === 429 || error.code === 429 || (error.message && error.message.includes('quota')))) {
            console.warn(`API Quota exceeded. Retrying in ${backoff}ms... (${retries} retries left)`);
            await new Promise(resolve => setTimeout(resolve, backoff));
            return callWithRetry(apiCall, retries - 1, backoff * 2);
        }
        throw error;
    }
}

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


export const generateCampaignJourney = async (prompt: string, user: User): Promise<Omit<Campaign, 'id'|'userId'|'subscriptionId'|'isTrialCampaign'|'createdAt'|'updatedAt'>> => {
  const systemInstruction = `You are a world-class AI Campaign Generator, acting as an expert strategist and media planner. Your task is to provide the data for a marketing campaign based on a user's request. The output format is a structured JSON object handled by the system; focus on generating high-quality, comprehensive, and strategically sound content for each field.

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
*   Design a multi-step journey starting with a TRIGGER (ID 1). The journey MUST contain at least 5 nodes.
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
*   Ensure all node connections are logical and 'nodeId's are valid.`;

  try {
    const canGenerateCheck = await subscriptionService.canGenerateCampaign(user.id);
    if (!canGenerateCheck.canGenerate) {
        if(canGenerateCheck.reason === 'quota_exceeded') throw new Error("Campaign quota exceeded. Please upgrade or wait for your quota to reset.");
        if(canGenerateCheck.reason === 'trial_expired') throw new Error("Your trial has expired. Please subscribe to continue generating campaigns.");
        throw new Error("You do not have permission to generate a new campaign.");
    }
    
    const response = await callWithRetry<GenerateContentResponse>(() => ai.models.generateContent({
      model: 'gemini-2.5-pro',
      contents: prompt,
      config: {
        systemInstruction,
        temperature: 0.5,
        responseMimeType: "application/json",
        responseSchema: campaignSchema,
      },
    }));

    const jsonString = response.text ? response.text.trim() : '';
    
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


    return parsedCampaign;

  } catch (error) {
    console.error("Error calling Gemini API:", error);
    if (error instanceof Error && error.message.includes('json')) {
        throw new Error("Failed to generate campaign. The AI model returned an invalid structure. Please try rephrasing your request.");
    }
    // Pass through specific quota errors
    if(error instanceof Error && (error.message.includes('quota') || error.message.includes('trial'))) {
      throw error;
    }
    if (error instanceof Error && error.message.includes('429')) {
        throw new Error("The system is experiencing high traffic (Quota Exceeded). Please wait a moment and try again.");
    }
    throw new Error("Failed to generate campaign. The AI model may be experiencing issues. Please try again later.");
  }
};

export const generateAssetsForChannel = async (campaign: Campaign, channelName: string, channelCategory: string): Promise<ChannelAssetGenerationResult> => {
    const systemInstruction = `You are an expert creative director AI. Your task is to generate comprehensive marketing assets for a specific channel based on a campaign strategy.
Your response will be a structured JSON object, handled by the system. Focus on the quality of the content.

Key instructions:
- The main 'content' object for an asset represents the primary version.
- The 'variants' array should contain alternative versions for A/B testing. Each variant should have distinct content (e.g., a different headline or body copy) and a 'reasoning' for the variation.
- For "Email Marketing", generate professional and engaging subject lines (as 'headline') and full email body copy (as 'bodyCopy'). Ensure the content is well-structured and persuasive.`;

    const prompt = `
Generate platform-specific marketing assets for the channel specified below. The output must be a single, valid JSON object that conforms to the provided schema.

CAMPAIGN CONTEXT:
- Name: ${campaign.name}
- Description: ${campaign.description}
- Target Audience: ${campaign.audienceQuery}
- Core Message: ${campaign.strategy.recommendations}

TARGET CHANNEL: ${channelName}
CHANNEL CATEGORY: ${channelCategory}

TASK:
Generate a set of production-ready marketing assets. For each asset, create at least one A/B test variant with a different creative approach (e.g., different headlines or calls-to-action). The assets should be tailored specifically for the "${channelName}" platform, considering its best practices, formats, and user expectations.
`;

    try {
        const response = await callWithRetry<GenerateContentResponse>(() => ai.models.generateContent({
            model: 'gemini-2.5-pro',
            contents: prompt,
            config: {
                systemInstruction,
                temperature: 0.2,
                responseMimeType: "application/json",
                responseSchema: channelAssetGenerationSchema,
            },
        }));

        const jsonString = response.text ? response.text.trim() : '';
        if (!jsonString) {
            throw new Error(`Asset generation API returned an empty response for ${channelName}.`);
        }
        
        return JSON.parse(jsonString) as ChannelAssetGenerationResult;

    } catch (error) {
        console.error(`Error calling Gemini API for ${channelName} asset generation:`, error);
        if (error instanceof Error && error.message.includes('json')) {
            throw new Error(`Failed to generate assets for ${channelName}. The AI model returned an invalid structure.`);
        }
        if (error instanceof Error && error.message.includes('429')) {
            throw new Error("Quota exceeded for asset generation. Please try again shortly.");
        }
        throw new Error(`Failed to generate assets for ${channelName}. The AI model may be experiencing issues. Please try again later.`);
    }
};

export const editImageWithPrompt = async (imagePart: { inlineData: { data: string; mimeType: string; } }, prompt: string): Promise<string> => {
    try {
        const textPart = {
            text: prompt,
        };
        const response = await callWithRetry<GenerateContentResponse>(() => ai.models.generateContent({
            model: 'gemini-2.5-flash-image',
            contents: {
                parts: [imagePart, textPart],
            },
            config: {
                responseModalities: [Modality.IMAGE],
            },
        }));
        
        if (response.candidates && response.candidates[0] && response.candidates[0].content && response.candidates[0].content.parts) {
            for (const part of response.candidates[0].content.parts) {
                if (part.inlineData) {
                    return part.inlineData.data;
                }
            }
        }
        throw new Error("No image data found in the response from the AI model.");

    } catch (error) {
        console.error("Error calling Gemini API for image editing:", error);
        if (error instanceof Error && error.message.includes('429')) {
            throw new Error("Quota exceeded for image editing. Please try again shortly.");
        }
        throw new Error("Failed to edit image. The AI model may be experiencing issues. Please try again later.");
    }
};

export const generateVideoForChannel = async (
    campaign: Campaign, 
    channelName: string,
    updateProgress: (message: string) => void
): Promise<string> => {
    // Per guidelines, create a new instance before an API call to ensure the latest key is used.
    const videoAI = new GoogleGenAI({ apiKey: process.env.API_KEY });
    
    let aspectRatio: '16:9' | '9:16' = '16:9';
    if (['TikTok', 'Instagram', 'SMS'].some(ch => channelName.includes(ch))) {
        aspectRatio = '9:16';
    }

    const prompt = `Create a visually stunning 15-second video ad for ${channelName}.
    Campaign: "${campaign.name}" - ${campaign.description}.
    Target Audience: ${campaign.audienceQuery}.
    Key message: "${campaign.strategy.recommendations}".
    The video should be fast-paced, eye-catching, and tailored to a mobile-first audience on ${channelName}. Avoid text overlays. The style should be modern and energetic.`;

    try {
        updateProgress("Sending request to the video model...");
        let operation = await callWithRetry<any>(() => videoAI.models.generateVideos({
            model: 'veo-3.1-fast-generate-preview',
            prompt,
            config: {
                numberOfVideos: 1,
                resolution: '720p',
                aspectRatio,
            }
        }));

        updateProgress("Video generation started. This can take several minutes...");
        while (!operation.done) {
            await new Promise(resolve => setTimeout(resolve, 10000)); // Poll every 10 seconds
            updateProgress("Checking video status...");
            operation = await callWithRetry<any>(() => videoAI.operations.getVideosOperation({ operation }));
        }

        const downloadLink = operation.response?.generatedVideos?.[0]?.video?.uri;
        if (!downloadLink) {
            throw new Error("Video generation completed, but no download link was found.");
        }

        updateProgress("Video is ready! Downloading asset...");
        // The response.body contains the MP4 bytes. You must append an API key when fetching from the download link.
        const response = await fetch(`${downloadLink}&key=${process.env.API_KEY}`);
        if (!response.ok) {
            const errorText = await response.text();
            console.error("Failed to download video:", errorText);
            throw new Error(`Failed to download the generated video. Status: ${response.status}`);
        }
        const videoBlob = await response.blob();
        updateProgress("Download complete.");
        return URL.createObjectURL(videoBlob);

    } catch (error) {
        console.error(`Error generating video for ${channelName}:`, error);
        // Rethrow with a more user-friendly message
        const errorMessage = error instanceof Error ? error.message : String(error);
        throw new Error(`Failed to generate video for ${channelName}. ${errorMessage}`);
    }
};

// --- Live API Transcription Functions ---

function encode(bytes: Uint8Array) {
  let binary = '';
  const len = bytes.byteLength;
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

export function createBlob(data: Float32Array): Blob {
  const l = data.length;
  const int16 = new Int16Array(l);
  for (let i = 0; i < l; i++) {
    int16[i] = data[i] * 32768;
  }
  return {
    data: encode(new Uint8Array(int16.buffer)),
    mimeType: 'audio/pcm;rate=16000',
  };
}

// @google/genai Coding Guidelines: Do not use `LiveSession` as an explicit return type. The type should be inferred.
export const startTranscriptionSession = (
    onTranscriptionUpdate: (transcription: string, isFinal: boolean) => void
) => {
    let currentTranscription = '';
    
    const liveAI = new GoogleGenAI({ apiKey: process.env.API_KEY });
    
    const sessionPromise = liveAI.live.connect({
        model: 'gemini-2.5-flash-native-audio-preview-09-2025',
        callbacks: {
            onopen: () => console.debug('Live session opened'),
            onmessage: (message: LiveServerMessage) => {
                if (message.serverContent?.inputTranscription) {
                    const text = message.serverContent.inputTranscription.text;
                    currentTranscription += text;
                    onTranscriptionUpdate(currentTranscription, false);
                }
                if (message.serverContent?.turnComplete) {
                    onTranscriptionUpdate(currentTranscription, true);
                    currentTranscription = '';
                }
            },
            onerror: (e: ErrorEvent) => {
                console.error('Live session error:', e);
            },
            onclose: (e: CloseEvent) => {
                console.debug('Live session closed');
            },
        },
        config: {
            inputAudioTranscription: {},
            responseModalities: [Modality.AUDIO],
        },
    });

    return sessionPromise;
};

// --- Media Plan Functions ---

export const generateMediaPlan = async (inputs: MediaPlanInputs): Promise<string> => {
    const systemInstruction = `You are an expert media planner and digital marketing strategist. Your role is to create comprehensive, data-driven media plans based on the AI-prescribed campaign strategy. You analyze competitive landscapes, industry benchmarks, geographic factors, and keyword opportunities to recommend optimal budget allocations across channels.
Structure all media plans using clear headers, tables where appropriate, and visual hierarchy. Use this format:
# MEDIA PLAN: [Campaign Name]
Generated: [Date]

## 💰 BUDGET OVERVIEW
**Recommended Total Budget:** $XXX,XXX
**Campaign Duration:** [Timeframe]
**Daily Average:** $X,XXX

### Budget Rationale
[2-3 paragraphs explaining how you arrived at this budget based on competitive analysis, sector benchmarks, geography, and keywords]

---

## 📊 CHANNEL ALLOCATION

| Channel | Budget | % | Projected Impressions | Est. CPC/CPM | Expected Results |
|---------|--------|---|----------------------|--------------|------------------|
| [Channel] | $XX,XXX | XX% | X.XM | $X.XX | XXX conversions |

---

## 🎯 DETAILED CHANNEL STRATEGIES

### 1. [CHANNEL NAME] - $XX,XXX (XX%)

**Why This Channel:**
[Strategic rationale]

**Targeting Strategy:**
- Audience: [Details]
- Demographics: [Details]
- Interests/Behaviors: [Details]
- Geographic: [Details]

**Expected Performance:**
- Impressions: XXX,XXX
- Clicks: XX,XXX
- CTR: X.X%
- Conversions: XXX
- CPA: $XXX
- ROAS: X:1

**Creative Requirements:**
- [Ad format 1]: [Specs]
- [Ad format 2]: [Specs]

**Flight Schedule:**
[Timeline details]

[Repeat for each channel]

---

## 📅 CAMPAIGN PACING

### Monthly Breakdown
| Month | Budget | Focus |
|-------|--------|-------|
| [Month 1] | $XX,XXX | Launch & Testing |
| [Month 2] | $XX,XXX | Optimization |

---

## 🔄 OPTIMIZATION FRAMEWORK

**Testing Budget:** $X,XXX (10% reserve)
**Reallocation Triggers:**
- If CPA exceeds $XXX: [Action]
- If ROAS below X:1: [Action]

---

## ✅ SUCCESS METRICS & KPIs

- Total Reach: X.XM people
- Frequency: X.X
- Total Conversions: X,XXX
- Overall CPA: $XXX
- Projected ROAS: X:1
- Brand Lift: +XX%

---

**💡 Ready to adjust the budget? Just let me know your new total budget, and I'll recalculate the entire plan!**`;

    const prompt = `Generate a media plan for the "${inputs.campaignName}" campaign based on the following context:
- Campaign objectives and KPIs: ${inputs.objectives}
- Target audience demographics and psychographics: ${inputs.audience}
- Geographic markets: ${inputs.geo}
- Industry/sector: ${inputs.industry}
- Product/service category: ${inputs.product}
- Key competitors: ${inputs.competitors}
- Primary keywords and search terms: ${inputs.keywords}
- Campaign duration: ${inputs.duration}
`;
    
    try {
        const response = await callWithRetry<GenerateContentResponse>(() => ai.models.generateContent({
            model: 'gemini-2.5-pro',
            contents: prompt,
            config: {
                systemInstruction,
                temperature: 0.3,
            },
        }));
        return response.text || '';
    } catch (error) {
        console.error("Error calling Gemini API for media plan:", error);
        if (error instanceof Error && error.message.includes('429')) {
            throw new Error("Quota exceeded for media plan generation. Please try again shortly.");
        }
        throw new Error("Failed to generate media plan. The AI model may be experiencing issues.");
    }
};

export const regenerateMediaPlanWithNewBudget = async (
    originalPlan: string,
    newBudget: string,
    constraints: string
): Promise<string> => {
    const systemInstruction = `You are an expert media planner. Your task is to update an existing media plan with a new budget, following the user's constraints.
When a user changes the budget:
- Recalculate all metrics based on new allocations.
- If DECREASED: Prioritize highest-ROI channels, reduce or eliminate lower performers.
- If INCREASED: Expand reach in existing channels, add new channels if strategic.
- Maintain strategic integrity and preserve testing budgets.
- Output the updated plan using the specified "UPDATED MEDIA PLAN" format.
- Provide clear changes and an impact analysis.
- Your entire response should be the updated markdown plan.

UPDATED MEDIA PLAN FORMAT:
UPDATED MEDIA PLAN
Original Budget: $[OLD] → New Budget: $[NEW] ([+/-]X%)

CHANGES SUMMARY:
✓ Channels Added: [List]
✗ Channels Removed: [List]
↑ Increased Allocation: [List with amounts]
↓ Decreased Allocation: [List with amounts]

[Full updated media plan with same structure as original]

IMPACT ANALYSIS:
- Expected reach change: [+/-]X%
- Projected conversion change: [+/-]X%
- Risk assessment: [Analysis of reduced/increased budget implications]
`;
    
    const prompt = `
Here is the original media plan:
---
${originalPlan}
---

Please update this plan with the following changes:
- New total budget: ${newBudget}
- Any channel priorities or constraints: ${constraints || 'None'}

Follow the specified "UPDATED MEDIA PLAN" output format precisely, including a changes summary, impact analysis, and the full recalculated plan.
`;

    try {
        const response = await callWithRetry<GenerateContentResponse>(() => ai.models.generateContent({
            model: 'gemini-2.5-pro',
            contents: prompt,
            config: {
                systemInstruction,
                temperature: 0.3,
            },
        }));
        return response.text || '';
    } catch (error) {
        console.error("Error calling Gemini API for media plan regeneration:", error);
        if (error instanceof Error && error.message.includes('429')) {
            throw new Error("Quota exceeded for media plan regeneration. Please try again shortly.");
        }
        throw new Error("Failed to regenerate media plan. The AI model may be experiencing issues.");
    }
};
