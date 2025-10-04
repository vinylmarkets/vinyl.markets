/**
 * Backtesting Engine
 * Simulates trading strategies on historical data
 */

import { HistoricalBar, getHistoricalDataService } from './historicalDataService';
import { StrategySignal } from './ampStrategies';
import { RiskLimits } from './riskManagement';

export interface BacktestConfig {
  strategyId: string;
  strategyName: string;
  startDate: Date;
  endDate: Date;
  initialCapital: number;
  symbols: string[];
  commission: number;     // $ per trade
  slippage: number;       // % slippage (e.g., 0.001 = 0.1%)
  riskLimits: RiskLimits;
}

export interface BacktestPosition {
  symbol: string;
  quantity: number;
  entryPrice: number;
  entryDate: Date;
  stopLoss?: number;
  takeProfit?: number;
}

export interface BacktestTrade {
  entryDate: Date;
  exitDate: Date;
  symbol: string;
  side: 'buy' | 'sell';
  entryPrice: number;
  exitPrice: number;
  quantity: number;
  pnl: number;
  pnlPercent: number;
  commission: number;
  slippage: number;
  holdingPeriod: number;  // Days
  exitReason: 'signal' | 'stop-loss' | 'take-profit' | 'end-of-backtest';
}

export interface BacktestResult {
  config: BacktestConfig;

  // Performance metrics
  totalReturn: number;    // Total % return
  totalReturnDollar: number;  // Total $ return
  sharpeRatio: number;
  maxDrawdown: number;
  maxDrawdownDollar: number;
  calmarRatio: number;

  // Trade statistics
  totalTrades: number;
  winningTrades: number;
  losingTrades: number;
  winRate: number;
  avgWin: number;
  avgLoss: number;
  profitFactor: number;
  avgTrade: number;

  // Time series data
  equityCurve: { date: Date; value: number }[];
  drawdownCurve: { date: Date; drawdown: number }[];
  trades: BacktestTrade[];

  // Execution statistics
  startDate: Date;
  endDate: Date;
  durationDays: number;
  executionTimeMs: number;
}

export class BacktestEngine {
  private config: BacktestConfig;
  private currentCash: number;
  private positions: Map<string, BacktestPosition>;
  private trades: BacktestTrade[];
  private equityCurve: { date: Date; value: number }[];
  private highWaterMark: number;

  constructor(config: BacktestConfig) {
    this.config = config;
    this.currentCash = config.initialCapital;
    this.positions = new Map();
    this.trades = [];
    this.equityCurve = [];
    this.highWaterMark = config.initialCapital;
  }

  /**
   * Run the backtest
   */
  async run(
    strategyFunction: (date: Date, marketData: Map<string, HistoricalBar[]>) => Promise<StrategySignal[]>
  ): Promise<BacktestResult> {
    const startTime = Date.now();

    console.log('🔬 Starting backtest...');
    console.log(`Strategy: ${this.config.strategyName}`);
    console.log(`Period: ${this.config.startDate.toDateString()} to ${this.config.endDate.toDateString()}`);
    console.log(`Initial Capital: $${this.config.initialCapital.toLocaleString()}`);

    // Fetch historical data for all symbols
    const marketData = await this.loadMarketData();

    // Get all trading dates
    const tradingDates = this.getTradingDates(marketData);
    console.log(`📅 ${tradingDates.length} trading days to simulate`);

    // Simulate each day
    for (let i = 0; i < tradingDates.length; i++) {
      const date = tradingDates[i];

      // Log progress every 50 days
      if (i % 50 === 0) {
        console.log(`Progress: ${i}/${tradingDates.length} days (${((i/tradingDates.length)*100).toFixed(1)}%)`);
      }

      // Check stop-loss and take-profit on existing positions
      await this.checkExits(date, marketData);

      // Generate signals for this date
      const signals = await strategyFunction(date, marketData);

      // Execute signals
      await this.executeSignals(signals, date, marketData);

      // Record equity
      const portfolioValue = this.calculatePortfolioValue(date, marketData);
      this.equityCurve.push({ date, value: portfolioValue });

      // Update high water mark
      if (portfolioValue > this.highWaterMark) {
        this.highWaterMark = portfolioValue;
      }
    }

    // Close all remaining positions at end
    await this.closeAllPositions(tradingDates[tradingDates.length - 1], marketData);

    // Calculate metrics
    const result = this.calculateResults(startTime);

    console.log('✅ Backtest complete!');
    console.log(`Total Return: ${(result.totalReturn * 100).toFixed(2)}%`);
    console.log(`Sharpe Ratio: ${result.sharpeRatio.toFixed(2)}`);
    console.log(`Max Drawdown: ${(result.maxDrawdown * 100).toFixed(2)}%`);
    console.log(`Win Rate: ${(result.winRate * 100).toFixed(1)}%`);
    console.log(`Total Trades: ${result.totalTrades}`);

    return result;
  }

  /**
   * Load historical data for all symbols
   */
  private async loadMarketData(): Promise<Map<string, HistoricalBar[]>> {
    const service = getHistoricalDataService();
    const data = new Map<string, HistoricalBar[]>();

    for (const symbol of this.config.symbols) {
      const bars = await service.getHistoricalData({
        symbol,
        startDate: this.config.startDate,
        endDate: this.config.endDate,
        timeframe: '1Day'
      });
      data.set(symbol, bars);
    }

    return data;
  }

  /**
   * Get all unique trading dates
   */
  private getTradingDates(marketData: Map<string, HistoricalBar[]>): Date[] {
    const dates = new Set<number>();

    for (const bars of marketData.values()) {
      bars.forEach(bar => dates.add(bar.timestamp.getTime()));
    }

    return Array.from(dates)
      .map(ts => new Date(ts))
      .sort((a, b) => a.getTime() - b.getTime());
  }

  /**
   * Check stop-loss and take-profit on open positions
   */
  private async checkExits(
    date: Date,
    marketData: Map<string, HistoricalBar[]>
  ): Promise<void> {
    for (const [symbol, position] of this.positions.entries()) {
      const bars = marketData.get(symbol);
      if (!bars) continue;

      const currentBar = bars.find(b =>
        b.timestamp.toDateString() === date.toDateString()
      );
      if (!currentBar) continue;

      // Check stop-loss
      if (position.stopLoss && currentBar.low <= position.stopLoss) {
        await this.closePosition(
          symbol,
          position,
          position.stopLoss,
          date,
          'stop-loss'
        );
        continue;
      }

      // Check take-profit
      if (position.takeProfit && currentBar.high >= position.takeProfit) {
        await this.closePosition(
          symbol,
          position,
          position.takeProfit,
          date,
          'take-profit'
        );
      }
    }
  }

  /**
   * Execute trading signals
   */
  private async executeSignals(
    signals: StrategySignal[],
    date: Date,
    marketData: Map<string, HistoricalBar[]>
  ): Promise<void> {
    for (const signal of signals) {
      const bars = marketData.get(signal.symbol);
      if (!bars) continue;

      const currentBar = bars.find(b =>
        b.timestamp.toDateString() === date.toDateString()
      );
      if (!currentBar) continue;

      if (signal.action === 'buy') {
        await this.openPosition(signal, currentBar, date);
      } else if (signal.action === 'sell') {
        const position = this.positions.get(signal.symbol);
        if (position) {
          await this.closePosition(
            signal.symbol,
            position,
            currentBar.close,
            date,
            'signal'
          );
        }
      }
    }
  }

  /**
   * Open a new position
   */
  private async openPosition(
    signal: StrategySignal,
    bar: HistoricalBar,
    date: Date
  ): Promise<void> {
    // Calculate slippage
    const slippageAmount = bar.close * this.config.slippage;
    const executionPrice = bar.close + slippageAmount;

    // Calculate cost
    const positionCost = (signal.quantity * executionPrice) + this.config.commission;

    // Check if we have enough cash
    if (positionCost > this.currentCash) {
      console.log(`⚠️ Insufficient cash for ${signal.symbol}`);
      return;
    }

    // Open position
    this.positions.set(signal.symbol, {
      symbol: signal.symbol,
      quantity: signal.quantity,
      entryPrice: executionPrice,
      entryDate: date,
      stopLoss: signal.stopLoss,
      takeProfit: signal.takeProfit
    });

    // Deduct cash
    this.currentCash -= positionCost;

    console.log(`📈 BUY ${signal.quantity} ${signal.symbol} @ $${executionPrice.toFixed(2)}`);
  }

  /**
   * Close a position
   */
  private async closePosition(
    symbol: string,
    position: BacktestPosition,
    exitPrice: number,
    exitDate: Date,
    exitReason: BacktestTrade['exitReason']
  ): Promise<void> {
    // Calculate slippage
    const slippageAmount = exitPrice * this.config.slippage;
    const executionPrice = exitPrice - slippageAmount;

    // Calculate P&L
    const grossPnl = (executionPrice - position.entryPrice) * position.quantity;
    const netPnl = grossPnl - (this.config.commission * 2) - (slippageAmount * position.quantity * 2);
    const pnlPercent = netPnl / (position.entryPrice * position.quantity);

    // Record trade
    const holdingPeriod = Math.round(
      (exitDate.getTime() - position.entryDate.getTime()) / (1000 * 60 * 60 * 24)
    );

    this.trades.push({
      entryDate: position.entryDate,
      exitDate,
      symbol,
      side: 'buy',
      entryPrice: position.entryPrice,
      exitPrice: executionPrice,
      quantity: position.quantity,
      pnl: netPnl,
      pnlPercent,
      commission: this.config.commission * 2,
      slippage: slippageAmount * position.quantity * 2,
      holdingPeriod,
      exitReason
    });

    // Add proceeds to cash
    const proceeds = (position.quantity * executionPrice) - this.config.commission;
    this.currentCash += proceeds;

    // Remove position
    this.positions.delete(symbol);

    console.log(`📉 SELL ${position.quantity} ${symbol} @ $${executionPrice.toFixed(2)} (${exitReason}) P&L: $${netPnl.toFixed(2)}`);
  }

  /**
   * Close all positions
   */
  private async closeAllPositions(
    date: Date,
    marketData: Map<string, HistoricalBar[]>
  ): Promise<void> {
    for (const [symbol, position] of this.positions.entries()) {
      const bars = marketData.get(symbol);
      if (!bars) continue;

      const lastBar = bars[bars.length - 1];

      await this.closePosition(
        symbol,
        position,
        lastBar.close,
        date,
        'end-of-backtest'
      );
    }
  }

  /**
   * Calculate current portfolio value
   */
  private calculatePortfolioValue(
    date: Date,
    marketData: Map<string, HistoricalBar[]>
  ): number {
    let positionsValue = 0;

    for (const [symbol, position] of this.positions.entries()) {
      const bars = marketData.get(symbol);
      if (!bars) continue;

      const currentBar = bars.find(b =>
        b.timestamp.toDateString() === date.toDateString()
      );

      if (currentBar) {
        positionsValue += position.quantity * currentBar.close;
      }
    }

    return this.currentCash + positionsValue;
  }

  /**
   * Calculate backtest results and metrics
   */
  private calculateResults(startTime: number): BacktestResult {
    const finalValue = this.equityCurve[this.equityCurve.length - 1].value;
    const totalReturn = (finalValue - this.config.initialCapital) / this.config.initialCapital;

    // Calculate Sharpe Ratio
    const returns = this.calculateDailyReturns();
    const avgReturn = returns.reduce((sum, r) => sum + r, 0) / returns.length;
    const stdDev = Math.sqrt(
      returns.reduce((sum, r) => sum + Math.pow(r - avgReturn, 2), 0) / returns.length
    );
    const sharpeRatio = (avgReturn / stdDev) * Math.sqrt(252); // Annualized

    // Calculate max drawdown
    let maxDrawdown = 0;
    let maxDrawdownDollar = 0;
    const drawdownCurve: { date: Date; drawdown: number }[] = [];

    for (const point of this.equityCurve) {
      const drawdown = (this.highWaterMark - point.value) / this.highWaterMark;
      const drawdownDollar = this.highWaterMark - point.value;

      if (drawdown > maxDrawdown) {
        maxDrawdown = drawdown;
        maxDrawdownDollar = drawdownDollar;
      }

      drawdownCurve.push({ date: point.date, drawdown });
    }

    // Trade statistics
    const winningTrades = this.trades.filter(t => t.pnl > 0);
    const losingTrades = this.trades.filter(t => t.pnl < 0);

    const avgWin = winningTrades.length > 0
      ? winningTrades.reduce((sum, t) => sum + t.pnl, 0) / winningTrades.length
      : 0;

    const avgLoss = losingTrades.length > 0
      ? Math.abs(losingTrades.reduce((sum, t) => sum + t.pnl, 0) / losingTrades.length)
      : 0;

    const profitFactor = avgLoss > 0 ? avgWin / avgLoss : 0;

    const avgTrade = this.trades.length > 0
      ? this.trades.reduce((sum, t) => sum + t.pnl, 0) / this.trades.length
      : 0;

    // Calmar Ratio
    const calmarRatio = maxDrawdown > 0 ? totalReturn / maxDrawdown : 0;

    return {
      config: this.config,
      totalReturn,
      totalReturnDollar: finalValue - this.config.initialCapital,
      sharpeRatio: isNaN(sharpeRatio) ? 0 : sharpeRatio,
      maxDrawdown,
      maxDrawdownDollar,
      calmarRatio,
      totalTrades: this.trades.length,
      winningTrades: winningTrades.length,
      losingTrades: losingTrades.length,
      winRate: this.trades.length > 0 ? winningTrades.length / this.trades.length : 0,
      avgWin,
      avgLoss,
      profitFactor,
      avgTrade,
      equityCurve: this.equityCurve,
      drawdownCurve,
      trades: this.trades,
      startDate: this.config.startDate,
      endDate: this.config.endDate,
      durationDays: Math.round(
        (this.config.endDate.getTime() - this.config.startDate.getTime()) / (1000 * 60 * 60 * 24)
      ),
      executionTimeMs: Date.now() - startTime
    };
  }

  /**
   * Calculate daily returns from equity curve
   */
  private calculateDailyReturns(): number[] {
    const returns: number[] = [];

    for (let i = 1; i < this.equityCurve.length; i++) {
      const prevValue = this.equityCurve[i - 1].value;
      const currValue = this.equityCurve[i].value;
      const dailyReturn = (currValue - prevValue) / prevValue;
      returns.push(dailyReturn);
    }

    return returns;
  }
}
