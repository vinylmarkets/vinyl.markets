-- Complete the Security Definer View fix by securing the remaining 3 views
-- These views contain sensitive user and business data that should be properly protected

-- Replace business_metrics_summary view with secure function
DROP VIEW IF EXISTS public.business_metrics_summary;

CREATE OR REPLACE FUNCTION public.get_business_metrics_summary()
RETURNS TABLE(
  date date,
  total_users integer,
  active_users integer,
  new_signups integer,
  mrr numeric,
  churn_rate numeric,
  engagement_rate numeric,
  previous_mrr numeric,
  mrr_growth_rate numeric
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $function$
BEGIN
  -- Only allow admins to access business metrics
  IF NOT EXISTS (
    SELECT 1 FROM public.users 
    WHERE id = auth.uid() AND role = 'admin'
  ) THEN
    RAISE EXCEPTION 'Access denied: Admin privileges required for business metrics';
  END IF;

  RETURN QUERY
  SELECT 
    dm.date,
    dm.total_users,
    dm.active_users,
    dm.new_signups,
    dm.mrr,
    dm.churn_rate,
    CASE
      WHEN dm.total_users > 0 THEN round(((dm.active_users::numeric / dm.total_users::numeric) * 100::numeric), 2)
      ELSE 0::numeric
    END AS engagement_rate,
    lag(dm.mrr) OVER (ORDER BY dm.date) AS previous_mrr,
    CASE
      WHEN lag(dm.mrr) OVER (ORDER BY dm.date) > 0::numeric THEN 
        round(((dm.mrr - lag(dm.mrr) OVER (ORDER BY dm.date)) / lag(dm.mrr) OVER (ORDER BY dm.date)) * 100::numeric, 2)
      ELSE 0::numeric
    END AS mrr_growth_rate
  FROM daily_metrics dm
  ORDER BY dm.date DESC;
END;
$function$;

-- Replace query_intelligence_summary view with secure function
DROP VIEW IF EXISTS public.query_intelligence_summary;

CREATE OR REPLACE FUNCTION public.get_query_intelligence_summary()
RETURNS TABLE(
  pattern_text text,
  frequency_count integer,
  user_intent_category text,
  suggested_feature text,
  priority_score integer,
  implemented boolean,
  unique_users_asking bigint,
  avg_satisfaction numeric
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $function$
BEGIN
  -- Only allow admins to access query intelligence data
  IF NOT EXISTS (
    SELECT 1 FROM public.users 
    WHERE id = auth.uid() AND role = 'admin'
  ) THEN
    RAISE EXCEPTION 'Access denied: Admin privileges required for query intelligence';
  END IF;

  RETURN QUERY
  SELECT 
    qp.pattern_text,
    qp.frequency_count,
    qp.user_intent_category,
    qp.suggested_feature,
    qp.priority_score,
    qp.implemented,
    count(DISTINCT tq.user_id) AS unique_users_asking,
    avg(tq.satisfaction_rating) AS avg_satisfaction
  FROM query_patterns qp
  LEFT JOIN terminal_queries tq ON (lower(tq.query_text) LIKE lower('%' || substring(qp.pattern_text, 1, 20) || '%'))
  GROUP BY qp.id, qp.pattern_text, qp.frequency_count, qp.user_intent_category, qp.suggested_feature, qp.priority_score, qp.implemented
  ORDER BY qp.frequency_count DESC, qp.priority_score DESC;
END;
$function$;

-- Replace user_analytics_dashboard view with secure function
DROP VIEW IF EXISTS public.user_analytics_dashboard;

CREATE OR REPLACE FUNCTION public.get_user_analytics_dashboard()
RETURNS TABLE(
  id uuid,
  full_name text,
  email text,
  subscription_tier text,
  signup_date timestamp with time zone,
  total_briefings bigint,
  total_queries bigint,
  achievements_earned bigint,
  avg_briefing_rating numeric,
  last_active timestamp with time zone,
  total_time_spent bigint
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $function$
BEGIN
  -- Only allow admins to access user analytics data
  IF NOT EXISTS (
    SELECT 1 FROM public.users 
    WHERE id = auth.uid() AND role = 'admin'
  ) THEN
    RAISE EXCEPTION 'Access denied: Admin privileges required for user analytics';
  END IF;

  RETURN QUERY
  SELECT 
    u.id,
    u.full_name,
    u.email,
    u.subscription_tier,
    u.created_at AS signup_date,
    count(DISTINCT ub.id) AS total_briefings,
    count(DISTINCT tq.id) AS total_queries,
    count(DISTINCT ua.id) AS achievements_earned,
    avg(ub.rating) AS avg_briefing_rating,
    max(ues.last_active_at) AS last_active,
    sum(ues.time_spent_minutes) AS total_time_spent
  FROM users u
  LEFT JOIN user_briefings ub ON u.id = ub.user_id
  LEFT JOIN terminal_queries tq ON u.id = tq.user_id
  LEFT JOIN user_achievements ua ON u.id = ua.user_id
  LEFT JOIN user_engagement_summary ues ON u.id = ues.user_id
  GROUP BY u.id, u.full_name, u.email, u.subscription_tier, u.created_at;
END;
$function$;

-- Create a public health check function that doesn't expose sensitive data
CREATE OR REPLACE FUNCTION public.get_public_app_status()
RETURNS TABLE(
  status text,
  active_features text[],
  last_updated timestamp with time zone
)
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = 'public'
AS $function$
BEGIN
  -- This function provides basic app status without sensitive data
  -- Can be accessed by any authenticated user
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'Authentication required';
  END IF;

  RETURN QUERY
  SELECT 
    'operational'::text AS status,
    ARRAY['briefings', 'terminal', 'analytics']::text[] AS active_features,
    NOW() AS last_updated;
END;
$function$;

-- Add helpful comment about migration impact
COMMENT ON FUNCTION public.get_business_metrics_summary() IS 'Secure admin-only access to business metrics - replaces business_metrics_summary view';
COMMENT ON FUNCTION public.get_query_intelligence_summary() IS 'Secure admin-only access to query intelligence - replaces query_intelligence_summary view';
COMMENT ON FUNCTION public.get_user_analytics_dashboard() IS 'Secure admin-only access to user analytics - replaces user_analytics_dashboard view';
COMMENT ON FUNCTION public.get_public_app_status() IS 'Public app status endpoint for authenticated users - no sensitive data exposed';