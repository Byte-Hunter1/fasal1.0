// Mock data for FASAL application

export interface Crop {
  id: number;
  name_en: string;
  name_hi: string;
  season: 'kharif' | 'rabi' | 'zaid';
  soil_ph_min: number;
  soil_ph_max: number;
  temperature_min: number;
  temperature_max: number;
  rainfall_min: number;
  rainfall_max: number;
  investment_per_acre: number;
  expected_yield_per_acre: number;
  roi_percentage: number;
  current_price_per_kg: number;
  growing_states: string[];
  image: string;
  description_en: string;
  description_hi: string;
}

export interface WeatherData {
  location: string;
  current: {
    temperature: number;
    humidity: number;
    description: string;
    icon: string;
  };
  forecast: Array<{
    date: string;
    high: number;
    low: number;
    description: string;
    rainfall: number;
  }>;
}

export interface SoilData {
  ph: number;
  nitrogen: number;
  phosphorus: number;
  potassium: number;
  organic_matter: number;
  moisture: number;
  quality: 'excellent' | 'good' | 'fair' | 'poor';
}

export const mockCrops: Crop[] = [
  {
    id: 1,
    name_en: "Wheat",
    name_hi: "गेहूं",
    season: "rabi",
    soil_ph_min: 6.0,
    soil_ph_max: 7.5,
    temperature_min: 15,
    temperature_max: 25,
    rainfall_min: 300,
    rainfall_max: 800,
    investment_per_acre: 25000,
    expected_yield_per_acre: 20,
    roi_percentage: 35,
    current_price_per_kg: 21,
    growing_states: ["Punjab", "Haryana", "UP", "MP", "Rajasthan"],
    image: "🌾",
    description_en: "Wheat is a major cereal grain crop suitable for winter season cultivation.",
    description_hi: "गेहूं एक प्रमुख अनाज फसल है जो शीतकालीन खेती के लिए उपयुक्त है।"
  },
  {
    id: 2,
    name_en: "Rice",
    name_hi: "चावल",
    season: "kharif",
    soil_ph_min: 5.5,
    soil_ph_max: 7.0,
    temperature_min: 20,
    temperature_max: 35,
    rainfall_min: 1000,
    rainfall_max: 2000,
    investment_per_acre: 30000,
    expected_yield_per_acre: 25,
    roi_percentage: 40,
    current_price_per_kg: 20,
    growing_states: ["West Bengal", "Punjab", "Haryana", "AP", "Tamil Nadu"],
    image: "🌾",
    description_en: "Rice is the staple food crop requiring abundant water and warm climate.",
    description_hi: "चावल मुख्य खाद्य फसल है जिसके लिए भरपूर पानी और गर्म जलवायु की आवश्यकता होती है।"
  },
  {
    id: 3,
    name_en: "Sugarcane",
    name_hi: "गन्ना",
    season: "kharif",
    soil_ph_min: 6.0,
    soil_ph_max: 8.0,
    temperature_min: 20,
    temperature_max: 40,
    rainfall_min: 800,
    rainfall_max: 1200,
    investment_per_acre: 50000,
    expected_yield_per_acre: 400,
    roi_percentage: 45,
    current_price_per_kg: 3.5,
    growing_states: ["UP", "Maharashtra", "Karnataka", "Tamil Nadu", "Punjab"],
    image: "🎋",
    description_en: "Sugarcane is a cash crop requiring high investment but giving excellent returns.",
    description_hi: "गन्ना एक नकदी फसल है जिसमें अधिक निवेश की आवश्यकता होती है लेकिन बेहतरीन रिटर्न मिलता है।"
  },
  {
    id: 4,
    name_en: "Cotton",
    name_hi: "कपास",
    season: "kharif",
    soil_ph_min: 6.0,
    soil_ph_max: 8.0,
    temperature_min: 20,
    temperature_max: 35,
    rainfall_min: 600,
    rainfall_max: 1000,
    investment_per_acre: 40000,
    expected_yield_per_acre: 15,
    roi_percentage: 50,
    current_price_per_kg: 60,
    growing_states: ["Gujarat", "Maharashtra", "Telangana", "AP", "Punjab"],
    image: "🌱",
    description_en: "Cotton is a major commercial crop with high market value and export potential.",
    description_hi: "कपास एक प्रमुख व्यावसायिक फसल है जिसका उच्च बाजार मूल्य और निर्यात क्षमता है।"
  },
  {
    id: 5,
    name_en: "Soybean",
    name_hi: "सोयाबीन",
    season: "kharif",
    soil_ph_min: 6.0,
    soil_ph_max: 7.5,
    temperature_min: 20,
    temperature_max: 30,
    rainfall_min: 600,
    rainfall_max: 1000,
    investment_per_acre: 20000,
    expected_yield_per_acre: 12,
    roi_percentage: 30,
    current_price_per_kg: 40,
    growing_states: ["MP", "Maharashtra", "Rajasthan", "Karnataka"],
    image: "🫘",
    description_en: "Soybean is a protein-rich oilseed crop with good market demand.",
    description_hi: "सोयाबीन एक प्रोटीन युक्त तिलहन फसल है जिसकी बाजार में अच्छी मांग है।"
  }
];

export const mockWeatherData: WeatherData = {
  location: "Punjab, India",
  current: {
    temperature: 28,
    humidity: 65,
    description: "Partly Cloudy",
    icon: "⛅"
  },
  forecast: [
    { date: "Today", high: 32, low: 22, description: "Sunny", rainfall: 0 },
    { date: "Tomorrow", high: 30, low: 20, description: "Partly Cloudy", rainfall: 2 },
    { date: "Day 3", high: 28, low: 19, description: "Light Rain", rainfall: 15 },
    { date: "Day 4", high: 29, low: 21, description: "Cloudy", rainfall: 5 },
    { date: "Day 5", high: 31, low: 23, description: "Sunny", rainfall: 0 },
    { date: "Day 6", high: 33, low: 24, description: "Hot", rainfall: 0 },
    { date: "Day 7", high: 30, low: 22, description: "Partly Cloudy", rainfall: 3 }
  ]
};

export const mockSoilData: SoilData = {
  ph: 6.8,
  nitrogen: 75,
  phosphorus: 65,
  potassium: 80,
  organic_matter: 3.2,
  moisture: 45,
  quality: 'good'
};

export const indianCropsList = [
  { value: "wheat", label: "Wheat / गेहूं" },
  { value: "rice", label: "Rice / चावल" },
  { value: "cotton", label: "Cotton / कपास" },
  { value: "sugarcane", label: "Sugarcane / गन्ना" },
  { value: "soybean", label: "Soybean / सोयाबीन" },
  { value: "maize", label: "Maize / मक्का" },
  { value: "bajra", label: "Pearl Millet / बाजरा" },
  { value: "jowar", label: "Sorghum / ज्वार" },
  { value: "groundnut", label: "Groundnut / मूंगफली" },
  { value: "mustard", label: "Mustard / सरसों" },
  { value: "sunflower", label: "Sunflower / सूरजमुखी" },
  { value: "chickpea", label: "Chickpea / चना" },
  { value: "lentil", label: "Lentil / मसूर" },
  { value: "potato", label: "Potato / आलू" },
  { value: "tomato", label: "Tomato / टमाटर" }
];

// Location data based on pincode (simplified)
export const getLocationFromPincode = (pincode: string) => {
  const locationMap: { [key: string]: { district: string; state: string; lat: number; lon: number } } = {
    "110001": { district: "New Delhi", state: "Delhi", lat: 28.6139, lon: 77.2090 },
    "400001": { district: "Mumbai", state: "Maharashtra", lat: 19.0760, lon: 72.8777 },
    "500001": { district: "Hyderabad", state: "Telangana", lat: 17.3850, lon: 78.4867 },
    "700001": { district: "Kolkata", state: "West Bengal", lat: 22.5726, lon: 88.3639 },
    "600001": { district: "Chennai", state: "Tamil Nadu", lat: 13.0827, lon: 80.2707 },
    "560001": { district: "Bangalore", state: "Karnataka", lat: 12.9716, lon: 77.5946 },
    "141001": { district: "Ludhiana", state: "Punjab", lat: 30.9010, lon: 75.8573 },
    "302001": { district: "Jaipur", state: "Rajasthan", lat: 26.9124, lon: 75.7873 },
    "380001": { district: "Ahmedabad", state: "Gujarat", lat: 23.0225, lon: 72.5714 },
    "411001": { district: "Pune", state: "Maharashtra", lat: 18.5204, lon: 73.8567 }
  };
  
  return locationMap[pincode] || { district: "Unknown", state: "Unknown", lat: 0, lon: 0 };
};

export const calculateRecommendations = (
  pincode: string,
  farmArea: number,
  previousCrops: string[],
  areaUnit: 'acres' | 'hectares'
) => {
  // Convert to acres for calculation
  const areaInAcres = areaUnit === 'hectares' ? farmArea * 2.47 : farmArea;
  
  // Filter crops based on season and location
  const location = getLocationFromPincode(pincode);
  const currentSeason = getCurrentSeason();
  
  let suitableCrops = mockCrops.filter(crop => {
    const hasGoodLocation = crop.growing_states.some(state => 
      state.toLowerCase().includes(location.state.toLowerCase()) || 
      location.state.toLowerCase().includes(state.toLowerCase())
    );
    return crop.season === currentSeason || hasGoodLocation;
  });
  
  // Apply crop rotation (avoid recently grown crops)
  suitableCrops = suitableCrops.filter(crop => 
    !previousCrops.includes(crop.name_en.toLowerCase())
  );
  
  // Calculate ROI for each crop
  const recommendations = suitableCrops.map(crop => ({
    ...crop,
    totalInvestment: crop.investment_per_acre * areaInAcres,
    expectedReturn: crop.expected_yield_per_acre * areaInAcres * crop.current_price_per_kg,
    profitAmount: (crop.expected_yield_per_acre * areaInAcres * crop.current_price_per_kg) - (crop.investment_per_acre * areaInAcres),
    actualROI: ((crop.expected_yield_per_acre * areaInAcres * crop.current_price_per_kg) - (crop.investment_per_acre * areaInAcres)) / (crop.investment_per_acre * areaInAcres) * 100
  }));
  
  // Sort by ROI and return top 5
  return recommendations
    .sort((a, b) => b.actualROI - a.actualROI)
    .slice(0, 5);
};

export const getCurrentSeason = (): 'kharif' | 'rabi' | 'zaid' => {
  const month = new Date().getMonth() + 1; // 1-12
  if (month >= 4 && month <= 9) return 'kharif';
  if (month >= 10 || month <= 3) return 'rabi';
  return 'zaid';
};