-- Layer Conflicts (for analytics)
CREATE TABLE layer_conflicts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  layer_id UUID REFERENCES amp_layers(id) ON DELETE CASCADE NOT NULL,
  symbol TEXT NOT NULL,
  had_conflict BOOLEAN DEFAULT false,
  resolution_method TEXT,
  contributing_amps JSONB,
  final_action TEXT,
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Layer Amp Performance (amp contributions to layer)
CREATE TABLE layer_amp_performance (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  layer_id UUID REFERENCES amp_layers(id) ON DELETE CASCADE NOT NULL,
  amp_id TEXT NOT NULL,
  date DATE NOT NULL,
  pnl DECIMAL(12,2),
  trades_executed INTEGER DEFAULT 0,
  signals_generated INTEGER DEFAULT 0,
  conflicts_won INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(layer_id, amp_id, date)
);

-- Indexes
CREATE INDEX idx_layer_conflicts_layer ON layer_conflicts(layer_id);
CREATE INDEX idx_layer_conflicts_timestamp ON layer_conflicts(timestamp);
CREATE INDEX idx_layer_amp_perf_layer ON layer_amp_performance(layer_id);
CREATE INDEX idx_layer_amp_perf_date ON layer_amp_performance(date);

-- Enable RLS
ALTER TABLE layer_conflicts ENABLE ROW LEVEL SECURITY;
ALTER TABLE layer_amp_performance ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view their layer conflicts" ON layer_conflicts
  FOR SELECT USING (
    layer_id IN (
      SELECT id FROM amp_layers WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can manage their layer conflicts" ON layer_conflicts
  FOR ALL USING (
    layer_id IN (
      SELECT id FROM amp_layers WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can view their layer amp performance" ON layer_amp_performance
  FOR SELECT USING (
    layer_id IN (
      SELECT id FROM amp_layers WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can manage their layer amp performance" ON layer_amp_performance
  FOR ALL USING (
    layer_id IN (
      SELECT id FROM amp_layers WHERE user_id = auth.uid()
    )
  );