import { corsHeaders } from '../_shared/cors.ts';

const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');

interface DocumentMetadata {
  title: string;
  url: string;
  date: string;
  type: string;
  relevanceScore: number;
  description: string;
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { action, docketUrl, filters } = await req.json();

    console.log('Kroll scraper action:', action);

    if (action === 'discover') {
      // Fetch the main docket page
      const docketResponse = await fetch(docketUrl || 'https://cases.ra.kroll.com/bbby/Home-Index');
      const html = await docketResponse.text();
      
      console.log('Fetched docket page, analyzing...');

      // Use AI to extract document links from the HTML
      const aiResponse = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
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
              content: `You are a bankruptcy court document analyzer. Extract ALL document links from court docket HTML.
              
Focus on these document types:
- First Day Motions
- Disclosure Statements
- Asset Purchase Agreements
- Schedules of Assets and Liabilities (SOAL)
- Section 341 Meeting notices
- NOL preservation documents
- Entity formation documents (especially DK-Butterfly related)
- Any documents mentioning "Overstock" or "Section 382"

Return a JSON array of documents with: title, url, date, type, relevanceScore (0-100 based on importance to NOL/acquisition analysis), description.`
            },
            {
              role: 'user',
              content: `Extract document metadata from this BBBY bankruptcy docket HTML:\n\n${html.slice(0, 50000)}`
            }
          ],
          response_format: { type: "json_object" },
          temperature: 0.3,
        }),
      });

      if (!aiResponse.ok) {
        throw new Error(`AI API error: ${aiResponse.status}`);
      }

      const aiData = await aiResponse.json();
      const result = JSON.parse(aiData.choices[0].message.content);
      
      console.log(`Discovered ${result.documents?.length || 0} documents`);

      return new Response(
        JSON.stringify({
          success: true,
          documents: result.documents || [],
          totalFound: result.documents?.length || 0
        }),
        { 
          status: 200,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    if (action === 'fetch_content') {
      // Fetch a specific document's content
      const { documentUrl } = await req.json();
      
      console.log('Fetching document:', documentUrl);

      // For PDFs, we'd need to extract text - for now, return metadata
      const response = await fetch(documentUrl);
      const contentType = response.headers.get('content-type');
      
      let content = '';
      if (contentType?.includes('pdf')) {
        content = 'PDF document - content extraction would require PDF parser';
      } else {
        content = await response.text();
      }

      return new Response(
        JSON.stringify({
          success: true,
          content: content.slice(0, 100000), // Limit size
          contentType
        }),
        { 
          status: 200,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    return new Response(
      JSON.stringify({ error: 'Invalid action' }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in scrape-kroll-documents:', error);

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
