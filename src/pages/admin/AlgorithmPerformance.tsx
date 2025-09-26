import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { 
  TrendingUp, 
  TrendingDown, 
  Target, 
  Clock, 
  Brain, 
  AlertCircle, 
  CheckCircle, 
  BarChart3,
  RefreshCcw,
  Lightbulb,
  ArrowRight,
  Activity,
  Calendar as CalendarIcon,
  Archive,
  Eye,
  ArrowLeft,
  Play
} from "lucide-react";

interface AlgorithmMetrics {
  directional_accuracy: number;
  confidence_accuracy_correlation: number;
  average_confidence: number;
  high_accuracy_avg: number;
  low_accuracy_avg: number;
  close_accuracy_avg: number;
  best_performing_signal: string;
  worst_performing_signal: string;
  trending_market_accuracy: number;
  choppy_market_accuracy: number;
  total_predictions: number;
  date: string;
  confidence_calibration: number;
  high_within_half_percent: number;
  low_within_half_percent: number;
  close_within_half_percent: number;
}

interface PerformanceTrend {
  date: string;
  accuracy: number;
  confidence: number;
  predictions_count: number;
}

interface RecommendationItem {
  type: 'improvement' | 'warning' | 'success';
  title: string;
  description: string;
  priority: 'high' | 'medium' | 'low';
  metric?: string;
  value?: number;
}

interface PredictionResult {
  id: string;
  rank: number;
  symbol: string;
  company_name: string;
  predicted_high: number;
  predicted_low: number;
  predicted_close: number;
  actual_high?: number;
  actual_low?: number;
  actual_close?: number;
  direction_correct?: boolean;
  expected_gain_percentage: number;
  actual_gain_percentage?: number;
}

export default function AlgorithmPerformance() {
  const [metrics, setMetrics] = useState<AlgorithmMetrics | null>(null);
  const [trends, setTrends] = useState<PerformanceTrend[]>([]);
  const [recommendations, setRecommendations] = useState<RecommendationItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [dateRange, setDateRange] = useState(30);
  const [archiveDate, setArchiveDate] = useState<Date | undefined>(new Date());
  const [archiveResults, setArchiveResults] = useState<PredictionResult[]>([]);
  const [archiveLoading, setArchiveLoading] = useState(false);

  useEffect(() => {
    fetchPerformanceData();
  }, []);

  const fetchPerformanceData = async () => {
    setLoading(true);
    try {
      // Get latest algorithm performance metrics
      const { data: latestMetrics } = await supabase
        .from('algorithm_performance')
        .select('*')
        .order('date', { ascending: false })
        .limit(1)
        .maybeSingle();

      // Get performance trends for selected date range
      const { data: trendData } = await supabase
        .from('algorithm_performance')
        .select('date, directional_accuracy, average_confidence, total_predictions')
        .order('date', { ascending: false })
        .limit(dateRange);

      if (latestMetrics) {
        setMetrics(latestMetrics);
      }

      if (trendData) {
        setTrends(trendData.map(item => ({
          date: item.date,
          accuracy: item.directional_accuracy || 0,
          confidence: item.average_confidence || 0,
          predictions_count: item.total_predictions || 0
        })));
      }

      // Generate recommendations based on metrics
      if (latestMetrics) {
        generateRecommendations(latestMetrics);
      }
    } catch (error) {
      console.error('Error fetching algorithm performance:', error);
    } finally {
      setLoading(false);
    }
  };

  const refreshData = async () => {
    setRefreshing(true);
    await fetchPerformanceData();
    setRefreshing(false);
  };

  const fetchArchiveData = async (date: Date) => {
    setArchiveLoading(true);
    try {
      const dateStr = format(date, 'yyyy-MM-dd');
      
      // Get predictions first
      const { data: predictions, error: predError } = await supabase
        .from('enhanced_daily_predictions')
        .select('*')
        .eq('prediction_date', dateStr)
        .order('rank')
        .limit(20);
      
      if (predError) {
        console.error('Error fetching predictions:', predError);
        toast.error('Error fetching archive data');
        return;
      }
      
      if (!predictions || predictions.length === 0) {
        setArchiveResults([]);
        toast.info(`No predictions found for ${dateStr}`);
        return;
      }
      
      // Get the prediction IDs
      const predictionIds = predictions.map(p => p.id);
      
      // Get results for these predictions
      const { data: results, error: resultError } = await supabase
        .from('prediction_results')
        .select('*')
        .in('prediction_id', predictionIds);
      
      if (resultError) {
        console.error('Error fetching results:', resultError);
      }
      
      // Create a map of prediction_id to results
      const resultsMap = new Map();
      if (results) {
        results.forEach(result => {
          resultsMap.set(result.prediction_id, result);
        });
      }
      
      // Convert to display format
      const displayResults: PredictionResult[] = predictions.map((pred) => {
        const result = resultsMap.get(pred.id);
        const actualGain = result?.actual_close && pred.previous_close 
          ? ((result.actual_close - pred.previous_close) / pred.previous_close) * 100
          : undefined;
        
        return {
          id: pred.id,
          rank: pred.rank,
          symbol: pred.symbol,
          company_name: pred.company_name || pred.symbol,
          predicted_high: pred.predicted_high,
          predicted_low: pred.predicted_low,
          predicted_close: pred.predicted_close,
          expected_gain_percentage: pred.expected_gain_percentage || 0,
          actual_high: result?.actual_high,
          actual_low: result?.actual_low,
          actual_close: result?.actual_close,
          direction_correct: result?.direction_correct,
          actual_gain_percentage: actualGain
        };
      });
      
      setArchiveResults(displayResults);
      const resultsCount = results ? results.length : 0;
      toast.success(`Loaded ${predictions.length} predictions (${resultsCount} with results) for ${dateStr}`);
      
    } catch (error) {
      console.error('Error fetching archive data:', error);
      toast.error('Error fetching archive data');
    } finally {
      setArchiveLoading(false);
    }
  };

  useEffect(() => {
    fetchPerformanceData();
  }, []);

  useEffect(() => {
    if (dateRange !== 30) {
      fetchPerformanceData();
    }
  }, [dateRange]);

  const generateRecommendations = (metrics: AlgorithmMetrics) => {
    const recs: RecommendationItem[] = [];

    // Accuracy recommendations
    if (metrics.directional_accuracy < 0.6) {
      recs.push({
        type: 'warning',
        title: 'Low Directional Accuracy',
        description: `Current accuracy at ${(metrics.directional_accuracy * 100).toFixed(1)}%. Consider reviewing signal weighting and market condition detection.`,
        priority: 'high',
        metric: 'directional_accuracy',
        value: metrics.directional_accuracy
      });
    } else if (metrics.directional_accuracy > 0.75) {
      recs.push({
        type: 'success',
        title: 'Excellent Directional Accuracy',
        description: `Strong performance at ${(metrics.directional_accuracy * 100).toFixed(1)}%. Current model configuration is working well.`,
        priority: 'low',
        metric: 'directional_accuracy',
        value: metrics.directional_accuracy
      });
    }

    // Confidence calibration
    if (metrics.confidence_accuracy_correlation < 0.3) {
      recs.push({
        type: 'improvement',
        title: 'Poor Confidence Calibration',
        description: 'Low correlation between confidence and accuracy suggests the model is overconfident. Consider recalibrating confidence scoring.',
        priority: 'high',
        metric: 'confidence_accuracy_correlation',
        value: metrics.confidence_accuracy_correlation
      });
    }

    // Signal performance
    if (metrics.worst_performing_signal) {
      recs.push({
        type: 'improvement',
        title: 'Underperforming Signal Detected',
        description: `${metrics.worst_performing_signal} signal shows poor performance. Consider reducing its weight or investigating data quality.`,
        priority: 'medium',
        metric: 'worst_performing_signal'
      });
    }

    // Market condition specific recommendations
    if (metrics.choppy_market_accuracy < metrics.trending_market_accuracy - 0.2) {
      recs.push({
        type: 'improvement',
        title: 'Choppy Market Performance Gap',
        description: 'Algorithm performs significantly worse in choppy markets. Consider adding volatility-adjusted parameters.',
        priority: 'medium',
        metric: 'choppy_market_accuracy',
        value: metrics.choppy_market_accuracy
      });
    }

    // Price target accuracy
    const avgPriceAccuracy = (metrics.high_accuracy_avg + metrics.low_accuracy_avg + metrics.close_accuracy_avg) / 3;
    if (avgPriceAccuracy < 0.5) {
      recs.push({
        type: 'warning',
        title: 'Poor Price Target Accuracy',
        description: 'Price predictions are consistently off. Consider reviewing technical analysis components and volatility models.',
        priority: 'high',
        metric: 'price_accuracy',
        value: avgPriceAccuracy
      });
    }

    setRecommendations(recs);
  };

  const getStatusColor = (value: number, type: 'accuracy' | 'confidence' = 'accuracy') => {
    if (type === 'accuracy') {
      if (value >= 0.7) return 'text-green-600';
      if (value >= 0.6) return 'text-yellow-600';
      return 'text-red-600';
    } else {
      if (value >= 0.8) return 'text-green-600';
      if (value >= 0.6) return 'text-yellow-600';
      return 'text-red-600';
    }
  };

  const getStatusBadge = (value: number, type: 'accuracy' | 'confidence' = 'accuracy') => {
    if (type === 'accuracy') {
      if (value >= 0.7) return <Badge className="bg-green-600">Excellent</Badge>;
      if (value >= 0.6) return <Badge className="bg-yellow-600">Good</Badge>;
      return <Badge className="bg-red-600">Needs Improvement</Badge>;
    } else {
      if (value >= 0.8) return <Badge className="bg-green-600">Well Calibrated</Badge>;
      if (value >= 0.6) return <Badge className="bg-yellow-600">Moderate</Badge>;
      return <Badge className="bg-red-600">Poor Calibration</Badge>;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-muted/30 flex items-center justify-center">
        <div className="text-center">
          <Activity className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p>Loading algorithm performance data...</p>
        </div>
      </div>
    );
  }

  if (!metrics) {
    return (
      <div className="min-h-screen bg-muted/30 flex items-center justify-center">
        <Card className="w-[400px]">
          <CardHeader>
            <CardTitle className="flex items-center">
              <AlertCircle className="h-5 w-5 mr-2 text-yellow-600" />
              No Performance Data
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-4">
              No algorithm performance data available. This could mean:
            </p>
            <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground mb-4">
              <li>The algorithm hasn't run yet today</li>
              <li>Data collection is not configured</li>
              <li>There's an issue with the performance tracking system</li>
            </ul>
            <Button onClick={refreshData} className="w-full" disabled={refreshing}>
              <RefreshCcw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
              Refresh Data
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-muted/30">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 flex items-center">
                <Brain className="h-8 w-8 mr-3 text-primary" />
                Algorithm Performance
              </h1>
              <p className="text-muted-foreground mt-2">
                Comprehensive analysis and optimization recommendations for prediction algorithms
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <Badge variant="outline">
                Last Analysis: {new Date(metrics.date).toLocaleDateString()}
              </Badge>
              <Button onClick={refreshData} variant="outline" disabled={refreshing}>
                <RefreshCcw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
              <Button variant="outline" asChild>
                <Link to="/admin">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Admin Dashboard
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="accuracy">Accuracy Metrics</TabsTrigger>
            <TabsTrigger value="signals">Signal Analysis</TabsTrigger>
            <TabsTrigger value="archive">Archive</TabsTrigger>
            <TabsTrigger value="recommendations">Recommendations</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            {/* Key Metrics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium flex items-center">
                    <Target className="h-4 w-4 mr-2" />
                    Directional Accuracy
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <div className={`text-2xl font-bold ${getStatusColor(metrics.directional_accuracy)}`}>
                      {(metrics.directional_accuracy * 100).toFixed(1)}%
                    </div>
                    {getStatusBadge(metrics.directional_accuracy)}
                  </div>
                  <Progress value={metrics.directional_accuracy * 100} className="mt-2" />
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium flex items-center">
                    <Brain className="h-4 w-4 mr-2" />
                    Confidence Calibration
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <div className={`text-2xl font-bold ${getStatusColor(metrics.confidence_accuracy_correlation, 'confidence')}`}>
                      {(metrics.confidence_accuracy_correlation * 100).toFixed(1)}%
                    </div>
                    {getStatusBadge(metrics.confidence_accuracy_correlation, 'confidence')}
                  </div>
                  <Progress value={metrics.confidence_accuracy_correlation * 100} className="mt-2" />
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium flex items-center">
                    <BarChart3 className="h-4 w-4 mr-2" />
                    Avg Confidence
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{(metrics.average_confidence * 100).toFixed(1)}%</div>
                  <div className="text-sm text-muted-foreground mt-1">
                    Across {metrics.total_predictions} predictions
                  </div>
                  <Progress value={metrics.average_confidence * 100} className="mt-2" />
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium flex items-center">
                    <Clock className="h-4 w-4 mr-2" />
                    Market Adaptation
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Trending Markets</span>
                      <span className="font-medium">{(metrics.trending_market_accuracy * 100).toFixed(1)}%</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Choppy Markets</span>
                      <span className="font-medium">{(metrics.choppy_market_accuracy * 100).toFixed(1)}%</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Performance Trend Chart */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Performance Trend</CardTitle>
                    <CardDescription>
                      Accuracy and confidence trends over the selected period
                    </CardDescription>
                  </div>
                  <Select value={dateRange.toString()} onValueChange={(value) => setDateRange(parseInt(value))}>
                    <SelectTrigger className="w-32">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="7">7 Days</SelectItem>
                      <SelectItem value="14">14 Days</SelectItem>
                      <SelectItem value="30">30 Days</SelectItem>
                      <SelectItem value="60">60 Days</SelectItem>
                      <SelectItem value="90">90 Days</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardHeader>
              <CardContent>
                <div className="h-64 bg-muted/50 rounded-lg flex items-center justify-center">
                  <div className="text-center">
                    <BarChart3 className="h-12 w-12 text-muted-foreground mx-auto mb-2" />
                    <p className="text-muted-foreground">Performance trend chart would be rendered here</p>
                    <p className="text-sm text-muted-foreground">
                      Showing {trends.length} data points over {dateRange} days
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="accuracy" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <TrendingUp className="h-5 w-5 mr-2" />
                    High Price Accuracy
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className={`text-3xl font-bold ${getStatusColor(metrics.high_accuracy_avg)}`}>
                    {(metrics.high_accuracy_avg * 100).toFixed(1)}%
                  </div>
                  <Progress value={metrics.high_accuracy_avg * 100} className="mt-4" />
                  <p className="text-sm text-muted-foreground mt-2">
                    Accuracy in predicting daily high prices
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <TrendingDown className="h-5 w-5 mr-2" />
                    Low Price Accuracy
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className={`text-3xl font-bold ${getStatusColor(metrics.low_accuracy_avg)}`}>
                    {(metrics.low_accuracy_avg * 100).toFixed(1)}%
                  </div>
                  <Progress value={metrics.low_accuracy_avg * 100} className="mt-4" />
                  <p className="text-sm text-muted-foreground mt-2">
                    Accuracy in predicting daily low prices
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Target className="h-5 w-5 mr-2" />
                    Close Price Accuracy
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className={`text-3xl font-bold ${getStatusColor(metrics.close_accuracy_avg)}`}>
                    {(metrics.close_accuracy_avg * 100).toFixed(1)}%
                  </div>
                  <Progress value={metrics.close_accuracy_avg * 100} className="mt-4" />
                  <p className="text-sm text-muted-foreground mt-2">
                    Accuracy in predicting closing prices
                  </p>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="archive" className="space-y-6">
            {/* Archive Date Selector */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Archive className="h-5 w-5 mr-2" />
                  Prediction Archive
                </CardTitle>
                <CardDescription>
                  Select a date to view predictions vs actual results for that day
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center space-x-4">
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-64 justify-start text-left font-normal",
                          !archiveDate && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {archiveDate ? format(archiveDate, "PPP") : <span>Pick a date</span>}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={archiveDate}
                        onSelect={setArchiveDate}
                        initialFocus
                        className="p-3 pointer-events-auto"
                      />
                    </PopoverContent>
                  </Popover>
                  <Button 
                    onClick={() => archiveDate && fetchArchiveData(archiveDate)}
                    disabled={!archiveDate || archiveLoading}
                  >
                    <Eye className="h-4 w-4 mr-2" />
                    {archiveLoading ? 'Loading...' : 'View Results'}
                  </Button>
                  <Button 
                    onClick={async () => {
                      if (!archiveDate) return;
                      try {
                        const dateStr = format(archiveDate, 'yyyy-MM-dd');
                        toast.info('Running post-market analysis...');
                        const { data, error } = await supabase.functions.invoke('post-market-analysis', {
                          body: { date: dateStr }
                        });
                        if (error) throw error;
                        toast.success('Post-market analysis completed successfully');
                        // Refresh the data
                        fetchArchiveData(archiveDate);
                      } catch (error) {
                        console.error('Error running post-market analysis:', error);
                        toast.error('Error running post-market analysis');
                      }
                    }}
                    variant="outline"
                    disabled={!archiveDate}
                  >
                    <Play className="h-4 w-4 mr-2" />
                    Run Analysis
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Archive Results */}
            {archiveResults.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>
                    Predictions vs Results - {archiveDate && format(archiveDate, "PPP")}
                  </CardTitle>
                  <CardDescription>
                    TOP 20 predictions and their actual performance
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 max-h-96 overflow-y-auto">
                    {archiveResults.map((result) => (
                      <div key={result.id} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                        <div className="flex items-center space-x-4">
                          <Badge variant="outline">#{result.rank}</Badge>
                          <div>
                            <p className="font-medium">{result.symbol}</p>
                            <p className="text-sm text-muted-foreground">{result.company_name}</p>
                          </div>
                        </div>
                        <div className="grid grid-cols-3 gap-4 text-sm">
                          <div>
                            <p className="text-muted-foreground">Expected</p>
                            <p className="font-medium">{result.expected_gain_percentage.toFixed(2)}%</p>
                          </div>
                          <div>
                            <p className="text-muted-foreground">Actual</p>
                            <p className={`font-medium ${result.actual_gain_percentage !== undefined 
                              ? result.actual_gain_percentage > 0 ? 'text-green-600' : 'text-red-600'
                              : ''}`}>
                              {result.actual_gain_percentage !== undefined 
                                ? `${result.actual_gain_percentage.toFixed(2)}%` 
                                : 'N/A'}
                            </p>
                          </div>
                          <div>
                            <p className="text-muted-foreground">Direction</p>
                            <div className="flex items-center">
                              {result.direction_correct === true && <CheckCircle className="h-4 w-4 text-green-600" />}
                              {result.direction_correct === false && <AlertCircle className="h-4 w-4 text-red-600" />}
                              {result.direction_correct === undefined && <span className="text-muted-foreground">N/A</span>}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="signals" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center text-green-600">
                    <CheckCircle className="h-5 w-5 mr-2" />
                    Best Performing Signal
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold mb-2">{metrics.best_performing_signal}</div>
                  <p className="text-muted-foreground">
                    This signal is contributing positively to prediction accuracy and should be maintained or emphasized.
                  </p>
                  <Badge className="bg-green-600 mt-3">Performing Well</Badge>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center text-red-600">
                    <AlertCircle className="h-5 w-5 mr-2" />
                    Worst Performing Signal
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold mb-2">{metrics.worst_performing_signal}</div>
                  <p className="text-muted-foreground">
                    This signal may be contributing to prediction errors and requires investigation or adjustment.
                  </p>
                  <Badge variant="destructive" className="mt-3">Needs Attention</Badge>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="recommendations" className="space-y-6">
            <div className="space-y-4">
              {recommendations.map((rec, index) => (
                <Card key={index} className={`border-l-4 ${
                  rec.type === 'warning' ? 'border-l-red-500' : 
                  rec.type === 'success' ? 'border-l-green-500' : 'border-l-blue-500'
                }`}>
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <CardTitle className="flex items-center text-lg">
                        {rec.type === 'warning' && <AlertCircle className="h-5 w-5 mr-2 text-red-500" />}
                        {rec.type === 'success' && <CheckCircle className="h-5 w-5 mr-2 text-green-500" />}
                        {rec.type === 'improvement' && <Lightbulb className="h-5 w-5 mr-2 text-purple-500" />}
                        {rec.title}
                      </CardTitle>
                      <Badge variant={rec.priority === 'high' ? 'destructive' : rec.priority === 'medium' ? 'secondary' : 'outline'}>
                        {rec.priority.toUpperCase()} PRIORITY
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground mb-4">{rec.description}</p>
                    {rec.metric && rec.value !== undefined && (
                      <div className="bg-muted/50 p-3 rounded-lg">
                        <div className="text-sm font-medium">Current Value</div>
                        <div className="text-lg font-bold">
                          {rec.metric.includes('accuracy') ? `${(rec.value * 100).toFixed(1)}%` : rec.value}
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}

              {recommendations.length === 0 && (
                <Card>
                  <CardContent className="text-center py-12">
                    <CheckCircle className="h-12 w-12 text-green-600 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold mb-2">All Systems Performing Well</h3>
                    <p className="text-muted-foreground">
                      No critical issues detected. The algorithm is performing within expected parameters.
                    </p>
                  </CardContent>
                </Card>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}