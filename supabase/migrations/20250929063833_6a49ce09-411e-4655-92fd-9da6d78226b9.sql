-- Create relationship signals table if it doesn't exist
CREATE TABLE IF NOT EXISTS trading.relationship_signals (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    signal_type TEXT NOT NULL,
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

-- Only create indexes if they don't exist
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_relationship_signals_type') THEN
        CREATE INDEX idx_relationship_signals_type ON trading.relationship_signals(signal_type);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_relationship_signals_created') THEN
        CREATE INDEX idx_relationship_signals_created ON trading.relationship_signals(created_at);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_relationship_signals_expires') THEN
        CREATE INDEX idx_relationship_signals_expires ON trading.relationship_signals(expires_at);
    END IF;
END$$;