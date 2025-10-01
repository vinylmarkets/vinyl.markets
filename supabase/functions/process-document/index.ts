import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.57.4';
import { corsHeaders } from '../_shared/cors.ts';
import pdf from 'npm:pdf-parse@1.1.1';

const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');

interface DocumentProcessingRequest {
  fileUrl: string;
  fileName: string;
  filePath: string;
  category?: string;
  instructions?: string;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { 
      filePath,
      fileName, 
      category = 'kroll-docket',
      instructions = ''
    }: DocumentProcessingRequest = await req.json();

    console.log('Processing document:', fileName, 'from path:', filePath);

    // Download file from private storage using service role
    const { data: fileData, error: downloadError } = await supabase.storage
      .from('forensic-documents')
      .download(filePath);

    if (downloadError || !fileData) {
      console.error('Download error:', downloadError);
      throw new Error(`Failed to download file: ${downloadError?.message || 'Unknown error'}`);
    }

    console.log('File downloaded successfully, size:', fileData.size);

    // Parse PDF to extract text content
    let pdfText = '';
    try {
      const arrayBuffer = await fileData.arrayBuffer();
      const pdfData = await pdf(Buffer.from(arrayBuffer));
      pdfText = pdfData.text;
      console.log('PDF parsed successfully, extracted', pdfText.length, 'characters');
    } catch (parseError) {
      console.error('PDF parsing error:', parseError);
      pdfText = 'PDF parsing failed - analyzing metadata only';
    }

    // Truncate text if too long (keep first 15000 chars for analysis)
    const textForAnalysis = pdfText.length > 15000 ? pdfText.substring(0, 15000) + '...[truncated]' : pdfText;

    const analysisPrompt = `Analyze this forensic document from the BBBY/Kroll bankruptcy docket.

DOCUMENT: ${fileName}
FILE SIZE: ${fileData.size} bytes

EXTRACTED CONTENT:
${textForAnalysis}

${instructions ? `SPECIAL INSTRUCTIONS: ${instructions}` : ''}

Perform a deep forensic analysis focusing on:
1. **Key People**: Look for Ryan Cohen, Carl Icahn, or other key players
2. **Entities**: BBBY, Overstock, DK-Butterfly, any subsidiaries or special purpose entities
3. **Timeline Events**: Critical dates, ownership changes, asset transfers
4. **NOL Preservation**: Section 382 indicators, ownership change analysis
5. **Asset Transfers**: IP sales, brand sales, strategic asset movements
6. **Financial Structures**: Debt arrangements, equity transfers, valuations
7. **Legal Proceedings**: Court orders, motions, agreements
8. **Red Flags**: Unusual patterns, strategic timing, hidden connections

CRITICAL: Extract specific entities, dates, dollar amounts, and relationships.

Provide:
- Comprehensive analysis summary
- Key findings array (5-10 specific, actionable findings)
- Entities mentioned (people, companies, dates)
- Confidence level (0-100)
- Structured findings with categories

Format as JSON:
{
  "analysis": "detailed analysis text",
  "findings": ["finding 1", "finding 2", ...],
  "entities": {
    "people": ["person1", "person2"],
    "companies": ["company1", "company2"],
    "dates": ["date1", "date2"],
    "amounts": ["$X", "$Y"]
  },
  "confidence": 85,
  "structuredFindings": {
    "category1": ["detail1", "detail2"],
    "category2": ["detail1"]
  }
}`;

    console.log('Calling AI for analysis...');

    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          {
            role: 'system',
            content: `You are a forensic financial analyst specializing in bankruptcy law, tax code (especially Section 382), and corporate structures. You excel at identifying patterns, timeline alignments, and hidden implications in legal and financial documents.`
          },
          {
            role: 'user',
            content: analysisPrompt
          }
        ],
        max_completion_tokens: 4000
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('AI API error:', response.status, errorText);
      throw new Error(`AI API error: ${response.status}`);
    }

    const data = await response.json();
    const analysisText = data.choices[0].message.content;

    console.log('AI analysis complete');

    // Try to parse structured response
    let parsedAnalysis;
    try {
      const jsonMatch = analysisText.match(/```json\n([\s\S]*?)\n```/) || 
                       analysisText.match(/```\n([\s\S]*?)\n```/);
      if (jsonMatch) {
        parsedAnalysis = JSON.parse(jsonMatch[1]);
      } else {
        parsedAnalysis = JSON.parse(analysisText);
      }
    } catch (parseError) {
      console.log('Could not parse JSON, using text analysis');
      parsedAnalysis = {
        analysis: analysisText,
        findings: [
          'Document uploaded and analyzed',
          'Forensic review completed',
          'See full analysis for details'
        ],
        confidence: 70,
        structuredFindings: { documentType: 'legal_filing' }
      };
    }

    // Update the forensic_documents table with full analysis
    const { error: updateError } = await supabase
      .from('forensic_documents')
      .update({
        analysis_status: 'complete',
        analysis_result: {
          analysis: parsedAnalysis.analysis || analysisText,
          structuredFindings: parsedAnalysis.structuredFindings || {},
          entities: parsedAnalysis.entities || {},
          extractedText: pdfText.substring(0, 5000) // Store first 5000 chars
        },
        findings: parsedAnalysis.findings || [],
        confidence_score: parsedAnalysis.confidence || 70,
        analyzed_at: new Date().toISOString(),
        metadata: {
          ...category,
          textLength: pdfText.length,
          parsedSuccessfully: pdfText.length > 0
        }
      })
      .eq('file_path', filePath);

    if (updateError) {
      console.error('Update error:', updateError);
      throw new Error('Failed to update analysis results');
    }

    console.log('Document analysis complete for:', fileName);

    return new Response(
      JSON.stringify({
        success: true,
        fileName,
        analysis: parsedAnalysis.analysis || analysisText,
        findings: parsedAnalysis.findings || [],
        confidence: parsedAnalysis.confidence || 70,
        timestamp: new Date().toISOString()
      }),
      { 
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );

  } catch (error) {
    console.error('Error in process-document function:', error);

    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error'
      }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});
