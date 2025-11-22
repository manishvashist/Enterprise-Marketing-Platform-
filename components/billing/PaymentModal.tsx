
import React, { useState } from 'react';
import { User, SubscriptionPlan, BillingType } from '../../types';
import { subscriptionService } from '../../services/subscriptionService';
import { CreditCardIcon } from '../icons/CreditCardIcon';

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  plan: SubscriptionPlan;
  billingType: BillingType;
  user: User;
  onSuccess: (updatedUser: User) => void;
}

const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
    }).format(price);
};

export const PaymentModal: React.FC<PaymentModalProps> = ({ isOpen, onClose, plan, billingType, user, onSuccess }) => {
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const isAnnual = billingType === 'annual';
    const amountDue = isAnnual ? plan.annualPrice : plan.monthlyPrice;
    const periodString = isAnnual ? 'year' : 'month';

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError(null);
        
        try {
            // Simulate payment processing
            await new Promise(resolve => setTimeout(resolve, 2000));
            
            // On success, create subscription
            const updatedUser = await subscriptionService.createSubscription(user.id, plan.planCode, billingType);
            onSuccess(updatedUser);

        } catch (err) {
            setError(err instanceof Error ? err.message : "An unexpected error occurred.");
            setIsLoading(false);
        }
    };
    
    if (!isOpen) return null;

    return (
        <div 
          className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm"
          onClick={onClose}
        >
          <div 
            className="bg-white rounded-xl shadow-2xl w-full max-w-md border border-slate-200 animate-fade-in-up"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6 border-b border-slate-200">
              <h2 className="text-xl font-bold text-slate-900">Complete Your Purchase</h2>
              <p className="text-slate-500 mt-1 text-sm">You are subscribing to the <span className="font-bold text-indigo-600">{plan.name}</span> plan.</p>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6">
                <div className="bg-slate-50 rounded-lg p-4 mb-6 border border-slate-200">
                    <div className="flex justify-between items-center">
                        <span className="text-slate-600 font-medium">Amount Due Today</span>
                        <span className="text-2xl font-bold text-slate-900">{formatPrice(amountDue)}</span>
                    </div>
                    <p className="text-xs text-slate-500 text-right mt-1">Billed per {periodString}</p>
                </div>
                
                {/* Simulated Payment Form */}
                <div className="space-y-4">
                    <div>
                        <label htmlFor="card-number" className="block text-sm font-medium text-slate-700 mb-1">Card Number</label>
                        <div className="relative">
                            <input type="text" id="card-number" placeholder="•••• •••• •••• 4242" className="w-full p-2.5 bg-white border border-slate-300 rounded-md text-slate-900 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-shadow" disabled />
                            <CreditCardIcon className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                        </div>
                    </div>
                    <div className="flex gap-4">
                        <div className="flex-1">
                            <label htmlFor="expiry" className="block text-sm font-medium text-slate-700 mb-1">Expiry Date</label>
                            <input type="text" id="expiry" placeholder="MM / YY" className="w-full p-2.5 bg-white border border-slate-300 rounded-md text-slate-900 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-shadow" disabled />
                        </div>
                        <div className="flex-1">
                            <label htmlFor="cvc" className="block text-sm font-medium text-slate-700 mb-1">CVC</label>
                            <input type="text" id="cvc" placeholder="•••" className="w-full p-2.5 bg-white border border-slate-300 rounded-md text-slate-900 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-shadow" disabled />
                        </div>
                    </div>
                </div>
                
                {error && <p className="text-red-600 text-sm text-center mt-4 bg-red-50 p-2 rounded-md">{error}</p>}
                
                <p className="text-xs text-slate-400 mt-6 text-center">
                    <svg className="w-3 h-3 inline mr-1" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" /></svg>
                    Secure encrypted payment
                </p>

                <div className="mt-4">
                    <button type="submit" disabled={isLoading} className="w-full px-6 py-3 bg-indigo-600 text-white font-bold rounded-lg hover:bg-indigo-700 disabled:bg-slate-300 disabled:cursor-not-allowed transition-all flex items-center justify-center shadow-lg shadow-indigo-600/20">
                        {isLoading ? (
                            <>
                               <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                Processing...
                            </>
                        ) : `Subscribe for ${formatPrice(amountDue)}`}
                    </button>
                </div>
            </form>
            <div className="p-4 bg-slate-50 border-t border-slate-200 text-center rounded-b-xl">
                <button onClick={onClose} disabled={isLoading} className="text-sm text-slate-500 hover:text-slate-800 font-medium">
                    Cancel Transaction
                </button>
            </div>
          </div>
        </div>
    );
};
