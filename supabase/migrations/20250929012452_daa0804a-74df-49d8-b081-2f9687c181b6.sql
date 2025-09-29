-- Create market_data table in trading schema
CREATE TABLE IF NOT EXISTS trading.market_data (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    symbol TEXT NOT NULL,
    current_price NUMERIC NOT NULL,
    volume BIGINT,
    previous_close NUMERIC,
    change_percent NUMERIC,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add index for performance
CREATE INDEX IF NOT EXISTS idx_market_data_symbol_timestamp ON trading.market_data(symbol, timestamp DESC);

-- Enable RLS
ALTER TABLE trading.market_data ENABLE ROW LEVEL SECURITY;

-- Create policy for admin access
CREATE POLICY "Admins can manage market data" ON trading.market_data
FOR ALL USING (
  EXISTS (
    SELECT 1 FROM public.users 
    WHERE id = auth.uid() AND role = 'admin'
  )
);

-- Create policy for public read access (market data should be readable)
CREATE POLICY "Anyone can read market data" ON trading.market_data
FOR SELECT USING (true);