-- Create Atomic Playbook system tables

-- Company knowledge base
CREATE TABLE playbook_knowledge (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    category TEXT NOT NULL CHECK (category IN ('strategy', 'product', 'marketing', 'financial', 'legal', 'team')),
    subcategory TEXT,
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    source TEXT DEFAULT 'bible' CHECK (source IN ('bible', 'user_added', 'ai_generated')),
    version INT DEFAULT 1,
    tags TEXT[],
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by UUID REFERENCES auth.users(id)
);

-- Projects and milestones
CREATE TABLE playbook_projects (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    description TEXT,
    status TEXT DEFAULT 'planned' CHECK (status IN ('planned', 'in_progress', 'completed', 'blocked', 'cancelled')),
    priority TEXT DEFAULT 'medium' CHECK (priority IN ('critical', 'high', 'medium', 'low')),
    phase TEXT, -- 'Phase 1', 'Phase 2', 'Phase 3'
    milestone_id UUID,
    target_date DATE,
    completion_date DATE,
    progress_percentage INT DEFAULT 0 CHECK (progress_percentage >= 0 AND progress_percentage <= 100),
    bible_reference TEXT, -- Links to specific Bible sections
    assigned_to UUID REFERENCES auth.users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tasks for projects
CREATE TABLE playbook_tasks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID REFERENCES playbook_projects(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    status TEXT DEFAULT 'todo' CHECK (status IN ('todo', 'in_progress', 'done', 'blocked')),
    due_date DATE,
    completed_at TIMESTAMP WITH TIME ZONE,
    assigned_to UUID REFERENCES auth.users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Financial tracking
CREATE TABLE playbook_financials (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    type TEXT NOT NULL CHECK (type IN ('revenue', 'expense', 'subscription', 'one_time')),
    category TEXT, -- 'infrastructure', 'marketing', 'legal', 'payroll', etc.
    description TEXT NOT NULL,
    amount DECIMAL(12, 2) NOT NULL,
    currency TEXT DEFAULT 'USD',
    recurring_interval TEXT CHECK (recurring_interval IN ('monthly', 'yearly', 'quarterly')), -- null for one-time
    start_date DATE,
    end_date DATE,
    vendor TEXT,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Metrics tracking
CREATE TABLE playbook_metrics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    metric_name TEXT NOT NULL, -- 'MRR', 'MAU', 'CAC', 'LTV', etc.
    value DECIMAL(12, 2) NOT NULL,
    unit TEXT, -- '$', '%', 'users', etc.
    date DATE NOT NULL,
    category TEXT, -- 'revenue', 'user', 'engagement', 'unit_economics'
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Marketing campaigns
CREATE TABLE playbook_campaigns (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    type TEXT, -- 'content', 'paid', 'social', 'email', 'launch'
    status TEXT DEFAULT 'planning' CHECK (status IN ('planning', 'active', 'paused', 'completed')),
    playbook_template TEXT, -- Reference to marketing playbook
    start_date DATE,
    end_date DATE,
    budget DECIMAL(10, 2),
    actual_spend DECIMAL(10, 2) DEFAULT 0,
    target_metrics JSONB DEFAULT '{}',
    actual_metrics JSONB DEFAULT '{}',
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- AI assistant history
CREATE TABLE playbook_ai_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id),
    query TEXT NOT NULL,
    response TEXT NOT NULL,
    context JSONB DEFAULT '{}', -- Current business context when query was made
    helpful BOOLEAN,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Access control
CREATE TABLE playbook_access (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id),
    role TEXT DEFAULT 'viewer' CHECK (role IN ('founder', 'admin', 'advisor', 'board', 'viewer')),
    permissions JSONB DEFAULT '{}', -- Granular permissions
    granted_by UUID REFERENCES auth.users(id),
    expires_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE playbook_knowledge ENABLE ROW LEVEL SECURITY;
ALTER TABLE playbook_projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE playbook_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE playbook_financials ENABLE ROW LEVEL SECURITY;
ALTER TABLE playbook_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE playbook_campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE playbook_ai_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE playbook_access ENABLE ROW LEVEL SECURITY;

-- RLS Policies - Admin and founder access
CREATE POLICY "Admins and founders can manage playbook knowledge" ON playbook_knowledge
    FOR ALL USING (
        EXISTS (SELECT 1 FROM users WHERE users.id = auth.uid() AND users.role = 'admin')
        OR EXISTS (SELECT 1 FROM playbook_access WHERE playbook_access.user_id = auth.uid() AND playbook_access.role IN ('founder', 'admin'))
    );

CREATE POLICY "Authorized users can view playbook knowledge" ON playbook_knowledge
    FOR SELECT USING (
        EXISTS (SELECT 1 FROM users WHERE users.id = auth.uid() AND users.role = 'admin')
        OR EXISTS (SELECT 1 FROM playbook_access WHERE playbook_access.user_id = auth.uid())
    );

CREATE POLICY "Admins and founders can manage projects" ON playbook_projects
    FOR ALL USING (
        EXISTS (SELECT 1 FROM users WHERE users.id = auth.uid() AND users.role = 'admin')
        OR EXISTS (SELECT 1 FROM playbook_access WHERE playbook_access.user_id = auth.uid() AND playbook_access.role IN ('founder', 'admin'))
    );

CREATE POLICY "Authorized users can view projects" ON playbook_projects
    FOR SELECT USING (
        EXISTS (SELECT 1 FROM users WHERE users.id = auth.uid() AND users.role = 'admin')
        OR EXISTS (SELECT 1 FROM playbook_access WHERE playbook_access.user_id = auth.uid())
    );

CREATE POLICY "Users can manage their assigned tasks" ON playbook_tasks
    FOR ALL USING (
        auth.uid() = assigned_to
        OR EXISTS (SELECT 1 FROM users WHERE users.id = auth.uid() AND users.role = 'admin')
        OR EXISTS (SELECT 1 FROM playbook_access WHERE playbook_access.user_id = auth.uid() AND playbook_access.role IN ('founder', 'admin'))
    );

CREATE POLICY "Authorized users can view tasks" ON playbook_tasks
    FOR SELECT USING (
        EXISTS (SELECT 1 FROM users WHERE users.id = auth.uid() AND users.role = 'admin')
        OR EXISTS (SELECT 1 FROM playbook_access WHERE playbook_access.user_id = auth.uid())
    );

CREATE POLICY "Admins and founders can manage financials" ON playbook_financials
    FOR ALL USING (
        EXISTS (SELECT 1 FROM users WHERE users.id = auth.uid() AND users.role = 'admin')
        OR EXISTS (SELECT 1 FROM playbook_access WHERE playbook_access.user_id = auth.uid() AND playbook_access.role IN ('founder', 'admin'))
    );

CREATE POLICY "Authorized users can view financials" ON playbook_financials
    FOR SELECT USING (
        EXISTS (SELECT 1 FROM users WHERE users.id = auth.uid() AND users.role = 'admin')
        OR EXISTS (SELECT 1 FROM playbook_access WHERE playbook_access.user_id = auth.uid())
    );

CREATE POLICY "Admins and founders can manage metrics" ON playbook_metrics
    FOR ALL USING (
        EXISTS (SELECT 1 FROM users WHERE users.id = auth.uid() AND users.role = 'admin')
        OR EXISTS (SELECT 1 FROM playbook_access WHERE playbook_access.user_id = auth.uid() AND playbook_access.role IN ('founder', 'admin'))
    );

CREATE POLICY "Authorized users can view metrics" ON playbook_metrics
    FOR SELECT USING (
        EXISTS (SELECT 1 FROM users WHERE users.id = auth.uid() AND users.role = 'admin')
        OR EXISTS (SELECT 1 FROM playbook_access WHERE playbook_access.user_id = auth.uid())
    );

CREATE POLICY "Admins and founders can manage campaigns" ON playbook_campaigns
    FOR ALL USING (
        EXISTS (SELECT 1 FROM users WHERE users.id = auth.uid() AND users.role = 'admin')
        OR EXISTS (SELECT 1 FROM playbook_access WHERE playbook_access.user_id = auth.uid() AND playbook_access.role IN ('founder', 'admin'))
    );

CREATE POLICY "Authorized users can view campaigns" ON playbook_campaigns
    FOR SELECT USING (
        EXISTS (SELECT 1 FROM users WHERE users.id = auth.uid() AND users.role = 'admin')
        OR EXISTS (SELECT 1 FROM playbook_access WHERE playbook_access.user_id = auth.uid())
    );

CREATE POLICY "Users can view their own AI history" ON playbook_ai_history
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own AI history" ON playbook_ai_history
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can manage access" ON playbook_access
    FOR ALL USING (
        EXISTS (SELECT 1 FROM users WHERE users.id = auth.uid() AND users.role = 'admin')
        OR EXISTS (SELECT 1 FROM playbook_access WHERE playbook_access.user_id = auth.uid() AND playbook_access.role = 'founder')
    );

CREATE POLICY "Users can view their own access" ON playbook_access
    FOR SELECT USING (auth.uid() = user_id);

-- Functions for updating timestamps
CREATE OR REPLACE FUNCTION update_playbook_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for updated_at
CREATE TRIGGER update_playbook_knowledge_updated_at
    BEFORE UPDATE ON playbook_knowledge
    FOR EACH ROW EXECUTE FUNCTION update_playbook_updated_at();

CREATE TRIGGER update_playbook_projects_updated_at
    BEFORE UPDATE ON playbook_projects
    FOR EACH ROW EXECUTE FUNCTION update_playbook_updated_at();

CREATE TRIGGER update_playbook_tasks_updated_at
    BEFORE UPDATE ON playbook_tasks
    FOR EACH ROW EXECUTE FUNCTION update_playbook_updated_at();

CREATE TRIGGER update_playbook_financials_updated_at
    BEFORE UPDATE ON playbook_financials
    FOR EACH ROW EXECUTE FUNCTION update_playbook_updated_at();

CREATE TRIGGER update_playbook_campaigns_updated_at
    BEFORE UPDATE ON playbook_campaigns
    FOR EACH ROW EXECUTE FUNCTION update_playbook_updated_at();