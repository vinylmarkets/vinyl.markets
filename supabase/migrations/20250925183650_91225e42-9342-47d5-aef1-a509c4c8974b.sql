-- Enhanced daily predictions table
CREATE TABLE enhanced_daily_predictions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    prediction_date DATE NOT NULL,
    rank INTEGER NOT NULL CHECK (rank BETWEEN 1 AND 20),
    symbol TEXT NOT NULL,
    company_name TEXT NOT NULL,
    
    -- Current price data
    previous_close DECIMAL(10,2) NOT NULL,
    premarket_price DECIMAL(10,2),
    premarket_volume BIGINT,
    
    -- Price predictions
    predicted_high DECIMAL(10,2) NOT NULL,
    predicted_low DECIMAL(10,2) NOT NULL,
    predicted_close DECIMAL(10,2) NOT NULL,
    
    -- Confidence scores (as percentages)
    high_confidence INTEGER CHECK (high_confidence BETWEEN 0 AND 100),
    low_confidence INTEGER CHECK (low_confidence BETWEEN 0 AND 100),
    close_confidence INTEGER CHECK (close_confidence BETWEEN 0 AND 100),
    overall_confidence INTEGER GENERATED ALWAYS AS 
        ((high_confidence + low_confidence + close_confidence) / 3) STORED,
    
    -- Performance metrics
    expected_gain_percentage DECIMAL(5,2) NOT NULL,
    expected_gain_dollars DECIMAL(10,2),
    volatility_estimate DECIMAL(5,2),
    risk_score INTEGER CHECK (risk_score BETWEEN 1 AND 10),
    
    -- Timing predictions
    estimated_high_time TIME,
    estimated_low_time TIME,
    market_phase_prediction TEXT,
    
    -- Signal strengths (0-1 scale)
    premarket_signal_strength DECIMAL(3,2),
    technical_signal_strength DECIMAL(3,2),
    options_signal_strength DECIMAL(3,2),
    microstructure_signal_strength DECIMAL(3,2),
    market_context_strength DECIMAL(3,2),
    news_sentiment_strength DECIMAL(3,2),
    
    -- Algorithm details
    primary_factors JSONB NOT NULL,
    all_signals JSONB NOT NULL,
    explanation TEXT NOT NULL,
    methodology_notes TEXT,
    
    -- Model consensus
    model_agreement_score DECIMAL(3,2),
    models_used TEXT[],
    
    -- Metadata
    algorithm_version TEXT NOT NULL DEFAULT 'v1.0',
    processing_time_ms INTEGER,
    data_quality_score INTEGER,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Constraints
    UNIQUE(prediction_date, rank),
    UNIQUE(prediction_date, symbol)
);

-- Enable RLS and create policies
ALTER TABLE enhanced_daily_predictions ENABLE ROW LEVEL SECURITY;

-- Anyone can view predictions 11-20 (free tier)
CREATE POLICY "Anyone can view predictions 11-20" 
ON enhanced_daily_predictions 
FOR SELECT 
USING (rank >= 11);

-- Premium users can view TOP 10 predictions
CREATE POLICY "Premium users can view TOP 10 predictions" 
ON enhanced_daily_predictions 
FOR SELECT 
USING (rank <= 10 AND public.get_current_user_subscription_tier() IN ('essential', 'pro'));

-- Create indexes
CREATE INDEX idx_predictions_date_rank ON enhanced_daily_predictions(prediction_date DESC, rank);
CREATE INDEX idx_predictions_symbol_date ON enhanced_daily_predictions(symbol, prediction_date DESC);