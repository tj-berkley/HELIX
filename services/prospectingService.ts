export interface ProspectResult {
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
        console.warn('Facebook Graph API integration requires setup');
        break;

      case 'LinkedIn':
        console.warn('LinkedIn API integration requires OAuth setup');
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
    facebook: false,
    linkedin: false,
    yellowPages: false,
  };
};
