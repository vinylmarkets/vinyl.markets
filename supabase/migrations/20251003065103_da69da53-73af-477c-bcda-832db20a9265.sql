-- Add tubeamp.ai@gmail.com as admin user
INSERT INTO admin_users (user_id, role, permissions)
SELECT id, 'admin', '{"users": true, "financial": true, "content": true, "system": true}'::jsonb
FROM auth.users 
WHERE email = 'tubeamp.ai@gmail.com'
ON CONFLICT (user_id) DO UPDATE SET
  role = 'admin',
  permissions = '{"users": true, "financial": true, "content": true, "system": true}'::jsonb,
  updated_at = NOW();