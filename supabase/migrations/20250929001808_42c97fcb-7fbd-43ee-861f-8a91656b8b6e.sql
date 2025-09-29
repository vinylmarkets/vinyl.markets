-- Continue fixing Security Definer functions - convert more non-critical functions to SECURITY INVOKER
-- while keeping essential security/admin functions as SECURITY DEFINER

-- Convert metrics generation to SECURITY INVOKER (system function can be called by service role)
CREATE OR REPLACE FUNCTION public.generate_daily_metrics(target_date date DEFAULT CURRENT_DATE)
RETURNS void
LANGUAGE plpgsql
SECURITY INVOKER  -- Changed from SECURITY DEFINER
SET search_path = 'public'
AS $function$
BEGIN
    INSERT INTO public.daily_metrics (
        date,
        total_users,
        active_users,
        new_signups,
        briefings_delivered,
        terminal_queries,
        subscription_conversions,
        mrr
    )
    SELECT 
        target_date,
        (SELECT COUNT(*) FROM public.users WHERE created_at <= target_date + INTERVAL '1 day'),
        (SELECT COUNT(DISTINCT user_id) FROM public.analytics_events WHERE DATE(created_at) = target_date),
        (SELECT COUNT(*) FROM public.users WHERE DATE(created_at) = target_date),
        (SELECT COUNT(*) FROM public.user_briefings WHERE DATE(delivered_at) = target_date),
        (SELECT COUNT(*) FROM public.terminal_queries WHERE DATE(created_at) = target_date),
        (SELECT COUNT(*) FROM public.users WHERE DATE(created_at) = target_date AND subscription_tier != 'free'),
        (SELECT 
            COALESCE(SUM(
                CASE subscription_tier
                    WHEN 'essential' THEN 29.00
                    WHEN 'pro' THEN 79.00
                    ELSE 0
                END
            ), 0)
            FROM public.users 
            WHERE subscription_status = 'active' 
            AND created_at <= target_date + INTERVAL '1 day'
        )
    ON CONFLICT (date) DO UPDATE SET
        total_users = EXCLUDED.total_users,
        active_users = EXCLUDED.active_users,
        new_signups = EXCLUDED.new_signups,
        briefings_delivered = EXCLUDED.briefings_delivered,
        terminal_queries = EXCLUDED.terminal_queries,
        subscription_conversions = EXCLUDED.subscription_conversions,
        mrr = EXCLUDED.mrr,
        updated_at = NOW();
END;
$function$;

-- Convert paper trading functions to SECURITY INVOKER (safer for user operations)
CREATE OR REPLACE FUNCTION public.update_paper_account_equity(account_uuid uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY INVOKER  -- Changed from SECURITY DEFINER
SET search_path = 'public'
AS $function$
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
$function$;

-- Convert cache cleanup to SECURITY INVOKER (utility function)
CREATE OR REPLACE FUNCTION public.clean_expired_insights_cache()
RETURNS void
LANGUAGE plpgsql
SECURITY INVOKER  -- Changed from SECURITY DEFINER
SET search_path = 'public'
AS $function$
BEGIN
    DELETE FROM kg_insights_cache WHERE expires_at < NOW();
END;
$function$;

-- Add search_path to remaining critical SECURITY DEFINER functions that must stay
CREATE OR REPLACE FUNCTION public.analyze_query_pattern(query_text text)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'  -- Added missing search_path
AS $function$
DECLARE
    pattern_keywords TEXT[];
    keyword TEXT;
    existing_pattern RECORD;
BEGIN
    -- Extract key financial terms (simplified for now)
    pattern_keywords := string_to_array(lower(query_text), ' ');
    
    -- Look for existing similar patterns
    FOR existing_pattern IN 
        SELECT * FROM public.query_patterns 
        WHERE pattern_text ILIKE '%' || substring(query_text, 1, 20) || '%'
    LOOP
        -- Update frequency count
        UPDATE public.query_patterns 
        SET frequency_count = frequency_count + 1,
            updated_at = NOW()
        WHERE id = existing_pattern.id;
        RETURN;
    END LOOP;
    
    -- Create new pattern if none found
    INSERT INTO public.query_patterns (pattern_text, user_intent_category)
    VALUES (substring(query_text, 1, 100), 'general');
END;
$function$;

CREATE OR REPLACE FUNCTION public.check_and_award_achievements(user_uuid uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'  -- Added missing search_path
AS $function$
DECLARE
    query_count INTEGER;
    achievement_record RECORD;
BEGIN
    -- Check terminal query achievements
    SELECT COUNT(*) INTO query_count 
    FROM public.terminal_queries 
    WHERE user_id = user_uuid;
    
    -- Award "Question Asker" achievement at 10 queries
    IF query_count >= 10 THEN
        SELECT * INTO achievement_record 
        FROM public.achievements 
        WHERE name = 'Question Asker';
        
        IF FOUND THEN
            INSERT INTO public.user_achievements (user_id, achievement_id)
            VALUES (user_uuid, achievement_record.id)
            ON CONFLICT (user_id, achievement_id) DO NOTHING;
        END IF;
    END IF;
END;
$function$;