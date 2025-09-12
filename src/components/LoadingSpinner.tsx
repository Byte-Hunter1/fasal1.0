import React from 'react';
import { useLanguage } from '@/contexts/LanguageContext';

interface LoadingSpinnerProps {
  message?: string;
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ message }) => {
  const { t } = useLanguage();

  return (
    <div className="flex flex-col items-center justify-center py-12">
      <div className="relative">
        {/* Spinning wheat animation */}
        <div className="text-6xl animate-spin">🌾</div>
        <div className="absolute inset-0 text-6xl animate-pulse opacity-50">🌱</div>
      </div>
      <div className="mt-4 text-lg font-medium text-primary animate-pulse">
        {message || t('loading')}
      </div>
      <div className="mt-2 text-sm text-muted-foreground">
        Analyzing soil, weather & market data...
      </div>
    </div>
  );
};

export default LoadingSpinner;