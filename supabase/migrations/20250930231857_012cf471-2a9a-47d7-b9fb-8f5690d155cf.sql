-- Enable pg_cron extension for scheduled jobs
CREATE EXTENSION IF NOT EXISTS pg_cron;

-- Enable pg_net extension for HTTP requests
CREATE EXTENSION IF NOT EXISTS pg_net;

-- Grant necessary permissions
GRANT USAGE ON SCHEMA cron TO postgres;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA cron TO postgres;

-- Schedule trading-engine to generate signals every 30 minutes during market hours
-- Runs Monday-Friday, 9:30 AM - 4:00 PM EST (14:30-21:00 UTC)
SELECT cron.schedule(
  'generate-trading-signals',
  '*/30 14-20 * * 1-5',
  $$
  SELECT
    net.http_post(
      url:='https://jhxjvpbwkdzjufjyqanq.supabase.co/functions/v1/trading-engine',
      headers:='{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpoeGp2cGJ3a2R6anVmanlxYW5xIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTc5MDQ3MzYsImV4cCI6MjA3MzQ4MDczNn0.K7bcrLAr8Kxvln7owSNW452GhijuxWduv3u4173DPsc"}'::jsonb,
      body:=concat('{"timestamp": "', now(), '"}')::jsonb
    ) as request_id;
  $$
);

-- Schedule execute-trades to execute signals every 15 minutes during market hours
-- Runs Monday-Friday, 9:30 AM - 4:00 PM EST (14:30-21:00 UTC)
SELECT cron.schedule(
  'execute-trading-signals',
  '*/15 14-20 * * 1-5',
  $$
  SELECT
    net.http_post(
      url:='https://jhxjvpbwkdzjufjyqanq.supabase.co/functions/v1/execute-trades',
      headers:='{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpoeGp2cGJ3a2R6anVmanlxYW5xIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTc5MDQ3MzYsImV4cCI6MjA3MzQ4MDczNn0.K7bcrLAr8Kxvln7owSNW452GhijuxWduv3u4173DPsc"}'::jsonb,
      body:=concat('{"timestamp": "', now(), '"}')::jsonb
    ) as request_id;
  $$
);

-- Log successful cron job setup
INSERT INTO public.cron_job_logs (job_name, status) 
VALUES 
  ('generate-trading-signals', 'scheduled'),
  ('execute-trading-signals', 'scheduled');