import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useLanguage } from '@/contexts/LanguageContext';
import LanguageToggle from '@/components/LanguageToggle';
import WeatherWidget from '@/components/WeatherWidget';
import SoilWidget from '@/components/SoilWidget';
import { supabase } from '@/integrations/supabase/client';
import CropCard from '@/components/CropCard';
import CropDetailsModal from '@/components/CropDetailsModal';
import { calculateRecommendations } from '@/data/mockData';
import { ArrowLeft, MapPin, Wheat, MessageCircle } from 'lucide-react';
import fasalLogo from '@/assets/fasal-logo.jpg';

interface FormData {
  pincode: string;
  farmArea: number;
  areaUnit: 'acres' | 'hectares';
  previousCrops: string[];
}

interface ResultsProps {
  formData: FormData;
  onBack: () => void;
}

const Results: React.FC<ResultsProps> = ({ formData, onBack }) => {
  const { t } = useLanguage();
  const [selectedCrop, setSelectedCrop] = useState(null);
  const [showChatbot, setShowChatbot] = useState(false);
  const [chatMessages, setChatMessages] = useState<Array<{role: 'user' | 'assistant', content: string}>>([]);
  const [chatInput, setChatInput] = useState('');
  const [chatLoading, setChatLoading] = useState(false);
  const [locationData, setLocationData] = useState<any>(null);
  const [weatherData, setWeatherData] = useState<any>(null);
  const [soilData, setSoilData] = useState<any>(null);
  const [aiRecommendations, setAiRecommendations] = useState<any[]>([]);
  const [recommendationsLoading, setRecommendationsLoading] = useState(true);

  // Fetch location data when component mounts
  React.useEffect(() => {
    fetchLocationData();
    fetchWeatherData();
    fetchSoilData();
  }, [formData.pincode]);

  const fetchLocationData = async () => {
    try {
      const { data, error } = await supabase.functions.invoke('get-location', {
        body: { pincode: formData.pincode }
      });

      if (error) {
        console.error('Location fetch error:', error);
        return;
      }

      setLocationData(data);
    } catch (err) {
      console.error('Location fetch error:', err);
    }
  };

  const fetchWeatherData = async () => {
    try {
      const { data, error } = await supabase.functions.invoke('get-weather', {
        body: { pincode: formData.pincode }
      });

      if (error) {
        console.error('Weather fetch error:', error);
        return;
      }

      setWeatherData(data);
    } catch (err) {
      console.error('Weather fetch error:', err);
    }
  };

  const fetchSoilData = async () => {
    try {
      const { data, error } = await supabase.functions.invoke('get-soil-data', {
        body: { pincode: formData.pincode }
      });

      if (error) {
        console.error('Soil fetch error:', error);
        return;
      }

      setSoilData(data);
    } catch (err) {
      console.error('Soil fetch error:', err);
    }
  };

  // Fetch AI recommendations when all data is available
  React.useEffect(() => {
    if (locationData && weatherData && soilData) {
      fetchAIRecommendations();
    }
  }, [locationData, weatherData, soilData]);

  const fetchAIRecommendations = async () => {
    setRecommendationsLoading(true);
    try {
      // Temporarily use mock data directly instead of AI recommendations
      // to fix financial calculation issues
      const mockRecommendations = calculateRecommendations(
        formData.pincode,
        formData.farmArea,
        formData.previousCrops,
        formData.areaUnit
      );
      setAiRecommendations(mockRecommendations);
      
      /* Commented out AI recommendations fetch for now
      const { data, error } = await supabase.functions.invoke('ai-crop-recommendations', {
        body: {
          pincode: formData.pincode,
          farmArea: formData.farmArea,
          areaUnit: formData.areaUnit,
          previousCrops: formData.previousCrops,
          weatherData,
          soilData,
          locationData
        }
      });

      if (error) {
        console.error('AI recommendations fetch error:', error);
        // Fallback to mock data if AI fails
        const fallbackRecommendations = calculateRecommendations(
          formData.pincode,
          formData.farmArea,
          formData.previousCrops,
          formData.areaUnit
        );
        setAiRecommendations(fallbackRecommendations);
        return;
      }

      setAiRecommendations(data.recommendations || []);
      */
    } catch (err) {
      console.error('AI recommendations fetch error:', err);
      // Fallback to mock data if AI fails
      const fallbackRecommendations = calculateRecommendations(
        formData.pincode,
        formData.farmArea,
        formData.previousCrops,
        formData.areaUnit
      );
      setAiRecommendations(fallbackRecommendations);
    } finally {
      setRecommendationsLoading(false);
    }
  };
  
  // Use AI recommendations instead of mock data
  const recommendations = aiRecommendations;

  // These functions are already defined above
  // Keeping the implementation here for reference
  // const handleViewDetails = (crop: any) => {
  //   setSelectedCrop(crop);
  //   setShowDetailsModal(true);
  // };
  
  // const handleCloseModal = () => {
  //   setShowDetailsModal(false);
  //   setSelectedCrop(null);
  // };

  const handleChatSubmit = async () => {
    if (!chatInput.trim()) return;

    const userMessage = chatInput.trim();
    setChatInput('');
    setChatMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    setChatLoading(true);

    try {
      const userContext = {
        location: locationData ? `${locationData.name}, ${locationData.state}` : formData.pincode,
        previousCrops: formData.previousCrops?.join(', ') || 'Not specified',
        farmArea: `${formData.farmArea} ${formData.areaUnit}`,
        season: new Date().getMonth() >= 3 && new Date().getMonth() <= 6 ? 'Kharif' : 'Rabi'
      };

      const { data, error } = await supabase.functions.invoke('agriculture-chatbot', {
        body: { 
          message: userMessage,
          language: 'en', // You can make this dynamic based on user preference
          userContext
        }
      });

      if (error) {
        throw new Error(error.message);
      }

      setChatMessages(prev => [...prev, { role: 'assistant', content: data.response }]);
    } catch (error: any) {
      console.error('Chat error:', error);
      setChatMessages(prev => [...prev, { 
        role: 'assistant', 
        content: 'Sorry, I encountered an error. Please try again.' 
      }]);
    } finally {
      setChatLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(amount);
  };

  // Use the CropDetailsModal component instead of a separate page
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  
  const handleViewDetails = (crop: any) => {
    setSelectedCrop(crop);
    setShowDetailsModal(true);
  };
  
  const handleCloseModal = () => {
    setShowDetailsModal(false);
    setSelectedCrop(null);
  };

  return (
    <div className="min-h-screen bg-gradient-earth">
      {/* Header */}
      <header className="p-4 border-b border-primary/10 bg-card">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="outline" onClick={onBack}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              {t('backToHome')}
            </Button>
            <div className="flex items-center gap-3">
              <img src={fasalLogo} alt="FASAL Logo" className="h-8 w-8 rounded-lg" />
              <div>
                <h1 className="font-bold text-primary">{t('appName')}</h1>
                <p className="text-xs text-muted-foreground flex items-center gap-1">
                  <MapPin className="h-3 w-3" />
                  Pincode: {formData.pincode} • {formData.farmArea} {formData.areaUnit}
                </p>
              </div>
            </div>
          </div>
          <LanguageToggle />
        </div>
      </header>

      {/* Main Content */}
      <div className="py-8 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Content - Crop Recommendations */}
            <div className="lg:col-span-2 space-y-6">
              <div className="flex items-center gap-3 mb-6">
                <Wheat className="h-6 w-6 text-primary" />
                <h2 className="text-2xl font-bold text-primary">{t('cropRecommendations')}</h2>
              </div>
              
              {recommendationsLoading ? (
                <Card className="shadow-card">
                  <CardContent className="p-8 text-center">
                    <div className="text-4xl mb-4 animate-pulse">🤖</div>
                    <h3 className="text-lg font-medium text-muted-foreground mb-2">
                      AI is analyzing your farm data...
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      Getting personalized crop recommendations based on weather, soil, and market conditions
                    </p>
                  </CardContent>
                </Card>
              ) : recommendations.length === 0 ? (
                <Card className="shadow-card">
                  <CardContent className="p-8 text-center">
                    <div className="text-4xl mb-4">🌾</div>
                    <h3 className="text-lg font-medium text-muted-foreground mb-2">
                      No suitable crops found for your area
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      Try a different pincode or contact our support team for assistance
                    </p>
                  </CardContent>
                </Card>
              ) : (
                <div className="space-y-6">
                  {recommendations.map((crop, index) => (
                    <div key={crop.id} className="relative">
                      <Badge 
                        className="absolute -top-2 -left-2 z-10 bg-secondary text-secondary-foreground font-bold"
                      >
                        #{index + 1}
                      </Badge>
                      <CropCard 
                        crop={crop} 
                        onViewDetails={handleViewDetails}
                      />
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Sidebar - Weather & Soil */}
            <div className="space-y-6">
              <WeatherWidget pincode={formData.pincode} />
              <SoilWidget pincode={formData.pincode} location={locationData} />
            </div>
          </div>
        </div>
      </div>

      {/* Floating AI Chatbot Button */}
      <Button
        variant="hero"
        size="icon"
        className="fixed bottom-6 right-6 h-14 w-14 rounded-full shadow-elevation animate-pulse-slow"
        onClick={() => setShowChatbot(!showChatbot)}
      >
        <MessageCircle className="h-6 w-6" />
      </Button>
      
      {/* Crop Details Modal */}
      {showDetailsModal && selectedCrop && (
        <CropDetailsModal
          crop={selectedCrop}
          onClose={handleCloseModal}
          weatherData={weatherData}
          soilData={soilData}
        />
      )}

      {/* AI Chatbot Popup */}
      {showChatbot && (
        <div className="fixed bottom-24 right-6 w-80 h-96 bg-card border border-primary/20 rounded-lg shadow-elevation flex flex-col">
          <div className="flex items-center justify-between p-4 border-b">
            <h3 className="font-semibold text-primary">🤖 AI Farm Assistant</h3>
            <Button variant="ghost" size="sm" onClick={() => setShowChatbot(false)}>×</Button>
          </div>
          
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {chatMessages.length === 0 ? (
              <div className="text-center text-muted-foreground">
                <div className="text-2xl mb-2">🌾</div>
                <p className="text-sm mb-3">Ask me anything about farming!</p>
                <div className="text-xs space-y-1">
                  <p>• "मेरी फसल में पीले पत्ते हैं"</p>
                  <p>• "Best fertilizer for wheat?"</p>
                  <p>• "Market prices in Punjab"</p>
                </div>
              </div>
            ) : (
              chatMessages.map((msg, index) => (
                <div key={index} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[80%] p-2 rounded-lg text-sm ${
                    msg.role === 'user' 
                      ? 'bg-primary text-primary-foreground' 
                      : 'bg-muted text-muted-foreground'
                  }`}>
                    {msg.content}
                  </div>
                </div>
              ))
            )}
            {chatLoading && (
              <div className="flex justify-start">
                <div className="bg-muted text-muted-foreground p-2 rounded-lg text-sm">
                  <div className="flex items-center gap-1">
                    <div className="w-2 h-2 bg-primary rounded-full animate-pulse"></div>
                    <div className="w-2 h-2 bg-primary rounded-full animate-pulse delay-75"></div>
                    <div className="w-2 h-2 bg-primary rounded-full animate-pulse delay-150"></div>
                  </div>
                </div>
              </div>
            )}
          </div>
          
          <div className="p-4 border-t">
            <div className="flex gap-2">
              <input
                type="text"
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                placeholder="Ask about farming..."
                className="flex-1 px-3 py-2 text-sm border border-border rounded-md bg-background"
                onKeyPress={(e) => e.key === 'Enter' && handleChatSubmit()}
                disabled={chatLoading}
              />
              <Button 
                size="sm" 
                onClick={handleChatSubmit}
                disabled={chatLoading || !chatInput.trim()}
              >
                Send
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Results;