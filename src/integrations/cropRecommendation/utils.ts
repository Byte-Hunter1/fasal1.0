/**
 * Crop Recommendation Utilities
 * 
 * Helper functions for working with the crop recommendation service
 */

import { CropRecommendationParams } from './service';

// Define the FormData interface to match the one in Results.tsx
interface FormData {
  pincode: string;
  farmArea: number;
  areaUnit: 'acres' | 'hectares';
  previousCrops: string[];
  rainfall?: string; // Optional rainfall data that might be provided by the user
}

/**
 * Convert form data to crop recommendation parameters
 * 
 * This function takes the form data from the application and converts it
 * to the format expected by the crop recommendation service.
 * 
 * @param formData The form data from the application
 * @param weatherData Optional weather data to supplement the form data
 * @param soilData Optional soil data to supplement the form data
 * @param locationData Optional location data to supplement the form data
 * @returns Parameters for crop recommendation
 */
/**
 * Get seasonal rainfall estimate based on location and current season
 * 
 * @param locationData Location data with state information
 * @returns Estimated rainfall in mm
 */
const getSeasonalRainfallEstimate = (locationData: any): number => {
  if (!locationData || !locationData.state) {
    return 100; // Default moderate rainfall
  }
  
  const state = locationData.state.toLowerCase();
  const currentMonth = new Date().getMonth() + 1; // 1-12
  const isKharif = currentMonth >= 6 && currentMonth <= 9; // June to September (monsoon)
  const isRabi = currentMonth >= 10 || currentMonth <= 2; // October to February (winter)
  const isZaid = currentMonth >= 3 && currentMonth <= 5; // March to May (summer)
  
  // Rainfall estimates by state and season (mm)
  const rainfallMap: Record<string, Record<string, number>> = {
    'punjab': { kharif: 400, rabi: 100, zaid: 50 },
    'haryana': { kharif: 350, rabi: 80, zaid: 40 },
    'uttar pradesh': { kharif: 800, rabi: 120, zaid: 60 },
    'bihar': { kharif: 1000, rabi: 150, zaid: 80 },
    'west bengal': { kharif: 1200, rabi: 200, zaid: 100 },
    'odisha': { kharif: 1100, rabi: 180, zaid: 90 },
    'madhya pradesh': { kharif: 900, rabi: 120, zaid: 60 },
    'gujarat': { kharif: 700, rabi: 100, zaid: 50 },
    'maharashtra': { kharif: 1800, rabi: 150, zaid: 70 },
    'karnataka': { kharif: 1500, rabi: 200, zaid: 100 },
    'tamil nadu': { kharif: 600, rabi: 400, zaid: 200 }, // Different monsoon pattern
    'andhra pradesh': { kharif: 800, rabi: 150, zaid: 80 },
    'telangana': { kharif: 750, rabi: 120, zaid: 60 },
    'kerala': { kharif: 2000, rabi: 300, zaid: 150 },
    'rajasthan': { kharif: 400, rabi: 50, zaid: 30 },
  };
  
  // Find matching state (partial match)
  const matchingState = Object.keys(rainfallMap).find(s => 
    state.includes(s) || s.includes(state)
  );
  
  if (!matchingState) {
    return 100; // Default if no state match
  }
  
  // Return rainfall based on season
  if (isKharif) return rainfallMap[matchingState].kharif;
  if (isRabi) return rainfallMap[matchingState].rabi;
  if (isZaid) return rainfallMap[matchingState].zaid;
  
  return 100; // Default fallback
};

/**
 * Convert form data to crop recommendation parameters
 * 
 * This function takes the form data from the application and converts it
 * to the format expected by the crop recommendation service.
 * 
 * @param formData The form data from the application
 * @param weatherData Optional weather data to supplement the form data
 * @param soilData Optional soil data to supplement the form data
 * @param locationData Optional location data to supplement the form data
 * @returns Parameters for crop recommendation
 */
export const formDataToCropParams = (
  formData: FormData,
  weatherData?: { temperature?: number; humidity?: number; forecast?: Array<{rainfall?: number}> },
  soilData?: { ph?: number; nitrogen?: number; phosphorus?: number; potassium?: number; moisture?: number },
  locationData?: any
): CropRecommendationParams => {
  // Default values based on average ranges
  const defaultParams: CropRecommendationParams = {
    nitrogen: 50,      // Mid-range N value
    phosphorus: 50,    // Mid-range P value
    potassium: 50,     // Mid-range K value
    temperature: 25,   // Moderate temperature (°C)
    humidity: 60,      // Moderate humidity (%)
    ph: 6.5,           // Neutral pH
    rainfall: 100      // Moderate rainfall (mm)
  };
  
  // Add small random variations to make recommendations more dynamic
  // This simulates natural variations in environmental conditions
  const addVariation = (value: number, range: number = 0.1) => {
    const variation = (Math.random() * 2 - 1) * range * value;
    return value + variation;
  };
  
  // Calculate average temperature from forecast if available
  let avgTemperature = addVariation(defaultParams.temperature);
  let avgHumidity = addVariation(defaultParams.humidity);
  let estimatedRainfall = addVariation(defaultParams.rainfall);
  
  if (weatherData) {
    // Use current temperature if available, with slight variation
    if (weatherData.temperature) {
      avgTemperature = addVariation(weatherData.temperature, 0.05); // 5% variation
    }
    
    // Use current humidity if available, with slight variation
    if (weatherData.humidity) {
      avgHumidity = addVariation(weatherData.humidity, 0.05); // 5% variation
    }
    
    // Calculate rainfall from forecast if available
    if (weatherData.forecast && weatherData.forecast.length > 0) {
      const rainfallValues = weatherData.forecast
        .filter(day => day.rainfall !== undefined)
        .map(day => day.rainfall as number);
      
      if (rainfallValues.length > 0) {
        // Sum of rainfall over forecast period with slight variation
        const baseRainfall = rainfallValues.reduce((sum, val) => sum + val, 0);
        estimatedRainfall = addVariation(baseRainfall, 0.1); // 10% variation
      }
    }
  }
  
  // If no rainfall data from forecast, estimate based on location and season
  if (estimatedRainfall === defaultParams.rainfall && locationData) {
    const baseEstimate = getSeasonalRainfallEstimate(locationData);
    estimatedRainfall = addVariation(baseEstimate, 0.15); // 15% variation
  }
  
  // Adjust soil parameters based on moisture if available
  let moistureAdjustment = 1.0;
  if (soilData && soilData.moisture !== undefined) {
    // Soil moisture affects nutrient availability
    // Too dry or too wet reduces nutrient availability
    const optimalMoisture = 60; // 60% is optimal for most crops
    const moistureDiff = Math.abs(soilData.moisture - optimalMoisture);
    moistureAdjustment = Math.max(0.7, 1 - (moistureDiff / 100));
    
    // Add slight variation to moisture adjustment
    moistureAdjustment = addVariation(moistureAdjustment, 0.05); // 5% variation
  }

  // Override defaults with form data and additional data
  return {
    ...defaultParams,
    // Use soil data if available, adjusted by moisture
    ...(soilData && {
      ph: addVariation(soilData.ph ?? defaultParams.ph, 0.03),
      nitrogen: addVariation((soilData.nitrogen ?? defaultParams.nitrogen) * moistureAdjustment, 0.08),
      phosphorus: addVariation((soilData.phosphorus ?? defaultParams.phosphorus) * moistureAdjustment, 0.08),
      potassium: addVariation((soilData.potassium ?? defaultParams.potassium) * moistureAdjustment, 0.08)
    }),
    // Use weather data with variations
    temperature: avgTemperature,
    humidity: avgHumidity,
    rainfall: estimatedRainfall,
    // Use rainfall from form data if explicitly provided, with minimal variation
    ...(formData.rainfall && { rainfall: addVariation(parseFloat(formData.rainfall), 0.02) })
  };
};
