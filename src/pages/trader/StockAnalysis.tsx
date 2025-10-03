import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  useStockQuote, 
  useStockDetails, 
  useStockChart, 
  calculateRSI,
  calculateSMA
} from '@/hooks/useStockData';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ArrowLeft, TrendingUp, TrendingDown, AlertCircle } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { AreaChart, Area, ResponsiveContainer, XAxis, YAxis, Tooltip } from 'recharts';

export default function StockAnalysis() {
  const { symbol } = useParams();
  const navigate = useNavigate();
  const [timeframe, setTimeframe] = useState('1D');

  console.log('🔍 StockAnalysis rendering for symbol:', symbol);

  const { data: quote, isLoading: quoteLoading, error: quoteError } = useStockQuote(symbol!);
  const { data: details, isLoading: detailsLoading } = useStockDetails(symbol!);
  const { data: chartData, isLoading: chartLoading } = useStockChart(symbol!, timeframe);

  console.log('📊 Stock data:', { quote, details, quoteLoading, detailsLoading });

  if (quoteLoading || detailsLoading) {
    return <StockAnalysisSkeleton />;
  }

  if (quoteError || !quote) {
    return (
      <div className="p-6 bg-[#0A0A0A] min-h-screen">
        <Button variant="ghost" onClick={() => navigate('/trader')} className="text-gray-400 mb-6">
          <ArrowLeft size={16} className="mr-2" />
          Back
        </Button>
        <Card className="bg-[#1A1A1A] border-[#2A2A2A] p-12">
          <div className="text-center">
            <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-white mb-2">Symbol not found</h2>
            <p className="text-gray-400 mb-4">"{symbol}" doesn't exist or data is unavailable</p>
            <p className="text-sm text-gray-500 mb-6">Error: {quoteError?.message}</p>
            <Button onClick={() => navigate('/trader')}>Back to Dashboard</Button>
          </div>
        </Card>
      </div>
    );
  }

  const currentPrice = quote.day?.c || quote.prevDay?.c || 0;
  const previousClose = quote.prevDay?.c || 0;
  const change = currentPrice - previousClose;
  const changePercent = previousClose ? (change / previousClose) * 100 : 0;
  const isPositive = change >= 0;

  // Calculate technical indicators
  const closes = chartData?.map(d => d.close) || [];
  const rsi = closes.length >= 15 ? calculateRSI(closes) : 50;
  const sma20 = closes.length >= 20 ? calculateSMA(closes, 20) : currentPrice;
  const sma50 = closes.length >= 50 ? calculateSMA(closes, 50) : currentPrice;

  return (
    <div className="p-6 space-y-6 bg-[#0A0A0A] min-h-screen">
      <Button variant="ghost" onClick={() => navigate('/trader')} className="text-gray-400 hover:text-white">
        <ArrowLeft size={16} className="mr-2" />
        Back to Dashboard
      </Button>

      <Card className="bg-[#1A1A1A] border-[#2A2A2A] p-6">
        <div className="flex items-start justify-between mb-4">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-3xl font-bold text-white">{symbol?.toUpperCase()}</h1>
              <Badge variant="default">Stock</Badge>
            </div>
            <p className="text-gray-400">{details?.name || 'Loading...'}</p>
          </div>
          <div className="text-right">
            <p className="text-4xl font-bold text-white mb-1">${currentPrice.toFixed(2)}</p>
            <div className="flex items-center justify-end gap-2">
              {isPositive ? <TrendingUp className="w-5 h-5 text-[#0AEF80]" /> : <TrendingDown className="w-5 h-5 text-[#FF3B69]" />}
              <span className={`text-lg font-semibold ${isPositive ? 'text-[#0AEF80]' : 'text-[#FF3B69]'}`}>
                {isPositive ? '+' : ''}{change.toFixed(2)} ({isPositive ? '+' : ''}{changePercent.toFixed(2)}%)
              </span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-4 gap-4 pt-4 border-t border-[#2A2A2A]">
          <StatItem label="Open" value={`$${(quote.day?.o || 0).toFixed(2)}`} />
          <StatItem label="High" value={`$${(quote.day?.h || 0).toFixed(2)}`} />
          <StatItem label="Low" value={`$${(quote.day?.l || 0).toFixed(2)}`} />
          <StatItem label="Volume" value={(quote.day?.v || 0).toLocaleString()} />
        </div>
      </Card>

      <Card className="bg-[#1A1A1A] border-[#2A2A2A] p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-white">Price Chart</h2>
          <div className="flex gap-2">
            {['1D', '5D', '1M', '3M', '1Y'].map(tf => (
              <Button
                key={tf}
                variant={timeframe === tf ? 'default' : 'outline'}
                size="sm"
                onClick={() => setTimeframe(tf)}
                className={timeframe === tf ? '' : 'border-[#2A2A2A] text-gray-400'}
              >
                {tf}
              </Button>
            ))}
          </div>
        </div>

        {chartLoading ? (
          <Skeleton className="h-80 bg-[#0A0A0A]" />
        ) : !chartData || chartData.length === 0 ? (
          <div className="h-80 flex items-center justify-center bg-[#0A0A0A] rounded-lg">
            <p className="text-gray-500">Chart data unavailable</p>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={400}>
            <AreaChart data={chartData.map(d => ({ time: d.time, price: d.close }))}>
              <defs>
                <linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#0AEF80" stopOpacity={0.4} />
                  <stop offset="100%" stopColor="#0AEF80" stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis dataKey="time" stroke="#2A2A2A" tick={{ fill: '#666' }} />
              <YAxis stroke="#2A2A2A" tick={{ fill: '#666' }} tickFormatter={(v) => `$${v.toFixed(2)}`} />
              <Tooltip contentStyle={{ backgroundColor: '#1A1A1A', border: '1px solid #2A2A2A', borderRadius: '8px', color: '#fff' }} />
              <Area type="monotone" dataKey="price" stroke="#0AEF80" strokeWidth={2} fill="url(#colorPrice)" />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </Card>

      <Tabs defaultValue="indicators">
        <TabsList className="bg-[#1A1A1A] border border-[#2A2A2A]">
          <TabsTrigger value="indicators">Technical Indicators</TabsTrigger>
          <TabsTrigger value="company">Company Info</TabsTrigger>
        </TabsList>

        <TabsContent value="indicators">
          <div className="grid grid-cols-3 gap-4">
            <Card className="bg-[#1A1A1A] border-[#2A2A2A] p-6">
              <p className="text-sm text-gray-400 mb-2">RSI (14)</p>
              <p className="text-3xl font-bold text-white mb-2">{rsi.toFixed(2)}</p>
              <Badge variant={rsi > 70 ? 'destructive' : rsi < 30 ? 'default' : 'secondary'}>
                {rsi > 70 ? 'Overbought' : rsi < 30 ? 'Oversold' : 'Neutral'}
              </Badge>
            </Card>
            <Card className="bg-[#1A1A1A] border-[#2A2A2A] p-6">
              <p className="text-sm text-gray-400 mb-2">SMA (20)</p>
              <p className="text-3xl font-bold text-white mb-2">${sma20.toFixed(2)}</p>
              <p className="text-xs text-gray-500">{currentPrice > sma20 ? 'Above' : 'Below'} average</p>
            </Card>
            <Card className="bg-[#1A1A1A] border-[#2A2A2A] p-6">
              <p className="text-sm text-gray-400 mb-2">SMA (50)</p>
              <p className="text-3xl font-bold text-white mb-2">${sma50.toFixed(2)}</p>
              <p className="text-xs text-gray-500">{currentPrice > sma50 ? 'Above' : 'Below'} average</p>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="company">
          <Card className="bg-[#1A1A1A] border-[#2A2A2A] p-6">
            {detailsLoading ? (
              <Skeleton className="h-24 bg-[#0A0A0A]" />
            ) : (
              <div className="space-y-4">
                <p className="text-gray-400">{details?.description || 'No description available'}</p>
                <div className="grid grid-cols-2 gap-4">
                  <div><span className="text-gray-500 text-sm">Industry:</span> <span className="text-white">{details?.sic_description || 'N/A'}</span></div>
                  <div><span className="text-gray-500 text-sm">Market Cap:</span> <span className="text-white">{details?.market_cap ? `$${(details.market_cap / 1e9).toFixed(2)}B` : 'N/A'}</span></div>
                </div>
              </div>
            )}
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

function StatItem({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs text-gray-500 mb-1">{label}</p>
      <p className="text-sm font-semibold text-white">{value}</p>
    </div>
  );
}

function StockAnalysisSkeleton() {
  return (
    <div className="p-6 space-y-6 bg-[#0A0A0A] min-h-screen">
      <Skeleton className="h-10 w-32 bg-[#1A1A1A]" />
      <Skeleton className="h-48 bg-[#1A1A1A] rounded-2xl" />
      <Skeleton className="h-96 bg-[#1A1A1A] rounded-2xl" />
    </div>
  );
}
