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

    const OPENWEATHER_API_KEY = Deno.env.get('OPENWEATHER_API_KEY');
    
    if (!OPENWEATHER_API_KEY) {
      throw new Error('OpenWeather API key not configured');
    }

    // Get coordinates from pincode (using OpenWeather geocoding)
    const geoResponse = await fetch(
      `https://api.openweathermap.org/geo/1.0/zip?zip=${pincode},IN&appid=${OPENWEATHER_API_KEY}`
    );
    
    if (!geoResponse.ok) {
      throw new Error('Invalid pincode or geocoding failed');
    }
    
    const geoData = await geoResponse.json();
    const { lat, lon, name } = geoData;

    // Get current weather
    const weatherResponse = await fetch(
      `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${OPENWEATHER_API_KEY}&units=metric`
    );

    // Get 7-day forecast
    const forecastResponse = await fetch(
      `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${OPENWEATHER_API_KEY}&units=metric`
    );

    if (!weatherResponse.ok || !forecastResponse.ok) {
      throw new Error('Failed to fetch weather data');
    }

    const currentWeather = await weatherResponse.json();
    const forecastData = await forecastResponse.json();

    // Process forecast data - get daily averages
    const dailyForecasts = [];
    const processedDates = new Set();

    for (const item of forecastData.list) {
      const date = new Date(item.dt * 1000);
      const dateStr = date.toDateString();
      
      if (!processedDates.has(dateStr) && dailyForecasts.length < 7) {
        processedDates.add(dateStr);
        
        // Get all forecasts for this date
        const dayForecasts = forecastData.list.filter((f: any) => {
          const fDate = new Date(f.dt * 1000);
          return fDate.toDateString() === dateStr;
        });

        // Calculate averages
        const avgTemp = dayForecasts.reduce((sum: number, f: any) => sum + f.main.temp, 0) / dayForecasts.length;
        const maxTemp = Math.max(...dayForecasts.map((f: any) => f.main.temp_max));
        const minTemp = Math.min(...dayForecasts.map((f: any) => f.main.temp_min));
        
        // Calculate total rainfall for the day
        const totalRain = dayForecasts.reduce((sum: number, f: any) => {
          return sum + (f.rain?.['3h'] || 0);
        }, 0);

        dailyForecasts.push({
          date: date.toLocaleDateString('en-IN', { month: 'short', day: 'numeric' }),
          high: Math.round(maxTemp),
          low: Math.round(minTemp),
          description: dayForecasts[0].weather[0].description,
          rainfall: Math.round(totalRain),
          icon: getWeatherIcon(dayForecasts[0].weather[0].main)
        });
      }
    }

    const weatherData = {
      location: `${name}, ${currentWeather.sys.country}`,
      current: {
        temperature: Math.round(currentWeather.main.temp),
        description: currentWeather.weather[0].description,
        humidity: currentWeather.main.humidity,
        windSpeed: currentWeather.wind.speed,
        pressure: currentWeather.main.pressure,
        icon: getWeatherIcon(currentWeather.weather[0].main)
      },
      forecast: dailyForecasts
    };

    console.log('Weather data fetched successfully for pincode:', pincode);

    return new Response(JSON.stringify(weatherData), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in get-weather function:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

function getWeatherIcon(condition: string): string {
  const iconMap: { [key: string]: string } = {
    'Clear': '☀️',
    'Clouds': '☁️',
    'Rain': '🌧️',
    'Drizzle': '🌦️',
    'Thunderstorm': '⛈️',
    'Snow': '❄️',
    'Mist': '🌫️',
    'Fog': '🌫️',
    'Haze': '🌫️'
  };
  
  return iconMap[condition] || '🌤️';
}