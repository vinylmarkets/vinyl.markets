import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Loader2, FileText, CheckCircle, AlertCircle, Upload, X } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import Tesseract from 'tesseract.js';
import * as pdfjsLib from 'pdfjs-dist';

// Set up PDF.js worker
pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';

interface ImportResult {
  url: string;
  status: 'pending' | 'processing' | 'ocr' | 'success' | 'error';
  findings?: string[];
  confidence?: number;
  error?: string;
  filename?: string;
  ocrProgress?: string;
  extractedText?: string;
  pageCount?: number;
  ocrComplete?: boolean;
}

export const BulkDocumentImport = () => {
  const [urls, setUrls] = useState("");
  const [files, setFiles] = useState<File[]>([]);
  const [importing, setImporting] = useState(false);
  const [results, setResults] = useState<ImportResult[]>([]);
  const [progress, setProgress] = useState(0);
  const [cancelOcr, setCancelOcr] = useState(false);
  const { toast } = useToast();

  const processFileWithOCR = async (file: File, index: number): Promise<{ text: string; pageCount: number }> => {
    setCancelOcr(false);
    
    // Update status
    setResults(prev => prev.map((r, idx) => 
      idx === index ? { ...r, status: 'ocr', ocrProgress: 'Loading PDF...' } : r
    ));

    const arrayBuffer = await file.arrayBuffer();
    const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
    const pageCount = pdf.numPages;
    let fullText = '';

    for (let pageNum = 1; pageNum <= pageCount; pageNum++) {
      if (cancelOcr) {
        throw new Error('OCR cancelled by user');
      }

      setResults(prev => prev.map((r, idx) => 
        idx === index ? { ...r, ocrProgress: `Processing page ${pageNum} of ${pageCount}...` } : r
      ));

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
              setResults(prev => prev.map((r, idx) => 
                idx === index ? { 
                  ...r, 
                  ocrProgress: `Page ${pageNum}/${pageCount}: ${percent}%` 
                } : r
              ));
            }
          }
        }
      );
      
      fullText += `\n--- Page ${pageNum} ---\n${text}\n`;
    }

    return { text: fullText, pageCount };
  };

  const handleFileUpload = async () => {
    if (files.length === 0) {
      toast({
        title: "No Files",
        description: "Please select at least one PDF file",
        variant: "destructive",
      });
      return;
    }

    if (files.length > 20) {
      toast({
        title: "Too Many Files",
        description: "Please upload 20 files or fewer at a time",
        variant: "destructive",
      });
      return;
    }

    setImporting(true);
    const initialResults: ImportResult[] = files.map(file => ({
      url: file.name,
      filename: file.name,
      status: 'pending'
    }));
    setResults(initialResults);
    setProgress(0);

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      
      try {
        let extractedText = '';
        let pageCount = 0;
        let ocrComplete = false;

        // Only do OCR for PDFs
        if (file.type === 'application/pdf') {
          try {
            const ocrResult = await processFileWithOCR(file, i);
            extractedText = ocrResult.text;
            pageCount = ocrResult.pageCount;
            ocrComplete = true;
          } catch (error) {
            console.error('OCR failed:', error);
            if (error instanceof Error && error.message === 'OCR cancelled by user') {
              throw error;
            }
            // Continue without OCR if it fails
            extractedText = '[OCR failed - manual review needed]';
            ocrComplete = false;
          }
        }

        // Upload to storage
        setResults(prev => prev.map((r, idx) => 
          idx === i ? { ...r, status: 'processing', ocrProgress: 'Uploading...' } : r
        ));

        const filePath = `${crypto.randomUUID()}-${file.name}`;
        const { error: uploadError } = await supabase.storage
          .from('forensic-documents')
          .upload(filePath, file);

        if (uploadError) throw uploadError;

        // Get public URL
        const { data: { publicUrl } } = supabase.storage
          .from('forensic-documents')
          .getPublicUrl(filePath);

        // Analyze document
        const { data, error } = await supabase.functions.invoke('forensic-document-analysis', {
          body: { 
            documentUrl: publicUrl,
            extractedText,
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

        setResults(prev => prev.map((r, idx) => 
          idx === i ? { 
            ...r, 
            status: 'success',
            findings: data.findings || [],
            confidence: data.confidence || 0,
            extractedText,
            pageCount,
            ocrComplete
          } : r
        ));
      } catch (error) {
        console.error(`Error processing ${file.name}:`, error);
        
        setResults(prev => prev.map((r, idx) => 
          idx === i ? { 
            ...r, 
            status: 'error',
            error: error instanceof Error ? error.message : 'Processing failed'
          } : r
        ));
      }

      setProgress(Math.round(((i + 1) / files.length) * 100));
    }

    setImporting(false);
    toast({
      title: "Upload Complete",
      description: `Processed ${files.length} files`,
    });
  };

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
      case 'ocr':
        return <Loader2 className="h-4 w-4 animate-spin text-purple-500" />;
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
      case 'ocr': return 'bg-purple-500/10 border-purple-500/20';
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
          Import multiple documents via URL or upload PDFs with automatic OCR text extraction
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Tabs defaultValue="url">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="url">Import from URLs</TabsTrigger>
            <TabsTrigger value="upload">Upload PDFs (OCR)</TabsTrigger>
          </TabsList>
          
          <TabsContent value="url" className="space-y-4">
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
          </TabsContent>

          <TabsContent value="upload" className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">PDF Files</label>
              <Input
                type="file"
                accept="application/pdf"
                multiple
                onChange={(e) => setFiles(Array.from(e.target.files || []))}
                disabled={importing}
              />
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span>{files.length} files selected</span>
                <span>Maximum: 20 PDFs • OCR enabled</span>
              </div>
              {files.length > 0 && (
                <div className="space-y-1 max-h-32 overflow-y-auto p-2 border rounded-lg">
                  {files.map((file, idx) => (
                    <div key={idx} className="flex items-center justify-between text-xs">
                      <span className="truncate flex-1">{file.name}</span>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setFiles(files.filter((_, i) => i !== idx))}
                        disabled={importing}
                        className="h-6 w-6 p-0"
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="flex gap-2">
              <Button 
                onClick={handleFileUpload} 
                disabled={importing || files.length === 0}
                className="flex-1"
              >
                {importing ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Processing with OCR...
                  </>
                ) : (
                  <>
                    <Upload className="h-4 w-4 mr-2" />
                    Upload & Analyze
                  </>
                )}
              </Button>
              {importing && (
                <Button 
                  variant="destructive" 
                  onClick={() => setCancelOcr(true)}
                >
                  Cancel OCR
                </Button>
              )}
              {results.length > 0 && (
                <Button 
                  variant="outline" 
                  onClick={() => {
                    setResults([]);
                    setProgress(0);
                    setFiles([]);
                  }}
                  disabled={importing}
                >
                  Clear
                </Button>
              )}
            </div>
          </TabsContent>
        </Tabs>

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
                      {result.status === 'ocr' && result.ocrProgress && (
                        <div className="text-xs text-purple-500 mt-1">{result.ocrProgress}</div>
                      )}
                      {result.status === 'success' && result.findings && (
                        <div className="mt-2 space-y-1">
                          <div className="text-xs text-muted-foreground">
                            {result.findings.length} findings • {result.confidence}% confidence
                            {result.ocrComplete && result.pageCount && (
                              <> • OCR: {result.pageCount} pages extracted</>
                            )}
                            {result.ocrComplete === false && (
                              <> • ⚠️ OCR failed - manual review needed</>
                            )}
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
