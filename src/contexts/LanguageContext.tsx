import React, { createContext, useContext, useState, ReactNode } from 'react';

type Language = 'en' | 'hi';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const translations = {
  en: {
    // Header & Navigation
    appName: 'FASAL',
    tagline: 'Smart Crop Advisor',
    language: 'Language',
    
    // Landing Page
    heroTitle: 'Smart Crop Recommendations for Indian Farmers',
    heroSubtitle: 'Get personalized crop suggestions based on your location, soil, and weather conditions',
    enterPincode: 'Enter Your Pincode',
    getRecommendations: 'Get Recommendations',
    placeholder_pincode: 'Enter 6-digit pincode',
    
    // Form Labels
    farmArea: 'Farm Area',
    acres: 'Acres',
    hectares: 'Hectares',
    lastCrops: 'Last 3 Crops Cultivated',
    selectCrops: 'Select crops...',
    
    // Results Page
    cropRecommendations: 'Top Crop Recommendations',
    profitPercentage: 'Expected Profit',
    investmentRequired: 'Investment Required',
    expectedReturns: 'Expected Returns',
    weatherForecast: 'Weather Forecast',
    soilQuality: 'Soil Quality',
    soilAnalysis: 'Soil Analysis',
    
    // Crop Details
    fertilizerSchedule: 'Fertilizer Schedule',
    pesticide: 'Pesticide Schedule',
    bestPractices: 'Best Practices',
    marketPrice: 'Current Market Price',
    expectedProfit: 'Expected Profit',
    riskLevel: 'Risk Level',
    yield: 'Expected Yield',
    investmentBreakdown: 'Investment Breakdown',
    seeds: 'Seeds',
    labor: 'Labor',
    irrigation: 'Irrigation',
    pesticides: 'Pesticides',
    other: 'Other Expenses',
    risk: 'Risk',
    noInvestmentBreakdown: 'No investment breakdown available',
    fertilizer: 'Fertilizer',
    
    // Weather
    temperature: 'Temperature',
    humidity: 'Humidity',
    rainfall: 'Rainfall',
    
    // Common
    loading: 'Loading...',
    error: 'Error occurred',
    tryAgain: 'Try Again',
    viewDetails: 'View Details',
    backToHome: 'Back to Home',
  },
  hi: {
    // Header & Navigation
    appName: 'फसल',
    tagline: 'स्मार्ट फसल सलाहकार',
    language: 'भाषा',
    
    // Landing Page
    heroTitle: 'भारतीय किसानों के लिए स्मार्ट फसल सिफारिशें',
    heroSubtitle: 'अपने स्थान, मिट्टी और मौसम की स्थिति के आधार पर व्यक्तिगत फसल सुझाव प्राप्त करें',
    enterPincode: 'अपना पिनकोड दर्ज करें',
    getRecommendations: 'सिफारिशें प्राप्त करें',
    placeholder_pincode: '6 अंकों का पिनकोड दर्ज करें',
    
    // Form Labels
    farmArea: 'खेत का क्षेत्रफल',
    acres: 'एकड़',
    hectares: 'हेक्टेयर',
    lastCrops: 'अंतिम 3 फसलें',
    selectCrops: 'फसलें चुनें...',
    
    // Results Page
    cropRecommendations: 'शीर्ष फसल सिफारिशें',
    profitPercentage: 'अपेक्षित लाभ',
    investmentRequired: 'आवश्यक निवेश',
    expectedReturns: 'अपेक्षित रिटर्न',
    weatherForecast: 'मौसम पूर्वानुमान',
    soilQuality: 'मिट्टी की गुणवत्ता',
    soilAnalysis: 'मिट्टी विश्लेषण',
    
    // Crop Details
    fertilizerSchedule: 'उर्वरक कार्यक्रम',
    pesticide: 'कीटनाशक कार्यक्रम',
    bestPractices: 'सर्वोत्तम प्रथाएं',
    marketPrice: 'वर्तमान बाजार मूल्य',
    expectedProfit: 'अपेक्षित लाभ',
    riskLevel: 'जोखिम स्तर',
    yield: 'अपेक्षित उपज',
    investmentBreakdown: 'निवेश विवरण',
    seeds: 'बीज',
    labor: 'श्रम',
    irrigation: 'सिंचाई',
    pesticides: 'कीटनाशक',
    other: 'अन्य खर्च',
    risk: 'जोखिम',
    noInvestmentBreakdown: 'कोई निवेश विवरण उपलब्ध नहीं है',
    fertilizer: 'उर्वरक',
    
    // Weather
    temperature: 'तापमान',
    humidity: 'आर्द्रता',
    rainfall: 'वर्षा',
    
    // Common
    loading: 'लोड हो रहा है...',
    error: 'त्रुटि हुई',
    tryAgain: 'पुनः प्रयास करें',
    viewDetails: 'विवरण देखें',
    backToHome: 'होम पर वापस जाएं',
  }
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};

interface LanguageProviderProps {
  children: ReactNode;
}

export const LanguageProvider: React.FC<LanguageProviderProps> = ({ children }) => {
  const [language, setLanguage] = useState<Language>('en');

  const t = (key: string): string => {
    return translations[language][key as keyof typeof translations['en']] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      <div className={language === 'hi' ? 'hindi-text' : ''}>
        {children}
      </div>
    </LanguageContext.Provider>
  );
};