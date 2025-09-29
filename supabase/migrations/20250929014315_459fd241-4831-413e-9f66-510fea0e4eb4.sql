-- Fix function search path security warnings
-- Update existing functions to have proper search_path settings

-- Fix log_cron_execution function
CREATE OR REPLACE FUNCTION log_cron_execution(job_name text, status text, response_data jsonb)
RETURNS void 
LANGUAGE plpgsql 
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    INSERT INTO public.cron_job_logs (job_name, status, response_id)
    VALUES (job_name, status, (response_data->>'request_id')::bigint);
END;
$$;

-- Fix update_trading_signals_updated_at function  
CREATE OR REPLACE FUNCTION update_trading_signals_updated_at()
RETURNS TRIGGER 
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$;

-- View all active cron jobs for verification (fixed query)
SELECT 
    jobid, 
    jobname,
    schedule,
    active
FROM cron.job 
WHERE jobname LIKE '%pipeline%' OR jobname LIKE '%trading%' OR jobname LIKE '%market%' OR jobname LIKE '%execute%'
ORDER BY jobname;