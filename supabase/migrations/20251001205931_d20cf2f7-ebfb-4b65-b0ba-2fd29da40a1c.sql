-- Migration 001: Create user_amps table
CREATE TABLE IF NOT EXISTS user_amps (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  amp_id TEXT NOT NULL,
  name TEXT NOT NULL,
  is_active BOOLEAN DEFAULT false,
  allocated_capital DECIMAL(12,2) DEFAULT 0,
  priority INTEGER DEFAULT 100,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  CONSTRAINT positive_capital CHECK (allocated_capital >= 0),
  CONSTRAINT valid_priority CHECK (priority > 0),
  UNIQUE(user_id, amp_id)
);

CREATE OR REPLACE FUNCTION update_user_amps_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER user_amps_updated_at
BEFORE UPDATE ON user_amps
FOR EACH ROW
EXECUTE FUNCTION update_user_amps_updated_at();

COMMENT ON TABLE user_amps IS 'Stores users active trading algorithm instances';
COMMENT ON COLUMN user_amps.allocated_capital IS 'Hard allocation - amp cannot exceed this amount in open positions';
COMMENT ON COLUMN user_amps.priority IS 'Used for conflict resolution when multiple amps signal same symbol. Lower number = higher priority';
COMMENT ON COLUMN user_amps.is_active IS 'When false, amp does not generate new signals but existing positions remain open';

-- Migration 002: Create user_amp_settings table
CREATE TABLE IF NOT EXISTS user_amp_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_amp_id UUID REFERENCES user_amps(id) ON DELETE CASCADE NOT NULL UNIQUE,
  
  -- Signal Generation Settings
  min_confidence_score DECIMAL(3,2) DEFAULT 0.75,
  signal_generation_frequency TEXT DEFAULT '15min',
  
  -- Position Management
  max_position_size DECIMAL(12,2) DEFAULT 1000,
  max_open_positions INTEGER DEFAULT 6,
  position_sizing_method TEXT DEFAULT 'fixed',
  
  -- Risk Management
  stop_loss_percentage DECIMAL(5,2) DEFAULT 2.0,
  take_profit_percentage DECIMAL(5,2) DEFAULT 5.0,
  daily_loss_limit DECIMAL(12,2) DEFAULT 750,
  total_portfolio_risk_pct DECIMAL(5,2) DEFAULT 3.0,
  trailing_stop_enabled BOOLEAN DEFAULT false,
  
  -- Trading Schedule
  trading_start_time TIME DEFAULT '09:35:00',
  trading_end_time TIME DEFAULT '15:45:00',
  trade_on_monday BOOLEAN DEFAULT true,
  trade_on_tuesday BOOLEAN DEFAULT true,
  trade_on_wednesday BOOLEAN DEFAULT true,
  trade_on_thursday BOOLEAN DEFAULT true,
  trade_on_friday BOOLEAN DEFAULT true,
  trade_on_saturday BOOLEAN DEFAULT false,
  trade_on_sunday BOOLEAN DEFAULT false,
  
  -- Signal Filters
  require_volume_confirmation BOOLEAN DEFAULT true,
  block_earnings_announcements BOOLEAN DEFAULT true,
  only_trade_with_trend BOOLEAN DEFAULT false,
  
  -- Order Execution
  order_type TEXT DEFAULT 'market',
  limit_order_offset_pct DECIMAL(5,2) DEFAULT 0.1,
  time_in_force TEXT DEFAULT 'day',
  
  -- Amp-Specific Parameters
  custom_parameters JSONB DEFAULT '{}'::JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Constraints
  CONSTRAINT valid_confidence CHECK (min_confidence_score >= 0 AND min_confidence_score <= 1),
  CONSTRAINT valid_frequency CHECK (signal_generation_frequency IN ('1min', '5min', '15min', '30min', '1hour', '4hour', 'daily')),
  CONSTRAINT positive_position_size CHECK (max_position_size > 0),
  CONSTRAINT positive_positions CHECK (max_open_positions > 0),
  CONSTRAINT valid_stop_loss CHECK (stop_loss_percentage >= 0.1 AND stop_loss_percentage <= 50),
  CONSTRAINT valid_take_profit CHECK (take_profit_percentage >= 0.1 AND take_profit_percentage <= 100),
  CONSTRAINT positive_daily_limit CHECK (daily_loss_limit >= 0),
  CONSTRAINT valid_portfolio_risk CHECK (total_portfolio_risk_pct >= 0 AND total_portfolio_risk_pct <= 100),
  CONSTRAINT valid_order_type CHECK (order_type IN ('market', 'limit', 'stop_limit')),
  CONSTRAINT valid_time_in_force CHECK (time_in_force IN ('day', 'gtc', 'ioc')),
  CONSTRAINT reasonable_sizing CHECK (position_sizing_method IN ('fixed', 'percentage', 'kelly', 'volatility_adjusted'))
);

CREATE TRIGGER user_amp_settings_updated_at 
BEFORE UPDATE ON user_amp_settings 
FOR EACH ROW 
EXECUTE FUNCTION update_user_amps_updated_at();

COMMENT ON TABLE user_amp_settings IS 'Configuration for each amp instance - isolated from other amps';
COMMENT ON COLUMN user_amp_settings.custom_parameters IS 'Amp-specific parameters like RSI periods, volume multipliers, etc stored as JSON';

-- Migration 003: Create user_amp_performance table
CREATE TABLE IF NOT EXISTS user_amp_performance (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_amp_id UUID REFERENCES user_amps(id) ON DELETE CASCADE NOT NULL,
  date DATE NOT NULL,
  
  -- Daily Statistics
  trades_executed INTEGER DEFAULT 0,
  winning_trades INTEGER DEFAULT 0,
  losing_trades INTEGER DEFAULT 0,
  
  -- Daily P&L
  total_pnl DECIMAL(12,2) DEFAULT 0,
  realized_pnl DECIMAL(12,2) DEFAULT 0,
  unrealized_pnl DECIMAL(12,2) DEFAULT 0,
  
  -- Running Totals (cumulative since amp activation)
  cumulative_pnl DECIMAL(12,2) DEFAULT 0,
  cumulative_trades INTEGER DEFAULT 0,
  cumulative_wins INTEGER DEFAULT 0,
  cumulative_losses INTEGER DEFAULT 0,
  
  -- Calculated Metrics (updated daily)
  win_rate DECIMAL(5,2) DEFAULT 0,
  avg_win DECIMAL(12,2) DEFAULT 0,
  avg_loss DECIMAL(12,2) DEFAULT 0,
  largest_win DECIMAL(12,2) DEFAULT 0,
  largest_loss DECIMAL(12,2) DEFAULT 0,
  
  -- Risk Metrics
  max_drawdown DECIMAL(12,2) DEFAULT 0,
  current_drawdown DECIMAL(12,2) DEFAULT 0,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  UNIQUE(user_amp_id, date)
);

CREATE INDEX idx_performance_amp_date ON user_amp_performance(user_amp_id, date DESC);

COMMENT ON TABLE user_amp_performance IS 'Daily performance snapshots for each amp - one row per amp per day';

-- Migration 004: Create amp_events table
CREATE TABLE IF NOT EXISTS amp_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  user_amp_id UUID REFERENCES user_amps(id) ON DELETE SET NULL,
  event_type TEXT NOT NULL,
  description TEXT NOT NULL,
  metadata JSONB DEFAULT '{}'::JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  CONSTRAINT valid_event_type CHECK (
    event_type IN (
      'amp_enabled', 'amp_disabled', 'capital_allocated', 'capital_reduced',
      'settings_updated', 'signal_generated', 'trade_executed', 'position_closed',
      'stop_loss_triggered', 'take_profit_hit', 'daily_loss_limit_reached',
      'conflict_resolved', 'error_occurred'
    )
  )
);

CREATE INDEX idx_events_user_date ON amp_events(user_id, created_at DESC);
CREATE INDEX idx_events_amp_date ON amp_events(user_amp_id, created_at DESC) WHERE user_amp_id IS NOT NULL;

COMMENT ON TABLE amp_events IS 'Activity log for user visibility and debugging';

-- Migration 005: Modify paper_positions and paper_transactions tables to add amp tracking
ALTER TABLE paper_positions
ADD COLUMN IF NOT EXISTS user_amp_id UUID REFERENCES user_amps(id) ON DELETE SET NULL;

ALTER TABLE paper_positions
ADD COLUMN IF NOT EXISTS settings_snapshot JSONB DEFAULT '{}'::JSONB;

ALTER TABLE paper_transactions
ADD COLUMN IF NOT EXISTS user_amp_id UUID REFERENCES user_amps(id) ON DELETE SET NULL;

ALTER TABLE paper_transactions
ADD COLUMN IF NOT EXISTS settings_snapshot JSONB DEFAULT '{}'::JSONB;

CREATE INDEX IF NOT EXISTS idx_paper_positions_amp ON paper_positions(user_amp_id);
CREATE INDEX IF NOT EXISTS idx_paper_transactions_amp ON paper_transactions(user_amp_id);

COMMENT ON COLUMN paper_positions.user_amp_id IS 'Which amp generated this position';
COMMENT ON COLUMN paper_positions.settings_snapshot IS 'Snapshot of amp settings when position was opened';
COMMENT ON COLUMN paper_transactions.user_amp_id IS 'Which amp generated this transaction';
COMMENT ON COLUMN paper_transactions.settings_snapshot IS 'Snapshot of amp settings when transaction was executed';

-- Migration 006: Create amp_catalog table
CREATE TABLE IF NOT EXISTS amp_catalog (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  category TEXT,
  version TEXT DEFAULT '1.0',
  parameter_schema JSONB DEFAULT '{}'::JSONB,
  default_settings JSONB DEFAULT '{}'::JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert the ONE amp currently available
INSERT INTO amp_catalog (id, name, description, category, parameter_schema, default_settings)
VALUES (
  'momentum-scanner-v1',
  'Momentum Scanner',
  'Identifies momentum breakouts using RSI and volume analysis',
  'momentum',
  '{
    "parameters": [
      {
        "key": "rsi_period",
        "label": "RSI Period",
        "type": "number",
        "min": 5,
        "max": 50,
        "default": 14,
        "description": "Number of periods for RSI calculation"
      },
      {
        "key": "rsi_oversold",
        "label": "RSI Oversold Threshold",
        "type": "number",
        "min": 10,
        "max": 40,
        "default": 30,
        "description": "RSI level considered oversold"
      },
      {
        "key": "volume_multiplier",
        "label": "Volume Multiplier",
        "type": "number",
        "min": 1.0,
        "max": 5.0,
        "step": 0.1,
        "default": 1.5,
        "description": "Volume must be X times average"
      }
    ]
  }'::JSONB,
  '{
    "rsi_period": 14,
    "rsi_oversold": 30,
    "volume_multiplier": 1.5
  }'::JSONB
)
ON CONFLICT (id) DO NOTHING;

COMMENT ON TABLE amp_catalog IS 'Available amps users can add - NOT user data, this is the amp library';

-- Migration 007: Create indexes for performance
CREATE INDEX idx_user_amps_user_active ON user_amps(user_id, is_active);
CREATE INDEX idx_user_amps_user_priority ON user_amps(user_id, priority);
CREATE INDEX idx_amp_settings_amp ON user_amp_settings(user_amp_id);
CREATE INDEX idx_settings_frequency ON user_amp_settings(signal_generation_frequency);
CREATE INDEX idx_active_amps_priority ON user_amps(user_id, is_active, priority) WHERE is_active = true;
CREATE INDEX idx_performance_recent ON user_amp_performance(user_amp_id, date DESC);

-- Migration 008: Enable RLS and create policies
ALTER TABLE user_amps ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_amp_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_amp_performance ENABLE ROW LEVEL SECURITY;
ALTER TABLE amp_events ENABLE ROW LEVEL SECURITY;

-- user_amps policies
CREATE POLICY "Users can view own amps" ON user_amps FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own amps" ON user_amps FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own amps" ON user_amps FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own amps" ON user_amps FOR DELETE USING (auth.uid() = user_id);

-- user_amp_settings policies
CREATE POLICY "Users can manage own amp settings" ON user_amp_settings FOR ALL
USING (user_amp_id IN (SELECT id FROM user_amps WHERE user_id = auth.uid()));

-- user_amp_performance policies
CREATE POLICY "Users can view own amp performance" ON user_amp_performance FOR SELECT
USING (user_amp_id IN (SELECT id FROM user_amps WHERE user_id = auth.uid()));

CREATE POLICY "System can insert performance" ON user_amp_performance FOR INSERT WITH CHECK (true);

-- amp_events policies
CREATE POLICY "Users can view own events" ON amp_events FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "System can insert events" ON amp_events FOR INSERT WITH CHECK (true);

-- Migration 009: Create helper functions
CREATE OR REPLACE FUNCTION get_total_allocated_capital(p_user_id UUID)
RETURNS DECIMAL(12,2)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_total DECIMAL(12,2);
BEGIN
  SELECT COALESCE(SUM(allocated_capital), 0)
  INTO v_total
  FROM user_amps
  WHERE user_id = p_user_id;
  RETURN v_total;
END;
$$;

COMMENT ON FUNCTION get_total_allocated_capital IS 'Returns sum of allocated capital across all user amps';

CREATE OR REPLACE FUNCTION get_amp_open_position_value(p_user_amp_id UUID)
RETURNS DECIMAL(12,2)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_total DECIMAL(12,2);
BEGIN
  SELECT COALESCE(SUM(ABS(quantity * average_cost)), 0)
  INTO v_total
  FROM paper_positions
  WHERE user_amp_id = p_user_amp_id;
  RETURN v_total;
END;
$$;

COMMENT ON FUNCTION get_amp_open_position_value IS 'Returns total dollar value of amps open positions';

CREATE OR REPLACE FUNCTION can_amp_open_position(
  p_user_amp_id UUID,
  p_position_size DECIMAL(12,2)
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_allocated DECIMAL(12,2);
  v_current_open DECIMAL(12,2);
  v_max_positions INTEGER;
  v_current_positions INTEGER;
BEGIN
  -- Get amp's allocated capital
  SELECT allocated_capital INTO v_allocated
  FROM user_amps WHERE id = p_user_amp_id;
  
  -- Get current open position value
  SELECT get_amp_open_position_value(p_user_amp_id) INTO v_current_open;
  
  -- Get max positions setting
  SELECT max_open_positions INTO v_max_positions
  FROM user_amp_settings WHERE user_amp_id = p_user_amp_id;
  
  -- Get current position count
  SELECT COUNT(*) INTO v_current_positions
  FROM paper_positions WHERE user_amp_id = p_user_amp_id;
  
  -- Check all constraints
  IF (v_current_open + p_position_size) > v_allocated THEN
    RETURN false;
  END IF;
  
  IF v_current_positions >= v_max_positions THEN
    RETURN false;
  END IF;
  
  RETURN true;
END;
$$;

COMMENT ON FUNCTION can_amp_open_position IS 'Checks if amp has capacity for new position of given size';