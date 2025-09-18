-- Enable RLS on forum_topics table since we just added policies
ALTER TABLE public.forum_topics ENABLE ROW LEVEL SECURITY;

-- Enable RLS on forum_posts table since it has policies but RLS might be disabled
ALTER TABLE public.forum_posts ENABLE ROW LEVEL SECURITY;