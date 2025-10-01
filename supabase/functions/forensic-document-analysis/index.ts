import { corsHeaders } from '../_shared/cors.ts';

const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { documentUrl, extractedText, analysisType, focusAreas } = await req.json();

    if (!documentUrl) {
      return new Response(
        JSON.stringify({ error: 'Document URL is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Check if we have extracted text to analyze
    if (!extractedText || extractedText.length < 50) {
      console.log('No extracted text available for:', documentUrl);
      return new Response(
        JSON.stringify({
          success: false,
          error: 'No extracted text provided for analysis',
          extractedText: extractedText || 'PDF parsing failed - analyzing metadata only'
        }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('Analyzing document with', extractedText.length, 'characters of text');

    // Use Lovable AI for document analysis
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
            content: `You are a forensic financial analyst specializing in bankruptcy law, tax code, and corporate structures. 
            Analyze documents with focus on:
            - NOL (Net Operating Loss) preservation language
            - Section 382 tax code references
            - Entity structures and related party transactions
            - Timeline indicators and strategic timing
            - Hidden implications in legal phrasing`
          },
          {
            role: 'user',
            content: `Analyze the following document content extracted from: ${documentUrl}

DOCUMENT TEXT:
${extractedText.substring(0, 15000)}

Analysis Type: ${analysisType}
Focus Areas: ${focusAreas?.join(', ') || 'General forensic analysis'}

Provide a detailed forensic analysis including:
1. Key findings related to BBBY bankruptcy, NOL preservation, Section 382
2. References to entities (Ryan Cohen, Carl Icahn, DK Butterfly, Overstock)
3. Timeline indicators and critical dates
4. Asset transfers, IP sales, entity relationships
5. Legal proceedings, court orders, financial structures
6. Red flags or strategic implications
7. Confidence level (0-100)

Return ONLY valid JSON with this structure:
{
  "findings": ["finding1", "finding2", ...],
  "confidence_score": 0-100,
  "entities": {
    "people": ["person1", ...],
    "companies": ["company1", ...],
    "dates": ["date1", ...],
    "amounts": ["amount1", ...]
  },
  "structuredFindings": {
    "Key People": [],
    "Timeline Events": [],
    "Asset Transfers": [],
    "Financial Structures": [],
    "Legal Proceedings": [],
    "NOL Preservation (Section 382)": [],
    "Red Flags": []
  }
}`
          }
        ],
        temperature: 0.7,
        max_tokens: 2000
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('AI API error:', response.status, errorText);
      throw new Error(`AI API error: ${response.status}`);
    }

    const data = await response.json();
    const analysisText = data.choices[0].message.content;

    // Try to parse as JSON, fallback to text analysis
    let parsedAnalysis;
    try {
      // Remove markdown code blocks if present
      const cleanedText = analysisText.replace(/```json\n?|\n?```/g, '').trim();
      parsedAnalysis = JSON.parse(cleanedText);
    } catch (e) {
      console.log('Could not parse AI response as JSON, using text analysis');
      parsedAnalysis = {
        findings: ['AI analysis completed but response format was unexpected'],
        confidence_score: 50,
        entities: {},
        structuredFindings: {}
      };
    }

    // Ensure we have the extracted text in the response
    const result = {
      success: true,
      documentUrl,
      extractedText: extractedText, // CRITICAL: Include the extracted text
      analysis: typeof parsedAnalysis === 'string' ? parsedAnalysis : analysisText,
      findings: parsedAnalysis.findings || ['Analysis completed'],
      confidence_score: parsedAnalysis.confidence_score || 50,
      entities: parsedAnalysis.entities || {},
      structuredFindings: parsedAnalysis.structuredFindings || {},
      timestamp: new Date().toISOString(),
      focusAreas
    };

    console.log('Analysis complete, extracted text length:', extractedText.length);

    return new Response(
      JSON.stringify(result),
      { 
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );

  } catch (error) {
    console.error('Error in forensic-document-analysis function:', error);

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
