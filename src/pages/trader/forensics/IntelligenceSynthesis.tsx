import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Brain, TrendingUp, AlertTriangle, CheckCircle2, XCircle, Target, ArrowLeft, FileText, BookOpen } from "lucide-react";
import { useForensicData } from "@/hooks/useForensicData";
import { TraderProtection } from "@/components/trader/TraderProtection";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useEffect, useState } from "react";

export default function IntelligenceSynthesis() {
  const navigate = useNavigate();
  const { evidence, getSynthesisSummary, loading } = useForensicData();
  const synthesis = getSynthesisSummary();
  const [documentStats, setDocumentStats] = useState({ totalDocuments: 0, totalPages: 0 });

  useEffect(() => {
    const fetchDocumentStats = async () => {
      const { data, error } = await supabase
        .from('forensic_documents')
        .select('metadata');
      
      if (!error && data) {
        const totalDocs = data.length;
        const totalPages = data.reduce((sum, doc) => {
          const metadata = doc.metadata as any;
          const pageCount = metadata?.pageCount || 0;
          return sum + pageCount;
        }, 0);
        
        setDocumentStats({ totalDocuments: totalDocs, totalPages });
      }
    };
    
    fetchDocumentStats();
  }, []);

  // Calculate acquisition probability based on evidence
  const calculateAcquisitionProbability = () => {
    const confirmedEvidence = evidence.filter(e => e.status === 'confirmed');
    const strongEvidence = evidence.filter(e => e.status === 'strong');
    const totalWeight = confirmedEvidence.length * 15 + strongEvidence.length * 8;
    return Math.min(Math.round(totalWeight + 45), 95);
  };

  const acquisitionProbability = calculateAcquisitionProbability();

  const getProbabilityColor = (prob: number) => {
    if (prob >= 75) return "text-green-400";
    if (prob >= 50) return "text-yellow-400";
    return "text-orange-400";
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'confirmed': return <CheckCircle2 className="text-green-600" size={16} />;
      case 'strong': return <TrendingUp className="text-blue-600" size={16} />;
      case 'investigating': return <Brain className="text-primary" size={16} />;
      default: return <XCircle className="text-muted-foreground" size={16} />;
    }
  };

  if (loading) {
    return (
      <TraderProtection>
        <div className="min-h-screen bg-background p-6">
          <div className="flex items-center justify-center h-[60vh]">
            <div className="text-center">
              <Brain className="w-12 h-12 text-primary animate-pulse mx-auto mb-4" />
              <p className="text-muted-foreground">Synthesizing intelligence...</p>
            </div>
          </div>
        </div>
      </TraderProtection>
    );
  }

  return (
    <TraderProtection>
      <div className="min-h-screen bg-background">
        {/* Header */}
        <div className="border-b border-border/40 bg-card/50 backdrop-blur-sm sticky top-0 z-10">
          <div className="container mx-auto px-6 py-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <Brain className="text-primary animate-pulse" size={32} />
                  <h1 className="text-3xl font-bold">Intelligence Synthesis</h1>
                </div>
                <p className="text-muted-foreground">AI-powered analysis combining all forensic evidence streams</p>
              </div>
              <Button 
                onClick={() => navigate('/trader/forensics')}
                variant="outline"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Forensics
              </Button>
            </div>
          </div>
        </div>

        <div className="container mx-auto px-6 py-8 space-y-6">
          {/* Primary Insight Card */}
          <Card className="border-primary/20 bg-card shadow-sm">
            <div className="p-6">
              <div className="flex items-start gap-4">
                <div className="bg-primary/10 p-3 rounded-lg">
                  <Target className="text-primary" size={24} />
                </div>
                <div className="flex-1">
                  <h2 className="text-xl font-bold mb-2">Primary Hypothesis</h2>
                  <p className="text-muted-foreground text-lg mb-4">
                    Overstock is acquiring BBBY's intellectual property and NOLs through the DK-Butterfly bankruptcy entity, 
                    with timing orchestrated to preserve billions in tax benefits under Section 382's 2-year rule.
                  </p>
                  <div className="flex items-center gap-6">
                    <div>
                      <div className="text-sm text-muted-foreground mb-1">Acquisition Probability</div>
                      <div className={`text-3xl font-bold ${getProbabilityColor(acquisitionProbability)}`}>
                        {acquisitionProbability}%
                      </div>
                    </div>
                    <div className="flex-1">
                      <Progress value={acquisitionProbability} className="h-3" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </Card>

          {/* Analysis Modules Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {synthesis.modules.map((module, idx) => (
              <Card key={idx} className="hover:shadow-md transition-all">
                <div className="p-4">
                  <div className="flex items-center justify-between mb-3">
                    <Badge 
                      variant={module.status === 'complete' ? 'default' : 'secondary'}
                    >
                      {module.status}
                    </Badge>
                    <span className="text-2xl font-bold">{module.confidence}%</span>
                  </div>
                  <h3 className="font-semibold mb-2">{module.name}</h3>
                  <div className="text-sm text-muted-foreground">
                    {module.findings} findings analyzed
                  </div>
                  <Progress value={module.confidence} className="h-1 mt-2" />
                </div>
              </Card>
            ))}
          </div>

          {/* Evidence Categorization */}
          <Card>
            <div className="p-6">
              <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                <Brain className="text-primary" size={24} />
                Evidence Analysis by Category
              </h2>
              
              <div className="space-y-4">
                {evidence.map((cat, idx) => (
                  <div key={idx} className="border rounded-lg p-4 hover:shadow-sm transition-all">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        {getStatusIcon(cat.status)}
                        <div>
                          <h3 className="font-semibold">{cat.category}</h3>
                          <p className="text-sm text-muted-foreground">{cat.items.length} findings</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <Badge variant="outline">
                          {cat.status}
                        </Badge>
                        <div className="text-sm text-muted-foreground mt-1">
                          {cat.confidence}% confidence
                        </div>
                      </div>
                    </div>
                    
                    <Progress value={cat.confidence} className="h-2 mb-3" />
                    
                    <div className="space-y-2">
                      {cat.items.slice(0, 3).map((item, itemIdx) => (
                        <div key={itemIdx} className="text-sm text-muted-foreground pl-6 border-l-2 border-primary/30">
                          • {item}
                        </div>
                      ))}
                      {cat.items.length > 3 && (
                        <div className="text-sm text-muted-foreground/60 pl-6">
                          +{cat.items.length - 3} more findings
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </Card>

          {/* Key Insights */}
          <Card>
            <div className="p-6">
              <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                <AlertTriangle className="text-yellow-500" size={24} />
                Key Intelligence Insights
              </h2>
              
              <div className="space-y-4">
                <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <div className="flex items-start gap-3">
                    <TrendingUp className="text-blue-600 mt-1" size={20} />
                    <div>
                      <div className="font-semibold mb-1">Timeline Convergence</div>
                      <div className="text-sm text-muted-foreground">
                        Multiple temporal indicators suggest coordination around Section 382's 2-year ownership change window. 
                        Entity formations and bankruptcy timing align with NOL preservation strategy.
                      </div>
                    </div>
                  </div>
                </div>

                <div className="p-4 bg-purple-50 border border-purple-200 rounded-lg">
                  <div className="flex items-start gap-3">
                    <Brain className="text-purple-600 mt-1" size={20} />
                    <div>
                      <div className="font-semibold mb-1">Entity Structure Patterns</div>
                      <div className="text-sm text-muted-foreground">
                        DK-Butterfly's role as bankruptcy vehicle shows sophisticated legal structuring consistent with 
                        asset preservation during distressed M&A transactions.
                      </div>
                    </div>
                  </div>
                </div>

                <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                  <div className="flex items-start gap-3">
                    <CheckCircle2 className="text-green-600 mt-1" size={20} />
                    <div>
                      <div className="font-semibold mb-1">IP Transfer Confirmation</div>
                      <div className="text-sm text-muted-foreground">
                        Documented transfer of BBBY intellectual property to Overstock-controlled entities provides 
                        concrete evidence of acquisition strategy beyond simple liquidation.
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </Card>

          {/* Synthesis Summary */}
          <Card className="border-primary/20">
            <div className="p-6">
              <h2 className="text-xl font-bold mb-4">Synthesis Summary</h2>
              <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
                <div>
                  <div className="text-sm text-muted-foreground mb-1">Total Evidence Items</div>
                  <div className="text-3xl font-bold">{synthesis.totalFindings}</div>
                </div>
                <div>
                  <div className="text-sm text-muted-foreground mb-1">Average Confidence</div>
                  <div className="text-3xl font-bold text-primary">{synthesis.avgConfidence}%</div>
                </div>
                <div>
                  <div className="text-sm text-muted-foreground mb-1">Evidence Categories</div>
                  <div className="text-3xl font-bold text-blue-600">{evidence.length}</div>
                </div>
                <div>
                  <div className="text-sm text-muted-foreground mb-1 flex items-center gap-1">
                    <FileText size={14} />
                    Documents in Library
                  </div>
                  <div className="text-3xl font-bold text-purple-600">{documentStats.totalDocuments}</div>
                </div>
                <div>
                  <div className="text-sm text-muted-foreground mb-1 flex items-center gap-1">
                    <BookOpen size={14} />
                    Pages Analyzed
                  </div>
                  <div className="text-3xl font-bold text-orange-600">{documentStats.totalPages}</div>
                </div>
              </div>
              
              <div className="mt-6 p-4 bg-muted/50 rounded-lg border">
                <div className="text-sm text-muted-foreground mb-2 font-semibold">AI Synthesis Conclusion</div>
                <p className="text-sm">
                  Based on comprehensive analysis of {synthesis.totalFindings} evidence items across {evidence.length} categories, 
                  the forensic investigation indicates a <span className={`font-bold ${getProbabilityColor(acquisitionProbability)}`}>
                  {acquisitionProbability}%</span> probability that the Overstock/BBBY acquisition hypothesis is correct. 
                  The convergence of temporal indicators, entity structures, and documented IP transfers supports 
                  a coordinated strategy for NOL preservation and asset acquisition.
                </p>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </TraderProtection>
  );
}
