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

const GOOGLE_PLACES_API_KEY = import.meta.env.VITE_GOOGLE_PLACES_API_KEY || '';
const GOOGLE_MAPS_API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY || '';

export const searchGooglePlaces = async (query: string, location: string): Promise<ProspectResult[]> => {
  if (!GOOGLE_PLACES_API_KEY || GOOGLE_PLACES_API_KEY === 'your_google_places_api_key_here') {
    throw new Error('Google Places API key not configured. Please add VITE_GOOGLE_PLACES_API_KEY to your .env file.');
  }

  try {
    const searchQuery = location ? `${query} in ${location}` : query;

    const response = await fetch(
      `https://maps.googleapis.com/maps/api/place/textsearch/json?query=${encodeURIComponent(searchQuery)}&key=${GOOGLE_PLACES_API_KEY}`,
      {
        method: 'GET',
        headers: {
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
  if (!GOOGLE_PLACES_API_KEY) {
    return {};
  }

  try {
    const response = await fetch(
      `https://maps.googleapis.com/maps/api/place/details/json?place_id=${placeId}&fields=formatted_phone_number,website,opening_hours,business_status&key=${GOOGLE_PLACES_API_KEY}`
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
        if (GOOGLE_PLACES_API_KEY) {
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
    googlePlaces: !!GOOGLE_PLACES_API_KEY,
    googleMaps: !!GOOGLE_MAPS_API_KEY,
    facebook: false,
    linkedin: false,
    yellowPages: false,
  };
};
