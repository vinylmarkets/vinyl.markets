import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { RefreshCw, AlertCircle, CheckCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";

export const DocumentReprocessing = () => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [stats, setStats] = useState<{
    total: number;
    failed: number;
    successful: number;
  } | null>(null);
  const [processingProgress, setProcessingProgress] = useState<{
    total: number;
    completed: number;
    processing: number;
  } | null>(null);
  const { toast } = useToast();

  const fetchStats = async () => {
    const { data, error } = await supabase
      .from('forensic_documents')
      .select('analysis_result, analysis_status');

    if (error) {
      console.error('Error fetching stats:', error);
      return;
    }

    const failed = data.filter(d => 
      !d.analysis_result || 
      JSON.stringify(d.analysis_result).includes('failed') ||
      JSON.stringify(d.analysis_result).includes('error')
    ).length;

    setStats({
      total: data.length,
      failed,
      successful: data.length - failed
    });
  };

  const handleReprocessAll = async () => {
    setIsProcessing(true);
    try {
      const { data, error } = await supabase.functions.invoke('reprocess-documents', {
        body: { reprocessAll: true }
      });

      if (error) throw error;

      // Set initial progress
      setProcessingProgress({
        total: data.documentsQueued,
        completed: 0,
        processing: data.documentsQueued
      });

      toast({
        title: "Reprocessing Started",
        description: `${data.documentsQueued} documents queued for reprocessing. This will take some time.`,
      });

    } catch (error) {
      console.error('Error reprocessing documents:', error);
      toast({
        title: "Reprocessing Failed",
        description: error.message,
        variant: "destructive"
      });
      setIsProcessing(false);
      setProcessingProgress(null);
    }
  };

  // Fetch stats on mount
  useEffect(() => {
    fetchStats();
  }, []);

  // Set up real-time subscription for processing progress
  useEffect(() => {
    if (!isProcessing) return;

    const channel = supabase
      .channel('reprocessing-progress')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'forensic_documents',
          filter: 'analysis_status=in.(processing,complete,failed)'
        },
        async () => {
          // Fetch current processing stats
          const { data } = await supabase
            .from('forensic_documents')
            .select('analysis_status, analysis_result');

          if (data) {
            const processing = data.filter(d => d.analysis_status === 'processing').length;
            const completed = data.filter(d => {
              const result = JSON.stringify(d.analysis_result || {});
              return d.analysis_status === 'complete' && 
                     !result.includes('failed') && 
                     !result.includes('error') &&
                     d.analysis_result !== null;
            }).length;
            const total = processingProgress?.total || 0;

            setProcessingProgress({ total, completed, processing });

            // If no more processing, we're done
            if (processing === 0 && total > 0) {
              setIsProcessing(false);
              setProcessingProgress(null);
              fetchStats();
              toast({
                title: "Reprocessing Complete",
                description: `Successfully reprocessed documents`,
              });
            }
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [isProcessing, processingProgress?.total]);

  const successRate = stats ? parseFloat(((stats.successful / stats.total) * 100).toFixed(1)) : 0;
  const progressPercentage = processingProgress 
    ? Math.round((processingProgress.completed / processingProgress.total) * 100)
    : 0;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Document Reprocessing</CardTitle>
        <CardDescription>
          Re-analyze failed documents with improved parsing
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {stats && (
          <div className="space-y-3">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Success Rate</span>
              <span className="font-medium">{successRate}%</span>
            </div>
            <Progress value={successRate} className="h-2" />
            
            <div className="grid grid-cols-3 gap-4 pt-2">
              <div className="text-center">
                <div className="text-2xl font-bold">{stats.total}</div>
                <div className="text-xs text-muted-foreground">Total</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-500">{stats.successful}</div>
                <div className="text-xs text-muted-foreground">Successful</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-destructive">{stats.failed}</div>
                <div className="text-xs text-muted-foreground">Failed</div>
              </div>
            </div>
          </div>
        )}

        {isProcessing && processingProgress && (
          <div className="space-y-2">
            <Alert>
              <RefreshCw className="h-4 w-4 animate-spin" />
              <AlertDescription>
                Reprocessing in progress: {processingProgress.completed} of {processingProgress.total} documents completed
              </AlertDescription>
            </Alert>
            <div className="space-y-1">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Processing Progress</span>
                <span className="font-medium">{progressPercentage}%</span>
              </div>
              <Progress value={progressPercentage} className="h-2" />
              <p className="text-xs text-muted-foreground text-center">
                {processingProgress.processing} documents currently being analyzed
              </p>
            </div>
          </div>
        )}

        {!isProcessing && stats && stats.failed > 0 && (
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              {stats.failed} documents failed to parse. Reprocessing may improve results using enhanced parsing strategies.
            </AlertDescription>
          </Alert>
        )}

        <div className="flex gap-2">
          <Button
            onClick={handleReprocessAll}
            disabled={isProcessing || (stats && stats.failed === 0)}
            className="flex-1"
          >
            <RefreshCw className={`mr-2 h-4 w-4 ${isProcessing ? 'animate-spin' : ''}`} />
            {isProcessing ? 'Reprocessing...' : `Reprocess ${stats?.failed || 0} Failed Documents`}
          </Button>
          
          <Button
            onClick={fetchStats}
            variant="outline"
            size="icon"
            title="Refresh stats"
          >
            <RefreshCw className="h-4 w-4" />
          </Button>
        </div>

        {stats && stats.failed === 0 && (
          <Alert>
            <CheckCircle className="h-4 w-4" />
            <AlertDescription>
              All documents have been successfully processed!
            </AlertDescription>
          </Alert>
        )}

        {stats && stats.successful > 0 && stats.failed > 100 && (
          <Alert className="mt-4">
            <AlertCircle className="h-4 w-4 text-yellow-500" />
            <AlertDescription>
              <strong>Note:</strong> {stats.failed} documents (~{Math.round((stats.failed/stats.total)*100)}%) appear to be scanned images or protected PDFs. 
              These require OCR (Optical Character Recognition) for text extraction. Standard PDF parsing cannot read image-based content.
            </AlertDescription>
          </Alert>
        )}
      </CardContent>
    </Card>
  );
};
