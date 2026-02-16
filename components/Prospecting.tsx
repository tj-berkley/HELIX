
import React, { useState } from 'react';
import { Icons } from '../constants';

type SearchPlatform = 'Google Business' | 'Google Maps' | 'Google Places' | 'Facebook' | 'LinkedIn' | 'Yellow Pages';

interface ProspectResult {
  id: string;
  name: string;
  platform: SearchPlatform;
  address?: string;
  phone?: string;
  email?: string;
  website?: string;
  rating?: number;
  category?: string;
  description?: string;
}

const Prospecting: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPlatforms, setSelectedPlatforms] = useState<SearchPlatform[]>(['Google Business', 'Google Maps', 'Google Places', 'Facebook', 'LinkedIn', 'Yellow Pages']);
  const [location, setLocation] = useState('');
  const [category, setCategory] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [results, setResults] = useState<ProspectResult[]>([]);
  const [selectedResults, setSelectedResults] = useState<string[]>([]);

  const platforms: SearchPlatform[] = ['Google Business', 'Google Maps', 'Google Places', 'Facebook', 'LinkedIn', 'Yellow Pages'];

  const togglePlatform = (platform: SearchPlatform) => {
    setSelectedPlatforms(prev =>
      prev.includes(platform)
        ? prev.filter(p => p !== platform)
        : [...prev, platform]
    );
  };

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;

    setIsSearching(true);

    // Simulated search - in production, this would call actual APIs
    setTimeout(() => {
      const mockResults: ProspectResult[] = [
        {
          id: '1',
          name: 'Acme Plumbing Services',
          platform: 'Google Business',
          address: '123 Main St, New York, NY 10001',
          phone: '(555) 123-4567',
          email: 'contact@acmeplumbing.com',
          website: 'https://acmeplumbing.com',
          rating: 4.8,
          category: 'Plumbing',
          description: 'Professional plumbing services available 24/7'
        },
        {
          id: '2',
          name: 'Smith & Associates Law Firm',
          platform: 'LinkedIn',
          address: '456 Park Ave, New York, NY 10022',
          phone: '(555) 234-5678',
          email: 'info@smithlaw.com',
          website: 'https://smithlaw.com',
          rating: 4.9,
          category: 'Legal Services',
          description: 'Expert legal counsel for business and personal matters'
        },
        {
          id: '3',
          name: 'Elite Real Estate Group',
          platform: 'Facebook',
          address: '789 Broadway, New York, NY 10003',
          phone: '(555) 345-6789',
          email: 'sales@eliterealestate.com',
          website: 'https://eliterealestate.com',
          rating: 4.7,
          category: 'Real Estate',
          description: 'Luxury residential and commercial properties'
        },
        {
          id: '4',
          name: 'Downtown Medical Center',
          platform: 'Google Maps',
          address: '321 5th Ave, New York, NY 10016',
          phone: '(555) 456-7890',
          email: 'appointments@downtownmedical.com',
          website: 'https://downtownmedical.com',
          rating: 4.6,
          category: 'Healthcare',
          description: 'Comprehensive medical care for the whole family'
        },
        {
          id: '5',
          name: 'Professional Insurance Solutions',
          platform: 'Yellow Pages',
          address: '654 Madison Ave, New York, NY 10065',
          phone: '(555) 567-8901',
          email: 'quotes@proinsurance.com',
          website: 'https://proinsurance.com',
          rating: 4.5,
          category: 'Insurance',
          description: 'Affordable insurance plans for individuals and businesses'
        },
        {
          id: '6',
          name: 'TechStart Consulting',
          platform: 'LinkedIn',
          address: '987 Lexington Ave, New York, NY 10021',
          phone: '(555) 678-9012',
          email: 'hello@techstart.com',
          website: 'https://techstart.com',
          rating: 4.9,
          category: 'Technology Consulting',
          description: 'Digital transformation and IT consulting services'
        }
      ];

      const filtered = mockResults.filter(r => selectedPlatforms.includes(r.platform));
      setResults(filtered);
      setIsSearching(false);
    }, 1500);
  };

  const toggleSelectResult = (id: string) => {
    setSelectedResults(prev =>
      prev.includes(id) ? prev.filter(r => r !== id) : [...prev, id]
    );
  };

  const handleAddToContacts = () => {
    if (selectedResults.length === 0) return;
    alert(`Adding ${selectedResults.length} prospects to your contacts...`);
    setSelectedResults([]);
  };

  const getPlatformColor = (platform: SearchPlatform): string => {
    const colors: Record<SearchPlatform, string> = {
      'Google Business': 'bg-blue-500',
      'Google Maps': 'bg-green-500',
      'Google Places': 'bg-yellow-500',
      'Facebook': 'bg-blue-600',
      'LinkedIn': 'bg-blue-700',
      'Yellow Pages': 'bg-yellow-600'
    };
    return colors[platform];
  };

  return (
    <div className="flex-1 overflow-auto bg-slate-50 dark:bg-[#0c0e12]">
      <div className="max-w-7xl mx-auto p-8 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-black text-slate-900 dark:text-white mb-2">Prospecting</h1>
            <p className="text-sm text-slate-600 dark:text-slate-400">Search and discover potential clients across multiple platforms</p>
          </div>
          {selectedResults.length > 0 && (
            <button
              onClick={handleAddToContacts}
              className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold text-sm transition-all shadow-lg hover:shadow-xl flex items-center space-x-2"
            >
              <span>Add {selectedResults.length} to Contacts</span>
            </button>
          )}
        </div>

        <div className="bg-white dark:bg-slate-900/50 rounded-2xl border border-slate-200 dark:border-white/10 p-6 space-y-6 shadow-sm">
          <div>
            <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider mb-2">
              Select Platforms
            </label>
            <div className="flex flex-wrap gap-2">
              {platforms.map(platform => (
                <button
                  key={platform}
                  onClick={() => togglePlatform(platform)}
                  className={`px-4 py-2 rounded-lg font-bold text-xs transition-all ${
                    selectedPlatforms.includes(platform)
                      ? 'bg-indigo-600 text-white shadow-md'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
                  }`}
                >
                  {platform}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider mb-2">
                Search Query
              </label>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="e.g., plumbers, lawyers, doctors"
                className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-white/10 rounded-xl text-sm text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-indigo-500"
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider mb-2">
                Location
              </label>
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="e.g., New York, NY"
                className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-white/10 rounded-xl text-sm text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-indigo-500"
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider mb-2">
                Category
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-white/10 rounded-xl text-sm text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="">All Categories</option>
                <option value="healthcare">Healthcare</option>
                <option value="legal">Legal Services</option>
                <option value="real-estate">Real Estate</option>
                <option value="insurance">Insurance</option>
                <option value="home-services">Home Services</option>
                <option value="technology">Technology</option>
                <option value="finance">Finance</option>
                <option value="automotive">Automotive</option>
              </select>
            </div>
          </div>

          <button
            onClick={handleSearch}
            disabled={isSearching || !searchQuery.trim()}
            className="w-full px-6 py-3 bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-300 dark:disabled:bg-slate-700 text-white font-bold rounded-xl transition-all shadow-md hover:shadow-lg flex items-center justify-center space-x-2"
          >
            {isSearching ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                <span>Searching...</span>
              </>
            ) : (
              <>
                <Icons.Search />
                <span>Search Prospects</span>
              </>
            )}
          </button>
        </div>

        {results.length > 0 && (
          <div className="bg-white dark:bg-slate-900/50 rounded-2xl border border-slate-200 dark:border-white/10 p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-black text-slate-900 dark:text-white">
                Search Results ({results.length})
              </h2>
              <button
                onClick={() => setSelectedResults(selectedResults.length === results.length ? [] : results.map(r => r.id))}
                className="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline"
              >
                {selectedResults.length === results.length ? 'Deselect All' : 'Select All'}
              </button>
            </div>

            <div className="space-y-3">
              {results.map(result => (
                <div
                  key={result.id}
                  className={`p-4 rounded-xl border transition-all cursor-pointer ${
                    selectedResults.includes(result.id)
                      ? 'bg-indigo-50 dark:bg-indigo-950/30 border-indigo-300 dark:border-indigo-700'
                      : 'bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-white/5 hover:border-slate-300 dark:hover:border-white/10'
                  }`}
                  onClick={() => toggleSelectResult(result.id)}
                >
                  <div className="flex items-start space-x-4">
                    <input
                      type="checkbox"
                      checked={selectedResults.includes(result.id)}
                      onChange={() => {}}
                      className="mt-1 w-4 h-4 text-indigo-600 rounded"
                    />

                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <h3 className="font-bold text-slate-900 dark:text-white mb-1">{result.name}</h3>
                          <div className="flex items-center space-x-2 mb-2">
                            <span className={`px-2 py-0.5 ${getPlatformColor(result.platform)} text-white text-[10px] font-bold rounded uppercase`}>
                              {result.platform}
                            </span>
                            {result.category && (
                              <span className="px-2 py-0.5 bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 text-[10px] font-bold rounded">
                                {result.category}
                              </span>
                            )}
                            {result.rating && (
                              <div className="flex items-center space-x-1">
                                <span className="text-yellow-500">★</span>
                                <span className="text-xs font-bold text-slate-600 dark:text-slate-400">{result.rating}</span>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>

                      {result.description && (
                        <p className="text-sm text-slate-600 dark:text-slate-400 mb-3">{result.description}</p>
                      )}

                      <div className="grid grid-cols-2 gap-3 text-xs">
                        {result.address && (
                          <div className="flex items-center space-x-2 text-slate-600 dark:text-slate-400">
                            <span>📍</span>
                            <span className="truncate">{result.address}</span>
                          </div>
                        )}
                        {result.phone && (
                          <div className="flex items-center space-x-2 text-slate-600 dark:text-slate-400">
                            <span>📞</span>
                            <span>{result.phone}</span>
                          </div>
                        )}
                        {result.email && (
                          <div className="flex items-center space-x-2 text-slate-600 dark:text-slate-400">
                            <span>✉️</span>
                            <span className="truncate">{result.email}</span>
                          </div>
                        )}
                        {result.website && (
                          <div className="flex items-center space-x-2 text-slate-600 dark:text-slate-400">
                            <span>🌐</span>
                            <a href={result.website} target="_blank" rel="noopener noreferrer" className="truncate hover:text-indigo-600 dark:hover:text-indigo-400">
                              {result.website.replace('https://', '')}
                            </a>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {results.length === 0 && !isSearching && (
          <div className="bg-white dark:bg-slate-900/50 rounded-2xl border border-slate-200 dark:border-white/10 p-12 text-center shadow-sm">
            <div className="text-6xl mb-4">🔍</div>
            <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Start Your Search</h3>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              Enter your search criteria above to discover potential clients across multiple platforms
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Prospecting;
