-- Create user watchlists table for custom user lists
CREATE TABLE public.user_watchlists (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL DEFAULT 'My List',
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.user_watchlists ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view their own watchlists" 
ON public.user_watchlists 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own watchlists" 
ON public.user_watchlists 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own watchlists" 
ON public.user_watchlists 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own watchlists" 
ON public.user_watchlists 
FOR DELETE 
USING (auth.uid() = user_id);

-- Create user watchlist items table
CREATE TABLE public.user_watchlist_items (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  watchlist_id UUID NOT NULL REFERENCES public.user_watchlists(id) ON DELETE CASCADE,
  symbol TEXT NOT NULL,
  added_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  notes TEXT,
  UNIQUE(watchlist_id, symbol)
);

-- Enable RLS
ALTER TABLE public.user_watchlist_items ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view their own watchlist items" 
ON public.user_watchlist_items 
FOR SELECT 
USING (watchlist_id IN (SELECT id FROM public.user_watchlists WHERE user_id = auth.uid()));

CREATE POLICY "Users can create their own watchlist items" 
ON public.user_watchlist_items 
FOR INSERT 
WITH CHECK (watchlist_id IN (SELECT id FROM public.user_watchlists WHERE user_id = auth.uid()));

CREATE POLICY "Users can update their own watchlist items" 
ON public.user_watchlist_items 
FOR UPDATE 
USING (watchlist_id IN (SELECT id FROM public.user_watchlists WHERE user_id = auth.uid()));

CREATE POLICY "Users can delete their own watchlist items" 
ON public.user_watchlist_items 
FOR DELETE 
USING (watchlist_id IN (SELECT id FROM public.user_watchlists WHERE user_id = auth.uid()));

-- Create trigger for automatic timestamp updates on user_watchlists
CREATE TRIGGER update_user_watchlists_updated_at
BEFORE UPDATE ON public.user_watchlists
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();