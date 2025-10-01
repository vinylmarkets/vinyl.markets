import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Loader2, FileText, CheckCircle, AlertCircle, Upload } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface ImportResult {
  url: string;
  status: 'pending' | 'processing' | 'success' | 'error';
  findings?: string[];
  confidence?: number;
  error?: string;
}

export const BulkDocumentImport = () => {
  const [urls, setUrls] = useState("");
  const [importing, setImporting] = useState(false);
  const [results, setResults] = useState<ImportResult[]>([]);
  const [progress, setProgress] = useState(0);
  const { toast } = useToast();

  const handleBulkImport = async () => {
    const urlList = urls.split('\n').filter(url => url.trim()).map(url => url.trim());
    
    if (urlList.length === 0) {
      toast({
        title: "No URLs",
        description: "Please enter at least one document URL",
        variant: "destructive",
      });
      return;
    }

    if (urlList.length > 50) {
      toast({
        title: "Too Many URLs",
        description: "Please import 50 documents or fewer at a time",
        variant: "destructive",
      });
      return;
    }

    setImporting(true);
    const initialResults: ImportResult[] = urlList.map(url => ({
      url,
      status: 'pending'
    }));
    setResults(initialResults);
    setProgress(0);

    // Process documents sequentially to avoid rate limits
    for (let i = 0; i < urlList.length; i++) {
      const url = urlList[i];
      
      // Update status to processing
      setResults(prev => prev.map((r, idx) => 
        idx === i ? { ...r, status: 'processing' } : r
      ));

      try {
        const { data, error } = await supabase.functions.invoke('forensic-document-analysis', {
          body: { 
            documentUrl: url,
            analysisType: 'comprehensive',
            focusAreas: [
              'NOL preservation language',
              'Section 382 references',
              'Acquisition structures',
              'Timeline references',
              'Entity relationships',
              'Bankruptcy proceedings',
              'Asset transfers',
              'Valuation discussions'
            ]
          }
        });

        if (error) throw error;

        // Update with success
        setResults(prev => prev.map((r, idx) => 
          idx === i ? { 
            ...r, 
            status: 'success',
            findings: data.findings || [],
            confidence: data.confidence || 0
          } : r
        ));
      } catch (error) {
        console.error(`Error analyzing ${url}:`, error);
        
        // Update with error
        setResults(prev => prev.map((r, idx) => 
          idx === i ? { 
            ...r, 
            status: 'error',
            error: error instanceof Error ? error.message : 'Analysis failed'
          } : r
        ));
      }

      // Update progress
      setProgress(Math.round(((i + 1) / urlList.length) * 100));

      // Small delay to avoid overwhelming the system
      if (i < urlList.length - 1) {
        await new Promise(resolve => setTimeout(resolve, 2000));
      }
    }

    setImporting(false);
    toast({
      title: "Import Complete",
      description: `Processed ${urlList.length} documents`,
    });
  };

  const getStatusIcon = (status: ImportResult['status']) => {
    switch (status) {
      case 'pending':
        return <FileText className="h-4 w-4 text-muted-foreground" />;
      case 'processing':
        return <Loader2 className="h-4 w-4 animate-spin text-blue-500" />;
      case 'success':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'error':
        return <AlertCircle className="h-4 w-4 text-red-500" />;
    }
  };

  const getStatusColor = (status: ImportResult['status']) => {
    switch (status) {
      case 'success': return 'bg-green-500/10 border-green-500/20';
      case 'error': return 'bg-red-500/10 border-red-500/20';
      case 'processing': return 'bg-blue-500/10 border-blue-500/20';
      default: return 'bg-muted';
    }
  };

  const successCount = results.filter(r => r.status === 'success').length;
  const errorCount = results.filter(r => r.status === 'error').length;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Upload className="h-5 w-5" />
          Bulk Document Import
        </CardTitle>
        <CardDescription>
          Import multiple court documents, SEC filings, or legal documents for batch analysis
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <label className="text-sm font-medium">Document URLs (one per line)</label>
          <Textarea
            placeholder={`https://cases.ra.kroll.com/bbby/Home-DownloadPDF?id1=...
https://www.sec.gov/...
https://...`}
            value={urls}
            onChange={(e) => setUrls(e.target.value)}
            disabled={importing}
            rows={8}
            className="font-mono text-xs"
          />
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>{urls.split('\n').filter(u => u.trim()).length} URLs</span>
            <span>Maximum: 50 documents</span>
          </div>
        </div>

        <div className="flex gap-2">
          <Button 
            onClick={handleBulkImport} 
            disabled={importing || !urls.trim()}
            className="flex-1"
          >
            {importing ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Processing...
              </>
            ) : (
              <>
                <Upload className="h-4 w-4 mr-2" />
                Start Import
              </>
            )}
          </Button>
          {results.length > 0 && (
            <Button 
              variant="outline" 
              onClick={() => {
                setResults([]);
                setProgress(0);
                setUrls("");
              }}
              disabled={importing}
            >
              Clear
            </Button>
          )}
        </div>

        {importing && (
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Progress</span>
              <span>{progress}%</span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>
        )}

        {results.length > 0 && (
          <div className="space-y-3 pt-4 border-t">
            <div className="flex gap-4 text-sm">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-500" />
                <span>{successCount} Successful</span>
              </div>
              <div className="flex items-center gap-2">
                <AlertCircle className="h-4 w-4 text-red-500" />
                <span>{errorCount} Failed</span>
              </div>
            </div>

            <div className="space-y-2 max-h-96 overflow-y-auto">
              {results.map((result, idx) => (
                <div
                  key={idx}
                  className={`p-3 rounded-lg border ${getStatusColor(result.status)}`}
                >
                  <div className="flex items-start gap-3">
                    {getStatusIcon(result.status)}
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium truncate">{result.url}</div>
                      {result.status === 'success' && result.findings && (
                        <div className="mt-2 space-y-1">
                          <div className="text-xs text-muted-foreground">
                            {result.findings.length} findings • {result.confidence}% confidence
                          </div>
                        </div>
                      )}
                      {result.status === 'error' && result.error && (
                        <div className="text-xs text-red-500 mt-1">{result.error}</div>
                      )}
                    </div>
                    <Badge variant="outline" className="capitalize text-xs">
                      {result.status}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
