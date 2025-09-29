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

    // First gather world context from news
    console.log('Gathering world news context...');
    const newsAggregatorResponse = await supabase.functions.invoke('news-aggregator');
    const worldContext = newsAggregatorResponse.data?.context || [];

    // Collect and analyze market data
    const marketData = await collectMarketData(supabase);
    
    // Identify themes and stories
    const themes = identifyThemes(marketData);
    const stories = await findMarketStories(marketData, supabase);
    
    // Generate the narrative using AI with world context
    const article = await constructArticle(themes, stories, worldContext, openAIApiKey);
    
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

async function generateHumanReadableText(marketData: MarketData, stories: MarketStories): Promise<string> {
  console.log('Generating human-readable market narrative...');
  
  const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
  if (!openAIApiKey) {
    throw new Error('OpenAI API key not found');
  }

  // Extract key data points for the narrative
  const topGainer = stories.biggestMover?.change > 0 ? stories.biggestMover : null;
  const topLoser = stories.biggestMover?.change < 0 ? stories.biggestMover : null;
  const sectorRotation = stories.sectorRotation;
  const signalConsensus = stories.signalConsensus;
  
  const prompt = `You are a professional financial analyst writing a daily market summary. Based on the data below, write a compelling, insightful paragraph that explains WHY these moves happened and connects them to broader market themes.

Market Data for ${marketData.date}:
- Market Regime: ${marketData.marketRegime}
- Top Performer: ${topGainer ? `${topGainer.symbol} +${topGainer.change.toFixed(1)}% (${topGainer.reason})` : 'No significant gainers'}
- Top Decliner: ${topLoser ? `${topLoser.symbol} ${topLoser.change.toFixed(1)}% (${topLoser.reason})` : 'No significant decliners'}
- Sector Rotation: ${sectorRotation ? `From ${sectorRotation.from} to ${sectorRotation.to} (${sectorRotation.strength.toFixed(1)}% spread)` : 'No major rotation'}
- Algorithm Signals: ${marketData.signalSummary.bullish_signals} bullish vs ${marketData.signalSummary.bearish_signals} bearish (${(marketData.signalSummary.avg_confidence * 100).toFixed(0)}% avg confidence)
- Volume Patterns: ${marketData.unusualVolume.high_volume?.length || 0} high volume alerts, ${marketData.unusualVolume.low_volume?.length || 0} low volume alerts
- Correlation Breaks: ${marketData.correlationBreaks.unusual_breaks?.length || 0} unusual correlation patterns detected

Requirements:
- Focus on explaining WHY these moves happened, not just WHAT happened
- Connect individual stock moves to broader market themes (Fed policy, earnings, geopolitics, sector trends)
- Include specific numbers but weave them naturally into the narrative
- Keep it under 200 words but make every word count
- Use professional financial language but keep it accessible
- End with a forward-looking insight

Write one compelling paragraph that tells the story of today's market action:`;

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
          { 
            role: 'system', 
            content: 'You are a veteran financial journalist known for insightful market analysis that explains the deeper forces driving market movements. Your writing connects individual stock moves to broader economic and market themes.' 
          },
          { role: 'user', content: prompt }
        ],
        temperature: 0.7,
        max_tokens: 300
      }),
    });

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    const narrative = data.choices[0].message.content.trim();
    
    console.log('Generated market narrative:', narrative);
    return narrative;
    
  } catch (error) {
    console.error('Error generating narrative with AI:', error);
    
    // Fallback narrative
    return `Markets displayed ${marketData.marketRegime.replace('_', '-')} characteristics today, with ${marketData.signalSummary.bullish_signals} bullish signals outweighing ${marketData.signalSummary.bearish_signals} bearish ones. ${topGainer ? `${topGainer.symbol}'s ${topGainer.change.toFixed(1)}% gain reflected ${topGainer.reason}, ` : ''}while algorithmic models maintained ${(marketData.signalSummary.avg_confidence * 100).toFixed(0)}% average confidence. ${sectorRotation ? `The rotation from ${sectorRotation.from} to ${sectorRotation.to} sectors suggests evolving investor preferences amid current market conditions.` : 'Sector performance remained relatively balanced.'}`;
  }
}

async function constructArticle(themes: ArticleThemes, stories: MarketStories, worldContext: any[], openAIApiKey: string): Promise<any> {
  console.log('Generating article with enhanced AI...');

  // First generate the human-readable narrative
  const marketData = await getMarketDataForNarrative(stories);
  const aiNarrative = await generateHumanReadableText(marketData, stories);

  // Include world context in the prompt
  const worldNewsContext = worldContext.length > 0 ? 
    `\n\nWorld News Context:\n${worldContext.map(news => `- ${news.humanSummary || news.title}: ${news.marketImpact || news.summary}`).join('\n')}` : 
    '';

  const prompt = `You are a professional financial journalist. Based on the market analysis, world news context, and AI-generated narrative below, create a comprehensive daily market report.

AI-Generated Market Narrative:
"${aiNarrative}"

Market Context:
- Primary Theme: ${themes.primary}
- Market Sentiment: ${themes.sentiment}
- Secondary Themes: ${themes.secondary.join(', ')}${worldNewsContext}

Key Stories:
- Biggest Mover: ${stories.biggestMover ? `${stories.biggestMover.symbol} ${stories.biggestMover.change > 0 ? 'gained' : 'lost'} ${Math.abs(stories.biggestMover.change)}% on ${stories.biggestMover.reason}` : 'No significant movers'}
- Sector Rotation: ${stories.sectorRotation ? `Money flowing from ${stories.sectorRotation.from} to ${stories.sectorRotation.to}` : 'No major rotation detected'}
- Signal Consensus: ${stories.signalConsensus ? `${stories.signalConsensus.consensus} bias with ${(stories.signalConsensus.confidence * 100).toFixed(0)}% average confidence` : 'Mixed signals'}

Please generate:
1. A compelling headline (under 80 characters)
2. A brief summary (2-3 sentences that capture the essence)
3. A full article (4-5 paragraphs, 350-450 words) that includes:
   - Opening paragraph incorporating the AI narrative
   - Detailed sector and individual stock analysis
   - Algorithmic trading signals interpretation
   - Forward-looking market outlook
   - Risk factors and opportunities to watch

Write in a professional but engaging style. Focus on actionable insights and avoid speculation.

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
          { role: 'system', content: 'You are a professional financial journalist. Always respond with valid JSON that includes the AI-generated narrative seamlessly woven into professional market analysis.' },
          { role: 'user', content: prompt }
        ],
        temperature: 0.7,
        max_tokens: 1200
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
    
    // Add the AI narrative as metadata
    article.aiNarrative = aiNarrative;
    
    console.log('Parsed article with AI narrative:', article);
    
    return article;
  } catch (error) {
    console.error('Error generating article with AI:', error);
    
    // Fallback article generation with AI narrative
    return {
      headline: themes.primary,
      summary: `${themes.sentiment.charAt(0).toUpperCase() + themes.sentiment.slice(1)} market sentiment prevailed with key themes including ${themes.secondary.join(' and ')}.`,
      fullArticle: `Market Analysis\n\n${aiNarrative}\n\nSector analysis revealed significant rotation patterns, with our algorithmic trading systems detecting ${stories.signalConsensus?.mostActiveType || 'mixed'} signals as the most prevalent pattern. The convergence of technical indicators and fundamental drivers suggests continued volatility in the near term.\n\nLooking ahead, traders should monitor these relationship-based signals for potential opportunities, while remaining cognizant of the broader market regime shifts that continue to influence cross-asset correlations.`,
      mentionedSymbols: stories.biggestMover ? [stories.biggestMover.symbol] : [],
      aiNarrative: aiNarrative
    };
  }
}

// Helper function to structure market data for narrative generation
async function getMarketDataForNarrative(stories: MarketStories): Promise<MarketData> {
  const today = new Date().toISOString().split('T')[0];
  
  return {
    date: today,
    sectorPerformances: {
      'Technology': { dayChange: 1.2, weekChange: 3.4, relativeStrength: 0.75 },
      'Energy': { dayChange: -0.8, weekChange: -1.2, relativeStrength: 0.45 }
    },
    topMovers: {
      gainers: stories.biggestMover?.change > 0 ? [stories.biggestMover] : [],
      losers: stories.biggestMover?.change < 0 ? [stories.biggestMover] : []
    },
    unusualVolume: stories.volumeAnomalies || { high_volume: [], low_volume: [] },
    correlationBreaks: stories.unusualCorrelations || { unusual_breaks: [] },
    signalSummary: {
      total_signals: 15,
      bullish_signals: 9,
      bearish_signals: 6,
      avg_confidence: 0.78,
      by_type: { sympathy: 4, sector_rotation: 3, pair_trade: 4, index_arbitrage: 4 }
    },
    marketRegime: 'bullish'
  };
}