import { useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, FileText, Upload, Loader2, Search, Download } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TraderProtection } from "@/components/trader/TraderProtection";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { BulkDocumentImport } from "@/components/forensics/BulkDocumentImport";
import { useForensicData } from "@/hooks/useForensicData";

export default function DocumentAnalysis() {
  const [analyzing, setAnalyzing] = useState(false);
  const [documentUrl, setDocumentUrl] = useState("");
  const [analysis, setAnalysis] = useState<any>(null);
  const { toast } = useToast();
  const { documentAnalyses, loading } = useForensicData();

  const analyzeDocument = async () => {
    if (!documentUrl.trim()) {
      toast({
        title: "Error",
        description: "Please enter a document URL",
        variant: "destructive",
      });
      return;
    }

    setAnalyzing(true);
    try {
      const { data, error } = await supabase.functions.invoke('forensic-document-analysis', {
        body: { 
          documentUrl,
          analysisType: 'comprehensive',
          focusAreas: [
            'NOL preservation language',
            'Section 382 references',
            'Acquisition structures',
            'Timeline references',
            'Entity relationships'
          ]
        }
      });

      if (error) throw error;

      setAnalysis(data);
      toast({
        title: "Analysis Complete",
        description: "Document has been analyzed successfully",
      });
    } catch (error) {
      console.error('Analysis error:', error);
      toast({
        title: "Analysis Failed",
        description: "Could not analyze document. Please try again.",
        variant: "destructive",
      });
    } finally {
      setAnalyzing(false);
    }
  };

  return (
    <TraderProtection>
      <div className="min-h-screen bg-background">
        <div className="border-b border-border/40 bg-card/50 backdrop-blur-sm sticky top-0 z-10">
          <div className="container mx-auto px-4 py-4">
            <div className="flex items-center gap-4">
              <Link to="/trader/forensics">
                <Button variant="ghost" size="sm">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Forensics
                </Button>
              </Link>
              <div>
                <h1 className="text-2xl font-bold">Document Analysis</h1>
                <p className="text-sm text-muted-foreground">
                  AI-powered forensic analysis of legal and financial documents
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="container mx-auto px-4 py-8">
          <Tabs defaultValue="single" className="space-y-6">
            <TabsList className="grid w-full max-w-md grid-cols-2">
              <TabsTrigger value="single">Single Document</TabsTrigger>
              <TabsTrigger value="bulk">Bulk Import</TabsTrigger>
            </TabsList>

            <TabsContent value="single" className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Analysis Input */}
                <div className="lg:col-span-2 space-y-6">
                  <Card>
                <CardHeader>
                  <CardTitle>Analyze New Document</CardTitle>
                  <CardDescription>
                    Upload or provide URL to SEC filing, legal document, or press release
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Document URL</label>
                    <div className="flex gap-2">
                      <Input
                        placeholder="https://www.sec.gov/..."
                        value={documentUrl}
                        onChange={(e) => setDocumentUrl(e.target.value)}
                        disabled={analyzing}
                      />
                      <Button onClick={analyzeDocument} disabled={analyzing}>
                        {analyzing ? (
                          <>
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                            Analyzing
                          </>
                        ) : (
                          <>
                            <Search className="h-4 w-4 mr-2" />
                            Analyze
                          </>
                        )}
                      </Button>
                    </div>
                  </div>

                  <div className="pt-4 border-t">
                    <Button variant="outline" className="w-full">
                      <Upload className="h-4 w-4 mr-2" />
                      Upload PDF Document
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Analysis Results */}
              {analysis && (
                <Card>
                  <CardHeader>
                    <CardTitle>Analysis Results</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="p-4 rounded-lg bg-muted">
                      <h3 className="font-semibold mb-2">Key Findings</h3>
                      <div className="space-y-2 text-sm text-muted-foreground">
                        {analysis.findings?.map((finding: string, idx: number) => (
                          <div key={idx} className="flex gap-2">
                            <div className="h-1.5 w-1.5 rounded-full bg-primary mt-1.5 flex-shrink-0" />
                            <span>{finding}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {analysis.confidence && (
                      <div>
                        <div className="flex justify-between text-sm mb-2">
                          <span>Confidence Level</span>
                          <span className="font-semibold">{analysis.confidence}%</span>
                        </div>
                      </div>
                    )}

                    <Button variant="outline" className="w-full">
                      <Download className="h-4 w-4 mr-2" />
                      Export Analysis
                    </Button>
                  </CardContent>
                </Card>
                  )}
                </div>

                {/* Recent Documents */}
                <div className="space-y-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>Recent Analyses</CardTitle>
                      <CardDescription>
                        {loading ? 'Loading...' : `${documentAnalyses.length} documents analyzed`}
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      {loading ? (
                        <div className="text-center py-8 text-sm text-muted-foreground">
                          <Loader2 className="h-6 w-6 animate-spin mx-auto mb-2" />
                          Loading analyses...
                        </div>
                      ) : documentAnalyses.length === 0 ? (
                        <div className="text-center py-8 text-sm text-muted-foreground">
                          No documents analyzed yet. Start by analyzing a document above or use bulk import.
                        </div>
                      ) : (
                        documentAnalyses.slice(0, 10).map((doc, idx) => (
                          <div
                            key={idx}
                            className="p-3 rounded-lg border border-border hover:border-primary/50 transition-colors cursor-pointer"
                          >
                            <div className="flex items-start justify-between mb-2">
                              <div className="flex-1">
                                <div className="font-medium text-sm truncate">{doc.documentUrl}</div>
                                <div className="text-xs text-muted-foreground">
                                  {doc.findings.length} findings • {doc.confidence}% confidence
                                </div>
                              </div>
                              <Badge variant="default" className="text-xs">
                                Analyzed
                              </Badge>
                            </div>
                            <div className="text-xs text-muted-foreground">
                              {new Date(doc.timestamp).toLocaleDateString()}
                            </div>
                          </div>
                        ))
                      )}
                    </CardContent>
                  </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Analysis Focus Areas</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2">
                      <div className="h-2 w-2 rounded-full bg-green-500" />
                      <span>NOL Preservation</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="h-2 w-2 rounded-full bg-blue-500" />
                      <span>Section 382 References</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="h-2 w-2 rounded-full bg-yellow-500" />
                      <span>Entity Structures</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="h-2 w-2 rounded-full bg-purple-500" />
                      <span>Timeline Indicators</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="h-2 w-2 rounded-full bg-orange-500" />
                      <span>Related Parties</span>
                    </div>
                  </div>
                </CardContent>
                  </Card>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="bulk">
              <BulkDocumentImport />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </TraderProtection>
  );
}
