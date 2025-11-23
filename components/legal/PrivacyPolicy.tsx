import React from 'react';

interface PrivacyPolicyProps {
  onClose: () => void;
}

export const PrivacyPolicy: React.FC<PrivacyPolicyProps> = ({ onClose }) => {
  return (
    <div className="fixed inset-0 z-50 bg-slate-50 overflow-y-auto animate-fade-in">
      <div className="sticky top-0 bg-white/80 backdrop-blur-md border-b border-slate-200 px-6 py-4 flex justify-between items-center z-10">
        <h2 className="text-xl font-bold text-slate-900">Privacy Policy</h2>
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
          
          <h3>1. Introduction</h3>
          <p>
            At CampaignGen, we take your privacy seriously. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you visit our website and use our SaaS application.
          </p>

          <h3>2. Information We Collect</h3>
          <p>
            We collect information that you provide directly to us:
          </p>
          <ul>
            <li><strong>Personal Data:</strong> Name, email address, and profile photo when you register.</li>
            <li><strong>Billing Data:</strong> Payment information and billing address (processed by our secure payment providers).</li>
            <li><strong>Campaign Data:</strong> Inputs, prompts, and generated assets you create using the Service.</li>
          </ul>

          <h3>3. How We Use Your Information</h3>
          <p>
            We use the information we collect to:
          </p>
          <ul>
            <li>Provide, maintain, and improve our Service.</li>
            <li>Process transactions and manage your subscription.</li>
            <li>Generate marketing content tailored to your inputs via AI models.</li>
            <li>Send you technical notices, updates, security alerts, and support messages.</li>
            <li>Monitor and analyze trends, usage, and activities in connection with our Service.</li>
          </ul>

          <h3>4. Sharing of Information</h3>
          <p>
            We do not sell your personal data. We may share information with:
          </p>
          <ul>
            <li><strong>Service Providers:</strong> Third-party vendors who need access to such information to carry out work on our behalf (e.g., payment processing, AI model inference, database hosting).</li>
            <li><strong>Legal Requirements:</strong> If required to do so by law or in response to valid requests by public authorities.</li>
          </ul>

          <h3>5. Data Security</h3>
          <p>
            We use administrative, technical, and physical security measures to help protect your personal information. While we have taken reasonable steps to secure the personal information you provide to us, please be aware that despite our efforts, no security measures are perfect or impenetrable, and no method of data transmission can be guaranteed against any interception or other type of misuse.
          </p>

          <h3>6. Your Data Rights</h3>
          <p>
            Depending on your location, you may have rights regarding your personal data, including the right to access, correct, delete, or restrict the use of your data. You can manage your account settings directly within the application or contact us for assistance.
          </p>

          <h3>7. Third-Party Links</h3>
          <p>
            The Service may contain links to other websites or services that are not operated by us. If you click a third-party link, you will be directed to that third party's site. We strongly advise you to review the Privacy Policy of every site you visit.
          </p>

          <h3>8. Contact Us</h3>
          <p>
            If you have questions or comments about this Privacy Policy, please contact us at privacy@campaigngen.com.
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