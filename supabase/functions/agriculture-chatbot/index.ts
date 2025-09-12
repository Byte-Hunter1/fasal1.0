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
    const { message, language = 'en', userContext } = await req.json();
    
    if (!message) {
      throw new Error('Message is required');
    }

    const OPENAI_API_KEY = Deno.env.get('OPENAI_API_KEY');
    
    if (!OPENAI_API_KEY) {
      throw new Error('OpenAI API key not configured');
    }

    const systemPrompt = `You are FASAL AI, an expert agricultural advisor for Indian farmers. You have comprehensive knowledge of:

🌾 EXPERTISE AREAS:
- Indian crops and their cultivation (Kharif, Rabi, Zaid seasons)
- Soil types, nutrients, pH levels, and fertilization
- Pest and disease management
- Weather patterns and climate impact
- Irrigation methods and water management
- Market trends and government schemes
- Regional farming practices across India
- Organic farming and sustainable practices

🎯 RESPONSE GUIDELINES:
- Provide practical, actionable advice suitable for Indian farming conditions
- Use simple, farmer-friendly language
- Include specific quantities, timings, and methods when giving recommendations
- Consider cost-effectiveness and local availability of resources
- Reference government schemes and subsidies when relevant
- Prioritize sustainable and safe farming practices

🗣️ LANGUAGE:
- Respond primarily in ${language === 'hi' ? 'Hindi (Devanagari script)' : 'English'}
- Use local farming terminology and measurements (bigha, acre, quintal)
- Include both common and scientific names for crops and fertilizers when helpful

📍 CONTEXT AWARENESS:
${userContext ? `
User's Context:
- Location: ${userContext.location || 'Not specified'}
- Previous crops: ${userContext.previousCrops || 'Not specified'}
- Farm area: ${userContext.farmArea || 'Not specified'}
- Current season: ${userContext.season || 'Not specified'}
` : ''}

Remember: Always prioritize farmer safety, environmental sustainability, and economic viability in your recommendations.`;

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: message }
        ],
        max_tokens: 800,
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(`OpenAI API error: ${error.error?.message || 'Unknown error'}`);
    }

    const data = await response.json();
    const aiResponse = data.choices[0].message.content;

    console.log('AI chatbot response generated for message:', message.substring(0, 50));

    return new Response(JSON.stringify({ 
      response: aiResponse,
      language: language,
      timestamp: new Date().toISOString()
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in agriculture-chatbot function:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});