-- Drop existing amps-related tables
DROP TABLE IF EXISTS public.amp_events CASCADE;
DROP TABLE IF EXISTS public.user_amp_performance CASCADE;
DROP TABLE IF EXISTS public.user_amp_settings CASCADE;
DROP TABLE IF EXISTS public.user_amps CASCADE;

-- Create new simplified user_amps table
CREATE TABLE public.user_amps (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID NOT NULL,
    name TEXT NOT NULL,
    description TEXT,
    strategy_type TEXT NOT NULL CHECK (strategy_type IN ('momentum', 'mean_reversion', 'breakout', 'custom')),
    risk_level TEXT NOT NULL CHECK (risk_level IN ('conservative', 'moderate', 'aggressive')),
    allocated_capital DECIMAL(20, 2) NOT NULL,
    status TEXT NOT NULL CHECK (status IN ('active', 'paused', 'stopped')) DEFAULT 'active',
    total_pnl DECIMAL(20, 2) DEFAULT 0,
    total_pnl_percent DECIMAL(10, 4) DEFAULT 0,
    trades_count INTEGER DEFAULT 0,
    win_rate DECIMAL(5, 2) DEFAULT 0,
    deployed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    last_trade_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create amp trades history table
CREATE TABLE public.amp_trades (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    amp_id UUID REFERENCES public.user_amps(id) ON DELETE CASCADE NOT NULL,
    symbol TEXT NOT NULL,
    side TEXT NOT NULL CHECK (side IN ('buy', 'sell')),
    quantity DECIMAL(20, 8) NOT NULL,
    price DECIMAL(20, 8) NOT NULL,
    pnl DECIMAL(20, 2),
    executed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.user_amps ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.amp_trades ENABLE ROW LEVEL SECURITY;

-- RLS Policies for user_amps
CREATE POLICY "Users can manage own amps" ON public.user_amps 
    FOR ALL USING (auth.uid() = user_id);

-- RLS Policies for amp_trades
CREATE POLICY "Users can view own amp trades" ON public.amp_trades 
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.user_amps 
            WHERE id = amp_trades.amp_id AND user_id = auth.uid()
        )
    );

-- Indexes for performance
CREATE INDEX idx_user_amps_user_id ON public.user_amps(user_id);
CREATE INDEX idx_user_amps_status ON public.user_amps(status);
CREATE INDEX idx_amp_trades_amp_id ON public.amp_trades(amp_id);

-- Trigger for updated_at
CREATE TRIGGER update_amps_updated_at 
    BEFORE UPDATE ON public.user_amps 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();