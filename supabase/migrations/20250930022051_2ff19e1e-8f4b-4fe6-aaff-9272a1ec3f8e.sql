-- Fix RLS policies to avoid auth.users access issues
-- Drop the problematic policies first
DROP POLICY IF EXISTS "Traders can insert their own newsletters" ON public.vinyl_newsletters;
DROP POLICY IF EXISTS "Traders can view their own newsletters" ON public.vinyl_newsletters;
DROP POLICY IF EXISTS "Traders can update their own newsletters" ON public.vinyl_newsletters;
DROP POLICY IF EXISTS "Traders can delete their own newsletters" ON public.vinyl_newsletters;

-- Create a security definer function to check trader status
CREATE OR REPLACE FUNCTION public.is_trader_by_user_id(user_uuid uuid)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM traders_whitelist tw
    WHERE tw.email = (SELECT email FROM auth.users WHERE id = user_uuid)
  );
$$;

-- Recreate policies using the security definer function
CREATE POLICY "Traders can insert their own newsletters"
  ON public.vinyl_newsletters
  FOR INSERT
  WITH CHECK (
    auth.uid() = created_by
    AND is_trader_by_user_id(auth.uid())
  );

CREATE POLICY "Traders can view their own newsletters"
  ON public.vinyl_newsletters
  FOR SELECT
  USING (
    auth.uid() = created_by
    AND is_trader_by_user_id(auth.uid())
  );

CREATE POLICY "Traders can update their own newsletters"
  ON public.vinyl_newsletters
  FOR UPDATE
  USING (
    auth.uid() = created_by
    AND is_trader_by_user_id(auth.uid())
  );

CREATE POLICY "Traders can delete their own newsletters"
  ON public.vinyl_newsletters
  FOR DELETE
  USING (
    auth.uid() = created_by
    AND is_trader_by_user_id(auth.uid())
  );