-- Move GME position to the correct (older) paper account that the system is using
-- and clean up the duplicate accounts

-- First, move the GME position to the older account
UPDATE paper_positions 
SET account_id = '7163e4fd-abd5-46ea-a9e5-7d84badf586a'
WHERE account_id = '4e9b73ca-dbc9-4991-8203-2fe226afd520' 
AND symbol = 'GME';

-- Optionally, we could delete the newer duplicate account
-- DELETE FROM paper_accounts WHERE id = '4e9b73ca-dbc9-4991-8203-2fe226afd520';