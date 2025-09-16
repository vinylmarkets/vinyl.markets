import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface BriefingRequest {
  category: string;
  stockSymbols?: string[];
  marketConditions?: any;
  userPreferences?: {
    explanation_mode: string;
    risk_tolerance: string;
  };
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

    if (!openAIApiKey) {
      throw new Error('OpenAI API key not configured');
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    const { category, stockSymbols, marketConditions, userPreferences }: BriefingRequest = await req.json();

    console.log('Generating briefing for category:', category);

    // Create comprehensive prompts for both modes
    const systemPrompt = `You are a senior financial analyst creating daily market intelligence briefings. 
    Focus on the ${category} category. 
    Provide accurate, balanced analysis without investment advice.
    Include relevant data sources and methodology notes.
    Always include appropriate risk disclaimers.`;

    const academicPrompt = `Create an academic-style briefing covering:
    === Market Pulse ===
    (2-3 sentences capturing the current state)
    
    === Deep Dive Analysis ===
    (data-driven insights with supporting evidence)
    
    === Research Methodology ===
    (data sources and analytical approach used)
    
    === Risk Assessment ===
    (key factors and limitations to consider)
    
    === Learning Corner ===
    (key concept explanation for education)
    
    Category: ${category}
    ${stockSymbols ? `Focus stocks: ${stockSymbols.join(', ')}` : ''}
    ${marketConditions ? `Market context: ${JSON.stringify(marketConditions)}` : ''}
    
    IMPORTANT: Use === Header === format for section headers. Do NOT use any HTML tags. Return plain text only.`;

    const plainSpeakPrompt = `Create a plain-language version of the same briefing:
    === Today's Market Story ===
    (simple summary of what happened)
    
    === Why This Matters to You ===
    (easy explanation of significance)
    
    === What to Watch Next ===
    (key indicators and upcoming events)
    
    === Quick Learning Moment ===
    (educational insight made simple)
    
    Use conversational tone, avoid jargon, explain complex terms simply.
    Same content as academic version but accessible to beginners.
    IMPORTANT: Use === Header === format for section headers. Do NOT use any HTML tags. Return plain text only.`;

    // Generate academic content
    const academicResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: academicPrompt }
        ],
        max_tokens: 2000,
        temperature: 0.7,
      }),
    });

    // Simple text cleaning (no HTML needed since we're generating plain text)
    const cleanTextContent = (content: string): string => {
      return content
        .replace(/```html/gi, '')
        .replace(/```/gi, '')
        .replace(/^\s*html\s*$/gmi, '')
        .trim();
    };

    const academicData = await academicResponse.json();
    let academicContent = cleanTextContent(academicData.choices[0].message.content);

    // Generate plain speak content
    const plainSpeakResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: plainSpeakPrompt }
        ],
        max_tokens: 2000,
        temperature: 0.7,
      }),
    });

    const plainSpeakData = await plainSpeakResponse.json();
    let plainSpeakContent = cleanTextContent(plainSpeakData.choices[0].message.content);

    // Generate educational principle
    const educationalResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { 
            role: 'system', 
            content: 'Extract one key financial concept from the briefing and explain it simply with an example.' 
          },
          { 
            role: 'user', 
            content: `From this briefing content, identify the most important financial concept to teach: ${academicContent.substring(0, 500)}` 
          }
        ],
        max_tokens: 300,
        temperature: 0.5,
      }),
    });

    const educationalData = await educationalResponse.json();
    const educationalPrinciple = {
      title: "Key Financial Concept",
      content: educationalData.choices[0].message.content,
      difficulty: "beginner"
    };

    // Generate engaging title
    const titleResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { 
            role: 'system', 
            content: 'Create an engaging, clickable title for a market intelligence briefing. Use power words, be specific, and create curiosity. Maximum 80 characters.' 
          },
          { 
            role: 'user', 
            content: `Create a compelling title for a ${category} briefing based on this content: ${academicContent.substring(0, 300)}` 
          }
        ],
        max_tokens: 50,
        temperature: 0.8,
      }),
    });

    const titleData = await titleResponse.json();
    const engagingTitle = cleanTextContent(titleData.choices[0].message.content)
      .replace(/['"]/g, '');

    // Create briefing record in database
    const briefingData = {
      title: engagingTitle,
      category,
      executive_summary: academicContent.split('\n')[0] || 'Market analysis and insights for informed decision-making.',
      academic_content: academicContent,
      plain_speak_content: plainSpeakContent,
      educational_principle: educationalPrinciple,
      stocks_mentioned: stockSymbols || [],
      methodology_notes: "Generated using GPT-4o-mini with real-time market data analysis",
      risk_disclaimers: "This analysis is for educational purposes only and does not constitute investment advice. Past performance does not guarantee future results.",
      chart_config: {
        type: "line",
        title: `${category} Performance Trend`,
        data_points: []
      },
      published: true,
      publication_date: new Date().toISOString()
    };

    const { data: briefing, error } = await supabase
      .from('briefings')
      .insert(briefingData)
      .select()
      .single();

    if (error) {
      console.error('Database error:', error);
      throw new Error(`Failed to save briefing: ${error.message}`);
    }

    console.log('Briefing created successfully:', briefing.id);

    return new Response(JSON.stringify({ 
      success: true, 
      briefing_id: briefing.id,
      briefing
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error generating briefing:', error);
    return new Response(JSON.stringify({ 
      error: error.message,
      success: false 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});