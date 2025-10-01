-- Create risk_settings table for trading parameters
CREATE TABLE IF NOT EXISTS public.risk_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  max_position_size DECIMAL(12,2) DEFAULT 1000.00,
  max_portfolio_risk DECIMAL(5,4) DEFAULT 0.03,
  daily_loss_limit DECIMAL(12,2) DEFAULT 500.00,
  max_open_positions INTEGER DEFAULT 5,
  stop_loss_percent DECIMAL(5,4) DEFAULT 0.02,
  take_profit_percent DECIMAL(5,4) DEFAULT 0.05,
  min_confidence_score INTEGER DEFAULT 70,
  trading_enabled BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id)
);

-- Enable RLS
ALTER TABLE public.risk_settings ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view their own risk settings"
  ON public.risk_settings
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own risk settings"
  ON public.risk_settings
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own risk settings"
  ON public.risk_settings
  FOR UPDATE
  USING (auth.uid() = user_id);

-- Create a default risk setting for the current trader user
INSERT INTO public.risk_settings (
  user_id,
  max_position_size,
  max_portfolio_risk,
  daily_loss_limit,
  max_open_positions,
  stop_loss_percent,
  take_profit_percent,
  min_confidence_score,
  trading_enabled
)
SELECT 
  '008337a6-677b-48f3-a16f-8409920a2513'::UUID,
  1000.00,
  0.03,
  500.00,
  5,
  0.02,
  0.05,
  70,
  true
WHERE NOT EXISTS (
  SELECT 1 FROM public.risk_settings 
  WHERE user_id = '008337a6-677b-48f3-a16f-8409920a2513'::UUID
);