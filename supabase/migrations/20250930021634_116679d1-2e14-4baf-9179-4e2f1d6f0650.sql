-- Add RLS policies for vinyl_newsletters table

-- Allow traders to insert their own newsletters
CREATE POLICY "Traders can insert their own newsletters"
  ON public.vinyl_newsletters
  FOR INSERT
  WITH CHECK (
    auth.uid() = created_by
    AND EXISTS (
      SELECT 1 FROM traders_whitelist tw
      WHERE tw.email = (SELECT email FROM auth.users WHERE id = auth.uid())
    )
  );

-- Allow traders to view their own newsletters
CREATE POLICY "Traders can view their own newsletters"
  ON public.vinyl_newsletters
  FOR SELECT
  USING (
    auth.uid() = created_by
    AND EXISTS (
      SELECT 1 FROM traders_whitelist tw
      WHERE tw.email = (SELECT email FROM auth.users WHERE id = auth.uid())
    )
  );

-- Allow traders to update their own newsletters
CREATE POLICY "Traders can update their own newsletters"
  ON public.vinyl_newsletters
  FOR UPDATE
  USING (
    auth.uid() = created_by
    AND EXISTS (
      SELECT 1 FROM traders_whitelist tw
      WHERE tw.email = (SELECT email FROM auth.users WHERE id = auth.uid())
    )
  );

-- Allow traders to delete their own newsletters
CREATE POLICY "Traders can delete their own newsletters"
  ON public.vinyl_newsletters
  FOR DELETE
  USING (
    auth.uid() = created_by
    AND EXISTS (
      SELECT 1 FROM traders_whitelist tw
      WHERE tw.email = (SELECT email FROM auth.users WHERE id = auth.uid())
    )
  );