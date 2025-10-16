-- Issue #10: Create Checkout System with Promo Codes

-- Create promo_codes table
CREATE TABLE IF NOT EXISTS promo_codes (
  code TEXT PRIMARY KEY,
  discount_percent INTEGER NOT NULL CHECK (discount_percent >= 0 AND discount_percent <= 100),
  max_uses INTEGER NOT NULL CHECK (max_uses > 0),
  uses_count INTEGER DEFAULT 0 CHECK (uses_count >= 0),
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_by UUID,
  description TEXT
);

-- Create orders table
CREATE TABLE IF NOT EXISTS orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  total_amount DECIMAL(10,2) NOT NULL CHECK (total_amount >= 0),
  discount_amount DECIMAL(10,2) DEFAULT 0 CHECK (discount_amount >= 0),
  final_amount DECIMAL(10,2) NOT NULL CHECK (final_amount >= 0),
  promo_code TEXT REFERENCES promo_codes(code),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'failed')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  completed_at TIMESTAMP WITH TIME ZONE
);

-- Create order_items table
CREATE TABLE IF NOT EXISTS order_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID REFERENCES orders(id) ON DELETE CASCADE NOT NULL,
  amp_id TEXT NOT NULL REFERENCES amp_catalog(id),
  price DECIMAL(10,2) NOT NULL CHECK (price >= 0),
  pricing_model TEXT NOT NULL CHECK (pricing_model IN ('monthly', 'onetime')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX idx_promo_codes_active ON promo_codes(is_active) WHERE is_active = true;
CREATE INDEX idx_promo_codes_expires ON promo_codes(expires_at);
CREATE INDEX idx_orders_user ON orders(user_id);
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_orders_created ON orders(created_at DESC);
CREATE INDEX idx_order_items_order ON order_items(order_id);
CREATE INDEX idx_order_items_amp ON order_items(amp_id);

-- Enable RLS
ALTER TABLE promo_codes ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;

-- RLS Policies for promo_codes
CREATE POLICY "Anyone can view active promo codes"
  ON promo_codes FOR SELECT
  USING (is_active = true AND expires_at > NOW());

CREATE POLICY "Admins can manage promo codes"
  ON promo_codes FOR ALL
  USING (public.has_role(auth.uid(), 'admin'));

-- RLS Policies for orders
CREATE POLICY "Users can view own orders"
  ON orders FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own orders"
  ON orders FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own orders"
  ON orders FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all orders"
  ON orders FOR SELECT
  USING (public.has_role(auth.uid(), 'admin'));

-- RLS Policies for order_items
CREATE POLICY "Users can view own order items"
  ON order_items FOR SELECT
  USING (order_id IN (SELECT id FROM orders WHERE user_id = auth.uid()));

CREATE POLICY "Users can create order items"
  ON order_items FOR INSERT
  WITH CHECK (order_id IN (SELECT id FROM orders WHERE user_id = auth.uid()));

CREATE POLICY "Admins can view all order items"
  ON order_items FOR SELECT
  USING (public.has_role(auth.uid(), 'admin'));

-- Function to validate and apply promo code
CREATE OR REPLACE FUNCTION validate_promo_code(p_code TEXT)
RETURNS TABLE(
  valid BOOLEAN,
  discount_percent INTEGER,
  error_message TEXT
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_promo promo_codes%ROWTYPE;
BEGIN
  -- Get promo code
  SELECT * INTO v_promo
  FROM promo_codes
  WHERE code = p_code;
  
  -- Check if code exists
  IF NOT FOUND THEN
    RETURN QUERY SELECT false, 0, 'Invalid promo code';
    RETURN;
  END IF;
  
  -- Check if active
  IF NOT v_promo.is_active THEN
    RETURN QUERY SELECT false, 0, 'This promo code is no longer active';
    RETURN;
  END IF;
  
  -- Check expiration
  IF v_promo.expires_at < NOW() THEN
    RETURN QUERY SELECT false, 0, 'This promo code has expired';
    RETURN;
  END IF;
  
  -- Check usage limit
  IF v_promo.uses_count >= v_promo.max_uses THEN
    RETURN QUERY SELECT false, 0, 'This promo code has reached its usage limit';
    RETURN;
  END IF;
  
  -- Valid code
  RETURN QUERY SELECT true, v_promo.discount_percent, NULL::TEXT;
END;
$$;

-- Function to increment promo code usage
CREATE OR REPLACE FUNCTION increment_promo_code_usage(p_code TEXT)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE promo_codes
  SET uses_count = uses_count + 1
  WHERE code = p_code;
END;
$$;

-- Comments on tables and functions
COMMENT ON TABLE promo_codes IS 'Promotional discount codes for beta testing and marketing';
COMMENT ON TABLE orders IS 'Purchase orders for amp subscriptions and one-time purchases';
COMMENT ON TABLE order_items IS 'Individual items within an order';
COMMENT ON FUNCTION validate_promo_code IS 'Validates a promo code and returns discount percentage';
COMMENT ON FUNCTION increment_promo_code_usage IS 'Increments the usage count for a promo code';

-- Insert sample promo codes for beta testing
INSERT INTO promo_codes (code, discount_percent, max_uses, expires_at, description)
VALUES
  ('BETA2025', 100, 100, '2025-12-31 23:59:59+00', 'Beta tester free access'),
  ('LAUNCH50', 50, 50, '2025-11-30 23:59:59+00', '50% off launch special')
ON CONFLICT (code) DO NOTHING;