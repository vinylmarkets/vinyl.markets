-- Update the paper account to reflect the GME position value
UPDATE paper_accounts 
SET 
  market_value_long = 29106.00,  -- GME market value
  total_equity = current_cash + 29106.00,  -- Add position value to cash
  total_unrealized_pnl = 1566.00,  -- GME unrealized P&L
  updated_at = NOW()
WHERE id = '7163e4fd-abd5-46ea-a9e5-7d84badf586a';