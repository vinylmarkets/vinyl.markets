-- Create the morning market analysis cron job
SELECT cron.schedule(
  'morning-market-analysis',
  '30 9 * * 1-5', -- Run at 9:30 AM Monday-Friday (market open)
  $$
  select
    net.http_post(
        url:='https://jhxjvpbwkdzjufjyqanq.supabase.co/functions/v1/morning-market-analysis',
        headers:='{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpoeGp2cGJ3a2R6anVmanlxYW5xIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTc5MDQ3MzYsImV4cCI6MjA3MzQ4MDczNn0.K7bcrLAr8Kxvln7owSNW452GhijuxWduv3u4173DPsc"}'::jsonb,
        body:='{"automated": true}'::jsonb
    ) as request_id;
  $$
);