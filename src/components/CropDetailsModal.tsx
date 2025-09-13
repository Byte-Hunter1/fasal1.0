import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useLanguage } from '@/contexts/LanguageContext';
import { TrendingUp, IndianRupee, Sprout, BarChart3, AlertTriangle } from 'lucide-react';
import { Progress } from '@/components/ui/progress';

interface InvestmentBreakdown {
  seeds?: number;
  fertilizer?: number;
  labor?: number;
  irrigation?: number;
  pesticides?: number;
  other?: number;
}

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
  investmentBreakdown?: InvestmentBreakdown | null;
  marketPriceRange?: string;
  yieldPerAcre?: string;
  riskLevel?: string;
}

interface CropDetailsModalProps {
  crop: CropRecommendation | null;
  onClose: () => void;
  weatherData?: any;
  soilData?: any;
}

const CropDetailsModal: React.FC<CropDetailsModalProps> = ({ crop, onClose, weatherData, soilData }) => {
  const { language, t } = useLanguage();
  const [isOpen, setIsOpen] = useState(true);

  if (!crop) return null;
  
  const handleClose = () => {
    setIsOpen(false);
    onClose();
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const getRiskColor = (risk: string) => {
    switch (risk?.toLowerCase()) {
      case 'low': return 'bg-success text-success-foreground';
      case 'medium': return 'bg-warning text-warning-foreground';
      case 'high': return 'bg-destructive text-destructive-foreground';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  const renderInvestmentBreakdown = () => {
    if (!crop.investmentBreakdown) return null;

    const breakdown = crop.investmentBreakdown;
    const total = crop.totalInvestment;
    
    // Calculate percentages for each category
    const categories = [
      { name: 'Seeds', value: breakdown.seeds || 0, icon: '🌱' },
      { name: 'Fertilizer', value: breakdown.fertilizer || 0, icon: '🧪' },
      { name: 'Labor', value: breakdown.labor || 0, icon: '👨‍🌾' },
      { name: 'Irrigation', value: breakdown.irrigation || 0, icon: '💦' },
      { name: 'Pesticides', value: breakdown.pesticides || 0, icon: '🐛' },
      { name: 'Other', value: breakdown.other || 0, icon: '📦' },
    ].filter(cat => cat.value > 0);

    return (
      <div className="space-y-4">
        <h3 className="font-semibold text-lg flex items-center gap-2">
          <BarChart3 className="h-5 w-5" />
          {t('investmentBreakdown')}
        </h3>
        
        <div className="space-y-3">
          {categories.map((category) => {
            const percentage = Math.round((category.value / total) * 100);
            
            return (
              <div key={category.name} className="space-y-1">
                <div className="flex justify-between text-sm">
                  <span className="flex items-center gap-1">
                    <span>{category.icon}</span>
                    <span>{t(category.name.toLowerCase())}</span>
                  </span>
                  <span className="font-medium">{formatCurrency(category.value)} ({percentage}%)</span>
                </div>
                <Progress value={percentage} className="h-2" />
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && handleClose()}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl flex items-center gap-3">
            <span className="text-4xl">{crop.image || '🌾'}</span>
            <span>{language === 'hi' ? crop.name_hi : crop.name_en}</span>
            <Badge className={`ml-auto ${getRiskColor(crop.riskLevel || 'Medium')}`}>
              {crop.riskLevel || 'Medium'} {t('risk')}
            </Badge>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Description */}
          <div>
            <p className="text-muted-foreground">
              {language === 'hi' ? crop.description_hi : crop.description_en}
            </p>
          </div>

          {/* Financial Overview */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="bg-primary/10">
              <CardContent className="p-4 text-center">
                <div className="flex justify-center mb-2 text-primary">
                  <IndianRupee className="h-5 w-5" />
                </div>
                <div className="font-bold text-xl">{formatCurrency(crop.totalInvestment)}</div>
                <div className="text-sm text-muted-foreground">{t('investmentRequired')}</div>
              </CardContent>
            </Card>
            
            <Card className="bg-success/10">
              <CardContent className="p-4 text-center">
                <div className="flex justify-center mb-2 text-success">
                  <Sprout className="h-5 w-5" />
                </div>
                <div className="font-bold text-xl">{formatCurrency(crop.expectedReturn)}</div>
                <div className="text-sm text-muted-foreground">{t('expectedReturns')}</div>
              </CardContent>
            </Card>
            
            <Card className="bg-secondary/10">
              <CardContent className="p-4 text-center">
                <div className="flex justify-center mb-2 text-secondary">
                  <TrendingUp className="h-5 w-5" />
                </div>
                <div className="font-bold text-xl">{formatCurrency(crop.profitAmount)}</div>
                <div className="text-sm text-muted-foreground">{t('expectedProfit')}</div>
              </CardContent>
            </Card>
          </div>

          {/* Investment Breakdown */}
          <Card>
            <CardContent className="p-4">
              {renderInvestmentBreakdown() || (
                <div className="text-center text-muted-foreground py-4">
                  <AlertTriangle className="h-5 w-5 mx-auto mb-2" />
                  {t('noInvestmentBreakdown')}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Additional Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {crop.marketPriceRange && (
              <Card>
                <CardContent className="p-4">
                  <h3 className="font-semibold mb-2">{t('marketPrice')}</h3>
                  <p>{crop.marketPriceRange}</p>
                </CardContent>
              </Card>
            )}
            
            {crop.yieldPerAcre && (
              <Card>
                <CardContent className="p-4">
                  <h3 className="font-semibold mb-2">{t('yield')}</h3>
                  <p>{crop.yieldPerAcre}</p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default CropDetailsModal;