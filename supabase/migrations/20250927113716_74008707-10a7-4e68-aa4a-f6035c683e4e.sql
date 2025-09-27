-- Fix critical RLS security issues
-- Enable RLS on tables that are missing it

ALTER TABLE playbook_knowledge ENABLE ROW LEVEL SECURITY;
ALTER TABLE playbook_access ENABLE ROW LEVEL SECURITY;