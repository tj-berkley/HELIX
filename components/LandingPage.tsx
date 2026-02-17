import React, { useState } from 'react';
import { Icons } from '../constants';
import HelixChatbot from './HelixChatbot';
import HelixLogo from './HelixLogo';

interface LandingPageProps {
  onNavigateToAuth: (mode: 'signup' | 'login') => void;
  theme: 'light' | 'dark';
  onToggleTheme: () => void;
}

const LandingPage: React.FC<LandingPageProps> = ({ onNavigateToAuth, theme, onToggleTheme }) => {
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'annual'>('monthly');

  const pricingPlans = [
    {
      name: 'Starter',
      tagline: 'For solopreneurs and small teams',
      monthlyPrice: 97,
      annualPrice: 970,
      monthlyEquivalent: 81,
      features: [
        'Up to 1,000 prospects',
        'HELIX AI Assistant (10K tokens/mo)',
        'Basic automation workflows',
        'Email & SMS campaigns (500/mo)',
        'Content creation tools',
        'Calendar & task management',
        '5 GB storage',
        'Email support'
      ],
      cta: 'Start Free Trial',
      popular: false,
      color: 'slate'
    },
    {
      name: 'Professional',
      tagline: 'For growing businesses',
      monthlyPrice: 197,
      annualPrice: 1970,
      monthlyEquivalent: 164,
      features: [
        'Unlimited prospects',
        'HELIX AI Assistant (100K tokens/mo)',
        'Advanced automation & workflows',
        'Unlimited email & SMS',
        'Full content studio suite',
        'Video & audio creation',
        'Prospecting & enrichment tools',
        'Medical Hub features',
        'API access',
        '50 GB storage',
        'Priority support',
        'White-label options'
      ],
      cta: 'Start Free Trial',
      popular: true,
      color: 'indigo'
    },
    {
      name: 'Enterprise',
      tagline: 'For large organizations',
      monthlyPrice: 497,
      annualPrice: 4970,
      monthlyEquivalent: 414,
      features: [
        'Everything in Professional',
        'HELIX AI Assistant (1M tokens/mo)',
        'Custom automation workflows',
        'Dedicated account manager',
        'Custom integrations',
        'Advanced analytics & reporting',
        'Multi-team collaboration',
        'SSO & advanced security',
        'Unlimited storage',
        '99.9% SLA guarantee',
        '24/7 phone support',
        'Custom contracts available'
      ],
      cta: 'Contact Sales',
      popular: false,
      color: 'purple'
    }
  ];

  const features = [
    {
      icon: '🤖',
      title: 'HELIX AI Assistant',
      description: 'Your intelligent AI companion that automates tasks, creates content, and provides insights 24/7.'
    },
    {
      icon: '🔍',
      title: 'Smart Prospecting',
      description: 'Find and enrich leads from Google Business, LinkedIn, and Facebook with AI-powered intelligence.'
    },
    {
      icon: '⚡',
      title: 'Automation Studio',
      description: 'Build custom workflows to automate repetitive tasks and connect all your business tools.'
    },
    {
      icon: '🎨',
      title: 'Content Creation Suite',
      description: 'Create blog posts, videos, audio content, and social media posts with AI assistance.'
    },
    {
      icon: '📊',
      title: 'Analytics & Insights',
      description: 'Track performance, measure ROI, and make data-driven decisions with real-time analytics.'
    },
    {
      icon: '🏥',
      title: 'Medical Hub',
      description: 'Healthcare-specific features for patient management, appointments, and health records.'
    }
  ];

  const stats = [
    { value: '50+', label: 'Integrations' },
    { value: '10hrs', label: 'Saved per Week' },
    { value: '99.9%', label: 'Uptime' },
    { value: '24/7', label: 'AI Support' }
  ];

  return (
    <div className="min-h-screen bg-white dark:bg-[#0c0e12] transition-colors duration-300">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border-b border-slate-200 dark:border-white/5">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <HelixLogo size={48} animated />
            <div>
              <span className="font-black text-slate-900 dark:text-white text-lg tracking-tight">GoogleHubs</span>
              <p className="text-[8px] font-black text-indigo-600 dark:text-indigo-400 uppercase tracking-widest">HELIX AI Powered</p>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <button
              onClick={onToggleTheme}
              className="p-2.5 text-slate-600 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
              title={`Switch to ${theme === 'light' ? 'Dark' : 'Light'} Mode`}
            >
              {theme === 'light' ? <span className="text-xl">🌙</span> : <span className="text-xl">☀️</span>}
            </button>
            <button
              onClick={() => onNavigateToAuth('login')}
              className="px-6 py-2.5 text-sm font-bold text-slate-700 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
            >
              Sign In
            </button>
            <button
              onClick={() => onNavigateToAuth('signup')}
              className="px-6 py-2.5 bg-indigo-600 text-white rounded-xl text-sm font-bold hover:bg-indigo-700 shadow-lg transition-all"
            >
              Start Free Trial
            </button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-6">
        <div className="max-w-7xl mx-auto text-center">
          <div className="inline-flex items-center px-4 py-2 bg-indigo-50 dark:bg-indigo-950/30 rounded-full border border-indigo-100 dark:border-indigo-500/20 mb-8">
            <span className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse mr-2"></span>
            <span className="text-xs font-black text-indigo-600 dark:text-indigo-400 uppercase tracking-widest">Meet HELIX - Your AI Business Assistant</span>
          </div>

          <h1 className="text-7xl font-black text-slate-900 dark:text-white tracking-tighter leading-tight mb-6">
            Your All-in-One<br />
            <span className="text-indigo-600 dark:text-indigo-400">AI-Powered</span> Business Hub
          </h1>

          <p className="text-xl text-slate-600 dark:text-slate-400 max-w-3xl mx-auto mb-12 leading-relaxed">
            Replace 15+ tools with GoogleHubs. CRM, automation, content creation, prospecting, and AI assistance—all in one powerful platform. Save time, increase productivity, and grow faster with HELIX AI.
          </p>

          <div className="flex items-center justify-center space-x-4 mb-16">
            <button
              onClick={() => onNavigateToAuth('signup')}
              className="px-10 py-5 bg-indigo-600 text-white rounded-2xl font-black text-sm uppercase tracking-widest shadow-2xl hover:bg-indigo-700 transition-all transform hover:scale-105"
            >
              Start Free 14-Day Trial
            </button>
            <button className="px-10 py-5 bg-white dark:bg-slate-800 border-2 border-slate-200 dark:border-white/10 text-slate-900 dark:text-white rounded-2xl font-black text-sm uppercase tracking-widest hover:border-indigo-400 dark:hover:border-indigo-500 transition-all">
              Watch Demo
            </button>
          </div>

          <div className="flex items-center justify-center space-x-12 text-sm text-slate-500 dark:text-slate-400">
            <div className="flex items-center space-x-2">
              <span className="text-green-500">✓</span>
              <span className="font-bold">No credit card required</span>
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-green-500">✓</span>
              <span className="font-bold">Cancel anytime</span>
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-green-500">✓</span>
              <span className="font-bold">Setup in 5 minutes</span>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-slate-50 dark:bg-slate-900/30">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-4 gap-8">
            {stats.map((stat, idx) => (
              <div key={idx} className="text-center">
                <p className="text-5xl font-black text-indigo-600 dark:text-indigo-400 mb-2">{stat.value}</p>
                <p className="text-sm font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-5xl font-black text-slate-900 dark:text-white mb-4 tracking-tight">Everything You Need to Grow</h2>
            <p className="text-xl text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
              Powerful features that work together seamlessly, powered by HELIX AI
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, idx) => (
              <div key={idx} className="p-8 bg-white dark:bg-slate-900/50 rounded-3xl border border-slate-200 dark:border-white/5 hover:border-indigo-200 dark:hover:border-indigo-500/30 transition-all group">
                <div className="w-16 h-16 bg-indigo-50 dark:bg-indigo-950/30 rounded-2xl flex items-center justify-center text-3xl mb-6 group-hover:scale-110 transition-transform">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-black text-slate-900 dark:text-white mb-3">{feature.title}</h3>
                <p className="text-slate-600 dark:text-slate-400 leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="py-20 px-6 bg-slate-50 dark:bg-slate-900/30">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-5xl font-black text-slate-900 dark:text-white mb-4 tracking-tight">Simple, Transparent Pricing</h2>
            <p className="text-xl text-slate-600 dark:text-slate-400 mb-8">
              Choose the perfect plan for your business. All plans include 14-day free trial.
            </p>

            <div className="inline-flex items-center p-1 bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-white/10">
              <button
                onClick={() => setBillingCycle('monthly')}
                className={`px-8 py-3 rounded-xl font-bold text-sm transition-all ${billingCycle === 'monthly' ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-600 dark:text-slate-400'}`}
              >
                Monthly
              </button>
              <button
                onClick={() => setBillingCycle('annual')}
                className={`px-8 py-3 rounded-xl font-bold text-sm transition-all ${billingCycle === 'annual' ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-600 dark:text-slate-400'}`}
              >
                Annual <span className="ml-2 text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full">Save 16%</span>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {pricingPlans.map((plan, idx) => (
              <div
                key={idx}
                className={`relative p-8 bg-white dark:bg-slate-900/50 rounded-3xl border-2 transition-all hover:scale-105 ${
                  plan.popular
                    ? 'border-indigo-500 shadow-2xl'
                    : 'border-slate-200 dark:border-white/5'
                }`}
              >
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                    <span className="px-4 py-1.5 bg-indigo-600 text-white text-xs font-black uppercase tracking-widest rounded-full shadow-lg">
                      Most Popular
                    </span>
                  </div>
                )}

                <div className="text-center mb-8">
                  <h3 className="text-2xl font-black text-slate-900 dark:text-white mb-2">{plan.name}</h3>
                  <p className="text-sm text-slate-600 dark:text-slate-400 mb-6">{plan.tagline}</p>

                  <div className="mb-2">
                    <span className="text-5xl font-black text-slate-900 dark:text-white">
                      ${billingCycle === 'monthly' ? plan.monthlyPrice : plan.monthlyEquivalent}
                    </span>
                    <span className="text-slate-600 dark:text-slate-400 ml-2">/month</span>
                  </div>

                  {billingCycle === 'annual' && (
                    <p className="text-xs text-green-600 dark:text-green-400 font-bold">
                      Billed ${plan.annualPrice} annually
                    </p>
                  )}
                </div>

                <button
                  onClick={() => onNavigateToAuth('signup')}
                  className={`w-full py-4 rounded-2xl font-black text-sm uppercase tracking-widest mb-8 transition-all ${
                    plan.popular
                      ? 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-xl'
                      : 'bg-slate-100 dark:bg-white/5 text-slate-900 dark:text-white hover:bg-slate-200 dark:hover:bg-white/10'
                  }`}
                >
                  {plan.cta}
                </button>

                <div className="space-y-4">
                  {plan.features.map((feature, fIdx) => (
                    <div key={fIdx} className="flex items-start space-x-3">
                      <span className="text-indigo-600 dark:text-indigo-400 text-lg shrink-0">✓</span>
                      <span className="text-sm text-slate-700 dark:text-slate-300">{feature}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-6">
        <div className="max-w-4xl mx-auto text-center bg-gradient-to-br from-indigo-600 to-purple-600 rounded-[4rem] p-16 text-white">
          <h2 className="text-5xl font-black mb-6 tracking-tight">Ready to Transform Your Business?</h2>
          <p className="text-xl mb-10 opacity-90">
            Join thousands of businesses using GoogleHubs and HELIX AI to save time and grow faster.
          </p>
          <button
            onClick={() => onNavigateToAuth('signup')}
            className="px-12 py-5 bg-white text-indigo-600 rounded-2xl font-black text-sm uppercase tracking-widest shadow-2xl hover:bg-slate-100 transition-all transform hover:scale-105"
          >
            Start Your Free Trial Today
          </button>
          <p className="text-sm mt-6 opacity-75">No credit card required • Cancel anytime • 14-day free trial</p>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-6 border-t border-slate-200 dark:border-white/5">
        <div className="max-w-7xl mx-auto text-center text-sm text-slate-600 dark:text-slate-400">
          <p className="font-bold mb-4">© 2025 GoogleHubs. All rights reserved.</p>
          <p className="text-xs">Built with HELIX AI • Your AI-Powered Business Command Center</p>
        </div>
      </footer>

      {/* HELIX Chatbot */}
      <HelixChatbot theme={theme} />
    </div>
  );
};

export default LandingPage;
