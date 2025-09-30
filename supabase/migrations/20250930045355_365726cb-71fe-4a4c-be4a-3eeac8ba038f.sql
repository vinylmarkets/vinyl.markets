-- Fix the RLS policy issue by using the existing security definer function
-- Drop the problematic policy that's accessing auth.users directly
DROP POLICY IF EXISTS "Traders can view all vinyl newsletters" ON public.vinyl_newsletters;

-- Create a new policy using the existing is_trader_by_user_id function which is security definer
CREATE POLICY "Traders can view all vinyl newsletters"
  ON public.vinyl_newsletters
  FOR SELECT
  USING (is_trader_by_user_id(auth.uid()));

-- Also fix the other policies to use the security definer function
DROP POLICY IF EXISTS "Traders can create newsletters" ON public.vinyl_newsletters;
DROP POLICY IF EXISTS "Traders can update own newsletters" ON public.vinyl_newsletters;
DROP POLICY IF EXISTS "Traders can delete own newsletters" ON public.vinyl_newsletters;

CREATE POLICY "Traders can create newsletters"
  ON public.vinyl_newsletters
  FOR INSERT
  WITH CHECK (
    auth.uid() = created_by AND
    is_trader_by_user_id(auth.uid())
  );

CREATE POLICY "Traders can update own newsletters"
  ON public.vinyl_newsletters
  FOR UPDATE
  USING (
    auth.uid() = created_by AND
    is_trader_by_user_id(auth.uid())
  );

CREATE POLICY "Traders can delete own newsletters"
  ON public.vinyl_newsletters
  FOR DELETE
  USING (
    auth.uid() = created_by AND
    is_trader_by_user_id(auth.uid())
  );