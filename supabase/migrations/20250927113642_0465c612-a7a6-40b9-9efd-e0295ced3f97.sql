-- First, let's check if the playbook_knowledge table exists and drop the problematic constraint
-- Add 'uploaded_document' as a valid source value and fix RLS policies

-- Drop the existing source check constraint if it exists
DO $$ 
BEGIN
    -- Drop the constraint that's blocking uploaded_document
    IF EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'playbook_knowledge_source_check') THEN
        ALTER TABLE playbook_knowledge DROP CONSTRAINT playbook_knowledge_source_check;
    END IF;
END $$;

-- Add a new constraint that allows both 'bible' and 'uploaded_document'
ALTER TABLE playbook_knowledge 
ADD CONSTRAINT playbook_knowledge_source_check 
CHECK (source IN ('bible', 'uploaded_document'));

-- Drop and recreate RLS policies to fix infinite recursion
DROP POLICY IF EXISTS "Admins and founders can manage playbook knowledge" ON playbook_knowledge;
DROP POLICY IF EXISTS "Authorized users can view playbook knowledge" ON playbook_knowledge;
DROP POLICY IF EXISTS "Admins can manage access" ON playbook_access;
DROP POLICY IF EXISTS "Users can view their own access" ON playbook_access;

-- Simple RLS policies without circular references
CREATE POLICY "Admins can manage all playbook knowledge" 
ON playbook_knowledge FOR ALL 
USING (EXISTS (
    SELECT 1 FROM users 
    WHERE users.id = auth.uid() AND users.role = 'admin'
));

CREATE POLICY "Authenticated users can view playbook knowledge" 
ON playbook_knowledge FOR SELECT 
USING (auth.uid() IS NOT NULL);

-- Simple policies for playbook_access
CREATE POLICY "Admins can manage playbook access" 
ON playbook_access FOR ALL 
USING (EXISTS (
    SELECT 1 FROM users 
    WHERE users.id = auth.uid() AND users.role = 'admin'
));

CREATE POLICY "Users can view their own playbook access" 
ON playbook_access FOR SELECT 
USING (auth.uid() = user_id);