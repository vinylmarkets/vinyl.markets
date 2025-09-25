-- AtomicMarket Paper Trading System Database Schema (Complete)

-- Paper trading accounts
CREATE TABLE IF NOT EXISTS paper_accounts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  account_name TEXT DEFAULT 'My Paper Account',
  
  -- Account configuration
  account_type TEXT CHECK (account_type IN ('cash', 'margin')) DEFAULT 'margin',
  starting_capital DECIMAL(12,2) NOT NULL,
  current_cash DECIMAL(12,2) NOT NULL,
  buying_power DECIMAL(12,2) NOT NULL,
  
  -- Options trading levels (0=No options, 1=Covered calls/puts, 2=Long options, 3=Spreads, 4=Naked options)
  options_level INTEGER CHECK (options_level BETWEEN 0 AND 4) DEFAULT 0,
  
  -- Account values
  total_equity DECIMAL(12,2) NOT NULL,
  market_value_long DECIMAL(12,2) DEFAULT 0,
  market_value_short DECIMAL(12,2) DEFAULT 0,
  total_realized_pnl DECIMAL(12,2) DEFAULT 0,
  total_unrealized_pnl DECIMAL(12,2) DEFAULT 0,
  
  -- Margin details
  margin_used DECIMAL(12,2) DEFAULT 0,
  maintenance_requirement DECIMAL(12,2) DEFAULT 0,
  margin_call_price DECIMAL(12,4),
  
  -- PDT tracking
  day_trades_count INTEGER DEFAULT 0,
  day_trades_reset_date DATE,
  is_pattern_day_trader BOOLEAN DEFAULT FALSE,
  
  -- Performance metrics
  total_trades INTEGER DEFAULT 0,
  winning_trades INTEGER DEFAULT 0,
  losing_trades INTEGER DEFAULT 0,
  win_rate DECIMAL(5,2),
  average_win DECIMAL(12,2),
  average_loss DECIMAL(12,2),
  profit_factor DECIMAL(8,2),
  sharpe_ratio DECIMAL(8,4),
  max_drawdown DECIMAL(8,2),
  max_drawdown_date DATE,
  
  -- Account status
  is_active BOOLEAN DEFAULT TRUE,
  last_reset_date TIMESTAMP WITH TIME ZONE,
  reset_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Paper trading positions
CREATE TABLE IF NOT EXISTS paper_positions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  account_id UUID REFERENCES paper_accounts(id) ON DELETE CASCADE,
  symbol TEXT NOT NULL,
  asset_type TEXT CHECK (asset_type IN ('stock', 'option')) NOT NULL,
  
  -- Position details
  quantity DECIMAL(12,4) NOT NULL,
  side TEXT CHECK (side IN ('long', 'short')) NOT NULL,
  average_cost DECIMAL(12,4) NOT NULL,
  current_price DECIMAL(12,4),
  market_value DECIMAL(12,2),
  
  -- P&L tracking
  cost_basis DECIMAL(12,2) NOT NULL,
  unrealized_pnl DECIMAL(12,2),
  unrealized_pnl_percentage DECIMAL(8,2),
  daily_pnl DECIMAL(12,2),
  
  -- Options specific
  option_type TEXT CHECK (option_type IN ('call', 'put')),
  strike_price DECIMAL(10,2),
  expiration_date DATE,
  
  -- Greeks (for options)
  delta DECIMAL(8,4),
  gamma DECIMAL(8,4),
  theta DECIMAL(8,4),
  vega DECIMAL(8,4),
  rho DECIMAL(8,4),
  implied_volatility DECIMAL(8,4),
  
  -- Metadata
  opened_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Paper trading orders
CREATE TABLE IF NOT EXISTS paper_orders (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  account_id UUID REFERENCES paper_accounts(id) ON DELETE CASCADE,
  symbol TEXT NOT NULL,
  asset_type TEXT CHECK (asset_type IN ('stock', 'option')) NOT NULL,
  
  -- Order details
  side TEXT CHECK (side IN ('buy', 'sell', 'buy_to_open', 'sell_to_open', 'buy_to_close', 'sell_to_close')) NOT NULL,
  order_type TEXT CHECK (order_type IN ('market', 'limit', 'stop', 'stop_limit')) NOT NULL,
  quantity DECIMAL(12,4) NOT NULL,
  
  -- Pricing
  limit_price DECIMAL(12,4),
  stop_price DECIMAL(12,4),
  
  -- Options specific
  option_type TEXT CHECK (option_type IN ('call', 'put')),
  strike_price DECIMAL(10,2),
  expiration_date DATE,
  
  -- Multi-leg support
  is_multi_leg BOOLEAN DEFAULT FALSE,
  strategy_type TEXT,
  parent_order_id UUID REFERENCES paper_orders(id),
  leg_number INTEGER,
  
  -- Order status
  status TEXT CHECK (status IN ('pending', 'partially_filled', 'filled', 'cancelled', 'rejected', 'expired')) DEFAULT 'pending',
  filled_quantity DECIMAL(12,4) DEFAULT 0,
  average_fill_price DECIMAL(12,4),
  
  -- Execution details
  fill_time TIMESTAMP WITH TIME ZONE,
  commission DECIMAL(6,2) DEFAULT 0,
  slippage DECIMAL(6,2) DEFAULT 0,
  
  -- Import tracking
  import_source TEXT,
  import_id UUID,
  
  -- Trade planning
  stop_loss_price DECIMAL(12,4),
  take_profit_price DECIMAL(12,4),
  trade_rationale TEXT,
  
  -- Metadata
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  executed_at TIMESTAMP WITH TIME ZONE,
  cancelled_at TIMESTAMP WITH TIME ZONE
);

-- Paper trading transactions
CREATE TABLE IF NOT EXISTS paper_transactions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  account_id UUID REFERENCES paper_accounts(id) ON DELETE CASCADE,
  order_id UUID REFERENCES paper_orders(id),
  symbol TEXT NOT NULL,
  asset_type TEXT NOT NULL,
  transaction_type TEXT CHECK (transaction_type IN ('buy', 'sell', 'dividend', 'interest', 'assignment', 'exercise')) NOT NULL,
  quantity DECIMAL(12,4) NOT NULL,
  price DECIMAL(12,4) NOT NULL,
  total_amount DECIMAL(12,2) NOT NULL,
  option_type TEXT,
  strike_price DECIMAL(10,2),
  expiration_date DATE,
  
  -- P&L tracking
  realized_pnl DECIMAL(12,2),
  cost_basis_adjustment DECIMAL(12,2),
  
  -- Fees
  commission DECIMAL(6,2) DEFAULT 0,
  slippage DECIMAL(6,2) DEFAULT 0,
  other_fees DECIMAL(6,2) DEFAULT 0,
  
  -- Metadata
  executed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  settlement_date DATE,
  notes TEXT
);

-- Watchlists
CREATE TABLE IF NOT EXISTS paper_watchlists (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  account_id UUID REFERENCES paper_accounts(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Watchlist items
CREATE TABLE IF NOT EXISTS paper_watchlist_items (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  watchlist_id UUID REFERENCES paper_watchlists(id) ON DELETE CASCADE,
  symbol TEXT NOT NULL,
  asset_type TEXT CHECK (asset_type IN ('stock', 'option')) NOT NULL,
  option_type TEXT,
  strike_price DECIMAL(10,2),
  expiration_date DATE,
  import_source TEXT,
  import_id UUID,
  imported_at TIMESTAMP WITH TIME ZONE,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Trade journal
CREATE TABLE IF NOT EXISTS paper_trade_journal (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  account_id UUID REFERENCES paper_accounts(id) ON DELETE CASCADE,
  order_id UUID REFERENCES paper_orders(id),
  
  -- Pre-trade planning
  trade_setup TEXT,
  entry_reason TEXT,
  risk_reward_ratio DECIMAL(4,2),
  confidence_level INTEGER CHECK (confidence_level BETWEEN 1 AND 10),
  
  -- Emotional state
  emotional_state TEXT CHECK (emotional_state IN ('calm', 'excited', 'anxious', 'fearful', 'greedy', 'frustrated')),
  
  -- Post-trade review
  exit_reason TEXT,
  trade_grade TEXT CHECK (trade_grade IN ('A', 'B', 'C', 'D', 'F')),
  lessons_learned TEXT,
  mistakes_made TEXT,
  what_went_well TEXT,
  
  -- AI analysis
  ai_feedback TEXT,
  ai_suggestions TEXT,
  common_mistakes_detected JSONB,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Performance snapshots
CREATE TABLE IF NOT EXISTS paper_performance_snapshots (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  account_id UUID REFERENCES paper_accounts(id) ON DELETE CASCADE,
  snapshot_date DATE NOT NULL,
  total_equity DECIMAL(12,2),
  cash_balance DECIMAL(12,2),
  market_value DECIMAL(12,2),
  daily_pnl DECIMAL(12,2),
  daily_pnl_percentage DECIMAL(8,2),
  cumulative_pnl DECIMAL(12,2),
  cumulative_return DECIMAL(8,2),
  daily_var DECIMAL(12,2),
  beta DECIMAL(8,4),
  correlation_to_spy DECIMAL(8,4),
  positions_count INTEGER,
  largest_position_size DECIMAL(8,2),
  sector_concentration JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(account_id, snapshot_date)
);

-- Achievements
CREATE TABLE IF NOT EXISTS paper_achievements (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  description TEXT NOT NULL,
  category TEXT CHECK (category IN ('trading', 'risk', 'education', 'social', 'milestone')),
  points INTEGER DEFAULT 10,
  badge_icon TEXT,
  criteria_type TEXT,
  criteria_value DECIMAL(10,2),
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- User achievements
CREATE TABLE IF NOT EXISTS paper_user_achievements (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  account_id UUID REFERENCES paper_accounts(id) ON DELETE CASCADE,
  achievement_id UUID REFERENCES paper_achievements(id),
  earned_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  points_earned INTEGER DEFAULT 0,
  UNIQUE(account_id, achievement_id)
);

-- Leaderboards
CREATE TABLE IF NOT EXISTS paper_leaderboards (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  period TEXT CHECK (period IN ('daily', 'weekly', 'monthly', 'all_time')),
  account_id UUID REFERENCES paper_accounts(id) ON DELETE CASCADE,
  rank INTEGER,
  return_percentage DECIMAL(8,4),
  sharpe_ratio DECIMAL(8,4),
  win_rate DECIMAL(5,2),
  total_trades INTEGER,
  total_points INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(period, account_id)
);