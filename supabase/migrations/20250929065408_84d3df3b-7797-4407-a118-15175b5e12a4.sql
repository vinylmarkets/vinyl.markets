-- Create market narrative data table
CREATE TABLE IF NOT EXISTS trading.market_narrative_data (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    date DATE NOT NULL UNIQUE,
    sector_performances JSONB DEFAULT '{}',
    top_movers JSONB DEFAULT '{}',
    unusual_volume JSONB DEFAULT '{}',
    correlation_breaks JSONB DEFAULT '{}',
    signal_summary JSONB DEFAULT '{}',
    market_regime TEXT DEFAULT 'neutral',
    analysis_timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create daily articles table
CREATE TABLE IF NOT EXISTS trading.daily_articles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    publish_date DATE NOT NULL,
    headline TEXT NOT NULL,
    summary TEXT NOT NULL,
    full_article TEXT NOT NULL,
    key_themes JSONB DEFAULT '[]',
    mentioned_symbols TEXT[] DEFAULT '{}',
    email_sent BOOLEAN DEFAULT FALSE,
    view_count INTEGER DEFAULT 0,
    engagement_score DECIMAL(5,2) DEFAULT 0,
    generated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    published_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_market_narrative_date ON trading.market_narrative_data(date);
CREATE INDEX IF NOT EXISTS idx_daily_articles_date ON trading.daily_articles(publish_date);
CREATE INDEX IF NOT EXISTS idx_daily_articles_published ON trading.daily_articles(published_at) WHERE published_at IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_daily_articles_symbols ON trading.daily_articles USING GIN(mentioned_symbols);

-- Create trigger for updating updated_at timestamp
CREATE OR REPLACE FUNCTION trading.update_daily_articles_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_daily_articles_updated_at
    BEFORE UPDATE ON trading.daily_articles
    FOR EACH ROW
    EXECUTE FUNCTION trading.update_daily_articles_updated_at();