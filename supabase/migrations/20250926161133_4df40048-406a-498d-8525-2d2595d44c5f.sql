-- Update RLS policy to allow admins to view TOP 10 predictions
DROP POLICY IF EXISTS "Premium users can view TOP 10 predictions" ON enhanced_daily_predictions;

CREATE POLICY "Premium users and admins can view TOP 10 predictions" 
ON enhanced_daily_predictions 
FOR SELECT 
USING (
  (rank <= 10) AND (
    get_current_user_subscription_tier() = ANY (ARRAY['essential'::text, 'pro'::text])
    OR 
    is_current_user_admin() = true
  )
);