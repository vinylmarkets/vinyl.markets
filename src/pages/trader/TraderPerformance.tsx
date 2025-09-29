import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PerformanceOverview } from "@/trader-platform/components/performance/PerformanceOverview";
import { EquityCurveChart } from "@/trader-platform/components/performance/EquityCurveChart";
import { TradeHistoryTable } from "@/trader-platform/components/performance/TradeHistoryTable";
import { StrategyBreakdown } from "@/trader-platform/components/performance/StrategyBreakdown";
import { TimeAnalysis } from "@/trader-platform/components/performance/TimeAnalysis";
import { RiskMetrics } from "@/trader-platform/components/performance/RiskMetrics";
import { MonthlyHeatmap } from "@/trader-platform/components/performance/MonthlyHeatmap";
import { ExportTools } from "@/trader-platform/components/performance/ExportTools";
import { ArrowLeft, AlertTriangle } from "lucide-react";
import { Link } from "react-router-dom";

export default function TraderPerformance() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/20 to-accent/5">
      <div className="container mx-auto p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link 
              to="/trader" 
              className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Trading
            </Link>
            <div>
              <h1 className="text-3xl font-bold">Performance History</h1>
              <p className="text-muted-foreground">
                Analyze your trading system's effectiveness with detailed performance metrics
              </p>
            </div>
          </div>
          <ExportTools />
        </div>

        {/* Performance Overview Cards */}
        <PerformanceOverview />

        {/* Main Content Tabs */}
        <Tabs defaultValue="equity-curve" className="space-y-6">
          <TabsList className="grid grid-cols-6 w-full">
            <TabsTrigger value="equity-curve">Equity Curve</TabsTrigger>
            <TabsTrigger value="trades">Trade History</TabsTrigger>
            <TabsTrigger value="strategies">Strategies</TabsTrigger>
            <TabsTrigger value="time-analysis">Time Analysis</TabsTrigger>
            <TabsTrigger value="risk">Risk Metrics</TabsTrigger>
            <TabsTrigger value="calendar">Monthly View</TabsTrigger>
          </TabsList>

          <TabsContent value="equity-curve">
            <EquityCurveChart />
          </TabsContent>

          <TabsContent value="trades">
            <TradeHistoryTable />
          </TabsContent>

          <TabsContent value="strategies">
            <StrategyBreakdown />
          </TabsContent>

          <TabsContent value="time-analysis">
            <TimeAnalysis />
          </TabsContent>

          <TabsContent value="risk">
            <RiskMetrics />
          </TabsContent>

          <TabsContent value="calendar">
            <MonthlyHeatmap />
          </TabsContent>
        </Tabs>

        {/* Risk Warning Alert */}
        <Card className="border-destructive/20 bg-destructive/5">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-destructive">
              <AlertTriangle className="h-5 w-5" />
              Performance Analysis Notice
            </CardTitle>
            <CardDescription>
              This performance data reflects paper trading results. Real market conditions, 
              slippage, and execution delays will impact live trading performance. Past 
              performance does not guarantee future results.
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    </div>
  );
}