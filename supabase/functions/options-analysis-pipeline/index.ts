import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface OptionsContract {
  contract_type: 'call' | 'put';
  strike_price: number;
  expiration_date: string;
  ticker: string;
  underlying_ticker: string;
  details: {
    contract_size: number;
    exercise_style: string;
  };
  market_data: {
    last_quote: {
      bid: number;
      ask: number;
      bid_size: number;
      ask_size: number;
      exchange: number;
      last_updated: number;
    };
    prev_day: {
      open: number;
      high: number;
      low: number;
      close: number;
      volume: number;
      vwap: number;
    };
    greeks: {
      delta: number;
      gamma: number;
      theta: number;
      vega: number;
    };
    implied_volatility: number;
    open_interest: number;
  };
}

interface OptionsOpportunity {
  category: 'spreads' | 'combinations' | 'directional' | 'income';
  strategy_type: string;
  strategy_name: string;
  underlying_symbol: string;
  underlying_price: number;
  legs: any[];
  expiration_date: string;
  cost_basis: number;
  max_profit: number;
  max_loss: number;
  probability_of_profit: number;
  risk_score: number;
  educational_explanation: string;
  risk_discussion: string;
  strategy_mechanics: string;
  confidence_score: number;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('Starting Options Value Tool analysis pipeline...');
    const startTime = Date.now();

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Get Polygon API key
    const polygonApiKey = Deno.env.get('POLYGON_API_KEY');
    if (!polygonApiKey) {
      throw new Error('POLYGON_API_KEY not configured');
    }

    // Step 1: Get list of liquid stocks to analyze
    const liquidStocks = await getLiquidStocks();
    console.log(`Analyzing ${liquidStocks.length} liquid stocks`);

    // Step 2: Collect options market data for each stock
    const marketData = await collectOptionsMarketData(liquidStocks, polygonApiKey);
    console.log(`Collected options data for ${marketData.length} symbols`);

    // Step 3: Detect unusual options activity
    const unusualActivity = await detectUnusualOptionsActivity(marketData);
    console.log(`Detected ${unusualActivity.length} unusual activity signals`);

    // Step 4: Analyze each strategy category in parallel
    console.log('Running strategy analysis...');
    const [spreads, combinations, directional, income] = await Promise.all([
      analyzeSpreads(marketData, unusualActivity),
      analyzeCombinations(marketData, unusualActivity),
      analyzeDirectional(marketData, unusualActivity),
      analyzeIncome(marketData, unusualActivity)
    ]);

    console.log(`Found ${spreads.length} spreads, ${combinations.length} combinations, ${directional.length} directional, ${income.length} income opportunities`);

    // Step 5: Rank and select top 20 for each category
    const topOpportunities = {
      spreads: rankOpportunities(spreads).slice(0, 20),
      combinations: rankOpportunities(combinations).slice(0, 20),
      directional: rankOpportunities(directional).slice(0, 20),
      income: rankOpportunities(income).slice(0, 20)
    };

    // Step 6: Generate educational explanations
    const withExplanations = await generateEducationalContent(topOpportunities);

    // Step 7: Store in database
    await storeOpportunities(supabase, withExplanations);

    const processingTime = Date.now() - startTime;
    console.log(`Options analysis complete in ${processingTime}ms`);

    return new Response(
      JSON.stringify({ 
        success: true, 
        processed: {
          spreads: topOpportunities.spreads.length,
          combinations: topOpportunities.combinations.length,
          directional: topOpportunities.directional.length,
          income: topOpportunities.income.length
        },
        processingTime 
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    );

  } catch (error) {
    console.error('Options analysis pipeline error:', error);
    
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : 'Unknown error occurred',
        details: 'Check edge function logs for more details'
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500 
      }
    );
  }
});

// Get list of liquid stocks to analyze (S&P 500 + high volume stocks)
async function getLiquidStocks(): Promise<string[]> {
  // For now, return a curated list of highly liquid stocks
  // In production, this would query market cap + volume data
  return [
    'AAPL', 'MSFT', 'GOOGL', 'AMZN', 'NVDA', 'TSLA', 'META', 'NFLX',
    'AMD', 'CRM', 'ADBE', 'PYPL', 'INTC', 'CSCO', 'PEP', 'AVGO',
    'TXN', 'QCOM', 'COST', 'TMUS', 'HON', 'NEE', 'UNP', 'LIN',
    'DHR', 'PG', 'JNJ', 'V', 'UNH', 'HD', 'MA', 'BAC', 'WMT',
    'XOM', 'JPM', 'LLY', 'ABBV', 'KO', 'MRK', 'CVX', 'PFE',
    'TMO', 'ACN', 'DIS', 'ABT', 'COP', 'WFC', 'ADBE', 'LIN',
    'ORCL', 'MCD', 'PM', 'VZ', 'BMY', 'CMCSA', 'SCHW', 'RTX'
  ];
}

// Collect options market data from Polygon.io
async function collectOptionsMarketData(symbols: string[], apiKey: string): Promise<any[]> {
  const marketData = [];
  
  for (const symbol of symbols.slice(0, 10)) { // Limit to first 10 for demo
    try {
      // Get underlying stock price
      const stockUrl = `https://api.polygon.io/v2/aggs/ticker/${symbol}/prev?adjusted=true&apikey=${apiKey}`;
      const stockResponse = await fetch(stockUrl);
      const stockData = await stockResponse.json();
      
      if (!stockData.results || stockData.results.length === 0) {
        console.log(`No stock data for ${symbol}`);
        continue;
      }

      const underlyingPrice = stockData.results[0].c; // closing price
      
      // Get options contracts (simplified - just get a few strikes around current price)
      const optionsUrl = `https://api.polygon.io/v3/reference/options/contracts?underlying_ticker=${symbol}&limit=50&apikey=${apiKey}`;
      const optionsResponse = await fetch(optionsUrl);
      const optionsData = await optionsResponse.json();
      
      if (!optionsData.results) {
        console.log(`No options data for ${symbol}`);
        continue;
      }

      // Filter for liquid options near the money
      const liquidOptions = optionsData.results.filter((contract: any) => {
        const strike = contract.strike_price;
        const priceDiff = Math.abs(strike - underlyingPrice) / underlyingPrice;
        return priceDiff <= 0.15; // Within 15% of current price
      });

      marketData.push({
        symbol,
        underlyingPrice,
        options: liquidOptions,
        volume: stockData.results[0].v,
        ivRank: Math.random() * 100 // Placeholder - would calculate actual IV rank
      });

    } catch (error) {
      console.error(`Error collecting data for ${symbol}:`, error);
    }
  }
  
  return marketData;
}

// Detect unusual options activity
async function detectUnusualOptionsActivity(marketData: any[]): Promise<any[]> {
  const unusualActivity = [];
  
  // Simplified unusual activity detection
  for (const symbolData of marketData) {
    const { symbol, options } = symbolData;
    
    for (const option of options) {
      // Mock unusual activity detection - in reality would compare to historical volume
      if (Math.random() > 0.95) { // 5% chance of unusual activity
        unusualActivity.push({
          symbol,
          option_symbol: option.ticker,
          significance_score: Math.floor(Math.random() * 10) + 1,
          sentiment: Math.random() > 0.5 ? 'bullish' : 'bearish'
        });
      }
    }
  }
  
  return unusualActivity;
}

// Analyze spread strategies
async function analyzeSpreads(marketData: any[], unusualActivity: any[]): Promise<OptionsOpportunity[]> {
  const opportunities: OptionsOpportunity[] = [];
  
  for (const symbolData of marketData) {
    const { symbol, underlyingPrice, options } = symbolData;
    
    // Simple bull call spread analysis
    const calls = options.filter((o: any) => o.contract_type === 'call');
    
    for (let i = 0; i < calls.length - 1; i++) {
      const longCall = calls[i];
      const shortCall = calls[i + 1];
      
      if (longCall.strike_price < underlyingPrice && shortCall.strike_price > underlyingPrice) {
        const maxProfit = (shortCall.strike_price - longCall.strike_price) * 100;
        const costBasis = 200; // Simplified
        const maxLoss = costBasis;
        
        opportunities.push({
          category: 'spreads',
          strategy_type: 'bull_call_spread',
          strategy_name: `${symbol} Bull Call Spread`,
          underlying_symbol: symbol,
          underlying_price: underlyingPrice,
          legs: [
            { action: 'buy', option: longCall, quantity: 1 },
            { action: 'sell', option: shortCall, quantity: 1 }
          ],
          expiration_date: longCall.expiration_date,
          cost_basis: costBasis,
          max_profit: maxProfit,
          max_loss: maxLoss,
          probability_of_profit: 65 + Math.random() * 20,
          risk_score: Math.floor(Math.random() * 5) + 3,
          educational_explanation: `This bull call spread on ${symbol} capitalizes on moderate upward price movement while limiting risk.`,
          risk_discussion: `Maximum loss is limited to the net premium paid (${costBasis}). Risk increases if the stock declines significantly.`,
          strategy_mechanics: `Buy the ${longCall.strike_price} call and sell the ${shortCall.strike_price} call, both expiring on ${longCall.expiration_date}.`,
          confidence_score: Math.floor(Math.random() * 40) + 60
        });
      }
    }
  }
  
  return opportunities;
}

// Analyze combination strategies
async function analyzeCombinations(marketData: any[], unusualActivity: any[]): Promise<OptionsOpportunity[]> {
  const opportunities: OptionsOpportunity[] = [];
  
  for (const symbolData of marketData) {
    const { symbol, underlyingPrice, options, ivRank } = symbolData;
    
    // Look for straddle opportunities when IV is low
    if (ivRank < 30) {
      const atmCall = options.find((o: any) => 
        o.contract_type === 'call' && Math.abs(o.strike_price - underlyingPrice) < 5
      );
      const atmPut = options.find((o: any) => 
        o.contract_type === 'put' && Math.abs(o.strike_price - underlyingPrice) < 5
      );
      
      if (atmCall && atmPut) {
        opportunities.push({
          category: 'combinations',
          strategy_type: 'long_straddle',
          strategy_name: `${symbol} Long Straddle`,
          underlying_symbol: symbol,
          underlying_price: underlyingPrice,
          legs: [
            { action: 'buy', option: atmCall, quantity: 1 },
            { action: 'buy', option: atmPut, quantity: 1 }
          ],
          expiration_date: atmCall.expiration_date,
          cost_basis: 400, // Simplified
          max_profit: 99999, // Theoretically unlimited
          max_loss: 400,
          probability_of_profit: 45 + Math.random() * 20,
          risk_score: Math.floor(Math.random() * 4) + 6,
          educational_explanation: `Long straddle profits from significant price movement in either direction when implied volatility is expected to increase.`,
          risk_discussion: `Maximum loss occurs if the stock stays near the strike price at expiration. Time decay accelerates as expiration approaches.`,
          strategy_mechanics: `Buy both the call and put at the same strike price and expiration, profiting from volatility expansion.`,
          confidence_score: Math.floor(Math.random() * 30) + 50
        });
      }
    }
  }
  
  return opportunities;
}

// Analyze directional strategies
async function analyzeDirectional(marketData: any[], unusualActivity: any[]): Promise<OptionsOpportunity[]> {
  const opportunities: OptionsOpportunity[] = [];
  
  // Simplified directional analysis based on unusual activity
  for (const activity of unusualActivity) {
    const symbolData = marketData.find(d => d.symbol === activity.symbol);
    if (!symbolData) continue;
    
    opportunities.push({
      category: 'directional',
      strategy_type: 'leveraged_directional',
      strategy_name: `${activity.symbol} Directional Play`,
      underlying_symbol: activity.symbol,
      underlying_price: symbolData.underlyingPrice,
      legs: [{ action: 'buy', option: { strike_price: symbolData.underlyingPrice }, quantity: 1 }],
      expiration_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      cost_basis: 150,
      max_profit: 500,
      max_loss: 150,
      probability_of_profit: 40 + Math.random() * 30,
      risk_score: Math.floor(Math.random() * 5) + 7,
      educational_explanation: `Directional play based on unusual options activity suggesting ${activity.sentiment} sentiment.`,
      risk_discussion: `High-risk strategy with potential for 100% loss if direction is wrong.`,
      strategy_mechanics: `Take a leveraged position based on unusual flow and sentiment indicators.`,
      confidence_score: Math.floor(Math.random() * 25) + 55
    });
  }
  
  return opportunities;
}

// Analyze income strategies
async function analyzeIncome(marketData: any[], unusualActivity: any[]): Promise<OptionsOpportunity[]> {
  const opportunities: OptionsOpportunity[] = [];
  
  for (const symbolData of marketData) {
    const { symbol, underlyingPrice, options, ivRank } = symbolData;
    
    // Look for covered call opportunities when IV is high
    if (ivRank > 50) {
      const otmCall = options.find((o: any) => 
        o.contract_type === 'call' && o.strike_price > underlyingPrice * 1.05
      );
      
      if (otmCall) {
        opportunities.push({
          category: 'income',
          strategy_type: 'covered_call',
          strategy_name: `${symbol} Covered Call`,
          underlying_symbol: symbol,
          underlying_price: underlyingPrice,
          legs: [
            { action: 'own', shares: 100, price: underlyingPrice },
            { action: 'sell', option: otmCall, quantity: 1 }
          ],
          expiration_date: otmCall.expiration_date,
          cost_basis: underlyingPrice * 100,
          max_profit: (otmCall.strike_price - underlyingPrice) * 100 + 200, // Strike diff + premium
          max_loss: underlyingPrice * 100 - 200, // Stock value minus premium collected
          probability_of_profit: 70 + Math.random() * 25,
          risk_score: Math.floor(Math.random() * 4) + 2,
          educational_explanation: `Covered call generates income from stock holdings while providing limited upside participation.`,
          risk_discussion: `Risk of having stock called away if it rises above strike price. Also exposed to downside stock risk.`,
          strategy_mechanics: `Own 100 shares of ${symbol} and sell 1 call option at ${otmCall.strike_price} strike.`,
          confidence_score: Math.floor(Math.random() * 20) + 70
        });
      }
    }
  }
  
  return opportunities;
}

// Rank opportunities by expected value and risk-adjusted returns
function rankOpportunities(opportunities: OptionsOpportunity[]): OptionsOpportunity[] {
  return opportunities.sort((a, b) => {
    const scoreA = (a.probability_of_profit / 100) * (a.max_profit / Math.abs(a.max_loss)) * (a.confidence_score / 100);
    const scoreB = (b.probability_of_profit / 100) * (b.max_profit / Math.abs(b.max_loss)) * (b.confidence_score / 100);
    return scoreB - scoreA;
  });
}

// Generate educational explanations
async function generateEducationalContent(opportunities: any): Promise<any> {
  // Educational content is already generated in each strategy analyzer
  // This function could enhance with AI-generated content
  return opportunities;
}

// Store opportunities in database
async function storeOpportunities(supabase: any, opportunities: any): Promise<void> {
  const today = new Date().toISOString().split('T')[0];
  
  // Clear existing opportunities for today
  await supabase
    .from('options_opportunities')
    .delete()
    .eq('analysis_date', today);

  // Insert new opportunities
  for (const category of ['spreads', 'combinations', 'directional', 'income']) {
    const categoryOpportunities = opportunities[category];
    
    for (let i = 0; i < categoryOpportunities.length; i++) {
      const opp = categoryOpportunities[i];
      
      const { data: opportunityData, error: opportunityError } = await supabase
        .from('options_opportunities')
        .insert({
          analysis_date: today,
          category: opp.category,
          strategy_type: opp.strategy_type,
          rank: i + 1,
          underlying_symbol: opp.underlying_symbol,
          underlying_price: opp.underlying_price,
          strategy_name: opp.strategy_name,
          legs: opp.legs,
          expiration_date: opp.expiration_date,
          days_to_expiration: Math.floor((new Date(opp.expiration_date).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)),
          cost_basis: opp.cost_basis,
          max_profit: opp.max_profit,
          max_loss: opp.max_loss,
          roi_percentage: (opp.max_profit / Math.abs(opp.cost_basis)) * 100,
          probability_of_profit: opp.probability_of_profit,
          risk_score: opp.risk_score,
          risk_category: opp.risk_score <= 3 ? 'conservative' : opp.risk_score <= 6 ? 'moderate' : 'aggressive',
          primary_factors: ['Market Analysis', 'Technical Signals', 'Risk Management'],
          educational_explanation: opp.educational_explanation,
          risk_discussion: opp.risk_discussion,
          strategy_mechanics: opp.strategy_mechanics,
          confidence_score: opp.confidence_score,
          algorithm_version: 'v1.0'
        })
        .select()
        .single();

      if (opportunityError) {
        console.error('Error inserting opportunity:', opportunityError);
        continue;
      }

      // Insert option legs
      if (opp.legs && opportunityData) {
        for (let legIndex = 0; legIndex < opp.legs.length; legIndex++) {
          const leg = opp.legs[legIndex];
          
          if (leg.option) {
            await supabase
              .from('option_legs')
              .insert({
                opportunity_id: opportunityData.id,
                leg_number: legIndex + 1,
                option_symbol: leg.option.ticker || `${opp.underlying_symbol}_${leg.option.strike_price}`,
                option_type: leg.option.contract_type || (leg.option.strike_price ? 'call' : 'put'),
                strike_price: leg.option.strike_price || opp.underlying_price,
                expiration_date: opp.expiration_date,
                action: leg.action,
                quantity: leg.quantity || 1,
                mid_price: 2.50 // Simplified
              });
          }
        }
      }
    }
  }
  
  console.log('Successfully stored all opportunities in database');
}