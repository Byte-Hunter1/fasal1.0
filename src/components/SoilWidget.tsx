import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useLanguage } from '@/contexts/LanguageContext';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { Beaker, Droplets, Leaf, AlertTriangle, Loader2 } from 'lucide-react';

interface SoilWidgetProps {
  pincode?: string;
  location?: {
    district?: string;
    state?: string;
  };
}

const SoilWidget: React.FC<SoilWidgetProps> = ({ pincode, location }) => {
  const { t } = useLanguage();
  const [soilData, setSoilData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (pincode && location) {
      fetchSoilData();
    }
  }, [pincode, location]);

  const fetchSoilData = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const { data, error } = await supabase.functions.invoke('get-soil-data', {
        body: { 
          pincode,
          district: location?.district || 'Unknown',
          state: location?.state || 'Unknown'
        }
      });

      if (error) {
        throw new Error(error.message);
      }

      setSoilData(data);
    } catch (err: any) {
      console.error('Soil data fetch error:', err);
      setError(err.message || 'Failed to fetch soil data');
    } finally {
      setLoading(false);
    }
  };

  const getPhStatus = (ph: number) => {
    if (ph < 6.0) return { status: 'Acidic', color: 'destructive' };
    if (ph > 8.0) return { status: 'Alkaline', color: 'warning' };
    return { status: 'Optimal', color: 'success' };
  };

  const getNutrientStatus = (value: number) => {
    if (value < 40) return { status: 'Low', color: 'destructive' };
    if (value < 70) return { status: 'Medium', color: 'warning' };
    return { status: 'High', color: 'success' };
  };

  if (loading) {
    return (
      <Card className="shadow-card border-primary/10">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-primary">
            <Loader2 className="h-4 w-4 animate-spin" />
            {t('soilAnalysis')}
          </CardTitle>
        </CardHeader>
        <CardContent className="flex items-center justify-center py-8">
          <div className="text-muted-foreground">Loading soil data...</div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="shadow-card border-primary/10">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-primary">
            <Beaker className="h-5 w-5" />
            {t('soilAnalysis')}
          </CardTitle>
        </CardHeader>
        <CardContent className="text-center py-8">
          <div className="text-muted-foreground text-sm">{error}</div>
        </CardContent>
      </Card>
    );
  }

  if (!soilData) {
    return (
      <Card className="shadow-card border-primary/10">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-primary">
            <Beaker className="h-5 w-5" />
            {t('soilAnalysis')}
          </CardTitle>
        </CardHeader>
        <CardContent className="text-center py-8">
          <div className="text-muted-foreground text-sm">Enter pincode to view soil analysis</div>
        </CardContent>
      </Card>
    );
  }

  const phStatus = getPhStatus(soilData.ph);

  return (
    <Card className="shadow-card border-primary/10">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-primary">
          <Beaker className="h-5 w-5" />
          {t('soilAnalysis')}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Soil Type & pH */}
        <div className="bg-gradient-earth rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium">Soil Type: {soilData.soilType}</span>
            <Badge variant={phStatus.color as any} className="text-xs">
              {soilData.ph.toFixed(1)} - {phStatus.status}
            </Badge>
          </div>
          <div className="text-xs text-muted-foreground">
            Last tested: {soilData.lastTested} • {soilData.testingCenter}
          </div>
        </div>

        {/* Nutrient Levels */}
        <div className="space-y-3">
          <h4 className="font-medium text-sm text-muted-foreground">Nutrient Levels</h4>
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-sm">N</span>
              <Badge variant={getNutrientStatus(soilData.nitrogen).color as any} className="text-xs">
                {Math.round(soilData.nitrogen)} - {getNutrientStatus(soilData.nitrogen).status}
              </Badge>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm">P</span>
              <Badge variant={getNutrientStatus(soilData.phosphorus).color as any} className="text-xs">
                {Math.round(soilData.phosphorus)} - {getNutrientStatus(soilData.phosphorus).status}
              </Badge>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm">K</span>
              <Badge variant={getNutrientStatus(soilData.potassium).color as any} className="text-xs">
                {Math.round(soilData.potassium)} - {getNutrientStatus(soilData.potassium).status}
              </Badge>
            </div>
          </div>
        </div>

        {/* Additional Properties */}
        <div className="grid grid-cols-2 gap-4">
          <div className="flex items-center gap-2">
            <Droplets className="h-4 w-4 text-info" />
            <div className="text-sm">
              <div className="font-medium">Moisture</div>
              <div className="text-muted-foreground">{soilData.moisture}</div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Leaf className="h-4 w-4 text-success" />
            <div className="text-sm">
              <div className="font-medium">Organic Matter</div>
              <div className="text-muted-foreground">{soilData.organicMatter}%</div>
            </div>
          </div>
        </div>

        {/* Recommendations */}
        <div className="space-y-3">
          <h4 className="font-medium text-sm text-muted-foreground">Recommendations</h4>
          <div className="space-y-3">
            {soilData.recommendations?.map((rec: string, index: number) => (
              <div key={index} className="flex items-start gap-2 text-sm">
                <AlertTriangle className="h-4 w-4 text-warning mt-0.5 flex-shrink-0" />
                <span className="text-muted-foreground">{rec}</span>
              </div>
            )) || (
              <div className="text-sm text-muted-foreground">No specific recommendations available</div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default SoilWidget;