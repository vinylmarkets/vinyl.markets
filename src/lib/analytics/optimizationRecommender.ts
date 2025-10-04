import { LayerMetricsEngine, LayerMetrics } from './layerMetricsEngine';
import { AttributionAnalyzer, AmpAttribution, CorrelationMatrix } from './attributionAnalyzer';

export interface OptimizationRecommendation {
  type: 'warning' | 'suggestion' | 'insight';
  category: 'performance' | 'risk' | 'diversification' | 'efficiency' | 'configuration';
  title: string;
  description: string;
  impact: 'high' | 'medium' | 'low';
  actionItems: string[];
}

export class OptimizationRecommender {
  /**
   * Generate intelligent recommendations for improving layer performance
   */
  static async generateRecommendations(layerId: string): Promise<OptimizationRecommendation[]> {
    const recommendations: OptimizationRecommendation[] = [];

    try {
      // Get metrics, attribution, and correlation
      const [metrics, attributions, correlation] = await Promise.all([
        LayerMetricsEngine.calculateLayerMetrics(layerId),
        AttributionAnalyzer.calculateAttribution(layerId),
        AttributionAnalyzer.calculateCorrelation(layerId),
      ]);

      // Performance recommendations
      recommendations.push(...this.analyzePerformance(metrics));

      // Risk recommendations
      recommendations.push(...this.analyzeRisk(metrics));

      // Diversification recommendations
      recommendations.push(...this.analyzeDiversification(correlation));

      // Efficiency recommendations
      recommendations.push(...this.analyzeEfficiency(attributions));

      // Configuration recommendations
      recommendations.push(...this.analyzeConfiguration(metrics, attributions));

    } catch (error) {
      console.error('Error generating recommendations:', error);
    }

    // Sort by impact (high > medium > low)
    const impactOrder = { high: 0, medium: 1, low: 2 };
    return recommendations.sort((a, b) => impactOrder[a.impact] - impactOrder[b.impact]);
  }

  private static analyzePerformance(metrics: LayerMetrics): OptimizationRecommendation[] {
    const recommendations: OptimizationRecommendation[] = [];

    // Low win rate
    if (metrics.winRate < 0.5 && metrics.totalTrades > 10) {
      recommendations.push({
        type: 'warning',
        category: 'performance',
        title: 'Low Win Rate Detected',
        description: `Your win rate is ${(metrics.winRate * 100).toFixed(1)}%, which is below the 50% threshold. This suggests your strategy may need refinement.`,
        impact: 'high',
        actionItems: [
          'Review amp priorities - higher performing amps should have higher priority',
          'Consider adjusting confidence thresholds to filter out low-quality signals',
          'Analyze losing trades to identify common patterns',
        ],
      });
    }

    // Low Sharpe ratio
    if (metrics.sharpeRatio < 1 && metrics.totalTrades > 10) {
      recommendations.push({
        type: 'suggestion',
        category: 'performance',
        title: 'Risk-Adjusted Returns Can Be Improved',
        description: `Your Sharpe ratio of ${metrics.sharpeRatio.toFixed(2)} indicates room for improvement in risk-adjusted returns.`,
        impact: 'medium',
        actionItems: [
          'Reduce position sizes to lower volatility',
          'Implement tighter stop losses to reduce large losses',
          'Consider adding mean-reversion amps to smooth returns',
        ],
      });
    }

    // Low profit factor
    if (metrics.profitFactor < 1.5 && metrics.totalTrades > 10) {
      recommendations.push({
        type: 'warning',
        category: 'performance',
        title: 'Profit Factor Below Optimal',
        description: `Your profit factor of ${metrics.profitFactor.toFixed(2)} suggests wins aren't sufficiently larger than losses.`,
        impact: 'high',
        actionItems: [
          'Let winning trades run longer by adjusting take-profit levels',
          'Cut losing trades faster with tighter stop losses',
          'Review and disable underperforming amps',
        ],
      });
    }

    return recommendations;
  }

  private static analyzeRisk(metrics: LayerMetrics): OptimizationRecommendation[] {
    const recommendations: OptimizationRecommendation[] = [];

    // High drawdown
    if (metrics.maxDrawdown > 0.2 && metrics.totalPnL !== 0) {
      recommendations.push({
        type: 'warning',
        category: 'risk',
        title: 'Excessive Drawdown Detected',
        description: `Maximum drawdown of ${(metrics.maxDrawdown * 100).toFixed(1)}% exceeds recommended threshold of 20%.`,
        impact: 'high',
        actionItems: [
          'Reduce overall capital allocation to this layer',
          'Implement daily loss limits to prevent compounding losses',
          'Consider adding protective amps (e.g., hedging strategies)',
          'Review correlation between amps - highly correlated amps amplify drawdowns',
        ],
      });
    }

    // High volatility
    if (metrics.volatility > 0.4) {
      recommendations.push({
        type: 'suggestion',
        category: 'risk',
        title: 'High Volatility Observed',
        description: `Annualized volatility of ${(metrics.volatility * 100).toFixed(1)}% indicates significant price swings.`,
        impact: 'medium',
        actionItems: [
          'Reduce position sizes across all amps',
          'Add lower-volatility amps to balance the portfolio',
          'Consider using volatility-adjusted position sizing',
        ],
      });
    }

    // Current drawdown
    if (metrics.currentDrawdown > 0.1 && metrics.currentDrawdown > 0) {
      recommendations.push({
        type: 'warning',
        category: 'risk',
        title: 'Currently in Drawdown',
        description: `Layer is currently down ${(metrics.currentDrawdown * 100).toFixed(1)}% from its peak.`,
        impact: 'high',
        actionItems: [
          'Consider reducing trading activity until performance stabilizes',
          'Review recent trades to identify what went wrong',
          'Temporarily disable amps that are contributing to losses',
        ],
      });
    }

    return recommendations;
  }

  private static analyzeDiversification(correlation: CorrelationMatrix): OptimizationRecommendation[] {
    const recommendations: OptimizationRecommendation[] = [];

    // High correlation
    if (correlation.averageCorrelation > 0.7 && correlation.amps.length > 1) {
      recommendations.push({
        type: 'warning',
        category: 'diversification',
        title: 'High Correlation Between Amps',
        description: `Average correlation of ${(correlation.averageCorrelation * 100).toFixed(1)}% suggests your amps are too similar. Diversification benefits are limited.`,
        impact: 'high',
        actionItems: [
          'Add amps with different strategies (e.g., if you have momentum amps, add mean-reversion)',
          'Consider different timeframes - mix intraday with swing trading amps',
          'Look for amps that trade different asset classes or sectors',
        ],
      });
    }

    // Low diversification score
    if (correlation.diversificationScore < 50 && correlation.amps.length > 1) {
      recommendations.push({
        type: 'suggestion',
        category: 'diversification',
        title: 'Diversification Can Be Improved',
        description: `Diversification score of ${correlation.diversificationScore.toFixed(0)}/100 suggests opportunities to reduce portfolio correlation.`,
        impact: 'medium',
        actionItems: [
          'Review amp categories - ensure mix of momentum, mean-reversion, and breakout strategies',
          'Consider adding counter-cyclical amps that profit in different market conditions',
          'Adjust capital allocation to favor less correlated amps',
        ],
      });
    }

    return recommendations;
  }

  private static analyzeEfficiency(attributions: AmpAttribution[]): OptimizationRecommendation[] {
    const recommendations: OptimizationRecommendation[] = [];

    // Low execution rate
    const lowExecutionAmps = attributions.filter(a => a.executionRate < 50 && a.signalsGenerated > 10);
    if (lowExecutionAmps.length > 0) {
      recommendations.push({
        type: 'suggestion',
        category: 'efficiency',
        title: 'Low Signal Execution Rate',
        description: `${lowExecutionAmps.length} amp(s) have execution rates below 50%, indicating many signals are being rejected.`,
        impact: 'medium',
        actionItems: [
          'Review conflict resolution strategy - may be too aggressive',
          'Check if capital allocation is sufficient for all amps',
          'Verify position limits are not blocking trades',
        ],
      });
    }

    // Underperforming amps
    const underperformers = attributions.filter(a => a.contributionScore < 30 && a.tradesExecuted > 5);
    if (underperformers.length > 0) {
      recommendations.push({
        type: 'warning',
        category: 'efficiency',
        title: 'Underperforming Amps Detected',
        description: `${underperformers.length} amp(s) have low contribution scores, dragging down overall performance.`,
        impact: 'high',
        actionItems: [
          `Consider disabling: ${underperformers.map(a => a.ampName).join(', ')}`,
          'Review settings for underperforming amps',
          'Analyze if these amps need different market conditions to perform',
        ],
      });
    }

    // Amp concentration
    if (attributions.length > 0) {
      const topAmp = attributions[0];
      if (topAmp.percentageOfTotalPnL > 70) {
        recommendations.push({
          type: 'insight',
          category: 'efficiency',
          title: 'Performance Concentrated in One Amp',
          description: `${topAmp.ampName} contributes ${topAmp.percentageOfTotalPnL.toFixed(1)}% of total P&L. Over-reliance on single amp increases risk.`,
          impact: 'medium',
          actionItems: [
            'Increase capital allocation to other performing amps',
            'Add more amps to distribute risk',
            `Consider reducing allocation`,
          ],
        });
      }
    }

    return recommendations;
  }

  private static analyzeConfiguration(
    metrics: LayerMetrics,
    attributions: AmpAttribution[]
  ): OptimizationRecommendation[] {
    const recommendations: OptimizationRecommendation[] = [];

    // Long losing streak
    if (metrics.currentStreak < -3) {
      recommendations.push({
        type: 'warning',
        category: 'configuration',
        title: 'Extended Losing Streak',
        description: `Currently on a ${Math.abs(metrics.currentStreak)}-trade losing streak. Consider pausing to reassess.`,
        impact: 'high',
        actionItems: [
          'Temporarily deactivate layer to prevent further losses',
          'Review recent market conditions - may not suit current strategy',
          'Consider reducing position sizes when reactivating',
        ],
      });
    }

    // Few trades
    if (metrics.totalTrades < 20) {
      recommendations.push({
        type: 'insight',
        category: 'configuration',
        title: 'Limited Trading History',
        description: `With only ${metrics.totalTrades} trades, performance metrics may not be statistically significant yet.`,
        impact: 'low',
        actionItems: [
          'Continue running layer to gather more performance data',
          'Avoid making major changes based on limited data',
          'Monitor performance closely as sample size grows',
        ],
      });
    }

    return recommendations;
  }
}
