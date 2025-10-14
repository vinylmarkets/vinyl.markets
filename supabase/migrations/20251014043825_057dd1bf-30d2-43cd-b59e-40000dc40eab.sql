-- Create enum for roles
CREATE TYPE public.app_role AS ENUM ('admin', 'moderator', 'user');

-- Create user_roles table with proper structure
CREATE TABLE public.user_roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    role app_role NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    UNIQUE (user_id, role)
);

-- Enable RLS on user_roles
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Create security definer function to check roles (prevents RLS recursion)
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  );
$$;

-- Create RLS policies for user_roles
CREATE POLICY "Users can view their own roles"
ON public.user_roles
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Only admins can manage roles"
ON public.user_roles
FOR ALL
USING (public.has_role(auth.uid(), 'admin'));

-- Migrate existing admin users from users table to user_roles
INSERT INTO public.user_roles (user_id, role)
SELECT id, 'admin'::app_role
FROM public.users
WHERE role = 'admin'
ON CONFLICT (user_id, role) DO NOTHING;

-- Also migrate data from admin_users table if it exists
INSERT INTO public.user_roles (user_id, role)
SELECT user_id, 
  CASE 
    WHEN role = 'admin' THEN 'admin'::app_role
    WHEN role = 'support' THEN 'moderator'::app_role
    ELSE 'user'::app_role
  END
FROM public.admin_users
WHERE user_id IS NOT NULL
ON CONFLICT (user_id, role) DO NOTHING;

-- Update existing RLS policies to use the new has_role function
-- Update admin_users policies
DROP POLICY IF EXISTS "Admins can view all admin users" ON public.admin_users;
CREATE POLICY "Admins can view all admin users"
ON public.admin_users
FOR SELECT
USING (public.has_role(auth.uid(), 'admin'));

DROP POLICY IF EXISTS "Only admins can insert admin users" ON public.admin_users;
CREATE POLICY "Only admins can insert admin users"
ON public.admin_users
FOR INSERT
WITH CHECK (public.has_role(auth.uid(), 'admin'));

DROP POLICY IF EXISTS "Only admins can update admin users" ON public.admin_users;
CREATE POLICY "Only admins can update admin users"
ON public.admin_users
FOR UPDATE
USING (public.has_role(auth.uid(), 'admin'));

-- Update other critical admin-checking policies
DROP POLICY IF EXISTS "Admin can manage briefings" ON public.briefings;
CREATE POLICY "Admin can manage briefings"
ON public.briefings
FOR ALL
USING (public.has_role(auth.uid(), 'admin'));

DROP POLICY IF EXISTS "Admin can manage blog posts" ON public.blog_posts;
CREATE POLICY "Admin can manage blog posts"
ON public.blog_posts
FOR ALL
USING (public.has_role(auth.uid(), 'admin'));

DROP POLICY IF EXISTS "Admin can manage insights" ON public.cognee_insights;
CREATE POLICY "Admin can manage insights"
ON public.cognee_insights
FOR ALL
USING (public.has_role(auth.uid(), 'admin'));

-- Update business metrics function to use has_role
CREATE OR REPLACE FUNCTION public.get_business_metrics_summary()
RETURNS TABLE(date date, total_users integer, active_users integer, new_signups integer, mrr numeric, churn_rate numeric, engagement_rate numeric, previous_mrr numeric, mrr_growth_rate numeric)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NOT public.has_role(auth.uid(), 'admin') THEN
    RAISE EXCEPTION 'Access denied: Admin privileges required for business metrics';
  END IF;

  RETURN QUERY
  SELECT 
    dm.date,
    dm.total_users,
    dm.active_users,
    dm.new_signups,
    dm.mrr,
    dm.churn_rate,
    CASE
      WHEN dm.total_users > 0 THEN round(((dm.active_users::numeric / dm.total_users::numeric) * 100::numeric), 2)
      ELSE 0::numeric
    END AS engagement_rate,
    lag(dm.mrr) OVER (ORDER BY dm.date) AS previous_mrr,
    CASE
      WHEN lag(dm.mrr) OVER (ORDER BY dm.date) > 0::numeric THEN 
        round(((dm.mrr - lag(dm.mrr) OVER (ORDER BY dm.date)) / lag(dm.mrr) OVER (ORDER BY dm.date)) * 100::numeric, 2)
      ELSE 0::numeric
    END AS mrr_growth_rate
  FROM daily_metrics dm
  ORDER BY dm.date DESC;
END;
$$;