import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useLanguage } from '@/contexts/LanguageContext';
import LanguageToggle from '@/components/LanguageToggle';
import { indianCropsList, getLocationFromPincode } from '@/data/mockData';
import { MapPin, Sprout, TrendingUp, Users } from 'lucide-react';
import heroImage from '@/assets/hero-agriculture.jpg';
import fasalLogo from '@/assets/fasal-logo.jpg';

interface LandingProps {
  onSubmit: (data: FormData) => void;
}

interface FormData {
  pincode: string;
  farmArea: number;
  areaUnit: 'acres' | 'hectares';
  previousCrops: string[];
}

const Landing: React.FC<LandingProps> = ({ onSubmit }) => {
  const { t, language } = useLanguage();
  const [formData, setFormData] = useState<FormData>({
    pincode: '',
    farmArea: 1,
    areaUnit: 'acres',
    previousCrops: []
  });
  const [step, setStep] = useState(1);
  const [locationName, setLocationName] = useState('');

  const handlePincodeSubmit = () => {
    if (formData.pincode.length === 6) {
      const location = getLocationFromPincode(formData.pincode);
      setLocationName(`${location.district}, ${location.state}`);
      setStep(2);
    }
  };

  const handleFinalSubmit = () => {
    onSubmit(formData);
  };

  const handleCropSelect = (value: string) => {
    if (formData.previousCrops.length < 3 && !formData.previousCrops.includes(value)) {
      setFormData(prev => ({
        ...prev,
        previousCrops: [...prev.previousCrops, value]
      }));
    }
  };

  const removeCrop = (cropToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      previousCrops: prev.previousCrops.filter(crop => crop !== cropToRemove)
    }));
  };

  if (step === 1) {
    return (
      <div className="min-h-screen bg-gradient-earth">
        {/* Header */}
        <header className="relative z-10 p-4">
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            <div className="flex items-center gap-3">
              <img src={fasalLogo} alt="FASAL Logo" className="h-12 w-12 rounded-lg shadow-card" />
              <div>
                <h1 className="text-2xl font-bold text-gradient-primary">
                  {t('appName')}
                </h1>
                <p className="text-sm text-muted-foreground">
                  {t('tagline')}
                </p>
              </div>
            </div>
            <LanguageToggle />
          </div>
        </header>

        {/* Hero Section */}
        <section className="relative">
          {/* Hero Image */}
          <div 
            className="h-96 bg-cover bg-center relative"
            style={{ backgroundImage: `url(${heroImage})` }}
          >
            <div className="absolute inset-0 bg-gradient-to-r from-primary/80 to-primary/40"></div>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center text-white px-4 max-w-4xl">
                <h1 className="text-4xl md:text-6xl font-bold mb-4">
                  {t('heroTitle')}
                </h1>
                <p className="text-xl md:text-2xl mb-8 opacity-90">
                  {t('heroSubtitle')}
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Main Form Section */}
        <section className="py-16 px-4">
          <div className="max-w-md mx-auto">
            <Card className="shadow-elevation border-primary/20">
              <CardHeader className="text-center">
                <CardTitle className="text-2xl text-primary flex items-center justify-center gap-2">
                  <MapPin className="h-6 w-6" />
                  {t('enterPincode')}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <Label htmlFor="pincode" className="text-base font-medium">
                    {t('enterPincode')}
                  </Label>
                  <Input
                    id="pincode"
                    type="text"
                    placeholder={t('placeholder_pincode')}
                    value={formData.pincode}
                    onChange={(e) => {
                      const value = e.target.value.replace(/\D/g, '').slice(0, 6);
                      setFormData(prev => ({ ...prev, pincode: value }));
                    }}
                    className="text-lg py-6 mt-2 border-primary/20 focus:border-primary"
                    maxLength={6}
                  />
                </div>
                
                <Button 
                  variant="hero" 
                  size="lg" 
                  onClick={handlePincodeSubmit}
                  disabled={formData.pincode.length !== 6}
                  className="w-full text-lg py-6"
                >
                  <Sprout className="h-5 w-5 mr-2" />
                  {t('getRecommendations')}
                </Button>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-16 px-4 bg-card">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-3xl font-bold text-center text-primary mb-12">
              Why Choose FASAL?
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="bg-gradient-primary rounded-full p-4 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                  <TrendingUp className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Smart Recommendations</h3>
                <p className="text-muted-foreground">AI-powered crop suggestions based on your local conditions</p>
              </div>
              <div className="text-center">
                <div className="bg-gradient-secondary rounded-full p-4 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                  <Sprout className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Profit Optimization</h3>
                <p className="text-muted-foreground">Maximize your returns with data-driven insights</p>
              </div>
              <div className="text-center">
                <div className="bg-gradient-primary rounded-full p-4 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                  <Users className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Farmer Community</h3>
                <p className="text-muted-foreground">Connect with thousands of Indian farmers</p>
              </div>
            </div>
          </div>
        </section>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-earth">
      {/* Header */}
      <header className="p-4 border-b border-primary/10">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img src={fasalLogo} alt="FASAL Logo" className="h-10 w-10 rounded-lg" />
            <div>
              <h1 className="text-xl font-bold text-gradient-primary">{t('appName')}</h1>
              <p className="text-sm text-muted-foreground flex items-center gap-1">
                <MapPin className="h-3 w-3" />
                {locationName}
              </p>
            </div>
          </div>
          <LanguageToggle />
        </div>
      </header>

      {/* Farm Details Form */}
      <section className="py-8 px-4">
        <div className="max-w-2xl mx-auto">
          <Card className="shadow-elevation">
            <CardHeader>
              <CardTitle className="text-center text-primary">Farm Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Farm Area */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="farmArea" className="font-medium">{t('farmArea')}</Label>
                  <Input
                    id="farmArea"
                    type="number"
                    value={formData.farmArea}
                    onChange={(e) => setFormData(prev => ({ 
                      ...prev, 
                      farmArea: Math.max(0.1, parseFloat(e.target.value) || 0) 
                    }))}
                    className="mt-2"
                    min="0.1"
                    step="0.1"
                  />
                </div>
                <div>
                  <Label className="font-medium">Unit</Label>
                  <Select value={formData.areaUnit} onValueChange={(value) => 
                    setFormData(prev => ({ ...prev, areaUnit: value as 'acres' | 'hectares' }))
                  }>
                    <SelectTrigger className="mt-2">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="acres">{t('acres')}</SelectItem>
                      <SelectItem value="hectares">{t('hectares')}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Previous Crops */}
              <div>
                <Label className="font-medium">{t('lastCrops')} (Optional)</Label>
                <Select onValueChange={handleCropSelect}>
                  <SelectTrigger className="mt-2">
                    <SelectValue placeholder={t('selectCrops')} />
                  </SelectTrigger>
                  <SelectContent>
                    {indianCropsList
                      .filter(crop => !formData.previousCrops.includes(crop.value))
                      .map(crop => (
                        <SelectItem key={crop.value} value={crop.value}>
                          {crop.label}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
                
                {/* Selected Crops */}
                {formData.previousCrops.length > 0 && (
                  <div className="mt-3 flex flex-wrap gap-2">
                    {formData.previousCrops.map(cropValue => {
                      const crop = indianCropsList.find(c => c.value === cropValue);
                      return (
                        <div 
                          key={cropValue}
                          className="bg-primary/10 text-primary px-3 py-1 rounded-full text-sm flex items-center gap-2"
                        >
                          {crop?.label}
                          <button 
                            onClick={() => removeCrop(cropValue)}
                            className="text-primary hover:text-destructive"
                          >
                            ×
                          </button>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              <Button 
                variant="hero" 
                size="lg" 
                onClick={handleFinalSubmit}
                className="w-full"
              >
                <TrendingUp className="h-5 w-5 mr-2" />
                Get My Crop Recommendations
              </Button>
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  );
};

export default Landing;