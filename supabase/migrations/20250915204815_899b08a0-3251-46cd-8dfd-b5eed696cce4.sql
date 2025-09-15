-- Add admin role functionality to users table
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS role TEXT DEFAULT 'user';

-- Create an index for performance
CREATE INDEX IF NOT EXISTS idx_users_role ON public.users(role);

-- Update the existing user to be an admin (replace with your actual user email)
-- You'll need to update this with your actual email after you sign up
UPDATE public.users 
SET role = 'admin' 
WHERE email = 'admin@example.com';

-- Create a function to check if current user is admin
CREATE OR REPLACE FUNCTION public.is_current_user_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.users 
    WHERE id = auth.uid() AND role = 'admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;