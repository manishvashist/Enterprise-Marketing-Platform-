
import { collection, doc, setDoc, addDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from './firebaseClient';

export const seedDatabase = async () => {
  const currentUser = auth.currentUser;

  if (!currentUser) {
    throw new Error('No user signed in. Operations requiring authentication are restricted.');
  }

  const uid = currentUser.uid;
  console.log(`Starting database seed for user: ${uid}`);

  try {
    // 1. Create/Update a User Profile (users collection)
    await setDoc(doc(db, 'users', uid), {
      email: currentUser.email,
      display_name: currentUser.displayName || null,
      photo_url: currentUser.photoURL || null,
      role: 'Admin', // Setting to Admin for the seeder to enable full access
      subscription_tier: 'pro',
      credits_remaining: 100,
      created_at: serverTimestamp(),
      last_login: serverTimestamp(),
      preferences: {
        default_tone: 'professional',
        brand_colors: ['#EA580C', '#FFFFFF']
      }
    }, { merge: true });
    console.log('User profile created/updated successfully.');

    // 2. Create a new Campaign (campaigns collection)
    const campaignRef = await addDoc(collection(db, 'campaigns'), {
      user_id: uid,
      name: 'Q3 Product Launch Strategy',
      objective: 'Maximize market penetration for new SaaS tool',
      target_audience: 'CTOs and Engineering Managers in North America',
      status: 'draft',
      platforms: ['linkedin', 'email', 'twitter'],
      is_archived: false,
      description: 'A comprehensive launch campaign for the new Q3 feature set.',
      audienceQuery: 'Tech leaders in Series B startups',
      estimatedSize: 15000,
      keyAttributes: ['Tech Savvy', 'Decision Maker', 'Budget Holder'],
      kpis: ['Signups', 'Demo Requests'],
      strategy: {
        recommendations: 'Focus on thought leadership and technical deep dives.',
        budgetAllocation: [
            { channel: 'LinkedIn', percentage: 60, rationale: 'High B2B engagement' },
            { channel: 'Email', percentage: 40, rationale: 'Direct conversion' }
        ],
        timing: {
            launchDate: '2024-09-01',
            duration: '4 weeks',
            rationale: 'Aligns with fiscal quarter start'
        }
      },
      governancePlan: {
        frequencyManagement: {
            globalCaps: { messagesPerWeek: 3, rationale: 'Prevent fatigue' },
            channelSpecificCaps: [],
            intelligentSuppression: { enabled: true, description: 'AI suppression active' }
        },
        complianceAndConsent: {
            primaryRegulations: ['GDPR'],
            consentModel: 'Double Opt-In',
            privacyPolicyLink: 'https://example.com/privacy',
            complianceChecklist: []
        },
        aiDrivenDeliverability: {
            senderReputationStrategy: 'Warm up IP',
            listHygienePlan: 'Remove bounces',
            predictiveSpamCheck: { simulatedScore: 'Low', recommendations: [] }
        }
      },
      channelSelection: {
        channelCategories: [],
        executionPriority: [],
        budgetAllocationSuggestion: []
      },
      nodes: [],
      created_at: serverTimestamp(),
      updated_at: serverTimestamp(),
      generated_content: { email_subject: null, email_body: null, social_posts: [], ad_copy: null }
    });
    console.log('New campaign created with ID:', campaignRef.id);

    // 3. Add an Interaction to a Campaign (interactions subcollection)
    await addDoc(collection(db, 'campaigns', campaignRef.id, 'interactions'), {
      prompt: 'Draft an engaging LinkedIn post for the new product.',
      response: 'Exciting news! We are launching our new Q3 features today. #SaaS #Tech',
      timestamp: serverTimestamp()
    });
    console.log('Interaction added to campaign subcollection.');

    // 4. Create a Template (templates collection)
    await addDoc(collection(db, 'templates'), {
      name: 'B2B SaaS Launch Template',
      description: 'A proven framework for launching B2B software products.',
      industry: 'Technology',
      structure_prompt: 'Generate a 4-week email sequence and LinkedIn content plan.',
      is_public: true,
      created_by: uid,
      usage_count: 0
    });
    console.log('New template created successfully.');

    // 5. Record Analytics Data (analytics collection)
    await addDoc(collection(db, 'analytics'), {
      campaign_id: campaignRef.id,
      user_id: uid,
      platform: 'linkedin',
      metric_type: 'impressions',
      value: 1500,
      recorded_at: serverTimestamp()
    });
    console.log('Analytics data recorded successfully.');

    return "Database seeded successfully! Check your Firestore console.";

  } catch (error: any) {
    console.error("Error seeding database:", error);
    throw new Error(`Seeding failed: ${error.message}`);
  }
};
