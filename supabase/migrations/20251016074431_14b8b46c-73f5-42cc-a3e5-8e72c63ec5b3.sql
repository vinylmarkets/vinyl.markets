-- Create amp_performance table for tracking daily performance snapshots
CREATE TABLE IF NOT EXISTS public.amp_performance (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_amp_id UUID NOT NULL REFERENCES public.user_amps(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  trades_executed INTEGER NOT NULL DEFAULT 0,
  winning_trades INTEGER NOT NULL DEFAULT 0,
  losing_trades INTEGER NOT NULL DEFAULT 0,
  total_pnl NUMERIC(12,2) NOT NULL DEFAULT 0,
  realized_pnl NUMERIC(12,2) NOT NULL DEFAULT 0,
  unrealized_pnl NUMERIC(12,2) NOT NULL DEFAULT 0,
  cumulative_pnl NUMERIC(12,2) NOT NULL DEFAULT 0,
  cumulative_trades INTEGER NOT NULL DEFAULT 0,
  cumulative_wins INTEGER NOT NULL DEFAULT 0,
  cumulative_losses INTEGER NOT NULL DEFAULT 0,
  win_rate NUMERIC(5,2) NOT NULL DEFAULT 0,
  avg_win NUMERIC(12,2) NOT NULL DEFAULT 0,
  avg_loss NUMERIC(12,2) NOT NULL DEFAULT 0,
  largest_win NUMERIC(12,2) NOT NULL DEFAULT 0,
  largest_loss NUMERIC(12,2) NOT NULL DEFAULT 0,
  max_drawdown NUMERIC(5,2) NOT NULL DEFAULT 0,
  current_drawdown NUMERIC(5,2) NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_amp_id, date)
);

-- Create index for faster queries
CREATE INDEX idx_amp_performance_user_amp_date ON public.amp_performance(user_amp_id, date DESC);

-- Enable RLS
ALTER TABLE public.amp_performance ENABLE ROW LEVEL SECURITY;

-- Users can view their own amp performance
CREATE POLICY "Users can view own amp performance"
  ON public.amp_performance
  FOR SELECT
  USING (
    user_amp_id IN (
      SELECT id FROM public.user_amps WHERE user_id = auth.uid()
    )
  );

-- System can insert amp performance (edge functions)
CREATE POLICY "System can insert amp performance"
  ON public.amp_performance
  FOR INSERT
  WITH CHECK (true);

-- System can update amp performance
CREATE POLICY "System can update amp performance"
  ON public.amp_performance
  FOR UPDATE
  USING (true);

-- Create trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_amp_performance_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_amp_performance_timestamp
  BEFORE UPDATE ON public.amp_performance
  FOR EACH ROW
  EXECUTE FUNCTION update_amp_performance_updated_at();