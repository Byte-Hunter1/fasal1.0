import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { pincode } = await req.json();
    
    if (!pincode) {
      throw new Error('Pincode is required');
    }

    // Validate Indian pincode format (6 digits)
    const pincodeRegex = /^[1-9][0-9]{5}$/;
    if (!pincodeRegex.test(pincode)) {
      throw new Error('Invalid Indian pincode format');
    }

    const OPENWEATHER_API_KEY = Deno.env.get('OPENWEATHER_API_KEY');
    
    if (!OPENWEATHER_API_KEY) {
      throw new Error('OpenWeather API key not configured');
    }

    // Get location details from OpenWeather geocoding API
    const geoResponse = await fetch(
      `https://api.openweathermap.org/geo/1.0/zip?zip=${pincode},IN&appid=${OPENWEATHER_API_KEY}`
    );
    
    if (!geoResponse.ok) {
      if (geoResponse.status === 404) {
        throw new Error('Pincode not found. Please check and try again.');
      }
      throw new Error('Failed to fetch location data');
    }
    
    const geoData = await geoResponse.json();

    // Get state from coordinates using reverse geocoding
    const reverseGeoResponse = await fetch(
      `https://api.openweathermap.org/geo/1.0/reverse?lat=${geoData.lat}&lon=${geoData.lon}&limit=1&appid=${OPENWEATHER_API_KEY}`
    );

    let state = 'Unknown';
    if (reverseGeoResponse.ok) {
      const reverseGeoData = await reverseGeoResponse.json();
      if (reverseGeoData.length > 0) {
        state = reverseGeoData[0].state || 'Unknown';
      }
    }

    const locationData = {
      pincode: pincode,
      name: geoData.name,
      state: state,
      country: geoData.country,
      latitude: geoData.lat,
      longitude: geoData.lon,
      district: getDistrictFromName(geoData.name, state),
      region: getRegionFromState(state)
    };

    console.log('Location data fetched successfully for pincode:', pincode);

    return new Response(JSON.stringify(locationData), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in get-location function:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

function getDistrictFromName(name: string, state: string): string {
  // In many cases, the name from geocoding API is the district name
  // This is a simplified approach - in production, you'd have a comprehensive mapping
  return name;
}

function getRegionFromState(state: string): string {
  const regionMap: { [key: string]: string } = {
    'Punjab': 'North India',
    'Haryana': 'North India',
    'Uttar Pradesh': 'North India',
    'Uttarakhand': 'North India',
    'Himachal Pradesh': 'North India',
    'Jammu and Kashmir': 'North India',
    'Delhi': 'North India',
    'Rajasthan': 'North India',
    
    'Maharashtra': 'West India',
    'Gujarat': 'West India',
    'Goa': 'West India',
    'Dadra and Nagar Haveli': 'West India',
    'Daman and Diu': 'West India',
    
    'Karnataka': 'South India',
    'Tamil Nadu': 'South India',
    'Kerala': 'South India',
    'Andhra Pradesh': 'South India',
    'Telangana': 'South India',
    'Pondicherry': 'South India',
    
    'West Bengal': 'East India',
    'Bihar': 'East India',
    'Jharkhand': 'East India',
    'Odisha': 'East India',
    'Sikkim': 'East India',
    
    'Madhya Pradesh': 'Central India',
    'Chhattisgarh': 'Central India',
    
    'Assam': 'Northeast India',
    'Arunachal Pradesh': 'Northeast India',
    'Manipur': 'Northeast India',
    'Meghalaya': 'Northeast India',
    'Mizoram': 'Northeast India',
    'Nagaland': 'Northeast India',
    'Tripura': 'Northeast India'
  };
  
  return regionMap[state] || 'India';
}