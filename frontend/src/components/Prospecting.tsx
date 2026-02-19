
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Icons } from '../constants';
import { searchProspects, checkApiStatus, ProspectResult, SearchPlatform } from '../services/prospectingService';

const Prospecting: React.FC = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPlatforms, setSelectedPlatforms] = useState<SearchPlatform[]>(['Google Places']);
  const [location, setLocation] = useState('');
  const [category, setCategory] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [results, setResults] = useState<ProspectResult[]>([]);
  const [selectedResults, setSelectedResults] = useState<string[]>([]);
  const [apiStatus, setApiStatus] = useState<Record<string, boolean>>({});
  const [showSetup, setShowSetup] = useState(false);

  const platforms: SearchPlatform[] = ['Google Business', 'Google Maps', 'Google Places', 'Facebook', 'LinkedIn', 'Yellow Pages'];

  useEffect(() => {
    const status = checkApiStatus();
    setApiStatus(status);
  }, []);

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

    try {
      const searchResults = await searchProspects({
        query: searchQuery,
        location: location,
        category: category,
        platforms: selectedPlatforms
      });

      setResults(searchResults);

      if (searchResults.length === 0) {
        alert('No results found. Try adjusting your search query or location.');
      }
    } catch (error: any) {
      console.error('Search error:', error);
      const errorMessage = error?.message || 'Search failed. Please check your API configuration.';
      alert(errorMessage);
    } finally {
      setIsSearching(false);
    }
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

  const handleViewProspect = async (result: ProspectResult, e: React.MouseEvent) => {
    e.stopPropagation();

    try {
      const supabaseUrl = process.env.REACT_APP_SUPABASE_URL;
      const supabaseKey = process.env.REACT_APP_SUPABASE_ANON_KEY;

      const response = await fetch(`${supabaseUrl}/functions/v1/prospects-api/prospects`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${supabaseKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          place_id: result.id,
          business_name: result.name,
          address: result.address,
          phone: result.phone,
          website: result.website,
          rating: result.rating,
          total_ratings: result.totalRatings,
          types: result.category ? [result.category] : []
        })
      });

      if (!response.ok) {
        const data = await response.json();
        if (data.prospect_id) {
          navigate(`/prospects/${data.prospect_id}`);
          return;
        }
        throw new Error('Failed to save prospect');
      }

      const data = await response.json();
      navigate(`/prospects/${data.id}`);
    } catch (error) {
      console.error('Error saving prospect:', error);
      alert('Failed to save prospect. Please try again.');
    }
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

  const hasAnyApiKey = Object.values(apiStatus).some(status => status);

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

        {!hasAnyApiKey && (
          <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-700 rounded-2xl p-6">
            <div className="flex items-start space-x-4">
              <div className="text-3xl">⚠️</div>
              <div className="flex-1">
                <h3 className="font-bold text-yellow-900 dark:text-yellow-100 mb-2">API Keys Required</h3>
                <p className="text-sm text-yellow-800 dark:text-yellow-200 mb-4">
                  To search across platforms, you need to configure API keys. Add these to your .env file:
                </p>
                <div className="bg-slate-900 dark:bg-black/50 rounded-lg p-4 font-mono text-xs text-green-400 space-y-1">
                  <div>VITE_GOOGLE_PLACES_API_KEY=your_key_here</div>
                  <div>VITE_GOOGLE_MAPS_API_KEY=your_key_here</div>
                </div>
                <button
                  onClick={() => setShowSetup(!showSetup)}
                  className="mt-4 text-sm font-bold text-yellow-700 dark:text-yellow-300 hover:underline"
                >
                  {showSetup ? 'Hide' : 'Show'} Setup Instructions
                </button>
                {showSetup && (
                  <div className="mt-4 space-y-3 text-sm text-yellow-800 dark:text-yellow-200">
                    <div>
                      <strong>1. Google Places API:</strong>
                      <ul className="ml-4 mt-1 list-disc">
                        <li>Go to <a href="https://console.cloud.google.com/" target="_blank" rel="noopener noreferrer" className="underline">Google Cloud Console</a></li>
                        <li>Enable "Places API" and "Maps JavaScript API"</li>
                        <li>Create an API key under Credentials</li>
                        <li>Add to .env: VITE_GOOGLE_PLACES_API_KEY=your_key</li>
                      </ul>
                    </div>
                    <div>
                      <strong>2. Facebook Graph API:</strong>
                      <ul className="ml-4 mt-1 list-disc">
                        <li>Create app at <a href="https://developers.facebook.com/" target="_blank" rel="noopener noreferrer" className="underline">Facebook Developers</a></li>
                        <li>Get access token with business_management permissions</li>
                      </ul>
                    </div>
                    <div>
                      <strong>3. LinkedIn API:</strong>
                      <ul className="ml-4 mt-1 list-disc">
                        <li>Create app at <a href="https://www.linkedin.com/developers/" target="_blank" rel="noopener noreferrer" className="underline">LinkedIn Developers</a></li>
                        <li>Requires company verification and OAuth flow</li>
                      </ul>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        <div className="bg-white dark:bg-slate-900/50 rounded-2xl border border-slate-200 dark:border-white/10 p-6 space-y-6 shadow-sm">
          <div>
            <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider mb-2">
              Select Platforms
            </label>
            <div className="flex flex-wrap gap-2">
              {platforms.map(platform => {
                const isPlatformConfigured =
                  (platform.includes('Google') && apiStatus.googlePlaces) ||
                  (platform === 'Facebook' && apiStatus.facebook) ||
                  (platform === 'LinkedIn' && apiStatus.linkedin) ||
                  (platform === 'Yellow Pages' && apiStatus.yellowPages);

                return (
                  <button
                    key={platform}
                    onClick={() => togglePlatform(platform)}
                    disabled={!isPlatformConfigured}
                    className={`px-4 py-2 rounded-lg font-bold text-xs transition-all relative ${
                      selectedPlatforms.includes(platform)
                        ? 'bg-indigo-600 text-white shadow-md'
                        : isPlatformConfigured
                        ? 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-600 opacity-50 cursor-not-allowed'
                    }`}
                  >
                    {platform}
                    {isPlatformConfigured && <span className="ml-1">✓</span>}
                    {!isPlatformConfigured && <span className="ml-1">🔒</span>}
                  </button>
                );
              })}
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

                      <div className="grid grid-cols-2 gap-3 text-xs mb-3">
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
                            <a href={result.website} target="_blank" rel="noopener noreferrer" className="truncate hover:text-indigo-600 dark:hover:text-indigo-400" onClick={(e) => e.stopPropagation()}>
                              {result.website.replace('https://', '')}
                            </a>
                          </div>
                        )}
                      </div>

                      <button
                        onClick={(e) => handleViewProspect(result, e)}
                        className="w-full px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-lg transition-colors"
                      >
                        View Full Profile & Generate Reports
                      </button>
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
