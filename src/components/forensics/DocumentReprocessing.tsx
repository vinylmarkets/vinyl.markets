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

      toast({
        title: "Reprocessing Started",
        description: `${data.documentsQueued} documents queued for reprocessing. This will take some time.`,
      });

      // Refresh stats after a delay
      setTimeout(() => {
        fetchStats();
      }, 2000);

    } catch (error) {
      console.error('Error reprocessing documents:', error);
      toast({
        title: "Reprocessing Failed",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setIsProcessing(false);
    }
  };

  // Fetch stats on mount
  useEffect(() => {
    fetchStats();
  }, []);

  const successRate = stats ? parseFloat(((stats.successful / stats.total) * 100).toFixed(1)) : 0;

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

        {stats && stats.failed > 0 && (
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              {stats.failed} documents failed to parse. Reprocessing may improve results using enhanced parsing strategies.
            </AlertDescription>
          </Alert>
        )}

        <Button
          onClick={handleReprocessAll}
          disabled={isProcessing || (stats && stats.failed === 0)}
          className="w-full"
        >
          <RefreshCw className={`mr-2 h-4 w-4 ${isProcessing ? 'animate-spin' : ''}`} />
          {isProcessing ? 'Reprocessing...' : `Reprocess ${stats?.failed || 0} Failed Documents`}
        </Button>

        {stats && stats.failed === 0 && (
          <Alert>
            <CheckCircle className="h-4 w-4" />
            <AlertDescription>
              All documents have been successfully processed!
            </AlertDescription>
          </Alert>
        )}
      </CardContent>
    </Card>
  );
};
