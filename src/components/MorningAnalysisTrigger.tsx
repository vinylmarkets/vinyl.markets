import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, TrendingUp, Volume2, Target, Calendar } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface AnalysisResult {
  analysis_results: number;
  briefings_generated: number;
  date: string;
  briefings: any[];
}

interface MarketAnalysisData {
  symbol: string;
  analysis_type: string;
  metric_value: number;
  metric_name: string;
  current_price: number;
  price_change_pct: number;
  significance_score: number;
  analysis_data: any;
}

export const MorningAnalysisTrigger = () => {
  const [isRunning, setIsRunning] = useState(false);
  const [results, setResults] = useState<AnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [recentAnalysis, setRecentAnalysis] = useState<MarketAnalysisData[]>([]);

  const runMorningAnalysis = async () => {
    setIsRunning(true);
    setError(null);
    
    try {
      console.log('Triggering morning market analysis...');
      
      const { data, error: functionError } = await supabase.functions.invoke('morning-market-analysis', {
        body: { manual_trigger: true }
      });

      if (functionError) {
        throw new Error(functionError.message);
      }

      setResults(data);
      toast.success(`Analysis complete! Generated ${data.briefings_generated} briefings from ${data.analysis_results} market signals`);
      
      // Reload recent analysis data
      await loadRecentAnalysis();
      
    } catch (error: any) {
      console.error('Morning analysis error:', error);
      setError(error.message);
      toast.error(`Analysis failed: ${error.message}`);
    } finally {
      setIsRunning(false);
    }
  };

  const loadRecentAnalysis = async () => {
    try {
      const today = new Date().toISOString().split('T')[0];
      
      const { data, error } = await supabase
        .from('daily_market_analysis')
        .select('*')
        .eq('analysis_date', today)
        .order('significance_score', { ascending: false })
        .limit(10);

      if (error) {
        console.error('Error loading recent analysis:', error);
        return;
      }

      setRecentAnalysis(data || []);
    } catch (error) {
      console.error('Error loading recent analysis:', error);
    }
  };

  React.useEffect(() => {
    loadRecentAnalysis();
  }, []);

  const getAnalysisIcon = (type: string) => {
    switch (type) {
      case 'volume_spike':
        return <Volume2 className="h-4 w-4" />;
      case 'price_movement':
        return <TrendingUp className="h-4 w-4" />;
      case 'short_interest':
        return <Target className="h-4 w-4" />;
      default:
        return <Calendar className="h-4 w-4" />;
    }
  };

  const getAnalysisLabel = (type: string) => {
    const labels = {
      'volume_spike': 'Volume Surge',
      'price_movement': 'Price Movement',
      'short_interest': 'Short Interest'
    };
    return labels[type as keyof typeof labels] || type;
  };

  const formatMetricValue = (value: number, metricName: string) => {
    if (metricName.includes('pct') || metricName.includes('change')) {
      return `${value.toFixed(1)}%`;
    }
    if (metricName.includes('ratio')) {
      return value.toFixed(2);
    }
    return value.toLocaleString();
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Morning Market Analysis
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Scan the market for noteworthy indicators and generate intelligent briefings based on real market data.
          </p>
          
          <Button 
            onClick={runMorningAnalysis}
            disabled={isRunning}
            className="w-full"
            size="lg"
          >
            {isRunning ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Running Market Analysis...
              </>
            ) : (
              <>
                <TrendingUp className="mr-2 h-4 w-4" />
                Run Morning Analysis
              </>
            )}
          </Button>

          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {results && (
            <Alert>
              <TrendingUp className="h-4 w-4" />
              <AlertDescription>
                Analysis complete! Found {results.analysis_results} market signals and generated {results.briefings_generated} briefings for {results.date}.
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {recentAnalysis.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Today's Market Signals</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {recentAnalysis.map((analysis, index) => (
                <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2">
                      {getAnalysisIcon(analysis.analysis_type)}
                      <Badge variant="outline">
                        {getAnalysisLabel(analysis.analysis_type)}
                      </Badge>
                    </div>
                    <div>
                      <span className="font-semibold">{analysis.symbol}</span>
                      <span className="text-sm text-muted-foreground ml-2">
                        ${analysis.current_price?.toFixed(2)}
                      </span>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-medium">
                      {formatMetricValue(analysis.metric_value, analysis.metric_name)}
                    </div>
                    <div className={`text-xs ${analysis.price_change_pct >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {analysis.price_change_pct >= 0 ? '+' : ''}{analysis.price_change_pct?.toFixed(2)}%
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};