-- Options Value Tool Database Schema

-- Core options opportunities table
CREATE TABLE options_opportunities (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    analysis_date DATE NOT NULL,
    category TEXT NOT NULL CHECK (category IN ('spreads', 'combinations', 'directional', 'income')),
    strategy_type TEXT NOT NULL,
    rank INTEGER NOT NULL CHECK (rank BETWEEN 1 AND 20),
    underlying_symbol TEXT NOT NULL,
    underlying_price DECIMAL(10,2) NOT NULL,
    underlying_iv_rank INTEGER,
    underlying_volume BIGINT,
    after_hours_change DECIMAL(5,2),
    strategy_name TEXT NOT NULL,
    legs JSONB NOT NULL,
    expiration_date DATE NOT NULL,
    days_to_expiration INTEGER NOT NULL,
    cost_basis DECIMAL(10,2) NOT NULL,
    max_profit DECIMAL(10,2) NOT NULL,
    max_loss DECIMAL(10,2) NOT NULL,
    breakeven_points JSONB,
    roi_percentage DECIMAL(8,2),
    risk_adjusted_return DECIMAL(8,2),
    probability_weighted_return DECIMAL(8,2),
    probability_of_profit DECIMAL(5,2),
    probability_of_max_profit DECIMAL(5,2),
    probability_of_max_loss DECIMAL(5,2),
    expected_value DECIMAL(10,2),
    
    -- Greeks
    delta DECIMAL(8,4),
    gamma DECIMAL(8,4),
    theta DECIMAL(8,4),
    vega DECIMAL(8,4),
    rho DECIMAL(8,4),
    
    -- Risk metrics
    risk_score INTEGER CHECK (risk_score BETWEEN 1 AND 10),
    risk_category TEXT CHECK (risk_category IN ('conservative', 'moderate', 'aggressive')),
    margin_requirement DECIMAL(10,2),
    
    -- Volatility metrics
    implied_volatility DECIMAL(6,2),
    historical_volatility DECIMAL(6,2),
    iv_percentile INTEGER, -- 0-100
    volatility_skew DECIMAL(6,2),
    
    -- Signal strengths (0-1 scale)
    volume_signal DECIMAL(3,2),
    volatility_signal DECIMAL(3,2),
    technical_signal DECIMAL(3,2),
    flow_signal DECIMAL(3,2),
    value_signal DECIMAL(3,2),
    
    -- Educational content
    primary_factors JSONB NOT NULL, -- Top 3 reasons for opportunity
    educational_explanation TEXT NOT NULL,
    risk_discussion TEXT NOT NULL,
    strategy_mechanics TEXT NOT NULL,
    
    -- Algorithm metadata
    confidence_score INTEGER CHECK (confidence_score BETWEEN 0 AND 100),
    model_agreement DECIMAL(3,2), -- 0-1 consensus between models
    algorithm_version TEXT DEFAULT 'v1.0',
    processing_time_ms INTEGER,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Constraints
    UNIQUE(analysis_date, category, rank)
);

-- Individual option legs detail table
CREATE TABLE option_legs (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    opportunity_id UUID REFERENCES options_opportunities(id) ON DELETE CASCADE,
    leg_number INTEGER NOT NULL,
    
    -- Option details
    option_symbol TEXT NOT NULL,
    option_type TEXT CHECK (option_type IN ('call', 'put')),
    strike_price DECIMAL(10,2) NOT NULL,
    expiration_date DATE NOT NULL,
    
    -- Position details
    action TEXT CHECK (action IN ('buy', 'sell')),
    quantity INTEGER NOT NULL,
    
    -- Pricing
    bid DECIMAL(10,2),
    ask DECIMAL(10,2),
    mid_price DECIMAL(10,2),
    last_price DECIMAL(10,2),
    
    -- Volume & OI
    volume INTEGER,
    open_interest INTEGER,
    
    -- Individual Greeks
    delta DECIMAL(8,4),
    gamma DECIMAL(8,4),
    theta DECIMAL(8,4),
    vega DECIMAL(8,4),
    implied_volatility DECIMAL(6,2),
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Performance tracking table
CREATE TABLE options_performance (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    opportunity_id UUID REFERENCES options_opportunities(id) ON DELETE CASCADE,
    
    -- Tracking points
    track_date DATE NOT NULL,
    days_since_entry INTEGER,
    days_to_expiration INTEGER,
    
    -- Price tracking
    underlying_price DECIMAL(10,2),
    strategy_value DECIMAL(10,2), -- Current value of position
    unrealized_pnl DECIMAL(10,2),
    unrealized_pnl_percentage DECIMAL(8,2),
    
    -- Greeks evolution
    current_delta DECIMAL(8,4),
    current_gamma DECIMAL(8,4),
    current_theta DECIMAL(8,4),
    current_vega DECIMAL(8,4),
    
    -- Status flags
    hit_profit_target BOOLEAN DEFAULT FALSE,
    hit_stop_loss BOOLEAN DEFAULT FALSE,
    early_exit_signal BOOLEAN DEFAULT FALSE,
    
    -- Final outcomes (at expiration or exit)
    is_expired BOOLEAN DEFAULT FALSE,
    final_status TEXT, -- 'max_profit', 'max_loss', 'partial_profit', 'partial_loss'
    realized_pnl DECIMAL(10,2),
    realized_roi DECIMAL(8,2),
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Options market data cache
CREATE TABLE options_market_data (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    symbol TEXT NOT NULL,
    expiration_date DATE NOT NULL,
    strike_price DECIMAL(10,2) NOT NULL,
    option_type TEXT CHECK (option_type IN ('call', 'put')),
    bid DECIMAL(10,2),
    ask DECIMAL(10,2),
    last_price DECIMAL(10,2),
    volume BIGINT,
    open_interest BIGINT,
    
    -- Greeks
    delta DECIMAL(8,4),
    gamma DECIMAL(8,4),
    theta DECIMAL(8,4),
    vega DECIMAL(8,4),
    rho DECIMAL(8,4),
    
    -- IV metrics
    implied_volatility DECIMAL(6,2),
    
    -- Metadata
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    UNIQUE(symbol, expiration_date, strike_price, option_type)
);

-- Unusual options activity tracking
CREATE TABLE unusual_options_activity (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    detection_date DATE NOT NULL,
    symbol TEXT NOT NULL,
    
    -- Activity details
    option_symbol TEXT NOT NULL,
    strike_price DECIMAL(10,2),
    expiration_date DATE,
    option_type TEXT,
    
    -- Unusual metrics
    volume_ratio DECIMAL(8,2), -- Volume / Avg Volume
    volume_oi_ratio DECIMAL(8,2), -- Volume / Open Interest
    trade_size INTEGER,
    trade_price DECIMAL(10,2),
    
    -- Sentiment
    sentiment TEXT CHECK (sentiment IN ('bullish', 'bearish', 'neutral')),
    aggressor TEXT CHECK (aggressor IN ('buyer', 'seller', 'mixed')),
    
    -- Significance
    significance_score INTEGER CHECK (significance_score BETWEEN 1 AND 10),
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Algorithm performance analytics
CREATE TABLE options_algorithm_performance (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    date DATE NOT NULL UNIQUE,
    
    -- Category performance
    spreads_accuracy DECIMAL(5,2),
    combinations_accuracy DECIMAL(5,2),
    directional_accuracy DECIMAL(5,2),
    income_accuracy DECIMAL(5,2),
    
    -- Overall metrics
    total_opportunities INTEGER,
    profitable_count INTEGER,
    loss_count INTEGER,
    win_rate DECIMAL(5,2),
    
    -- Return metrics
    average_roi DECIMAL(8,2),
    best_roi DECIMAL(8,2),
    worst_roi DECIMAL(8,2),
    sharpe_ratio DECIMAL(8,4),
    
    -- Probability accuracy
    probability_calibration DECIMAL(5,2),
    
    -- Signal effectiveness
    best_signal_type TEXT,
    worst_signal_type TEXT,
    signal_performance JSONB,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- User interactions with options opportunities
CREATE TABLE options_user_interactions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    opportunity_id UUID REFERENCES options_opportunities(id),
    interaction_type TEXT, -- 'view', 'analyze', 'education_request'
    interaction_time TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Risk acknowledgment
    risk_disclaimer_accepted BOOLEAN DEFAULT FALSE,
    education_module_suggested BOOLEAN DEFAULT FALSE
);

-- Create indexes for performance
CREATE INDEX idx_opportunities_date_category ON options_opportunities(analysis_date DESC, category);
CREATE INDEX idx_opportunities_symbol ON options_opportunities(underlying_symbol);
CREATE INDEX idx_legs_opportunity ON option_legs(opportunity_id);
CREATE INDEX idx_performance_opportunity_date ON options_performance(opportunity_id, track_date);
CREATE INDEX idx_market_data_lookup ON options_market_data(symbol, expiration_date, strike_price, option_type);
CREATE INDEX idx_unusual_activity_date ON unusual_options_activity(detection_date DESC);

-- Enable RLS on all tables
ALTER TABLE options_opportunities ENABLE ROW LEVEL SECURITY;
ALTER TABLE option_legs ENABLE ROW LEVEL SECURITY;
ALTER TABLE options_performance ENABLE ROW LEVEL SECURITY;
ALTER TABLE options_market_data ENABLE ROW LEVEL SECURITY;
ALTER TABLE unusual_options_activity ENABLE ROW LEVEL SECURITY;
ALTER TABLE options_algorithm_performance ENABLE ROW LEVEL SECURITY;
ALTER TABLE options_user_interactions ENABLE ROW LEVEL SECURITY;

-- RLS Policies

-- Options opportunities - tiered access
CREATE POLICY "Free users can view basic opportunities" ON options_opportunities
FOR SELECT USING (
    rank >= 11 OR 
    get_current_user_subscription_tier() IN ('essential', 'pro')
);

-- Premium users get all opportunities
CREATE POLICY "Premium users can view all opportunities" ON options_opportunities
FOR SELECT USING (get_current_user_subscription_tier() IN ('essential', 'pro'));

-- Option legs - follow parent opportunity access
CREATE POLICY "Users can view option legs for accessible opportunities" ON option_legs
FOR SELECT USING (
    opportunity_id IN (
        SELECT id FROM options_opportunities 
        WHERE rank >= 11 OR get_current_user_subscription_tier() IN ('essential', 'pro')
    )
);

-- Performance data - public read
CREATE POLICY "Anyone can view performance data" ON options_performance
FOR SELECT USING (true);

-- Market data - public read
CREATE POLICY "Anyone can view market data" ON options_market_data
FOR SELECT USING (true);

-- Unusual activity - public read
CREATE POLICY "Anyone can view unusual activity" ON unusual_options_activity
FOR SELECT USING (true);

-- Algorithm performance - public read
CREATE POLICY "Anyone can view algorithm performance" ON options_algorithm_performance
FOR SELECT USING (true);

-- User interactions - users can manage their own
CREATE POLICY "Users can manage their own interactions" ON options_user_interactions
FOR ALL USING (auth.uid() = user_id);

-- Admin can manage all data
CREATE POLICY "Admins can manage all options data" ON options_opportunities
FOR ALL USING (is_current_user_admin());

CREATE POLICY "Admins can manage all option legs" ON option_legs
FOR ALL USING (is_current_user_admin());

CREATE POLICY "Admins can manage all performance data" ON options_performance
FOR ALL USING (is_current_user_admin());

CREATE POLICY "Admins can manage all market data" ON options_market_data
FOR ALL USING (is_current_user_admin());

CREATE POLICY "Admins can manage unusual activity" ON unusual_options_activity
FOR ALL USING (is_current_user_admin());

CREATE POLICY "Admins can manage algorithm performance" ON options_algorithm_performance
FOR ALL USING (is_current_user_admin());