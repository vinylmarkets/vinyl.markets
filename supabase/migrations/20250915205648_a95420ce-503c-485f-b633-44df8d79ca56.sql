-- Update the specific user to be an admin
UPDATE public.users 
SET role = 'admin' 
WHERE email = 'tubeamp.ai@gmail.com';

-- Verify the update worked
SELECT id, email, role, created_at 
FROM public.users 
WHERE email = 'tubeamp.ai@gmail.com';