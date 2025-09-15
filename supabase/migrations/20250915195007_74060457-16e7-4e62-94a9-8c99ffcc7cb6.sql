-- Fix remaining RLS security issues

-- Enable RLS on remaining tables that don't have it
ALTER TABLE public.business_metrics_summary ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.query_intelligence_summary ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.market_data ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.intelligence_briefings ENABLE ROW LEVEL SECURITY;

-- Create service role policies for tables that need them
-- Business metrics - only service role can access
CREATE POLICY "Service role can manage business metrics" 
ON public.business_metrics_summary 
FOR ALL 
TO service_role
USING (true);

-- Query intelligence - only service role can access
CREATE POLICY "Service role can manage query intelligence" 
ON public.query_intelligence_summary 
FOR ALL 
TO service_role
USING (true);

-- Market data already has a policy, but let's ensure it's properly configured
-- Intelligence briefings already has a policy

-- Fix function search paths for better security
DROP FUNCTION IF EXISTS public.analyze_query_pattern(text);
CREATE OR REPLACE FUNCTION public.analyze_query_pattern(query_text text)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
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

DROP FUNCTION IF EXISTS public.check_and_award_achievements(uuid);
CREATE OR REPLACE FUNCTION public.check_and_award_achievements(user_uuid uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
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

DROP FUNCTION IF EXISTS public.trigger_query_analysis();
CREATE OR REPLACE FUNCTION public.trigger_query_analysis()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $function$
BEGIN
    -- Analyze query pattern for product intelligence
    PERFORM analyze_query_pattern(NEW.query_text);
    
    -- Check and award achievements
    PERFORM check_and_award_achievements(NEW.user_id);
    
    RETURN NEW;
END;
$function$;