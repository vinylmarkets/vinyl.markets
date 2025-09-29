-- Insert a sample GME position for the user's paper account
-- First, get the most recent paper account for the user
DO $$
DECLARE
    account_uuid UUID;
    current_price NUMERIC := 26.95; -- Current GME price from logs
    quantity NUMERIC := 1080;
    avg_cost NUMERIC := 25.50; -- Example average cost
BEGIN
    -- Get the user's most recent active paper account
    SELECT id INTO account_uuid 
    FROM paper_accounts 
    WHERE user_id = '008337a6-677b-48f3-a16f-8409920a2513' 
    AND is_active = true 
    ORDER BY created_at DESC 
    LIMIT 1;
    
    IF account_uuid IS NOT NULL THEN
        -- Insert the GME position
        INSERT INTO paper_positions (
            account_id,
            symbol,
            asset_type,
            quantity,
            side,
            average_cost,
            current_price,
            market_value,
            cost_basis,
            unrealized_pnl,
            unrealized_pnl_percentage,
            daily_pnl,
            opened_at,
            updated_at
        ) VALUES (
            account_uuid,
            'GME',
            'stock',
            quantity,
            'long',
            avg_cost,
            current_price,
            quantity * current_price,
            quantity * avg_cost,
            quantity * (current_price - avg_cost),
            ((current_price - avg_cost) / avg_cost) * 100,
            0, -- No daily P&L calculation for now
            NOW(),
            NOW()
        );
        
        RAISE NOTICE 'Created GME position for account %', account_uuid;
    ELSE
        RAISE NOTICE 'No active paper account found for user';
    END IF;
END $$;