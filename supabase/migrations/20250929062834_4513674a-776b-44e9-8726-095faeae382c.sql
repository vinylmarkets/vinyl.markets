-- Create trading schema if it doesn't exist
CREATE SCHEMA IF NOT EXISTS trading;

-- Create sector mappings table
CREATE TABLE trading.sector_mappings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    symbol TEXT NOT NULL UNIQUE,
    sector TEXT NOT NULL,
    industry TEXT,
    market_cap_category TEXT CHECK (market_cap_category IN ('mega', 'large', 'mid', 'small')),
    correlation_group TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create correlation matrix table
CREATE TABLE trading.correlation_matrix (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    symbol_a TEXT NOT NULL,
    symbol_b TEXT NOT NULL,
    correlation_coefficient DECIMAL(5,4) NOT NULL CHECK (correlation_coefficient BETWEEN -1 AND 1),
    timeframe TEXT NOT NULL CHECK (timeframe IN ('daily', 'weekly', 'monthly')),
    last_updated TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(symbol_a, symbol_b, timeframe)
);

-- Create sector performance table
CREATE TABLE trading.sector_performance (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    sector TEXT NOT NULL,
    day_change_percent DECIMAL(8,4),
    week_change_percent DECIMAL(8,4),
    relative_strength DECIMAL(6,4),
    leading_stocks JSONB,
    performance_date DATE NOT NULL DEFAULT CURRENT_DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(sector, performance_date)
);

-- Create indexes for better performance
CREATE INDEX idx_sector_mappings_symbol ON trading.sector_mappings(symbol);
CREATE INDEX idx_sector_mappings_sector ON trading.sector_mappings(sector);
CREATE INDEX idx_correlation_matrix_symbols ON trading.correlation_matrix(symbol_a, symbol_b);
CREATE INDEX idx_correlation_matrix_timeframe ON trading.correlation_matrix(timeframe);
CREATE INDEX idx_sector_performance_sector ON trading.sector_performance(sector);
CREATE INDEX idx_sector_performance_date ON trading.sector_performance(performance_date);

-- Enable RLS on tables
ALTER TABLE trading.sector_mappings ENABLE ROW LEVEL SECURITY;
ALTER TABLE trading.correlation_matrix ENABLE ROW LEVEL SECURITY;
ALTER TABLE trading.sector_performance ENABLE ROW LEVEL SECURITY;

-- Create policies to allow reading for authenticated users
CREATE POLICY "Users can read sector mappings" ON trading.sector_mappings FOR SELECT TO authenticated USING (true);
CREATE POLICY "Users can read correlation matrix" ON trading.correlation_matrix FOR SELECT TO authenticated USING (true);
CREATE POLICY "Users can read sector performance" ON trading.sector_performance FOR SELECT TO authenticated USING (true);

-- Allow system/service role to manage all data
CREATE POLICY "System can manage sector mappings" ON trading.sector_mappings FOR ALL TO service_role USING (true);
CREATE POLICY "System can manage correlation matrix" ON trading.correlation_matrix FOR ALL TO service_role USING (true);
CREATE POLICY "System can manage sector performance" ON trading.sector_performance FOR ALL TO service_role USING (true);

-- Insert some sample sector mappings for major stocks
INSERT INTO trading.sector_mappings (symbol, sector, industry, market_cap_category, correlation_group) VALUES
('AAPL', 'Technology', 'Consumer Electronics', 'mega', 'mega_tech'),
('MSFT', 'Technology', 'Software', 'mega', 'mega_tech'),
('GOOGL', 'Technology', 'Internet Services', 'mega', 'mega_tech'),
('AMZN', 'Consumer Discretionary', 'E-commerce', 'mega', 'mega_consumer'),
('TSLA', 'Consumer Discretionary', 'Electric Vehicles', 'large', 'ev_group'),
('NVDA', 'Technology', 'Semiconductors', 'mega', 'semiconductor'),
('META', 'Technology', 'Social Media', 'mega', 'mega_tech'),
('JPM', 'Financial Services', 'Banking', 'mega', 'mega_banks'),
('V', 'Financial Services', 'Payment Processing', 'mega', 'payment_processors'),
('JNJ', 'Healthcare', 'Pharmaceuticals', 'mega', 'pharma_giants'),
('WMT', 'Consumer Staples', 'Retail', 'mega', 'retail_giants'),
('PG', 'Consumer Staples', 'Consumer Goods', 'mega', 'consumer_staples'),
('UNH', 'Healthcare', 'Health Insurance', 'mega', 'healthcare_giants'),
('HD', 'Consumer Discretionary', 'Home Improvement', 'mega', 'retail_giants'),
('MA', 'Financial Services', 'Payment Processing', 'mega', 'payment_processors');

-- Insert sample correlation data (simplified for demonstration)
INSERT INTO trading.correlation_matrix (symbol_a, symbol_b, correlation_coefficient, timeframe) VALUES
('AAPL', 'MSFT', 0.75, 'daily'),
('AAPL', 'GOOGL', 0.68, 'daily'),
('MSFT', 'GOOGL', 0.72, 'daily'),
('V', 'MA', 0.85, 'daily'),
('JPM', 'V', 0.45, 'daily'),
('TSLA', 'NVDA', 0.55, 'daily'),
('JNJ', 'UNH', 0.42, 'daily'),
('WMT', 'PG', 0.38, 'daily');

-- Insert sample sector performance data
INSERT INTO trading.sector_performance (sector, day_change_percent, week_change_percent, relative_strength, leading_stocks) VALUES
('Technology', 1.25, 3.45, 0.85, '["AAPL", "MSFT", "NVDA"]'),
('Financial Services', 0.75, 2.10, 0.65, '["JPM", "V", "MA"]'),
('Healthcare', 0.45, 1.80, 0.55, '["UNH", "JNJ"]'),
('Consumer Discretionary', 1.85, 4.20, 0.78, '["AMZN", "TSLA", "HD"]'),
('Consumer Staples', -0.25, 0.85, 0.45, '["WMT", "PG"]');

-- Create function to update timestamp
CREATE OR REPLACE FUNCTION trading.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for updated_at
CREATE TRIGGER update_sector_mappings_updated_at
    BEFORE UPDATE ON trading.sector_mappings
    FOR EACH ROW
    EXECUTE FUNCTION trading.update_updated_at_column();

CREATE TRIGGER update_sector_performance_updated_at
    BEFORE UPDATE ON trading.sector_performance
    FOR EACH ROW
    EXECUTE FUNCTION trading.update_updated_at_column();