import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  X,
  TrendingUp,
  TrendingDown,
  Settings,
  Layers,
  ChevronDown
} from 'lucide-react';
import { useStockQuote, useStockChart, useRealtimePrice } from '@/hooks/useStockData';
import { ChartSkeleton } from './ChartSkeleton';
import {
  ComposedChart,
  Area,
  Bar,
  ResponsiveContainer,
  XAxis,
  YAxis,
  Tooltip
} from 'recharts';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface ChartFocusProps {
  symbol: string;
  onClose: () => void;
}

export function ChartFocus({ symbol, onClose }: ChartFocusProps) {
  const [timeframe, setTimeframe] = useState('1D');
  const [showVolume, setShowVolume] = useState(true);
  const [showIndicators, setShowIndicators] = useState(false);
  const [controlsVisible, setControlsVisible] = useState(true);

  // Fetch real data
  const { data: quote, isLoading: quoteLoading } = useStockQuote(symbol);
  const { data: chartData, isLoading: chartLoading } = useStockChart(symbol, timeframe);
  const { price: realtimePrice } = useRealtimePrice(symbol);

  // Calculate values from real data
  const currentPrice = realtimePrice || quote?.day?.c || quote?.prevDay?.c || 0;
  const previousClose = quote?.prevDay?.c || 0;
  const change = currentPrice - previousClose;
  const changePercent = previousClose ? (change / previousClose) * 100 : 0;
  const isPositive = change >= 0;

  const formattedChartData = chartData?.map(bar => ({
    time: bar.time,
    price: bar.close,
    volume: bar.volume,
    open: bar.open,
    high: bar.high,
    low: bar.low
  })) || [];

  // Handle escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [onClose]);

  // Auto-hide controls after 3 seconds of inactivity
  useEffect(() => {
    let timeout: NodeJS.Timeout;
    const showControls = () => {
      setControlsVisible(true);
      clearTimeout(timeout);
      timeout = setTimeout(() => setControlsVisible(false), 3000);
    };

    window.addEventListener('mousemove', showControls);
    showControls();

    return () => {
      window.removeEventListener('mousemove', showControls);
      clearTimeout(timeout);
    };
  }, []);

  // Show loading state
  if (quoteLoading || chartLoading) {
    return (
      <div className="fixed inset-0 bg-[#0A0A0A] z-50 flex items-center justify-center">
        <ChartSkeleton />
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-[#0A0A0A] z-50 overflow-hidden animate-fade-in">
      {/* Header - Persistent */}
      <div 
        className={`absolute top-0 left-0 right-0 z-10 transition-all duration-300 ${
          controlsVisible ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-full'
        }`}
      >
        <div className="bg-gradient-to-b from-[#0A0A0A] via-[#0A0A0A]/90 to-transparent p-4">
          <div className="flex items-center justify-between max-w-screen-2xl mx-auto">
            {/* Left: Symbol & Price */}
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-3">
                <h1 className="text-2xl font-bold text-white">{symbol}</h1>
                <Badge variant="outline" className="border-[#2A2A2A]">NASDAQ</Badge>
              </div>
              
              <div className="flex items-center gap-3">
                <span className="text-3xl font-mono font-bold text-white">
                  ${currentPrice.toFixed(2)}
                </span>
                <div className="flex items-center gap-1.5">
                  {isPositive ? (
                    <TrendingUp className="w-5 h-5 text-[#0AEF80]" />
                  ) : (
                    <TrendingDown className="w-5 h-5 text-[#FF3B69]" />
                  )}
                  <span className={`text-lg font-semibold ${isPositive ? 'text-[#0AEF80]' : 'text-[#FF3B69]'}`}>
                    {isPositive ? '+' : ''}{change.toFixed(2)} ({isPositive ? '+' : ''}{changePercent}%)
                  </span>
                </div>
              </div>
            </div>

            {/* Center: Timeframe Selector */}
            <div className="flex gap-2">
              {['1m', '5m', '15m', '1H', '4H', '1D', '1W', '1M'].map(tf => (
                <Button
                  key={tf}
                  variant={timeframe === tf ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setTimeframe(tf)}
                  className={timeframe === tf 
                    ? 'bg-[#9540FF] text-white' 
                    : 'text-gray-400 hover:text-white hover:bg-[#1A1A1A]'
                  }
                >
                  {tf}
                </Button>
              ))}
            </div>

            {/* Right: Controls */}
            <div className="flex items-center gap-2">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="text-gray-400 hover:text-white">
                    <Layers size={18} className="mr-2" />
                    Indicators
                    <ChevronDown size={14} className="ml-2" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="bg-[#1A1A1A] border-[#2A2A2A]">
                  <DropdownMenuItem className="text-white" onClick={() => setShowIndicators(!showIndicators)}>
                    RSI
                  </DropdownMenuItem>
                  <DropdownMenuItem className="text-white">MACD</DropdownMenuItem>
                  <DropdownMenuItem className="text-white">Bollinger Bands</DropdownMenuItem>
                  <DropdownMenuItem className="text-white">Moving Averages</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => setShowVolume(!showVolume)}
                className={`text-gray-400 hover:text-white ${showVolume ? 'bg-[#1A1A1A]' : ''}`}
              >
                <Layers size={18} className="mr-2" />
                Volume
              </Button>

              <Button variant="ghost" size="icon" className="text-gray-400 hover:text-white">
                <Settings size={18} />
              </Button>

              <div className="w-px h-6 bg-[#2A2A2A] mx-2" />

              <Button 
                variant="ghost" 
                size="icon" 
                onClick={onClose}
                className="text-gray-400 hover:text-white hover:bg-[#FF3B69]/20"
              >
                <X size={20} />
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Chart - Full Screen */}
      <div className="h-full w-full p-4 pt-24">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={formattedChartData}>
            <defs>
              <linearGradient id="focusColorPrice" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#0AEF80" stopOpacity={0.4}/>
                <stop offset="100%" stopColor="#0AEF80" stopOpacity={0}/>
              </linearGradient>
            </defs>
            
            {/* Price Area */}
            <XAxis 
              dataKey="time" 
              stroke="#2A2A2A"
              tick={{ fill: '#666', fontSize: 12 }}
              tickFormatter={(time) => {
                const date = new Date(time);
                return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
              }}
            />
            
            <YAxis 
              yAxisId="price"
              stroke="#2A2A2A"
              tick={{ fill: '#666', fontSize: 12 }}
              tickFormatter={(value) => `$${value.toFixed(2)}`}
              domain={['dataMin - 2', 'dataMax + 2']}
              orientation="right"
            />

            {showVolume && (
              <YAxis 
                yAxisId="volume"
                orientation="left"
                stroke="#2A2A2A"
                tick={{ fill: '#666', fontSize: 12 }}
                tickFormatter={(value) => `${(value / 1000000).toFixed(1)}M`}
              />
            )}
            
            <Tooltip 
              contentStyle={{ 
                backgroundColor: '#1A1A1A', 
                border: '1px solid #2A2A2A',
                borderRadius: '12px',
                padding: '12px',
                color: '#fff'
              }}
              labelFormatter={(time) => {
                const date = new Date(time);
                return date.toLocaleString();
              }}
              formatter={(value: any, name: string) => {
                if (name === 'price') return [`$${value.toFixed(2)}`, 'Price'];
                if (name === 'volume') return [`${(value / 1000000).toFixed(2)}M`, 'Volume'];
                return [value, name];
              }}
            />

            {showVolume && (
              <Bar 
                yAxisId="volume"
                dataKey="volume" 
                fill="#9540FF"
                opacity={0.3}
                radius={[4, 4, 0, 0]}
              />
            )}

            <Area 
              yAxisId="price"
              type="monotone" 
              dataKey="price" 
              stroke="#0AEF80" 
              strokeWidth={2.5}
              fill="url(#focusColorPrice)"
              dot={false}
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>

      {/* Floating Trade Panel - Bottom Right */}
      <div 
        className={`absolute bottom-6 right-6 transition-all duration-300 ${
          controlsVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'
        }`}
      >
        <Card className="bg-[#1A1A1A] border-[#2A2A2A] p-4 rounded-2xl shadow-2xl backdrop-blur-xl bg-opacity-90">
          <div className="flex gap-3">
            <Button className="bg-[#0AEF80] text-black font-semibold hover:bg-[#0AEF80]/90 px-8">
              Buy {symbol}
            </Button>
            <Button className="bg-[#FF3B69] text-white font-semibold hover:bg-[#FF3B69]/90 px-8">
              Sell {symbol}
            </Button>
          </div>
        </Card>
      </div>

      {/* Floating Stats Panel - Bottom Left */}
      <div 
        className={`absolute bottom-6 left-6 transition-all duration-300 ${
          controlsVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'
        }`}
      >
        <Card className="bg-[#1A1A1A] border-[#2A2A2A] p-4 rounded-2xl shadow-2xl backdrop-blur-xl bg-opacity-90">
          <div className="grid grid-cols-4 gap-6">
            <div>
              <p className="text-xs text-gray-500 mb-1">Open</p>
              <p className="text-sm font-semibold text-white">${quote?.day?.o?.toFixed(2) || '--'}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500 mb-1">High</p>
              <p className="text-sm font-semibold text-[#0AEF80]">${quote?.day?.h?.toFixed(2) || '--'}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500 mb-1">Low</p>
              <p className="text-sm font-semibold text-[#FF3B69]">${quote?.day?.l?.toFixed(2) || '--'}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500 mb-1">Volume</p>
              <p className="text-sm font-semibold text-white">
                {quote?.day?.v ? `${(quote.day.v / 1000000).toFixed(1)}M` : '--'}
              </p>
            </div>
          </div>
        </Card>
      </div>

      {/* Exit Hint - Top Right Corner */}
      <div 
        className={`absolute top-6 right-6 transition-all duration-300 ${
          controlsVisible ? 'opacity-50 translate-y-0' : 'opacity-0 -translate-y-4'
        }`}
      >
        <p className="text-xs text-gray-500">Press ESC to exit</p>
      </div>
    </div>
  );
}
