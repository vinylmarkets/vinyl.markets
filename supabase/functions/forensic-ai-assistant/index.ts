import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.57.4';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { question } = await req.json();
    console.log('Forensic AI query:', question);

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Authenticate user
    const authHeader = req.headers.get('authorization');
    if (!authHeader) {
      throw new Error('No authorization header');
    }

    // Fetch relevant forensic documents with actual content
    const { data: allDocuments } = await supabase
      .from('forensic_documents')
      .select('filename, metadata, findings, analysis_result')
      .eq('analysis_status', 'complete')
      .order('uploaded_at', { ascending: false })
      .limit(50);

    // Filter to only documents with actual extracted text (not just metadata)
    const documents = allDocuments?.filter(doc => {
      const extractedText = doc.analysis_result?.extractedText;
      return extractedText && 
             extractedText !== 'PDF parsing failed - analyzing metadata only' &&
             extractedText.length > 100; // Has substantial content
    }) || [];

    // Fetch knowledge graph nodes
    const { data: kgNodes } = await supabase
      .from('kg_nodes')
      .select('entity_id, node_type, properties')
      .limit(50);

    // Fetch knowledge graph edges for relationships
    const { data: kgEdges } = await supabase
      .from('kg_edges')
      .select('source_node_id, target_node_id, relationship_type, properties')
      .limit(100);

    // Build context from documents and knowledge graph
    let context = 'FORENSIC INVESTIGATION CONTEXT:\n\n';
    
    // Add document content
    if (documents && documents.length > 0) {
      context += '=== DOCUMENT CONTENT ===\n';
      context += `Total documents with readable content: ${documents.length}\n\n`;
      
      documents.forEach(doc => {
        context += `\n--- Document: ${doc.filename} ---\n`;
        
        // Add extracted text (truncate if very long)
        const extractedText = doc.analysis_result?.extractedText || '';
        const truncatedText = extractedText.length > 5000 
          ? extractedText.substring(0, 5000) + '...[truncated]'
          : extractedText;
        context += `Content:\n${truncatedText}\n\n`;
        
        // Add structured findings if available
        if (doc.analysis_result?.structuredFindings) {
          context += `Key Findings:\n`;
          const findings = doc.analysis_result.structuredFindings;
          if (findings['Key People']?.length > 0) {
            context += `- People: ${findings['Key People'].join(', ')}\n`;
          }
          if (findings['Timeline Events']?.length > 0) {
            context += `- Events: ${findings['Timeline Events'].join('; ')}\n`;
          }
          if (findings['Financial Structures']?.length > 0) {
            context += `- Financial: ${findings['Financial Structures'].join('; ')}\n`;
          }
        }
        context += '\n';
      });
    } else {
      context += '=== NO READABLE DOCUMENTS ===\n';
      context += 'Most documents are corrupted or have invalid PDF structures.\n';
      context += 'Only metadata-based analysis is available.\n\n';
    }

    // Add knowledge graph relationships
    if (kgNodes && kgEdges) {
      context += '=== KNOWLEDGE GRAPH RELATIONSHIPS ===\n';
      const nodeMap = new Map(kgNodes.map(n => [n.entity_id, n]));
      
      kgEdges.slice(0, 20).forEach(edge => {
        const sourceNode = Array.from(nodeMap.values()).find(n => n.entity_id === edge.source_node_id);
        const targetNode = Array.from(nodeMap.values()).find(n => n.entity_id === edge.target_node_id);
        if (sourceNode && targetNode) {
          context += `${sourceNode.entity_id} --[${edge.relationship_type}]--> ${targetNode.entity_id}\n`;
        }
      });
      context += '\n';
    }

    // Call Lovable AI
    const lovableApiKey = Deno.env.get('LOVABLE_API_KEY');
    if (!lovableApiKey) {
      throw new Error('LOVABLE_API_KEY not configured');
    }

    const systemPrompt = `You are a forensic analysis AI assistant helping investigate the Bed Bath & Beyond bankruptcy case and potential NOL (Net Operating Loss) preservation strategies.

Your role is to:
1. Answer questions about the investigation based on the provided context
2. Connect evidence from documents and the knowledge graph
3. Brainstorm theories and connections
4. Identify gaps in the investigation
5. Suggest areas for further research

IMPORTANT GUIDELINES:
- Base answers on the provided context
- Cite specific documents or relationships when possible
- Be analytical and objective
- Point out uncertainties and areas needing more evidence
- Help the user think through complex financial/legal relationships
- When evidence is thin, say so and suggest what would strengthen the theory

Context available:
${context}`;

    console.log('Calling Lovable AI...');
    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${lovableApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: question }
        ],
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Lovable AI error:', response.status, errorText);
      throw new Error(`AI service error: ${response.status}`);
    }

    const data = await response.json();
    const answer = data.choices[0].message.content;

    console.log('AI response generated successfully');

    // Extract sources from documents that were referenced
    const sources = documents?.slice(0, 5).map(doc => ({
      id: doc.filename,
      title: doc.filename,
      type: 'forensic_document'
    })) || [];

    return new Response(
      JSON.stringify({
        success: true,
        answer,
        sources,
        documentsAnalyzed: documents?.length || 0,
        knowledgeGraphNodes: kgNodes?.length || 0
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in forensic-ai-assistant:', error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});
