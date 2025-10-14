-- Temporarily disable whitelist check for development
-- This makes is_whitelisted_trader() always return true

CREATE OR REPLACE FUNCTION public.is_whitelisted_trader(user_email text)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  -- DEVELOPMENT MODE: Always return true (whitelist disabled)
  SELECT true;
  
  -- PRODUCTION MODE: Uncomment below to re-enable whitelist
  -- SELECT EXISTS (
  --   SELECT 1 FROM public.traders_whitelist 
  --   WHERE email = user_email
  -- );
$$;