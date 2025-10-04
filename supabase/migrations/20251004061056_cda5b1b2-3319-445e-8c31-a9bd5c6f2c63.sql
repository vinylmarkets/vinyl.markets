-- Layer Templates table
CREATE TABLE layer_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  strategy_type TEXT NOT NULL,
  risk_profile TEXT NOT NULL,
  created_by UUID REFERENCES auth.users(id),
  is_official BOOLEAN DEFAULT false,
  is_public BOOLEAN DEFAULT false,
  configuration JSONB NOT NULL,
  usage_count INTEGER DEFAULT 0,
  avg_rating NUMERIC DEFAULT 0,
  total_ratings INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Community shared layers
CREATE TABLE shared_layers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  layer_id UUID REFERENCES amp_layers(id) ON DELETE CASCADE NOT NULL,
  shared_by UUID REFERENCES auth.users(id) NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  strategy_tags TEXT[],
  performance_summary JSONB,
  is_public BOOLEAN DEFAULT true,
  view_count INTEGER DEFAULT 0,
  clone_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Layer ratings
CREATE TABLE layer_ratings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  shared_layer_id UUID REFERENCES shared_layers(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  rating INTEGER CHECK (rating >= 1 AND rating <= 5) NOT NULL,
  review TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(shared_layer_id, user_id)
);

-- Rebalancing history
CREATE TABLE rebalancing_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  layer_id UUID REFERENCES amp_layers(id) ON DELETE CASCADE NOT NULL,
  rebalance_type TEXT NOT NULL,
  old_allocations JSONB NOT NULL,
  new_allocations JSONB NOT NULL,
  reason TEXT,
  executed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_layer_templates_strategy ON layer_templates(strategy_type);
CREATE INDEX idx_layer_templates_public ON layer_templates(is_public) WHERE is_public = true;
CREATE INDEX idx_shared_layers_public ON shared_layers(is_public) WHERE is_public = true;
CREATE INDEX idx_shared_layers_user ON shared_layers(shared_by);
CREATE INDEX idx_rebalancing_history_layer ON rebalancing_history(layer_id);

-- RLS Policies
ALTER TABLE layer_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE shared_layers ENABLE ROW LEVEL SECURITY;
ALTER TABLE layer_ratings ENABLE ROW LEVEL SECURITY;
ALTER TABLE rebalancing_history ENABLE ROW LEVEL SECURITY;

-- Templates: Everyone can view public templates
CREATE POLICY "Public can view public templates"
ON layer_templates FOR SELECT
USING (is_public = true OR created_by = auth.uid());

-- Templates: Users can create templates
CREATE POLICY "Users can create templates"
ON layer_templates FOR INSERT
WITH CHECK (auth.uid() = created_by);

-- Templates: Users can update own templates
CREATE POLICY "Users can update own templates"
ON layer_templates FOR UPDATE
USING (auth.uid() = created_by);

-- Shared Layers: Everyone can view public shared layers
CREATE POLICY "Public can view public shared layers"
ON shared_layers FOR SELECT
USING (is_public = true OR shared_by = auth.uid());

-- Shared Layers: Users can share their layers
CREATE POLICY "Users can share layers"
ON shared_layers FOR INSERT
WITH CHECK (auth.uid() = shared_by);

-- Shared Layers: Users can update own shared layers
CREATE POLICY "Users can update own shared layers"
ON shared_layers FOR UPDATE
USING (auth.uid() = shared_by);

-- Shared Layers: Users can delete own shared layers
CREATE POLICY "Users can delete own shared layers"
ON shared_layers FOR DELETE
USING (auth.uid() = shared_by);

-- Ratings: Everyone can view ratings
CREATE POLICY "Public can view ratings"
ON layer_ratings FOR SELECT
USING (true);

-- Ratings: Users can rate shared layers
CREATE POLICY "Users can rate shared layers"
ON layer_ratings FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Ratings: Users can update own ratings
CREATE POLICY "Users can update own ratings"
ON layer_ratings FOR UPDATE
USING (auth.uid() = user_id);

-- Rebalancing: Users can view own rebalancing history
CREATE POLICY "Users view own rebalancing history"
ON rebalancing_history FOR SELECT
USING (layer_id IN (
  SELECT id FROM amp_layers WHERE user_id = auth.uid()
));

-- Rebalancing: System can insert rebalancing history
CREATE POLICY "System can insert rebalancing history"
ON rebalancing_history FOR INSERT
WITH CHECK (true);