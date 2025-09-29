// Trading API functions - Isolated from main Atomic platform
// This will eventually connect to a separate "trading" database schema

export interface TradingSignal {
  id: string;
  symbol: string;
  action: 'BUY' | 'SELL' | 'HOLD';
  confidence: number;
  target_price?: number;
  stop_loss?: number;
  reasoning_simple: string;
  reasoning_academic: string;
  created_at: string;
  expires_at: string;
}

export interface Position {
  id: string;
  symbol: string;
  quantity: number;
  entry_price: number;
  current_price: number;
  unrealized_pnl: number;
  unrealized_pnl_percent: number;
  position_type: 'stock' | 'option' | 'crypto';
  opened_at: string;
}

export interface PerformanceMetrics {
  total_pnl: number;
  daily_pnl: number;
  daily_pnl_percent: number;
  win_rate: number;
  profit_factor: number;
  sharpe_ratio: number;
  total_trades: number;
  portfolio_value: number;
}

// Mock data functions - will be replaced with real API calls
export const getTradingSignals = async (): Promise<TradingSignal[]> => {
  // Mock implementation
  return [
    {
      id: '1',
      symbol: 'AAPL',
      action: 'BUY',
      confidence: 87,
      target_price: 195.50,
      reasoning_simple: 'Strong upward momentum detected',
      reasoning_academic: 'RSI oversold condition with bullish divergence on MACD histogram',
      created_at: new Date().toISOString(),
      expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
    },
  ];
};

export const getPositions = async (): Promise<Position[]> => {
  // Mock implementation
  return [
    {
      id: '1',
      symbol: 'SPY',
      quantity: 100,
      entry_price: 412.30,
      current_price: 413.57,
      unrealized_pnl: 127.45,
      unrealized_pnl_percent: 0.31,
      position_type: 'stock',
      opened_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    },
  ];
};

export const getPerformanceMetrics = async (): Promise<PerformanceMetrics> => {
  // Mock implementation
  return {
    total_pnl: 8047.32,
    daily_pnl: 342.18,
    daily_pnl_percent: 1.34,
    win_rate: 78.4,
    profit_factor: 2.3,
    sharpe_ratio: 1.47,
    total_trades: 47,
    portfolio_value: 25847.32,
  };
};

// Account management functions
export const getAccountBalance = async (): Promise<number> => {
  return 25847.32;
};

export const placeTrade = async (trade: {
  symbol: string;
  action: 'BUY' | 'SELL';
  quantity: number;
  order_type: 'MARKET' | 'LIMIT';
  price?: number;
}): Promise<{ success: boolean; order_id?: string; error?: string }> => {
  // Mock implementation - will require proper order management
  console.log('Trade placed:', trade);
  return { success: true, order_id: 'mock-order-' + Date.now() };
};

// Risk management functions
export const calculatePositionSize = (
  accountBalance: number,
  riskPercent: number,
  entryPrice: number,
  stopLoss: number
): number => {
  const riskAmount = accountBalance * (riskPercent / 100);
  const riskPerShare = Math.abs(entryPrice - stopLoss);
  return Math.floor(riskAmount / riskPerShare);
};

export const validateTrade = (trade: {
  symbol: string;
  quantity: number;
  price: number;
}): { valid: boolean; errors: string[] } => {
  const errors: string[] = [];
  
  if (!trade.symbol || trade.symbol.length === 0) {
    errors.push('Symbol is required');
  }
  
  if (trade.quantity <= 0) {
    errors.push('Quantity must be positive');
  }
  
  if (trade.price <= 0) {
    errors.push('Price must be positive');
  }
  
  return {
    valid: errors.length === 0,
    errors,
  };
};