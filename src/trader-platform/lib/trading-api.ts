// Trading API functions - Real data integration with Supabase Edge Functions

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

export interface TradeHistory {
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
  total_pnl: number;
  daily_pnl: number;
  daily_pnl_percent: number;
  win_rate: number;
  profit_factor: number;
  sharpe_ratio: number;
  total_trades: number;
  portfolio_value: number;
}

// Real API functions using Supabase Edge Functions
export const getTradingSignals = async (): Promise<TradingSignal[]> => {
  try {
    const response = await fetch('/functions/v1/trader-signals', {
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    if (!response.ok) {
      console.warn('Failed to fetch trading signals, using empty array');
      return [];
    }
    
    const data = await response.json();
    return data.signals || [];
  } catch (error) {
    console.error('Error fetching trading signals:', error);
    return [];
  }
};

export const getPositions = async (): Promise<Position[]> => {
  try {
    const response = await fetch('/functions/v1/trader-positions', {
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    if (!response.ok) {
      console.warn('Failed to fetch positions, using empty array');
      return [];
    }
    
    const data = await response.json();
    return data.positions || [];
  } catch (error) {
    console.error('Error fetching positions:', error);
    return [];
  }
};

export const getTradeHistory = async (): Promise<TradeHistory[]> => {
  try {
    const response = await fetch('/functions/v1/trader-positions', {
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    if (!response.ok) {
      console.warn('Failed to fetch trade history, using empty array');
      return [];
    }
    
    const data = await response.json();
    // Convert recent trades to our TradeHistory format
    const recentTrades = data.recentTrades || [];
    
    return recentTrades.map((trade: any) => ({
      id: `trade-${Date.now()}-${Math.random()}`,
      symbol: trade.symbol,
      direction: trade.action,
      quantity: trade.quantity,
      entryPrice: trade.price,
      exitPrice: trade.price, // For closed trades
      entryTime: trade.timestamp,
      exitTime: trade.timestamp, // Assume closed for recent trades
      pnl: (trade.price - trade.price) * trade.quantity, // This would be calculated properly
      pnlPercent: 0, // This would be calculated properly  
      strategy: 'momentum' as const, // Default strategy
      status: 'closed' as const
    }));
  } catch (error) {
    console.error('Error fetching trade history:', error);
    return [];
  }
};

export const getPerformanceMetrics = async (): Promise<PerformanceMetrics> => {
  try {
    const response = await fetch('/functions/v1/trader-positions', {
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    if (!response.ok) {
      return getEmptyPerformanceMetrics();
    }
    
    const data = await response.json();
    
    return {
      total_pnl: data.totalPnL || 0,
      daily_pnl: 0, // Would need to be calculated
      daily_pnl_percent: 0,
      win_rate: 0, // Would need to be calculated from trade history
      profit_factor: 0,
      sharpe_ratio: 0,
      total_trades: 0,
      portfolio_value: data.totalValue || 100000,
    };
  } catch (error) {
    console.error('Error fetching performance metrics:', error);
    return getEmptyPerformanceMetrics();
  }
};

function getEmptyPerformanceMetrics(): PerformanceMetrics {
  return {
    total_pnl: 0,
    daily_pnl: 0,
    daily_pnl_percent: 0,
    win_rate: 0,
    profit_factor: 0,
    sharpe_ratio: 0,
    total_trades: 0,
    portfolio_value: 100000,
  };
}

// Account management functions
export const getAccountBalance = async (): Promise<number> => {
  try {
    const response = await fetch('/functions/v1/trader-positions');
    if (!response.ok) return 100000; // Default balance
    
    const data = await response.json();
    return data.totalValue || 100000;
  } catch (error) {
    console.error('Error fetching account balance:', error);
    return 100000;
  }
};

export const placeTrade = async (trade: {
  symbol: string;
  action: 'BUY' | 'SELL';
  quantity: number;
  order_type: 'MARKET' | 'LIMIT';
  price?: number;
}): Promise<{ success: boolean; order_id?: string; error?: string }> => {
  try {
    const response = await fetch('/functions/v1/execute-trade', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(trade),
    });
    
    if (!response.ok) {
      return { success: false, error: 'Failed to place trade' };
    }
    
    const data = await response.json();
    return { success: true, order_id: data.order_id };
  } catch (error) {
    console.error('Error placing trade:', error);
    return { success: false, error: 'Network error' };
  }
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