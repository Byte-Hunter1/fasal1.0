/**
 * Crop Recommendation Service
 * 
 * This service provides crop recommendations based on soil and weather parameters
 * using a machine learning model approach similar to the Streamlit app.
 */

import { Crop } from '../../data/mockData';
import { getModelPredictions } from './modelLoader';

// Define the input parameters for crop recommendation
// Soil parameters are optional when using the soil API with pincode
export interface CropRecommendationParams {
  nitrogen?: number;      // N value (0-140)
  phosphorus?: number;    // P value (5-145)
  potassium?: number;     // K value (5-205)
  temperature?: number;   // Temperature in Celsius (10-44)
  humidity?: number;      // Humidity percentage (15-99)
  ph?: number;           // pH value (3.5-9.9)
  rainfall?: number;      // Rainfall in mm (20-298)
  season?: string;       // Current growing season
  state?: string;        // Geographic state/region
}

// Define the crop labels used in the model
const CROP_LABELS = [
  'rice', 'maize', 'jute', 'cotton', 'coconut', 'papaya', 'orange', 'apple',
  'muskmelon', 'watermelon', 'grapes', 'mango', 'banana', 'pomegranate',
  'lentil', 'blackgram', 'mungbean', 'mothbeans', 'pigeonpeas', 'kidneybeans',
  'chickpea', 'coffee'
];

// Extended crop type for internal use with additional properties
interface ExtendedCrop extends Crop {
  suitabilityScore?: number;
  seasonalSuitability?: string;
  isModelRecommended?: boolean;
  nutrientRequirements?: {
    nitrogen: number;
    phosphorus: number;
    potassium: number;
  };
  waterRequirements?: number;
  estimatedYield?: {
    min: number;
    max: number;
  };
  marketValue?: {
    min: number;
    max: number;
  };
  idealTemperature?: {
    min: number;
    max: number;
  };
  idealSoilPh?: {
    min: number;
    max: number;
  };
}

/**
 * Get default crops if none are provided
 * @returns Array of default crops
 */
const getDefaultCrops = (): Crop[] => {
  return CROP_LABELS.map((label, index) => ({
    id: index + 1,
    name_en: label,
    name_hi: label, // Placeholder for Hindi name
    season: ['kharif', 'rabi', 'zaid'][Math.floor(Math.random() * 3)] as 'kharif' | 'rabi' | 'zaid',
    soil_ph_min: 5 + Math.random() * 1,
    soil_ph_max: 7 + Math.random() * 1,
    temperature_min: 15 + Math.random() * 10,
    temperature_max: 30 + Math.random() * 10,
    rainfall_min: 50 + Math.random() * 50,
    rainfall_max: 150 + Math.random() * 100,
    investment_per_acre: 20000 + Math.random() * 30000,
    expected_yield_per_acre: 15 + Math.random() * 20,
    roi_percentage: 30 + Math.random() * 70,
    current_price_per_kg: 20 + Math.random() * 40,
    growing_states: ["Punjab", "Haryana", "UP"],
    image: `/crops/${label.toLowerCase().replace(/\s+/g, '-')}.jpg`,
    description_en: `${label} is a popular crop in India.`,
    description_hi: `${label} भारत में एक लोकप्रिय फसल है।`
  }));
};

/**
 * Get seasonality factor for a crop based on season
 * @param season Current season
 * @param cropName Crop name
 * @returns Seasonality factor between 0.7 and 1.3
 */
const getSeasonalityFactor = (season?: string, cropName: string = ''): number => {
  if (!season) return 1.0; // No season data, neutral factor
  
  // Define seasonal suitability for common crops
  const seasonalCrops: Record<string, Record<string, number>> = {
    'winter': {
      'wheat': 1.3,
      'potato': 1.2,
      'mustard': 1.2,
      'peas': 1.2,
      'default': 0.9
    },
    'summer': {
      'rice': 1.2,
      'maize': 1.2,
      'cotton': 1.3,
      'sugarcane': 1.2,
      'default': 0.9
    },
    'monsoon': {
      'rice': 1.3,
      'maize': 1.2,
      'soybean': 1.2,
      'cotton': 1.1,
      'default': 0.9
    },
    'default': {
      'default': 1.0
    }
  };
  
  const seasonData = seasonalCrops[season.toLowerCase()] || seasonalCrops['default'];
  return seasonData[cropName.toLowerCase()] || seasonData['default'];
};

/**
 * Get seasonal suitability label based on factor
 * @param factor Seasonality factor
 * @returns Label describing seasonal suitability
 */
const getSeasonalSuitabilityLabel = (factor: number): string => {
  if (factor >= 1.2) return 'excellent';
  if (factor >= 1.1) return 'good';
  if (factor >= 0.9) return 'moderate';
  if (factor >= 0.8) return 'poor';
  return 'unsuitable';
};

/**
 * Get current growing season based on month
 * @returns Current season (winter, summer, monsoon)
 */
const getCurrentSeason = (): string => {
  const month = new Date().getMonth();
  // Winter: November to February (10-1)
  if (month >= 10 || month <= 1) return 'winter';
  // Summer: March to June (2-5)
  if (month >= 2 && month <= 5) return 'summer';
  // Monsoon: July to October (6-9)
  return 'monsoon';
};

/**
 * Normalize parameters to the ranges expected by the model
 * @param params Raw input parameters (can be partial if pincode is provided)
 * @returns Normalized parameters
 */
const normalizeParameters = (params: Partial<CropRecommendationParams>): Partial<CropRecommendationParams> => {
  return {
    ...params,
    // Already normalized in the form, but ensure they're in proper range
    nitrogen: params.nitrogen !== undefined ? Math.min(Math.max(params.nitrogen, 0), 1) : undefined,
    phosphorus: params.phosphorus !== undefined ? Math.min(Math.max(params.phosphorus, 0), 1) : undefined,
    potassium: params.potassium !== undefined ? Math.min(Math.max(params.potassium, 0), 1) : undefined,
    temperature: params.temperature !== undefined ? Math.min(Math.max(params.temperature, 0), 1) : undefined,
    humidity: params.humidity !== undefined ? Math.min(Math.max(params.humidity, 0), 1) : undefined,
    ph: params.ph !== undefined ? Math.min(Math.max(params.ph, 0), 1) : undefined,
    rainfall: params.rainfall !== undefined ? Math.min(Math.max(params.rainfall, 0), 1) : undefined
  };
};

/**
 * Calculate nutrient score based on crop requirements and soil parameters
 * @param params Soil parameters (can be partial if pincode is provided)
 * @param crop Crop to evaluate
 * @returns Nutrient suitability score
 */
const calculateNutrientScore = (params: Partial<CropRecommendationParams>, crop: ExtendedCrop): number => {
  // This is a simplified approach - in a real system, we would have more precise
  // nutrient requirements for each crop and more sophisticated scoring
  
  // Get the crop's nutrient requirements (or use defaults if not available)
  const nReq = crop.nutrientRequirements?.nitrogen || 70; // Default mid-range value
  const pReq = crop.nutrientRequirements?.phosphorus || 75; // Default mid-range value
  const kReq = crop.nutrientRequirements?.potassium || 100; // Default mid-range value
  
  // Initialize scores with neutral values
  let nScore = 0.5;
  let pScore = 0.5;
  let kScore = 0.5;
  
  // Calculate nitrogen score if provided
  if (params.nitrogen !== undefined) {
    // Denormalize the N value to its actual range
    const nValue = params.nitrogen * 140; // 0-140 range
    // Calculate how well the soil nitrogen matches the crop requirements
    nScore = 1 - Math.min(Math.abs(nValue - nReq) / nReq, 1) * 0.8;
  }
  
  // Calculate phosphorus score if provided
  if (params.phosphorus !== undefined) {
    // Denormalize the P value to its actual range
    const pValue = params.phosphorus * (145 - 5) + 5; // 5-145 range
    // Calculate how well the soil phosphorus matches the crop requirements
    pScore = 1 - Math.min(Math.abs(pValue - pReq) / pReq, 1) * 0.8;
  }
  
  // Calculate potassium score if provided
  if (params.potassium !== undefined) {
    // Denormalize the K value to its actual range
    const kValue = params.potassium * (205 - 5) + 5; // 5-205 range
    // Calculate how well the soil potassium matches the crop requirements
    kScore = 1 - Math.min(Math.abs(kValue - kReq) / kReq, 1) * 0.8;
  }
  
  // Return weighted average of NPK scores
  return (nScore + pScore + kScore) / 3;
};

/**
 * Process crops for display by formatting values
 * @param crops Array of crops with scores
 * @returns Processed crops ready for display
 */
const processCropsForDisplay = (crops: ExtendedCrop[]): Crop[] => {
  return crops.map(crop => {
    // Create a new object with only the properties from the Crop interface
    const processedCrop: Crop = {
      id: crop.id,
      name_en: crop.name_en,
      name_hi: crop.name_hi,
      season: crop.season,
      soil_ph_min: crop.soil_ph_min,
      soil_ph_max: crop.soil_ph_max,
      temperature_min: crop.temperature_min,
      temperature_max: crop.temperature_max,
      rainfall_min: crop.rainfall_min,
      rainfall_max: crop.rainfall_max,
      investment_per_acre: crop.investment_per_acre,
      expected_yield_per_acre: crop.expected_yield_per_acre,
      roi_percentage: crop.roi_percentage,
      current_price_per_kg: crop.current_price_per_kg,
      growing_states: crop.growing_states,
      image: crop.image,
      description_en: crop.description_en,
      description_hi: crop.description_hi
    };
    
    return processedCrop;
  });
};

/**
 * Calculate crop suitability scores based on rule-based approach
 * @param params Input parameters (can be partial if pincode is provided)
 * @param crop Crop to evaluate
 * @returns Suitability score
 */
const calculateCropSuitabilityScore = (params: Partial<CropRecommendationParams>, crop: ExtendedCrop): number => {
  // Define weights for different parameters based on crop type
  const weights = {
    nitrogen: 0.15,
    phosphorus: 0.15,
    potassium: 0.15,
    temperature: 0.2,
    rainfall: 0.2,
    ph: 0.15
  };
  
  // Adjust weights based on crop type
  const cropType = crop.name_en.toLowerCase();
  
  // Adjust weights based on crop type
  if (['rice', 'wheat', 'maize'].includes(cropType)) {
    // Cereals need balanced NPK
    weights.nitrogen = 0.2;
    weights.phosphorus = 0.15;
    weights.potassium = 0.15;
    weights.temperature = 0.2;
    weights.rainfall = 0.2;
    weights.ph = 0.1;
  }
  // Pulses fix their own nitrogen
  else if (['lentil', 'chickpea', 'pigeonpeas', 'blackgram', 'mungbean'].includes(cropType)) {
    weights.nitrogen = 0.05;
    weights.phosphorus = 0.2;
    weights.potassium = 0.2;
    weights.temperature = 0.2;
    weights.rainfall = 0.2;
    weights.ph = 0.15;
  }
  // Fruits are sensitive to climate
  else if (['apple', 'banana', 'mango', 'grapes', 'orange', 'papaya', 'coconut', 'watermelon'].includes(cropType)) {
    weights.nitrogen = 0.15;
    weights.phosphorus = 0.15;
    weights.potassium = 0.2;
    weights.temperature = 0.25;
    weights.rainfall = 0.2;
    weights.ph = 0.15;
  }
  // Cash crops have specific requirements
  else if (['cotton', 'jute', 'coffee'].includes(cropType)) {
    weights.nitrogen = 0.15;
    weights.phosphorus = 0.15;
    weights.potassium = 0.15;
    weights.temperature = 0.25;
    weights.rainfall = 0.2;
    weights.ph = 0.1;
  }
  
  let score = 0;
  
  // Check soil pH suitability with improved scoring
  const phValue = params.ph * (9.9 - 3.5) + 3.5; // Denormalize
  // Calculate optimal pH range for this crop if pH is provided
  if (params.ph !== undefined) {
    const optimalPhMid = (crop.soil_ph_min + crop.soil_ph_max) / 2;
    const phRange = crop.soil_ph_max - crop.soil_ph_min;
    // Score is highest at optimal mid-point, decreases toward edges and beyond
    const phScore = phValue >= crop.soil_ph_min && phValue <= crop.soil_ph_max ? 
      1 - 0.5 * Math.abs(phValue - optimalPhMid) / (phRange / 2) :
      0.5 - Math.min(Math.abs(phValue - crop.soil_ph_min), Math.abs(phValue - crop.soil_ph_max)) / phRange;
    score += weights.ph * Math.max(0, phScore);
  } else {
    // If pH is not provided, use a neutral score
    score += weights.ph * 0.5;
  }
  
  // Check temperature suitability with improved scoring if temperature is provided
  if (params.temperature !== undefined) {
    const tempValue = params.temperature * (44 - 10) + 10; // Denormalize
    const optimalTempMid = (crop.temperature_min + crop.temperature_max) / 2;
    const tempRange = crop.temperature_max - crop.temperature_min;
    const tempScore = tempValue >= crop.temperature_min && tempValue <= crop.temperature_max ? 
      1 - 0.5 * Math.abs(tempValue - optimalTempMid) / (tempRange / 2) :
      0.5 - Math.min(Math.abs(tempValue - crop.temperature_min), Math.abs(tempValue - crop.temperature_max)) / tempRange;
    score += weights.temperature * Math.max(0, tempScore);
  } else {
    // If temperature is not provided, use a neutral score
    score += weights.temperature * 0.5;
  }
  
  // Check rainfall suitability with improved scoring if rainfall is provided
  if (params.rainfall !== undefined) {
    const rainValue = params.rainfall * (298 - 20) + 20; // Denormalize
    const optimalRainMid = (crop.rainfall_min + crop.rainfall_max) / 2;
    const rainRange = crop.rainfall_max - crop.rainfall_min;
    const rainScore = rainValue >= crop.rainfall_min && rainValue <= crop.rainfall_max ? 
      1 - 0.3 * Math.abs(rainValue - optimalRainMid) / (rainRange / 2) :
      0.7 - Math.min(Math.abs(rainValue - crop.rainfall_min), Math.abs(rainValue - crop.rainfall_max)) / rainRange;
    score += weights.rainfall * Math.max(0, rainScore);
  } else {
    // If rainfall is not provided, use a neutral score
    score += weights.rainfall * 0.5;
  }
  
  // Add scores for NPK values if they are provided
  if (params.nitrogen !== undefined || params.phosphorus !== undefined || params.potassium !== undefined) {
    const nutrientScore = calculateNutrientScore(params, crop);
    score += (weights.nitrogen + weights.phosphorus + weights.potassium) * nutrientScore;
  } else {
    // If NPK values are not provided, use a neutral score
    score += (weights.nitrogen + weights.phosphorus + weights.potassium) * 0.5;
  }
  
  // Scale to 0-100 range
  return score * 100;
};

/**
 * Get crop recommendations based on soil and weather parameters
 * 
 * This function implements a sophisticated AI-based approach to recommend
 * suitable crops based on input parameters, considering multiple factors
 * including soil conditions, weather patterns, and crop requirements.
 * 
 * @param params The soil and weather parameters (can be partial if pincode is provided)
 * @param availableCrops List of available crops in the system
 * @param pincode Optional pincode to fetch soil data from API
 * @param district Optional district name
 * @param state Optional state name
 * @returns Array of recommended crops sorted by suitability
 */
export const getCropRecommendations = async (
  params: Partial<CropRecommendationParams>,
  availableCrops: Crop[],
  pincode?: string,
  district?: string,
  state?: string
): Promise<Crop[]> => {
  // If we have a complete set of parameters, normalize them
  // Otherwise, the modelLoader will fetch missing soil params from API
  const normalizedParams = params.nitrogen !== undefined && 
                          params.phosphorus !== undefined && 
                          params.potassium !== undefined && 
                          params.ph !== undefined ? 
                          normalizeParameters(params as CropRecommendationParams) : 
                          params;
  
  // Get the available crops or use defaults
  const crops = availableCrops.length > 0 ? availableCrops : getDefaultCrops();
  
  // Try ML model approach first
  let useModelPrediction = false;
  let modelPredictedCrop = '';
  
  try {
    // Pass pincode to getModelPredictions to fetch soil data if needed
    const modelPrediction = await getModelPredictions(normalizedParams, pincode, district, state);
    console.log('Model prediction result:', modelPrediction);
    
    if (modelPrediction && modelPrediction.cropName) {
      useModelPrediction = true;
      modelPredictedCrop = modelPrediction.cropName.toLowerCase();
      console.log(`Model predicted crop: ${modelPredictedCrop}`);
    }
  } catch (error) {
    console.warn('Model prediction failed, falling back to rule-based approach:', error);
  }
  
  // Calculate suitability scores for each crop
  const scoredCrops = crops.map(crop => {
    // Create an extended crop with additional properties
    const extendedCrop: ExtendedCrop = {
      ...crop,
      nutrientRequirements: {
        nitrogen: 70, // Default values
        phosphorus: 75,
        potassium: 100
      }
    };
    
    // Calculate the base suitability score
    const suitabilityScore = calculateCropSuitabilityScore(normalizedParams, extendedCrop);
    
    // Add some randomization for variety but maintain the general ranking
    const randomFactor = 0.9 + (Math.random() * 0.2); // 0.9 to 1.1
    
    // Apply seasonality factor
    const seasonalityFactor = getSeasonalityFactor(params.season, crop.name_en);
    
    // Boost score for the model-predicted crop if using model prediction
    const modelBoostFactor = useModelPrediction && 
      crop.name_en.toLowerCase() === modelPredictedCrop ? 1.5 : 1.0;
    
    // Final score with randomization, seasonality and model prediction
    const finalScore = suitabilityScore * randomFactor * seasonalityFactor * modelBoostFactor;
    
    // Return the crop with additional properties
    return {
      ...crop,
      suitabilityScore: Math.min(Math.max(finalScore, 0), 100), // Clamp between 0-100
      seasonalSuitability: getSeasonalSuitabilityLabel(seasonalityFactor),
      isModelRecommended: useModelPrediction && crop.name_en.toLowerCase() === modelPredictedCrop
    } as ExtendedCrop;
  });

  // Sort by suitability score (descending)
  const sortedCrops = scoredCrops.sort((a, b) => 
    (b.suitabilityScore || 0) - (a.suitabilityScore || 0)
  );
  
  // Process for display and return only the properties defined in the Crop interface
  return processCropsForDisplay(sortedCrops);
};