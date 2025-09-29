-- Create a function to get user integrations (bypasses RLS for debugging)
CREATE OR REPLACE FUNCTION get_user_integrations(target_user_id UUID)
RETURNS TABLE(id UUID, broker_name TEXT, user_id UUID, is_active BOOLEAN)
LANGUAGE SQL
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT bi.id, bi.broker_name, bi.user_id, bi.is_active
  FROM broker_integrations bi
  WHERE bi.user_id = target_user_id AND bi.is_active = true;
$$;