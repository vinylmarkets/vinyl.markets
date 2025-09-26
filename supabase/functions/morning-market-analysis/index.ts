import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.57.4';

const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Top 50 most traded stocks for analysis
const TOP_STOCKS = [
  { symbol: 'AAPL', name: 'Apple Inc.' },
  { symbol: 'MSFT', name: 'Microsoft Corporation' },
  { symbol: 'NVDA', name: 'NVIDIA Corporation' },
  { symbol: 'GOOGL', name: 'Alphabet Inc.' },
  { symbol: 'AMZN', name: 'Amazon.com Inc.' },
  { symbol: 'META', name: 'Meta Platforms Inc.' },
  { symbol: 'TSLA', name: 'Tesla Inc.' },
  { symbol: 'AVGO', name: 'Broadcom Inc.' },
  { symbol: 'WMT', name: 'Walmart Inc.' },
  { symbol: 'LLY', name: 'Eli Lilly and Company' },
  { symbol: 'JPM', name: 'JPMorgan Chase & Co.' },
  { symbol: 'UNH', name: 'UnitedHealth Group Inc.' },
  { symbol: 'XOM', name: 'Exxon Mobil Corporation' },
  { symbol: 'V', name: 'Visa Inc.' },
  { symbol: 'PG', name: 'Procter & Gamble Company' },
  { symbol: 'MA', name: 'Mastercard Incorporated' },
  { symbol: 'JNJ', name: 'Johnson & Johnson' },
  { symbol: 'HD', name: 'Home Depot Inc.' },
  { symbol: 'COST', name: 'Costco Wholesale Corporation' },
  { symbol: 'NFLX', name: 'Netflix Inc.' },
  { symbol: 'CRM', name: 'Salesforce Inc.' },
  { symbol: 'BAC', name: 'Bank of America Corporation' },
  { symbol: 'ABBV', name: 'AbbVie Inc.' },
  { symbol: 'CVX', name: 'Chevron Corporation' },
  { symbol: 'KO', name: 'Coca-Cola Company' },
  { symbol: 'AMD', name: 'Advanced Micro Devices Inc.' },
  { symbol: 'PEP', name: 'PepsiCo Inc.' },
  { symbol: 'TMO', name: 'Thermo Fisher Scientific Inc.' },
  { symbol: 'LIN', name: 'Linde plc' },
  { symbol: 'ADBE', name: 'Adobe Inc.' },
  { symbol: 'MRK', name: 'Merck & Co. Inc.' },
  { symbol: 'WFC', name: 'Wells Fargo & Company' },
  { symbol: 'ABT', name: 'Abbott Laboratories' },
  { symbol: 'CSCO', name: 'Cisco Systems Inc.' },
  { symbol: 'TXN', name: 'Texas Instruments Incorporated' },
  { symbol: 'VZ', name: 'Verizon Communications Inc.' },
  { symbol: 'ORCL', name: 'Oracle Corporation' },
  { symbol: 'COP', name: 'ConocoPhillips' },
  { symbol: 'NOW', name: 'ServiceNow Inc.' },
  { symbol: 'DHR', name: 'Danaher Corporation' },
  { symbol: 'DIS', name: 'Walt Disney Company' },
  { symbol: 'PM', name: 'Philip Morris International Inc.' },
  { symbol: 'INTC', name: 'Intel Corporation' },
  { symbol: 'GE', name: 'General Electric Company' },
  { symbol: 'TT', name: 'Trane Technologies plc' },
  { symbol: 'IBM', name: 'International Business Machines Corporation' },
  { symbol: 'CAT', name: 'Caterpillar Inc.' },
  { symbol: 'QCOM', name: 'Qualcomm Incorporated' },
  { symbol: 'UBER', name: 'Uber Technologies Inc.' },
  { symbol: 'GS', name: 'Goldman Sachs Group Inc.' }
];

interface PredictionData {
  symbol: string;
  company_name: string;
  rank: number;
  prediction_date: string;
  previous_close: number;
  predicted_high: number;
  predicted_low: number;
  predicted_close: number;
  high_confidence: number;
  low_confidence: number;
  close_confidence: number;
  overall_confidence: number;
  expected_gain_percentage: number;
  volatility_estimate: number;
  risk_score: number;
  technical_signal_strength: number;
  news_sentiment_strength: number;
  market_context_strength: number;
  options_signal_strength: number;
  microstructure_signal_strength: number;
  premarket_signal_strength: number;
  explanation: string;
  methodology_notes: string;
  primary_factors: object;
  all_signals: object;
  algorithm_version: string;
}

async function generateMarketAnalysis(stocks: typeof TOP_STOCKS): Promise<PredictionData[]> {
  const today = new Date().toISOString().split('T')[0];
  
  console.log('Generating market analysis for', stocks.length, 'stocks');
  console.log('OpenAI API Key exists:', !!openAIApiKey);
  
  // For now, generate mock predictions to ensure the system works
  console.log('Generating mock predictions for testing...');
  
  const mockPredictions = TOP_STOCKS.slice(0, 20).map((stock, index) => {
    const basePrice = stock.symbol === 'AAPL' ? 185 : 
                     stock.symbol === 'MSFT' ? 350 :
                     stock.symbol === 'NVDA' ? 420 :
                     stock.symbol === 'GOOGL' ? 140 :
                     stock.symbol === 'AMZN' ? 165 :
                     100 + Math.random() * 200;
    
    const gainPct = (Math.random() - 0.5) * 8; // -4% to +4%
    const predictedClose = basePrice * (1 + gainPct / 100);
    const volatility = Math.random() * 3 + 1; // 1-4%
    
    return {
      symbol: stock.symbol,
      company_name: stock.name,
      rank: index + 1,
      prediction_date: today,
      previous_close: Math.round(basePrice * 100) / 100,
      predicted_high: Math.round((basePrice * (1 + volatility / 100)) * 100) / 100,
      predicted_low: Math.round((basePrice * (1 - volatility / 100)) * 100) / 100,
      predicted_close: Math.round(predictedClose * 100) / 100,
      high_confidence: Math.floor(Math.random() * 25) + 70, // 70-95
      low_confidence: Math.floor(Math.random() * 25) + 70,
      close_confidence: Math.floor(Math.random() * 25) + 70,
      overall_confidence: Math.floor(Math.random() * 25) + 70,
      expected_gain_percentage: Math.round(gainPct * 100) / 100,
      volatility_estimate: Math.round(volatility * 100) / 100,
      risk_score: Math.floor(Math.random() * 8) + 2, // 2-10
      technical_signal_strength: Math.random() * 0.5 + 0.5, // 0.5-1.0
      news_sentiment_strength: Math.random() * 0.5 + 0.5,
      market_context_strength: Math.random() * 0.5 + 0.5,
      options_signal_strength: Math.random() * 0.5 + 0.5,
      microstructure_signal_strength: Math.random() * 0.5 + 0.5,
      premarket_signal_strength: Math.random() * 0.5 + 0.5,
      explanation: `${stock.symbol} shows ${gainPct > 0 ? 'bullish' : 'bearish'} momentum with ${volatility > 2.5 ? 'high' : 'moderate'} volatility expected.`,
      methodology_notes: "Mock predictions generated for system testing. Real AI analysis will be implemented once system is verified.",
      primary_factors: {
        technical_setup: gainPct > 0 ? "Bullish pattern" : "Bearish pattern",
        sentiment: gainPct > 0 ? "Positive" : "Neutral",
        volatility: volatility > 2.5 ? "High" : "Moderate"
      },
      all_signals: {
        rsi: Math.round((Math.random() * 40 + 30) * 10) / 10, // 30-70
        macd_signal: gainPct > 0 ? "bullish" : "bearish",
        volume_trend: Math.random() > 0.5 ? "increasing" : "decreasing"
      },
      algorithm_version: 'v1.0',
      estimated_high_time: `${Math.floor(Math.random() * 6) + 10}:${Math.floor(Math.random() * 60).toString().padStart(2, '0')}:00`,
      estimated_low_time: `${Math.floor(Math.random() * 6) + 10}:${Math.floor(Math.random() * 60).toString().padStart(2, '0')}:00`,
      models_used: ['technical_analysis', 'sentiment_analysis', 'options_flow', 'market_microstructure'],
      data_quality_score: Math.floor(Math.random() * 20) + 80,
      processing_time_ms: Math.floor(Math.random() * 500) + 200,
      model_agreement_score: Math.random() * 0.3 + 0.7,
    };
  });
  
  console.log('Generated', mockPredictions.length, 'mock predictions');
  return mockPredictions;
}

async function savePredictionsToDatabase(predictions: PredictionData[]) {
  console.log('Saving predictions to database:', predictions.length, 'records');
  
  const { error } = await supabase
    .from('enhanced_daily_predictions')
    .insert(predictions);
    
  if (error) {
    console.error('Database error:', error);
    throw error;
  }
  
  console.log('Successfully saved predictions to database');
}

async function calculateAlgorithmPerformance(targetDate: string) {
  console.log('Calculating algorithm performance for:', targetDate);
  
  const { error } = await supabase.rpc('calculate_daily_algorithm_performance', {
    target_date: targetDate
  });
  
  if (error) {
    console.error('Error calculating algorithm performance:', error);
  } else {
    console.log('Algorithm performance calculated successfully');
  }
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('Starting morning market analysis...');
    console.log('Environment check:', {
      supabaseUrl: !!supabaseUrl,
      supabaseServiceKey: !!supabaseServiceKey,
      openAIApiKey: !!openAIApiKey
    });
    
    const startTime = Date.now();
    
    // Check if predictions already exist for today
    const today = new Date().toISOString().split('T')[0];
    console.log('Checking for existing predictions for:', today);
    
    const { data: existingPredictions, error: checkError } = await supabase
      .from('enhanced_daily_predictions')
      .select('id')
      .eq('prediction_date', today)
      .limit(1);
      
    if (checkError) {
      console.error('Error checking existing predictions:', checkError);
      throw new Error(`Database error: ${checkError.message}`);
    }
      
    if (existingPredictions && existingPredictions.length > 0) {
      console.log('Predictions already exist for today:', today);
      return new Response(JSON.stringify({ 
        success: false,
        message: 'Predictions already exist for today',
        date: today,
        existing_count: existingPredictions.length
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    console.log('No existing predictions found, generating new ones...');
    
    // Generate new predictions
    const predictions = await generateMarketAnalysis(TOP_STOCKS);
    console.log('Generated', predictions.length, 'predictions');
    
    // Save to database
    await savePredictionsToDatabase(predictions);
    console.log('Predictions saved to database successfully');
    
    // Calculate algorithm performance for yesterday (if data exists)
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toISOString().split('T')[0];
    console.log('Calculating algorithm performance for:', yesterdayStr);
    await calculateAlgorithmPerformance(yesterdayStr);
    
    const executionTime = Date.now() - startTime;
    console.log(`Morning analysis completed in ${executionTime}ms`);
    
    return new Response(JSON.stringify({ 
      success: true,
      message: 'Morning market analysis completed successfully',
      predictions_generated: predictions.length,
      execution_time_ms: executionTime,
      date: today
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in morning market analysis:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('Error details:', errorMessage);
    
    return new Response(JSON.stringify({ 
      success: false,
      error: 'Failed to generate morning analysis',
      details: errorMessage
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});