-- Fix Security Definer View issue by adding proper access controls to admin views
-- These views contain sensitive data and should only be accessible to admins

-- Enable RLS on admin views by recreating them as security functions instead
-- This prevents unauthorized access to sensitive aggregated data

-- Replace admin_executive_summary view with a secure function
DROP VIEW IF EXISTS public.admin_executive_summary;

CREATE OR REPLACE FUNCTION public.get_admin_executive_summary()
RETURNS TABLE(
  total_users bigint,
  paid_users bigint, 
  users_last_7_days bigint,
  briefings_today bigint,
  queries_today bigint,
  monthly_revenue bigint
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $function$
BEGIN
  -- Only allow admins to access this data
  IF NOT EXISTS (
    SELECT 1 FROM public.users 
    WHERE id = auth.uid() AND role = 'admin'
  ) THEN
    RAISE EXCEPTION 'Access denied: Admin privileges required';
  END IF;

  RETURN QUERY
  SELECT 
    (SELECT count(*) FROM users) AS total_users,
    (SELECT count(*) FROM users WHERE subscription_tier <> 'free') AS paid_users,
    (SELECT count(*) FROM users WHERE created_at >= (CURRENT_DATE - '7 days'::interval)) AS users_last_7_days,
    (SELECT count(*) FROM user_briefings WHERE delivered_at >= CURRENT_DATE) AS briefings_today,
    (SELECT count(*) FROM terminal_queries WHERE created_at >= CURRENT_DATE) AS queries_today,
    (SELECT COALESCE(sum(
      CASE subscription_tier
        WHEN 'essential' THEN 29
        WHEN 'pro' THEN 79
        ELSE 0
      END
    ), 0) FROM users WHERE subscription_status = 'active') AS monthly_revenue;
END;
$function$;

-- Replace admin_feature_usage view with secure function
DROP VIEW IF EXISTS public.admin_feature_usage;

CREATE OR REPLACE FUNCTION public.get_admin_feature_usage()
RETURNS TABLE(
  feature text,
  unique_users bigint,
  total_usage bigint,
  usage_date date
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $function$
BEGIN
  -- Only allow admins to access this data
  IF NOT EXISTS (
    SELECT 1 FROM public.users 
    WHERE id = auth.uid() AND role = 'admin'
  ) THEN
    RAISE EXCEPTION 'Access denied: Admin privileges required';
  END IF;

  RETURN QUERY
  SELECT 'briefings'::text AS feature,
    count(DISTINCT user_briefings.user_id) AS unique_users,
    count(*) AS total_usage,
    date(user_briefings.delivered_at) AS usage_date
  FROM user_briefings
  WHERE user_briefings.delivered_at >= (CURRENT_DATE - '30 days'::interval)
  GROUP BY date(user_briefings.delivered_at)
  UNION ALL
  SELECT 'terminal'::text AS feature,
    count(DISTINCT terminal_queries.user_id) AS unique_users,
    count(*) AS total_usage,
    date(terminal_queries.created_at) AS usage_date
  FROM terminal_queries
  WHERE terminal_queries.created_at >= (CURRENT_DATE - '30 days'::interval)
  GROUP BY date(terminal_queries.created_at)
  ORDER BY usage_date DESC;
END;
$function$;

-- Replace admin_revenue_analytics view with secure function
DROP VIEW IF EXISTS public.admin_revenue_analytics;

CREATE OR REPLACE FUNCTION public.get_admin_revenue_analytics()
RETURNS TABLE(
  subscription_tier text,
  subscriber_count bigint,
  monthly_revenue bigint,
  avg_customer_age_days numeric
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $function$
BEGIN
  -- Only allow admins to access this data
  IF NOT EXISTS (
    SELECT 1 FROM public.users 
    WHERE id = auth.uid() AND role = 'admin'
  ) THEN
    RAISE EXCEPTION 'Access denied: Admin privileges required';
  END IF;

  RETURN QUERY
  SELECT 
    users.subscription_tier,
    count(*) AS subscriber_count,
    CASE users.subscription_tier
      WHEN 'essential' THEN (count(*) * 29)
      WHEN 'pro' THEN (count(*) * 79)
      ELSE 0::bigint
    END AS monthly_revenue,
    avg(EXTRACT(day FROM (CURRENT_DATE::timestamp with time zone - created_at))) AS avg_customer_age_days
  FROM users
  WHERE subscription_status = 'active'
  GROUP BY subscription_tier;
END;
$function$;

-- Replace admin_user_growth view with secure function  
DROP VIEW IF EXISTS public.admin_user_growth;

CREATE OR REPLACE FUNCTION public.get_admin_user_growth()
RETURNS TABLE(
  signup_date date,
  new_signups bigint,
  paid_signups bigint,
  cumulative_users bigint
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $function$
BEGIN
  -- Only allow admins to access this data
  IF NOT EXISTS (
    SELECT 1 FROM public.users 
    WHERE id = auth.uid() AND role = 'admin'
  ) THEN
    RAISE EXCEPTION 'Access denied: Admin privileges required';
  END IF;

  RETURN QUERY
  SELECT 
    date(created_at) AS signup_date,
    count(*) AS new_signups,
    count(*) FILTER (WHERE subscription_tier <> 'free') AS paid_signups,
    sum(count(*)) OVER (ORDER BY date(created_at)) AS cumulative_users
  FROM users
  GROUP BY date(created_at)
  ORDER BY date(created_at) DESC;
END;
$function$;

-- Keep business_metrics_summary and other non-admin views as they are less sensitive
-- and can be protected through existing RLS policies

-- Note: Admin dashboard code will need to be updated to call these functions instead of querying views directly