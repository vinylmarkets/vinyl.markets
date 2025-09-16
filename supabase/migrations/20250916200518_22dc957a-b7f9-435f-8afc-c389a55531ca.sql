-- Create briefings table with dual-mode content support
CREATE TABLE public.briefings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('macro-economic', 'individual-stock', 'market-structure', 'alternative-investments', 'historical-patterns')),
  academic_content TEXT NOT NULL,
  plain_speak_content TEXT NOT NULL,
  executive_summary TEXT NOT NULL,
  chart_config JSONB,
  educational_principle JSONB,
  stocks_mentioned TEXT[],
  methodology_notes TEXT,
  risk_disclaimers TEXT,
  related_resources TEXT[],
  publication_date TIMESTAMP WITH TIME ZONE NOT NULL,
  published BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create user stock follows table
CREATE TABLE public.user_stock_follows (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  stock_symbol TEXT NOT NULL,
  followed_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, stock_symbol)
);

-- Create briefing views tracking table
CREATE TABLE public.briefing_views (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  briefing_id UUID NOT NULL REFERENCES public.briefings(id) ON DELETE CASCADE,
  reading_mode TEXT CHECK (reading_mode IN ('academic', 'plain_speak')),
  viewed_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  reading_time_seconds INTEGER,
  completed_reading BOOLEAN DEFAULT false
);

-- Create briefing categories lookup table
CREATE TABLE public.briefing_categories (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  daily_target INTEGER NOT NULL DEFAULT 2
);

-- Insert default categories
INSERT INTO public.briefing_categories (id, name, description, daily_target) VALUES
('macro-economic', 'Macro-Economic Analysis', 'Global economic indicators, Federal Reserve policy, currency movements', 3),
('individual-stock', 'Individual Stock Analysis', 'Technical patterns, earnings analysis, company developments', 4),
('market-structure', 'Market Structure & Conditions', 'Market sentiment, volatility analysis, trend patterns', 2),
('alternative-investments', 'Alternative Investments & Emerging Trends', 'ESG, cryptocurrency, commodities, emerging markets', 1),
('historical-patterns', 'Historical Pattern Analysis', 'Seasonal patterns, precedent analysis, long-term trends', 1);

-- Enable RLS on all tables
ALTER TABLE public.briefings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_stock_follows ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.briefing_views ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.briefing_categories ENABLE ROW LEVEL SECURITY;

-- Create policies for briefings (publicly readable)
CREATE POLICY "Briefings are viewable by everyone" 
ON public.briefings FOR SELECT USING (published = true);

CREATE POLICY "Admin can manage briefings" 
ON public.briefings FOR ALL USING (
  EXISTS (
    SELECT 1 FROM public.users 
    WHERE users.id = auth.uid() 
    AND users.role = 'admin'
  )
);

-- Create policies for user stock follows
CREATE POLICY "Users can view their own stock follows" 
ON public.user_stock_follows FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can manage their own stock follows" 
ON public.user_stock_follows FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own stock follows" 
ON public.user_stock_follows FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own stock follows" 
ON public.user_stock_follows FOR DELETE USING (auth.uid() = user_id);

-- Create policies for briefing views
CREATE POLICY "Users can view their own briefing views" 
ON public.briefing_views FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own briefing views" 
ON public.briefing_views FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Create policies for categories (publicly readable)
CREATE POLICY "Categories are viewable by everyone" 
ON public.briefing_categories FOR SELECT USING (true);

-- Create indexes for better performance
CREATE INDEX idx_briefings_publication_date ON public.briefings(publication_date DESC);
CREATE INDEX idx_briefings_category ON public.briefings(category);
CREATE INDEX idx_briefings_stocks_mentioned ON public.briefings USING GIN(stocks_mentioned);
CREATE INDEX idx_user_stock_follows_user_id ON public.user_stock_follows(user_id);
CREATE INDEX idx_user_stock_follows_symbol ON public.user_stock_follows(stock_symbol);
CREATE INDEX idx_briefing_views_user_briefing ON public.briefing_views(user_id, briefing_id);

-- Create function to update updated_at timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Create trigger for briefings updated_at
CREATE TRIGGER update_briefings_updated_at
  BEFORE UPDATE ON public.briefings
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();