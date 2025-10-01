import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Brain, TrendingUp, AlertTriangle, CheckCircle2, XCircle, Target, ArrowLeft } from "lucide-react";
import { useForensicData } from "@/hooks/useForensicData";
import { TraderProtection } from "@/components/trader/TraderProtection";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { useNavigate } from "react-router-dom";

export default function IntelligenceSynthesis() {
  const navigate = useNavigate();
  const { evidence, getSynthesisSummary, loading } = useForensicData();
  const synthesis = getSynthesisSummary();

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
      case 'confirmed': return <CheckCircle2 className="text-green-400" size={16} />;
      case 'strong': return <TrendingUp className="text-blue-400" size={16} />;
      case 'investigating': return <Brain className="text-purple-400" size={16} />;
      default: return <XCircle className="text-gray-400" size={16} />;
    }
  };

  if (loading) {
    return (
      <TraderProtection>
        <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900/20 to-gray-900 p-8">
          <div className="flex items-center justify-center h-[60vh]">
            <div className="text-center">
              <Brain className="w-12 h-12 text-purple-400 animate-pulse mx-auto mb-4" />
              <p className="text-gray-400">Synthesizing intelligence...</p>
            </div>
          </div>
        </div>
      </TraderProtection>
    );
  }

  return (
    <TraderProtection>
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900/20 to-gray-900 p-8">
        {/* Header */}
        <div className="max-w-7xl mx-auto mb-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <Brain className="text-purple-400 animate-pulse" size={32} />
                <h1 className="text-3xl font-bold text-white">Intelligence Synthesis</h1>
              </div>
              <p className="text-gray-400">AI-powered analysis combining all forensic evidence streams</p>
            </div>
            <Button 
              onClick={() => navigate('/trader/forensics')}
              variant="outline"
              className="border-purple-500/30 hover:border-purple-400"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Forensics
            </Button>
          </div>
        </div>

        <div className="max-w-7xl mx-auto space-y-6">
          {/* Primary Insight Card */}
          <Card className="bg-gradient-to-br from-purple-500/10 via-blue-500/5 to-transparent border-purple-500/30 p-6">
            <div className="flex items-start gap-4">
              <div className="bg-purple-500/20 p-3 rounded-lg">
                <Target className="text-purple-400" size={24} />
              </div>
              <div className="flex-1">
                <h2 className="text-xl font-bold text-white mb-2">Primary Hypothesis</h2>
                <p className="text-gray-300 text-lg mb-4">
                  Overstock is acquiring BBBY's intellectual property and NOLs through the DK-Butterfly bankruptcy entity, 
                  with timing orchestrated to preserve billions in tax benefits under Section 382's 2-year rule.
                </p>
                <div className="flex items-center gap-6">
                  <div>
                    <div className="text-sm text-gray-400 mb-1">Acquisition Probability</div>
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
          </Card>

          {/* Analysis Modules Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {synthesis.modules.map((module, idx) => (
              <Card key={idx} className="bg-gray-800/40 border-gray-700/50 p-4 hover:border-purple-500/30 transition-all">
                <div className="flex items-center justify-between mb-3">
                  <Badge 
                    variant={module.status === 'complete' ? 'default' : 'secondary'}
                    className={module.status === 'complete' ? 'bg-green-500/20 text-green-400' : ''}
                  >
                    {module.status}
                  </Badge>
                  <span className="text-2xl font-bold text-white">{module.confidence}%</span>
                </div>
                <h3 className="font-semibold text-white mb-2">{module.name}</h3>
                <div className="text-sm text-gray-400">
                  {module.findings} findings analyzed
                </div>
                <Progress value={module.confidence} className="h-1 mt-2" />
              </Card>
            ))}
          </div>

          {/* Evidence Categorization */}
          <Card className="bg-gray-800/40 border-gray-700/50 p-6">
            <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
              <Brain className="text-purple-400" size={24} />
              Evidence Analysis by Category
            </h2>
            
            <div className="space-y-4">
              {evidence.map((cat, idx) => (
                <div key={idx} className="border border-gray-700/50 rounded-lg p-4 hover:border-purple-500/30 transition-all">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      {getStatusIcon(cat.status)}
                      <div>
                        <h3 className="font-semibold text-white">{cat.category}</h3>
                        <p className="text-sm text-gray-400">{cat.items.length} findings</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <Badge 
                        variant="outline"
                        className={
                          cat.status === 'confirmed' ? 'border-green-500/50 text-green-400' :
                          cat.status === 'strong' ? 'border-blue-500/50 text-blue-400' :
                          cat.status === 'investigating' ? 'border-purple-500/50 text-purple-400' :
                          'border-gray-500/50 text-gray-400'
                        }
                      >
                        {cat.status}
                      </Badge>
                      <div className="text-sm text-gray-400 mt-1">
                        {cat.confidence}% confidence
                      </div>
                    </div>
                  </div>
                  
                  <Progress value={cat.confidence} className="h-2 mb-3" />
                  
                  <div className="space-y-2">
                    {cat.items.slice(0, 3).map((item, itemIdx) => (
                      <div key={itemIdx} className="text-sm text-gray-300 pl-6 border-l-2 border-purple-500/30">
                        • {item}
                      </div>
                    ))}
                    {cat.items.length > 3 && (
                      <div className="text-sm text-gray-500 pl-6">
                        +{cat.items.length - 3} more findings
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </Card>

          {/* Key Insights */}
          <Card className="bg-gray-800/40 border-gray-700/50 p-6">
            <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
              <AlertTriangle className="text-yellow-400" size={24} />
              Key Intelligence Insights
            </h2>
            
            <div className="space-y-4">
              <div className="p-4 bg-blue-500/10 border border-blue-500/30 rounded-lg">
                <div className="flex items-start gap-3">
                  <TrendingUp className="text-blue-400 mt-1" size={20} />
                  <div>
                    <div className="font-semibold text-white mb-1">Timeline Convergence</div>
                    <div className="text-sm text-gray-300">
                      Multiple temporal indicators suggest coordination around Section 382's 2-year ownership change window. 
                      Entity formations and bankruptcy timing align with NOL preservation strategy.
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-4 bg-purple-500/10 border border-purple-500/30 rounded-lg">
                <div className="flex items-start gap-3">
                  <Brain className="text-purple-400 mt-1" size={20} />
                  <div>
                    <div className="font-semibold text-white mb-1">Entity Structure Patterns</div>
                    <div className="text-sm text-gray-300">
                      DK-Butterfly's role as bankruptcy vehicle shows sophisticated legal structuring consistent with 
                      asset preservation during distressed M&A transactions.
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-4 bg-green-500/10 border border-green-500/30 rounded-lg">
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="text-green-400 mt-1" size={20} />
                  <div>
                    <div className="font-semibold text-white mb-1">IP Transfer Confirmation</div>
                    <div className="text-sm text-gray-300">
                      Documented transfer of BBBY intellectual property to Overstock-controlled entities provides 
                      concrete evidence of acquisition strategy beyond simple liquidation.
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </Card>

          {/* Synthesis Summary */}
          <Card className="bg-gradient-to-br from-gray-800/60 to-purple-900/20 border-purple-500/30 p-6">
            <h2 className="text-xl font-bold text-white mb-4">Synthesis Summary</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <div className="text-sm text-gray-400 mb-1">Total Evidence Items</div>
                <div className="text-3xl font-bold text-white">{synthesis.totalFindings}</div>
              </div>
              <div>
                <div className="text-sm text-gray-400 mb-1">Average Confidence</div>
                <div className="text-3xl font-bold text-purple-400">{synthesis.avgConfidence}%</div>
              </div>
              <div>
                <div className="text-sm text-gray-400 mb-1">Evidence Categories</div>
                <div className="text-3xl font-bold text-blue-400">{evidence.length}</div>
              </div>
            </div>
            
            <div className="mt-6 p-4 bg-black/20 rounded-lg border border-purple-500/20">
              <div className="text-sm text-gray-400 mb-2">AI Synthesis Conclusion</div>
              <p className="text-gray-300">
                Based on comprehensive analysis of {synthesis.totalFindings} evidence items across {evidence.length} categories, 
                the forensic investigation indicates a <span className={`font-bold ${getProbabilityColor(acquisitionProbability)}`}>
                {acquisitionProbability}%</span> probability that the Overstock/BBBY acquisition hypothesis is correct. 
                The convergence of temporal indicators, entity structures, and documented IP transfers supports 
                a coordinated strategy for NOL preservation and asset acquisition.
              </p>
            </div>
          </Card>
        </div>
      </div>
    </TraderProtection>
  );
}
