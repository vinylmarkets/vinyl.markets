-- Drop existing policies that cause recursion
DROP POLICY IF EXISTS "Admins can view all admin users" ON admin_users;
DROP POLICY IF EXISTS "Only admins can insert admin users" ON admin_users;
DROP POLICY IF EXISTS "Only admins can update admin users" ON admin_users;

-- Create security definer function to check admin status without RLS recursion
CREATE OR REPLACE FUNCTION public.is_admin(user_uuid uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM admin_users 
    WHERE user_id = user_uuid
  );
$$;

-- Create security definer function to check if user is full admin role
CREATE OR REPLACE FUNCTION public.is_full_admin(user_uuid uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM admin_users 
    WHERE user_id = user_uuid AND role = 'admin'
  );
$$;

-- Recreate policies using the security definer functions
CREATE POLICY "Admins can view all admin users" 
ON admin_users FOR SELECT 
USING (public.is_admin(auth.uid()));

CREATE POLICY "Only admins can insert admin users" 
ON admin_users FOR INSERT 
WITH CHECK (public.is_full_admin(auth.uid()));

CREATE POLICY "Only admins can update admin users" 
ON admin_users FOR UPDATE 
USING (public.is_full_admin(auth.uid()));