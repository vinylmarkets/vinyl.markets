-- Create Cognee insights table
CREATE TABLE IF NOT EXISTS public.cognee_insights (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  type VARCHAR(50) NOT NULL,
  priority VARCHAR(20) NOT NULL CHECK (priority IN ('low', 'medium', 'high', 'critical')),
  title TEXT NOT NULL,
  description TEXT,
  evidence JSONB DEFAULT '[]'::jsonb,
  recommendations JSONB DEFAULT '[]'::jsonb,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  acknowledged BOOLEAN DEFAULT FALSE,
  action_taken TEXT,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create Cognee queries table
CREATE TABLE IF NOT EXISTS public.cognee_queries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  query TEXT NOT NULL,
  response JSONB,
  confidence FLOAT CHECK (confidence >= 0 AND confidence <= 1),
  execution_time_ms INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create Cognee learning metrics table
CREATE TABLE IF NOT EXISTS public.cognee_learning_metrics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  metric_type VARCHAR(50) NOT NULL,
  value FLOAT NOT NULL,
  metadata JSONB DEFAULT '{}'::jsonb,
  recorded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_insights_priority ON public.cognee_insights(priority, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_insights_type ON public.cognee_insights(type, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_queries_user ON public.cognee_queries(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_learning_metrics_type ON public.cognee_learning_metrics(metric_type, recorded_at DESC);

-- Enable RLS
ALTER TABLE public.cognee_insights ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cognee_queries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cognee_learning_metrics ENABLE ROW LEVEL SECURITY;

-- RLS Policies for cognee_insights
CREATE POLICY "Users can view all insights" 
  ON public.cognee_insights FOR SELECT 
  USING (auth.uid() IS NOT NULL);

CREATE POLICY "Admin can manage insights" 
  ON public.cognee_insights FOR ALL 
  USING (EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin'));

-- RLS Policies for cognee_queries
CREATE POLICY "Users can view own queries" 
  ON public.cognee_queries FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own queries" 
  ON public.cognee_queries FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

-- RLS Policies for cognee_learning_metrics
CREATE POLICY "Users can view learning metrics" 
  ON public.cognee_learning_metrics FOR SELECT 
  USING (auth.uid() IS NOT NULL);

CREATE POLICY "Admin can manage learning metrics" 
  ON public.cognee_learning_metrics FOR ALL 
  USING (EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin'));

-- Create trigger to update updated_at
CREATE OR REPLACE FUNCTION update_cognee_insights_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER cognee_insights_updated_at
    BEFORE UPDATE ON public.cognee_insights
    FOR EACH ROW
    EXECUTE FUNCTION update_cognee_insights_updated_at();