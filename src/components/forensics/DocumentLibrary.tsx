import { useEffect, useState } from "react";
import { FileText, Download, Trash2, Eye, Calendar, AlertCircle } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { format } from "date-fns";

interface ForensicDocument {
  id: string;
  filename: string;
  file_path: string;
  file_size: number;
  document_url: string | null;
  analysis_status: string;
  analysis_result: any;
  findings: string[] | null;
  confidence_score: number | null;
  uploaded_at: string;
  analyzed_at: string | null;
}

export function DocumentLibrary() {
  const [documents, setDocuments] = useState<ForensicDocument[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDocuments();

    // Subscribe to realtime updates
    const channel = supabase
      .channel('forensic-documents-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'forensic_documents'
        },
        () => {
          loadDocuments();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const loadDocuments = async () => {
    try {
      const { data, error } = await supabase
        .from('forensic_documents')
        .select('*')
        .order('uploaded_at', { ascending: false });

      if (error) throw error;
      setDocuments(data || []);
    } catch (error: any) {
      console.error('Error loading documents:', error);
      toast.error('Failed to load documents');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string, filePath: string) => {
    if (!confirm('Delete this document? This cannot be undone.')) return;

    try {
      // Delete from storage
      const { error: storageError } = await supabase.storage
        .from('forensic-documents')
        .remove([filePath]);

      if (storageError) throw storageError;

      // Delete from database
      const { error: dbError } = await supabase
        .from('forensic_documents')
        .delete()
        .eq('id', id);

      if (dbError) throw dbError;

      toast.success('Document deleted');
      loadDocuments();
    } catch (error: any) {
      console.error('Delete error:', error);
      toast.error('Failed to delete document');
    }
  };

  const handleDownload = async (filePath: string, filename: string) => {
    try {
      const { data, error } = await supabase.storage
        .from('forensic-documents')
        .download(filePath);

      if (error) throw error;

      const url = URL.createObjectURL(data);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      a.click();
      URL.revokeObjectURL(url);
    } catch (error: any) {
      console.error('Download error:', error);
      toast.error('Failed to download document');
    }
  };

  const getStatusColor = (status: string): "default" | "destructive" | "outline" | "secondary" => {
    switch (status) {
      case 'complete': return 'outline';
      case 'processing': return 'default';
      case 'pending': return 'secondary';
      case 'error': return 'destructive';
      default: return 'secondary';
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-12 text-center text-muted-foreground">
          Loading documents...
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Document Library</CardTitle>
        <CardDescription>
          {documents.length} documents uploaded • {documents.filter(d => d.analysis_status === 'complete').length} analyzed
        </CardDescription>
      </CardHeader>
      <CardContent>
        {documents.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No documents uploaded yet</p>
          </div>
        ) : (
          <div className="space-y-3">
            {documents.map((doc) => (
              <div
                key={doc.id}
                className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent/50 transition-colors"
              >
                <div className="flex items-start gap-3 flex-1 min-w-0">
                  <FileText className="h-5 w-5 text-muted-foreground flex-shrink-0 mt-0.5" />
                  
                  <div className="flex-1 min-w-0 space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h4 className="font-medium truncate">{doc.filename}</h4>
                      <Badge variant={getStatusColor(doc.analysis_status)}>
                        {doc.analysis_status}
                      </Badge>
                      {doc.confidence_score && (
                        <Badge variant="outline">
                          {doc.confidence_score}% confidence
                        </Badge>
                      )}
                    </div>
                    
                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {format(new Date(doc.uploaded_at), 'MMM d, yyyy h:mm a')}
                      </span>
                      <span>{formatFileSize(doc.file_size)}</span>
                    </div>

                    {doc.findings && doc.findings.length > 0 && (
                      <div className="flex items-start gap-2 mt-2">
                        <AlertCircle className="h-4 w-4 text-primary flex-shrink-0 mt-0.5" />
                        <ul className="text-xs space-y-1 list-none">
                          {doc.findings.map((finding, i) => (
                            <li key={i} className="text-muted-foreground">• {finding}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2 ml-4">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDownload(doc.file_path, doc.filename)}
                  >
                    <Download className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDelete(doc.id, doc.file_path)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
