-- Add trading accounts to whitelist (using correct column names)
INSERT INTO public.traders_whitelist (email, access_level) VALUES
('jonathan@brandline.co', 'admin'),
('jonathan@brandline.co+monitor', 'viewer');