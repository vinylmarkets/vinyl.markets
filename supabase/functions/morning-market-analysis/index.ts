import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface MarketScanConfig {
  scan_type: string;
  parameters: {
    min_short_ratio?: number;
    min_volume_change?: number;
    min_price_change?: number;
    min_market_cap?: number;
    max_results?: number;
    timeframe?: string;
  };
  is_active: boolean;
}

interface PolygonTickerDetails {
  ticker: string;
  name: string;
  market_cap?: number;
  outstanding_shares?: number;
  weighted_shares_outstanding?: number;
}

interface PolygonPrevClose {
  T: string; // ticker
  c: number; // close
  h: number; // high
  l: number; // low
  o: number; // open
  v: number; // volume
  vw: number; // volume weighted average price
}

interface PolygonAggregates {
  ticker: string;
  results?: Array<{
    c: number; // close
    h: number; // high
    l: number; // low
    o: number; // open
    v: number; // volume
    vw: number; // volume weighted average price
    t: number; // timestamp
  }>;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const polygonApiKey = Deno.env.get('POLYGON_API_KEY');
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

    if (!polygonApiKey) {
      throw new Error('Polygon API key not configured');
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    const today = new Date().toISOString().split('T')[0];

    console.log(`Starting morning market analysis for ${today}`);

    // Get scan configurations
    const { data: scanConfigs } = await supabase
      .from('market_scan_config')
      .select('*')
      .eq('is_active', true);

    if (!scanConfigs || scanConfigs.length === 0) {
      throw new Error('No active scan configurations found');
    }

    const analysisResults = [];

    // Run each type of market scan
    for (const config of scanConfigs as MarketScanConfig[]) {
      console.log(`Running ${config.scan_type} scan...`);
      
      try {
        let scanResults;
        
        switch (config.scan_type) {
          case 'volume_spike':
            scanResults = await scanVolumeSpikes(polygonApiKey, config.parameters);
            break;
          case 'price_movement':
            scanResults = await scanPriceMovements(polygonApiKey, config.parameters);
            break;
          case 'short_interest':
            scanResults = await scanShortInterest(polygonApiKey, config.parameters);
            break;
          default:
            console.log(`Scan type ${config.scan_type} not implemented yet`);
            continue;
        }

        if (scanResults && scanResults.length > 0) {
          analysisResults.push(...scanResults);
        }
      } catch (error) {
        console.error(`Error in ${config.scan_type} scan:`, error);
      }
    }

    // Store analysis results
    if (analysisResults.length > 0) {
      const { error: insertError } = await supabase
        .from('daily_market_analysis')
        .insert(analysisResults);

      if (insertError) {
        console.error('Error storing analysis results:', insertError);
      } else {
        console.log(`Stored ${analysisResults.length} analysis results`);
      }
    }

    // Generate daily briefings based on analysis
    const briefingTopics = generateBriefingTopics(analysisResults);
    const generatedBriefings = [];

    for (const topic of briefingTopics) {
      try {
        console.log(`Generating briefing for topic: ${topic.title}`);
        
        const briefingResult = await generateBriefingForTopic(topic, supabase);
        if (briefingResult) {
          generatedBriefings.push(briefingResult);
        }
      } catch (error) {
        console.error(`Error generating briefing for ${topic.title}:`, error);
      }
    }

    console.log(`Morning analysis complete. Generated ${generatedBriefings.length} briefings from ${analysisResults.length} market signals`);

    return new Response(JSON.stringify({
      success: true,
      analysis_results: analysisResults.length,
      briefings_generated: generatedBriefings.length,
      date: today,
      briefings: generatedBriefings
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in morning market analysis:', error);
    return new Response(JSON.stringify({
      error: error.message,
      success: false
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

async function scanVolumeSpikes(apiKey: string, params: any) {
  try {
    // Get previous day's data for volume comparison
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toISOString().split('T')[0];

    // Get grouped daily data for major stocks
    const response = await fetch(
      `https://api.polygon.io/v2/aggs/grouped/locale/us/market/stocks/${yesterdayStr}?adjusted=true&apikey=${apiKey}`
    );

    if (!response.ok) {
      throw new Error(`Polygon API error: ${response.status}`);
    }

    const data = await response.json();
    
    if (!data.results) {
      return [];
    }

    const results = [];
    const minVolumeChange = params.min_volume_change || 300;
    const minMarketCap = params.min_market_cap || 500000000;
    const maxResults = params.max_results || 10;

    // For each ticker, compare current volume to average
    for (const dayData of data.results.slice(0, 50)) { // Limit to top 50 for API efficiency
      try {
        // Get historical average volume (last 20 days)
        const historicalResponse = await fetch(
          `https://api.polygon.io/v2/aggs/ticker/${dayData.T}/range/1/day/${getDateDaysAgo(21)}/${getDateDaysAgo(2)}?adjusted=true&sort=desc&apikey=${apiKey}`
        );

        if (historicalResponse.ok) {
          const historicalData = await historicalResponse.json();
          
          if (historicalData.results && historicalData.results.length > 0) {
            const avgVolume = historicalData.results.reduce((sum: number, d: any) => sum + d.v, 0) / historicalData.results.length;
            const volumeChangePercent = ((dayData.v - avgVolume) / avgVolume) * 100;

            if (volumeChangePercent >= minVolumeChange) {
              // Get ticker details for market cap
              const detailsResponse = await fetch(
                `https://api.polygon.io/v3/reference/tickers/${dayData.T}?apikey=${apiKey}`
              );

              let marketCap = 0;
              if (detailsResponse.ok) {
                const detailsData = await detailsResponse.json();
                marketCap = detailsData.results?.market_cap || 0;
              }

              if (marketCap >= minMarketCap) {
                results.push({
                  analysis_date: yesterday.toISOString().split('T')[0],
                  analysis_type: 'volume_spike',
                  symbol: dayData.T,
                  metric_value: volumeChangePercent,
                  metric_name: 'volume_change_pct',
                  current_price: dayData.c,
                  price_change_pct: ((dayData.c - dayData.o) / dayData.o) * 100,
                  volume: dayData.v,
                  market_cap: marketCap,
                  significance_score: Math.min(95, Math.max(50, volumeChangePercent / 10)),
                  analysis_data: {
                    avg_volume: avgVolume,
                    current_volume: dayData.v,
                    high: dayData.h,
                    low: dayData.l,
                    open: dayData.o,
                    close: dayData.c
                  }
                });
              }
            }
          }
        }

        // Rate limiting - don't overwhelm the API
        await new Promise(resolve => setTimeout(resolve, 100));
      } catch (error) {
        console.error(`Error processing ticker ${dayData.T}:`, error);
      }
    }

    return results.sort((a, b) => b.significance_score - a.significance_score).slice(0, maxResults);
  } catch (error) {
    console.error('Error in volume spike scan:', error);
    return [];
  }
}

async function scanPriceMovements(apiKey: string, params: any) {
  try {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toISOString().split('T')[0];

    const response = await fetch(
      `https://api.polygon.io/v2/aggs/grouped/locale/us/market/stocks/${yesterdayStr}?adjusted=true&apikey=${apiKey}`
    );

    if (!response.ok) {
      throw new Error(`Polygon API error: ${response.status}`);
    }

    const data = await response.json();
    
    if (!data.results) {
      return [];
    }

    const results = [];
    const minPriceChange = params.min_price_change || 5;
    const maxResults = params.max_results || 10;

    for (const dayData of data.results) {
      const priceChangePercent = Math.abs(((dayData.c - dayData.o) / dayData.o) * 100);
      
      if (priceChangePercent >= minPriceChange) {
        results.push({
          analysis_date: yesterday.toISOString().split('T')[0],
          analysis_type: 'price_movement',
          symbol: dayData.T,
          metric_value: priceChangePercent,
          metric_name: 'price_change_pct',
          current_price: dayData.c,
          price_change_pct: ((dayData.c - dayData.o) / dayData.o) * 100,
          volume: dayData.v,
          market_cap: 0, // Will be filled if needed
          significance_score: Math.min(95, Math.max(50, priceChangePercent * 5)),
          analysis_data: {
            high: dayData.h,
            low: dayData.l,
            open: dayData.o,
            close: dayData.c,
            direction: dayData.c > dayData.o ? 'up' : 'down'
          }
        });
      }
    }

    return results.sort((a, b) => b.significance_score - a.significance_score).slice(0, maxResults);
  } catch (error) {
    console.error('Error in price movement scan:', error);
    return [];
  }
}

async function scanShortInterest(apiKey: string, params: any) {
  // Short interest data requires premium Polygon subscription
  // For now, return placeholder data
  console.log('Short interest scan - premium feature, returning placeholder');
  return [];
}

function generateBriefingTopics(analysisResults: any[]) {
  const topics = [];

  // Group by analysis type
  const groupedResults = analysisResults.reduce((groups, result) => {
    const type = result.analysis_type;
    if (!groups[type]) groups[type] = [];
    groups[type].push(result);
    return groups;
  }, {} as Record<string, any[]>);

  // Generate topic for each analysis type
  Object.entries(groupedResults).forEach(([type, results]) => {
    if (results.length > 0) {
      const topResults = results.slice(0, 5);
      
      topics.push({
        title: getTopicTitle(type),
        category: getCategoryFromType(type),
        stocks: topResults.map(r => r.symbol),
        analysisData: topResults,
        priority: getTopicPriority(type, results.length)
      });
    }
  });

  // Add general market overview if we have enough data
  if (analysisResults.length >= 5) {
    topics.push({
      title: "Market Overview: Key Movers and Trends",
      category: "market-overview",
      stocks: [...new Set(analysisResults.slice(0, 10).map(r => r.symbol))],
      analysisData: analysisResults.slice(0, 10),
      priority: 10
    });
  }

  return topics.sort((a, b) => b.priority - a.priority).slice(0, 10);
}

function getTopicTitle(analysisType: string): string {
  const titles = {
    'volume_spike': 'Volume Surge Alert: Stocks with Unusual Activity',
    'price_movement': 'Market Movers: Significant Price Changes',
    'short_interest': 'Short Squeeze Watch: High Short Interest Stocks'
  };
  return titles[analysisType as keyof typeof titles] || `${analysisType} Analysis`;
}

function getCategoryFromType(analysisType: string): string {
  const categories = {
    'volume_spike': 'trading-volume',
    'price_movement': 'price-action', 
    'short_interest': 'short-interest'
  };
  return categories[analysisType as keyof typeof categories] || 'market-analysis';
}

function getTopicPriority(analysisType: string, resultCount: number): number {
  const basePriority = {
    'volume_spike': 8,
    'price_movement': 7,
    'short_interest': 9
  };
  return (basePriority[analysisType as keyof typeof basePriority] || 5) + Math.min(2, resultCount / 3);
}

async function generateBriefingForTopic(topic: any, supabase: any) {
  try {
    const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
    if (!openAIApiKey) {
      throw new Error('OpenAI API key not configured');
    }

    const currentDate = new Date().toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });

    const stockList = topic.stocks.join(', ');
    const analysisContext = topic.analysisData.map((data: any) => 
      `${data.symbol}: ${data.metric_name} = ${data.metric_value.toFixed(2)}${data.metric_name.includes('pct') ? '%' : ''}`
    ).join('; ');

    const systemPrompt = `You are a senior financial analyst creating daily market intelligence for ${currentDate}. 
    Generate analysis based on real market scanning data showing ${topic.title}.
    Focus on the stocks: ${stockList}
    Market data context: ${analysisContext}
    Provide educational, balanced analysis without investment advice.`;

    const academicPrompt = `Create an academic-style briefing for ${currentDate} about ${topic.title}:
    === Market Signal Analysis ===
    (Analyze the specific market signals: ${analysisContext})
    
    === Stock Spotlight ===
    (Focus on key stocks: ${stockList} and what's driving their movement)
    
    === Technical Context ===
    (Explain the technical significance of these movements)
    
    === Risk Factors ===
    (Key risks and considerations for these developments)
    
    === Educational Insight ===
    (Key concept explanation relevant to this market activity)
    
    CRITICAL: Generate analysis for ${currentDate} based on the provided market data.
    IMPORTANT: Use === Header === format for section headers. Return plain text only.`;

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
          { role: 'user', content: academicPrompt }
        ],
        max_tokens: 2000,
        temperature: 0.7,
      }),
    });

    const data = await response.json();
    const academicContent = data.choices[0].message.content.trim();

    // Generate plain speak version
    const plainSpeakPrompt = `Create a plain-language version for ${currentDate}:
    === Today's Market Alert ===
    (Simple explanation of ${topic.title})
    
    === What Happened ===
    (Easy explanation of the market activity in ${stockList})
    
    === Why This Matters ===
    (Significance for regular investors)
    
    === What to Watch ===
    (Key things to monitor going forward)
    
    Use conversational tone, avoid jargon, explain terms simply.
    IMPORTANT: Use === Header === format. Return plain text only.`;

    const plainResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: plainSpeakPrompt }
        ],
        max_tokens: 2000,
        temperature: 0.7,
      }),
    });

    const plainData = await plainResponse.json();
    const plainSpeakContent = plainData.choices[0].message.content.trim();

    // Create briefing record
    const briefingData = {
      title: topic.title,
      category: topic.category,
      executive_summary: academicContent.split('\n')[0] || 'Market analysis and insights.',
      academic_content: academicContent,
      plain_speak_content: plainSpeakContent,
      educational_principle: {
        title: "Market Signal Analysis",
        content: `Understanding ${topic.title.toLowerCase()} helps identify potential trading opportunities and market shifts.`,
        difficulty: "intermediate"
      },
      stocks_mentioned: topic.stocks,
      methodology_notes: `Generated using real-time market scanning data from Polygon.io. Analysis based on ${topic.analysisData.length} market signals detected on ${currentDate}.`,
      risk_disclaimers: "This analysis is for educational purposes only. Past performance does not guarantee future results.",
      published: true,
      publication_date: new Date().toISOString()
    };

    const { data: briefing, error } = await supabase
      .from('briefings')
      .insert(briefingData)
      .select()
      .single();

    if (error) {
      console.error('Error saving briefing:', error);
      return null;
    }

    return briefing;
  } catch (error) {
    console.error('Error generating briefing for topic:', error);
    return null;
  }
}

function getDateDaysAgo(days: number): string {
  const date = new Date();
  date.setDate(date.getDate() - days);
  return date.toISOString().split('T')[0];
}