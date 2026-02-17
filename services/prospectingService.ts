export interface ProspectResult {
  id: string;
  name: string;
  platform: SearchPlatform;
  address?: string;
  phone?: string;
  email?: string;
  website?: string;
  rating?: number;
  totalRatings?: number;
  category?: string;
  description?: string;
  placeId?: string;
  coordinates?: {
    lat: number;
    lng: number;
  };
}

export type SearchPlatform = 'Google Business' | 'Google Maps' | 'Google Places' | 'Facebook' | 'LinkedIn' | 'Yellow Pages';

interface SearchParams {
  query: string;
  location?: string;
  category?: string;
  platforms: SearchPlatform[];
}

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || '';
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || '';
const FACEBOOK_ACCESS_TOKEN = import.meta.env.VITE_FACEBOOK_ACCESS_TOKEN || '';
const LINKEDIN_ACCESS_TOKEN = import.meta.env.VITE_LINKEDIN_ACCESS_TOKEN || '';

export const searchGooglePlaces = async (query: string, location: string): Promise<ProspectResult[]> => {
  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
    throw new Error('Supabase configuration missing. Please check your .env file.');
  }

  try {
    const params = new URLSearchParams({
      action: 'search',
      query: query,
    });

    if (location) {
      params.append('location', location);
    }

    const response = await fetch(
      `${SUPABASE_URL}/functions/v1/google-places-search?${params.toString()}`,
      {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
          'Accept': 'application/json',
        }
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error('API Response Error:', errorText);
      throw new Error(`Google Places API request failed: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();

    if (data.status === 'REQUEST_DENIED') {
      throw new Error(`Google Places API: ${data.error_message || 'Request denied. Check API key and billing.'}`);
    }

    if (data.status === 'INVALID_REQUEST') {
      throw new Error('Invalid request. Please check your search parameters.');
    }

    if (data.status !== 'OK' && data.status !== 'ZERO_RESULTS') {
      throw new Error(`Google Places API error: ${data.status} - ${data.error_message || 'Unknown error'}`);
    }

    if (data.status === 'ZERO_RESULTS') {
      return [];
    }

    return (data.results || []).map((place: any) => ({
      id: place.place_id,
      name: place.name,
      platform: 'Google Places' as SearchPlatform,
      address: place.formatted_address,
      rating: place.rating,
      placeId: place.place_id,
      coordinates: place.geometry?.location,
      category: place.types?.[0]?.replace(/_/g, ' '),
    }));
  } catch (error) {
    console.error('Error searching Google Places:', error);
    throw error;
  }
};

export const getPlaceDetails = async (placeId: string): Promise<Partial<ProspectResult>> => {
  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
    return {};
  }

  try {
    const params = new URLSearchParams({
      action: 'details',
      placeId: placeId,
    });

    const response = await fetch(
      `${SUPABASE_URL}/functions/v1/google-places-search?${params.toString()}`,
      {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
          'Accept': 'application/json',
        }
      }
    );

    const data = await response.json();

    if (data.status === 'OK' && data.result) {
      return {
        phone: data.result.formatted_phone_number,
        website: data.result.website,
      };
    }

    return {};
  } catch (error) {
    console.error('Error fetching place details:', error);
    return {};
  }
};

export const searchFacebookPlaces = async (query: string, location: string): Promise<ProspectResult[]> => {
  if (!FACEBOOK_ACCESS_TOKEN) {
    throw new Error('Facebook access token not configured');
  }

  try {
    const searchQuery = location ? `${query} ${location}` : query;
    const params = new URLSearchParams({
      q: searchQuery,
      type: 'page',
      fields: 'id,name,location,phone,website,emails,rating_count,overall_star_rating,category,about',
      access_token: FACEBOOK_ACCESS_TOKEN,
      limit: '20'
    });

    const response = await fetch(
      `https://graph.facebook.com/v19.0/search?${params.toString()}`,
      {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
        }
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`Facebook API error: ${errorData.error?.message || response.statusText}`);
    }

    const data = await response.json();

    return (data.data || []).map((page: any) => ({
      id: page.id,
      name: page.name,
      platform: 'Facebook' as SearchPlatform,
      address: page.location ?
        `${page.location.street || ''} ${page.location.city || ''}, ${page.location.state || ''} ${page.location.zip || ''}`.trim()
        : undefined,
      phone: page.phone,
      email: page.emails?.[0],
      website: page.website,
      rating: page.overall_star_rating,
      totalRatings: page.rating_count,
      category: page.category,
      description: page.about,
      coordinates: page.location ? {
        lat: page.location.latitude,
        lng: page.location.longitude
      } : undefined
    }));
  } catch (error) {
    console.error('Error searching Facebook Places:', error);
    throw error;
  }
};

export const searchLinkedInCompanies = async (query: string, location: string): Promise<ProspectResult[]> => {
  if (!LINKEDIN_ACCESS_TOKEN) {
    throw new Error('LinkedIn access token not configured');
  }

  try {
    const keywords = location ? `${query} ${location}` : query;
    const params = new URLSearchParams({
      keywords: keywords,
      start: '0',
      count: '20'
    });

    const response = await fetch(
      `https://api.linkedin.com/v2/organizationSearchResults?${params.toString()}`,
      {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${LINKEDIN_ACCESS_TOKEN}`,
          'Accept': 'application/json',
          'X-Restli-Protocol-Version': '2.0.0'
        }
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`LinkedIn API error: ${errorData.message || response.statusText}`);
    }

    const data = await response.json();

    return (data.elements || []).map((org: any) => {
      const company = org.company || {};
      const location = company.locations?.[0];

      return {
        id: company.id?.toString() || org.id?.toString(),
        name: company.name || company.localizedName || 'Unknown Company',
        platform: 'LinkedIn' as SearchPlatform,
        address: location ?
          `${location.line1 || ''} ${location.city || ''}, ${location.geographicArea || ''} ${location.postalCode || ''}`.trim()
          : undefined,
        phone: company.phone,
        email: company.email,
        website: company.websiteUrl,
        category: company.industries?.[0],
        description: company.description || company.localizedDescription,
      };
    });
  } catch (error) {
    console.error('Error searching LinkedIn Companies:', error);
    throw error;
  }
};

export const searchProspects = async (params: SearchParams): Promise<ProspectResult[]> => {
  const results: ProspectResult[] = [];

  for (const platform of params.platforms) {
    switch (platform) {
      case 'Google Places':
      case 'Google Maps':
      case 'Google Business':
        if (SUPABASE_URL && SUPABASE_ANON_KEY) {
          const googleResults = await searchGooglePlaces(params.query, params.location || '');

          const detailedResults = await Promise.all(
            googleResults.map(async (result) => {
              if (result.placeId) {
                const details = await getPlaceDetails(result.placeId);
                return { ...result, ...details, platform };
              }
              return { ...result, platform };
            })
          );

          results.push(...detailedResults);
        }
        break;

      case 'Facebook':
        if (FACEBOOK_ACCESS_TOKEN) {
          const facebookResults = await searchFacebookPlaces(params.query, params.location || '');
          results.push(...facebookResults);
        } else {
          console.warn('Facebook access token not configured');
        }
        break;

      case 'LinkedIn':
        if (LINKEDIN_ACCESS_TOKEN) {
          const linkedinResults = await searchLinkedInCompanies(params.query, params.location || '');
          results.push(...linkedinResults);
        } else {
          console.warn('LinkedIn access token not configured');
        }
        break;

      case 'Yellow Pages':
        console.warn('Yellow Pages API integration requires setup');
        break;
    }
  }

  return results;
};

export const checkApiStatus = () => {
  return {
    googlePlaces: !!(SUPABASE_URL && SUPABASE_ANON_KEY),
    googleMaps: !!(SUPABASE_URL && SUPABASE_ANON_KEY),
    facebook: !!FACEBOOK_ACCESS_TOKEN,
    linkedin: !!LINKEDIN_ACCESS_TOKEN,
    yellowPages: false,
  };
};
