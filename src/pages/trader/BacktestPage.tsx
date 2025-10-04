import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { BacktestEngine, BacktestResult } from '@/lib/backtestEngine';
import { PerformanceCalculator } from '@/lib/performanceMetrics';
import { BacktestResults } from '@/components/BacktestResults';
import { DEFAULT_RISK_LIMITS } from '@/lib/riskManagement';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';

export default function BacktestPage() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<BacktestResult | null>(null);
  const [enhancedMetrics, setEnhancedMetrics] = useState<any>(null);

  const runBacktest = async () => {
    setLoading(true);
    try {
      const config = {
        strategyId: 'tubeamp-multi-strategy',
        strategyName: 'TubeAmp Multi-Strategy',
        startDate: new Date('2020-01-01'),
        endDate: new Date('2024-12-31'),
        initialCapital: 100000,
        symbols: ['AAPL', 'MSFT', 'GOOGL', 'NVDA', 'TSLA'],
        commission: 1.0,
        slippage: 0.001,
        riskLimits: DEFAULT_RISK_LIMITS
      };

      const engine = new BacktestEngine(config);

      // Run backtest with a simple buy-and-hold strategy for demo
      const backtestResult = await engine.run(async (date, marketData) => {
        // Simple strategy: generate no signals (buy-and-hold simulation)
        return [];
      });

      const metrics = PerformanceCalculator.calculateEnhancedMetrics(backtestResult);

      setResult(backtestResult);
      setEnhancedMetrics(metrics);

      toast.success('Backtest completed successfully!');
    } catch (error) {
      console.error('Backtest error:', error);
      toast.error('Failed to run backtest: ' + (error as Error).message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="space-y-2">
        <h1 className="text-4xl font-bold">Backtest TubeAmp</h1>
        <p className="text-muted-foreground">
          Test the strategy on historical data to evaluate performance
        </p>
      </div>

      {!result ? (
        <Card>
          <CardHeader>
            <CardTitle>Run Historical Backtest</CardTitle>
            <CardDescription>
              Simulate the TubeAmp Multi-Strategy algorithm on historical data from 2020-2024
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <div className="text-muted-foreground">Period</div>
                  <div className="font-medium">2020-01-01 to 2024-12-31</div>
                </div>
                <div>
                  <div className="text-muted-foreground">Initial Capital</div>
                  <div className="font-medium">$100,000</div>
                </div>
                <div>
                  <div className="text-muted-foreground">Symbols</div>
                  <div className="font-medium">AAPL, MSFT, GOOGL, NVDA, TSLA</div>
                </div>
                <div>
                  <div className="text-muted-foreground">Commission</div>
                  <div className="font-medium">$1.00 per trade</div>
                </div>
              </div>

              <Button 
                onClick={runBacktest} 
                disabled={loading}
                className="w-full"
                size="lg"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Running Backtest...
                  </>
                ) : (
                  'Run Backtest (2020-2024)'
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <BacktestResults result={result} enhancedMetrics={enhancedMetrics} />
      )}
    </div>
  );
}
