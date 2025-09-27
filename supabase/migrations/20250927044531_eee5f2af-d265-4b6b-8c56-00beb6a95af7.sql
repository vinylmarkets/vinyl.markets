-- Fix security vulnerability: Restrict prediction data access to authenticated users only
-- Currently unauthenticated users can view predictions ranked 11-20, exposing algorithm data

-- Drop the existing policy that allows anyone to view predictions 11-20
DROP POLICY IF EXISTS "Anyone can view predictions 11-20" ON enhanced_daily_predictions;

-- Create new policy requiring authentication for free tier predictions (ranks 11-20)
CREATE POLICY "Authenticated users can view free tier predictions" 
ON enhanced_daily_predictions 
FOR SELECT 
TO authenticated
USING (rank >= 11);

-- Ensure premium predictions policy is also restricted to authenticated users
DROP POLICY IF EXISTS "Premium users can view TOP 10 predictions" ON enhanced_daily_predictions;

CREATE POLICY "Premium subscribers can view top 10 predictions" 
ON enhanced_daily_predictions 
FOR SELECT 
TO authenticated
USING (
  (rank <= 10) AND (
    EXISTS (
      SELECT 1 FROM users 
      WHERE id = auth.uid() 
      AND subscription_tier = ANY (ARRAY['essential'::text, 'pro'::text])
    )
  )
);

-- Also secure the algorithm_performance table to prevent algorithm reverse-engineering
DROP POLICY IF EXISTS "Anyone can view algorithm performance" ON algorithm_performance;

CREATE POLICY "Authenticated users can view algorithm performance" 
ON algorithm_performance 
FOR SELECT 
TO authenticated
USING (true);

-- Secure options_opportunities table (similar exposure risk)
DROP POLICY IF EXISTS "Free users can view basic opportunities" ON options_opportunities;

CREATE POLICY "Authenticated free users can view basic opportunities" 
ON options_opportunities 
FOR SELECT 
TO authenticated
USING (
  (rank >= 11) OR (
    get_current_user_subscription_tier() = ANY (ARRAY['essential'::text, 'pro'::text])
  )
);

-- Add comment for audit trail
COMMENT ON POLICY "Authenticated users can view free tier predictions" ON enhanced_daily_predictions 
IS 'Security fix: Prevent competitors from accessing trading algorithm data without authentication';