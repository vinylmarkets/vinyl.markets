-- Just enable RLS on the remaining tables without modifying functions

-- These were already done in previous migration, but let's ensure they're enabled
-- ALTER TABLE public.market_data ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE public.intelligence_briefings ENABLE ROW LEVEL SECURITY;

-- Check RLS status and enable where needed
DO $$
BEGIN
    -- Enable RLS on market_data if not already enabled
    IF NOT (SELECT relrowsecurity FROM pg_class WHERE relname = 'market_data' AND relnamespace = 'public'::regnamespace) THEN
        ALTER TABLE public.market_data ENABLE ROW LEVEL SECURITY;
    END IF;
    
    -- Enable RLS on intelligence_briefings if not already enabled  
    IF NOT (SELECT relrowsecurity FROM pg_class WHERE relname = 'intelligence_briefings' AND relnamespace = 'public'::regnamespace) THEN
        ALTER TABLE public.intelligence_briefings ENABLE ROW LEVEL SECURITY;
    END IF;
END $$;