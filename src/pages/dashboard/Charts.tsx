import { useState, useEffect } from "react";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { ProbabilityChart, StockTrendChart, PerformanceDashboard } from "@/components/charts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PredictionAPI } from "@/lib/prediction-api";
import { RefreshCw, TrendingUp } from "lucide-react";
import { toast } from "sonner";

export default function Charts() {
  const [predictionData, setPredictionData] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  // Sample historical data for demonstration
  const sampleHistoricalData = [
    { date: '2024-01-01', price: 180.50, volume: 2500000 },
    { date: '2024-01-02', price: 182.30, volume: 2300000 },
    { date: '2024-01-03', price: 178.90, volume: 2800000 },
    { date: '2024-01-04', price: 185.20, volume: 3100000 },
    { date: '2024-01-05', price: 188.75, volume: 2700000 },
    { date: '2024-01-08', price: 191.40, volume: 2900000 },
    { date: '2024-01-09', price: 186.60, volume: 2600000 },
    { date: '2024-01-10', price: 189.30, volume: 2800000 },
  ];

  const performanceMetrics = {
    accuracy: 0.847,
    totalSignals: 1247,
    winRate: 0.732,
    avgReturn: 0.156,
    sharpeRatio: 1.34,
  };

  const historicalPerformance = [
    { date: '2024-01-01', accuracy: 0.82, signals: 45 },
    { date: '2024-01-02', accuracy: 0.85, signals: 52 },
    { date: '2024-01-03', accuracy: 0.78, signals: 38 },
    { date: '2024-01-04', accuracy: 0.91, signals: 61 },
    { date: '2024-01-05', accuracy: 0.87, signals: 49 },
  ];

  const loadSamplePredictions = async () => {
    setLoading(true);
    try {
      // Get predictions for multiple symbols
      const symbols = ['AAPL', 'GOOGL', 'MSFT', 'TSLA', 'AMZN'];
      const predictions = await Promise.allSettled(
        symbols.map(symbol => PredictionAPI.getPrediction(symbol))
      );
      
      const validPredictions = predictions
        .filter((result): result is PromiseFulfilledResult<any> => result.status === 'fulfilled')
        .map(result => result.value);

      // If API fails, use sample data
      if (validPredictions.length === 0) {
        setPredictionData([
          { symbol: 'AAPL', probability: 0.67, confidence: 0.85, current_price: 185.43 },
          { symbol: 'GOOGL', probability: 0.72, confidence: 0.78, current_price: 138.21 },
          { symbol: 'MSFT', probability: 0.58, confidence: 0.82, current_price: 367.12 },
          { symbol: 'TSLA', probability: 0.45, confidence: 0.71, current_price: 248.91 },
          { symbol: 'AMZN', probability: 0.63, confidence: 0.76, current_price: 142.38 },
        ]);
        toast("Using sample data - API not available");
      } else {
        setPredictionData(validPredictions);
        toast("Loaded live prediction data!");
      }
    } catch (error) {
      console.error('Error loading predictions:', error);
      // Fallback to sample data
      setPredictionData([
        { symbol: 'AAPL', probability: 0.67, confidence: 0.85, current_price: 185.43 },
        { symbol: 'GOOGL', probability: 0.72, confidence: 0.78, current_price: 138.21 },
        { symbol: 'MSFT', probability: 0.58, confidence: 0.82, current_price: 367.12 },
        { symbol: 'TSLA', probability: 0.45, confidence: 0.71, current_price: 248.91 },
        { symbol: 'AMZN', probability: 0.63, confidence: 0.76, current_price: 142.38 },
      ]);
      toast("Using sample data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSamplePredictions();
  }, []);

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold text-foreground flex items-center gap-2">
              <TrendingUp className="h-8 w-8" />
              Data Visualizations
            </h1>
            <p className="text-muted-foreground">Interactive charts powered by Plotly.js</p>
          </div>
          <Button onClick={loadSamplePredictions} disabled={loading}>
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh Data
          </Button>
        </div>

        {/* Charts Overview Card */}
        <Card>
          <CardHeader>
            <CardTitle>Available Chart Types</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-blue-500 rounded"></div>
                <span>Probability Charts - Stock prediction confidence</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-green-500 rounded"></div>
                <span>Trend Charts - Historical price movements</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-purple-500 rounded"></div>
                <span>Performance Dashboard - Key metrics</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Stock Predictions Chart */}
        {predictionData.length > 0 && (
          <ProbabilityChart 
            data={predictionData}
            title="Current Stock Predictions"
          />
        )}

        {/* Sample Stock Trend Chart */}
        <StockTrendChart
          symbol="AAPL"
          data={sampleHistoricalData}
          showVolume={true}
        />

        {/* Performance Dashboard */}
        <PerformanceDashboard
          metrics={performanceMetrics}
          historicalData={historicalPerformance}
        />

        {/* Integration Guide */}
        <Card>
          <CardHeader>
            <CardTitle>How to Use Plotly Charts</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="prose prose-sm max-w-none">
              <h4>1. Import the chart components:</h4>
              <pre className="bg-muted p-3 rounded text-xs overflow-x-auto">
{`import { ProbabilityChart, StockTrendChart, PerformanceDashboard } from '@/components/charts';`}
              </pre>
              
              <h4>2. Use with your data:</h4>
              <pre className="bg-muted p-3 rounded text-xs overflow-x-auto">
{`<ProbabilityChart 
  data={predictionData}
  title="Stock Predictions"
/>

<StockTrendChart
  symbol="AAPL"
  data={historicalData}
  showVolume={true}
/>

<PerformanceDashboard
  metrics={performanceMetrics}
  historicalData={historicalPerformance}
/>`}
              </pre>

              <h4>3. Features:</h4>
              <ul>
                <li>Interactive tooltips and zoom</li>
                <li>Responsive design</li>
                <li>Customizable colors and themes</li>
                <li>Export capabilities (PNG, SVG, PDF)</li>
                <li>Real-time data updates</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}