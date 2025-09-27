import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.57.4';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface DocumentProcessingRequest {
  fileUrl: string;
  fileName: string;
  category: string;
  instructions?: string;
  tags?: string[];
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

    const { fileUrl, fileName, category, instructions, tags }: DocumentProcessingRequest = await req.json();

    console.log('Processing document:', fileName);

    // Download the file from Supabase storage
    const fileResponse = await fetch(fileUrl);
    if (!fileResponse.ok) {
      throw new Error('Failed to download file');
    }

    const fileBuffer = await fileResponse.arrayBuffer();
    const fileExtension = fileName.split('.').pop()?.toLowerCase();

    let extractedContent = '';
    let contentType = 'text';

    // Process different file types
    if (['pdf', 'docx', 'doc', 'pptx', 'xlsx'].includes(fileExtension || '')) {
      // For complex documents, we'll extract basic metadata for now
      // In a real implementation, you'd use a proper document parser
      extractedContent = `Document: ${fileName}\nType: ${fileExtension?.toUpperCase()}\nSize: ${fileBuffer.byteLength} bytes\n\nThis document has been uploaded and is ready for processing.`;
      contentType = 'document';
    } else if (['txt', 'md'].includes(fileExtension || '')) {
      // Handle text files
      extractedContent = new TextDecoder().decode(fileBuffer);
      contentType = 'text';
    } else {
      extractedContent = `File: ${fileName}\nType: ${fileExtension?.toUpperCase()}\nUploaded for knowledge base integration.`;
      contentType = 'file';
    }

    // Create a title from the filename
    const title = fileName.replace(/\.[^/.]+$/, "").replace(/[-_]/g, ' ');

    // Prepare metadata
    const metadata = {
      originalFileName: fileName,
      fileType: fileExtension,
      fileSize: fileBuffer.byteLength,
      uploadedBy: user.id,
      uploadedAt: new Date().toISOString(),
      instructions: instructions || null,
      contentType: contentType
    };

    // Insert into knowledge base
    const { data: insertedData, error: insertError } = await supabase
      .from('playbook_knowledge')
      .insert({
        category: category,
        title: title,
        content: extractedContent,
        source: 'uploaded_document',
        tags: tags || [],
        metadata: metadata,
        created_by: user.id
      })
      .select()
      .single();

    if (insertError) {
      console.error('Insert error:', insertError);
      throw new Error('Failed to store document in knowledge base');
    }

    console.log('Document processed successfully:', insertedData.id);

    return new Response(JSON.stringify({
      success: true,
      message: 'Document processed and added to knowledge base',
      knowledgeId: insertedData.id,
      extractedLength: extractedContent.length
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error processing document:', error);
    return new Response(JSON.stringify({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});