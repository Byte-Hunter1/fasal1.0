import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useLanguage } from '@/contexts/LanguageContext';
import { supabase } from '@/integrations/supabase/client';
import { Thermometer, Droplets, Eye, Loader2 } from 'lucide-react';

interface WeatherWidgetProps {
  pincode?: string;
}

const WeatherWidget: React.FC<WeatherWidgetProps> = ({ pincode }) => {
  const { t } = useLanguage();
  const [weather, setWeather] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (pincode) {
      fetchWeatherData(pincode);
    }
  }, [pincode]);

  const fetchWeatherData = async (pincodeValue: string) => {
    setLoading(true);
    setError(null);
    
    try {
      const { data, error } = await supabase.functions.invoke('get-weather', {
        body: { pincode: pincodeValue }
      });

      if (error) {
        throw new Error(error.message);
      }

      setWeather(data);
    } catch (err: any) {
      console.error('Weather fetch error:', err);
      setError(err.message || 'Failed to fetch weather data');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Card className="shadow-card border-primary/10">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-primary">
            <Loader2 className="h-4 w-4 animate-spin" />
            {t('weatherForecast')}
          </CardTitle>
        </CardHeader>
        <CardContent className="flex items-center justify-center py-8">
          <div className="text-muted-foreground">Loading weather data...</div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="shadow-card border-primary/10">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-primary">
            🌤️ {t('weatherForecast')}
          </CardTitle>
        </CardHeader>
        <CardContent className="text-center py-8">
          <div className="text-muted-foreground text-sm">{error}</div>
        </CardContent>
      </Card>
    );
  }

  if (!weather) {
    return (
      <Card className="shadow-card border-primary/10">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-primary">
            🌤️ {t('weatherForecast')}
          </CardTitle>
        </CardHeader>
        <CardContent className="text-center py-8">
          <div className="text-muted-foreground text-sm">Enter pincode to view weather</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="shadow-card border-primary/10">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-primary">
          <span className="text-2xl">{weather.current.icon}</span>
          {t('weatherForecast')}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Current Weather */}
        <div className="bg-gradient-earth rounded-lg p-4">
          <div className="text-center">
            <div className="text-3xl font-bold text-primary mb-1">
              {weather.current.temperature}°C
            </div>
            <div className="text-muted-foreground">{weather.current.description}</div>
            <div className="text-sm text-muted-foreground mt-1">{weather.location}</div>
          </div>
          
          <div className="grid grid-cols-2 gap-4 mt-4">
            <div className="flex items-center gap-2">
              <Droplets className="h-4 w-4 text-info" />
              <div className="text-sm">
                <div className="font-medium">{t('humidity')}</div>
                <div className="text-muted-foreground">{weather.current.humidity}%</div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Eye className="h-4 w-4 text-warning" />
              <div className="text-sm">
                <div className="font-medium">Visibility</div>
                <div className="text-muted-foreground">10 km</div>
              </div>
            </div>
          </div>
        </div>

        {/* 7-Day Forecast */}
        <div>
          <h4 className="font-medium text-sm text-muted-foreground mb-3">7-Day Forecast</h4>
          <div className="space-y-2">
            {weather.forecast.slice(0, 4).map((day, index) => (
              <div key={index} className="flex items-center justify-between py-2 px-3 rounded-lg bg-muted/30">
                <div className="flex items-center gap-3">
                  <span className="text-xs font-medium w-16">{day.date}</span>
                  <span className="text-sm text-muted-foreground">{day.description}</span>
                </div>
                <div className="flex items-center gap-2">
                  {day.rainfall > 0 && (
                    <div className="flex items-center gap-1 text-xs text-info">
                      <Droplets className="h-3 w-3" />
                      {day.rainfall}mm
                    </div>
                  )}
                  <div className="text-sm font-medium">
                    {day.high}°/{day.low}°
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default WeatherWidget;