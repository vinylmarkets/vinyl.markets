-- Admin users table
CREATE TABLE IF NOT EXISTS admin_users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE UNIQUE,
  role TEXT CHECK (role IN ('admin', 'support')) NOT NULL,
  permissions JSONB DEFAULT '{"users": true, "financial": false, "content": true}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Audit logs table (compliance requirement)
CREATE TABLE IF NOT EXISTS audit_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  admin_user_id UUID REFERENCES admin_users(id),
  action TEXT NOT NULL,
  resource_type TEXT NOT NULL,
  resource_id TEXT,
  changes JSONB,
  ip_address TEXT,
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- RLS Policies for admin_users
CREATE POLICY "Admins can view all admin users" ON admin_users
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM admin_users 
      WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Only admins can insert admin users" ON admin_users
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM admin_users 
      WHERE user_id = auth.uid() 
      AND role = 'admin'
    )
  );

CREATE POLICY "Only admins can update admin users" ON admin_users
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM admin_users 
      WHERE user_id = auth.uid() 
      AND role = 'admin'
    )
  );

-- RLS Policies for audit_logs
CREATE POLICY "Admins can view audit logs" ON audit_logs
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM admin_users 
      WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "System can insert audit logs" ON audit_logs
  FOR INSERT WITH CHECK (true);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_admin_users_user_id ON admin_users(user_id);
CREATE INDEX IF NOT EXISTS idx_admin_users_role ON admin_users(role);
CREATE INDEX IF NOT EXISTS idx_audit_logs_admin_user ON audit_logs(admin_user_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created ON audit_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_audit_logs_resource ON audit_logs(resource_type, resource_id);

-- Auto-update timestamp trigger
CREATE OR REPLACE FUNCTION update_admin_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER admin_users_updated_at
  BEFORE UPDATE ON admin_users
  FOR EACH ROW
  EXECUTE FUNCTION update_admin_updated_at();