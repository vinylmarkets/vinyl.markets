import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Loader2, Sparkles, FileText, CheckCircle, AlertCircle, Download } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Checkbox } from "@/components/ui/checkbox";

interface DiscoveredDocument {
  title: string;
  url: string;
  date: string;
  type: string;
  relevanceScore: number;
  description: string;
  selected?: boolean;
}

export const AutoDocumentDiscovery = () => {
  const [docketUrl, setDocketUrl] = useState("https://cases.ra.kroll.com/bbby/Home-Index");
  const [discovering, setDiscovering] = useState(false);
  const [importing, setImporting] = useState(false);
  const [documents, setDocuments] = useState<DiscoveredDocument[]>([]);
  const [progress, setProgress] = useState(0);
  const { toast } = useToast();

  const discoverDocuments = async () => {
    setDiscovering(true);
    setDocuments([]);
    
    try {
      const { data, error } = await supabase.functions.invoke('scrape-kroll-documents', {
        body: { 
          action: 'discover',
          docketUrl
        }
      });

      if (error) throw error;

      if (data.success && data.documents) {
        // Sort by relevance score
        const sortedDocs = data.documents
          .sort((a: DiscoveredDocument, b: DiscoveredDocument) => b.relevanceScore - a.relevanceScore)
          .map((doc: DiscoveredDocument) => ({ ...doc, selected: doc.relevanceScore >= 70 }));
        
        setDocuments(sortedDocs);
        
        toast({
          title: "Discovery Complete",
          description: `Found ${data.totalFound} documents. High-relevance documents pre-selected.`,
        });
      }
    } catch (error) {
      console.error('Discovery error:', error);
      toast({
        title: "Discovery Failed",
        description: error instanceof Error ? error.message : "Could not discover documents",
        variant: "destructive",
      });
    } finally {
      setDiscovering(false);
    }
  };

  const importSelected = async () => {
    const selected = documents.filter(d => d.selected);
    
    if (selected.length === 0) {
      toast({
        title: "No Documents Selected",
        description: "Please select at least one document to import",
        variant: "destructive",
      });
      return;
    }

    setImporting(true);
    setProgress(0);

    let imported = 0;
    let failed = 0;

    for (let i = 0; i < selected.length; i++) {
      const doc = selected[i];
      
      try {
        const { data, error } = await supabase.functions.invoke('forensic-document-analysis', {
          body: { 
            documentUrl: doc.url,
            analysisType: 'comprehensive',
            focusAreas: [
              'NOL preservation language',
              'Section 382 references',
              'Acquisition structures',
              'Timeline references',
              'Entity relationships',
              'Bankruptcy proceedings',
              'Asset transfers',
              'DK-Butterfly mentions',
              'Overstock references'
            ],
            metadata: {
              title: doc.title,
              date: doc.date,
              type: doc.type,
              source: 'kroll_auto_discovery'
            }
          }
        });

        if (error) throw error;
        imported++;
      } catch (error) {
        console.error(`Failed to analyze ${doc.title}:`, error);
        failed++;
      }

      setProgress(Math.round(((i + 1) / selected.length) * 100));
      
      // Small delay to avoid overwhelming the system
      if (i < selected.length - 1) {
        await new Promise(resolve => setTimeout(resolve, 2000));
      }
    }

    setImporting(false);
    
    toast({
      title: "Import Complete",
      description: `Successfully imported ${imported} documents. ${failed > 0 ? `${failed} failed.` : ''}`,
    });

    // Reload forensic data
    window.location.reload();
  };

  const toggleDocument = (index: number) => {
    setDocuments(prev => prev.map((doc, i) => 
      i === index ? { ...doc, selected: !doc.selected } : doc
    ));
  };

  const toggleAll = (checked: boolean) => {
    setDocuments(prev => prev.map(doc => ({ ...doc, selected: checked })));
  };

  const selectedCount = documents.filter(d => d.selected).length;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-primary" />
          AI-Powered Document Discovery
        </CardTitle>
        <CardDescription>
          Automatically discover and import relevant BBBY bankruptcy court documents
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <label className="text-sm font-medium">Kroll Docket URL</label>
          <div className="flex gap-2">
            <Input
              value={docketUrl}
              onChange={(e) => setDocketUrl(e.target.value)}
              disabled={discovering || importing}
              placeholder="https://cases.ra.kroll.com/bbby/..."
            />
            <Button 
              onClick={discoverDocuments} 
              disabled={discovering || importing || !docketUrl}
            >
              {discovering ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Scanning...
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4 mr-2" />
                  Discover
                </>
              )}
            </Button>
          </div>
          <p className="text-xs text-muted-foreground">
            AI will scan the docket and identify documents relevant to NOL preservation and acquisition analysis
          </p>
        </div>

        {documents.length > 0 && (
          <>
            <div className="flex items-center justify-between pt-4 border-t">
              <div className="flex items-center gap-4">
                <Checkbox
                  checked={documents.every(d => d.selected)}
                  onCheckedChange={toggleAll}
                />
                <span className="text-sm font-medium">
                  {selectedCount} of {documents.length} selected
                </span>
              </div>
              <Button 
                onClick={importSelected}
                disabled={importing || selectedCount === 0}
              >
                {importing ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Importing...
                  </>
                ) : (
                  <>
                    <Download className="h-4 w-4 mr-2" />
                    Import Selected
                  </>
                )}
              </Button>
            </div>

            {importing && (
              <div className="space-y-2">
                <Progress value={progress} className="h-2" />
                <p className="text-xs text-center text-muted-foreground">
                  Analyzing and importing documents... {progress}%
                </p>
              </div>
            )}

            <div className="space-y-2 max-h-96 overflow-y-auto">
              {documents.map((doc, idx) => (
                <div
                  key={idx}
                  className={`p-3 rounded-lg border transition-colors ${
                    doc.selected 
                      ? 'border-primary bg-primary/5' 
                      : 'border-border hover:border-primary/50'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <Checkbox
                      checked={doc.selected}
                      onCheckedChange={() => toggleDocument(idx)}
                      disabled={importing}
                      className="mt-1"
                    />
                    <FileText className="h-5 w-5 text-muted-foreground mt-0.5 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2 mb-1">
                        <div className="font-medium text-sm">{doc.title}</div>
                        <Badge 
                          variant={doc.relevanceScore >= 80 ? "default" : doc.relevanceScore >= 60 ? "secondary" : "outline"}
                          className="text-xs flex-shrink-0"
                        >
                          {doc.relevanceScore}% relevant
                        </Badge>
                      </div>
                      <div className="text-xs text-muted-foreground mb-1">
                        {doc.type} • {doc.date}
                      </div>
                      {doc.description && (
                        <div className="text-xs text-muted-foreground line-clamp-2">
                          {doc.description}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}

        {!discovering && documents.length === 0 && (
          <div className="text-center py-8 text-sm text-muted-foreground">
            <Sparkles className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            Click "Discover" to automatically find relevant BBBY bankruptcy documents
          </div>
        )}
      </CardContent>
    </Card>
  );
};
