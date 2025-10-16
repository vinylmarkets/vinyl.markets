-- Migration: Create Shopping Cart System
-- Issue #9: Build Shopping Cart System

-- Create cart_items table
CREATE TABLE IF NOT EXISTS cart_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  amp_id TEXT NOT NULL REFERENCES amp_catalog(id) ON DELETE CASCADE,
  pricing_model TEXT NOT NULL CHECK (pricing_model IN ('monthly', 'onetime')),
  price DECIMAL(10,2) NOT NULL CHECK (price >= 0),
  added_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, amp_id, pricing_model)
);

-- Create index for faster cart lookups
CREATE INDEX idx_cart_items_user ON cart_items(user_id);
CREATE INDEX idx_cart_items_amp ON cart_items(amp_id);

-- Create trigger to update updated_at
CREATE OR REPLACE FUNCTION update_cart_items_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER cart_items_updated_at
  BEFORE UPDATE ON cart_items
  FOR EACH ROW
  EXECUTE FUNCTION update_cart_items_updated_at();

-- Enable RLS
ALTER TABLE cart_items ENABLE ROW LEVEL SECURITY;

-- RLS Policies: Users can only see and manage their own cart
CREATE POLICY "Users can view own cart"
  ON cart_items FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can add to own cart"
  ON cart_items FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own cart"
  ON cart_items FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete from own cart"
  ON cart_items FOR DELETE
  USING (auth.uid() = user_id);

-- Add helpful comments
COMMENT ON TABLE cart_items IS 'Shopping cart items for marketplace purchases';
COMMENT ON COLUMN cart_items.pricing_model IS 'Subscription (monthly) or one-time purchase';
COMMENT ON COLUMN cart_items.price IS 'Price at time of adding to cart (snapshot)';