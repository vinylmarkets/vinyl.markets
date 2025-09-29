import React, { useMemo } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { generateMockTrades, calculatePerformanceMetrics, calculateValueAtRisk, calculateRiskRewardRatio } from "../../lib/performance-calculations";
import { Shield, AlertTriangle, TrendingDown, Target, BarChart3, Activity } from "lucide-react";

export function RiskMetrics() {
  const trades = useMemo(() => generateMockTrades(100), []);
  const metrics = useMemo(() => calculatePerformanceMetrics(trades, 100000), [trades]);
  
  const riskAnalysis = useMemo(() => {
    const closedTrades = trades.filter(t => t.status === 'closed');
    const returns = closedTrades.map(t => t.pnlPercent / 100);
    
    return {
      valueAtRisk95: calculateValueAtRisk(returns, 0.95) * 100,
      valueAtRisk99: calculateValueAtRisk(returns, 0.99) * 100,
      riskRewardRatio: calculateRiskRewardRatio(trades),
      volatility: returns.length > 0 ? standardDeviation(returns) * 100 : 0,
      worstLossStreak: calculateWorstLossStreak(closedTrades),
      averageDrawdownDuration: calculateAvgDrawdownDuration(closedTrades),
      largestLossPercent: closedTrades.length > 0 ? Math.min(...closedTrades.map(t => t.pnlPercent)) : 0,
      largestWinPercent: closedTrades.length > 0 ? Math.max(...closedTrades.map(t => t.pnlPercent)) : 0,
    };
  }, [trades]);

  const riskLevel = useMemo(() => {
    const { maxDrawdown, sharpeRatio } = metrics;
    const { valueAtRisk95 } = riskAnalysis;
    
    if (maxDrawdown > 25 || Math.abs(valueAtRisk95) > 5 || sharpeRatio < 0.3) {
      return { level: "high", color: "destructive", label: "High Risk" };
    } else if (maxDrawdown > 15 || Math.abs(valueAtRisk95) > 3 || sharpeRatio < 0.8) {
      return { level: "moderate", color: "warning", label: "Moderate Risk" };
    } else {
      return { level: "low", color: "success", label: "Low Risk" };
    }
  }, [metrics, riskAnalysis]);

  const riskWarnings = useMemo(() => {
    const warnings = [];
    
    if (metrics.maxDrawdown > 20) {
      warnings.push("Maximum drawdown exceeds 20% - consider reducing position sizes");
    }
    if (metrics.consecutiveLosses >= 5) {
      warnings.push("5+ consecutive losses detected - strategy may need adjustment");
    }
    if (metrics.sharpeRatio < 0.5) {
      warnings.push("Sharpe ratio below 0.5 - returns may not justify the risk taken");
    }
    if (Math.abs(riskAnalysis.valueAtRisk95) > 4) {
      warnings.push("Value at Risk indicates potential for large single-day losses");
    }
    if (metrics.winRate < 40) {
      warnings.push("Win rate below 40% - review trade selection criteria");
    }
    
    return warnings;
  }, [metrics, riskAnalysis]);

  return (
    <div className="space-y-6">
      {/* Risk Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className={`border-${riskLevel.color}/20 bg-${riskLevel.color}/5`}>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-sm">
              <Shield className="h-4 w-4" />
              Risk Level
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Badge variant={riskLevel.color as any} className="text-lg px-3 py-1">
              {riskLevel.label}
            </Badge>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-sm">
              <TrendingDown className="h-4 w-4" />
              Max Drawdown
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <p className="text-2xl font-bold text-destructive">
                -{metrics.maxDrawdown.toFixed(2)}%
              </p>
              <Progress 
                value={metrics.maxDrawdown} 
                max={30} 
                className="h-2"
              />
              <p className="text-xs text-muted-foreground">
                Current: -{metrics.currentDrawdown.toFixed(2)}%
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-sm">
              <AlertTriangle className="h-4 w-4" />
              Value at Risk (95%)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <p className="text-2xl font-bold text-destructive">
                {riskAnalysis.valueAtRisk95.toFixed(2)}%
              </p>
              <p className="text-xs text-muted-foreground">
                Daily loss potential
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-sm">
              <Target className="h-4 w-4" />
              Risk/Reward Ratio
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <p className={`text-2xl font-bold ${
                riskAnalysis.riskRewardRatio > 1.5 ? 'text-success' : 
                riskAnalysis.riskRewardRatio > 1 ? 'text-warning' : 'text-destructive'
              }`}>
                {riskAnalysis.riskRewardRatio.toFixed(2)}
              </p>
              <p className="text-xs text-muted-foreground">
                Avg win : Avg loss
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Risk Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Risk Statistics</CardTitle>
            <CardDescription>
              Comprehensive risk analysis of trading performance
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">Volatility (Daily)</p>
                <p className="text-xl font-bold">{riskAnalysis.volatility.toFixed(2)}%</p>
              </div>
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">Sharpe Ratio</p>
                <p className={`text-xl font-bold ${
                  metrics.sharpeRatio > 1 ? 'text-success' : 
                  metrics.sharpeRatio > 0.5 ? 'text-warning' : 'text-destructive'
                }`}>
                  {metrics.sharpeRatio.toFixed(2)}
                </p>
              </div>
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">VaR (99%)</p>
                <p className="text-xl font-bold text-destructive">
                  {riskAnalysis.valueAtRisk99.toFixed(2)}%
                </p>
              </div>
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">Profit Factor</p>
                <p className={`text-xl font-bold ${
                  metrics.profitFactor > 1.5 ? 'text-success' : 
                  metrics.profitFactor > 1 ? 'text-warning' : 'text-destructive'
                }`}>
                  {metrics.profitFactor.toFixed(2)}
                </p>
              </div>
            </div>

            <div className="pt-4 border-t space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Largest Win</span>
                <span className="font-bold text-success">
                  +{riskAnalysis.largestWinPercent.toFixed(2)}%
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Largest Loss</span>
                <span className="font-bold text-destructive">
                  {riskAnalysis.largestLossPercent.toFixed(2)}%
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Max Consecutive Losses</span>
                <span className="font-bold">{metrics.consecutiveLosses}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Max Consecutive Wins</span>
                <span className="font-bold text-success">{metrics.consecutiveWins}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Position Sizing & Exposure</CardTitle>
            <CardDescription>
              Analysis of position sizes and portfolio exposure
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div>
                <div className="flex justify-between items-center mb-1">
                  <span className="text-sm text-muted-foreground">Average Position Size</span>
                  <span className="font-bold">2.3%</span>
                </div>
                <Progress value={23} className="h-2" />
              </div>
              
              <div>
                <div className="flex justify-between items-center mb-1">
                  <span className="text-sm text-muted-foreground">Largest Position</span>
                  <span className="font-bold">4.8%</span>
                </div>
                <Progress value={48} className="h-2" />
              </div>
              
              <div>
                <div className="flex justify-between items-center mb-1">
                  <span className="text-sm text-muted-foreground">Portfolio Utilization</span>
                  <span className="font-bold">67%</span>
                </div>
                <Progress value={67} className="h-2" />
              </div>
            </div>

            <div className="pt-4 border-t">
              <h4 className="font-medium mb-3">Risk Concentration</h4>
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm">Top 5 Positions</span>
                  <Badge variant="outline">18.4%</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">Single Stock Max</span>
                  <Badge variant="outline">4.8%</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">Sector Concentration</span>
                  <Badge variant="secondary">Tech: 42%</Badge>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Risk Warnings */}
      {riskWarnings.length > 0 && (
        <Card className="border-destructive/20 bg-destructive/5">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-destructive">
              <AlertTriangle className="h-5 w-5" />
              Risk Alerts
            </CardTitle>
            <CardDescription>
              Important risk factors that require attention
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {riskWarnings.map((warning, index) => (
                <Alert key={index} variant="destructive">
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>{warning}</AlertDescription>
                </Alert>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Risk Management Recommendations */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Risk Management Recommendations
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-3">
              <h4 className="font-medium text-success">Strengths</h4>
              <div className="space-y-2 text-sm">
                {metrics.sharpeRatio > 0.8 && (
                  <p className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-success" />
                    Good risk-adjusted returns (Sharpe &gt; 0.8)
                  </p>
                )}
                {riskAnalysis.riskRewardRatio > 1.5 && (
                  <p className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-success" />
                    Strong risk/reward ratio
                  </p>
                )}
                {metrics.maxDrawdown < 15 && (
                  <p className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-success" />
                    Controlled drawdowns
                  </p>
                )}
                {metrics.winRate > 55 && (
                  <p className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-success" />
                    High win rate consistency
                  </p>
                )}
              </div>
            </div>

            <div className="space-y-3">
              <h4 className="font-medium text-warning">Improvement Areas</h4>
              <div className="space-y-2 text-sm">
                {metrics.maxDrawdown > 15 && (
                  <p className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-warning" />
                    Consider reducing position sizes
                  </p>
                )}
                {riskAnalysis.riskRewardRatio < 1.2 && (
                  <p className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-warning" />
                    Improve risk/reward selection
                  </p>
                )}
                {Math.abs(riskAnalysis.valueAtRisk95) > 3 && (
                  <p className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-warning" />
                    High daily loss potential
                  </p>
                )}
                {metrics.consecutiveLosses > 3 && (
                  <p className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-warning" />
                    Implement loss streak limits
                  </p>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// Helper functions
function standardDeviation(values: number[]): number {
  if (values.length === 0) return 0;
  const mean = values.reduce((sum, val) => sum + val, 0) / values.length;
  const squaredDiffs = values.map(val => Math.pow(val - mean, 2));
  const variance = squaredDiffs.reduce((sum, val) => sum + val, 0) / values.length;
  return Math.sqrt(variance);
}

function calculateWorstLossStreak(trades: any[]): number {
  let maxStreak = 0;
  let currentStreak = 0;
  
  trades.forEach(trade => {
    if (trade.pnl < 0) {
      currentStreak++;
      maxStreak = Math.max(maxStreak, currentStreak);
    } else {
      currentStreak = 0;
    }
  });
  
  return maxStreak;
}

function calculateAvgDrawdownDuration(trades: any[]): number {
  // Simplified calculation for demo
  return Math.floor(Math.random() * 5) + 2; // 2-6 days average
}