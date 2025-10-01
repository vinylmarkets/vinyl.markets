import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const { documentIds, reprocessAll } = await req.json();

    console.log('Reprocess request:', { documentIds, reprocessAll });

    // Get documents to reprocess
    let query = supabase
      .from('forensic_documents')
      .select('id, filename, file_path, document_url');

    if (reprocessAll) {
      // Get all failed documents
      query = query.or('analysis_result.is.null,analysis_result->>analysis.ilike.%failed%,analysis_result->>analysis.ilike.%error%');
    } else if (documentIds && documentIds.length > 0) {
      // Get specific documents
      query = query.in('id', documentIds);
    } else {
      throw new Error('Either documentIds or reprocessAll must be provided');
    }

    const { data: documents, error: fetchError } = await query;

    if (fetchError) throw fetchError;

    console.log(`Found ${documents?.length || 0} documents to reprocess`);

    // Update status to pending for all documents
    const updatePromises = documents?.map(doc => 
      supabase
        .from('forensic_documents')
        .update({ 
          analysis_status: 'processing',
          analysis_result: null,
          findings: null,
          confidence_score: null
        })
        .eq('id', doc.id)
    ) || [];

    await Promise.all(updatePromises);

    // Process each document in background
    const processingPromises = documents?.map(async (doc) => {
      try {
        // Call the process-document function for each document
        const { data: processResult, error: processError } = await supabase.functions.invoke('process-document', {
          body: {
            fileUrl: doc.document_url,
            fileName: doc.filename,
            filePath: doc.file_path,
            documentId: doc.id
          }
        });

        if (processError) {
          console.error(`Error processing ${doc.filename}:`, processError);
          // Update status to failed
          await supabase
            .from('forensic_documents')
            .update({ 
              analysis_status: 'failed',
              analysis_result: { error: processError.message }
            })
            .eq('id', doc.id);
        } else {
          console.log(`Successfully reprocessed ${doc.filename}`);
        }
      } catch (error) {
        console.error(`Exception processing ${doc.filename}:`, error);
        await supabase
          .from('forensic_documents')
          .update({ 
            analysis_status: 'failed',
            analysis_result: { error: error.message }
          })
          .eq('id', doc.id);
      }
    }) || [];

    // Don't await all promises - let them run in background
    EdgeRuntime.waitUntil(Promise.all(processingPromises));

    return new Response(
      JSON.stringify({
        success: true,
        message: `Started reprocessing ${documents?.length || 0} documents`,
        documentsQueued: documents?.length || 0
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    );

  } catch (error) {
    console.error('Error in reprocess-documents:', error);
    return new Response(
      JSON.stringify({ 
        error: error.message,
        success: false
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500 
      }
    );
  }
});
