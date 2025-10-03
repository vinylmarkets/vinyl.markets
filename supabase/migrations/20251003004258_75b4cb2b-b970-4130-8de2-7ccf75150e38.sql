-- Create storage bucket for amp cover art
INSERT INTO storage.buckets (id, name, public)
VALUES ('amp-cover-art', 'amp-cover-art', true)
ON CONFLICT (id) DO NOTHING;

-- Create amp_cover_art table
CREATE TABLE IF NOT EXISTS amp_cover_art (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  amp_type_id TEXT NOT NULL,
  band_name TEXT NOT NULL,
  album_title TEXT NOT NULL,
  image_url TEXT NOT NULL,
  generation_prompt TEXT,
  style_era TEXT,
  genre TEXT,
  is_featured BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_amp_covers_type ON amp_cover_art(amp_type_id);
CREATE INDEX IF NOT EXISTS idx_amp_covers_featured ON amp_cover_art(is_featured);

-- Enable RLS
ALTER TABLE amp_cover_art ENABLE ROW LEVEL SECURITY;

-- Admin can manage all cover art
CREATE POLICY "Admins can manage all cover art"
ON amp_cover_art
FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM users 
    WHERE users.id = auth.uid() AND users.role = 'admin'
  )
);

-- All authenticated users can view cover art
CREATE POLICY "Authenticated users can view cover art"
ON amp_cover_art
FOR SELECT
TO authenticated
USING (true);

-- Storage policies for amp-cover-art bucket
CREATE POLICY "Admins can upload cover art"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'amp-cover-art' AND
  EXISTS (
    SELECT 1 FROM users 
    WHERE users.id = auth.uid() AND users.role = 'admin'
  )
);

CREATE POLICY "Anyone can view cover art"
ON storage.objects
FOR SELECT
TO authenticated
USING (bucket_id = 'amp-cover-art');

CREATE POLICY "Admins can delete cover art"
ON storage.objects
FOR DELETE
TO authenticated
USING (
  bucket_id = 'amp-cover-art' AND
  EXISTS (
    SELECT 1 FROM users 
    WHERE users.id = auth.uid() AND users.role = 'admin'
  )
);