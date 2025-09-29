-- Create stock screener tables and functions

-- Stock universe table (filtered stocks that pass basic criteria)
CREATE TABLE IF NOT EXISTS public.stock_universe (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  symbol TEXT NOT NULL,
  company_name TEXT NOT NULL,
  market_cap BIGINT,
  price NUMERIC,
  volume BIGINT,
  average_true_range NUMERIC,
  sector TEXT,
  last_screened TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  UNIQUE(symbol)
);

-- Watchlists table
CREATE TABLE IF NOT EXISTS public.watchlists (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  is_default BOOLEAN NOT NULL DEFAULT false,
  is_system BOOLEAN NOT NULL DEFAULT false,
  watchlist_type TEXT NOT NULL DEFAULT 'custom', -- 'default', 'dynamic', 'sector', 'custom'
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Watchlist items
CREATE TABLE IF NOT EXISTS public.watchlist_items (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  watchlist_id UUID REFERENCES public.watchlists(id) ON DELETE CASCADE,
  symbol TEXT NOT NULL,
  added_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  priority_tier INTEGER NOT NULL DEFAULT 3, -- 1=high freq, 2=medium, 3=low freq
  UNIQUE(watchlist_id, symbol)
);

-- Stock analysis cache
CREATE TABLE IF NOT EXISTS public.stock_analysis_cache (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  symbol TEXT NOT NULL,
  analysis_data JSONB NOT NULL,
  analysis_type TEXT NOT NULL DEFAULT 'technical', -- 'technical', 'fundamental', 'combined'
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  UNIQUE(symbol, analysis_type)
);

-- Universe selection results (top stocks for the day)
CREATE TABLE IF NOT EXISTS public.universe_selection (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  symbol TEXT NOT NULL,
  selection_date DATE NOT NULL DEFAULT CURRENT_DATE,
  selection_reason TEXT NOT NULL, -- 'volume_spike', 'momentum', 'technical_levels', 'sector_leader'
  score NUMERIC NOT NULL,
  rank INTEGER NOT NULL,
  metadata JSONB,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  UNIQUE(symbol, selection_date)
);

-- Enable RLS
ALTER TABLE public.stock_universe ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.watchlists ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.watchlist_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.stock_analysis_cache ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.universe_selection ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Anyone can view stock universe" ON public.stock_universe FOR SELECT USING (true);
CREATE POLICY "System can manage stock universe" ON public.stock_universe FOR ALL USING (true);

CREATE POLICY "Users can view their own watchlists" ON public.watchlists FOR SELECT USING (user_id = auth.uid() OR is_system = true);
CREATE POLICY "Users can create their own watchlists" ON public.watchlists FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY "Users can update their own watchlists" ON public.watchlists FOR UPDATE USING (user_id = auth.uid());
CREATE POLICY "Users can delete their own watchlists" ON public.watchlists FOR DELETE USING (user_id = auth.uid());

CREATE POLICY "Users can view watchlist items for accessible watchlists" ON public.watchlist_items FOR SELECT USING (
  watchlist_id IN (SELECT id FROM public.watchlists WHERE user_id = auth.uid() OR is_system = true)
);
CREATE POLICY "Users can manage items in their watchlists" ON public.watchlist_items FOR ALL USING (
  watchlist_id IN (SELECT id FROM public.watchlists WHERE user_id = auth.uid())
);

CREATE POLICY "Anyone can view analysis cache" ON public.stock_analysis_cache FOR SELECT USING (true);
CREATE POLICY "System can manage analysis cache" ON public.stock_analysis_cache FOR ALL USING (true);

CREATE POLICY "Anyone can view universe selection" ON public.universe_selection FOR SELECT USING (true);
CREATE POLICY "System can manage universe selection" ON public.universe_selection FOR ALL USING (true);

-- Insert initial alpha testing watchlist
INSERT INTO public.watchlists (name, description, is_system, watchlist_type) VALUES
('Alpha Testing Universe', 'Expanded watchlist for alpha testing with 40+ diverse stocks', true, 'default');

-- Get the watchlist ID for inserting items
DO $$
DECLARE
    watchlist_uuid UUID;
BEGIN
    SELECT id INTO watchlist_uuid FROM public.watchlists WHERE name = 'Alpha Testing Universe';
    
    -- Insert alpha testing stocks
    INSERT INTO public.watchlist_items (watchlist_id, symbol, priority_tier) VALUES
    -- Tech Megacaps (Tier 1 - highest priority)
    (watchlist_uuid, 'AAPL', 1),
    (watchlist_uuid, 'MSFT', 1),
    (watchlist_uuid, 'GOOGL', 1),
    (watchlist_uuid, 'AMZN', 1),
    (watchlist_uuid, 'NVDA', 1),
    (watchlist_uuid, 'META', 1),
    (watchlist_uuid, 'TSLA', 1),
    
    -- Semiconductors (Tier 2)
    (watchlist_uuid, 'AMD', 2),
    (watchlist_uuid, 'INTC', 2),
    (watchlist_uuid, 'MU', 2),
    (watchlist_uuid, 'QCOM', 2),
    (watchlist_uuid, 'AVGO', 2),
    (watchlist_uuid, 'MRVL', 2),
    
    -- Finance (Tier 2)
    (watchlist_uuid, 'JPM', 2),
    (watchlist_uuid, 'BAC', 2),
    (watchlist_uuid, 'WFC', 2),
    (watchlist_uuid, 'GS', 2),
    (watchlist_uuid, 'MS', 2),
    (watchlist_uuid, 'V', 2),
    (watchlist_uuid, 'MA', 2),
    
    -- Healthcare (Tier 2)
    (watchlist_uuid, 'JNJ', 2),
    (watchlist_uuid, 'UNH', 2),
    (watchlist_uuid, 'PFE', 2),
    (watchlist_uuid, 'LLY', 2),
    (watchlist_uuid, 'ABBV', 2),
    
    -- Energy (Tier 3)
    (watchlist_uuid, 'XOM', 3),
    (watchlist_uuid, 'CVX', 3),
    (watchlist_uuid, 'COP', 3),
    (watchlist_uuid, 'OXY', 3),
    
    -- ETFs (Tier 1)
    (watchlist_uuid, 'SPY', 1),
    (watchlist_uuid, 'QQQ', 1),
    (watchlist_uuid, 'IWM', 2),
    (watchlist_uuid, 'DIA', 2),
    (watchlist_uuid, 'ARKK', 2),
    (watchlist_uuid, 'XLF', 3),
    (watchlist_uuid, 'XLE', 3),
    
    -- High Volatility (Tier 3)
    (watchlist_uuid, 'COIN', 3),
    (watchlist_uuid, 'PLTR', 3),
    (watchlist_uuid, 'RIVN', 3),
    (watchlist_uuid, 'LCID', 3),
    (watchlist_uuid, 'GME', 3),
    (watchlist_uuid, 'AMC', 3);
END $$;

-- Create function to clean expired analysis cache
CREATE OR REPLACE FUNCTION public.clean_expired_analysis_cache()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    DELETE FROM public.stock_analysis_cache WHERE expires_at < NOW();
END;
$$;

-- Create function to get user's active watchlists
CREATE OR REPLACE FUNCTION public.get_user_watchlists(target_user_id UUID DEFAULT auth.uid())
RETURNS TABLE(
    id UUID,
    name TEXT,
    description TEXT,
    is_default BOOLEAN,
    is_system BOOLEAN,
    watchlist_type TEXT,
    symbol_count BIGINT
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    RETURN QUERY
    SELECT 
        w.id,
        w.name,
        w.description,
        w.is_default,
        w.is_system,
        w.watchlist_type,
        COUNT(wi.symbol) as symbol_count
    FROM public.watchlists w
    LEFT JOIN public.watchlist_items wi ON w.id = wi.watchlist_id
    WHERE w.user_id = target_user_id OR w.is_system = true
    GROUP BY w.id, w.name, w.description, w.is_default, w.is_system, w.watchlist_type
    ORDER BY w.is_system DESC, w.is_default DESC, w.created_at DESC;
END;
$$;

-- Create triggers for updated_at
CREATE TRIGGER update_stock_universe_updated_at
    BEFORE UPDATE ON public.stock_universe
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_watchlists_updated_at
    BEFORE UPDATE ON public.watchlists
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();