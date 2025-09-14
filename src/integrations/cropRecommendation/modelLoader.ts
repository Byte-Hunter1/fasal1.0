/**
 * Crop Recommendation Model Loader
 * 
 * This module provides functionality to load and use the pre-trained crop recommendation model
 * using joblib in a Node.js environment.
 * 
 * Updated to fetch soil parameters from the soil API instead of manual input.
 */

import { CropRecommendationParams } from './service';
import { supabase } from '../supabase/client';

// Define the interface for model prediction results
export interface ModelPrediction {
  cropName: string;
  probabilities: Record<string, number>;
}

// Mock implementation of joblib model loading and prediction
// In a real implementation, this would use a Node.js binding for Python's joblib
// or a REST API call to a Python microservice that loads the model
export const loadModel = async (modelPath: string = '/app/models/crop_model.joblib'): Promise<any> => {
  console.log(`Loading model from ${modelPath}`);
  // In a real implementation, this would actually load the model
  // For now, we'll return a mock model object
  return {
    pipeline: {
      predict: (features: number[][]) => predictCrop(features[0]),
      predict_proba: (features: number[][]) => predictProbabilities(features[0])
    },
    features: [
      'nitrogen', 'phosphorus', 'potassium', 'temperature', 
      'humidity', 'ph', 'rainfall'
    ]
  };
};

/**
 * Convert crop recommendation parameters to feature array for model prediction
 * 
 * @param params The crop recommendation parameters
 * @param featureOrder The order of features expected by the model
 * @returns Array of features in the correct order for model prediction
 */
export const paramsToFeatures = (
  params: CropRecommendationParams,
  featureOrder: string[] = ['nitrogen', 'phosphorus', 'potassium', 'temperature', 'humidity', 'ph', 'rainfall']
): number[] => {
  // Create feature array in the order expected by the model
  return featureOrder.map(feature => {
    switch (feature) {
      case 'nitrogen': return params.nitrogen;
      case 'phosphorus': return params.phosphorus;
      case 'potassium': return params.potassium;
      case 'temperature': return params.temperature;
      case 'humidity': return params.humidity;
      case 'ph': return params.ph;
      case 'rainfall': return params.rainfall;
      default: return 0; // Default value for unknown features
    }
  });
};

/**
 * Predict crop using model features
 * 
 * @param features Array of features for prediction
 * @returns Predicted crop name
 */
const predictCrop = (features: number[]): string => {
  // This is a mock implementation
  // In a real implementation, this would use the actual model prediction
  const cropLabels = [
    'rice', 'maize', 'jute', 'cotton', 'coconut', 'papaya', 'orange', 'apple',
    'muskmelon', 'watermelon', 'grapes', 'mango', 'banana', 'pomegranate',
    'lentil', 'blackgram', 'mungbean', 'mothbeans', 'pigeonpeas', 'kidneybeans',
    'chickpea', 'coffee'
  ];
  
  // For now, return a crop based on simple rules
  // This is just a placeholder for the actual model prediction
  const [n, p, k, temp, humidity, ph, rainfall] = features;
  
  if (rainfall > 200 && temp > 30) return 'rice';
  if (n > 100 && p > 100 && k > 100) return 'maize';
  if (ph < 6 && rainfall > 150) return 'jute';
  if (temp > 25 && rainfall < 100) return 'cotton';
  if (temp > 25 && humidity > 80) return 'coconut';
  
  // Default to a random crop if no rules match
  return cropLabels[Math.floor(Math.random() * cropLabels.length)];
};

/**
 * Predict crop probabilities using model features
 * 
 * @param features Array of features for prediction
 * @returns Record of crop names and their probabilities
 */
const predictProbabilities = (features: number[]): Record<string, number> => {
  // This is a mock implementation
  // In a real implementation, this would use the actual model prediction
  const cropLabels = [
    'rice', 'maize', 'jute', 'cotton', 'coconut', 'papaya', 'orange', 'apple',
    'muskmelon', 'watermelon', 'grapes', 'mango', 'banana', 'pomegranate',
    'lentil', 'blackgram', 'mungbean', 'mothbeans', 'pigeonpeas', 'kidneybeans',
    'chickpea', 'coffee'
  ];
  
  // Generate random probabilities for each crop
  // In a real implementation, these would come from the model
  const probabilities: Record<string, number> = {};
  let remainingProbability = 1.0;
  
  // Assign higher probability to the predicted crop
  const predictedCrop = predictCrop(features);
  probabilities[predictedCrop] = 0.4 + Math.random() * 0.3; // 0.4-0.7 probability
  remainingProbability -= probabilities[predictedCrop];
  
  // Distribute remaining probability among other crops
  const otherCrops = cropLabels.filter(crop => crop !== predictedCrop);
  otherCrops.forEach((crop, index) => {
    if (index === otherCrops.length - 1) {
      // Last crop gets all remaining probability
      probabilities[crop] = remainingProbability;
    } else {
      // Other crops get random portions of remaining probability
      const portion = Math.random() * remainingProbability * 0.5;
      probabilities[crop] = portion;
      remainingProbability -= portion;
    }
  });
  
  return probabilities;
};

/**
 * Fetch soil data from the soil API
 * 
 * @param pincode The pincode to fetch soil data for
 * @param district Optional district name
 * @param state Optional state name
 * @returns Promise resolving to soil data
 */
export const fetchSoilData = async (pincode: string, district?: string, state?: string): Promise<any> => {
  try {
    const { data, error } = await supabase.functions.invoke('get-soil-data', {
      body: { 
        pincode,
        district: district || 'Unknown',
        state: state || 'Unknown'
      }
    });

    if (error) {
      throw new Error(error.message);
    }

    return data;
  } catch (error) {
    console.error('Error fetching soil data:', error);
    throw new Error('Failed to fetch soil data from API');
  }
};

/**
 * Get crop recommendations using the pre-trained model with soil data from API
 * 
 * @param params The crop recommendation parameters (can be partial, missing soil params will be fetched from API)
 * @param pincode The pincode to fetch soil data for if needed
 * @param district Optional district name
 * @param state Optional state name
 * @returns Promise resolving to model prediction results
 */
export const getModelPredictions = async (
  params: Partial<CropRecommendationParams>,
  pincode?: string,
  district?: string,
  state?: string
): Promise<ModelPrediction> => {
  try {
    let completeParams: CropRecommendationParams;
    
    // If pincode is provided and any soil parameter is missing, fetch from API
    if (pincode && (
      params.nitrogen === undefined || 
      params.phosphorus === undefined || 
      params.potassium === undefined || 
      params.ph === undefined
    )) {
      console.log('Fetching soil data from API for pincode:', pincode);
      const soilData = await fetchSoilData(pincode, district, state);
      
      // Merge soil data with provided params
      completeParams = {
        nitrogen: params.nitrogen !== undefined ? params.nitrogen : soilData.nitrogen,
        phosphorus: params.phosphorus !== undefined ? params.phosphorus : soilData.phosphorus,
        potassium: params.potassium !== undefined ? params.potassium : soilData.potassium,
        ph: params.ph !== undefined ? params.ph : soilData.ph,
        temperature: params.temperature || 25, // Default values if not provided
        humidity: params.humidity || 65,
        rainfall: params.rainfall || 100,
        season: params.season,
        state: params.state || state
      };
      
      console.log('Using soil parameters from API:', {
        nitrogen: completeParams.nitrogen,
        phosphorus: completeParams.phosphorus,
        potassium: completeParams.potassium,
        ph: completeParams.ph
      });
    } else {
      // Use provided params or defaults
      completeParams = {
        nitrogen: params.nitrogen || 50,
        phosphorus: params.phosphorus || 50,
        potassium: params.potassium || 50,
        ph: params.ph || 6.5,
        temperature: params.temperature || 25,
        humidity: params.humidity || 65,
        rainfall: params.rainfall || 100,
        season: params.season,
        state: params.state
      };
    }
    
    // Load the model
    const model = await loadModel();
    
    // Convert parameters to features
    const features = paramsToFeatures(completeParams, model.features);
    
    // Make predictions
    const cropName = model.pipeline.predict([features]);
    const probabilities = model.pipeline.predict_proba([features]);
    
    return {
      cropName,
      probabilities
    };
  } catch (error) {
    console.error('Error making model predictions:', error);
    throw new Error('Failed to get crop recommendations from model');
  }
};