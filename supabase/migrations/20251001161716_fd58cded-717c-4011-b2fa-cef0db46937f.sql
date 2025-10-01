-- Make user_id nullable in trading_signals since automated signals aren't user-specific
ALTER TABLE trading_signals ALTER COLUMN user_id DROP NOT NULL;

-- Add index for faster signal queries
CREATE INDEX IF NOT EXISTS idx_trading_signals_status_confidence 
ON trading_signals(status, confidence_score) 
WHERE status = 'active';