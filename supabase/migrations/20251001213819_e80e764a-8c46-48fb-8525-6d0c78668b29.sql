
-- Schedule trading signal generation every 30 minutes during market hours
-- Market hours: 9:30 AM - 4:00 PM ET (14:30 - 21:00 UTC)
SELECT cron.schedule(
  'generate-trading-signals',
  '*/30 14-20 * * 1-5',
  $$
  SELECT net.http_post(
    url := 'https://jhxjvpbwkdzjufjyqanq.supabase.co/functions/v1/trading-engine',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpoeGp2cGJ3a2R6anVmanlxYW5xIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTc5MDQ3MzYsImV4cCI6MjA3MzQ4MDczNn0.K7bcrLAr8Kxvln7owSNW452GhijuxWduv3u4173DPsc'
    ),
    body := jsonb_build_object('timestamp', now())
  ) AS request_id;
  $$
);

-- Schedule trade execution 5 minutes after signal generation
SELECT cron.schedule(
  'execute-automated-trades',
  '5,35 14-20 * * 1-5',
  $$
  SELECT net.http_post(
    url := 'https://jhxjvpbwkdzjufjyqanq.supabase.co/functions/v1/execute-trades',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpoeGp2cGJ3a2R6anVmanlxYW5xIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTc5MDQ3MzYsImV4cCI6MjA3MzQ4MDczNn0.K7bcrLAr8Kxvln7owSNW452GhijuxWduv3u4173DPsc'
    ),
    body := jsonb_build_object('timestamp', now())
  ) AS request_id;
  $$
);

-- Schedule position monitoring every 15 minutes
SELECT cron.schedule(
  'update-trading-positions',
  '*/15 14-20 * * 1-5',
  $$
  SELECT net.http_post(
    url := 'https://jhxjvpbwkdzjufjyqanq.supabase.co/functions/v1/update-positions',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpoeGp2cGJ3a2R6anVmanlxYW5xIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTc5MDQ3MzYsImV4cCI6MjA3MzQ4MDczNn0.K7bcrLAr8Kxvln7owSNW452GhijuxWduv3u4173DPsc'
    ),
    body := jsonb_build_object('timestamp', now())
  ) AS request_id;
  $$
);
