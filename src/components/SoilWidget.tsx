import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useLanguage } from '@/contexts/LanguageContext';
import { mockSoilData } from '@/data/mockData';
import { TestTube, Droplets } from 'lucide-react';

const SoilWidget: React.FC = () => {
  const { t } = useLanguage();
  const soil = mockSoilData;

  const getQualityColor = (quality: string) => {
    switch (quality) {
      case 'excellent': return 'bg-success';
      case 'good': return 'bg-primary';
      case 'fair': return 'bg-warning';
      case 'poor': return 'bg-destructive';
      default: return 'bg-muted';
    }
  };

  return (
    <Card className="shadow-card border-primary/10">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-primary">
            <TestTube className="h-5 w-5" />
            {t('soilQuality')}
          </div>
          <Badge className={`${getQualityColor(soil.quality)} text-white`}>
            {soil.quality.toUpperCase()}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* pH Level */}
        <div className="bg-gradient-earth rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium">pH Level</span>
            <span className="font-bold text-primary">{soil.ph}</span>
          </div>
          <Progress value={((soil.ph - 4) / 6) * 100} className="h-2" />
          <div className="flex justify-between text-xs text-muted-foreground mt-1">
            <span>Acidic (4)</span>
            <span>Neutral (7)</span>
            <span>Alkaline (10)</span>
          </div>
        </div>

        {/* Nutrient Levels */}
        <div className="grid grid-cols-3 gap-3">
          <div className="text-center">
            <div className="text-2xl font-bold text-success mb-1">{soil.nitrogen}%</div>
            <div className="text-xs text-muted-foreground">Nitrogen (N)</div>
            <Progress value={soil.nitrogen} className="h-1 mt-2" />
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-warning mb-1">{soil.phosphorus}%</div>
            <div className="text-xs text-muted-foreground">Phosphorus (P)</div>
            <Progress value={soil.phosphorus} className="h-1 mt-2" />
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-info mb-1">{soil.potassium}%</div>
            <div className="text-xs text-muted-foreground">Potassium (K)</div>
            <Progress value={soil.potassium} className="h-1 mt-2" />
          </div>
        </div>

        {/* Additional Properties */}
        <div className="grid grid-cols-2 gap-4">
          <div className="flex items-center gap-2">
            <Droplets className="h-4 w-4 text-info" />
            <div className="text-sm">
              <div className="font-medium">Moisture</div>
              <div className="text-muted-foreground">{soil.moisture}%</div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="h-4 w-4 rounded-full bg-primary"></div>
            <div className="text-sm">
              <div className="font-medium">Organic Matter</div>
              <div className="text-muted-foreground">{soil.organic_matter}%</div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default SoilWidget;