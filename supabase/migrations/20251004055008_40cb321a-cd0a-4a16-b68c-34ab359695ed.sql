-- Amp Layers table
CREATE TABLE amp_layers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  is_active BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Layer Amps (junction table)
CREATE TABLE layer_amps (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  layer_id UUID REFERENCES amp_layers(id) ON DELETE CASCADE NOT NULL,
  amp_id TEXT NOT NULL,
  priority INTEGER DEFAULT 50 CHECK (priority >= 1 AND priority <= 100),
  capital_allocation DECIMAL(5,4) DEFAULT 0 CHECK (capital_allocation >= 0 AND capital_allocation <= 1),
  is_enabled BOOLEAN DEFAULT true,
  settings JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Layer Settings
CREATE TABLE layer_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  layer_id UUID REFERENCES amp_layers(id) ON DELETE CASCADE NOT NULL UNIQUE,
  conflict_resolution TEXT DEFAULT 'priority' CHECK (conflict_resolution IN ('priority', 'confidence', 'weighted', 'veto')),
  capital_strategy TEXT DEFAULT 'weighted' CHECK (capital_strategy IN ('equal', 'weighted', 'dynamic', 'kelly')),
  max_positions INTEGER DEFAULT 10,
  max_exposure DECIMAL(5,4) DEFAULT 0.6,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Layer Performance (daily snapshots)
CREATE TABLE layer_performance (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  layer_id UUID REFERENCES amp_layers(id) ON DELETE CASCADE NOT NULL,
  date DATE NOT NULL,
  starting_value DECIMAL(12,2),
  ending_value DECIMAL(12,2),
  pnl DECIMAL(12,2),
  pnl_percentage DECIMAL(5,2),
  trades_count INTEGER,
  wins INTEGER,
  losses INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(layer_id, date)
);

-- Coordinated Signals
CREATE TABLE coordinated_signals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  layer_id UUID REFERENCES amp_layers(id) ON DELETE CASCADE NOT NULL,
  symbol TEXT NOT NULL,
  action TEXT CHECK (action IN ('buy', 'sell', 'hold')),
  quantity INTEGER,
  confidence DECIMAL(5,4),
  resolution_method TEXT,
  had_conflicts BOOLEAN,
  reasoning TEXT,
  contributing_amps JSONB,
  executed BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_amp_layers_user ON amp_layers(user_id);
CREATE INDEX idx_amp_layers_active ON amp_layers(is_active);
CREATE INDEX idx_layer_amps_layer ON layer_amps(layer_id);
CREATE INDEX idx_layer_amps_enabled ON layer_amps(is_enabled);
CREATE INDEX idx_layer_performance_layer_date ON layer_performance(layer_id, date);
CREATE INDEX idx_coordinated_signals_layer ON coordinated_signals(layer_id);

-- Enable RLS
ALTER TABLE amp_layers ENABLE ROW LEVEL SECURITY;
ALTER TABLE layer_amps ENABLE ROW LEVEL SECURITY;
ALTER TABLE layer_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE layer_performance ENABLE ROW LEVEL SECURITY;
ALTER TABLE coordinated_signals ENABLE ROW LEVEL SECURITY;

-- RLS Policies for amp_layers
CREATE POLICY "Users view own layers" ON amp_layers
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users create own layers" ON amp_layers
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users update own layers" ON amp_layers
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users delete own layers" ON amp_layers
  FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies for layer_amps
CREATE POLICY "Users view own layer amps" ON layer_amps
  FOR SELECT USING (
    layer_id IN (SELECT id FROM amp_layers WHERE user_id = auth.uid())
  );

CREATE POLICY "Users manage own layer amps" ON layer_amps
  FOR ALL USING (
    layer_id IN (SELECT id FROM amp_layers WHERE user_id = auth.uid())
  );

-- RLS Policies for layer_settings
CREATE POLICY "Users view own layer settings" ON layer_settings
  FOR SELECT USING (
    layer_id IN (SELECT id FROM amp_layers WHERE user_id = auth.uid())
  );

CREATE POLICY "Users manage own layer settings" ON layer_settings
  FOR ALL USING (
    layer_id IN (SELECT id FROM amp_layers WHERE user_id = auth.uid())
  );

-- RLS Policies for layer_performance
CREATE POLICY "Users view own layer performance" ON layer_performance
  FOR SELECT USING (
    layer_id IN (SELECT id FROM amp_layers WHERE user_id = auth.uid())
  );

CREATE POLICY "Users manage own layer performance" ON layer_performance
  FOR ALL USING (
    layer_id IN (SELECT id FROM amp_layers WHERE user_id = auth.uid())
  );

-- RLS Policies for coordinated_signals
CREATE POLICY "Users view own coordinated signals" ON coordinated_signals
  FOR SELECT USING (
    layer_id IN (SELECT id FROM amp_layers WHERE user_id = auth.uid())
  );

CREATE POLICY "Users manage own coordinated signals" ON coordinated_signals
  FOR ALL USING (
    layer_id IN (SELECT id FROM amp_layers WHERE user_id = auth.uid())
  );