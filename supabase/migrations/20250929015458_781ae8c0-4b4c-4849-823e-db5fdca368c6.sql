-- Fix search path security warnings for functions we just created
CREATE OR REPLACE FUNCTION public.is_whitelisted_trader(user_email text)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.traders_whitelist 
    WHERE email = user_email
  );
$$;

CREATE OR REPLACE FUNCTION public.get_trader_access_level(user_email text)
RETURNS text
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT access_level FROM public.traders_whitelist 
  WHERE email = user_email;
$$;

CREATE OR REPLACE FUNCTION public.update_trader_last_login(user_email text)
RETURNS void
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  UPDATE public.traders_whitelist 
  SET last_login = now(), updated_at = now()
  WHERE email = user_email;
$$;