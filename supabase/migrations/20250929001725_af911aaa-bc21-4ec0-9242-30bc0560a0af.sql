-- Fix Security Definer View issue by converting non-critical functions to SECURITY INVOKER
-- Keep critical security functions as SECURITY DEFINER for proper access control

-- Convert analytics functions to SECURITY INVOKER (safer)
CREATE OR REPLACE FUNCTION public.track_user_event(p_user_id uuid, p_event_type text, p_event_properties jsonb DEFAULT NULL::jsonb, p_session_id text DEFAULT NULL::text)
RETURNS uuid
LANGUAGE plpgsql
SECURITY INVOKER  -- Changed from SECURITY DEFINER
SET search_path = 'public'
AS $function$
DECLARE
    event_id UUID;
BEGIN
    INSERT INTO public.analytics_events (
        user_id,
        session_id,
        event_type,
        event_properties
    ) VALUES (
        p_user_id,
        p_session_id,
        p_event_type,
        p_event_properties
    ) RETURNING id INTO event_id;
    
    RETURN event_id;
END;
$function$;

-- Convert user engagement function to SECURITY INVOKER
CREATE OR REPLACE FUNCTION public.update_user_engagement(p_user_id uuid, p_event_type text)
RETURNS void
LANGUAGE plpgsql
SECURITY INVOKER  -- Changed from SECURITY DEFINER
SET search_path = 'public'
AS $function$
DECLARE
    today_date DATE := CURRENT_DATE;
BEGIN
    -- Insert or update user engagement for today
    INSERT INTO public.user_engagement_summary (
        user_id,
        date,
        briefings_read,
        terminal_queries_made,
        pages_visited,
        last_active_at
    ) VALUES (
        p_user_id,
        today_date,
        CASE WHEN p_event_type = 'briefing_read' THEN 1 ELSE 0 END,
        CASE WHEN p_event_type = 'terminal_query' THEN 1 ELSE 0 END,
        1,
        NOW()
    )
    ON CONFLICT (user_id, date)
    DO UPDATE SET
        briefings_read = public.user_engagement_summary.briefings_read + 
            CASE WHEN p_event_type = 'briefing_read' THEN 1 ELSE 0 END,
        terminal_queries_made = public.user_engagement_summary.terminal_queries_made + 
            CASE WHEN p_event_type = 'terminal_query' THEN 1 ELSE 0 END,
        pages_visited = public.user_engagement_summary.pages_visited + 1,
        last_active_at = NOW();
END;
$function$;

-- Convert API performance tracking to SECURITY INVOKER
CREATE OR REPLACE FUNCTION public.track_api_performance(p_endpoint text, p_method text, p_response_time_ms integer, p_status_code integer, p_user_id uuid DEFAULT NULL::uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY INVOKER  -- Changed from SECURITY DEFINER
SET search_path = 'public'
AS $function$
BEGIN
    INSERT INTO public.api_performance (
        endpoint,
        method,
        response_time_ms,
        status_code,
        user_id
    ) VALUES (
        p_endpoint,
        p_method,
        p_response_time_ms,
        p_status_code,
        p_user_id
    );
END;
$function$;

-- Fix search_path for critical SECURITY DEFINER functions that must remain
CREATE OR REPLACE FUNCTION public.is_current_user_admin()
RETURNS boolean
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path = 'public'  -- Added missing search_path
AS $function$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.users 
    WHERE id = auth.uid() AND role = 'admin'
  );
END;
$function$;

-- Add search_path to other critical security functions
CREATE OR REPLACE FUNCTION public.check_terminal_query_limits(user_uuid uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'  -- Added missing search_path
AS $function$
DECLARE
    user_tier TEXT;
    daily_queries INTEGER;
    current_date_queries INTEGER;
BEGIN
    -- Get user's subscription tier
    SELECT subscription_tier INTO user_tier FROM public.users WHERE id = user_uuid;
    
    -- Count today's queries
    SELECT COUNT(*) INTO current_date_queries 
    FROM public.terminal_queries 
    WHERE user_id = user_uuid 
    AND created_at >= CURRENT_DATE;
    
    -- Check limits based on tier
    CASE user_tier
        WHEN 'free' THEN daily_queries := 10;
        WHEN 'essential' THEN daily_queries := -1; -- unlimited
        WHEN 'pro' THEN daily_queries := -1; -- unlimited
        ELSE daily_queries := 0;
    END CASE;
    
    -- Return true if under limit (or unlimited)
    RETURN (daily_queries = -1 OR current_date_queries < daily_queries);
END;
$function$;