-- Create launch checklist pages table
CREATE TABLE launch_checklist_pages (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    page_name TEXT NOT NULL,
    page_path TEXT,
    page_section TEXT CHECK (page_section IN ('Public', 'User Area', 'Admin')) NOT NULL,
    parent_page_id UUID REFERENCES launch_checklist_pages(id),
    sort_order INTEGER DEFAULT 0,
    functionality_status TEXT CHECK (functionality_status IN ('Ready', 'Not Ready')) DEFAULT 'Not Ready',
    copy_status TEXT CHECK (copy_status IN ('Ready', 'Not Ready')) DEFAULT 'Not Ready',
    layout_status TEXT CHECK (layout_status IN ('Ready', 'Not Ready')) DEFAULT 'Not Ready',
    compliance_status TEXT CHECK (compliance_status IN ('Ready', 'Not Ready')) DEFAULT 'Not Ready',
    notes TEXT,
    last_updated_by UUID,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create launch checklist activity log
CREATE TABLE launch_checklist_activity (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    page_id UUID REFERENCES launch_checklist_pages(id) ON DELETE CASCADE,
    user_id UUID,
    action_type TEXT NOT NULL,
    field_changed TEXT,
    old_value TEXT,
    new_value TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE launch_checklist_pages ENABLE ROW LEVEL SECURITY;
ALTER TABLE launch_checklist_activity ENABLE ROW LEVEL SECURITY;

-- Create policies for launch_checklist_pages
CREATE POLICY "Admin can manage launch checklist pages" 
ON launch_checklist_pages 
FOR ALL 
USING (
    EXISTS (
        SELECT 1 FROM users 
        WHERE users.id = auth.uid() 
        AND users.role = 'admin'
    )
);

-- Create policies for launch_checklist_activity  
CREATE POLICY "Admin can manage launch checklist activity"
ON launch_checklist_activity
FOR ALL
USING (
    EXISTS (
        SELECT 1 FROM users 
        WHERE users.id = auth.uid() 
        AND users.role = 'admin'
    )
);

-- Performance indexes
CREATE INDEX idx_launch_checklist_section ON launch_checklist_pages(page_section);
CREATE INDEX idx_launch_checklist_parent ON launch_checklist_pages(parent_page_id);
CREATE INDEX idx_launch_checklist_sort ON launch_checklist_pages(sort_order);
CREATE INDEX idx_launch_checklist_activity_page ON launch_checklist_activity(page_id);

-- Create trigger for updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_launch_checklist_pages_updated_at
    BEFORE UPDATE ON launch_checklist_pages
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();