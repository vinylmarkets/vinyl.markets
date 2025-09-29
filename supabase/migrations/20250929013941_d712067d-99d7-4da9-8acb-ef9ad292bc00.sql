-- Enable required extensions for cron jobs
CREATE EXTENSION IF NOT EXISTS pg_cron;
CREATE EXTENSION IF NOT EXISTS pg_net;

-- 1. Market Data Collection - every 5 minutes during market hours
-- Runs at 0,5,10,15,20,25,30,35,40,45,50,55 minutes past each hour from 14-20 UTC (9:30 AM - 4:00 PM EST)
SELECT cron.schedule(
  'market-data-pipeline',
  '0,5,10,15,20,25,30,35,40,45,50,55 14-20 * * 1-5',
  $$
  SELECT
    net.http_post(
        url:='https://jhxjvpbwkdzjufjyqanq.supabase.co/functions/v1/market-data',
        headers:='{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpoeGp2cGJ3a2R6anVmanlxYW5xIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTc5MDQ3MzYsImV4cCI6MjA3MzQ4MDczNn0.K7bcrLAr8Kxvln7owSNW452GhijuxWduv3u4173DPsc"}'::jsonb,
        body:='{"timestamp": "' || now() || '", "source": "cron", "job": "market-data"}'::jsonb
    ) as request_id;
  $$
);

-- 2. Trading Engine Analysis - 30 seconds after market data
-- Multiple schedules to handle the 30-second offset
SELECT cron.schedule(
  'trading-engine-00',
  '0 14-20 * * 1-5',
  'SELECT pg_sleep(30); SELECT net.http_post(url:=''https://jhxjvpbwkdzjufjyqanq.supabase.co/functions/v1/trading-engine'', headers:=''{\"Content-Type\": \"application/json\", \"Authorization\": \"Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpoeGp2cGJ3a2R6anVmanlxYW5xIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTc5MDQ3MzYsImV4cCI6MjA3MzQ4MDczNn0.K7bcrLAr8Kxvln7owSNW452GhijuxWduv3u4173DPsc\"}''::jsonb, body:=''{"timestamp": "'' || now() || ''", "source": "cron", "job": "trading-engine"}''::jsonb);'
);

SELECT cron.schedule(
  'trading-engine-05',
  '5 14-20 * * 1-5',
  'SELECT pg_sleep(30); SELECT net.http_post(url:=''https://jhxjvpbwkdzjufjyqanq.supabase.co/functions/v1/trading-engine'', headers:=''{\"Content-Type\": \"application/json\", \"Authorization\": \"Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpoeGp2cGJ3a2R6anVmanlxYW5xIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTc5MDQ3MzYsImV4cCI6MjA3MzQ4MDczNn0.K7bcrLAr8Kxvln7owSNW452GhijuxWduv3u4173DPsc\"}''::jsonb, body:=''{"timestamp": "'' || now() || ''", "source": "cron", "job": "trading-engine"}''::jsonb);'
);

SELECT cron.schedule(
  'trading-engine-10',
  '10 14-20 * * 1-5',
  'SELECT pg_sleep(30); SELECT net.http_post(url:=''https://jhxjvpbwkdzjufjyqanq.supabase.co/functions/v1/trading-engine'', headers:=''{\"Content-Type\": \"application/json\", \"Authorization\": \"Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpoeGp2cGJ3a2R6anVmanlxYW5xIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTc5MDQ3MzYsImV4cCI6MjA3MzQ4MDczNn0.K7bcrLAr8Kxvln7owSNW452GhijuxWduv3u4173DPsc\"}''::jsonb, body:=''{"timestamp": "'' || now() || ''", "source": "cron", "job": "trading-engine"}''::jsonb);'
);

-- Continue for all minutes (15, 20, 25, 30, 35, 40, 45, 50, 55)
SELECT cron.schedule('trading-engine-15', '15 14-20 * * 1-5', 'SELECT pg_sleep(30); SELECT net.http_post(url:=''https://jhxjvpbwkdzjufjyqanq.supabase.co/functions/v1/trading-engine'', headers:=''{\"Content-Type\": \"application/json\", \"Authorization\": \"Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpoeGp2cGJ3a2R6anVmanlxYW5xIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTc5MDQ3MzYsImV4cCI6MjA3MzQ4MDczNn0.K7bcrLAr8Kxvln7owSNW452GhijuxWduv3u4173DPsc\"}''::jsonb, body:=''{"timestamp": "'' || now() || ''", "source": "cron", "job": "trading-engine"}''::jsonb);');
SELECT cron.schedule('trading-engine-20', '20 14-20 * * 1-5', 'SELECT pg_sleep(30); SELECT net.http_post(url:=''https://jhxjvpbwkdzjufjyqanq.supabase.co/functions/v1/trading-engine'', headers:=''{\"Content-Type\": \"application/json\", \"Authorization\": \"Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpoeGp2cGJ3a2R6anVmanlxYW5xIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTc5MDQ3MzYsImV4cCI6MjA3MzQ4MDczNn0.K7bcrLAr8Kxvln7owSNW452GhijuxWduv3u4173DPsc\"}''::jsonb, body:=''{"timestamp": "'' || now() || ''", "source": "cron", "job": "trading-engine"}''::jsonb);');
SELECT cron.schedule('trading-engine-25', '25 14-20 * * 1-5', 'SELECT pg_sleep(30); SELECT net.http_post(url:=''https://jhxjvpbwkdzjufjyqanq.supabase.co/functions/v1/trading-engine'', headers:=''{\"Content-Type\": \"application/json\", \"Authorization\": \"Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpoeGp2cGJ3a2R6anVmanlxYW5xIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTc5MDQ3MzYsImV4cCI6MjA3MzQ4MDczNn0.K7bcrLAr8Kxvln7owSNW452GhijuxWduv3u4173DPsc\"}''::jsonb, body:=''{"timestamp": "'' || now() || ''", "source": "cron", "job": "trading-engine"}''::jsonb);');
SELECT cron.schedule('trading-engine-30', '30 14-20 * * 1-5', 'SELECT pg_sleep(30); SELECT net.http_post(url:=''https://jhxjvpbwkdzjufjyqanq.supabase.co/functions/v1/trading-engine'', headers:=''{\"Content-Type\": \"application/json\", \"Authorization\": \"Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpoeGp2cGJ3a2R6anVmanlxYW5xIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTc5MDQ3MzYsImV4cCI6MjA3MzQ4MDczNn0.K7bcrLAr8Kxvln7owSNW452GhijuxWduv3u4173DPsc\"}''::jsonb, body:=''{"timestamp": "'' || now() || ''", "source": "cron", "job": "trading-engine"}''::jsonb);');
SELECT cron.schedule('trading-engine-35', '35 14-20 * * 1-5', 'SELECT pg_sleep(30); SELECT net.http_post(url:=''https://jhxjvpbwkdzjufjyqanq.supabase.co/functions/v1/trading-engine'', headers:=''{\"Content-Type\": \"application/json\", \"Authorization\": \"Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpoeGp2cGJ3a2R6anVmanlxYW5xIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTc5MDQ3MzYsImV4cCI6MjA3MzQ4MDczNn0.K7bcrLAr8Kxvln7owSNW452GhijuxWduv3u4173DPsc\"}''::jsonb, body:=''{"timestamp": "'' || now() || ''", "source": "cron", "job": "trading-engine"}''::jsonb);');
SELECT cron.schedule('trading-engine-40', '40 14-20 * * 1-5', 'SELECT pg_sleep(30); SELECT net.http_post(url:=''https://jhxjvpbwkdzjufjyqanq.supabase.co/functions/v1/trading-engine'', headers:=''{\"Content-Type\": \"application/json\", \"Authorization\": \"Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpoeGp2cGJ3a2R6anVmanlxYW5xIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTc5MDQ3MzYsImV4cCI6MjA3MzQ4MDczNn0.K7bcrLAr8Kxvln7owSNW452GhijuxWduv3u4173DPsc\"}''::jsonb, body:=''{"timestamp": "'' || now() || ''", "source": "cron", "job": "trading-engine"}''::jsonb);');
SELECT cron.schedule('trading-engine-45', '45 14-20 * * 1-5', 'SELECT pg_sleep(30); SELECT net.http_post(url:=''https://jhxjvpbwkdzjufjyqanq.supabase.co/functions/v1/trading-engine'', headers:=''{\"Content-Type\": \"application/json\", \"Authorization\": \"Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpoeGp2cGJ3a2R6anVmanlxYW5xIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTc5MDQ3MzYsImV4cCI6MjA3MzQ4MDczNn0.K7bcrLAr8Kxvln7owSNW452GhijuxWduv3u4173DPsc\"}''::jsonb, body:=''{"timestamp": "'' || now() || ''", "source": "cron", "job": "trading-engine"}''::jsonb);');
SELECT cron.schedule('trading-engine-50', '50 14-20 * * 1-5', 'SELECT pg_sleep(30); SELECT net.http_post(url:=''https://jhxjvpbwkdzjufjyqanq.supabase.co/functions/v1/trading-engine'', headers:=''{\"Content-Type\": \"application/json\", \"Authorization\": \"Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpoeGp2cGJ3a2R6anVmallxYW5xIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTc5MDQ3MzYsImV4cCI6MjA3MzQ4MDczNn0.K7bcrLAr8Kxvln7owSNW452GhijuxWduv3u4173DPsc\"}''::jsonb, body:=''{"timestamp": "'' || now() || ''", "source": "cron", "job": "trading-engine"}''::jsonb);');
SELECT cron.schedule('trading-engine-55', '55 14-20 * * 1-5', 'SELECT pg_sleep(30); SELECT net.http_post(url:=''https://jhxjvpbwkdzjufjyqanq.supabase.co/functions/v1/trading-engine'', headers:=''{\"Content-Type\": \"application/json\", \"Authorization\": \"Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpoeGp2cGJ3a2R6anVmanlxYW5xIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTc5MDQ3MzYsImV4cCI6MjA3MzQ4MDczNn0.K7bcrLAr8Kxvln7owSNW452GhijuxWduv3u4173DPsc\"}''::jsonb, body:=''{"timestamp": "'' || now() || ''", "source": "cron", "job": "trading-engine"}''::jsonb);');