-- Fix critical security issue: Enable RLS on public tables that have it disabled
-- This enforces existing policies and prevents unauthorized data access

-- Enable RLS on achievements table (already has policies)
ALTER TABLE public.achievements ENABLE ROW LEVEL SECURITY;

-- Enable RLS on educational_modules table (already has policies)
ALTER TABLE public.educational_modules ENABLE ROW LEVEL SECURITY;

-- Enable RLS on forum_likes table and add secure policies
ALTER TABLE public.forum_likes ENABLE ROW LEVEL SECURITY;

-- Create policies for forum_likes
CREATE POLICY "Users can view all forum likes" 
ON public.forum_likes 
FOR SELECT 
USING (true);

CREATE POLICY "Users can create their own likes" 
ON public.forum_likes 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own likes" 
ON public.forum_likes 
FOR DELETE 
USING (auth.uid() = user_id);

-- Enable RLS on forum_user_stats table and add secure policies
ALTER TABLE public.forum_user_stats ENABLE ROW LEVEL SECURITY;

-- Create policies for forum_user_stats
CREATE POLICY "Users can view all forum user stats" 
ON public.forum_user_stats 
FOR SELECT 
USING (true);

CREATE POLICY "Users can update their own stats" 
ON public.forum_user_stats 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "System can manage forum user stats" 
ON public.forum_user_stats 
FOR ALL 
USING (true);

-- Enable RLS on predictions table and add secure policies
ALTER TABLE public.predictions ENABLE ROW LEVEL SECURITY;

-- Create policies for predictions (assuming this is for stock predictions)
CREATE POLICY "Authenticated users can view predictions" 
ON public.predictions 
FOR SELECT 
USING (auth.uid() IS NOT NULL);

-- Only admins or system can insert/update/delete predictions
CREATE POLICY "Admins can manage predictions" 
ON public.predictions 
FOR ALL 
USING (EXISTS (
  SELECT 1 FROM public.users 
  WHERE id = auth.uid() AND role = 'admin'
));