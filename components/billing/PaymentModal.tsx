
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
          className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4"
          onClick={onClose}
        >
          <div 
            className="bg-gray-800 rounded-lg shadow-xl w-full max-w-md border border-gray-700 animate-fade-in-up"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6 border-b border-gray-700">
              <h2 className="text-xl font-bold text-white">Complete Your Purchase</h2>
              <p className="text-gray-400 mt-1 text-sm">You are subscribing to the <span className="font-semibold text-indigo-300">{plan.name}</span> plan.</p>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6">
                <div className="bg-gray-900/70 rounded-lg p-4 mb-6">
                    <div className="flex justify-between items-center">
                        <span className="text-gray-300">Amount Due Today</span>
                        <span className="text-2xl font-bold text-white">{formatPrice(amountDue)}</span>
                    </div>
                    <p className="text-xs text-gray-500 text-right">Billed per {periodString}</p>
                </div>
                
                {/* Simulated Payment Form */}
                <div className="space-y-4">
                    <div>
                        <label htmlFor="card-number" className="block text-sm font-medium text-gray-300 mb-1">Card Number</label>
                        <div className="relative">
                            <input type="text" id="card-number" placeholder="•••• •••• •••• 4242" className="w-full p-2 bg-gray-900 border border-gray-600 rounded-md text-gray-200" disabled />
                            <CreditCardIcon className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                        </div>
                    </div>
                    <div className="flex gap-4">
                        <div className="flex-1">
                            <label htmlFor="expiry" className="block text-sm font-medium text-gray-300 mb-1">Expiry Date</label>
                            <input type="text" id="expiry" placeholder="MM / YY" className="w-full p-2 bg-gray-900 border border-gray-600 rounded-md text-gray-200" disabled />
                        </div>
                        <div className="flex-1">
                            <label htmlFor="cvc" className="block text-sm font-medium text-gray-300 mb-1">CVC</label>
                            <input type="text" id="cvc" placeholder="•••" className="w-full p-2 bg-gray-900 border border-gray-600 rounded-md text-gray-200" disabled />
                        </div>
                    </div>
                </div>
                
                {error && <p className="text-red-400 text-sm text-center mt-4">{error}</p>}
                
                <p className="text-xs text-gray-500 mt-6">This is a simulated payment form. Click below to confirm your subscription.</p>

                <div className="mt-4">
                    <button type="submit" disabled={isLoading} className="w-full px-6 py-3 bg-indigo-600 text-white font-semibold rounded-md hover:bg-indigo-700 disabled:bg-gray-600 disabled:cursor-not-allowed transition-all flex items-center justify-center">
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
          </div>
        </div>
    );
};
