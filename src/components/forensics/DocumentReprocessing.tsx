import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { RefreshCw, AlertCircle, CheckCircle, FileSearch } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";
import Tesseract from 'tesseract.js';
import * as pdfjsLib from 'pdfjs-dist';

// Set up PDF.js worker
pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';

export const DocumentReprocessing = () => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [isOcrProcessing, setIsOcrProcessing] = useState(false);
  const [cancelOcr, setCancelOcr] = useState(false);
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
  const [ocrProgress, setOcrProgress] = useState<{
    current: number;
    total: number;
    currentFile: string;
    stage: string;
  } | null>(null);
  const { toast } = useToast();

  const fetchStats = async () => {
    try {
      const { data, error } = await supabase
        .from('forensic_documents')
        .select('analysis_result, analysis_status, findings');

      if (error) {
        console.error('Error fetching stats:', error);
        return;
      }

      if (!data) {
        console.error('No data returned from stats query');
        return;
      }

      // Count failed documents - includes:
      // 1. Corrupted/invalid PDFs (can't be fixed)
      // 2. Other errors
      // 3. Metadata-only analysis (needs OCR reprocessing)
      const failed = data.filter(d => {
        // Explicitly failed status
        if (d.analysis_status === 'failed') return true;
        
        // No analysis result at all
        if (!d.analysis_result) return true;
        
        const result = d.analysis_result as any;
        
        // Check for corrupted or invalid PDFs
        if (result.fileCorrupted || result.error?.includes('Corrupted') || result.error?.includes('Invalid PDF')) {
          return true;
        }
        
        // Check for parsing errors
        if (result.error || result.analysis?.includes('failed') || result.analysis?.includes('error')) {
          return true;
        }
        
        // Check for metadata-only analysis (needs reprocessing)
        const extractedText = result.extractedText || '';
        if (extractedText.includes('PDF parsing failed') || extractedText.length < 50) {
          return true;
        }
        
        return false;
      }).length;

      // Count successful - has findings and REAL extracted text
      const successful = data.filter(d => {
        if (d.analysis_status !== 'complete' && d.analysis_status !== 'completed') return false;
        if (!d.analysis_result) return false;
        
        const result = d.analysis_result as any;
        if (result.fileCorrupted || result.error) return false;
        
        // Must have real extracted text
        const extractedText = result.extractedText || '';
        if (extractedText.includes('PDF parsing failed') || extractedText.length < 50) {
          return false;
        }
        
        // Has actual findings or analysis
        return d.findings && d.findings.length > 0;
      }).length;

      const newStats = {
        total: data.length,
        failed,
        successful
      };

      console.log('📊 Stats updated:', newStats, {
        failedDocs: data.filter(d => {
          if (d.analysis_status === 'failed') return true;
          if (!d.analysis_result) return true;
          const result = d.analysis_result as any;
          return result.fileCorrupted || result.error;
        }).length
      });
      
      setStats(newStats);
    } catch (err) {
      console.error('Error in fetchStats:', err);
    }
  };

  const processFileWithOCR = async (documentUrl: string, filename: string): Promise<{ text: string; pageCount: number }> => {
    // Fetch the PDF
    const response = await fetch(documentUrl);
    const arrayBuffer = await response.arrayBuffer();
    
    const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
    const pageCount = pdf.numPages;
    let fullText = '';

    for (let pageNum = 1; pageNum <= pageCount; pageNum++) {
      if (cancelOcr) {
        throw new Error('OCR cancelled by user');
      }

      setOcrProgress(prev => prev ? {
        ...prev,
        stage: `Processing page ${pageNum} of ${pageCount}...`
      } : null);

      const page = await pdf.getPage(pageNum);
      const viewport = page.getViewport({ scale: 2.0 });
      
      const canvas = document.createElement('canvas');
      const context = canvas.getContext('2d');
      if (!context) throw new Error('Failed to get canvas context');
      
      canvas.height = viewport.height;
      canvas.width = viewport.width;

      await page.render({ canvasContext: context, viewport }).promise;
      
      const imageData = canvas.toDataURL('image/png');
      
      const { data: { text } } = await Tesseract.recognize(
        imageData,
        'eng',
        {
          logger: (m) => {
            if (m.status === 'recognizing text') {
              const percent = Math.round(m.progress * 100);
              setOcrProgress(prev => prev ? {
                ...prev,
                stage: `Page ${pageNum}/${pageCount}: ${percent}%`
              } : null);
            }
          }
        }
      );
      
      fullText += `\n--- Page ${pageNum} ---\n${text}\n`;
    }

    return { text: fullText, pageCount };
  };

  const handleOcrReprocess = async () => {
    setIsOcrProcessing(true);
    setCancelOcr(false);
    
    try {
      // Fetch all documents that need reprocessing:
      // 1. No analysis result at all
      // 2. Explicitly failed status
      // 3. Has "PDF parsing failed" in extracted text (metadata-only analysis)
      // 4. Missing extractedText field
      // 5. Very short extractedText (< 50 chars)
      const { data: allDocs, error: fetchError } = await supabase
        .from('forensic_documents')
        .select('id, filename, document_url, analysis_result, analysis_status');

      if (fetchError) throw fetchError;
      
      // Filter to documents that need real text extraction
      const failedDocs = allDocs?.filter(doc => {
        // No analysis result
        if (!doc.analysis_result) return true;
        
        // Explicitly failed
        if (doc.analysis_status === 'failed') return true;
        
        const result = doc.analysis_result as any;
        
        // Has corrupted file flag - skip these, they can't be processed
        if (result.fileCorrupted) return false;
        
        // Has error
        if (result.error) return true;
        
        // Check extracted text
        const extractedText = result.extractedText || '';
        
        // Has "PDF parsing failed" message - needs real extraction
        if (extractedText.includes('PDF parsing failed')) return true;
        
        // Missing or very short extracted text
        if (extractedText.length < 50) return true;
        
        return false;
      }) || [];

      if (fetchError) throw fetchError;
      if (!failedDocs || failedDocs.length === 0) {
        toast({
          title: "No Failed Documents",
          description: "All documents have been successfully processed",
        });
        setIsOcrProcessing(false);
        return;
      }

      setOcrProgress({
        current: 0,
        total: failedDocs.length,
        currentFile: '',
        stage: 'Starting...'
      });

      let successCount = 0;
      let errorCount = 0;

      for (let i = 0; i < failedDocs.length; i++) {
        if (cancelOcr) {
          toast({
            title: "OCR Cancelled",
            description: `Processed ${successCount} of ${failedDocs.length} documents before cancellation`,
          });
          break;
        }

        const doc = failedDocs[i];
        
        setOcrProgress({
          current: i + 1,
          total: failedDocs.length,
          currentFile: doc.filename,
          stage: 'Loading PDF...'
        });

        try {
          // Update document status
          await supabase
            .from('forensic_documents')
            .update({ analysis_status: 'processing' })
            .eq('id', doc.id);

          // Extract text with OCR
          let text = '';
          let pageCount = 0;
          let ocrSuccess = false;
          
          try {
            const ocrResult = await processFileWithOCR(doc.document_url, doc.filename);
            text = ocrResult.text;
            pageCount = ocrResult.pageCount;
            ocrSuccess = true;
          } catch (ocrError) {
            console.error(`OCR failed for ${doc.filename}:`, ocrError);
            
            // Check if it's a corrupted PDF
            if (ocrError instanceof Error && 
                (ocrError.message.includes('Invalid PDF') || 
                 ocrError.message.includes('InvalidPDFException'))) {
              // Mark as corrupted PDF - can't be processed
              await supabase
                .from('forensic_documents')
                .update({
                  analysis_status: 'failed',
                  analysis_result: {
                    error: 'Corrupted or invalid PDF file structure',
                    fileCorrupted: true,
                    ocrAttempted: true
                  },
                  findings: ['Document appears to be corrupted or has invalid PDF structure'],
                  confidence_score: 0
                })
                .eq('id', doc.id);
              
              errorCount++;
              continue; // Skip to next document
            }
            
            // For other OCR errors, continue with empty text
            text = '[OCR extraction failed - document may be password protected or encrypted]';
          }

          setOcrProgress(prev => prev ? { ...prev, stage: 'Analyzing with AI...' } : null);

          // Only analyze if we got some text
          if (ocrSuccess && text.trim().length > 50) {
            // Analyze with forensic-document-analysis
            const { data: analysisData, error: analysisError } = await supabase.functions.invoke('forensic-document-analysis', {
              body: {
                documentUrl: doc.document_url,
                extractedText: text,
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

            if (analysisError) throw analysisError;

            // Update document with results
            await supabase
              .from('forensic_documents')
              .update({
                analysis_status: 'complete',
                analysis_result: {
                  ...analysisData,
                  ocrExtracted: true,
                  ocrPageCount: pageCount
                },
                findings: analysisData.findings || [],
                confidence_score: analysisData.confidence_score || 0,
                analyzed_at: new Date().toISOString()
              })
              .eq('id', doc.id);

            successCount++;
          } else {
            // Not enough text extracted
            await supabase
              .from('forensic_documents')
              .update({
                analysis_status: 'failed',
                analysis_result: {
                  error: 'Insufficient text extracted from OCR',
                  ocrExtracted: true,
                  ocrPageCount: pageCount,
                  extractedTextLength: text.length
                },
                findings: ['Unable to extract sufficient text content for analysis'],
                confidence_score: 0
              })
              .eq('id', doc.id);
            
            errorCount++;
          }
        } catch (error) {
          console.error(`Error processing ${doc.filename}:`, error);
          errorCount++;
          
          // Update with error
          await supabase
            .from('forensic_documents')
            .update({
              analysis_status: 'failed',
              analysis_result: {
                error: error instanceof Error ? error.message : 'OCR processing failed',
                ocrAttempted: true
              }
            })
            .eq('id', doc.id);
        }
      }

      setIsOcrProcessing(false);
      setOcrProgress(null);
      
      // Wait a moment for DB to settle, then refresh stats
      setTimeout(() => {
        fetchStats();
      }, 1000);

      toast({
        title: "OCR Processing Complete",
        description: `Successfully processed ${successCount} documents. ${errorCount} failed.`,
      });

    } catch (error) {
      console.error('Error in OCR reprocess:', error);
      toast({
        title: "OCR Processing Failed",
        description: error instanceof Error ? error.message : 'Unknown error',
        variant: "destructive"
      });
      setIsOcrProcessing(false);
      setOcrProgress(null);
      
      // Refresh stats even on error
      fetchStats();
    }
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

  // Fetch stats on mount and set up real-time updates
  useEffect(() => {
    fetchStats();

    // Subscribe to changes in forensic_documents table
    const channel = supabase
      .channel('forensic-stats-updates')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'forensic_documents'
        },
        () => {
          console.log('Document updated, refreshing stats...');
          fetchStats();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
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

        {isOcrProcessing && ocrProgress && (
          <div className="space-y-2">
            <Alert>
              <FileSearch className="h-4 w-4 animate-pulse" />
              <AlertDescription>
                <div className="space-y-1">
                  <div>OCR Processing: {ocrProgress.current} of {ocrProgress.total} documents</div>
                  <div className="text-xs text-muted-foreground">
                    Current: {ocrProgress.currentFile}
                  </div>
                  <div className="text-xs font-medium">{ocrProgress.stage}</div>
                </div>
              </AlertDescription>
            </Alert>
            <Progress value={(ocrProgress.current / ocrProgress.total) * 100} className="h-2" />
          </div>
        )}

        <div className="flex flex-col gap-2">
          <div className="flex gap-2">
            <Button
              onClick={handleReprocessAll}
              disabled={isProcessing || isOcrProcessing || (stats && stats.failed === 0)}
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
              disabled={isProcessing || isOcrProcessing}
            >
              <RefreshCw className="h-4 w-4" />
            </Button>
          </div>

          {stats && stats.failed > 0 && (
            <div className="flex gap-2">
              <Button
                onClick={handleOcrReprocess}
                disabled={isProcessing || isOcrProcessing}
                variant="secondary"
                className="flex-1"
              >
                <FileSearch className={`mr-2 h-4 w-4 ${isOcrProcessing ? 'animate-pulse' : ''}`} />
                {isOcrProcessing ? 'OCR Processing...' : `OCR Reprocess ${stats.failed} Failed PDFs`}
              </Button>
              
              {isOcrProcessing && (
                <Button
                  onClick={() => setCancelOcr(true)}
                  variant="destructive"
                  size="sm"
                >
                  Cancel
                </Button>
              )}
            </div>
          )}
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
