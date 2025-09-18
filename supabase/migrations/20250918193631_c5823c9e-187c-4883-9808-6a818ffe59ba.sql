-- Add INSERT policy for forum_topics to allow authenticated users to create topics
CREATE POLICY "Users can create topics" 
ON public.forum_topics 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- Add UPDATE policy for forum_topics to allow users to edit their own topics
CREATE POLICY "Users can update their own topics" 
ON public.forum_topics 
FOR UPDATE 
USING (auth.uid() = user_id);