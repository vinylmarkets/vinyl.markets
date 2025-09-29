import React, { useState, useEffect } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, TrendingDown, Activity, BarChart3 } from "lucide-react";
import { ComposedChart, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Bar, Line } from 'recharts';

interface Position {
  symbol: string;
  quantity: number;
  averageCost: number;
  side: 'long' | 'short';
}

interface CandlestickChartProps {
  positions: Position[];
}

interface CandleDataPoint {
  time: string;
  timeMs: number;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
  sma20?: number;
  sma50?: number;
}

const SYMBOLS = [
  { symbol: 'AAPL', name: 'Apple Inc.', price: 182.30, change: 2.45, changePercent: 1.36 },
  { symbol: 'NVDA', name: 'NVIDIA Corp.', price: 438.50, change: -5.20, changePercent: -1.17 },
  { symbol: 'TSLA', name: 'Tesla Inc.', price: 218.45, change: 8.75, changePercent: 4.17 },
  { symbol: 'MSFT', name: 'Microsoft Corp.', price: 348.75, change: 1.85, changePercent: 0.53 },
  { symbol: 'GOOGL', name: 'Alphabet Inc.', price: 142.50, change: -0.85, changePercent: -0.59 }
];

// Custom Candlestick component for Recharts
const Candlestick = (props: any) => {
  const { payload, x, y, width, height } = props;
  if (!payload) return null;

  const { open, high, low, close } = payload;
  const isGreen = close > open;
  const color = isGreen ? '#22c55e' : '#ef4444';
  
  const bodyHeight = Math.abs(close - open);
  const bodyY = Math.min(open, close);
  const wickWidth = 1;
  
  // Convert price to pixel coordinates
  const priceToY = (price: number) => {
    const range = payload.high - payload.low;
    const ratio = (payload.high - price) / range;
    return y + ratio * height;
  };

  const openY = priceToY(open);
  const closeY = priceToY(close);
  const highY = priceToY(high);
  const lowY = priceToY(low);
  const bodyYPos = Math.min(openY, closeY);
  const bodyHeightPx = Math.abs(openY - closeY);

  return (
    <g>
      {/* Wick lines */}
      <line
        x1={x + width / 2}
        y1={highY}
        x2={x + width / 2}
        y2={lowY}
        stroke={color}
        strokeWidth={wickWidth}
      />
      {/* Body rectangle */}
      <rect
        x={x + width * 0.2}
        y={bodyYPos}
        width={width * 0.6}
        height={Math.max(bodyHeightPx, 1)}
        fill={color}
        stroke={color}
      />
    </g>
  );
};

export const CandlestickChart: React.FC<CandlestickChartProps> = ({ positions }) => {
  const [selectedSymbol, setSelectedSymbol] = useState('AAPL');
  const [currentPrice, setCurrentPrice] = useState(182.30);
  const [priceDirection, setPriceDirection] = useState<'up' | 'down'>('up');
  const [chartData, setChartData] = useState<CandleDataPoint[]>([]);
  const [timeframe, setTimeframe] = useState('15m');

  // Generate mock data for the selected symbol
  const generateMockData = (symbol: string) => {
    const symbolData = SYMBOLS.find(s => s.symbol === symbol);
    const basePrice = symbolData?.price || 100;
    
    const data: CandleDataPoint[] = [];
    const now = new Date();
    const startTime = new Date(now.getTime() - 24 * 60 * 60 * 1000); // 24 hours ago
    
    let price = basePrice * 0.95; // Start 5% below current
    const prices: number[] = [];
    
    // Generate 96 candles (15-minute intervals for 24 hours)
    for (let i = 0; i < 96; i++) {
      const time = new Date(startTime.getTime() + i * 15 * 60 * 1000);
      
      // Random price movement
      const volatility = 0.01;
      const change = (Math.random() - 0.5) * volatility * price;
      price += change;
      
      const open = i === 0 ? price : data[i - 1].close;
      const variation = price * 0.005;
      const high = price + Math.random() * variation;
      const low = price - Math.random() * variation;
      const close = price + (Math.random() - 0.5) * variation * 0.5;
      
      const finalOpen = open;
      const finalHigh = Math.max(open, high, close);
      const finalLow = Math.min(open, low, close);
      const finalClose = close;
      
      prices.push(finalClose);
      
      // Volume data
      const volume = Math.random() * 1000000 + 100000;
      
      let sma20, sma50;
      
      // Moving averages
      if (i >= 19) {
        sma20 = prices.slice(i - 19, i + 1).reduce((a, b) => a + b, 0) / 20;
      }
      
      if (i >= 49) {
        sma50 = prices.slice(i - 49, i + 1).reduce((a, b) => a + b, 0) / 50;
      }
      
      data.push({
        time: time.toLocaleTimeString('en-US', { 
          hour: '2-digit', 
          minute: '2-digit',
          hour12: false 
        }),
        timeMs: time.getTime(),
        open: finalOpen,
        high: finalHigh,
        low: finalLow,
        close: finalClose,
        volume: volume,
        sma20,
        sma50
      });
    }
    
    return data;
  };

  // Initialize and update chart data
  useEffect(() => {
    const data = generateMockData(selectedSymbol);
    setChartData(data);
    
    // Set current price to latest close
    if (data.length > 0) {
      setCurrentPrice(data[data.length - 1].close);
    }
  }, [selectedSymbol]);

  // Simulate real-time price updates
  useEffect(() => {
    const interval = setInterval(() => {
      setChartData(prevData => {
        if (prevData.length === 0) return prevData;
        
        const lastCandle = prevData[prevData.length - 1];
        const newPrice = lastCandle.close + (Math.random() - 0.5) * 2;
        const direction = newPrice > currentPrice ? 'up' : 'down';
        
        setCurrentPrice(newPrice);
        setPriceDirection(direction);
        
        // Update the last candle with new close price
        const updatedData = [...prevData];
        updatedData[updatedData.length - 1] = {
          ...lastCandle,
          close: newPrice,
          high: Math.max(lastCandle.high, newPrice),
          low: Math.min(lastCandle.low, newPrice)
        };
        
        return updatedData;
      });
    }, 2000);

    return () => clearInterval(interval);
  }, [currentPrice]);

  const selectedSymbolData = SYMBOLS.find(s => s.symbol === selectedSymbol);
  const currentCandle = chartData.length > 0 ? chartData[chartData.length - 1] : null;

  // Custom tooltip
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-card border border-border rounded-lg p-3 shadow-lg">
          <p className="text-sm font-medium mb-2">{`Time: ${label}`}</p>
          <div className="space-y-1 text-xs">
            <p className="text-muted-foreground">O: <span className="text-foreground">${data.open.toFixed(2)}</span></p>
            <p className="text-muted-foreground">H: <span className="text-success">${data.high.toFixed(2)}</span></p>
            <p className="text-muted-foreground">L: <span className="text-destructive">${data.low.toFixed(2)}</span></p>
            <p className="text-muted-foreground">C: <span className="text-foreground">${data.close.toFixed(2)}</span></p>
            <p className="text-muted-foreground">Vol: <span className="text-foreground">{(data.volume / 1000000).toFixed(2)}M</span></p>
            {data.sma20 && <p className="text-muted-foreground">SMA20: <span className="text-amber-500">${data.sma20.toFixed(2)}</span></p>}
            {data.sma50 && <p className="text-muted-foreground">SMA50: <span className="text-violet-500">${data.sma50.toFixed(2)}</span></p>}
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <Card className="shadow-card hover:shadow-card-hover transition-shadow duration-200 h-full">
      <CardContent className="p-4 h-full flex flex-col">
        {/* Chart Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-4">
            <Select value={selectedSymbol} onValueChange={setSelectedSymbol}>
              <SelectTrigger className="w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {SYMBOLS.map((symbol) => (
                  <SelectItem key={symbol.symbol} value={symbol.symbol}>
                    <div className="flex items-center justify-between w-full">
                      <div>
                        <span className="font-medium">{symbol.symbol}</span>
                        <span className="text-xs text-muted-foreground ml-2">{symbol.name}</span>
                      </div>
                      <div className="flex items-center space-x-2 ml-4">
                        <span className="text-sm">${symbol.price.toFixed(2)}</span>
                        <Badge variant={symbol.change >= 0 ? "default" : "destructive"} className="text-xs">
                          {symbol.change >= 0 ? '+' : ''}{symbol.changePercent.toFixed(2)}%
                        </Badge>
                      </div>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Live Price Display */}
            <div className="flex items-center space-x-2">
              <div className={`flex items-center space-x-1 transition-all duration-300 ${
                priceDirection === 'up' ? 'text-success' : 'text-destructive'
              }`}>
                {priceDirection === 'up' ? (
                  <TrendingUp className="h-4 w-4" />
                ) : (
                  <TrendingDown className="h-4 w-4" />
                )}
                <span className="text-lg font-bold">
                  ${currentPrice.toFixed(2)}
                </span>
              </div>
              <div className={`h-2 w-2 rounded-full animate-pulse ${
                priceDirection === 'up' ? 'bg-success' : 'bg-destructive'
              }`} />
            </div>
          </div>

          {/* Chart Controls */}
          <div className="flex items-center space-x-2">
            <Button 
              variant={timeframe === '1D' ? 'default' : 'outline'} 
              size="sm"
              onClick={() => setTimeframe('1D')}
            >
              1D
            </Button>
            <Button 
              variant={timeframe === '5D' ? 'default' : 'outline'} 
              size="sm"
              onClick={() => setTimeframe('5D')}
            >
              5D
            </Button>
            <Button 
              variant={timeframe === '15m' ? 'default' : 'outline'} 
              size="sm"
              onClick={() => setTimeframe('15m')}
            >
              15m
            </Button>
            <Button 
              variant={timeframe === '1h' ? 'default' : 'outline'} 
              size="sm"
              onClick={() => setTimeframe('1h')}
            >
              1h
            </Button>
          </div>
        </div>

        {/* OHLC Info */}
        {currentCandle && (
          <div className="flex items-center space-x-6 mb-3 text-sm">
            <div className="flex items-center space-x-1">
              <span className="text-muted-foreground">O:</span>
              <span className="font-medium">${currentCandle.open.toFixed(2)}</span>
            </div>
            <div className="flex items-center space-x-1">
              <span className="text-muted-foreground">H:</span>
              <span className="font-medium text-success">${currentCandle.high.toFixed(2)}</span>
            </div>
            <div className="flex items-center space-x-1">
              <span className="text-muted-foreground">L:</span>
              <span className="font-medium text-destructive">${currentCandle.low.toFixed(2)}</span>
            </div>
            <div className="flex items-center space-x-1">
              <span className="text-muted-foreground">C:</span>
              <span className="font-medium">${currentCandle.close.toFixed(2)}</span>
            </div>
            <div className="flex items-center space-x-1">
              <Activity className="h-3 w-3 text-primary" />
              <span className="text-muted-foreground">{timeframe}</span>
            </div>
          </div>
        )}

        {/* Chart Container */}
        <div className="flex-1 min-h-[400px] rounded-lg border bg-card p-4">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis 
                dataKey="time" 
                tick={{ fontSize: 10 }}
                interval="preserveStartEnd"
              />
              <YAxis 
                domain={['dataMin - 5', 'dataMax + 5']}
                tick={{ fontSize: 10 }}
              />
              <Tooltip content={<CustomTooltip />} />
              
              {/* Volume bars */}
              <Bar 
                dataKey="volume" 
                fill="#60a5fa" 
                opacity={0.3}
                yAxisId="volume"
              />
              
              {/* Moving averages */}
              <Line 
                type="monotone" 
                dataKey="sma20" 
                stroke="#f59e0b" 
                strokeWidth={2}
                dot={false}
                connectNulls={false}
              />
              <Line 
                type="monotone" 
                dataKey="sma50" 
                stroke="#8b5cf6" 
                strokeWidth={2}
                dot={false}
                connectNulls={false}
              />
            </ComposedChart>
          </ResponsiveContainer>
        </div>

        {/* Position markers overlay */}
        {positions.filter(p => p.symbol === selectedSymbol).length > 0 && (
          <div className="absolute inset-0 pointer-events-none">
            {positions.filter(p => p.symbol === selectedSymbol).map(position => (
              <div 
                key={position.symbol}
                className={`absolute left-0 right-0 h-0.5 ${
                  position.side === 'long' ? 'bg-success' : 'bg-destructive'
                } opacity-80`}
                style={{ 
                  top: '50%', // This would need calculation based on price position
                  borderStyle: 'dashed'
                }}
              >
                <span className={`absolute right-2 -top-2 text-xs px-1 rounded ${
                  position.side === 'long' ? 'bg-success text-white' : 'bg-destructive text-white'
                }`}>
                  {position.side.toUpperCase()} @ ${position.averageCost.toFixed(2)}
                </span>
              </div>
            ))}
          </div>
        )}

        {/* Legend */}
        <div className="flex items-center justify-center space-x-6 mt-3 text-xs">
          <div className="flex items-center space-x-1">
            <BarChart3 className="h-3 w-3 text-green-500" />
            <span className="text-muted-foreground">Candlesticks</span>
          </div>
          <div className="flex items-center space-x-1">
            <div className="w-3 h-0.5 bg-amber-500"></div>
            <span className="text-muted-foreground">SMA 20</span>
          </div>
          <div className="flex items-center space-x-1">
            <div className="w-3 h-0.5 bg-violet-500"></div>
            <span className="text-muted-foreground">SMA 50</span>
          </div>
          <div className="flex items-center space-x-1">
            <div className="w-3 h-0.5 bg-blue-400 opacity-60"></div>
            <span className="text-muted-foreground">Volume</span>
          </div>
          {positions.filter(p => p.symbol === selectedSymbol).map(position => (
            <div key={position.symbol} className="flex items-center space-x-1">
              <div className={`w-3 h-0.5 ${position.side === 'long' ? 'bg-success' : 'bg-destructive'}`}></div>
              <span className="text-muted-foreground">
                {position.side.toUpperCase()} Position
              </span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};