-- Upgrade user subscription to essential tier for unlimited queries
UPDATE users 
SET subscription_tier = 'essential',
    updated_at = NOW()
WHERE email = 'test@tubeamp.com';