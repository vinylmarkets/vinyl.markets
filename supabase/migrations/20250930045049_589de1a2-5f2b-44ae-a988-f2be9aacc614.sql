-- Add Kit.com related fields to vinyl_newsletters table
ALTER TABLE public.vinyl_newsletters 
ADD COLUMN kit_broadcast_id TEXT,
ADD COLUMN kit_pushed_at TIMESTAMP WITH TIME ZONE;

-- Add Kit.com related fields to vinyl_newsletter_analytics table  
ALTER TABLE public.vinyl_newsletter_analytics
ADD COLUMN kit_sent_count INTEGER DEFAULT 0;