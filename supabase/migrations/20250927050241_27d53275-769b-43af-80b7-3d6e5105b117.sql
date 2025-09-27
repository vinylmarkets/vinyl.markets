-- AtomicMarket Knowledge Graph Enhancement Implementation
-- Complete database schema for Knowledge Graph functionality (excluding existing prediction_results table)

--======================================================================
-- KNOWLEDGE GRAPH CORE TABLES
--======================================================================

-- Knowledge graph nodes (entities)
CREATE TABLE kg_nodes (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    node_type TEXT NOT NULL, -- 'stock', 'pattern', 'indicator', 'concept', 'event'
    entity_id TEXT NOT NULL, -- Symbol, pattern name, etc.
    properties JSONB NOT NULL DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(node_type, entity_id)
);

-- Knowledge graph relationships (edges)
CREATE TABLE kg_edges (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    source_node_id UUID REFERENCES kg_nodes(id) ON DELETE CASCADE,
    target_node_id UUID REFERENCES kg_nodes(id) ON DELETE CASCADE,
    relationship_type TEXT NOT NULL, -- 'correlates_with', 'predicts', 'influenced_by', etc.
    strength DECIMAL(3,2) DEFAULT 0.5, -- 0.0 to 1.0
    properties JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(source_node_id, target_node_id, relationship_type)
);

-- Pattern accuracy tracking
CREATE TABLE kg_pattern_accuracy (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    pattern_node_id UUID REFERENCES kg_nodes(id) ON DELETE CASCADE,
    pattern_name TEXT NOT NULL,
    symbol TEXT NOT NULL,
    detected_at TIMESTAMPTZ NOT NULL,
    predicted_outcome TEXT NOT NULL,
    actual_outcome TEXT,
    accuracy_score DECIMAL(5,2), -- Percentage
    confidence_at_detection DECIMAL(3,2),
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Signal cross-validation results
CREATE TABLE kg_signal_validation (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    prediction_id UUID REFERENCES enhanced_daily_predictions(id) ON DELETE CASCADE,
    symbol TEXT NOT NULL,
    validation_type TEXT NOT NULL, -- 'pattern_match', 'correlation_check', 'historical_precedent'
    validation_result JSONB NOT NULL,
    confidence_adjustment DECIMAL(5,2) DEFAULT 0, -- +/- percentage points
    graph_evidence JSONB DEFAULT '{}', -- Supporting nodes/edges
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Insights cache for performance
CREATE TABLE kg_insights_cache (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    cache_key TEXT UNIQUE NOT NULL,
    query_text TEXT NOT NULL,
    insight_result JSONB NOT NULL,
    expires_at TIMESTAMPTZ NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

--======================================================================
-- INDEXES FOR PERFORMANCE
--======================================================================

CREATE INDEX idx_kg_nodes_type ON kg_nodes(node_type);
CREATE INDEX idx_kg_nodes_entity ON kg_nodes(entity_id);
CREATE INDEX idx_kg_nodes_properties ON kg_nodes USING GIN(properties);

CREATE INDEX idx_kg_edges_source ON kg_edges(source_node_id);
CREATE INDEX idx_kg_edges_target ON kg_edges(target_node_id);
CREATE INDEX idx_kg_edges_type ON kg_edges(relationship_type);

CREATE INDEX idx_pattern_accuracy_symbol ON kg_pattern_accuracy(symbol);
CREATE INDEX idx_pattern_accuracy_detected ON kg_pattern_accuracy(detected_at);

CREATE INDEX idx_signal_validation_prediction ON kg_signal_validation(prediction_id);
CREATE INDEX idx_signal_validation_symbol ON kg_signal_validation(symbol);

--======================================================================
-- ROW LEVEL SECURITY
--======================================================================

ALTER TABLE kg_nodes ENABLE ROW LEVEL SECURITY;
ALTER TABLE kg_edges ENABLE ROW LEVEL SECURITY;
ALTER TABLE kg_pattern_accuracy ENABLE ROW LEVEL SECURITY;
ALTER TABLE kg_signal_validation ENABLE ROW LEVEL SECURITY;
ALTER TABLE kg_insights_cache ENABLE ROW LEVEL SECURITY;

-- Admin-only access for KG tables
CREATE POLICY "Admins can manage KG nodes" ON kg_nodes
FOR ALL USING (is_current_user_admin());

CREATE POLICY "Admins can manage KG edges" ON kg_edges
FOR ALL USING (is_current_user_admin());

CREATE POLICY "Admins can view pattern accuracy" ON kg_pattern_accuracy
FOR SELECT USING (is_current_user_admin());

CREATE POLICY "Admins can view signal validation" ON kg_signal_validation
FOR SELECT USING (is_current_user_admin());

-- Insights cache readable by authenticated users
CREATE POLICY "Users can read insights cache" ON kg_insights_cache
FOR SELECT USING (auth.uid() IS NOT NULL);

--======================================================================
-- HELPER FUNCTIONS
--======================================================================

-- Function to update node timestamp
CREATE OR REPLACE FUNCTION update_kg_node_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER kg_nodes_updated_at
    BEFORE UPDATE ON kg_nodes
    FOR EACH ROW EXECUTE FUNCTION update_kg_node_timestamp();

CREATE TRIGGER kg_edges_updated_at
    BEFORE UPDATE ON kg_edges
    FOR EACH ROW EXECUTE FUNCTION update_kg_node_timestamp();

-- Function to clean expired cache
CREATE OR REPLACE FUNCTION clean_expired_insights_cache()
RETURNS void AS $$
BEGIN
    DELETE FROM kg_insights_cache WHERE expires_at < NOW();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

--======================================================================
-- INITIAL DATA SEEDING
--======================================================================

-- Seed common technical patterns
INSERT INTO kg_nodes (node_type, entity_id, properties) VALUES
('pattern', 'rsi_divergence', '{"name": "RSI Divergence", "historical_accuracy": 0.72, "difficulty": "intermediate"}'),
('pattern', 'ascending_triangle', '{"name": "Ascending Triangle", "historical_accuracy": 0.68, "difficulty": "beginner"}'),
('pattern', 'head_shoulders', '{"name": "Head and Shoulders", "historical_accuracy": 0.75, "difficulty": "intermediate"}'),
('pattern', 'double_bottom', '{"name": "Double Bottom", "historical_accuracy": 0.70, "difficulty": "beginner"}'),
('pattern', 'macd_crossover', '{"name": "MACD Crossover", "historical_accuracy": 0.65, "difficulty": "beginner"}');

-- Seed common indicators
INSERT INTO kg_nodes (node_type, entity_id, properties) VALUES
('indicator', 'rsi', '{"name": "RSI", "type": "momentum", "typical_period": 14}'),
('indicator', 'macd', '{"name": "MACD", "type": "momentum", "typical_period": 12}'),
('indicator', 'bollinger_bands', '{"name": "Bollinger Bands", "type": "volatility", "typical_period": 20}'),
('indicator', 'volume', '{"name": "Volume", "type": "volume", "typical_period": 1}');