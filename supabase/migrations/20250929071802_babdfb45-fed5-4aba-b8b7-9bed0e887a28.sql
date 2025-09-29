-- Create table for storing world news context
CREATE TABLE IF NOT EXISTS public.world_news_context (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  date DATE NOT NULL,
  news_stories JSONB NOT NULL DEFAULT '[]',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create unique constraint on date to allow upserts
CREATE UNIQUE INDEX IF NOT EXISTS world_news_context_date_idx ON public.world_news_context(date);

-- Enable RLS
ALTER TABLE public.world_news_context ENABLE ROW LEVEL SECURITY;

-- Create policy for system/admin access
CREATE POLICY "System can manage world news context" ON public.world_news_context
FOR ALL USING (true);

-- Create trigger for updated_at
CREATE OR REPLACE FUNCTION update_world_news_context_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_world_news_context_updated_at_trigger
    BEFORE UPDATE ON public.world_news_context
    FOR EACH ROW
    EXECUTE FUNCTION update_world_news_context_updated_at();