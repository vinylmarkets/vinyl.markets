import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface NewsSource {
  name: string;
  url: string;
  endpoint?: string;
}

interface NewsStory {
  title: string;
  summary: string;
  source: string;
  publishedAt: string;
  tags: string[];
  mentions: string[];
  marketRelevance: number;
  humanSummary?: string;
  marketImpact?: string;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('News aggregator function started...');
    
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );

    const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
    if (!openAIApiKey) {
      throw new Error('OpenAI API key not found');
    }

    // Gather world context from news sources
    const worldContext = await gatherWorldContext(openAIApiKey);
    
    // Save to database for use by market narrator
    const { data: savedContext, error: saveError } = await supabase
      .from('world_news_context')
      .upsert({
        date: new Date().toISOString().split('T')[0],
        news_stories: worldContext,
        created_at: new Date().toISOString()
      })
      .select()
      .single();

    if (saveError) {
      console.error('Error saving news context:', saveError);
    }

    return new Response(
      JSON.stringify({
        success: true,
        storiesProcessed: worldContext.length,
        relevantStories: worldContext.filter(story => story.marketRelevance > 0.7).length,
        context: worldContext.slice(0, 5) // Return preview
      }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );

  } catch (error) {
    console.error('News aggregator error:', error);
    
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

async function gatherWorldContext(openAIApiKey: string): Promise<NewsStory[]> {
  console.log('Gathering world context from news sources...');
  
  // Mock news sources - in production these would be real API endpoints
  const sources: NewsSource[] = [
    { name: 'WSJ', url: 'api/news/wsj' },
    { name: 'AP', url: 'api/news/ap' },
    { name: 'BBC', url: 'api/news/bbc' },
    { name: 'NYT', url: 'api/news/nyt' }
  ];

  // Simulate fetching headlines (replace with real API calls)
  const allHeadlines = await Promise.all(
    sources.map(source => fetchHeadlines(source))
  );

  // Flatten and combine all headlines
  const headlines = allHeadlines.flat();
  
  // Filter for market-relevant news
  const relevantNews = headlines.filter(story => 
    story.tags.includes('business') ||
    story.tags.includes('economy') ||
    story.tags.includes('politics') ||
    story.mentions.some(entity => isPublicCompany(entity)) ||
    story.marketRelevance > 0.5
  );

  // Summarize in conversational tone using AI
  const humanizedNews = await summarizeForHumans(relevantNews, openAIApiKey);
  
  console.log(`Processed ${headlines.length} headlines, ${relevantNews.length} market-relevant`);
  return humanizedNews;
}

async function fetchHeadlines(source: NewsSource): Promise<NewsStory[]> {
  // Mock implementation - replace with real news API calls
  const mockHeadlines: NewsStory[] = [
    {
      title: "Federal Reserve Considers Rate Adjustment Amid Economic Uncertainty",
      summary: "The Federal Reserve is evaluating potential changes to interest rates as economic indicators show mixed signals.",
      source: source.name,
      publishedAt: new Date().toISOString(),
      tags: ['business', 'economy', 'federal-reserve'],
      mentions: ['JPM', 'BAC', 'GS'],
      marketRelevance: 0.9
    },
    {
      title: "Tech Giant Announces Major Acquisition Deal",
      summary: "A leading technology company has agreed to acquire a promising AI startup for $2.3 billion.",
      source: source.name,
      publishedAt: new Date().toISOString(),
      tags: ['business', 'technology', 'mergers'],
      mentions: ['MSFT', 'GOOGL'],
      marketRelevance: 0.8
    },
    {
      title: "Energy Sector Faces New Regulatory Challenges",
      summary: "New environmental regulations are expected to impact energy companies' operational costs.",
      source: source.name,
      publishedAt: new Date().toISOString(),
      tags: ['business', 'energy', 'regulation'],
      mentions: ['XOM', 'CVX', 'COP'],
      marketRelevance: 0.7
    },
    {
      title: "Global Supply Chain Disruptions Continue",
      summary: "Ongoing supply chain issues affect multiple industries, with transportation costs rising.",
      source: source.name,
      publishedAt: new Date().toISOString(),
      tags: ['business', 'supply-chain', 'logistics'],
      mentions: ['FDX', 'UPS', 'AMZN'],
      marketRelevance: 0.6
    }
  ];

  return mockHeadlines;
}

function isPublicCompany(entity: string): boolean {
  // Simple check for common stock symbols or company names
  const publicCompanies = [
    'AAPL', 'MSFT', 'GOOGL', 'AMZN', 'TSLA', 'META', 'NVDA', 'JPM', 'JNJ', 'V',
    'Apple', 'Microsoft', 'Google', 'Amazon', 'Tesla', 'Meta', 'Nvidia'
  ];
  
  return publicCompanies.some(company => 
    entity.toUpperCase().includes(company.toUpperCase())
  );
}

async function summarizeForHumans(news: NewsStory[], openAIApiKey: string): Promise<NewsStory[]> {
  console.log('Converting corporate speak to human language...');
  
  // Corporate speak translations
  const translations = {
    'merger and acquisition': 'buying each other',
    'headcount reduction': 'layoffs',
    'rightsizing': 'layoffs',
    'pursuing strategic alternatives': 'looking for a buyer',
    'market headwinds': 'things are tough',
    'better than expected earnings': "didn't suck as bad as we thought",
    'restructuring': 'firing people and closing offices',
    'synergies': 'firing duplicate people after merger',
    'guidance': 'educated guess about the future',
    'volatility': 'the stock price is drunk',
    'algorithmic trading': 'robots buying and selling',
    'institutional investors': 'people with way more money than you'
  };

  const processedNews = await Promise.all(
    news.map(async (story) => {
      try {
        // Use AI to explain market impact and humanize language
        const prompt = `Take this financial news headline and summary, then:

1. Translate any corporate jargon into plain English
2. Explain why this matters to regular investors in 1-2 sentences
3. Keep it conversational but informative

Headline: ${story.title}
Summary: ${story.summary}

Corporate speak translations to use:
${Object.entries(translations).map(([corp, human]) => `"${corp}" = "${human}"`).join('\n')}

Return JSON with: { "humanSummary": "plain English version", "marketImpact": "why this matters" }`;

        const response = await fetch('https://api.openai.com/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${openAIApiKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            model: 'gpt-4o-mini',
            messages: [
              { 
                role: 'system', 
                content: 'You are a financial journalist who explains Wall Street news to regular people. Use humor appropriately but stay factual.' 
              },
              { role: 'user', content: prompt }
            ],
            temperature: 0.7,
            max_tokens: 200
          }),
        });

        if (response.ok) {
          const data = await response.json();
          const result = JSON.parse(data.choices[0].message.content);
          
          return {
            ...story,
            humanSummary: result.humanSummary,
            marketImpact: result.marketImpact
          };
        } else {
          // Fallback to manual translation
          return {
            ...story,
            humanSummary: translateCorpSpeak(story.summary, translations),
            marketImpact: explainWhyThisMatters(story)
          };
        }
      } catch (error) {
        console.error('Error processing story:', error);
        return {
          ...story,
          humanSummary: translateCorpSpeak(story.summary, translations),
          marketImpact: explainWhyThisMatters(story)
        };
      }
    })
  );

  return processedNews;
}

function translateCorpSpeak(text: string, translations: Record<string, string>): string {
  let translatedText = text;
  
  Object.entries(translations).forEach(([corpSpeak, humanSpeak]) => {
    const regex = new RegExp(corpSpeak, 'gi');
    translatedText = translatedText.replace(regex, humanSpeak);
  });
  
  return translatedText;
}

function explainWhyThisMatters(story: NewsStory): string {
  // Simple rule-based explanations based on story content and mentions
  if (story.tags.includes('federal-reserve') || story.title.toLowerCase().includes('rate')) {
    return "Interest rate changes affect everything from your mortgage to stock valuations. Banks usually benefit from higher rates, tech stocks hate them.";
  }
  
  if (story.tags.includes('mergers') || story.title.toLowerCase().includes('acquisition')) {
    return "M&A activity often sparks sector-wide rallies as investors hunt for the next takeover target. The acquired company's stock usually jumps immediately.";
  }
  
  if (story.mentions.some(symbol => ['AAPL', 'MSFT', 'GOOGL', 'AMZN', 'TSLA'].includes(symbol))) {
    return "When mega-cap tech moves, it drags the whole market with it due to their massive index weightings. These stocks are the market's heavyweight champions.";
  }
  
  if (story.tags.includes('energy') || story.tags.includes('oil')) {
    return "Energy sector moves often signal broader economic shifts. Rising oil prices can boost energy stocks but hurt airlines and consumer spending.";
  }
  
  return "Market movements often have ripple effects across sectors. Watch for related stocks that might benefit or suffer from this news.";
}