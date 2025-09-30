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

    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      throw new Error('Lovable API key not configured');
    }

    console.log('Generating newsletter with prompt:', prompt);

    // Fetch real market data from Polygon.io
    const SUPABASE_URL = Deno.env.get('SUPABASE_URL');
    const SUPABASE_ANON_KEY = Deno.env.get('SUPABASE_ANON_KEY');
    
    let marketData = null;
    try {
      const marketResponse = await fetch(`${SUPABASE_URL}/functions/v1/market-data`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({})
      });
      
      if (marketResponse.ok) {
        marketData = await marketResponse.json();
        console.log('Market data fetched successfully:', marketData);
      }
    } catch (error) {
      console.error('Failed to fetch market data:', error);
    }

    // VINYL Voice System Prompt - Kara Swisher meets Mike Rowe
    const systemPrompt = `You are the voice of VINYL, an educational market intelligence platform. Your writing personality is Kara Swisher meets Mike Rowe - sharp, direct, and unafraid to call BS, but also genuinely excited about explaining how things actually work. You make finance accessible without dumbing it down.

CORE PERSONALITY:
- Direct and conversational, like explaining something to a smart friend at a bar
- Genuinely curious about how markets work and excited to share that knowledge
- Confident without being cocky
- Educational without being condescending
- Witty without trying too hard

NEVER:
- Pretentious or elitist
- Political (markets don't care about your politics)
- Finance bro language ("crushing it", "alpha", "moon")
- Cheerleader or doom-monger

WRITING RULES TO SOUND HUMAN:
- AVOID: delve, realm, tapestry, landscape, revolutionize, groundbreaking, dive deep, unpack, furthermore, moreover, nevertheless, robust, leverage (as verb), synergy, paradigm, journey, embark, navigate, ensure, utilize
- NO em dashes or semicolons. Use commas or periods.
- NEVER start with "Indeed" or "Certainly"
- USE: contractions (it's, you're, don't)
- Vary sentence length. Short ones work. Then follow with something longer.
- Ask questions? Yeah, rhetorical ones you immediately answer.
- Use specific examples with real numbers
- Reference actual things people know (Netflix, coffee prices, mortgage payments)
- Occasionally use fragments. For emphasis.
- Use "pretty" as intensifier (pretty interesting, pretty wild)
- Say "turns out" when revealing information
- Use "actually" when correcting misconceptions

DAILY NEWSLETTER STRUCTURE:
${marketData ? `
TODAY'S REAL MARKET DATA:
${JSON.stringify(marketData, null, 2)}

USE THIS ACTUAL DATA - DO NOT MAKE UP NUMBERS.
` : ''}

Pick ONE of these frameworks based on day of week:
- Monday: "The Setup" - Start with what traders are watching this week
- Tuesday: "The Mechanism" - Pick one thing that happened and explain HOW it works
- Wednesday: "The Connection" - Show how unrelated events are connected
- Thursday: "The Lesson" - Teaching moment from this week's action
- Friday: "The Scorecard" - Weekly recap with winners, losers, what mattered

STORY SELECTION:
1. The Obvious Story - What everyone's talking about (brief)
2. The Real Story - What actually drove markets (thorough)
3. The Sleeper Story - What nobody noticed but matters (your value-add)
4. The Tomorrow Story - What's setting up next

CONTENT SECTIONS:
- Lead with what happened (one sentence)
- Explain why it matters (one paragraph)
- Connect to broader theme (one paragraph)
- Teaching moment (one concept explained simply)
- Tomorrow's main event

COMPLIANCE (woven naturally):
- Opening: "Here's what moved markets today, and more importantly, what it means for how markets actually work."
- NO "buy this" or "sell that"
- Closing: "This is education, not advice. Markets will do whatever they want tomorrow."

LENGTH: 400-600 words total

CRITICAL: Generate a conversational, specific title (8-12 words) that sounds like something you'd actually say.`;

    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: prompt }
        ],
        max_tokens: 2000,
        tools: [
          {
            type: "function",
            function: {
              name: "create_newsletter",
              description: "Generate a professional trading newsletter with title and content",
              parameters: {
                type: "object",
                properties: {
                  title: { 
                    type: "string",
                    description: "Concise newsletter title (8-12 words)"
                  },
                  content: { 
                    type: "string",
                    description: "Full newsletter content in markdown format"
                  }
                },
                required: ["title", "content"],
                additionalProperties: false
              }
            }
          }
        ],
        tool_choice: { type: "function", function: { name: "create_newsletter" } }
      }),
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error('Lovable AI Gateway error:', response.status, errorData);
      throw new Error(`AI Gateway error: ${response.status} - ${errorData}`);
    }

    const data = await response.json();
    console.log('AI Gateway response:', JSON.stringify(data, null, 2));
    
    const toolCall = data.choices[0].message.tool_calls?.[0];
    
    if (!toolCall) {
      // Fallback: try to extract from regular message content
      const messageContent = data.choices[0].message.content;
      console.log('No tool call, attempting to parse message content:', messageContent);
      
      if (messageContent) {
        try {
          // Try to parse JSON from the content
          const parsed = JSON.parse(messageContent);
          if (parsed.title && parsed.content) {
            console.log('Successfully parsed from message content');
            return new Response(
              JSON.stringify(parsed),
              {
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
              }
            );
          }
        } catch (e) {
          console.error('Failed to parse message content as JSON:', e);
        }
      }
      
      throw new Error('No tool call returned from AI and could not parse message content');
    }

    const result = JSON.parse(toolCall.function.arguments);

    console.log('Newsletter generated successfully via tool call');

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
