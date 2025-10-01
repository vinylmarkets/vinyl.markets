import { useState, useCallback } from "react";
import { Upload, FileText, CheckCircle, XCircle, Loader2 } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface UploadProgress {
  filename: string;
  status: 'uploading' | 'processing' | 'complete' | 'error';
  progress: number;
  error?: string;
}

export function DocumentUpload() {
  const [uploads, setUploads] = useState<UploadProgress[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  const handleDrop = useCallback(async (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    const files = Array.from(e.dataTransfer.files).filter(
      file => file.type === 'application/pdf'
    );
    
    if (files.length === 0) {
      toast.error("Please upload PDF files only");
      return;
    }

    await processFiles(files);
  }, []);

  const handleFileInput = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    await processFiles(files);
  };

  const processFiles = async (files: File[]) => {
    if (files.length > 100) {
      toast.error("Maximum 100 files at once");
      return;
    }

    setIsUploading(true);
    
    const initialProgress: UploadProgress[] = files.map(file => ({
      filename: file.name,
      status: 'uploading',
      progress: 0
    }));
    
    setUploads(initialProgress);

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      toast.error("Please sign in to upload documents");
      setIsUploading(false);
      return;
    }

    // Process files in batches of 5 for better performance
    const batchSize = 5;
    for (let i = 0; i < files.length; i += batchSize) {
      const batch = files.slice(i, i + batchSize);
      await Promise.all(batch.map((file, batchIndex) => uploadFile(file, i + batchIndex, user.id)));
    }

    setIsUploading(false);
    toast.success(`Successfully processed ${files.length} documents`);
  };

  const uploadFile = async (file: File, index: number, userId: string) => {
    try {
      // Update progress to uploading
      setUploads(prev => prev.map((u, i) => 
        i === index ? { ...u, progress: 10 } : u
      ));

      // Upload to storage
      const filePath = `${userId}/${Date.now()}_${file.name}`;
      const { error: uploadError } = await supabase.storage
        .from('forensic-documents')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      // Update progress
      setUploads(prev => prev.map((u, i) => 
        i === index ? { ...u, progress: 50, status: 'processing' } : u
      ));

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('forensic-documents')
        .getPublicUrl(filePath);

      // Create database record
      const { error: dbError } = await supabase
        .from('forensic_documents')
        .insert({
          user_id: userId,
          filename: file.name,
          file_path: filePath,
          file_size: file.size,
          document_url: publicUrl,
          analysis_status: 'pending'
        });

      if (dbError) throw dbError;

      // Trigger analysis via edge function
      const { data, error: analysisError } = await supabase.functions.invoke('process-document', {
        body: {
          fileUrl: publicUrl,
          fileName: file.name,
          category: 'kroll-docket',
          instructions: 'Focus on NOL preservation, Section 382, entity structures, and timeline indicators'
        }
      });

      if (analysisError) throw analysisError;

      // Complete
      setUploads(prev => prev.map((u, i) => 
        i === index ? { ...u, progress: 100, status: 'complete' } : u
      ));

    } catch (error: any) {
      console.error('Upload error:', error);
      setUploads(prev => prev.map((u, i) => 
        i === index ? { ...u, status: 'error', error: error.message } : u
      ));
    }
  };

  const getStatusIcon = (status: UploadProgress['status']) => {
    switch (status) {
      case 'uploading':
      case 'processing':
        return <Loader2 className="h-4 w-4 animate-spin text-primary" />;
      case 'complete':
        return <CheckCircle className="h-4 w-4 text-success" />;
      case 'error':
        return <XCircle className="h-4 w-4 text-destructive" />;
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Bulk Document Upload</CardTitle>
        <CardDescription>
          Upload up to 100 PDF documents at once for automated forensic analysis
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Drop Zone */}
        <div
          onDrop={handleDrop}
          onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
          onDragLeave={() => setIsDragging(false)}
          className={`border-2 border-dashed rounded-lg p-12 text-center transition-colors ${
            isDragging ? 'border-primary bg-primary/5' : 'border-border'
          }`}
        >
          <Upload className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
          <h3 className="text-lg font-semibold mb-2">Drag & Drop PDF Files</h3>
          <p className="text-sm text-muted-foreground mb-4">
            or click to browse (max 100 files, 50MB each)
          </p>
          <input
            type="file"
            multiple
            accept="application/pdf"
            onChange={handleFileInput}
            className="hidden"
            id="file-upload"
            disabled={isUploading}
          />
          <Button
            asChild
            variant="outline"
            disabled={isUploading}
          >
            <label htmlFor="file-upload" className="cursor-pointer">
              Select Files
            </label>
          </Button>
        </div>

        {/* Upload Progress */}
        {uploads.length > 0 && (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <h4 className="font-semibold">Upload Progress</h4>
              <span className="text-sm text-muted-foreground">
                {uploads.filter(u => u.status === 'complete').length} / {uploads.length} complete
              </span>
            </div>
            
            <div className="max-h-96 overflow-y-auto space-y-2 pr-2">
              {uploads.map((upload, index) => (
                <div key={index} className="p-3 border rounded-lg space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 flex-1 min-w-0">
                      {getStatusIcon(upload.status)}
                      <FileText className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                      <span className="text-sm font-medium truncate">
                        {upload.filename}
                      </span>
                    </div>
                    <span className="text-xs text-muted-foreground ml-2">
                      {upload.status === 'uploading' && 'Uploading...'}
                      {upload.status === 'processing' && 'Analyzing...'}
                      {upload.status === 'complete' && 'Complete'}
                      {upload.status === 'error' && 'Failed'}
                    </span>
                  </div>
                  
                  {upload.status !== 'complete' && upload.status !== 'error' && (
                    <Progress value={upload.progress} className="h-1" />
                  )}
                  
                  {upload.error && (
                    <p className="text-xs text-destructive">{upload.error}</p>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
