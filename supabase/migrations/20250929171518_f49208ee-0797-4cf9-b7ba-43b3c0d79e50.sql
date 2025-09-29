-- Update the older account (the one being used by the system) with correct values
-- and deactivate the newer duplicate account

-- First, update the older account with the correct values from the newer one
UPDATE paper_accounts 
SET 
  total_equity = 129106.00,
  market_value_long = 29106.00,
  total_unrealized_pnl = 1566.00,
  updated_at = NOW()
WHERE id = '7163e4fd-abd5-46ea-a9e5-7d84badf586a';

-- Deactivate the newer duplicate account to avoid confusion
UPDATE paper_accounts 
SET is_active = false
WHERE id = '4e9b73ca-dbc9-4991-8203-2fe226afd520';