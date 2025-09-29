-- Set up cron job for trading engine (every 5 minutes during market hours)
-- This runs Monday-Friday, 9:30 AM - 4:00 PM EST (14:30-21:00 UTC)

SELECT cron.schedule(
  'trading-engine-market-hours',
  '*/5 14-20 * * 1-5', -- Every 5 minutes, 14:30-20:59 UTC (9:30 AM - 3:59 PM EST), Mon-Fri
  $$
  SELECT
    net.http_post(
        url:='https://jhxjvpbwkdzjufjyqanq.supabase.co/functions/v1/trading-engine',
        headers:='{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpoeGp2cGJ3a2R6anVmanlxYW5xIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTc5MDQ3MzYsImV4cCI6MjA3MzQ4MDczNn0.K7bcrLAr8Kxvln7owSNW452GhijuxWduv3u4173DPsc"}'::jsonb,
        body:='{"scheduled": true, "timestamp": "' || now() || '"}'::jsonb
    ) as request_id;
  $$
);

-- Set up cron job for trade execution (every 2 minutes during market hours)
SELECT cron.schedule(
  'execute-trades-market-hours',
  '*/2 14-20 * * 1-5', -- Every 2 minutes, 14:30-20:59 UTC (9:30 AM - 3:59 PM EST), Mon-Fri
  $$
  SELECT
    net.http_post(
        url:='https://jhxjvpbwkdzjufjyqanq.supabase.co/functions/v1/execute-trades',
        headers:='{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpoeGp2cGJ3a2R6anVmanlxYW5xIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTc5MDQ3MzYsImV4cCI6MjA3MzQ4MDczNn0.K7bcrLAr8Kxvln7owSNW452GhijuxWduv3u4173DPsc"}'::jsonb,
        body:='{"scheduled": true, "timestamp": "' || now() || '"}'::jsonb
    ) as request_id;
  $$
);

-- Optional: Add a function to track cron job performance
CREATE OR REPLACE FUNCTION public.log_cron_execution(job_name TEXT, status TEXT, response_data JSONB)
RETURNS void
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
    INSERT INTO public.cron_job_logs (job_name, status, response_id)
    VALUES (job_name, status, (response_data->>'request_id')::bigint);
END;
$$;