-- Enable required extensions for cron jobs
CREATE EXTENSION IF NOT EXISTS pg_cron;
CREATE EXTENSION IF NOT EXISTS pg_net;

-- Create cron job to send daily market email at 4:30 PM EST, Monday-Friday
SELECT cron.schedule(
  'send-daily-market-email',
  '30 21 * * 1-5', -- 4:30 PM EST = 9:30 PM UTC (accounting for EST offset)
  $$
  SELECT
    net.http_post(
        url:='https://jhxjvpbwkdzjufjyqanq.supabase.co/functions/v1/send-daily-market-email',
        headers:='{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpoeGp2cGJ3a2R6anVmanlxYW5xIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTc5MDQ3MzYsImV4cCI6MjA3MzQ4MDczNn0.K7bcrLAr8Kxvln7owSNW452GhijuxWduv3u4173DPsc"}'::jsonb,
        body:=concat('{"time": "', now(), '", "trigger": "cron_daily_email"}')::jsonb
    ) as request_id;
  $$
);

-- Log the cron job creation
INSERT INTO public.cron_job_logs (job_name, status) 
VALUES ('send-daily-market-email', 'scheduled');