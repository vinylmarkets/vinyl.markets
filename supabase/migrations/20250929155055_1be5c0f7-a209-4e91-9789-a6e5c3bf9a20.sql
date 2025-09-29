-- Create trading signals table
CREATE TABLE public.trading_signals (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL,
    symbol TEXT NOT NULL,
    signal_type TEXT NOT NULL, -- 'BUY', 'SELL', 'HOLD'
    confidence_score NUMERIC NOT NULL CHECK (confidence_score >= 0 AND confidence_score <= 100),
    target_price NUMERIC,
    stop_loss_price NUMERIC,
    take_profit_price NUMERIC,
    quantity INTEGER,
    reasoning TEXT,
    signal_data JSONB DEFAULT '{}',
    status TEXT NOT NULL DEFAULT 'active', -- 'active', 'executed', 'cancelled', 'expired'
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    expires_at TIMESTAMP WITH TIME ZONE,
    executed_at TIMESTAMP WITH TIME ZONE,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create trading positions table
CREATE TABLE public.trading_positions (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL,
    signal_id UUID REFERENCES public.trading_signals(id),
    symbol TEXT NOT NULL,
    side TEXT NOT NULL, -- 'long', 'short'
    quantity INTEGER NOT NULL,
    entry_price NUMERIC NOT NULL,
    current_price NUMERIC,
    market_value NUMERIC,
    unrealized_pnl NUMERIC,
    unrealized_pnl_percent NUMERIC,
    stop_loss_price NUMERIC,
    take_profit_price NUMERIC,
    status TEXT NOT NULL DEFAULT 'open', -- 'open', 'closed', 'partial'
    opened_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    closed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on both tables
ALTER TABLE public.trading_signals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.trading_positions ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for trading_signals
CREATE POLICY "Users can view their own trading signals" 
ON public.trading_signals 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own trading signals" 
ON public.trading_signals 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own trading signals" 
ON public.trading_signals 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "System can manage all trading signals" 
ON public.trading_signals 
FOR ALL 
USING (true);

-- Create RLS policies for trading_positions
CREATE POLICY "Users can view their own trading positions" 
ON public.trading_positions 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own trading positions" 
ON public.trading_positions 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own trading positions" 
ON public.trading_positions 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "System can manage all trading positions" 
ON public.trading_positions 
FOR ALL 
USING (true);

-- Create indexes for better performance
CREATE INDEX idx_trading_signals_user_id ON public.trading_signals(user_id);
CREATE INDEX idx_trading_signals_symbol ON public.trading_signals(symbol);
CREATE INDEX idx_trading_signals_status ON public.trading_signals(status);
CREATE INDEX idx_trading_signals_expires_at ON public.trading_signals(expires_at);

CREATE INDEX idx_trading_positions_user_id ON public.trading_positions(user_id);
CREATE INDEX idx_trading_positions_symbol ON public.trading_positions(symbol);
CREATE INDEX idx_trading_positions_status ON public.trading_positions(status);
CREATE INDEX idx_trading_positions_signal_id ON public.trading_positions(signal_id);

-- Create triggers for automatic timestamp updates
CREATE TRIGGER update_trading_signals_updated_at
    BEFORE UPDATE ON public.trading_signals
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_trading_positions_updated_at
    BEFORE UPDATE ON public.trading_positions
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();