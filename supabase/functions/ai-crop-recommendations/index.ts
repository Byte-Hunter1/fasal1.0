import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { pincode, farmArea, areaUnit, previousCrops, weatherData, soilData, locationData } = await req.json();
    
    const OPENAI_API_KEY = Deno.env.get('OPENAI_API_KEY');
    
    if (!OPENAI_API_KEY) {
      throw new Error('OpenAI API key not configured');
    }

    // Get current season
    const currentMonth = new Date().getMonth() + 1;
    let season = 'kharif';
    if (currentMonth >= 10 || currentMonth <= 3) {
      season = 'rabi';
    } else if (currentMonth >= 4 && currentMonth <= 6) {
      season = 'zaid';
    }

    const systemPrompt = `You are an expert agricultural advisor for Indian farming. Based on the provided data, recommend the TOP 5 most suitable and profitable crops for the farmer.

IMPORTANT INSTRUCTIONS:
1. Provide realistic investment and return calculations based on current Indian market rates
2. Consider the specific location, weather, soil conditions, and season
3. Factor in crop rotation benefits if previous crops are provided
4. Calculate profit as: Expected Returns - Total Investment
5. Ensure all financial figures are realistic and profitable
6. Consider both Kharif and Rabi season crops based on timing
7. Provide crop-specific advice for the region

CONTEXT:
- Location: ${locationData?.name || 'Unknown'}, ${locationData?.state || 'India'}
- Pincode: ${pincode}
- Farm Area: ${farmArea} ${areaUnit}
- Current Season: ${season}
- Previous Crops: ${previousCrops?.join(', ') || 'None specified'}
- Weather: ${weatherData ? `${weatherData.current.temp}°C, ${weatherData.current.description}` : 'Not available'}
- Soil: ${soilData ? `pH: ${soilData.ph}, Quality: ${soilData.quality}` : 'Not available'}

Return ONLY a valid JSON array with exactly this structure (no additional text):
[
  {
    "id": "crop1",
    "name_en": "Crop Name",
    "name_hi": "फसल का नाम",
    "season": "kharif|rabi|zaid",
    "image": "🌾",
    "description": "Brief description of why this crop is suitable",
    "soilType": "loamy|clayey|sandy|black|alluvial",
    "totalInvestment": 45000,
    "expectedReturn": 75000,
    "profitAmount": 30000,
    "actualROI": 66.7,
    "growingStates": ["state1", "state2"],
    "duration": "90-120 days",
    "waterRequirement": "Medium",
    "marketDemand": "High"
  }
]

Ensure:
- profitAmount = expectedReturn - totalInvestment (MUST be positive)
- actualROI = (profitAmount / totalInvestment) * 100
- Investment amounts are realistic for Indian farming (₹20,000 - ₹2,00,000 per acre typically)
- Expected returns should be higher than investment to ensure profitability
- All financial calculations are accurate`;

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4.1-2025-04-14',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: `Please provide crop recommendations for the given conditions. Focus on profitable crops suitable for ${season} season in ${locationData?.state || 'India'}.` }
        ],
        max_tokens: 2000,
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(`OpenAI API error: ${error.error?.message || 'Unknown error'}`);
    }

    const data = await response.json();
    let aiResponse = data.choices[0].message.content;

    // Clean the response to extract JSON
    aiResponse = aiResponse.replace(/```json\n?/g, '').replace(/```\n?/g, '');
    
    try {
      const recommendations = JSON.parse(aiResponse);
      
      // Validate and ensure calculations are correct
      const validatedRecommendations = recommendations.map((crop: any, index: number) => {
        const profit = crop.expectedReturn - crop.totalInvestment;
        const roi = ((profit / crop.totalInvestment) * 100);
        
        return {
          ...crop,
          id: crop.id || `crop_${index + 1}`,
          profitAmount: profit,
          actualROI: parseFloat(roi.toFixed(1)),
          // Scale investment based on farm area
          totalInvestment: Math.round(crop.totalInvestment * (areaUnit === 'hectares' ? farmArea * 2.47 : farmArea)),
          expectedReturn: Math.round(crop.expectedReturn * (areaUnit === 'hectares' ? farmArea * 2.47 : farmArea))
        };
      }).filter((crop: any) => crop.profitAmount > 0); // Only return profitable crops

      // Recalculate after scaling
      const finalRecommendations = validatedRecommendations.map((crop: any) => ({
        ...crop,
        profitAmount: crop.expectedReturn - crop.totalInvestment,
        actualROI: parseFloat(((crop.expectedReturn - crop.totalInvestment) / crop.totalInvestment * 100).toFixed(1))
      }));

      console.log('AI crop recommendations generated for:', pincode, 'Season:', season);
      
      return new Response(JSON.stringify({ 
        recommendations: finalRecommendations,
        season,
        location: locationData?.name || 'Unknown',
        timestamp: new Date().toISOString()
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });

    } catch (parseError) {
      console.error('JSON Parse Error:', parseError);
      console.error('AI Response:', aiResponse);
      throw new Error('Failed to parse AI response');
    }

  } catch (error) {
    console.error('Error in ai-crop-recommendations function:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});