-- Fix RLS security issues by enabling RLS on tables that have policies but RLS disabled

-- Enable RLS on all tables that have policies but RLS is currently disabled
ALTER TABLE public.analytics_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.api_performance ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.compliance_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.content_flags ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.daily_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.feature_usage ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.performance_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.query_patterns ENABLE ROW LEVEL SECURITY;

-- Create basic admin/service policies for tables that need them
-- These tables should only be accessible to service/admin users, not regular users

-- Analytics events - only service role can access
CREATE POLICY "Service role can manage analytics events" 
ON public.analytics_events 
FOR ALL 
TO service_role
USING (true);

-- API performance - only service role can access
CREATE POLICY "Service role can manage api performance" 
ON public.api_performance 
FOR ALL 
TO service_role
USING (true);

-- Compliance logs - only service role can access
CREATE POLICY "Service role can manage compliance logs" 
ON public.compliance_logs 
FOR ALL 
TO service_role
USING (true);

-- Content flags - only service role can access
CREATE POLICY "Service role can manage content flags" 
ON public.content_flags 
FOR ALL 
TO service_role
USING (true);

-- Daily metrics - only service role can access
CREATE POLICY "Service role can manage daily metrics" 
ON public.daily_metrics 
FOR ALL 
TO service_role
USING (true);

-- Feature usage - only service role can access
CREATE POLICY "Service role can manage feature usage" 
ON public.feature_usage 
FOR ALL 
TO service_role
USING (true);

-- Performance metrics - only service role can access
CREATE POLICY "Service role can manage performance metrics" 
ON public.performance_metrics 
FOR ALL 
TO service_role
USING (true);

-- Query patterns - only service role can access
CREATE POLICY "Service role can manage query patterns" 
ON public.query_patterns 
FOR ALL 
TO service_role
USING (true);