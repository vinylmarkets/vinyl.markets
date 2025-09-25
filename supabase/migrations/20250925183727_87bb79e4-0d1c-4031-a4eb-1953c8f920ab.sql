-- Create remaining tables for TOP 20 Daily Movers system

-- Prediction results table for tracking actual outcomes
CREATE TABLE prediction_results (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    prediction_id UUID REFERENCES enhanced_daily_predictions(id) ON DELETE CASCADE,
    actual_open DECIMAL(10,2),
    actual_high DECIMAL(10,2),
    actual_low DECIMAL(10,2),
    actual_close DECIMAL(10,2),
    actual_volume BIGINT,
    actual_high_time TIME,
    actual_low_time TIME,
    high_accuracy DECIMAL(5,2),
    low_accuracy DECIMAL(5,2),
    close_accuracy DECIMAL(5,2),
    
    -- Performance flags
    direction_correct BOOLEAN,
    hit_predicted_high BOOLEAN,
    hit_predicted_low BOOLEAN,
    hit_predicted_close BOOLEAN,
    
    -- Market context
    market_condition TEXT,
    spy_performance DECIMAL(5,2),
    sector_performance DECIMAL(5,2),
    recorded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Algorithm performance table
CREATE TABLE algorithm_performance (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    date DATE NOT NULL UNIQUE,
    algorithm_version TEXT NOT NULL,
    total_predictions INTEGER DEFAULT 20,
    directional_accuracy DECIMAL(5,2),
    high_accuracy_avg DECIMAL(5,2),
    low_accuracy_avg DECIMAL(5,2),
    close_accuracy_avg DECIMAL(5,2),
    high_within_half_percent INTEGER,
    low_within_half_percent INTEGER,
    close_within_half_percent INTEGER,
    confidence_calibration DECIMAL(5,2),
    average_confidence DECIMAL(5,2),
    confidence_accuracy_correlation DECIMAL(5,2),
    
    -- Market condition performance
    trending_market_accuracy DECIMAL(5,2),
    choppy_market_accuracy DECIMAL(5,2),
    high_volatility_accuracy DECIMAL(5,2),
    low_volatility_accuracy DECIMAL(5,2),
    
    -- Signal effectiveness
    best_performing_signal TEXT,
    worst_performing_signal TEXT,
    signal_performance JSONB,
    pattern_performance JSONB,
    
    -- Timing accuracy
    high_time_accuracy_minutes DECIMAL(5,2),
    low_time_accuracy_minutes DECIMAL(5,2),
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- User interaction tracking
CREATE TABLE prediction_views (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID,
    prediction_date DATE NOT NULL,
    viewed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    interaction_type TEXT,
    predictions_viewed INTEGER[],
    upgraded_during_session BOOLEAN DEFAULT FALSE
);

-- Enable RLS on all new tables
ALTER TABLE prediction_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE algorithm_performance ENABLE ROW LEVEL SECURITY;
ALTER TABLE prediction_views ENABLE ROW LEVEL SECURITY;

-- RLS policies for results (public for transparency)
CREATE POLICY "Anyone can view prediction results" 
ON prediction_results 
FOR SELECT 
USING (true);

-- RLS policies for performance (public for transparency)
CREATE POLICY "Anyone can view algorithm performance" 
ON algorithm_performance 
FOR SELECT 
USING (true);

-- RLS policies for user views (user's own data)
CREATE POLICY "Users can view their own prediction views" 
ON prediction_views 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own prediction views" 
ON prediction_views 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- Create remaining indexes
CREATE INDEX idx_results_prediction_id ON prediction_results(prediction_id);
CREATE INDEX idx_performance_date ON algorithm_performance(date DESC);
CREATE INDEX idx_views_user_date ON prediction_views(user_id, prediction_date DESC);