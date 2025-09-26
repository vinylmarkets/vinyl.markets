-- Create table for storing generated images
CREATE TABLE public.generated_images (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    prompt TEXT NOT NULL,
    image_url TEXT NOT NULL,
    filename TEXT NOT NULL,
    created_by UUID REFERENCES auth.users(id) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    tags TEXT[] DEFAULT NULL,
    is_featured BOOLEAN DEFAULT FALSE,
    usage_notes TEXT,
    image_data TEXT -- base64 encoded image data as fallback
);

-- Enable RLS
ALTER TABLE public.generated_images ENABLE ROW LEVEL SECURITY;

-- Admin can manage all generated images
CREATE POLICY "Admins can manage all generated images" 
ON public.generated_images 
FOR ALL 
USING (
    EXISTS (
        SELECT 1 FROM public.users 
        WHERE users.id = auth.uid() 
        AND users.role = 'admin'
    )
);

-- Add trigger for updated_at
CREATE TRIGGER update_generated_images_updated_at
    BEFORE UPDATE ON public.generated_images
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();