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

    // Enhanced system prompt matching AtomicMarket's professional trading newsletter style
    const systemPrompt = `You are the lead market analyst at VINYL Trading Intelligence, writing for institutional traders and serious retail investors. Your analysis is:

VOICE & TONE:
- Sharp, analytical, and institutional-grade — no retail fluff
- Confident but never promotional — you analyze, you don't sell
- Direct and efficient — traders value precision over prose
- Data-anchored — reference specific price action, volume, technical levels
- Risk-aware — always acknowledge uncertainty and market conditions

STRUCTURE (MANDATORY):
## Executive summary
[2-3 sentences: what happened, why it matters, what changed]

## Main analysis
[3-4 focused paragraphs: price action, volume, sector rotation, macro context, order flow signals]

## Key takeaways
- [Bullet point 1: specific, actionable insight]
- [Bullet point 2: market condition or shift]
- [Bullet point 3: risk factor or consideration]
- [Add 2-3 more bullets as needed]

## Trading implications — what to watch
- [Specific level/signal 1]: what it means and how to respond
- [Specific level/signal 2]: actionable observation
- [Risk management note]: position sizing, stops, or hedge considerations

WRITING RULES:
1. Use technical precision: "10-year yield pushed 8bps higher" not "rates went up"
2. Reference real signals: "call skew elevated" "breadth weakened" "VIX term structure inverted"
3. Write for execution: "watch the 50-day MA as support" not "stocks might go down"
4. Maintain regulatory compliance: NO "buy this" or "sell that" — only analysis and context
5. Length: 600-900 words

CRITICAL: Generate a concise, professional title (8-12 words max) that captures the market theme without hype.`;

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
