import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { prompt } = await req.json();

    if (!prompt) {
      throw new Error('Prompt is required');
    }

    const OPENAI_API_KEY = Deno.env.get('OPENAI_API_KEY');
    if (!OPENAI_API_KEY) {
      throw new Error('OpenAI API key not configured');
    }

    console.log('Generating newsletter with prompt:', prompt);

    // System prompt that defines AtomicMarket's voice and newsletter style
    const systemPrompt = `You are a financial newsletter writer for AtomicMarket, a sophisticated trading intelligence platform. Your writing style is:

- Professional yet accessible - you write for serious traders who want actionable insights
- Data-driven and analytical - always back up claims with evidence
- Direct and concise - no fluff, get to the point quickly
- Educational - explain complex concepts clearly without dumbing them down
- Market-focused - tie everything back to trading opportunities and risk management
- Compliant - never give direct buy/sell recommendations, focus on analysis and education

Newsletter structure:
1. Catchy, descriptive title
2. Executive summary (2-3 sentences)
3. Main analysis (3-4 paragraphs)
4. Key takeaways (bullet points)
5. Trading implications (what traders should watch)

Use markdown formatting for emphasis and structure. Keep the total length between 500-800 words.`;

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-5-mini-2025-08-07',
        messages: [
          { role: 'system', content: systemPrompt },
          { 
            role: 'user', 
            content: `Write a newsletter article based on this prompt: ${prompt}

Please format your response as JSON with two fields:
- "title": The newsletter title
- "content": The full newsletter content in markdown format` 
          }
        ],
        max_completion_tokens: 2000,
      }),
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error('OpenAI API error:', response.status, errorData);
      throw new Error(`OpenAI API error: ${response.status}`);
    }

    const data = await response.json();
    const generatedText = data.choices[0].message.content;

    // Try to parse as JSON first
    let result;
    try {
      result = JSON.parse(generatedText);
    } catch (e) {
      // If not JSON, extract title and content manually
      const lines = generatedText.split('\n');
      const title = lines[0].replace(/^#\s*/, '').trim();
      const content = lines.slice(1).join('\n').trim();
      result = { title, content };
    }

    console.log('Newsletter generated successfully');

    return new Response(
      JSON.stringify(result),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (error: any) {
    console.error('Error in generate-newsletter-content:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
