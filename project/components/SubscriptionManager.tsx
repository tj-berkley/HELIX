import React, { useState, useEffect } from 'react';
import { Check, X, CreditCard, Calendar, AlertCircle, TrendingUp, Zap } from 'lucide-react';

interface SubscriptionPlan {
  id: string;
  name: string;
  displayName: string;
  monthlyPrice: number;
  annualPrice: number;
  features: string[];
  limits: {
    leads: string;
    users: string;
    sms: string;
    emails: string;
    aiTokens: string;
    storage: string;
  };
  popular?: boolean;
}

interface UserSubscription {
  id: string;
  plan_name: string;
  status: string;
  billing_cycle: string;
  price: number;
  trial_end_date?: string;
  current_period_end?: string;
  cancelled_at?: string;
}

const PLANS: SubscriptionPlan[] = [
  {
    id: 'starter',
    name: 'starter',
    displayName: 'Starter',
    monthlyPrice: 97,
    annualPrice: 970,
    features: [
      '2,000 Leads',
      '2 Team Users',
      '2,000 SMS/month',
      '20,000 Emails/month',
      '200K AI Tokens/month',
      '50GB Storage',
      'CRM & Pipeline',
      'Email & SMS',
      'Basic Automation',
      'Calendar Sync',
      'Mobile App Access',
    ],
    limits: {
      leads: '2,000',
      users: '2',
      sms: '2,000/mo',
      emails: '20,000/mo',
      aiTokens: '200K/mo',
      storage: '50GB',
    },
  },
  {
    id: 'professional',
    name: 'professional',
    displayName: 'Professional',
    monthlyPrice: 197,
    annualPrice: 1970,
    popular: true,
    features: [
      '10,000 Leads',
      '5 Team Users',
      '5,000 SMS/month',
      '50,000 Emails/month',
      '500K AI Tokens/month',
      '200GB Storage',
      'Everything in Starter',
      'Advanced Automation',
      'AI Webinar Assistant',
      'Brand Voice AI',
      'Priority Support',
      'API Access',
    ],
    limits: {
      leads: '10,000',
      users: '5',
      sms: '5,000/mo',
      emails: '50,000/mo',
      aiTokens: '500K/mo',
      storage: '200GB',
    },
  },
  {
    id: 'enterprise',
    name: 'enterprise',
    displayName: 'Enterprise',
    monthlyPrice: 497,
    annualPrice: 4970,
    features: [
      'Unlimited Leads',
      'Unlimited Users',
      '25,000 SMS/month',
      'Unlimited Emails',
      '5M AI Tokens/month',
      '1TB Storage',
      'Everything in Professional',
      'White-Label Access',
      'Custom Integrations',
      'Dedicated Support',
      'Custom AI Training',
      'SLA Guarantee',
    ],
    limits: {
      leads: 'Unlimited',
      users: 'Unlimited',
      sms: '25,000/mo',
      emails: 'Unlimited',
      aiTokens: '5M/mo',
      storage: '1TB',
    },
  },
];

const SubscriptionManager: React.FC = () => {
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'annual'>('monthly');
  const [currentSubscription, setCurrentSubscription] = useState<UserSubscription | null>(null);
  const [loading, setLoading] = useState(true);
  const [processingPlan, setProcessingPlan] = useState<string | null>(null);

  useEffect(() => {
    loadSubscription();
  }, []);

  const loadSubscription = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/subscription/current', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setCurrentSubscription(data.subscription);
      }
    } catch (error) {
      console.error('Failed to load subscription:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubscribe = async (plan: SubscriptionPlan) => {
    try {
      setProcessingPlan(plan.id);

      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
      const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

      if (!supabaseUrl || !supabaseKey) {
        throw new Error('Supabase configuration missing');
      }

      const userEmail = localStorage.getItem('userEmail') || 'user@example.com';
      const userId = localStorage.getItem('userId') || 'temp-user-id';

      const response = await fetch(`${supabaseUrl}/functions/v1/stripe-checkout`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${supabaseKey}`,
          'apikey': supabaseKey,
        },
        body: JSON.stringify({
          planName: plan.name,
          billingCycle: billingCycle,
          userEmail: userEmail,
          userId: userId,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to create checkout session');
      }

      const data = await response.json();

      if (data.checkoutUrl) {
        window.location.href = data.checkoutUrl;
      } else {
        throw new Error('No checkout URL returned');
      }
    } catch (error) {
      console.error('Subscription error:', error);
      alert(`Failed to start subscription: ${error.message}`);
    } finally {
      setProcessingPlan(null);
    }
  };

  const handleCancelSubscription = async () => {
    if (!confirm('Are you sure you want to cancel your subscription? You will continue to have access until the end of your billing period.')) {
      return;
    }

    try {
      const response = await fetch('/api/subscription/cancel', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        alert('Subscription cancelled successfully. You will have access until the end of your billing period.');
        loadSubscription();
      } else {
        throw new Error('Failed to cancel subscription');
      }
    } catch (error) {
      console.error('Cancel error:', error);
      alert('Failed to cancel subscription. Please contact support.');
    }
  };

  const getStatusBadge = (status: string) => {
    const badges = {
      trial: { bg: 'bg-blue-100', text: 'text-blue-700', label: 'Trial' },
      active: { bg: 'bg-emerald-100', text: 'text-emerald-700', label: 'Active' },
      cancelled: { bg: 'bg-gray-100', text: 'text-gray-700', label: 'Cancelled' },
      past_due: { bg: 'bg-amber-100', text: 'text-amber-700', label: 'Past Due' },
      expired: { bg: 'bg-red-100', text: 'text-red-700', label: 'Expired' },
    };

    const badge = badges[status as keyof typeof badges] || badges.active;

    return (
      <span className={`px-3 py-1 rounded-full text-xs font-bold ${badge.bg} ${badge.text}`}>
        {badge.label}
      </span>
    );
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    });
  };

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center bg-slate-50">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-600 font-medium">Loading subscription...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto bg-slate-50 p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        <div className="text-center space-y-4 pb-8">
          <h1 className="text-5xl font-black text-slate-900">Choose Your Plan</h1>
          <p className="text-xl text-slate-600 max-w-2xl mx-auto">
            Scale your business with AI-powered automation and intelligent workflows
          </p>

          <div className="inline-flex items-center bg-white rounded-full p-1 shadow-sm border border-slate-200">
            <button
              onClick={() => setBillingCycle('monthly')}
              className={`px-6 py-2 rounded-full text-sm font-bold transition-all ${
                billingCycle === 'monthly'
                  ? 'bg-slate-900 text-white'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Monthly
            </button>
            <button
              onClick={() => setBillingCycle('annual')}
              className={`px-6 py-2 rounded-full text-sm font-bold transition-all ${
                billingCycle === 'annual'
                  ? 'bg-slate-900 text-white'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Annual
              <span className="ml-2 px-2 py-0.5 bg-emerald-500 text-white text-xs rounded-full">
                Save 20%
              </span>
            </button>
          </div>
        </div>

        {currentSubscription && (
          <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-sm">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center">
                  <CreditCard className="w-6 h-6 text-indigo-600" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-900">
                    Current Plan: {currentSubscription.plan_name.charAt(0).toUpperCase() + currentSubscription.plan_name.slice(1)}
                  </h3>
                  <p className="text-sm text-slate-600">
                    ${currentSubscription.price}/{currentSubscription.billing_cycle === 'monthly' ? 'month' : 'year'}
                  </p>
                </div>
              </div>

              <div className="flex items-center space-x-4">
                {getStatusBadge(currentSubscription.status)}

                {currentSubscription.status === 'trial' && currentSubscription.trial_end_date && (
                  <div className="flex items-center space-x-2 text-sm text-slate-600">
                    <Calendar className="w-4 h-4" />
                    <span>Trial ends {formatDate(currentSubscription.trial_end_date)}</span>
                  </div>
                )}

                {currentSubscription.status === 'active' && currentSubscription.current_period_end && (
                  <div className="flex items-center space-x-2 text-sm text-slate-600">
                    <Calendar className="w-4 h-4" />
                    <span>Renews {formatDate(currentSubscription.current_period_end)}</span>
                  </div>
                )}

                {currentSubscription.status === 'active' && !currentSubscription.cancelled_at && (
                  <button
                    onClick={handleCancelSubscription}
                    className="px-4 py-2 bg-red-50 text-red-600 rounded-lg text-sm font-bold hover:bg-red-100 transition-colors"
                  >
                    Cancel Plan
                  </button>
                )}
              </div>
            </div>

            {currentSubscription.status === 'past_due' && (
              <div className="mt-4 p-4 bg-amber-50 border border-amber-200 rounded-lg flex items-start space-x-3">
                <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-bold text-amber-900">Payment Failed</p>
                  <p className="text-sm text-amber-700">
                    Your last payment failed. Please update your payment method to avoid service interruption.
                  </p>
                </div>
              </div>
            )}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {PLANS.map((plan) => {
            const price = billingCycle === 'monthly' ? plan.monthlyPrice : plan.annualPrice;
            const monthlyEquivalent = billingCycle === 'annual' ? plan.annualPrice / 12 : plan.monthlyPrice;
            const isCurrentPlan = currentSubscription?.plan_name === plan.name;

            return (
              <div
                key={plan.id}
                className={`bg-white rounded-3xl p-8 border-2 transition-all ${
                  plan.popular
                    ? 'border-indigo-500 shadow-2xl shadow-indigo-500/20 scale-105'
                    : 'border-slate-200 hover:border-slate-300'
                }`}
              >
                {plan.popular && (
                  <div className="inline-flex items-center space-x-2 px-3 py-1 bg-indigo-100 text-indigo-700 rounded-full text-xs font-bold mb-4">
                    <TrendingUp className="w-3 h-3" />
                    <span>Most Popular</span>
                  </div>
                )}

                <h3 className="text-2xl font-black text-slate-900 mb-2">{plan.displayName}</h3>

                <div className="mb-6">
                  <div className="flex items-baseline">
                    <span className="text-5xl font-black text-slate-900">${Math.round(monthlyEquivalent)}</span>
                    <span className="text-slate-600 ml-2">/month</span>
                  </div>
                  {billingCycle === 'annual' && (
                    <p className="text-sm text-slate-500 mt-1">
                      Billed ${price} annually
                    </p>
                  )}
                </div>

                <button
                  onClick={() => handleSubscribe(plan)}
                  disabled={isCurrentPlan || processingPlan === plan.id}
                  className={`w-full py-3 rounded-xl font-bold transition-all mb-6 ${
                    isCurrentPlan
                      ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                      : plan.popular
                      ? 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-lg'
                      : 'bg-slate-900 text-white hover:bg-black'
                  }`}
                >
                  {processingPlan === plan.id ? (
                    <span className="flex items-center justify-center">
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                      Processing...
                    </span>
                  ) : isCurrentPlan ? (
                    'Current Plan'
                  ) : (
                    'Get Started'
                  )}
                </button>

                <div className="space-y-3 mb-6">
                  <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                    Key Limits
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div>
                      <div className="text-slate-500">Leads</div>
                      <div className="font-bold text-slate-900">{plan.limits.leads}</div>
                    </div>
                    <div>
                      <div className="text-slate-500">Users</div>
                      <div className="font-bold text-slate-900">{plan.limits.users}</div>
                    </div>
                    <div>
                      <div className="text-slate-500">SMS</div>
                      <div className="font-bold text-slate-900">{plan.limits.sms}</div>
                    </div>
                    <div>
                      <div className="text-slate-500">Storage</div>
                      <div className="font-bold text-slate-900">{plan.limits.storage}</div>
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                    Features
                  </div>
                  <ul className="space-y-2">
                    {plan.features.map((feature, index) => (
                      <li key={index} className="flex items-start space-x-2 text-sm">
                        <Check className="w-5 h-5 text-emerald-500 flex-shrink-0" />
                        <span className="text-slate-700">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            );
          })}
        </div>

        <div className="bg-slate-900 rounded-3xl p-12 text-white text-center">
          <div className="max-w-3xl mx-auto space-y-6">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-indigo-500 rounded-full mb-4">
              <Zap className="w-8 h-8" />
            </div>
            <h2 className="text-3xl font-black">Need a Custom Solution?</h2>
            <p className="text-lg text-slate-300">
              Enterprise plans with custom pricing, dedicated infrastructure, and white-label options available.
              Contact our team for a personalized quote.
            </p>
            <button className="px-8 py-3 bg-white text-slate-900 rounded-xl font-bold hover:bg-slate-100 transition-colors">
              Contact Sales
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SubscriptionManager;
