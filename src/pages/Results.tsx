import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useLanguage } from '@/contexts/LanguageContext';
import LanguageToggle from '@/components/LanguageToggle';
import WeatherWidget from '@/components/WeatherWidget';
import SoilWidget from '@/components/SoilWidget';
import CropCard from '@/components/CropCard';
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
  
  const recommendations = calculateRecommendations(
    formData.pincode,
    formData.farmArea,
    formData.previousCrops,
    formData.areaUnit
  );

  const handleViewDetails = (crop: any) => {
    setSelectedCrop(crop);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(amount);
  };

  if (selectedCrop) {
    return (
      <div className="min-h-screen bg-gradient-earth">
        {/* Header */}
        <header className="p-4 border-b border-primary/10 bg-card">
          <div className="max-w-6xl mx-auto flex items-center justify-between">
            <Button variant="outline" onClick={() => setSelectedCrop(null)}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Results
            </Button>
            <LanguageToggle />
          </div>
        </header>

        {/* Crop Details */}
        <section className="py-8 px-4">
          <div className="max-w-4xl mx-auto">
            <Card className="shadow-elevation">
              <CardHeader>
                <div className="flex items-center gap-4">
                  <div className="text-6xl">{selectedCrop.image}</div>
                  <div>
                    <CardTitle className="text-3xl text-primary mb-2">
                      {selectedCrop.name_en} / {selectedCrop.name_hi}
                    </CardTitle>
                    <Badge className="bg-success text-success-foreground">
                      ROI: +{selectedCrop.actualROI.toFixed(1)}%
                    </Badge>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Investment Breakdown */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <Card className="bg-gradient-primary text-primary-foreground">
                    <CardContent className="p-6 text-center">
                      <div className="text-2xl font-bold mb-2">
                        {formatCurrency(selectedCrop.totalInvestment)}
                      </div>
                      <div className="text-primary-foreground/80">{t('investmentRequired')}</div>
                    </CardContent>
                  </Card>
                  <Card className="bg-gradient-secondary text-secondary-foreground">
                    <CardContent className="p-6 text-center">
                      <div className="text-2xl font-bold mb-2">
                        {formatCurrency(selectedCrop.expectedReturn)}
                      </div>
                      <div className="text-secondary-foreground/80">{t('expectedReturns')}</div>
                    </CardContent>
                  </Card>
                  <Card className="bg-success text-success-foreground">
                    <CardContent className="p-6 text-center">
                      <div className="text-2xl font-bold mb-2">
                        {formatCurrency(selectedCrop.profitAmount)}
                      </div>
                      <div className="text-success-foreground/80">Net Profit</div>
                    </CardContent>
                  </Card>
                </div>

                {/* Fertilizer Schedule */}
                <Card>
                  <CardHeader>
                    <CardTitle>Fertilizer Schedule</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="bg-muted/30 p-4 rounded-lg">
                          <h4 className="font-semibold text-primary mb-2">Pre-Sowing</h4>
                          <p className="text-sm text-muted-foreground mb-2">Apply 2 weeks before sowing</p>
                          <ul className="text-sm space-y-1">
                            <li>• DAP: 50 kg/acre (₹1,350)</li>
                            <li>• Potash: 25 kg/acre (₹600)</li>
                          </ul>
                        </div>
                        <div className="bg-muted/30 p-4 rounded-lg">
                          <h4 className="font-semibold text-primary mb-2">Vegetative Stage</h4>
                          <p className="text-sm text-muted-foreground mb-2">30-45 days after sowing</p>
                          <ul className="text-sm space-y-1">
                            <li>• Urea: 50 kg/acre (₹300)</li>
                            <li>• Zinc Sulphate: 10 kg/acre (₹200)</li>
                          </ul>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Pesticide Schedule */}
                <Card>
                  <CardHeader>
                    <CardTitle>Pesticide & Disease Management</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="bg-warning/10 p-4 rounded-lg border border-warning/20">
                        <h4 className="font-semibold text-warning-foreground mb-2">⚠️ Common Pests</h4>
                        <ul className="text-sm space-y-2">
                          <li><strong>Aphids:</strong> Spray Imidacloprid 200ml/acre when pest count exceeds threshold</li>
                          <li><strong>Leaf Blight:</strong> Apply Copper Fungicide 2g/liter at first symptoms</li>
                          <li><strong>Stem Borer:</strong> Use Chlorpyrifos 2ml/liter preventively</li>
                        </ul>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Best Practices */}
                <Card>
                  <CardHeader>
                    <CardTitle>Best Practices</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2 text-sm">
                      <li>✅ Maintain proper spacing between plants for optimal growth</li>
                      <li>✅ Regular monitoring for pest and disease symptoms</li>
                      <li>✅ Ensure adequate irrigation without waterlogging</li>
                      <li>✅ Use certified seeds from authorized dealers</li>
                      <li>✅ Follow integrated pest management practices</li>
                    </ul>
                  </CardContent>
                </Card>
              </CardContent>
            </Card>
          </div>
        </section>
      </div>
    );
  }

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
              
              {recommendations.length === 0 ? (
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
              <WeatherWidget />
              <SoilWidget />
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

      {/* Simple Chatbot Popup */}
      {showChatbot && (
        <div className="fixed bottom-24 right-6 w-80 h-96 bg-card border border-primary/20 rounded-lg shadow-elevation p-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-primary">AI Farm Assistant</h3>
            <Button variant="ghost" size="sm" onClick={() => setShowChatbot(false)}>×</Button>
          </div>
          <div className="text-center text-muted-foreground">
            <div className="text-4xl mb-4">🤖</div>
            <p className="text-sm">
              AI chatbot integration coming soon! This will provide personalized farming advice in Hindi and English.
            </p>
            <div className="mt-4 text-xs space-y-1">
              <p>Sample queries:</p>
              <p>• "मेरी फसल में पीले पत्ते हैं"</p>
              <p>• "Best fertilizer for wheat?"</p>
              <p>• "Market prices in Punjab"</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Results;