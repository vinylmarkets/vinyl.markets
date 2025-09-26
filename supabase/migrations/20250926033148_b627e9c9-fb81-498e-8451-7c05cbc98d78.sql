-- Enable RLS on paper_leaderboards table and create policies to allow viewing
ALTER TABLE paper_leaderboards ENABLE ROW LEVEL SECURITY;

-- Allow anyone to view leaderboard data (public leaderboard)
CREATE POLICY "Anyone can view leaderboard data" 
ON paper_leaderboards 
FOR SELECT 
USING (true);

-- Also ensure paper_accounts has proper RLS for leaderboard viewing
ALTER TABLE paper_accounts ENABLE ROW LEVEL SECURITY;

-- Allow viewing of paper accounts for leaderboard purposes
CREATE POLICY "Anyone can view paper accounts for leaderboard" 
ON paper_accounts 
FOR SELECT 
USING (true);