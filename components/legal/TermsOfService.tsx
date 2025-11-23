import React from 'react';

interface TermsOfServiceProps {
  onClose: () => void;
}

export const TermsOfService: React.FC<TermsOfServiceProps> = ({ onClose }) => {
  return (
    <div className="fixed inset-0 z-50 bg-slate-50 overflow-y-auto animate-fade-in">
      <div className="sticky top-0 bg-white/80 backdrop-blur-md border-b border-slate-200 px-6 py-4 flex justify-between items-center z-10">
        <h2 className="text-xl font-bold text-slate-900">Terms of Service</h2>
        <button 
          onClick={onClose}
          className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm font-bold rounded-full transition-colors"
        >
          Close
        </button>
      </div>
      
      <div className="max-w-3xl mx-auto px-6 py-12">
        <div className="prose prose-slate prose-lg max-w-none">
          <p className="text-slate-500 text-sm font-bold uppercase tracking-wider mb-8">Last Updated: February 26, 2025</p>
          
          <h3>1. Acceptance of Terms</h3>
          <p>
            By accessing and using CampaignGen ("the Service"), you agree to be bound by these Terms of Service. If you do not agree to these terms, please do not use the Service.
          </p>

          <h3>2. Description of Service</h3>
          <p>
            CampaignGen is an AI-powered marketing orchestration platform that helps users generate strategies, content assets, and media plans. We provide various subscription tiers (Individual, Small Team, Agency) with specific usage quotas.
          </p>

          <h3>3. User Accounts</h3>
          <p>
            You are responsible for maintaining the security of your account and password. CampaignGen cannot and will not be liable for any loss or damage from your failure to comply with this security obligation. You are responsible for all content posted and activity that occurs under your account.
          </p>

          <h3>4. AI-Generated Content</h3>
          <p>
            The Service utilizes Artificial Intelligence to generate content. You acknowledge that:
          </p>
          <ul>
            <li>AI output may not always be accurate, unique, or suitable for your specific needs.</li>
            <li>You are responsible for reviewing and verifying all generated content before publication.</li>
            <li>CampaignGen does not claim copyright ownership over the content you generate, subject to applicable laws.</li>
          </ul>

          <h3>5. Acceptable Use</h3>
          <p>
            You agree not to use the Service to:
          </p>
          <ul>
            <li>Generate content that is unlawful, harmful, threatening, abusive, or discriminatory.</li>
            <li>Send unsolicited bulk emails (SPAM).</li>
            <li>Violate any third-party intellectual property rights.</li>
            <li>Reverse engineer or attempt to extract the source code of the Service.</li>
          </ul>

          <h3>6. Subscription and Billing</h3>
          <p>
            The Service is billed on a subscription basis (monthly or annual). You agree to pay the fees associated with your selected plan. Failure to pay may result in the suspension or termination of your account. We reserve the right to modify pricing with reasonable notice.
          </p>

          <h3>7. Termination</h3>
          <p>
            We may terminate or suspend your account immediately, without prior notice or liability, for any reason whatsoever, including without limitation if you breach the Terms.
          </p>

          <h3>8. Limitation of Liability</h3>
          <p>
            In no event shall CampaignGen, nor its directors, employees, partners, agents, suppliers, or affiliates, be liable for any indirect, incidental, special, consequential or punitive damages, including without limitation, loss of profits, data, use, goodwill, or other intangible losses, resulting from your access to or use of or inability to access or use the Service.
          </p>

          <h3>9. Changes</h3>
          <p>
            We reserve the right, at our sole discretion, to modify or replace these Terms at any time. By continuing to access or use our Service after those revisions become effective, you agree to be bound by the revised terms.
          </p>

          <h3>10. Contact Us</h3>
          <p>
            If you have any questions about these Terms, please contact us at support@campaigngen.com.
          </p>
        </div>
        
        <div className="mt-12 pt-8 border-t border-slate-200 flex justify-center">
            <button 
                onClick={onClose}
                className="px-8 py-3 bg-slate-900 text-white font-bold rounded-full hover:bg-slate-800 transition-all shadow-lg"
            >
                I Understand
            </button>
        </div>
      </div>
    </div>
  );
};