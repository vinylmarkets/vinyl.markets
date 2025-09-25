-- Enable RLS on all paper trading tables and add proper policies

-- Enable RLS on all paper trading tables
ALTER TABLE paper_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE paper_positions ENABLE ROW LEVEL SECURITY;
ALTER TABLE paper_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE paper_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE paper_watchlists ENABLE ROW LEVEL SECURITY;
ALTER TABLE paper_watchlist_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE paper_trade_journal ENABLE ROW LEVEL SECURITY;
ALTER TABLE paper_performance_snapshots ENABLE ROW LEVEL SECURITY;
ALTER TABLE paper_achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE paper_user_achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE paper_leaderboards ENABLE ROW LEVEL SECURITY;

-- RLS Policies for paper_accounts: users can only access their own accounts
CREATE POLICY "Users can manage their own paper accounts" ON paper_accounts
FOR ALL USING (auth.uid() = user_id);

-- RLS Policies for paper_positions: users can only access positions for their accounts
CREATE POLICY "Users can manage positions for their accounts" ON paper_positions
FOR ALL USING (
  auth.uid() IN (
    SELECT user_id FROM paper_accounts WHERE id = paper_positions.account_id
  )
);

-- RLS Policies for paper_orders: users can only access orders for their accounts
CREATE POLICY "Users can manage orders for their accounts" ON paper_orders
FOR ALL USING (
  auth.uid() IN (
    SELECT user_id FROM paper_accounts WHERE id = paper_orders.account_id
  )
);

-- RLS Policies for paper_transactions: users can only access transactions for their accounts
CREATE POLICY "Users can manage transactions for their accounts" ON paper_transactions
FOR ALL USING (
  auth.uid() IN (
    SELECT user_id FROM paper_accounts WHERE id = paper_transactions.account_id
  )
);

-- RLS Policies for paper_watchlists: users can only access watchlists for their accounts
CREATE POLICY "Users can manage watchlists for their accounts" ON paper_watchlists
FOR ALL USING (
  auth.uid() IN (
    SELECT user_id FROM paper_accounts WHERE id = paper_watchlists.account_id
  )
);

-- RLS Policies for paper_watchlist_items: users can only access items for their watchlists
CREATE POLICY "Users can manage watchlist items for their accounts" ON paper_watchlist_items
FOR ALL USING (
  auth.uid() IN (
    SELECT pa.user_id FROM paper_accounts pa
    JOIN paper_watchlists pw ON pa.id = pw.account_id
    WHERE pw.id = paper_watchlist_items.watchlist_id
  )
);

-- RLS Policies for paper_trade_journal: users can only access journal entries for their accounts
CREATE POLICY "Users can manage journal entries for their accounts" ON paper_trade_journal
FOR ALL USING (
  auth.uid() IN (
    SELECT user_id FROM paper_accounts WHERE id = paper_trade_journal.account_id
  )
);

-- RLS Policies for paper_performance_snapshots: users can only access snapshots for their accounts
CREATE POLICY "Users can manage snapshots for their accounts" ON paper_performance_snapshots
FOR ALL USING (
  auth.uid() IN (
    SELECT user_id FROM paper_accounts WHERE id = paper_performance_snapshots.account_id
  )
);

-- RLS Policies for paper_achievements: everyone can read achievements
CREATE POLICY "Anyone can read achievements" ON paper_achievements
FOR SELECT USING (true);

-- RLS Policies for paper_user_achievements: users can only access their own achievements
CREATE POLICY "Users can manage their own achievements" ON paper_user_achievements
FOR ALL USING (
  auth.uid() IN (
    SELECT user_id FROM paper_accounts WHERE id = paper_user_achievements.account_id
  )
);

-- RLS Policies for paper_leaderboards: everyone can read leaderboards, users can manage their own entries
CREATE POLICY "Anyone can read leaderboards" ON paper_leaderboards
FOR SELECT USING (true);

CREATE POLICY "Users can insert their own leaderboard entries" ON paper_leaderboards
FOR INSERT WITH CHECK (
  auth.uid() IN (
    SELECT user_id FROM paper_accounts WHERE id = paper_leaderboards.account_id
  )
);

CREATE POLICY "Users can update their own leaderboard entries" ON paper_leaderboards
FOR UPDATE USING (
  auth.uid() IN (
    SELECT user_id FROM paper_accounts WHERE id = paper_leaderboards.account_id
  )
);

CREATE POLICY "Users can delete their own leaderboard entries" ON paper_leaderboards
FOR DELETE USING (
  auth.uid() IN (
    SELECT user_id FROM paper_accounts WHERE id = paper_leaderboards.account_id
  )
);

-- Insert default achievements if they don't exist
INSERT INTO paper_achievements (name, description, category, points, criteria_type, criteria_value) VALUES
('First Trade', 'Complete your first trade', 'trading', 10, 'trades_count', 1),
('Hot Hand', 'Win 5 trades in a row', 'trading', 50, 'winning_streak', 5),
('Four Figures', 'Earn $1,000 in total profit', 'milestone', 100, 'total_profit', 1000),
('Risk Manager', 'Keep all positions under 5% of portfolio', 'risk', 30, 'position_size_discipline', 5),
('Disciplined Trader', 'Use stop losses on 10 consecutive trades', 'risk', 40, 'stop_loss_discipline', 10),
('Journal Master', 'Complete journal entries for 20 trades', 'education', 50, 'journal_entries', 20),
('Strategy Explorer', 'Try 5 different options strategies', 'education', 60, 'strategies_used', 5),
('Top Performer', 'Reach top 10 on weekly leaderboard', 'social', 100, 'leaderboard_rank', 10)
ON CONFLICT (name) DO NOTHING;

-- Create utility functions with proper search path
CREATE OR REPLACE FUNCTION update_paper_account_stats()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE paper_accounts 
  SET 
    total_trades = (
      SELECT COUNT(*) FROM paper_transactions 
      WHERE account_id = NEW.account_id AND transaction_type IN ('buy', 'sell')
    ),
    total_realized_pnl = (
      SELECT COALESCE(SUM(realized_pnl), 0) FROM paper_transactions 
      WHERE account_id = NEW.account_id AND realized_pnl IS NOT NULL
    ),
    updated_at = NOW()
  WHERE id = NEW.account_id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Create trigger for account statistics updates
DROP TRIGGER IF EXISTS update_paper_account_stats_trigger ON paper_transactions;
CREATE TRIGGER update_paper_account_stats_trigger
  AFTER INSERT OR UPDATE ON paper_transactions
  FOR EACH ROW
  EXECUTE FUNCTION update_paper_account_stats();

-- Create function to update position values
CREATE OR REPLACE FUNCTION update_paper_position_values()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  -- Calculate market value if current_price is provided
  IF NEW.current_price IS NOT NULL THEN
    NEW.market_value = NEW.quantity * NEW.current_price;
    -- Calculate unrealized P&L
    NEW.unrealized_pnl = (NEW.current_price - NEW.average_cost) * NEW.quantity;
    IF NEW.average_cost > 0 THEN
      NEW.unrealized_pnl_percentage = ((NEW.current_price - NEW.average_cost) / NEW.average_cost) * 100;
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Create trigger for position value updates
DROP TRIGGER IF EXISTS update_paper_position_values_trigger ON paper_positions;
CREATE TRIGGER update_paper_position_values_trigger
  BEFORE UPDATE ON paper_positions
  FOR EACH ROW
  EXECUTE FUNCTION update_paper_position_values();

-- Create function to update account equity
CREATE OR REPLACE FUNCTION update_paper_account_equity(account_uuid UUID)
RETURNS VOID AS $$
DECLARE
    total_positions_value DECIMAL(12,2);
    account_cash DECIMAL(12,2);
BEGIN
    -- Calculate total position value
    SELECT COALESCE(SUM(market_value), 0) INTO total_positions_value
    FROM paper_positions 
    WHERE account_id = account_uuid;
    
    -- Get current cash
    SELECT current_cash INTO account_cash
    FROM paper_accounts 
    WHERE id = account_uuid;
    
    -- Update total equity
    UPDATE paper_accounts 
    SET 
        total_equity = account_cash + total_positions_value,
        market_value_long = total_positions_value,
        total_unrealized_pnl = (
            SELECT COALESCE(SUM(unrealized_pnl), 0) 
            FROM paper_positions 
            WHERE account_id = account_uuid
        ),
        updated_at = NOW()
    WHERE id = account_uuid;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;