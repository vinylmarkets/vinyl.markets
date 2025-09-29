
-- Clean up paper trading data for testing
-- This will delete all positions and transactions for user 008337a6-677b-48f3-a16f-8409920a2513

-- Delete all paper positions for the user's accounts
DELETE FROM paper_positions
WHERE account_id IN (
  SELECT id FROM paper_accounts 
  WHERE user_id = '008337a6-677b-48f3-a16f-8409920a2513'
);

-- Delete all paper transactions for the user's accounts
DELETE FROM paper_transactions
WHERE account_id IN (
  SELECT id FROM paper_accounts 
  WHERE user_id = '008337a6-677b-48f3-a16f-8409920a2513'
);

-- Reset the paper account to starting balance
UPDATE paper_accounts
SET 
  current_cash = 100000.00,
  total_equity = 100000.00,
  market_value_long = 0,
  total_unrealized_pnl = 0,
  total_realized_pnl = 0,
  total_trades = 0,
  updated_at = NOW()
WHERE user_id = '008337a6-677b-48f3-a16f-8409920a2513';

-- Keep only one paper account per user
DELETE FROM paper_accounts
WHERE user_id = '008337a6-677b-48f3-a16f-8409920a2513'
AND id NOT IN (
  SELECT id FROM paper_accounts
  WHERE user_id = '008337a6-677b-48f3-a16f-8409920a2513'
  ORDER BY created_at DESC
  LIMIT 1
);
