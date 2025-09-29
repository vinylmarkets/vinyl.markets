-- Schedule trading-engine to run every 15 minutes
-- This generates trading signals based on market analysis
SELECT cron.schedule(
  'trading-engine-15min',
  '*/15 * * * *',
  $$
  SELECT
    net.http_post(
        url:='https://jhxjvpbwkdzjufjyqanq.supabase.co/functions/v1/trading-engine',
        headers:='{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpoeGp2cGJ3a2R6anVmanlxYW5xIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTc5MDQ3MzYsImV4cCI6MjA3MzQ4MDczNn0.K7bcrLAr8Kxvln7owSNW452GhijuxWduv3u4173DPsc"}'::jsonb,
        body:=concat('{"time": "', now(), '"}')::jsonb
    ) as request_id;
  $$
);

-- Schedule execute-trades to run every 15 minutes (offset by 5 minutes after signals)
-- This executes trades based on generated signals
SELECT cron.schedule(
  'execute-trades-15min',
  '5,20,35,50 * * * *',
  $$
  SELECT
    net.http_post(
        url:='https://jhxjvpbwkdzjufjyqanq.supabase.co/functions/v1/execute-trades',
        headers:='{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpoeGp2cGJ3a2R6anVmanlxYW5xIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTc5MDQ3MzYsImV4cCI6MjA3MzQ4MDczNn0.K7bcrLAr8Kxvln7owSNW452GhijuxWduv3u4173DPsc"}'::jsonb,
        body:=concat('{"time": "', now(), '"}')::jsonb
    ) as request_id;
  $$
);