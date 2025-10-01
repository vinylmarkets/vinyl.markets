-- Update all user_amps records to reflect the new TubeAmp v1 name
UPDATE user_amps
SET name = 'TubeAmp v1'
WHERE amp_id = 'atomic-multi-strategy-v1';