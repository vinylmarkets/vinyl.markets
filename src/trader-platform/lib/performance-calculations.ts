// Performance calculation utilities for trading analytics

export interface Trade {
  id: string;
  symbol: string;
  direction: 'BUY' | 'SELL';
  quantity: number;
  entryPrice: number;
  exitPrice?: number;
  entryTime: string;
  exitTime?: string;
  pnl: number;
  pnlPercent: number;
  strategy: 'momentum' | 'mean-reversion' | 'ml-prediction';
  status: 'open' | 'closed';
}

export interface PerformanceMetrics {
  totalReturn: number;
  totalReturnPercent: number;
  winRate: number;
  averageWin: number;
  averageLoss: number;
  currentDrawdown: number;
  maxDrawdown: number;
  sharpeRatio: number;
  profitFactor: number;
  totalTrades: number;
  winningTrades: number;
  losingTrades: number;
  largestWin: number;
  largestLoss: number;
  consecutiveWins: number;
  consecutiveLosses: number;
}

export function calculateSharpeRatio(returns: number[], riskFreeRate: number = 0.02): number {
  if (returns.length === 0) return 0;
  
  const avgReturn = mean(returns);
  const stdDev = standardDeviation(returns);
  
  if (stdDev === 0) return 0;
  
  // Annualized Sharpe ratio
  return ((avgReturn - riskFreeRate) / stdDev) * Math.sqrt(252);
}

export function calculateMaxDrawdown(equityCurve: number[]): number {
  if (equityCurve.length === 0) return 0;
  
  let maxDrawdown = 0;
  let peak = equityCurve[0];
  
  for (const value of equityCurve) {
    if (value > peak) {
      peak = value;
    }
    const drawdown = (peak - value) / peak;
    maxDrawdown = Math.max(maxDrawdown, drawdown);
  }
  
  return maxDrawdown * 100; // As percentage
}

export function calculateWinRate(trades: Trade[]): number {
  if (trades.length === 0) return 0;
  
  const closedTrades = trades.filter(t => t.status === 'closed');
  if (closedTrades.length === 0) return 0;
  
  const wins = closedTrades.filter(t => t.pnl > 0).length;
  return (wins / closedTrades.length) * 100;
}

export function calculateProfitFactor(trades: Trade[]): number {
  const closedTrades = trades.filter(t => t.status === 'closed');
  
  const totalWins = sum(closedTrades.filter(t => t.pnl > 0).map(t => t.pnl));
  const totalLosses = Math.abs(sum(closedTrades.filter(t => t.pnl < 0).map(t => t.pnl)));
  
  if (totalLosses === 0) return totalWins > 0 ? Infinity : 0;
  
  return totalWins / totalLosses;
}

export function calculatePerformanceMetrics(
  trades: Trade[], 
  initialBalance: number = 100000
): PerformanceMetrics {
  const closedTrades = trades.filter(t => t.status === 'closed');
  const winningTrades = closedTrades.filter(t => t.pnl > 0);
  const losingTrades = closedTrades.filter(t => t.pnl < 0);
  
  const totalPnl = sum(closedTrades.map(t => t.pnl));
  const returns = closedTrades.map(t => t.pnlPercent / 100);
  
  // Calculate consecutive wins/losses
  let maxConsecutiveWins = 0;
  let maxConsecutiveLosses = 0;
  let currentWinStreak = 0;
  let currentLossStreak = 0;
  
  closedTrades.forEach(trade => {
    if (trade.pnl > 0) {
      currentWinStreak++;
      currentLossStreak = 0;
      maxConsecutiveWins = Math.max(maxConsecutiveWins, currentWinStreak);
    } else {
      currentLossStreak++;
      currentWinStreak = 0;
      maxConsecutiveLosses = Math.max(maxConsecutiveLosses, currentLossStreak);
    }
  });
  
  // Calculate equity curve for drawdown
  const equityCurve = [initialBalance];
  let runningBalance = initialBalance;
  
  closedTrades.forEach(trade => {
    runningBalance += trade.pnl;
    equityCurve.push(runningBalance);
  });
  
  return {
    totalReturn: totalPnl,
    totalReturnPercent: (totalPnl / initialBalance) * 100,
    winRate: calculateWinRate(trades),
    averageWin: winningTrades.length > 0 ? mean(winningTrades.map(t => t.pnl)) : 0,
    averageLoss: losingTrades.length > 0 ? mean(losingTrades.map(t => Math.abs(t.pnl))) : 0,
    currentDrawdown: calculateCurrentDrawdown(equityCurve),
    maxDrawdown: calculateMaxDrawdown(equityCurve),
    sharpeRatio: calculateSharpeRatio(returns),
    profitFactor: calculateProfitFactor(trades),
    totalTrades: closedTrades.length,
    winningTrades: winningTrades.length,
    losingTrades: losingTrades.length,
    largestWin: winningTrades.length > 0 ? Math.max(...winningTrades.map(t => t.pnl)) : 0,
    largestLoss: losingTrades.length > 0 ? Math.min(...losingTrades.map(t => t.pnl)) : 0,
    consecutiveWins: maxConsecutiveWins,
    consecutiveLosses: maxConsecutiveLosses,
  };
}

export function calculateCurrentDrawdown(equityCurve: number[]): number {
  if (equityCurve.length === 0) return 0;
  
  const currentValue = equityCurve[equityCurve.length - 1];
  const peak = Math.max(...equityCurve);
  
  return ((peak - currentValue) / peak) * 100;
}

export function getStrategyPerformance(trades: Trade[]) {
  const strategies = ['momentum', 'mean-reversion', 'ml-prediction'] as const;
  
  return strategies.map(strategy => {
    const strategyTrades = trades.filter(t => t.strategy === strategy && t.status === 'closed');
    const winRate = calculateWinRate(strategyTrades);
    const totalPnl = sum(strategyTrades.map(t => t.pnl));
    
    return {
      name: strategy,
      displayName: strategy === 'ml-prediction' ? 'ML Prediction' : 
                   strategy === 'mean-reversion' ? 'Mean Reversion' : 'Momentum',
      winRate,
      totalPnl,
      tradeCount: strategyTrades.length,
      averagePnl: strategyTrades.length > 0 ? totalPnl / strategyTrades.length : 0,
    };
  });
}

// Utility functions
function mean(values: number[]): number {
  if (values.length === 0) return 0;
  return sum(values) / values.length;
}

function sum(values: number[]): number {
  return values.reduce((acc, val) => acc + val, 0);
}

function standardDeviation(values: number[]): number {
  if (values.length === 0) return 0;
  
  const avg = mean(values);
  const squaredDiffs = values.map(val => Math.pow(val - avg, 2));
  const variance = mean(squaredDiffs);
  
  return Math.sqrt(variance);
}

// Risk analysis functions
export function calculateValueAtRisk(returns: number[], confidence: number = 0.95): number {
  if (returns.length === 0) return 0;
  
  const sortedReturns = [...returns].sort((a, b) => a - b);
  const index = Math.floor((1 - confidence) * sortedReturns.length);
  
  return sortedReturns[index] || 0;
}

export function calculateRiskRewardRatio(trades: Trade[]): number {
  const closedTrades = trades.filter(t => t.status === 'closed');
  const wins = closedTrades.filter(t => t.pnl > 0);
  const losses = closedTrades.filter(t => t.pnl < 0);
  
  if (losses.length === 0) return wins.length > 0 ? Infinity : 0;
  
  const avgWin = mean(wins.map(t => t.pnl));
  const avgLoss = Math.abs(mean(losses.map(t => t.pnl)));
  
  return avgWin / avgLoss;
}

// Mock data generator for development
export function generateMockTrades(count: number = 50): Trade[] {
  const symbols = ['AAPL', 'MSFT', 'GOOGL', 'AMZN', 'TSLA', 'NVDA', 'SPY', 'QQQ'];
  const strategies: Trade['strategy'][] = ['momentum', 'mean-reversion', 'ml-prediction'];
  const trades: Trade[] = [];
  
  for (let i = 0; i < count; i++) {
    const symbol = symbols[Math.floor(Math.random() * symbols.length)];
    const strategy = strategies[Math.floor(Math.random() * strategies.length)];
    const entryPrice = 100 + Math.random() * 200;
    const direction = Math.random() > 0.5 ? 'BUY' : 'SELL';
    const quantity = Math.floor(Math.random() * 100) + 1;
    
    // 60% win rate with some variation by strategy
    const winRateByStrategy = {
      'momentum': 0.65,
      'mean-reversion': 0.55,
      'ml-prediction': 0.70
    };
    
    const isWin = Math.random() < winRateByStrategy[strategy];
    const priceChange = isWin 
      ? (Math.random() * 0.05 + 0.01) // 1-6% gain
      : -(Math.random() * 0.04 + 0.01); // 1-5% loss
    
    const exitPrice = entryPrice * (1 + priceChange);
    const pnl = direction === 'BUY' 
      ? (exitPrice - entryPrice) * quantity
      : (entryPrice - exitPrice) * quantity;
    
    const entryTime = new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000);
    const exitTime = new Date(entryTime.getTime() + Math.random() * 24 * 60 * 60 * 1000);
    
    trades.push({
      id: `trade-${i}`,
      symbol,
      direction,
      quantity,
      entryPrice,
      exitPrice,
      entryTime: entryTime.toISOString(),
      exitTime: exitTime.toISOString(),
      pnl,
      pnlPercent: (pnl / (entryPrice * quantity)) * 100,
      strategy,
      status: 'closed'
    });
  }
  
  return trades.sort((a, b) => new Date(a.entryTime).getTime() - new Date(b.entryTime).getTime());
}