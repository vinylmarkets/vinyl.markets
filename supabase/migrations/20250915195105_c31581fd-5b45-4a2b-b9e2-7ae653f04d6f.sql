-- Fix RLS on actual tables only (not views)

-- Enable RLS on remaining tables that don't have it (excluding views)
ALTER TABLE public.market_data ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.intelligence_briefings ENABLE ROW LEVEL SECURITY;

-- Views (business_metrics_summary, query_intelligence_summary, user_analytics_dashboard) 
-- inherit security from their underlying tables, so they don't need RLS enabled

-- Fix remaining function search paths for better security
DROP FUNCTION IF EXISTS public.screen_content_compliance(text);
CREATE OR REPLACE FUNCTION public.screen_content_compliance(content_text text)
RETURNS boolean
LANGUAGE plpgsql
SET search_path = public
AS $function$
DECLARE
    flagged_phrases TEXT[] := ARRAY['buy now', 'sell immediately', 'guaranteed returns', 'hot tip', 'insider information'];
    phrase TEXT;
BEGIN
    -- Check for prohibited phrases
    FOREACH phrase IN ARRAY flagged_phrases
    LOOP
        IF LOWER(content_text) LIKE '%' || phrase || '%' THEN
            RETURN false;
        END IF;
    END LOOP;
    
    RETURN true;
END;
$function$;

DROP FUNCTION IF EXISTS public.trigger_compliance_screening();
CREATE OR REPLACE FUNCTION public.trigger_compliance_screening()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $function$
BEGIN
    -- Screen academic content
    IF NOT screen_content_compliance(NEW.content_academic) THEN
        INSERT INTO public.content_flags (content_type, content_id, flag_reason, flag_severity)
        VALUES ('intelligence_briefing', NEW.id, 'Prohibited language in academic content', 'high');
    END IF;
    
    -- Screen plain speak content
    IF NOT screen_content_compliance(NEW.content_plain_speak) THEN
        INSERT INTO public.content_flags (content_type, content_id, flag_reason, flag_severity)
        VALUES ('intelligence_briefing', NEW.id, 'Prohibited language in plain speak content', 'high');
    END IF;
    
    RETURN NEW;
END;
$function$;

DROP FUNCTION IF EXISTS public.create_user_briefing(uuid, uuid, uuid);
CREATE OR REPLACE FUNCTION public.create_user_briefing(p_user_id uuid, p_briefing_id uuid, p_portfolio_id uuid DEFAULT NULL::uuid)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $function$
DECLARE
    new_user_briefing_id UUID;
    user_symbols TEXT[];
BEGIN
    -- Get user's portfolio symbols if portfolio_id provided
    IF p_portfolio_id IS NOT NULL THEN
        SELECT ARRAY_AGG(symbol) INTO user_symbols
        FROM public.portfolio_holdings 
        WHERE portfolio_id = p_portfolio_id;
    END IF;
    
    -- Create user briefing record
    INSERT INTO public.user_briefings (
        user_id,
        briefing_id,
        portfolio_id,
        symbols_analyzed,
        delivered_at
    ) VALUES (
        p_user_id,
        p_briefing_id,
        p_portfolio_id,
        user_symbols,
        NOW()
    ) RETURNING id INTO new_user_briefing_id;
    
    RETURN new_user_briefing_id;
END;
$function$;