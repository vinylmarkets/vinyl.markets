-- Create profile for existing user who created the forum topic
INSERT INTO public.profiles (id, display_name, username)
VALUES (
  '93dbfece-121f-4fa1-be4a-5a4ee81f661c',
  'TubeAmp User',
  'tubeamp_93dbfece'
)
ON CONFLICT (id) DO NOTHING;