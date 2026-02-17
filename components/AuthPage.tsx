import React, { useState } from 'react';

interface AuthPageProps {
  mode: 'signup' | 'login';
  onAuthSuccess: (userData: any) => void;
  onBack: () => void;
  theme: 'light' | 'dark';
  onToggleTheme: () => void;
}

const AuthPage: React.FC<AuthPageProps> = ({ mode, onAuthSuccess, onBack, theme, onToggleTheme }) => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    fullName: '',
    companyName: ''
  });
  const [selectedPlan, setSelectedPlan] = useState<'starter' | 'professional' | 'enterprise'>('professional');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const plans = {
    starter: { name: 'Starter', price: 97, color: 'slate' },
    professional: { name: 'Professional', price: 197, color: 'indigo' },
    enterprise: { name: 'Enterprise', price: 497, color: 'purple' }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      // Simulate API call - Replace with actual Supabase auth
      await new Promise(resolve => setTimeout(resolve, 1500));

      const userData = {
        email: formData.email,
        name: formData.fullName || 'User',
        company: formData.companyName || 'My Company',
        plan: selectedPlan,
        subscription_status: 'trial'
      };

      onAuthSuccess(userData);
    } catch (err) {
      setError('Authentication failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#0c0e12] flex items-center justify-center px-6 transition-colors duration-300">
      <div className="w-full max-w-6xl flex rounded-[4rem] overflow-hidden shadow-2xl bg-white dark:bg-slate-900">
        {/* Left Side - Branding */}
        <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-indigo-600 via-purple-600 to-indigo-700 p-16 flex-col justify-between text-white relative overflow-hidden">
          <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-white/10 rounded-full blur-3xl"></div>

          <div className="relative z-10">
            <button onClick={onBack} className="mb-12 flex items-center space-x-2 text-white/80 hover:text-white transition-colors">
              <span>←</span>
              <span className="font-bold">Back to Home</span>
            </button>

            <div className="flex items-center space-x-4 mb-8">
              <img
                src="/2._Helix_logo_A1.01_NB.png"
                alt="Helix Logo"
                className="w-14 h-14 object-contain"
              />
              <div>
                <h1 className="text-2xl font-black">GoogleHubs</h1>
                <p className="text-sm text-white/60 font-bold">Powered by HELIX AI</p>
              </div>
            </div>

            <h2 className="text-4xl font-black mb-6 leading-tight">
              {mode === 'signup' ? 'Start Your Free Trial' : 'Welcome Back'}
            </h2>
            <p className="text-white/80 text-lg leading-relaxed">
              Join thousands of businesses using HELIX AI to automate workflows, generate content, and grow faster.
            </p>
          </div>

          <div className="relative z-10 space-y-6">
            <div className="flex items-center space-x-4">
              <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">✓</div>
              <div>
                <p className="font-bold">3-Day Free Trial</p>
                <p className="text-sm text-white/60">Payment required to activate</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">⚡</div>
              <div>
                <p className="font-bold">Setup in 5 Minutes</p>
                <p className="text-sm text-white/60">Start automating immediately</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">🤖</div>
              <div>
                <p className="font-bold">HELIX AI Included</p>
                <p className="text-sm text-white/60">Your intelligent business assistant</p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side - Form */}
        <div className="w-full lg:w-1/2 p-12 lg:p-16">
          {/* Mobile Logo Header */}
          <div className="lg:hidden flex items-center justify-between mb-8">
            <div className="flex items-center space-x-3">
              <img
                src="/2._Helix_logo_A1.01_NB.png"
                alt="Helix Logo"
                className="w-10 h-10 object-contain"
              />
              <div>
                <h1 className="text-lg font-black text-slate-900 dark:text-white">GoogleHubs</h1>
                <p className="text-xs text-slate-500 dark:text-slate-400 font-bold">Powered by HELIX AI</p>
              </div>
            </div>
            <button
              onClick={onToggleTheme}
              className="p-2 text-slate-600 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
              title={`Switch to ${theme === 'light' ? 'Dark' : 'Light'} Mode`}
            >
              {theme === 'light' ? <span className="text-xl">🌙</span> : <span className="text-xl">☀️</span>}
            </button>
          </div>

          {/* Mobile Back Button */}
          <div className="lg:hidden mb-6">
            <button onClick={onBack} className="flex items-center space-x-2 text-slate-600 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
              <span>←</span>
              <span className="font-bold">Back</span>
            </button>
          </div>

          {/* Desktop Theme Toggle */}
          <div className="hidden lg:flex items-center justify-end mb-8">
            <button
              onClick={onToggleTheme}
              className="p-2 text-slate-600 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
              title={`Switch to ${theme === 'light' ? 'Dark' : 'Light'} Mode`}
            >
              {theme === 'light' ? <span className="text-xl">🌙</span> : <span className="text-xl">☀️</span>}
            </button>
          </div>

          <div className="mb-10">
            <h2 className="text-3xl font-black text-slate-900 dark:text-white mb-2">
              {mode === 'signup' ? 'Create Your Account' : 'Sign In to GoogleHubs'}
            </h2>
            <p className="text-slate-600 dark:text-slate-400">
              {mode === 'signup'
                ? 'Get started with your 3-day free trial'
                : 'Access your HELIX AI dashboard'
              }
            </p>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-2xl text-red-600 dark:text-red-400 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {mode === 'signup' && (
              <>
                <div>
                  <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.fullName}
                    onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                    className="w-full px-4 py-3 bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:border-indigo-500 transition-all"
                    placeholder="John Doe"
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">
                    Company Name
                  </label>
                  <input
                    type="text"
                    value={formData.companyName}
                    onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                    className="w-full px-4 py-3 bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:border-indigo-500 transition-all"
                    placeholder="Acme Inc"
                  />
                </div>
              </>
            )}

            <div>
              <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">
                Email Address *
              </label>
              <input
                type="email"
                required
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full px-4 py-3 bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:border-indigo-500 transition-all"
                placeholder="you@company.com"
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">
                Password *
              </label>
              <input
                type="password"
                required
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                className="w-full px-4 py-3 bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:border-indigo-500 transition-all"
                placeholder="••••••••"
              />
            </div>

            {mode === 'signup' && (
              <div>
                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-3">
                  Select Your Plan
                </label>
                <div className="grid grid-cols-3 gap-3">
                  {Object.entries(plans).map(([key, plan]) => (
                    <button
                      key={key}
                      type="button"
                      onClick={() => setSelectedPlan(key as any)}
                      className={`p-4 rounded-xl border-2 transition-all ${
                        selectedPlan === key
                          ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-950/30'
                          : 'border-slate-200 dark:border-white/10 bg-white dark:bg-white/5'
                      }`}
                    >
                      <p className="font-black text-sm text-slate-900 dark:text-white mb-1">{plan.name}</p>
                      <p className="text-xs text-slate-600 dark:text-slate-400">${plan.price}/mo</p>
                    </button>
                  ))}
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">
                  Credit card required • Try risk-free for 3 days • Cancel anytime
                </p>
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-4 bg-indigo-600 text-white rounded-xl font-black uppercase tracking-widest hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-xl"
            >
              {isLoading ? 'Processing...' : mode === 'signup' ? 'Start Free Trial' : 'Sign In'}
            </button>
          </form>

          <div className="mt-8 text-center">
            <p className="text-sm text-slate-600 dark:text-slate-400">
              {mode === 'signup' ? (
                <>
                  Already have an account?{' '}
                  <button onClick={() => window.location.reload()} className="text-indigo-600 dark:text-indigo-400 font-bold hover:underline">
                    Sign In
                  </button>
                </>
              ) : (
                <>
                  Don't have an account?{' '}
                  <button onClick={() => window.location.reload()} className="text-indigo-600 dark:text-indigo-400 font-bold hover:underline">
                    Start Free Trial
                  </button>
                </>
              )}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthPage;
