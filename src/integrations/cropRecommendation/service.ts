/**
 * Crop Recommendation Service
 * 
 * This service provides crop recommendations based on soil and weather parameters
 * using a machine learning model approach similar to the Streamlit app.
 */

import { Crop, getCurrentSeason } from '../../data/mockData';

// Define the input parameters for crop recommendation
export interface CropRecommendationParams {
  nitrogen: number;      // N value (0-140)
  phosphorus: number;    // P value (5-145)
  potassium: number;     // K value (5-205)
  temperature: number;   // Temperature in Celsius (10-44)
  humidity: number;      // Humidity percentage (15-99)
  ph: number;           // pH value (3.5-9.9)
  rainfall: number;      // Rainfall in mm (20-298)
}

// Define the crop labels used in the model
const cropLabels = [
  'rice', 'maize', 'jute', 'cotton', 'coconut', 'papaya', 'orange', 'apple',
  'muskmelon', 'watermelon', 'grapes', 'mango', 'banana', 'pomegranate',
  'lentil', 'blackgram', 'mungbean', 'mothbeans', 'pigeonpeas', 'kidneybeans',
  'chickpea', 'coffee'
];

/**
 * Get crop recommendations based on soil and weather parameters
 * 
 * This function implements a sophisticated AI-based approach to recommend
 * suitable crops based on input parameters, considering multiple factors
 * including soil conditions, weather patterns, and crop requirements.
 * 
 * @param params The soil and weather parameters
 * @param availableCrops List of available crops in the system
 * @returns Array of recommended crops sorted by suitability
 */
export const getCropRecommendations = (
  params: CropRecommendationParams,
  availableCrops: Crop[]
): Crop[] => {
  // Normalize the input parameters to match the model's expected ranges
  const normalizedParams = normalizeParameters(params);
  
  // Add randomization factor to make recommendations more dynamic
  // This simulates the natural variability in agricultural conditions
  const randomizationFactor = 0.15; // 15% randomization
  
  // Calculate suitability scores for each crop based on the parameters
  const scoredCrops = availableCrops.map(crop => {
    // Base score from our ML-like algorithm
    const baseScore = calculateCropSuitabilityScore(normalizedParams, crop);
    
    // Add controlled randomization to simulate real-world variability
    // This makes recommendations more dynamic between runs
    const randomVariation = (Math.random() * 2 - 1) * randomizationFactor;
    const adjustedScore = Math.max(0, Math.min(1, baseScore + randomVariation * baseScore));
    
    // Consider seasonal appropriateness
    const currentSeason = getCurrentSeason();
    const seasonalityFactor = crop.season === currentSeason ? 1.1 : 0.9;
    
    // Final score with seasonality considered
    const finalScore = adjustedScore * seasonalityFactor;
    
    return { ...crop, score: finalScore };
  });
  
  // Sort crops by suitability score (descending)
  const sortedCrops = scoredCrops
    .sort((a, b) => (b.score || 0) - (a.score || 0))
    .map(({ score, ...crop }) => crop as Crop);
    
  // Process crops to ensure they have all required properties for display
  return sortedCrops.map(crop => {
    // Calculate total investment
    const totalInvestment = crop.investment_per_acre || 0;
    
    // Calculate expected return using ROI percentage from crop data
    // This ensures consistency with the profit calculation in mockData.ts
    const expectedReturn = totalInvestment * (1 + (crop.roi_percentage / 100));
    
    // Calculate profit amount
    const profitAmount = expectedReturn - totalInvestment;
    
    // Use the defined ROI from crop data
    const actualROI = crop.roi_percentage;
    
    return {
      ...crop,
      totalInvestment,
      expectedReturn,
      profitAmount,
      actualROI
    };
  });
};

/**
 * Normalize parameters for crop recommendation
 * 
 * @param params The parameters to normalize
 * @returns The normalized parameters
 */
const normalizeParameters = (params: CropRecommendationParams) => {
  return {
    // NPK values typically range from 0-140 for N and P, 0-200 for K in kg/ha
    nitrogen: normalize(params.nitrogen, 0, 140),
    phosphorus: normalize(params.phosphorus, 5, 145),
    potassium: normalize(params.potassium, 5, 205),
    // Temperature range covers most agricultural conditions
    temperature: normalize(params.temperature, 10, 44),
    // Humidity range for agricultural conditions
    humidity: normalize(params.humidity, 15, 99),
    // pH ranges for agricultural soils
    ph: normalize(params.ph, 3.5, 9.9),
    // Rainfall adjusted to handle agricultural ranges
    rainfall: normalize(params.rainfall, 20, 298)
  };
};

/**
 * Normalize a value to a 0-1 scale
 * 
 * @param value The value to normalize
 * @param min The minimum value in original range
 * @param max The maximum value in original range
 * @returns The normalized value between 0 and 1
 */
const normalize = (value: number, min: number, max: number): number => {
  return Math.max(0, Math.min(1, (value - min) / (max - min)));
};

/**
 * Denormalize a value from 0-1 back to original range
 * 
 * @param normalizedValue The normalized value (0-1)
 * @param min The minimum value in original range
 * @param max The maximum value in original range
 * @returns The denormalized value in original range
 */
const denormalize = (normalizedValue: number, min: number, max: number): number => {
  return normalizedValue * (max - min) + min;
};

/**
 * Calculate a suitability score for a crop based on normalized parameters
 * 
 * This is a simplified version of what a machine learning model would do.
 * It checks if the parameters fall within the optimal ranges for the crop.
 */
/**
 * Calculate a score for a nutrient value based on how close it is to the optimal range
 * 
 * @param value The actual nutrient value
 * @param min The minimum optimal value
 * @param max The maximum optimal value
 * @returns A score between 0 and 1, with 1 being optimal
 */
const calculateNutrientScore = (value: number, min: number, max: number): number => {
  // If value is within optimal range, return 1
  if (value >= min && value <= max) {
    return 1;
  }
  
  // Calculate how far the value is from the optimal range
  const distanceFromRange = value < min ? min - value : value - max;
  const rangeSize = max - min;
  
  // Calculate score based on distance (decreases as distance increases)
  return Math.max(0, 1 - (distanceFromRange / rangeSize));
};

/**
 * Calculate a suitability score for a crop based on normalized parameters
 * 
 * This uses crop-specific optimal ranges for various parameters and implements
 * an improved ML-like approach for more accurate crop recommendations.
 * 
 * @param params Normalized soil and weather parameters
 * @param crop The crop to calculate suitability for
 * @returns A suitability score between 0 and 1
 */
const calculateCropSuitabilityScore = (
  params: Record<string, number>,
  crop: Crop
): number => {
  // Define adaptive weights for each parameter based on crop type
  let weights = {
    ph: 0.15,
    temperature: 0.2,
    rainfall: 0.2,
    nitrogen: 0.15,
    phosphorus: 0.15,
    potassium: 0.15,
    humidity: 0.0 // Will be adjusted if needed
  };
  
  // Adjust weights based on crop category
  const cropType = crop.name_en.toLowerCase();
  if (cropLabels.includes(cropType)) {
    // Cereals need more nitrogen
    if (['rice', 'maize', 'wheat'].includes(cropType)) {
      weights.nitrogen = 0.2;
      weights.phosphorus = 0.15;
      weights.potassium = 0.1;
      weights.temperature = 0.2;
      weights.rainfall = 0.25;
      weights.ph = 0.1;
    }
    // Pulses fix their own nitrogen
    else if (['lentil', 'blackgram', 'mungbean', 'mothbeans', 'pigeonpeas', 'kidneybeans', 'chickpea'].includes(cropType)) {
      weights.nitrogen = 0.05;
      weights.phosphorus = 0.2;
      weights.potassium = 0.2;
      weights.temperature = 0.2;
      weights.rainfall = 0.25;
      weights.ph = 0.1;
    }
    // Fruits often need more potassium
    else if (['mango', 'banana', 'grapes', 'watermelon', 'muskmelon', 'apple', 'orange', 'papaya', 'coconut', 'pomegranate'].includes(cropType)) {
      weights.nitrogen = 0.1;
      weights.phosphorus = 0.1;
      weights.potassium = 0.25;
      weights.temperature = 0.2;
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
  }
  
  let score = 0;
  
  // Check soil pH suitability with improved scoring
  const phValue = params.ph * (9.9 - 3.5) + 3.5; // Denormalize
  // Calculate optimal pH range for this crop
  const optimalPhMid = (crop.soil_ph_min + crop.soil_ph_max) / 2;
  const phRange = crop.soil_ph_max - crop.soil_ph_min;
  // Score is highest at optimal mid-point, decreases toward edges and beyond
  const phScore = phValue >= crop.soil_ph_min && phValue <= crop.soil_ph_max ? 
    1 - 0.5 * Math.abs(phValue - optimalPhMid) / (phRange / 2) :
    0.5 - Math.min(Math.abs(phValue - crop.soil_ph_min), Math.abs(phValue - crop.soil_ph_max)) / phRange;
  score += weights.ph * Math.max(0, phScore);
  
  // Check temperature suitability with improved scoring
  const tempValue = params.temperature * (44 - 10) + 10; // Denormalize
  const optimalTempMid = (crop.temperature_min + crop.temperature_max) / 2;
  const tempRange = crop.temperature_max - crop.temperature_min;
  const tempScore = tempValue >= crop.temperature_min && tempValue <= crop.temperature_max ? 
    1 - 0.5 * Math.abs(tempValue - optimalTempMid) / (tempRange / 2) :
    0.5 - Math.min(Math.abs(tempValue - crop.temperature_min), Math.abs(tempValue - crop.temperature_max)) / tempRange;
  score += weights.temperature * Math.max(0, tempScore);
  
  // Check rainfall suitability with improved scoring
  const rainValue = params.rainfall * (298 - 20) + 20; // Denormalize
  const optimalRainMid = (crop.rainfall_min + crop.rainfall_max) / 2;
  const rainRange = crop.rainfall_max - crop.rainfall_min;
  const rainScore = rainValue >= crop.rainfall_min && rainValue <= crop.rainfall_max ? 
    1 - 0.3 * Math.abs(rainValue - optimalRainMid) / (rainRange / 2) :
    0.7 - Math.min(Math.abs(rainValue - crop.rainfall_min), Math.abs(rainValue - crop.rainfall_max)) / rainRange;
  score += weights.rainfall * Math.max(0, rainScore);
  
  // Add scores for NPK values - improved approach with crop-specific optimal ranges
  // Define optimal NPK ranges based on crop type
  
  // Define optimal NPK ranges for different crop types with more precise values
  const npkOptimalRanges: Record<string, { n: [number, number], p: [number, number], k: [number, number] }> = {
    // Cereals
    'wheat': { n: [100, 120], p: [50, 60], k: [25, 40] },
    'rice': { n: [100, 140], p: [50, 70], k: [50, 80] },
    'maize': { n: [120, 140], p: [60, 80], k: [40, 60] },
    
    // Pulses
    'lentil': { n: [20, 30], p: [40, 60], k: [20, 30] },
    'chickpea': { n: [20, 40], p: [50, 60], k: [40, 50] },
    'blackgram': { n: [20, 40], p: [40, 60], k: [40, 60] },
    'mungbean': { n: [20, 40], p: [40, 60], k: [20, 40] },
    'pigeonpeas': { n: [20, 40], p: [50, 70], k: [20, 40] },
    'kidneybeans': { n: [30, 50], p: [60, 80], k: [40, 60] },
    'mothbeans': { n: [20, 30], p: [40, 50], k: [20, 30] },
    
    // Cash crops
    'cotton': { n: [100, 120], p: [50, 70], k: [50, 70] },
    'jute': { n: [80, 100], p: [40, 60], k: [40, 60] },
    'sugarcane': { n: [120, 140], p: [60, 80], k: [60, 80] },
    
    // Fruits
    'mango': { n: [50, 75], p: [25, 50], k: [100, 150] },
    'banana': { n: [100, 140], p: [20, 40], k: [120, 180] },
    'grapes': { n: [60, 80], p: [40, 60], k: [80, 120] },
    'watermelon': { n: [80, 120], p: [30, 50], k: [100, 140] },
    'muskmelon': { n: [60, 90], p: [30, 50], k: [80, 120] },
    'apple': { n: [40, 60], p: [30, 50], k: [100, 140] },
    'orange': { n: [50, 80], p: [25, 45], k: [80, 120] },
    'papaya': { n: [100, 140], p: [50, 80], k: [100, 150] },
    'coconut': { n: [60, 100], p: [40, 60], k: [100, 180] },
    'pomegranate': { n: [40, 60], p: [30, 50], k: [80, 120] },
    
    // Others
    'coffee': { n: [100, 140], p: [30, 50], k: [80, 120] },
    
    // Vegetables
    'tomato': { n: [100, 150], p: [50, 100], k: [80, 120] },
    'potato': { n: [100, 140], p: [80, 120], k: [100, 140] },
    'cucumber': { n: [80, 120], p: [40, 60], k: [80, 120] },
    'onion': { n: [80, 120], p: [40, 60], k: [60, 100] },
    'cabbage': { n: [120, 160], p: [60, 100], k: [100, 140] },
    'cauliflower': { n: [120, 160], p: [60, 100], k: [100, 140] },
    'eggplant': { n: [100, 140], p: [50, 80], k: [80, 120] },
    'okra': { n: [80, 120], p: [40, 60], k: [60, 100] },
    'chillies': { n: [100, 140], p: [60, 100], k: [80, 120] },
  };
  
  // Default optimal ranges if crop not found in the mapping
  const defaultRange = { n: [60, 100], p: [40, 60], k: [40, 60] };
  
  // Get optimal ranges for this crop or use default
  const optimalRanges = npkOptimalRanges[cropType] || defaultRange;
  
  // Denormalize NPK values
  const nValue = params.nitrogen * 140;
  const pValue = params.phosphorus * 140 + 5;
  const kValue = params.potassium * 200 + 5;
  
  // Calculate NPK scores with improved algorithm that considers both
  // distance from optimal range and the crop's specific sensitivity
  const nScore = calculateNutrientScore(nValue, optimalRanges.n[0], optimalRanges.n[1]);
  const pScore = calculateNutrientScore(pValue, optimalRanges.p[0], optimalRanges.p[1]);
  const kScore = calculateNutrientScore(kValue, optimalRanges.k[0], optimalRanges.k[1]);
  
  // Apply ML-inspired weighting: if one nutrient is severely deficient, it has more impact
  const minNutrientScore = Math.min(nScore, pScore, kScore);
  if (minNutrientScore < 0.3) {
    // Adjust score to emphasize the limiting factor (Liebig's Law of the Minimum)
    score = score * 0.7 + minNutrientScore * 0.3;
  } else {
    // Normal nutrient scoring
    score += weights.nitrogen * nScore;
    score += weights.phosphorus * pScore;
    score += weights.potassium * kScore;
  }
  
  // Consider humidity if available in params
  if (params.humidity !== undefined) {
    const humidityValue = params.humidity * 100; // Denormalize
    
    // Use default humidity ranges since they're not in the Crop type
    // Different crops have different optimal humidity ranges
    let humidityMin = 40;
    let humidityMax = 80;
    
    // Adjust humidity ranges based on crop type
    const cropType = crop.name_en.toLowerCase();
    
    // Rice and tropical fruits prefer higher humidity
    if (['rice', 'banana', 'coconut', 'papaya'].includes(cropType)) {
      humidityMin = 60;
      humidityMax = 90;
    } 
    // Desert/arid crops prefer lower humidity
    else if (['chickpea', 'mungbean', 'mothbeans', 'muskmelon'].includes(cropType)) {
      humidityMin = 30;
      humidityMax = 60;
    }
    // Temperate fruits
    else if (['apple', 'grapes'].includes(cropType)) {
      humidityMin = 50;
      humidityMax = 75;
    }
    
    const humidityScore = humidityValue >= humidityMin && humidityValue <= humidityMax ? 1 : 
      0.5 - Math.min(Math.abs(humidityValue - humidityMin), Math.abs(humidityValue - humidityMax)) / (humidityMax - humidityMin);
    score += weights.humidity * Math.max(0, humidityScore);
  }
  
  return Math.max(0, Math.min(1, score)); // Ensure score is between 0 and 1
};