import React, { useState } from 'react';
import { LanguageProvider } from '@/contexts/LanguageContext';
import Landing from './Landing';
import Results from './Results';

interface FormData {
  pincode: string;
  farmArea: number;
  areaUnit: 'acres' | 'hectares';
  previousCrops: string[];
}

const Index = () => {
  const [currentView, setCurrentView] = useState<'landing' | 'results'>('landing');
  const [formData, setFormData] = useState<FormData | null>(null);

  const handleFormSubmit = (data: FormData) => {
    setFormData(data);
    setCurrentView('results');
  };

  const handleBackToLanding = () => {
    setCurrentView('landing');
    setFormData(null);
  };

  return (
    <LanguageProvider>
      <div className="min-h-screen">
        {currentView === 'landing' ? (
          <Landing onSubmit={handleFormSubmit} />
        ) : (
          formData && (
            <Results 
              formData={formData} 
              onBack={handleBackToLanding} 
            />
          )
        )}
      </div>
    </LanguageProvider>
  );
};

export default Index;
