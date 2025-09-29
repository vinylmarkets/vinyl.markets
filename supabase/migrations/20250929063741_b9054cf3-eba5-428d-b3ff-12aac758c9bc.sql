-- Create a cron job to run correlation discovery nightly at 2 AM
SELECT cron.schedule(
  'nightly-correlation-discovery',
  '0 2 * * *', -- Every day at 2 AM
  $$
  SELECT
    net.http_post(
        url:='https://jhxjvpbwkdzjufjyqanq.supabase.co/functions/v1/correlation-discovery',
        headers:='{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpoeGp2cGJ3a2R6anVmanlxYW5xIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTc5MDQ3MzYsImV4cCI6MjA3MzQ4MDczNn0.K7bcrLAr8Kxvln7owSNW452GhijuxWduv3u4173DPsc"}'::jsonb,
        body:=concat('{"scheduled": true, "time": "', now(), '"}')::jsonb
    ) as request_id;
  $$
);

-- Create a table to store relationship signals
CREATE TABLE IF NOT EXISTS trading.relationship_signals (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    signal_type TEXT NOT NULL CHECK (signal_type IN ('sympathy', 'rotation', 'pair_trade', 'index_arbitrage')),
    symbol_a TEXT,
    symbol_b TEXT,
    from_sector TEXT,
    to_sector TEXT,
    correlation_coefficient DECIMAL(5,4),
    strength DECIMAL(8,4),
    confidence DECIMAL(5,4),
    message TEXT NOT NULL,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    expires_at TIMESTAMP WITH TIME ZONE DEFAULT (NOW() + INTERVAL '1 day')
);

-- Create index for performance
CREATE INDEX idx_relationship_signals_type ON trading.relationship_signals(signal_type);
CREATE INDEX idx_relationship_signals_created ON trading.relationship_signals(created_at);
CREATE INDEX idx_relationship_signals_expires ON trading.relationship_signals(expires_at);

-- Enable RLS
ALTER TABLE trading.relationship_signals ENABLE ROW LEVEL SECURITY;

-- Allow authenticated users to read relationship signals
CREATE POLICY "Users can read relationship signals" ON trading.relationship_signals FOR SELECT TO authenticated USING (expires_at > NOW());

-- Allow system to manage relationship signals
CREATE POLICY "System can manage relationship signals" ON trading.relationship_signals FOR ALL TO service_role USING (true);

-- Create function to clean up expired signals
CREATE OR REPLACE FUNCTION trading.clean_expired_signals()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = trading
AS $$
BEGIN
    DELETE FROM relationship_signals WHERE expires_at < NOW();
END;
$$;

-- Schedule cleanup to run daily at 3 AM
SELECT cron.schedule(
  'cleanup-expired-signals',
  '0 3 * * *', -- Every day at 3 AM
  $$
  SELECT trading.clean_expired_signals();
  $$
);