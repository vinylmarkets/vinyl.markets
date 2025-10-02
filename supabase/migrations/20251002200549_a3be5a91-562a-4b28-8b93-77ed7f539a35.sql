-- Add tubeamp.ai@gmail.com to traders whitelist with admin access
INSERT INTO traders_whitelist (email, access_level)
VALUES ('tubeamp.ai@gmail.com', 'admin')
ON CONFLICT (email) DO UPDATE 
SET access_level = 'admin', updated_at = NOW();