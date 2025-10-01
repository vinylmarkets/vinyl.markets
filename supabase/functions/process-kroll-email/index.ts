import { corsHeaders } from '../_shared/cors.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
const SUPABASE_URL = Deno.env.get('SUPABASE_URL');
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

interface SendGridEmail {
  from: string;
  subject: string;
  text: string;
  html: string;
  attachments?: Array<{
    filename: string;
    type: string;
    content: string; // base64 encoded
  }>;
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('Received email webhook from SendGrid');
    
    const formData = await req.formData();
    const email: SendGridEmail = {
      from: formData.get('from') as string,
      subject: formData.get('subject') as string,
      text: formData.get('text') as string,
      html: formData.get('html') as string,
    };

    console.log('Email from:', email.from);
    console.log('Subject:', email.subject);

    // Check if this is from Kroll
    if (!email.from.toLowerCase().includes('kroll') && !email.subject.toLowerCase().includes('bbby')) {
      console.log('Not a Kroll BBBY email, ignoring');
      return new Response(JSON.stringify({ message: 'Ignored - not from Kroll' }), {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // Extract document URLs from email body
    const urlRegex = /https?:\/\/[^\s<>"]+/g;
    const urls = [...(email.text || '').matchAll(urlRegex), ...(email.html || '').matchAll(urlRegex)]
      .map(match => match[0])
      .filter(url => url.includes('kroll.com') || url.includes('.pdf'));

    console.log('Found URLs:', urls);

    // Initialize Supabase client
    const supabase = createClient(SUPABASE_URL!, SUPABASE_SERVICE_ROLE_KEY!);

    const results = [];

    // Process each document URL
    for (const documentUrl of urls) {
      console.log('Analyzing document:', documentUrl);

      try {
        // Call AI for forensic analysis
        const analysisResponse = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
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
                - Hidden implications in legal phrasing
                - DK-Butterfly / Overstock acquisition connections`
              },
              {
                role: 'user',
                content: `Analyze this document from Kroll BBBY docket: ${documentUrl}
                
                Email Subject: ${email.subject}
                
                Provide detailed forensic analysis including:
                1. Key findings related to BBBY/Overstock/DK-Butterfly hypothesis
                2. NOL preservation or tax strategy references
                3. Timeline indicators
                4. Entity relationships
                5. Unusual patterns
                6. Confidence level (0-100) for each finding
                
                Return as JSON with: { summary, findings: [{ finding, confidence, category }], relevance_score }`
              }
            ],
            temperature: 0.7,
            max_tokens: 2000
          }),
        });

        if (!analysisResponse.ok) {
          console.error('AI analysis failed:', analysisResponse.status);
          continue;
        }

        const aiData = await analysisResponse.json();
        const analysisText = aiData.choices[0].message.content;
        
        let analysis;
        try {
          analysis = JSON.parse(analysisText);
        } catch {
          analysis = {
            summary: analysisText,
            findings: [],
            relevance_score: 50
          };
        }

        // Store in database
        const { data: docData, error: docError } = await supabase
          .from('forensic_documents')
          .insert({
            source: 'kroll_email',
            document_url: documentUrl,
            title: email.subject,
            content: email.text,
            analysis: analysis,
            imported_at: new Date().toISOString(),
            metadata: {
              email_from: email.from,
              discovered_via: 'email_automation'
            }
          })
          .select()
          .single();

        if (docError) {
          console.error('Database insert error:', docError);
        } else {
          console.log('Document stored:', docData.id);
          results.push({
            url: documentUrl,
            analysis: analysis.summary,
            relevance_score: analysis.relevance_score
          });
        }

      } catch (error) {
        console.error('Error processing document:', documentUrl, error);
      }
    }

    // If any high-relevance documents found, could trigger notification
    const highRelevance = results.filter(r => r.relevance_score > 70);
    if (highRelevance.length > 0) {
      console.log(`🚨 ${highRelevance.length} high-relevance documents found!`);
      // TODO: Add notification logic (toast, email, etc.)
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: `Processed ${results.length} documents from Kroll email`,
        results: results.map(r => ({
          url: r.url,
          relevance_score: r.relevance_score
        }))
      }),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );

  } catch (error) {
    console.error('Error in process-kroll-email function:', error);

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
