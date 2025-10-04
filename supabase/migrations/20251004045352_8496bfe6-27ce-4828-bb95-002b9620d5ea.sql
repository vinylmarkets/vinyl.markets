-- Create reviews and helpful votes tables for amp marketplace

-- Reviews table
CREATE TABLE IF NOT EXISTS amp_reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  amp_id TEXT NOT NULL REFERENCES amp_catalog(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  review_title TEXT NOT NULL,
  review_text TEXT NOT NULL CHECK (length(review_text) >= 50),
  verified_purchase BOOLEAN DEFAULT false,
  helpful_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(amp_id, user_id)
);

-- Helpful votes table
CREATE TABLE IF NOT EXISTS review_helpful_votes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  review_id UUID NOT NULL REFERENCES amp_reviews(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(review_id, user_id)
);

-- Add review columns to amp_catalog if not exists
ALTER TABLE amp_catalog 
  ADD COLUMN IF NOT EXISTS average_rating DECIMAL(3,2) DEFAULT 0,
  ADD COLUMN IF NOT EXISTS total_reviews INTEGER DEFAULT 0;

-- Function to increment helpful count
CREATE OR REPLACE FUNCTION increment_review_helpful_count(review_id UUID)
RETURNS VOID AS $$
BEGIN
  UPDATE amp_reviews
  SET helpful_count = helpful_count + 1
  WHERE id = review_id;
END;
$$ LANGUAGE plpgsql;

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_amp_reviews_amp_id ON amp_reviews(amp_id);
CREATE INDEX IF NOT EXISTS idx_amp_reviews_user_id ON amp_reviews(user_id);
CREATE INDEX IF NOT EXISTS idx_amp_reviews_rating ON amp_reviews(rating);
CREATE INDEX IF NOT EXISTS idx_amp_reviews_created_at ON amp_reviews(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_review_helpful_votes_review_id ON review_helpful_votes(review_id);

-- RLS Policies
ALTER TABLE amp_reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE review_helpful_votes ENABLE ROW LEVEL SECURITY;

-- Reviews: Public can read, users can write their own
CREATE POLICY "Public can view reviews"
  ON amp_reviews FOR SELECT
  USING (true);

CREATE POLICY "Users can write own reviews"
  ON amp_reviews FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own reviews"
  ON amp_reviews FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own reviews"
  ON amp_reviews FOR DELETE
  USING (auth.uid() = user_id);

-- Helpful votes: Users can view and vote
CREATE POLICY "Public can view helpful votes"
  ON review_helpful_votes FOR SELECT
  USING (true);

CREATE POLICY "Users can vote helpful"
  ON review_helpful_votes FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Trigger for updated_at
CREATE TRIGGER update_amp_reviews_updated_at
  BEFORE UPDATE ON amp_reviews
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();