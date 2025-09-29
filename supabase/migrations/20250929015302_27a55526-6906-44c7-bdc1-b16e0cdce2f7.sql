-- Create traders whitelist table for secure access control
CREATE TABLE public.traders_whitelist (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  email text UNIQUE NOT NULL,
  access_level text NOT NULL DEFAULT 'viewer' CHECK (access_level IN ('admin', 'viewer', 'trader')),
  last_login timestamp with time zone,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.traders_whitelist ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Service role can manage traders whitelist" 
ON public.traders_whitelist 
FOR ALL 
USING (true);

-- Create function to check if user is whitelisted trader
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

-- Create function to get trader access level
CREATE OR REPLACE FUNCTION public.get_trader_access_level(user_email text)
RETURNS text
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT access_level FROM public.traders_whitelist 
  WHERE email = user_email;
$$;

-- Create function to update last login
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