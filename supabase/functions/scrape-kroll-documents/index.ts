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
      
      console.log('Fetched docket page, length:', html.length);
      console.log('HTML preview (first 500 chars):', html.slice(0, 500));
      
      // Extract links using regex patterns for common document structures
      const linkPatterns = [
        /<a[^>]+href=["']([^"']+)"[^>]*>([^<]+)<\/a>/gi,
        /<a[^>]+href=["']([^"']+\.pdf)"[^>]*>/gi,
        /href=["']([^"']*document[^"']*)"[^>]*>([^<]+)/gi,
      ];
      
      const foundLinks: Array<{url: string, text: string}> = [];
      for (const pattern of linkPatterns) {
        let match;
        while ((match = pattern.exec(html)) !== null) {
          foundLinks.push({
            url: match[1],
            text: match[2] || match[1]
          });
        }
      }
      
      console.log(`Found ${foundLinks.length} total links via regex`);

      // Use AI to analyze and filter relevant documents
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
              content: `You are analyzing bankruptcy court document links. Your job is to:
1. Extract ALL document links from the HTML provided
2. Look for links to PDFs, court filings, motions, exhibits
3. Parse document numbers (e.g., "Doc 123", "Exhibit A")
4. Identify document types (Motion, Order, Disclosure Statement, etc.)
5. Calculate relevance score (0-100) based on these priorities:
   - NOL preservation mentions (90-100)
   - Section 382 references (90-100)
   - DK-Butterfly or entity formation (85-95)
   - Overstock mentions (80-90)
   - Asset Purchase Agreements (75-85)
   - First Day Motions (70-80)
   - Other filings (40-60)

Return JSON object with "documents" array. Each document must have:
- title: string (document name/description)
- url: string (full URL or relative path)
- date: string (if available, or "Unknown")
- type: string (Motion, Order, Disclosure, etc.)
- relevanceScore: number (0-100)
- description: string (brief summary)

IMPORTANT: 
- If links are relative (start with /), prepend "https://cases.ra.kroll.com"
- Extract document numbers when visible
- Return ALL documents found, not just high-relevance ones`
            },
            {
              role: 'user',
              content: `Analyze this BBBY bankruptcy docket page and extract ALL document links.

HTML snippet (${html.length} total chars):
${html.slice(0, 40000)}

Also found these links via regex: ${JSON.stringify(foundLinks.slice(0, 50))}`
            }
          ],
          response_format: { type: "json_object" },
          temperature: 0.3,
        }),
      });

      if (!aiResponse.ok) {
        const errorText = await aiResponse.text();
        console.error('AI API error:', aiResponse.status, errorText);
        throw new Error(`AI API error: ${aiResponse.status} - ${errorText}`);
      }

      const aiData = await aiResponse.json();
      console.log('AI response:', JSON.stringify(aiData).slice(0, 500));
      
      const result = JSON.parse(aiData.choices[0].message.content);
      
      console.log(`AI discovered ${result.documents?.length || 0} documents`);
      
      // Fix relative URLs
      const documents = (result.documents || []).map((doc: any) => ({
        ...doc,
        url: doc.url.startsWith('/') ? `https://cases.ra.kroll.com${doc.url}` : doc.url
      }));

      return new Response(
        JSON.stringify({
          success: true,
          documents,
          totalFound: documents.length,
          debug: {
            htmlLength: html.length,
            regexLinksFound: foundLinks.length,
            htmlPreview: html.slice(0, 500)
          }
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
