-- Create schema for trading-related tables
CREATE SCHEMA IF NOT EXISTS trading;

-- Create user_integrations table for storing encrypted broker credentials
CREATE TABLE trading.user_integrations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    broker_name TEXT NOT NULL CHECK (broker_name IN ('alpaca', 'tdameritrade', 'schwab', 'interactive_brokers')),
    api_key_encrypted TEXT NOT NULL,
    secret_key_encrypted TEXT NOT NULL,
    environment TEXT NOT NULL CHECK (environment IN ('paper', 'live')),
    is_active BOOLEAN NOT NULL DEFAULT true,
    last_connected TIMESTAMP WITH TIME ZONE,
    account_status JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    UNIQUE(user_id, broker_name, environment)
);

-- Create audit log table for tracking trading activity
CREATE TABLE trading.audit_log (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    integration_id UUID REFERENCES trading.user_integrations(id) ON DELETE SET NULL,
    action_type TEXT NOT NULL,
    action_details JSONB NOT NULL DEFAULT '{}'::jsonb,
    symbol TEXT,
    quantity NUMERIC,
    price NUMERIC,
    success BOOLEAN NOT NULL,
    error_message TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on both tables
ALTER TABLE trading.user_integrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE trading.audit_log ENABLE ROW LEVEL SECURITY;

-- RLS policies for user_integrations
CREATE POLICY "Users can manage their own integrations" 
ON trading.user_integrations 
FOR ALL 
USING (auth.uid() = user_id) 
WITH CHECK (auth.uid() = user_id);

-- RLS policies for audit_log  
CREATE POLICY "Users can view their own audit logs"
ON trading.audit_log 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "System can insert audit logs"
ON trading.audit_log 
FOR INSERT 
WITH CHECK (true);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION trading.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for updated_at on user_integrations
CREATE TRIGGER update_user_integrations_updated_at
    BEFORE UPDATE ON trading.user_integrations
    FOR EACH ROW
    EXECUTE FUNCTION trading.update_updated_at_column();