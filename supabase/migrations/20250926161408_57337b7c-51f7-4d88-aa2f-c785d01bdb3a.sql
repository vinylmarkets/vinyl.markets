-- Drop existing policies and create simpler ones
DROP POLICY IF EXISTS "Premium users and admins can view TOP 10 predictions" ON enhanced_daily_predictions;
DROP POLICY IF EXISTS "Anyone can view predictions 11-20" ON enhanced_daily_predictions;

-- Allow admins to see all predictions
CREATE POLICY "Admins can view all predictions" 
ON enhanced_daily_predictions 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM users 
    WHERE users.id = auth.uid() 
    AND users.role = 'admin'
  )
);

-- Allow premium users to see TOP 10
CREATE POLICY "Premium users can view TOP 10 predictions" 
ON enhanced_daily_predictions 
FOR SELECT 
USING (
  (rank <= 10) AND (
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.id = auth.uid() 
      AND users.subscription_tier IN ('essential', 'pro')
    )
  )
);

-- Allow everyone to see predictions 11-20
CREATE POLICY "Anyone can view predictions 11-20" 
ON enhanced_daily_predictions 
FOR SELECT 
USING (rank >= 11);