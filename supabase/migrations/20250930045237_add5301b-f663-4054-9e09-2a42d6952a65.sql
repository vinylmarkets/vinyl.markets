-- Clean up duplicate and conflicting RLS policies for vinyl_newsletters
-- Drop all existing policies first
DROP POLICY IF EXISTS "Traders can view vinyl newsletters" ON public.vinyl_newsletters;
DROP POLICY IF EXISTS "Traders can view their own newsletters" ON public.vinyl_newsletters;
DROP POLICY IF EXISTS "Traders can create vinyl newsletters" ON public.vinyl_newsletters;
DROP POLICY IF EXISTS "Traders can insert their own newsletters" ON public.vinyl_newsletters;
DROP POLICY IF EXISTS "Traders can update vinyl newsletters" ON public.vinyl_newsletters;
DROP POLICY IF EXISTS "Traders can update their own newsletters" ON public.vinyl_newsletters;
DROP POLICY IF EXISTS "Traders can delete vinyl newsletters" ON public.vinyl_newsletters;
DROP POLICY IF EXISTS "Traders can delete their own newsletters" ON public.vinyl_newsletters;

-- Create clean, simple policies
-- Allow all traders to view all vinyl newsletters
CREATE POLICY "Traders can view all vinyl newsletters"
  ON public.vinyl_newsletters
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM traders_whitelist
      WHERE traders_whitelist.email = (
        SELECT email FROM auth.users WHERE id = auth.uid()
      )
    )
  );

-- Allow traders to create newsletters (they become the creator)
CREATE POLICY "Traders can create newsletters"
  ON public.vinyl_newsletters
  FOR INSERT
  WITH CHECK (
    auth.uid() = created_by AND
    EXISTS (
      SELECT 1 FROM traders_whitelist
      WHERE traders_whitelist.email = (
        SELECT email FROM auth.users WHERE id = auth.uid()
      )
    )
  );

-- Allow traders to update their own newsletters
CREATE POLICY "Traders can update own newsletters"
  ON public.vinyl_newsletters
  FOR UPDATE
  USING (
    auth.uid() = created_by AND
    EXISTS (
      SELECT 1 FROM traders_whitelist
      WHERE traders_whitelist.email = (
        SELECT email FROM auth.users WHERE id = auth.uid()
      )
    )
  );

-- Allow traders to delete their own newsletters
CREATE POLICY "Traders can delete own newsletters"
  ON public.vinyl_newsletters
  FOR DELETE
  USING (
    auth.uid() = created_by AND
    EXISTS (
      SELECT 1 FROM traders_whitelist
      WHERE traders_whitelist.email = (
        SELECT email FROM auth.users WHERE id = auth.uid()
      )
    )
  );