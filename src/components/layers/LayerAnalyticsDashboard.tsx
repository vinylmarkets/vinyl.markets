import { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import {
  LineChart, Line, BarChart, Bar, RadarChart, PolarGrid, PolarAngleAxis,
  PolarRadiusAxis, Radar, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  ResponsiveContainer
} from 'recharts';
import {
  ArrowLeft, TrendingUp, AlertTriangle, Target, Zap, Shield,
  Activity, CheckCircle
} from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import { Skeleton } from '@/components/ui/skeleton';
import { LayerConfigService } from '@/lib/ampLayering/layerConfigService';
import { LayerMetricsEngine } from '@/lib/analytics/layerMetricsEngine';
import { AttributionAnalyzer } from '@/lib/analytics/attributionAnalyzer';
import { OptimizationRecommender } from '@/lib/analytics/optimizationRecommender';
import type { LayerMetrics } from '@/lib/analytics/layerMetricsEngine';
import type { AmpAttribution, CorrelationMatrix } from '@/lib/analytics/attributionAnalyzer';
import type { OptimizationRecommendation } from '@/lib/analytics/optimizationRecommender';

export function LayerAnalyticsDashboard() {
  const { layerId } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [layerName, setLayerName] = useState('');
  const [metrics, setMetrics] = useState<LayerMetrics | null>(null);
  const [attributions, setAttributions] = useState<AmpAttribution[]>([]);
  const [correlation, setCorrelation] = useState<CorrelationMatrix | null>(null);
  const [recommendations, setRecommendations] = useState<OptimizationRecommendation[]>([]);
  const configService = new LayerConfigService();

  useEffect(() => {
    if (layerId) {
      loadAnalytics();
    }
  }, [layerId]);

  async function loadAnalytics() {
    if (!layerId) return;

    try {
      // Load layer info
      const config = await configService.getLayerConfig(layerId);
      setLayerName(config.layer.name);

      // Load all analytics data
      const [metricsData, attributionData, correlationData, recommendationsData] = await Promise.all([
        LayerMetricsEngine.calculateLayerMetrics(layerId),
        AttributionAnalyzer.calculateAttribution(layerId),
        AttributionAnalyzer.calculateCorrelation(layerId),
        OptimizationRecommender.generateRecommendations(layerId),
      ]);

      setMetrics(metricsData);
      setAttributions(attributionData);
      setCorrelation(correlationData);
      setRecommendations(recommendationsData);
    } catch (error) {
      console.error('Failed to load analytics:', error);
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="container mx-auto p-6 space-y-6">
        <Skeleton className="h-8 w-64" />
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map(i => (
            <Skeleton key={i} className="h-32" />
          ))}
        </div>
        <Skeleton className="h-96" />
      </div>
    );
  }

  if (!metrics) {
    return (
      <div className="container mx-auto p-6">
        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>No Data Available</AlertTitle>
          <AlertDescription>
            Not enough performance data to calculate analytics. Continue trading to gather data.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  const getImpactColor = (impact: string) => {
    switch (impact) {
      case 'high': return 'destructive';
      case 'medium': return 'default';
      case 'low': return 'secondary';
      default: return 'default';
    }
  };

  const getRecommendationIcon = (type: string) => {
    switch (type) {
      case 'warning': return AlertTriangle;
      case 'suggestion': return Target;
      case 'insight': return CheckCircle;
      default: return Activity;
    }
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate('/trader/layers')}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold">{layerName} - Advanced Analytics</h1>
          <p className="text-muted-foreground">Comprehensive performance analysis and optimization</p>
        </div>
      </div>

      {/* Key Metrics Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Sharpe Ratio</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.sharpeRatio.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">
              {metrics.sharpeRatio > 2 ? 'Excellent' : metrics.sharpeRatio > 1 ? 'Good' : 'Needs improvement'}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Max Drawdown</CardTitle>
            <Shield className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{(metrics.maxDrawdown * 100).toFixed(1)}%</div>
            <p className="text-xs text-muted-foreground">
              Peak to trough decline
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Win Rate</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{(metrics.winRate * 100).toFixed(1)}%</div>
            <p className="text-xs text-muted-foreground">
              {metrics.winningTrades} wins / {metrics.losingTrades} losses
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Diversification</CardTitle>
            <Zap className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{correlation?.diversificationScore.toFixed(0) || 0}/100</div>
            <p className="text-xs text-muted-foreground">
              Portfolio correlation score
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Recommendations */}
      {recommendations.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5" />
              Optimization Recommendations
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {recommendations.slice(0, 5).map((rec, index) => {
              const Icon = getRecommendationIcon(rec.type);
              return (
                <Alert key={index} variant={rec.type === 'warning' ? 'destructive' : 'default'}>
                  <Icon className="h-4 w-4" />
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-2">
                      <AlertTitle>{rec.title}</AlertTitle>
                      <Badge variant={getImpactColor(rec.impact) as any}>{rec.impact} impact</Badge>
                    </div>
                    <AlertDescription>
                      <p className="mb-2">{rec.description}</p>
                      <div className="space-y-1">
                        <p className="font-semibold text-sm">Action Items:</p>
                        <ul className="list-disc list-inside space-y-1">
                          {rec.actionItems.map((item, i) => (
                            <li key={i} className="text-sm">{item}</li>
                          ))}
                        </ul>
                      </div>
                    </AlertDescription>
                  </div>
                </Alert>
              );
            })}
          </CardContent>
        </Card>
      )}

      {/* Detailed Analytics Tabs */}
      <Tabs defaultValue="performance" className="space-y-4">
        <TabsList>
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="risk">Risk Analysis</TabsTrigger>
          <TabsTrigger value="attribution">Amp Attribution</TabsTrigger>
          <TabsTrigger value="correlation">Correlation</TabsTrigger>
        </TabsList>

        <TabsContent value="performance" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Risk-Adjusted Returns</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>Sharpe Ratio</span>
                    <span className="font-bold">{metrics.sharpeRatio.toFixed(2)}</span>
                  </div>
                  <Progress value={Math.min(100, (metrics.sharpeRatio / 3) * 100)} />
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>Sortino Ratio</span>
                    <span className="font-bold">{metrics.sortinoRatio.toFixed(2)}</span>
                  </div>
                  <Progress value={Math.min(100, (metrics.sortinoRatio / 3) * 100)} />
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>Calmar Ratio</span>
                    <span className="font-bold">{metrics.calmarRatio.toFixed(2)}</span>
                  </div>
                  <Progress value={Math.min(100, (metrics.calmarRatio / 3) * 100)} />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Win/Loss Statistics</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm">Total Trades</span>
                  <span className="font-bold">{metrics.totalTrades}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">Average Win</span>
                  <span className="font-bold text-green-600">${metrics.avgWin.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">Average Loss</span>
                  <span className="font-bold text-red-600">${metrics.avgLoss.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">Profit Factor</span>
                  <span className="font-bold">{metrics.profitFactor.toFixed(2)}</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Streaks</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm">Current Streak</span>
                  <span className={`font-bold ${metrics.currentStreak > 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {metrics.currentStreak > 0 ? '+' : ''}{metrics.currentStreak}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">Longest Win Streak</span>
                  <span className="font-bold">{metrics.longestWinStreak}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">Longest Loss Streak</span>
                  <span className="font-bold">{metrics.longestLossStreak}</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="risk" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Drawdown Analysis</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>Max Drawdown</span>
                    <span className="font-bold text-red-600">{(metrics.maxDrawdown * 100).toFixed(2)}%</span>
                  </div>
                  <Progress value={(metrics.maxDrawdown / 0.5) * 100} className="bg-red-200" />
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>Current Drawdown</span>
                    <span className="font-bold">{(metrics.currentDrawdown * 100).toFixed(2)}%</span>
                  </div>
                  <Progress value={(metrics.currentDrawdown / 0.5) * 100} />
                </div>
                <div className="flex justify-between text-sm">
                  <span>Max Drawdown Duration</span>
                  <span className="font-bold">{metrics.maxDrawdownDuration} days</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Value at Risk (VaR)</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm">VaR 95%</span>
                  <span className="font-bold">{(metrics.valueAtRisk95 * 100).toFixed(2)}%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">VaR 99%</span>
                  <span className="font-bold">{(metrics.valueAtRisk99 * 100).toFixed(2)}%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">CVaR 95%</span>
                  <span className="font-bold">{(metrics.conditionalVaR95 * 100).toFixed(2)}%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">CVaR 99%</span>
                  <span className="font-bold">{(metrics.conditionalVaR99 * 100).toFixed(2)}%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">Volatility (Annual)</span>
                  <span className="font-bold">{(metrics.volatility * 100).toFixed(2)}%</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="attribution" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Amp Performance Breakdown</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {attributions.map(attr => (
                  <div key={attr.ampId} className="border rounded p-4">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-semibold">{attr.ampName}</h4>
                      <Badge>{attr.contributionScore.toFixed(0)}/100</Badge>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <div className="text-muted-foreground">Total P&L</div>
                        <div className={`font-bold ${attr.totalPnL >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                          ${attr.totalPnL.toFixed(2)}
                        </div>
                      </div>
                      <div>
                        <div className="text-muted-foreground">Win Rate</div>
                        <div className="font-bold">{(attr.winRate * 100).toFixed(1)}%</div>
                      </div>
                      <div>
                        <div className="text-muted-foreground">Trades</div>
                        <div className="font-bold">{attr.tradesExecuted}</div>
                      </div>
                      <div>
                        <div className="text-muted-foreground">Execution Rate</div>
                        <div className="font-bold">{attr.executionRate.toFixed(1)}%</div>
                      </div>
                    </div>
                  </div>
                ))}
                {attributions.length === 0 && (
                  <p className="text-center text-muted-foreground py-8">No attribution data available yet</p>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="correlation" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Correlation Analysis</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-sm text-muted-foreground">Average Correlation</div>
                    <div className="text-2xl font-bold">{((correlation?.averageCorrelation || 0) * 100).toFixed(1)}%</div>
                  </div>
                  <div>
                    <div className="text-sm text-muted-foreground">Diversification Score</div>
                    <div className="text-2xl font-bold">{correlation?.diversificationScore.toFixed(0) || 0}/100</div>
                  </div>
                </div>
                <Progress value={correlation?.diversificationScore || 0} />
                <p className="text-sm text-muted-foreground">
                  {(correlation?.diversificationScore || 0) > 70 ? 'Excellent diversification' :
                   (correlation?.diversificationScore || 0) > 50 ? 'Good diversification' :
                   'Consider adding less correlated amps'}
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
