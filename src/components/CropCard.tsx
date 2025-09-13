import React from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useLanguage } from '@/contexts/LanguageContext';
import { TrendingUp, IndianRupee, Sprout, Eye } from 'lucide-react';

interface CropRecommendation {
  id: number | string;
  name_en: string;
  name_hi: string;
  image?: string;
  totalInvestment: number;
  expectedReturn: number;
  profitAmount: number;
  actualROI: number;
  description_en: string;
  description_hi: string;
  investmentBreakdown?: {
    seeds?: number;
    fertilizer?: number;
    labor?: number;
    irrigation?: number;
    pesticides?: number;
    other?: number;
  } | null;
  marketPriceRange?: string;
  yieldPerAcre?: string;
  riskLevel?: string;
}

interface CropCardProps {
  crop: CropRecommendation;
  onViewDetails: (crop: CropRecommendation) => void;
}

const CropCard: React.FC<CropCardProps> = ({ crop, onViewDetails }) => {
  const { language, t } = useLanguage();

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const getRoiColor = (roi: number) => {
    if (roi >= 40) return 'bg-success text-success-foreground';
    if (roi >= 25) return 'bg-primary text-primary-foreground';
    if (roi >= 15) return 'bg-warning text-warning-foreground';
    return 'bg-muted text-muted-foreground';
  };

  return (
    <Card className="shadow-card hover:shadow-elevation transition-all duration-300 border-primary/10 hover:border-primary/30 group">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="text-4xl animate-float">{crop.image}</div>
            <div>
              <h3 className="font-semibold text-lg text-primary">
                {language === 'hi' ? crop.name_hi : crop.name_en}
              </h3>
              <p className="text-sm text-muted-foreground">
                {language === 'hi' ? crop.description_hi : crop.description_en}
              </p>
            </div>
          </div>
          <Badge className={`${getRoiColor(crop.actualROI)} font-bold text-sm px-3 py-1`}>
            <TrendingUp className="h-3 w-3 mr-1" />
            +{crop.actualROI.toFixed(1)}%
          </Badge>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Investment & Returns */}
        <div className="bg-gradient-earth rounded-lg p-4 space-y-3">
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center">
              <div className="flex items-center justify-center gap-1 text-muted-foreground mb-1">
                <IndianRupee className="h-4 w-4" />
                <span className="text-sm">{t('investmentRequired')}</span>
              </div>
              <div className="font-bold text-lg text-primary">
                {formatCurrency(crop.totalInvestment)}
              </div>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center gap-1 text-muted-foreground mb-1">
                <Sprout className="h-4 w-4" />
                <span className="text-sm">{t('expectedReturns')}</span>
              </div>
              <div className="font-bold text-lg text-success">
                {formatCurrency(crop.expectedReturn)}
              </div>
            </div>
          </div>
          
          {/* Profit Highlight */}
          <div className="text-center py-2 px-4 bg-gradient-secondary rounded-lg">
            <div className="text-sm font-medium text-secondary-foreground">
              {t('expectedProfit')}
            </div>
            <div className="font-bold text-xl text-secondary-foreground">
              {formatCurrency(crop.profitAmount)}
            </div>
          </div>
          
          {/* Additional Info */}
          {(crop.riskLevel || crop.marketPriceRange || crop.yieldPerAcre) && (
            <div className="mt-2 space-y-2 text-sm">
              {crop.riskLevel && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">{t('riskLevel')}:</span>
                  <Badge variant={crop.riskLevel === 'Low' ? 'success' : crop.riskLevel === 'Medium' ? 'warning' : 'destructive'}>
                    {crop.riskLevel}
                  </Badge>
                </div>
              )}
              
              {crop.marketPriceRange && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">{t('marketPrice')}:</span>
                  <span className="font-medium">{crop.marketPriceRange}</span>
                </div>
              )}
              
              {crop.yieldPerAcre && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">{t('yield')}:</span>
                  <span className="font-medium">{crop.yieldPerAcre}</span>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Action Button */}
        <Button 
          variant="crop" 
          className="w-full group-hover:shadow-primary"
          onClick={() => onViewDetails(crop)}
        >
          <Eye className="h-4 w-4 mr-2" />
          {t('viewDetails')}
        </Button>
      </CardContent>
    </Card>
  );
};

export default CropCard;