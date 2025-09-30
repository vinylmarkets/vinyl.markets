-- Create vinyl_newsletters table (separate from atomic briefings)
CREATE TABLE public.vinyl_newsletters (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  category TEXT DEFAULT 'manual',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_by UUID REFERENCES auth.users(id),
  published BOOLEAN DEFAULT false,
  published_at TIMESTAMP WITH TIME ZONE,
  beehiiv_post_id TEXT,
  beehiiv_pushed_at TIMESTAMP WITH TIME ZONE,
  tags TEXT[] DEFAULT '{}',
  metadata JSONB DEFAULT '{}'::jsonb
);

-- Enable RLS
ALTER TABLE public.vinyl_newsletters ENABLE ROW LEVEL SECURITY;

-- Traders can view all vinyl newsletters
CREATE POLICY "Traders can view vinyl newsletters"
  ON public.vinyl_newsletters
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM traders_whitelist
      WHERE email = (SELECT email FROM auth.users WHERE id = auth.uid())
    )
  );

-- Traders can create vinyl newsletters
CREATE POLICY "Traders can create vinyl newsletters"
  ON public.vinyl_newsletters
  FOR INSERT
  WITH CHECK (
    auth.uid() = created_by
    AND EXISTS (
      SELECT 1 FROM traders_whitelist
      WHERE email = (SELECT email FROM auth.users WHERE id = auth.uid())
    )
  );

-- Traders can update their own vinyl newsletters
CREATE POLICY "Traders can update their own vinyl newsletters"
  ON public.vinyl_newsletters
  FOR UPDATE
  USING (
    auth.uid() = created_by
    AND EXISTS (
      SELECT 1 FROM traders_whitelist
      WHERE email = (SELECT email FROM auth.users WHERE id = auth.uid())
    )
  );

-- Traders can delete their own vinyl newsletters
CREATE POLICY "Traders can delete their own vinyl newsletters"
  ON public.vinyl_newsletters
  FOR DELETE
  USING (
    auth.uid() = created_by
    AND EXISTS (
      SELECT 1 FROM traders_whitelist
      WHERE email = (SELECT email FROM auth.users WHERE id = auth.uid())
    )
  );

-- Create vinyl_newsletter_analytics table
CREATE TABLE public.vinyl_newsletter_analytics (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  newsletter_id UUID NOT NULL REFERENCES vinyl_newsletters(id) ON DELETE CASCADE,
  views INTEGER DEFAULT 0,
  beehiiv_sent_count INTEGER DEFAULT 0,
  beehiiv_opened_count INTEGER DEFAULT 0,
  beehiiv_clicked_count INTEGER DEFAULT 0,
  last_synced_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on analytics
ALTER TABLE public.vinyl_newsletter_analytics ENABLE ROW LEVEL SECURITY;

-- Traders can view analytics
CREATE POLICY "Traders can view vinyl newsletter analytics"
  ON public.vinyl_newsletter_analytics
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM traders_whitelist
      WHERE email = (SELECT email FROM auth.users WHERE id = auth.uid())
    )
  );

-- Create index for performance
CREATE INDEX idx_vinyl_newsletters_created_at ON vinyl_newsletters(created_at DESC);
CREATE INDEX idx_vinyl_newsletters_published ON vinyl_newsletters(published, published_at DESC);
CREATE INDEX idx_vinyl_newsletter_analytics_newsletter_id ON vinyl_newsletter_analytics(newsletter_id);