import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface MarketData {
  date: string;
  sectorPerformances: Record<string, any>;
  topMovers: Record<string, any>;
  unusualVolume: Record<string, any>;
  correlationBreaks: Record<string, any>;
  signalSummary: Record<string, any>;
  marketRegime: string;
}

interface ArticleThemes {
  primary: string;
  secondary: string[];
  sentiment: 'bullish' | 'bearish' | 'neutral';
  urgency: 'high' | 'medium' | 'low';
}

interface MarketStories {
  biggestMover: any;
  sectorRotation: any;
  unusualCorrelations: any;
  volumeAnomalies: any;
  signalConsensus: any;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('Market narrator function started...');
    
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );

    const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
    if (!openAIApiKey) {
      throw new Error('OpenAI API key not found');
    }

    // Collect and analyze market data
    const marketData = await collectMarketData(supabase);
    
    // Identify themes and stories
    const themes = identifyThemes(marketData);
    const stories = await findMarketStories(marketData, supabase);
    
    // Generate the narrative using AI
    const article = await constructArticle(themes, stories, openAIApiKey);
    
    // Save the article to database
    const { data: savedArticle, error: saveError } = await supabase
      .schema('trading')
      .from('daily_articles')
      .insert({
        publish_date: new Date().toISOString().split('T')[0],
        headline: article.headline,
        summary: article.summary,
        full_article: article.fullArticle,
        key_themes: themes,
        mentioned_symbols: article.mentionedSymbols,
        published_at: new Date().toISOString()
      })
      .select()
      .single();

    if (saveError) {
      console.error('Error saving article:', saveError);
      throw saveError;
    }

    console.log('Market narrative generated successfully');

    return new Response(
      JSON.stringify({ 
        success: true, 
        article: savedArticle,
        themes,
        stories: Object.keys(stories),
        timestamp: new Date().toISOString()
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Market narrator error:', error);
    
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString()
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

async function collectMarketData(supabase: any): Promise<MarketData> {
  const today = new Date().toISOString().split('T')[0];
  
  // Get sector performance data
  const { data: sectorData } = await supabase
    .schema('trading')
    .from('sector_performance')
    .select('*')
    .eq('performance_date', today);

  // Get correlation data
  const { data: correlationData } = await supabase
    .schema('trading')
    .from('correlation_matrix')
    .select('*')
    .order('last_updated', { ascending: false })
    .limit(50);

  // Get trading signals
  const { data: signalsData } = await supabase
    .schema('trading')
    .from('relationship_signals')
    .select('*')
    .gte('created_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString());

  // Process and structure the data
  const marketData: MarketData = {
    date: today,
    sectorPerformances: processSectorData(sectorData || []),
    topMovers: await findTopMovers(supabase),
    unusualVolume: await findUnusualVolume(supabase),
    correlationBreaks: findCorrelationBreaks(correlationData || []),
    signalSummary: summarizeSignals(signalsData || []),
    marketRegime: determineMarketRegime(sectorData || [])
  };

  // Save market narrative data
  await supabase
    .schema('trading')
    .from('market_narrative_data')
    .upsert({
      date: today,
      sector_performances: marketData.sectorPerformances,
      top_movers: marketData.topMovers,
      unusual_volume: marketData.unusualVolume,
      correlation_breaks: marketData.correlationBreaks,
      signal_summary: marketData.signalSummary,
      market_regime: marketData.marketRegime
    });

  return marketData;
}

function processSectorData(sectorData: any[]): Record<string, any> {
  const sectors: Record<string, any> = {};
  
  sectorData.forEach(sector => {
    sectors[sector.sector] = {
      dayChange: sector.day_change_percent,
      weekChange: sector.week_change_percent,
      relativeStrength: sector.relative_strength,
      leadingStocks: sector.leading_stocks
    };
  });

  return sectors;
}

async function findTopMovers(supabase: any): Promise<Record<string, any>> {
  // Mock implementation - in production, this would fetch real market data
  const topMovers = {
    gainers: [
      { symbol: 'NVDA', change: 8.5, volume: 89000000, reason: 'AI optimism' },
      { symbol: 'AMD', change: 6.2, volume: 45000000, reason: 'Chipmaker rally' },
      { symbol: 'TSLA', change: 4.8, volume: 67000000, reason: 'Delivery beat' }
    ],
    losers: [
      { symbol: 'META', change: -3.2, volume: 34000000, reason: 'Regulation fears' },
      { symbol: 'NFLX', change: -2.8, volume: 23000000, reason: 'Subscriber concerns' }
    ]
  };

  return topMovers;
}

async function findUnusualVolume(supabase: any): Promise<Record<string, any>> {
  return {
    high_volume: [
      { symbol: 'SPY', volume: 125000000, avgVolume: 89000000, ratio: 1.4 },
      { symbol: 'QQQ', volume: 87000000, avgVolume: 62000000, ratio: 1.4 }
    ],
    low_volume: [
      { symbol: 'IWM', volume: 23000000, avgVolume: 45000000, ratio: 0.5 }
    ]
  };
}

function findCorrelationBreaks(correlationData: any[]): Record<string, any> {
  const breaks: Array<{
    symbols: string[];
    currentCorrelation: number;
    historicalCorrelation: number;
    significance: string;
  }> = [];
  
  // Find unusual correlation patterns
  correlationData.forEach(corr => {
    if (Math.abs(corr.correlation_coefficient) < 0.3 && 
        (corr.symbol_a.includes('AAPL') || corr.symbol_b.includes('AAPL'))) {
      breaks.push({
        symbols: [corr.symbol_a, corr.symbol_b],
        currentCorrelation: corr.correlation_coefficient,
        historicalCorrelation: 0.7,
        significance: 'high'
      });
    }
  });

  return { unusual_breaks: breaks };
}

function summarizeSignals(signalsData: any[]): Record<string, any> {
  const summary = {
    total_signals: signalsData.length,
    by_type: {} as Record<string, number>,
    avg_confidence: 0,
    bullish_signals: 0,
    bearish_signals: 0
  };

  signalsData.forEach(signal => {
    summary.by_type[signal.signal_type] = (summary.by_type[signal.signal_type] || 0) + 1;
    summary.avg_confidence += signal.confidence;
    
    if (signal.strength > 0) summary.bullish_signals++;
    else summary.bearish_signals++;
  });

  if (signalsData.length > 0) {
    summary.avg_confidence = summary.avg_confidence / signalsData.length;
  }

  return summary;
}

function determineMarketRegime(sectorData: any[]): string {
  if (sectorData.length === 0) return 'neutral';
  
  const avgChange = sectorData.reduce((sum, sector) => sum + (sector.day_change_percent || 0), 0) / sectorData.length;
  
  if (avgChange > 1.5) return 'risk_on';
  if (avgChange < -1.5) return 'risk_off';
  if (avgChange > 0.5) return 'bullish';
  if (avgChange < -0.5) return 'bearish';
  return 'neutral';
}

function identifyThemes(marketData: MarketData): ArticleThemes {
  const themes: ArticleThemes = {
    primary: 'Market Update',
    secondary: [],
    sentiment: 'neutral',
    urgency: 'medium'
  };

  // Analyze sector performances to identify primary theme
  const sectors = Object.entries(marketData.sectorPerformances);
  const strongSectors = sectors.filter(([_, data]: [string, any]) => Math.abs(data.dayChange) > 2);
  
  if (strongSectors.length > 0) {
    const topSector = strongSectors.reduce((max, curr) => 
      Math.abs(curr[1].dayChange) > Math.abs(max[1].dayChange) ? curr : max
    );
    
    if (topSector[1].dayChange > 0) {
      themes.primary = `${topSector[0]} Leads Market Rally`;
      themes.sentiment = 'bullish';
    } else {
      themes.primary = `${topSector[0]} Weighs on Markets`;
      themes.sentiment = 'bearish';
    }
  }

  // Add secondary themes
  if (marketData.marketRegime === 'risk_on') themes.secondary.push('Risk-On Rally');
  if (marketData.marketRegime === 'risk_off') themes.secondary.push('Flight to Safety');
  if (marketData.signalSummary.total_signals > 20) themes.secondary.push('High Signal Activity');
  if (marketData.topMovers.gainers?.length > 3) themes.secondary.push('Broad-Based Gains');

  return themes;
}

async function findMarketStories(marketData: MarketData, supabase: any): Promise<MarketStories> {
  return {
    biggestMover: findBiggestMover(marketData),
    sectorRotation: detectSectorRotation(marketData),
    unusualCorrelations: marketData.correlationBreaks,
    volumeAnomalies: marketData.unusualVolume,
    signalConsensus: analyzeSignalPatterns(marketData)
  };
}

function findBiggestMover(marketData: MarketData): any {
  const gainers = marketData.topMovers.gainers || [];
  const losers = marketData.topMovers.losers || [];
  
  const allMovers = [...gainers, ...losers];
  if (allMovers.length === 0) return null;
  
  return allMovers.reduce((max, curr) => 
    Math.abs(curr.change) > Math.abs(max.change) ? curr : max
  );
}

function detectSectorRotation(marketData: MarketData): any {
  const sectors = Object.entries(marketData.sectorPerformances);
  const winner = sectors.reduce((max, curr) => 
    curr[1].dayChange > max[1].dayChange ? curr : max, ['', { dayChange: -Infinity }]
  );
  const loser = sectors.reduce((min, curr) => 
    curr[1].dayChange < min[1].dayChange ? curr : min, ['', { dayChange: Infinity }]
  );

  return {
    from: loser[0],
    to: winner[0],
    strength: winner[1].dayChange - loser[1].dayChange
  };
}

function analyzeSignalPatterns(marketData: MarketData): any {
  const signals = marketData.signalSummary;
  
  return {
    consensus: signals.bullish_signals > signals.bearish_signals ? 'bullish' : 'bearish',
    strength: Math.abs(signals.bullish_signals - signals.bearish_signals) / signals.total_signals,
    confidence: signals.avg_confidence,
    mostActiveType: Object.entries(signals.by_type as Record<string, number>).reduce((max, curr) => 
      curr[1] > max[1] ? curr : max, ['none', 0] as [string, number])[0]
  };
}

async function constructArticle(themes: ArticleThemes, stories: MarketStories, openAIApiKey: string): Promise<any> {
  console.log('Generating article with AI...');

  const prompt = `You are a professional financial journalist writing a compelling daily market analysis. 

Market Context:
- Primary Theme: ${themes.primary}
- Market Sentiment: ${themes.sentiment}
- Secondary Themes: ${themes.secondary.join(', ')}

Key Stories:
- Biggest Mover: ${stories.biggestMover ? `${stories.biggestMover.symbol} ${stories.biggestMover.change > 0 ? 'gained' : 'lost'} ${Math.abs(stories.biggestMover.change)}% on ${stories.biggestMover.reason}` : 'No significant movers'}
- Sector Rotation: ${stories.sectorRotation ? `Money flowing from ${stories.sectorRotation.from} to ${stories.sectorRotation.to}` : 'No major rotation detected'}
- Signal Consensus: ${stories.signalConsensus ? `${stories.signalConsensus.consensus} bias with ${(stories.signalConsensus.confidence * 100).toFixed(0)}% average confidence` : 'Mixed signals'}

Please generate:
1. A compelling headline (under 80 characters)
2. A brief summary (2-3 sentences)
3. A full article (4-5 paragraphs, 300-400 words) that includes:
   - Opening with market performance
   - Analysis of sector movements
   - Discussion of algorithmic signals
   - Forward-looking outlook

Write in a professional but accessible tone. Focus on actionable insights and avoid speculation.

Return the response as JSON with fields: headline, summary, fullArticle, mentionedSymbols (array of stock symbols mentioned).`;

  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: 'You are a professional financial journalist. Always respond with valid JSON.' },
          { role: 'user', content: prompt }
        ],
        temperature: 0.7,
        max_tokens: 1000
      }),
    });

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    const content = data.choices[0].message.content;
    
    console.log('Raw AI response:', content);
    
    // Parse the JSON response
    const article = JSON.parse(content);
    
    console.log('Parsed article:', article);
    
    return article;
  } catch (error) {
    console.error('Error generating article with AI:', error);
    
    // Fallback article generation
    return {
      headline: themes.primary,
      summary: `Markets showed ${themes.sentiment} sentiment with key themes including ${themes.secondary.join(' and ')}.`,
      fullArticle: `Market Update\n\n${themes.primary} dominated trading today as investors processed the latest developments. The ${themes.sentiment} sentiment reflected broader market dynamics.\n\nSector analysis revealed interesting rotation patterns, with algorithm-detected signals providing additional market insight. Trading volumes and correlation patterns suggested continued volatility ahead.\n\nLooking forward, market participants will continue monitoring these developments for potential trading opportunities.`,
      mentionedSymbols: stories.biggestMover ? [stories.biggestMover.symbol] : []
    };
  }
}