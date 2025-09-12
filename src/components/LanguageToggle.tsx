import React from 'react';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/contexts/LanguageContext';
import { Globe } from 'lucide-react';

const LanguageToggle: React.FC = () => {
  const { language, setLanguage, t } = useLanguage();

  const toggleLanguage = () => {
    setLanguage(language === 'en' ? 'hi' : 'en');
  };

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={toggleLanguage}
      className="flex items-center gap-2 border-primary/20 hover:bg-primary/10"
    >
      <Globe className="h-4 w-4" />
      <span>{language === 'en' ? 'हिन्दी' : 'English'}</span>
    </Button>
  );
};

export default LanguageToggle;