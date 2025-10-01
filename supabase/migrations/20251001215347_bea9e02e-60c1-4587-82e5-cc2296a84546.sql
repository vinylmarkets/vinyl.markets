-- Add foreign key constraint between user_amps and amp_catalog
ALTER TABLE user_amps 
ADD CONSTRAINT fk_user_amps_catalog 
FOREIGN KEY (amp_id) 
REFERENCES amp_catalog(id) 
ON DELETE RESTRICT;