import React, { useState, useEffect } from 'react';
import { Icons } from '../constants';

interface CreditPackage {
  id: string;
  name: string;
  credits: number;
  base_price: number;
  sale_price: number;
  popular: boolean;
  description: string;
}

interface CreditBalance {
  balance: number;
  total_purchased: number;
  total_used: number;
}

interface CreditTransaction {
  id: string;
  type: string;
  amount: number;
  balance_after: number;
  description: string;
  created_at: string;
}

const CreditsManager: React.FC = () => {
  const [packages, setPackages] = useState<CreditPackage[]>([]);
  const [balance, setBalance] = useState<CreditBalance | null>(null);
  const [transactions, setTransactions] = useState<CreditTransaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [purchasing, setPurchasing] = useState(false);
  const [selectedPackage, setSelectedPackage] = useState<string | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const supabaseUrl = process.env.REACT_APP_SUPABASE_URL;
      const supabaseAnonKey = process.env.REACT_APP_SUPABASE_ANON_KEY;

      if (!supabaseUrl || !supabaseAnonKey) {
        console.error('Supabase configuration missing');
        return;
      }

      // Fetch credit packages
      const packagesResponse = await fetch(`${supabaseUrl}/rest/v1/credit_packages?active=eq.true&order=credits.asc`, {
        headers: {
          'apikey': supabaseAnonKey,
          'Authorization': `Bearer ${supabaseAnonKey}`,
        },
      });

      if (packagesResponse.ok) {
        const packagesData = await packagesResponse.json();
        setPackages(packagesData);
      }

      // Fetch user balance
      const userId = localStorage.getItem('user_id');
      if (userId) {
        const balanceResponse = await fetch(`${supabaseUrl}/rest/v1/credit_balances?user_id=eq.${userId}&select=*`, {
          headers: {
            'apikey': supabaseAnonKey,
            'Authorization': `Bearer ${localStorage.getItem('supabase_token')}`,
          },
        });

        if (balanceResponse.ok) {
          const balanceData = await balanceResponse.json();
          if (balanceData.length > 0) {
            setBalance(balanceData[0]);
          }
        }

        // Fetch transaction history
        const transactionsResponse = await fetch(`${supabaseUrl}/rest/v1/credit_transactions?user_id=eq.${userId}&order=created_at.desc&limit=20`, {
          headers: {
            'apikey': supabaseAnonKey,
            'Authorization': `Bearer ${localStorage.getItem('supabase_token')}`,
          },
        });

        if (transactionsResponse.ok) {
          const transactionsData = await transactionsResponse.json();
          setTransactions(transactionsData);
        }
      }
    } catch (error) {
      console.error('Error loading credits data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePurchase = async (pkg: CreditPackage) => {
    setPurchasing(true);
    setSelectedPackage(pkg.id);

    try {
      const supabaseUrl = process.env.REACT_APP_SUPABASE_URL;
      const supabaseAnonKey = process.env.REACT_APP_SUPABASE_ANON_KEY;
      const userId = localStorage.getItem('user_id');
      const userEmail = localStorage.getItem('user_email');

      if (!userId || !userEmail) {
        alert('Please log in to purchase credits');
        return;
      }

      const response = await fetch(`${supabaseUrl}/functions/v1/purchase-credits`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': supabaseAnonKey,
          'Authorization': `Bearer ${supabaseAnonKey}`,
        },
        body: JSON.stringify({
          packageId: pkg.id,
          userId,
          userEmail,
        }),
      });

      const data = await response.json();

      if (data.success && data.checkoutUrl) {
        window.location.href = data.checkoutUrl;
      } else {
        alert('Failed to create checkout session. Please try again.');
      }
    } catch (error) {
      console.error('Purchase error:', error);
      alert('An error occurred. Please try again.');
    } finally {
      setPurchasing(false);
      setSelectedPackage(null);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-auto bg-gray-50 dark:bg-[#0c0e12]">
      <div className="max-w-7xl mx-auto p-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-black text-slate-900 dark:text-white mb-2">Credits Manager</h1>
          <p className="text-slate-600 dark:text-slate-400">Purchase credits to power your AI features, SMS, emails, and more</p>
        </div>

        {/* Current Balance Card */}
        <div className="bg-gradient-to-br from-indigo-600 to-purple-600 rounded-2xl p-8 mb-8 text-white shadow-xl">
          <div className="flex items-center justify-between mb-6">
            <div>
              <p className="text-indigo-100 text-sm font-semibold mb-1">Current Balance</p>
              <h2 className="text-5xl font-black">${balance?.balance?.toFixed(2) || '0.00'}</h2>
            </div>
            <div className="w-20 h-20 bg-white/10 rounded-full flex items-center justify-center backdrop-blur-sm">
              <Icons.Wallet className="w-10 h-10" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-6 pt-6 border-t border-white/20">
            <div>
              <p className="text-indigo-100 text-xs mb-1">Total Purchased</p>
              <p className="text-xl font-bold">${balance?.total_purchased?.toFixed(2) || '0.00'}</p>
            </div>
            <div>
              <p className="text-indigo-100 text-xs mb-1">Total Used</p>
              <p className="text-xl font-bold">${balance?.total_used?.toFixed(2) || '0.00'}</p>
            </div>
          </div>
        </div>

        {/* Credit Packages */}
        <div className="mb-12">
          <h2 className="text-2xl font-black text-slate-900 dark:text-white mb-6">Purchase Credits</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {packages.map((pkg) => (
              <div
                key={pkg.id}
                className={`relative bg-white dark:bg-slate-900 rounded-xl p-6 border-2 transition-all ${
                  pkg.popular
                    ? 'border-indigo-600 shadow-xl shadow-indigo-500/20'
                    : 'border-slate-200 dark:border-slate-800 hover:border-indigo-400 dark:hover:border-indigo-600'
                }`}
              >
                {pkg.popular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <span className="bg-indigo-600 text-white text-xs font-bold px-4 py-1 rounded-full shadow-lg">
                      MOST POPULAR
                    </span>
                  </div>
                )}
                <div className="text-center mb-6">
                  <h3 className="text-xl font-black text-slate-900 dark:text-white mb-2">{pkg.name}</h3>
                  <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">{pkg.description}</p>
                  <div className="mb-4">
                    <div className="text-4xl font-black text-indigo-600 dark:text-indigo-400">
                      ${pkg.sale_price.toFixed(2)}
                    </div>
                    <div className="text-sm text-slate-500 dark:text-slate-500 line-through">
                      ${pkg.base_price.toFixed(2)}
                    </div>
                  </div>
                  <div className="inline-flex items-center space-x-2 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 px-4 py-2 rounded-full text-sm font-bold">
                    <Icons.Zap className="w-4 h-4" />
                    <span>{pkg.credits.toFixed(0)} Credits</span>
                  </div>
                </div>
                <button
                  onClick={() => handlePurchase(pkg)}
                  disabled={purchasing && selectedPackage === pkg.id}
                  className={`w-full py-3 rounded-lg font-bold transition-all ${
                    pkg.popular
                      ? 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg hover:shadow-xl'
                      : 'bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-900 dark:text-white'
                  } disabled:opacity-50 disabled:cursor-not-allowed`}
                >
                  {purchasing && selectedPackage === pkg.id ? (
                    <span className="flex items-center justify-center">
                      <Icons.Loader className="w-4 h-4 mr-2 animate-spin" />
                      Processing...
                    </span>
                  ) : (
                    'Purchase Now'
                  )}
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Transaction History */}
        <div>
          <h2 className="text-2xl font-black text-slate-900 dark:text-white mb-6">Transaction History</h2>
          <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden">
            {transactions.length === 0 ? (
              <div className="p-12 text-center text-slate-400 dark:text-slate-600">
                <Icons.FileText className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p className="font-semibold">No transactions yet</p>
                <p className="text-sm mt-1">Your credit purchases and usage will appear here</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-slate-50 dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700">
                    <tr>
                      <th className="px-6 py-4 text-left text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
                        Date
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
                        Type
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
                        Description
                      </th>
                      <th className="px-6 py-4 text-right text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
                        Amount
                      </th>
                      <th className="px-6 py-4 text-right text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
                        Balance After
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                    {transactions.map((transaction) => (
                      <tr key={transaction.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600 dark:text-slate-400">
                          {formatDate(transaction.created_at)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span
                            className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold ${
                              transaction.type === 'purchase'
                                ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400'
                                : transaction.type === 'usage'
                                ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400'
                                : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-400'
                            }`}
                          >
                            {transaction.type}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm text-slate-900 dark:text-white">
                          {transaction.description}
                        </td>
                        <td className={`px-6 py-4 text-right text-sm font-bold whitespace-nowrap ${
                          transaction.amount > 0
                            ? 'text-green-600 dark:text-green-400'
                            : 'text-red-600 dark:text-red-400'
                        }`}>
                          {transaction.amount > 0 ? '+' : ''}${Math.abs(transaction.amount).toFixed(2)}
                        </td>
                        <td className="px-6 py-4 text-right text-sm font-semibold text-slate-900 dark:text-white whitespace-nowrap">
                          ${transaction.balance_after.toFixed(2)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreditsManager;
