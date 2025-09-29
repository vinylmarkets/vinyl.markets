import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { 
  Wand2, 
  RefreshCw, 
  Copy, 
  Download,
  Brain,
  FileText,
  TrendingUp,
  BarChart3
} from "lucide-react";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface MarketDataInput {
  date: string;
  topGainer: {
    symbol: string;
    percent: number;
    reason: string;
  };
  topLoser: {
    symbol: string;
    percent: number;
    reason: string;
  };
  sectorLeader: string;
  signalCounts: {
    buy: number;
    sell: number;
  };
  unusualEvents: string;
  marketRegime: string;
  volumeData: string;
}

interface AIWritingResult {
  narrative: string;
  keyThemes: string[];
  mentionedSymbols: string[];
  confidence: number;
}

export const AIWritingStudio: React.FC = () => {
  const [marketData, setMarketData] = useState<MarketDataInput>({
    date: new Date().toISOString().split('T')[0],
    topGainer: { symbol: 'NVDA', percent: 8.5, reason: 'AI chip demand surge' },
    topLoser: { symbol: 'META', percent: -3.2, reason: 'regulatory concerns' },
    sectorLeader: 'Technology',
    signalCounts: { buy: 23, sell: 8 },
    unusualEvents: 'High correlation break between tech stocks',
    marketRegime: 'risk-on',
    volumeData: 'Above average volume in semiconductor names'
  });
  
  const [customPrompt, setCustomPrompt] = useState('');
  const [aiResult, setAiResult] = useState<AIWritingResult | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const { toast } = useToast();

  const generateAIWriting = async (useCustomPrompt = false) => {
    setIsGenerating(true);
    
    try {
      let prompt;
      
      if (useCustomPrompt && customPrompt.trim()) {
        prompt = customPrompt;
      } else {
        prompt = `Market data for ${marketData.date}:
- Top gainer: ${marketData.topGainer.symbol} +${marketData.topGainer.percent}% (${marketData.topGainer.reason})
- Top loser: ${marketData.topLoser.symbol} ${marketData.topLoser.percent}% (${marketData.topLoser.reason})
- Sector leader: ${marketData.sectorLeader}
- Signal summary: ${marketData.signalCounts.buy} buys, ${marketData.signalCounts.sell} sells
- Market regime: ${marketData.marketRegime}
- Unusual activity: ${marketData.unusualEvents}
- Volume patterns: ${marketData.volumeData}

Write a professional market summary paragraph that explains WHY these moves happened, connecting them to broader themes. Include specific numbers but make it readable. Focus on the underlying drivers and market dynamics. Keep it under 200 words but make every word count.`;
      }

      const { data, error } = await supabase.functions.invoke('ai-knowledge-query', {
        body: { 
          query: prompt,
          analysisType: 'market_narrative',
          includeContext: true
        }
      });

      if (error) throw error;

      // Extract key information from the AI response
      const narrative = data.answer || 'Unable to generate narrative';
      const symbols = extractSymbols(narrative);
      const themes = extractThemes(narrative);
      
      setAiResult({
        narrative,
        keyThemes: themes,
        mentionedSymbols: symbols,
        confidence: 0.85 // Mock confidence score
      });

      toast({
        title: "AI Writing Generated",
        description: "Professional market narrative created successfully",
      });

    } catch (error) {
      console.error('Error generating AI writing:', error);
      toast({
        title: "Error",
        description: "Failed to generate AI writing. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const extractSymbols = (text: string): string[] => {
    const symbolRegex = /\b[A-Z]{2,5}\b/g;
    const matches = text.match(symbolRegex) || [];
    return [...new Set(matches)].filter(symbol => 
      ['NVDA', 'AMD', 'AAPL', 'MSFT', 'GOOGL', 'META', 'TSLA', 'SPY', 'QQQ'].includes(symbol)
    );
  };

  const extractThemes = (text: string): string[] => {
    const themes = [];
    if (text.toLowerCase().includes('ai') || text.toLowerCase().includes('artificial intelligence')) {
      themes.push('AI Revolution');
    }
    if (text.toLowerCase().includes('fed') || text.toLowerCase().includes('interest rate')) {
      themes.push('Fed Policy');
    }
    if (text.toLowerCase().includes('tech') || text.toLowerCase().includes('technology')) {
      themes.push('Tech Leadership');
    }
    if (text.toLowerCase().includes('earnings') || text.toLowerCase().includes('revenue')) {
      themes.push('Earnings Drive');
    }
    if (text.toLowerCase().includes('rotation') || text.toLowerCase().includes('sector')) {
      themes.push('Sector Rotation');
    }
    return themes.length > 0 ? themes : ['Market Dynamics'];
  };

  const copyToClipboard = async () => {
    if (!aiResult) return;
    
    try {
      await navigator.clipboard.writeText(aiResult.narrative);
      toast({
        title: "Copied",
        description: "Narrative copied to clipboard",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to copy to clipboard",
        variant: "destructive",
      });
    }
  };

  const exportAsMarkdown = () => {
    if (!aiResult) return;
    
    const markdown = `# Market Analysis - ${marketData.date}

## AI-Generated Narrative

${aiResult.narrative}

## Key Themes
${aiResult.keyThemes.map(theme => `- ${theme}`).join('\n')}

## Mentioned Symbols
${aiResult.mentionedSymbols.map(symbol => `- ${symbol}`).join('\n')}

## Market Data
- **Top Gainer**: ${marketData.topGainer.symbol} +${marketData.topGainer.percent}%
- **Top Loser**: ${marketData.topLoser.symbol} ${marketData.topLoser.percent}%
- **Sector Leader**: ${marketData.sectorLeader}
- **Signal Summary**: ${marketData.signalCounts.buy} buys, ${marketData.signalCounts.sell} sells
- **Market Regime**: ${marketData.marketRegime}
`;

    const blob = new Blob([markdown], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `market-analysis-${marketData.date}.md`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Brain className="h-6 w-6 text-purple-500" />
            AI Writing Studio
          </h2>
          <p className="text-muted-foreground">
            Generate contextual market narratives with AI-powered analysis
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Input Section */}
        <div className="space-y-6">
          {/* Market Data Input */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                Market Data Input
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="date">Date</Label>
                  <Input
                    id="date"
                    type="date"
                    value={marketData.date}
                    onChange={(e) => setMarketData(prev => ({
                      ...prev,
                      date: e.target.value
                    }))}
                  />
                </div>
                <div>
                  <Label htmlFor="regime">Market Regime</Label>
                  <Input
                    id="regime"
                    value={marketData.marketRegime}
                    onChange={(e) => setMarketData(prev => ({
                      ...prev,
                      marketRegime: e.target.value
                    }))}
                    placeholder="e.g., risk-on, bearish"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Top Gainer</Label>
                  <div className="grid grid-cols-2 gap-2">
                    <Input
                      value={marketData.topGainer.symbol}
                      onChange={(e) => setMarketData(prev => ({
                        ...prev,
                        topGainer: { ...prev.topGainer, symbol: e.target.value }
                      }))}
                      placeholder="Symbol"
                    />
                    <Input
                      type="number"
                      step="0.1"
                      value={marketData.topGainer.percent}
                      onChange={(e) => setMarketData(prev => ({
                        ...prev,
                        topGainer: { ...prev.topGainer, percent: parseFloat(e.target.value) }
                      }))}
                      placeholder="% Change"
                    />
                  </div>
                  <Input
                    value={marketData.topGainer.reason}
                    onChange={(e) => setMarketData(prev => ({
                      ...prev,
                      topGainer: { ...prev.topGainer, reason: e.target.value }
                    }))}
                    placeholder="Reason for move"
                  />
                </div>

                <div className="space-y-2">
                  <Label>Top Loser</Label>
                  <div className="grid grid-cols-2 gap-2">
                    <Input
                      value={marketData.topLoser.symbol}
                      onChange={(e) => setMarketData(prev => ({
                        ...prev,
                        topLoser: { ...prev.topLoser, symbol: e.target.value }
                      }))}
                      placeholder="Symbol"
                    />
                    <Input
                      type="number"
                      step="0.1"
                      value={marketData.topLoser.percent}
                      onChange={(e) => setMarketData(prev => ({
                        ...prev,
                        topLoser: { ...prev.topLoser, percent: parseFloat(e.target.value) }
                      }))}
                      placeholder="% Change"
                    />
                  </div>
                  <Input
                    value={marketData.topLoser.reason}
                    onChange={(e) => setMarketData(prev => ({
                      ...prev,
                      topLoser: { ...prev.topLoser, reason: e.target.value }
                    }))}
                    placeholder="Reason for move"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="sector">Sector Leader</Label>
                  <Input
                    id="sector"
                    value={marketData.sectorLeader}
                    onChange={(e) => setMarketData(prev => ({
                      ...prev,
                      sectorLeader: e.target.value
                    }))}
                    placeholder="Leading sector"
                  />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <Label>Buy Signals</Label>
                    <Input
                      type="number"
                      value={marketData.signalCounts.buy}
                      onChange={(e) => setMarketData(prev => ({
                        ...prev,
                        signalCounts: { ...prev.signalCounts, buy: parseInt(e.target.value) }
                      }))}
                    />
                  </div>
                  <div>
                    <Label>Sell Signals</Label>
                    <Input
                      type="number"
                      value={marketData.signalCounts.sell}
                      onChange={(e) => setMarketData(prev => ({
                        ...prev,
                        signalCounts: { ...prev.signalCounts, sell: parseInt(e.target.value) }
                      }))}
                    />
                  </div>
                </div>
              </div>

              <div>
                <Label htmlFor="unusual">Unusual Events</Label>
                <Input
                  id="unusual"
                  value={marketData.unusualEvents}
                  onChange={(e) => setMarketData(prev => ({
                    ...prev,
                    unusualEvents: e.target.value
                  }))}
                  placeholder="Any unusual market activity"
                />
              </div>

              <div>
                <Label htmlFor="volume">Volume Data</Label>
                <Input
                  id="volume"
                  value={marketData.volumeData}
                  onChange={(e) => setMarketData(prev => ({
                    ...prev,
                    volumeData: e.target.value
                  }))}
                  placeholder="Volume patterns observed"
                />
              </div>
            </CardContent>
          </Card>

          {/* Custom Prompt */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Custom Prompt (Optional)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Textarea
                value={customPrompt}
                onChange={(e) => setCustomPrompt(e.target.value)}
                placeholder="Enter a custom prompt for AI analysis, or leave blank to use the default market data prompt..."
                rows={4}
              />
            </CardContent>
          </Card>

          {/* Generate Buttons */}
          <div className="flex gap-3">
            <Button
              onClick={() => generateAIWriting(false)}
              disabled={isGenerating}
              className="flex-1"
            >
              {isGenerating ? (
                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Wand2 className="h-4 w-4 mr-2" />
              )}
              Generate from Data
            </Button>
            <Button
              onClick={() => generateAIWriting(true)}
              disabled={isGenerating || !customPrompt.trim()}
              variant="outline"
              className="flex-1"
            >
              <Brain className="h-4 w-4 mr-2" />
              Use Custom Prompt
            </Button>
          </div>
        </div>

        {/* Output Section */}
        <div className="space-y-6">
          {/* AI Generated Narrative */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  AI-Generated Narrative
                </div>
                {aiResult && (
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={copyToClipboard}>
                      <Copy className="h-4 w-4" />
                    </Button>
                    <Button variant="outline" size="sm" onClick={exportAsMarkdown}>
                      <Download className="h-4 w-4" />
                    </Button>
                  </div>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {!aiResult ? (
                <div className="text-center py-12 text-muted-foreground">
                  <Brain className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>Generate AI writing to see the results here</p>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="p-4 bg-muted/50 rounded-lg">
                    <p className="text-sm leading-relaxed">
                      {aiResult.narrative}
                    </p>
                  </div>
                  
                  <div className="flex items-center justify-between text-sm text-muted-foreground">
                    <span>Confidence: {(aiResult.confidence * 100).toFixed(0)}%</span>
                    <span>{aiResult.narrative.split(' ').length} words</span>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Analysis Results */}
          {aiResult && (
            <>
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Key Themes Identified</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {aiResult.keyThemes.map((theme, index) => (
                      <Badge key={index} variant="secondary">
                        {theme}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Mentioned Symbols</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {aiResult.mentionedSymbols.map((symbol, index) => (
                      <Badge key={index} variant="outline">
                        {symbol}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </>
          )}
        </div>
      </div>
    </div>
  );
};