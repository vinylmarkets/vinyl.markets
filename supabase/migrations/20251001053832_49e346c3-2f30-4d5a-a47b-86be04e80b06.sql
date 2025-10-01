-- Create storage bucket for forensic documents
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'forensic-documents',
  'forensic-documents',
  false,
  52428800, -- 50MB limit per file
  ARRAY['application/pdf']
);

-- Create forensic_documents table to track uploads
CREATE TABLE public.forensic_documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  filename TEXT NOT NULL,
  file_path TEXT NOT NULL,
  file_size BIGINT NOT NULL,
  document_url TEXT,
  analysis_status TEXT NOT NULL DEFAULT 'pending',
  analysis_result JSONB,
  findings TEXT[],
  confidence_score INTEGER,
  uploaded_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  analyzed_at TIMESTAMP WITH TIME ZONE,
  tags TEXT[] DEFAULT '{}',
  metadata JSONB DEFAULT '{}'::jsonb
);

-- Enable RLS on forensic_documents
ALTER TABLE public.forensic_documents ENABLE ROW LEVEL SECURITY;

-- RLS policies for forensic_documents
CREATE POLICY "Users can view their own documents"
  ON public.forensic_documents
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own documents"
  ON public.forensic_documents
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own documents"
  ON public.forensic_documents
  FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own documents"
  ON public.forensic_documents
  FOR DELETE
  USING (auth.uid() = user_id);

-- RLS policies for storage bucket
CREATE POLICY "Users can upload their own forensic documents"
  ON storage.objects
  FOR INSERT
  WITH CHECK (
    bucket_id = 'forensic-documents' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Users can view their own forensic documents"
  ON storage.objects
  FOR SELECT
  USING (
    bucket_id = 'forensic-documents' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Users can delete their own forensic documents"
  ON storage.objects
  FOR DELETE
  USING (
    bucket_id = 'forensic-documents' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

-- Create index for faster queries
CREATE INDEX idx_forensic_documents_user_id ON public.forensic_documents(user_id);
CREATE INDEX idx_forensic_documents_status ON public.forensic_documents(analysis_status);
CREATE INDEX idx_forensic_documents_uploaded_at ON public.forensic_documents(uploaded_at DESC);