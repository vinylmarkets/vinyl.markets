import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.57.4';
import { z } from 'https://deno.land/x/zod@v3.22.4/mod.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const QueryRequestSchema = z.object({
  question: z.string().min(1, 'Question is required').max(1000, 'Question must be less than 1000 characters'),
  maxResults: z.number().int().min(1).max(20).optional().default(5)
});

interface KnowledgeItem {
  id: string;
  category: string;
  title: string;
  content: string;
  source: string;
  tags: string[];
  metadata: any;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Get OpenAI API key
    const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
    if (!openAIApiKey) {
      throw new Error('OPENAI_API_KEY is not configured');
    }

    // Get user from auth header
    const authHeader = req.headers.get('authorization');
    if (!authHeader) {
      throw new Error('No authorization header');
    }

    const { data: { user }, error: userError } = await supabase.auth.getUser(
      authHeader.replace('Bearer ', '')
    );

    if (userError || !user) {
      throw new Error('Invalid user');
    }

    const body = await req.json();
    
    // Validate input with Zod
    const validation = QueryRequestSchema.safeParse(body);
    if (!validation.success) {
      return new Response(
        JSON.stringify({ 
          success: false,
          error: 'Invalid input', 
          details: validation.error.format() 
        }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    const { question, maxResults } = validation.data;

    console.log('AI Query:', question);

    // Search the knowledge base for relevant content
    // Using simple text search - could be enhanced with vector search later
    const { data: knowledgeItems, error: searchError } = await supabase
      .from('playbook_knowledge')
      .select('*')
      .or(`title.ilike.%${question}%,content.ilike.%${question}%`)
      .limit(maxResults);

    if (searchError) {
      console.error('Search error:', searchError);
      throw new Error('Failed to search knowledge base');
    }

    console.log(`Found ${knowledgeItems?.length || 0} relevant knowledge items`);

    // If no relevant content found, still allow general questions
    let contextText = '';
    if (knowledgeItems && knowledgeItems.length > 0) {
      contextText = knowledgeItems
        .map((item: KnowledgeItem) => 
          `## ${item.title} (${item.category})\n${item.content}\n\nSource: ${item.source}\nTags: ${item.tags.join(', ')}\n`
        )
        .join('\n---\n');
    }

    // Prepare the prompt for OpenAI
    const systemPrompt = `You are an AI assistant for Atomic Market, a financial technology company. You have access to the company's knowledge base including strategy documents, product information, financial data, and operational procedures.

Your role is to:
1. Answer questions using the provided company knowledge base
2. Provide accurate, helpful information about Atomic Market's business
3. Reference specific documents when relevant
4. If you don't know something from the knowledge base, say so clearly
5. Keep responses professional and focused on business context

Available Knowledge Base Context:
${contextText || 'No specific documents found for this query. Answer based on general business knowledge.'}`;

    const userPrompt = `Question: ${question}

Please provide a comprehensive answer based on the company knowledge base. If you reference specific information, mention which document or section it comes from.`;

    // Call OpenAI API
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        max_tokens: 1000,
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      console.error('OpenAI API error:', error);
      throw new Error('Failed to get AI response');
    }

    const aiResponse = await response.json();
    const answer = aiResponse.choices[0].message.content;

    console.log('AI Response generated successfully');

    // Log the query for analytics (optional)
    await supabase
      .from('terminal_queries')
      .insert({
        user_id: user.id,
        query_text: question,
        response_text: answer,
        response_sources: knowledgeItems?.map(item => item.id) || []
      });

    return new Response(JSON.stringify({
      success: true,
      answer: answer,
      sources: knowledgeItems?.map((item: KnowledgeItem) => ({
        id: item.id,
        title: item.title,
        category: item.category,
        source: item.source
      })) || [],
      query: question
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in AI knowledge query:', error);
    return new Response(JSON.stringify({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});