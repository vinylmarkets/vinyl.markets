-- Fix RLS policies for vinyl_newsletter_analytics to allow INSERT
CREATE POLICY "System can insert vinyl newsletter analytics"
  ON public.vinyl_newsletter_analytics
  FOR INSERT
  WITH CHECK (true);

-- Also allow traders to insert their own analytics
CREATE POLICY "Traders can insert vinyl newsletter analytics"
  ON public.vinyl_newsletter_analytics
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM vinyl_newsletters vn
      WHERE vn.id = newsletter_id
      AND vn.created_by = auth.uid()
      AND EXISTS (
        SELECT 1 FROM traders_whitelist tw
        WHERE tw.email = (SELECT email FROM auth.users WHERE id = auth.uid())
      )
    )
  );