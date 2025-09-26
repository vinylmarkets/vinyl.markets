-- Create a storage bucket for generated images
INSERT INTO storage.buckets (id, name, public) 
VALUES ('generated-images', 'generated-images', true);

-- Create RLS policies for the generated-images bucket
CREATE POLICY "Admin users can upload generated images" 
ON storage.objects 
FOR INSERT 
WITH CHECK (
  bucket_id = 'generated-images' 
  AND EXISTS (
    SELECT 1 FROM public.users 
    WHERE users.id = auth.uid() AND users.role = 'admin'
  )
);

CREATE POLICY "Generated images are publicly readable" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'generated-images');

CREATE POLICY "Admin users can update generated images" 
ON storage.objects 
FOR UPDATE 
USING (
  bucket_id = 'generated-images' 
  AND EXISTS (
    SELECT 1 FROM public.users 
    WHERE users.id = auth.uid() AND users.role = 'admin'
  )
);

CREATE POLICY "Admin users can delete generated images" 
ON storage.objects 
FOR DELETE 
USING (
  bucket_id = 'generated-images' 
  AND EXISTS (
    SELECT 1 FROM public.users 
    WHERE users.id = auth.uid() AND users.role = 'admin'
  )
);