-- Add image_url column to amp_catalog
ALTER TABLE amp_catalog ADD COLUMN IF NOT EXISTS image_url TEXT;

-- Update the Atomic Multi-Strategy amp to TubeAmp v1
UPDATE amp_catalog
SET 
  name = 'TubeAmp v1',
  description = 'A multi-strategy momentum algorithm that combines technical signals, options flow, and market microstructure to identify high-probability intraday opportunities. Like a vintage tube amp amplifying subtle signals into powerful output.',
  image_url = '/src/assets/vintage-tube-amp.jpg'
WHERE id = 'atomic-multi-strategy-v1';