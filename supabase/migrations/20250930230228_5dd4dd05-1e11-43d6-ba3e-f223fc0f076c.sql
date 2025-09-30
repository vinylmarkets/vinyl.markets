-- Create diagnostic logs table
CREATE TABLE IF NOT EXISTS public.diagnostic_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id),
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  severity TEXT NOT NULL CHECK (severity IN ('error', 'warning', 'info', 'debug')),
  algorithm_name TEXT,
  message TEXT NOT NULL,
  details JSONB,
  stack_trace TEXT,
  resolved BOOLEAN DEFAULT false,
  resolved_at TIMESTAMP WITH TIME ZONE,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create algorithm status table
CREATE TABLE IF NOT EXISTS public.algorithm_status (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id),
  algorithm_id TEXT NOT NULL,
  algorithm_name TEXT NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('running', 'stopped', 'error', 'paused')),
  last_activity TIMESTAMP WITH TIME ZONE,
  uptime_seconds INTEGER DEFAULT 0,
  trades_executed INTEGER DEFAULT 0,
  error_count INTEGER DEFAULT 0,
  warnings JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create connection health table
CREATE TABLE IF NOT EXISTS public.connection_health (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id),
  connection_name TEXT NOT NULL,
  connection_type TEXT NOT NULL CHECK (connection_type IN ('api', 'database', 'market_data', 'broker', 'risk_management')),
  status BOOLEAN DEFAULT false,
  response_time_ms INTEGER,
  last_tested TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_error TEXT,
  endpoint TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create alert rules table
CREATE TABLE IF NOT EXISTS public.alert_rules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id),
  rule_name TEXT NOT NULL,
  condition_type TEXT NOT NULL,
  threshold NUMERIC,
  severity TEXT CHECK (severity IN ('critical', 'high', 'medium', 'low')),
  notification_channels JSONB DEFAULT '["in-app"]'::jsonb,
  cooldown_minutes INTEGER DEFAULT 5,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create alert history table
CREATE TABLE IF NOT EXISTS public.alert_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id),
  rule_id UUID REFERENCES public.alert_rules(id),
  triggered_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  acknowledged BOOLEAN DEFAULT false,
  acknowledged_at TIMESTAMP WITH TIME ZONE,
  resolution_notes TEXT,
  alert_data JSONB
);

-- Create performance metrics table
CREATE TABLE IF NOT EXISTS public.algorithm_metrics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id),
  algorithm_id TEXT NOT NULL,
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  total_pnl NUMERIC DEFAULT 0,
  win_rate NUMERIC DEFAULT 0,
  avg_execution_time_ms INTEGER,
  success_rate NUMERIC DEFAULT 0,
  trade_count INTEGER DEFAULT 0,
  sharpe_ratio NUMERIC,
  max_drawdown NUMERIC,
  metrics_data JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better query performance
CREATE INDEX idx_diagnostic_logs_user_id ON public.diagnostic_logs(user_id);
CREATE INDEX idx_diagnostic_logs_timestamp ON public.diagnostic_logs(timestamp DESC);
CREATE INDEX idx_diagnostic_logs_severity ON public.diagnostic_logs(severity);
CREATE INDEX idx_algorithm_status_user_id ON public.algorithm_status(user_id);
CREATE INDEX idx_connection_health_user_id ON public.connection_health(user_id);
CREATE INDEX idx_alert_rules_user_id ON public.alert_rules(user_id);
CREATE INDEX idx_alert_history_user_id ON public.alert_history(user_id);
CREATE INDEX idx_algorithm_metrics_user_id ON public.algorithm_metrics(user_id);
CREATE INDEX idx_algorithm_metrics_timestamp ON public.algorithm_metrics(timestamp DESC);

-- Enable RLS
ALTER TABLE public.diagnostic_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.algorithm_status ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.connection_health ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.alert_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.alert_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.algorithm_metrics ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can view their own diagnostic logs"
  ON public.diagnostic_logs FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own diagnostic logs"
  ON public.diagnostic_logs FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own diagnostic logs"
  ON public.diagnostic_logs FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can view their own algorithm status"
  ON public.algorithm_status FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can manage their own algorithm status"
  ON public.algorithm_status FOR ALL
  USING (auth.uid() = user_id);

CREATE POLICY "Users can view their own connection health"
  ON public.connection_health FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can manage their own connection health"
  ON public.connection_health FOR ALL
  USING (auth.uid() = user_id);

CREATE POLICY "Users can view their own alert rules"
  ON public.alert_rules FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can manage their own alert rules"
  ON public.alert_rules FOR ALL
  USING (auth.uid() = user_id);

CREATE POLICY "Users can view their own alert history"
  ON public.alert_history FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can manage their own alert history"
  ON public.alert_history FOR ALL
  USING (auth.uid() = user_id);

CREATE POLICY "Users can view their own algorithm metrics"
  ON public.algorithm_metrics FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own algorithm metrics"
  ON public.algorithm_metrics FOR INSERT
  WITH CHECK (auth.uid() = user_id);