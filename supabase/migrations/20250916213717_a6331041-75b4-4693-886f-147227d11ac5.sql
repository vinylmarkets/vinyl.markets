-- Create table for daily market analysis data
CREATE TABLE public.daily_market_analysis (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  analysis_date DATE NOT NULL,
  analysis_type TEXT NOT NULL, -- 'short_interest', 'volume_spike', 'price_movement', etc.
  symbol TEXT NOT NULL,
  metric_value NUMERIC NOT NULL,
  metric_name TEXT NOT NULL, -- 'short_interest_ratio', 'volume_change_pct', etc.
  current_price NUMERIC,
  price_change_pct NUMERIC,
  volume BIGINT,
  market_cap BIGINT,
  significance_score NUMERIC NOT NULL DEFAULT 0, -- 0-100 score for how noteworthy this is
  analysis_data JSONB, -- Store additional analysis details
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.daily_market_analysis ENABLE ROW LEVEL SECURITY;

-- Create policies for market analysis data
CREATE POLICY "Market analysis is viewable by everyone" 
ON public.daily_market_analysis 
FOR SELECT 
USING (true);

-- Only system can insert/update market analysis
CREATE POLICY "System can manage market analysis" 
ON public.daily_market_analysis 
FOR ALL 
USING (true);

-- Create indexes for better performance
CREATE INDEX idx_daily_market_analysis_date ON public.daily_market_analysis(analysis_date);
CREATE INDEX idx_daily_market_analysis_symbol ON public.daily_market_analysis(symbol);
CREATE INDEX idx_daily_market_analysis_type ON public.daily_market_analysis(analysis_type);
CREATE INDEX idx_daily_market_analysis_significance ON public.daily_market_analysis(significance_score DESC);

-- Create table for market scanning configurations
CREATE TABLE public.market_scan_config (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  scan_type TEXT NOT NULL,
  parameters JSONB NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.market_scan_config ENABLE ROW LEVEL SECURITY;

-- Create policies for scan config
CREATE POLICY "Scan config is viewable by everyone" 
ON public.market_scan_config 
FOR SELECT 
USING (true);

-- Insert default scan configurations
INSERT INTO public.market_scan_config (scan_type, parameters) VALUES
('short_interest', '{"min_short_ratio": 20, "min_market_cap": 1000000000, "max_results": 10}'),
('volume_spike', '{"min_volume_change": 300, "min_market_cap": 500000000, "max_results": 10}'),
('price_movement', '{"min_price_change": 5, "timeframe": "1d", "max_results": 10}'),
('options_flow', '{"min_unusual_activity": 200, "max_results": 5}'),
('sector_rotation', '{"min_sector_change": 2, "timeframe": "5d", "max_results": 8}');

-- Create trigger for updated_at
CREATE TRIGGER update_daily_market_analysis_updated_at
BEFORE UPDATE ON public.daily_market_analysis
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_market_scan_config_updated_at
BEFORE UPDATE ON public.market_scan_config
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();