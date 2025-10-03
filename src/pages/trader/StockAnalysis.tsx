import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  useStockQuote, 
  useStockDetails, 
  useStockChart, 
  useStockNews,
  calculateRSI,
  calculateSMA
} from '@/hooks/useStockData';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  ArrowLeft, 
  TrendingUp, 
  TrendingDown,
  Plus,
  ExternalLink
} from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  Tooltip, 
  ResponsiveContainer,
  Area,
  AreaChart
} from 'recharts';
import { format } from 'date-fns';

export default function StockAnalysis() {
  const { symbol } = useParams();
  const navigate = useNavigate();
  const [timeframe, setTimeframe] = useState('1D');

  console.log('🔍 StockAnalysis rendering for symbol:', symbol);

  const { data: quote, isLoading: quoteLoading } = useStockQuote(symbol!);
  const { data: details, isLoading: detailsLoading } = useStockDetails(symbol!);
  const { data: chartData, isLoading: chartLoading } = useStockChart(symbol!, timeframe);
  const { data: news, isLoading: newsLoading } = useStockNews(symbol!);

  console.log('📊 Stock data:', { quote, details, quoteLoading, detailsLoading });

  if (quoteLoading || detailsLoading) {
    return <StockAnalysisSkeleton />;
  }

  if (!quote) {
    return (
      <div className="p-6">
        <Button variant="ghost" onClick={() => navigate('/trader')}>
          <ArrowLeft size={16} className="mr-2" />
          Back
        </Button>
        <div className="text-center py-12">
          <p className="text-white text-xl mb-2">Symbol not found</p>
          <p className="text-gray-400">"{symbol}" doesn't exist or data is unavailable</p>
        </div>
      </div>
    );
  }

  const currentPrice = quote.day?.c || quote.prevDay?.c || 0;
  const previousClose = quote.prevDay?.c || 0;
  const change = currentPrice - previousClose;
  const changePercent = previousClose ? (change / previousClose) * 100 : 0;
  const isPositive = change >= 0;

  // Calculate technical indicators
  const closes = chartData?.map((d: any) => d.c) || [];
  const rsi = calculateRSI(closes);
  const sma20 = calculateSMA(closes, 20);
  const sma50 = calculateSMA(closes, 50);

  return (
    <div className="p-6 space-y-6 bg-[#0A0A0A] min-h-screen">
      {/* Header */}
      <div className="flex items-center justify-between">
        <Button 
          variant="ghost" 
          onClick={() => navigate('/trader')}
          className="text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft size={16} className="mr-2" />
          Back to Dashboard
        </Button>
        <Button className="bg-blue-600 hover:bg-blue-700">
          <Plus size={16} className="mr-2" />
          Add to Watchlist
        </Button>
      </div>

      {/* Stock Header */}
      <Card className="bg-card border-border p-6">
        <div className="flex items-start justify-between mb-4">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-3xl font-bold text-foreground">{symbol?.toUpperCase()}</h1>
              <Badge variant={quote.ticker?.market === 'stocks' ? 'default' : 'secondary'}>
                {quote.ticker?.market || 'Stock'}
              </Badge>
            </div>
            <p className="text-muted-foreground">{details?.name || 'Loading...'}</p>
          </div>
          <div className="text-right">
            <p className="text-4xl font-bold text-foreground mb-1">
              ${currentPrice.toFixed(2)}
            </p>
            <div className="flex items-center justify-end gap-2">
              {isPositive ? (
                <TrendingUp className="w-5 h-5 text-green-500" />
              ) : (
                <TrendingDown className="w-5 h-5 text-red-500" />
              )}
              <span className={`text-lg font-semibold ${isPositive ? 'text-green-500' : 'text-red-500'}`}>
                {isPositive ? '+' : ''}{change.toFixed(2)} ({isPositive ? '+' : ''}{changePercent.toFixed(2)}%)
              </span>
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Previous Close: ${previousClose.toFixed(2)}
            </p>
          </div>
        </div>

        {/* Key Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4 border-t border-border">
          <StatItem label="Open" value={`$${quote.day?.o?.toFixed(2) || 'N/A'}`} />
          <StatItem label="High" value={`$${quote.day?.h?.toFixed(2) || 'N/A'}`} />
          <StatItem label="Low" value={`$${quote.day?.l?.toFixed(2) || 'N/A'}`} />
          <StatItem label="Volume" value={quote.day?.v?.toLocaleString() || 'N/A'} />
        </div>
      </Card>

      {/* Chart */}
      <Card className="bg-card border-border p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-foreground">Price Chart</h2>
          <div className="flex gap-2">
            {['1D', '5D', '1M', '3M', '1Y'].map((tf) => (
              <Button
                key={tf}
                variant={timeframe === tf ? 'default' : 'outline'}
                size="sm"
                onClick={() => setTimeframe(tf)}
                className={timeframe === tf ? '' : 'border-border text-muted-foreground'}
              >
                {tf}
              </Button>
            ))}
          </div>
        </div>

        {chartLoading ? (
          <Skeleton className="h-80 bg-muted" />
        ) : (
          <ResponsiveContainer width="100%" height={400}>
            <AreaChart data={chartData?.map((d: any) => ({
              time: d.t,
              price: d.c,
              volume: d.v
            }))}>
              <defs>
                <linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#0EA5E9" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#0EA5E9" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <XAxis 
                dataKey="time" 
                tickFormatter={(time) => {
                  const date = new Date(time);
                  return timeframe === '1D' 
                    ? format(date, 'HH:mm')
                    : format(date, 'MMM dd');
                }}
                stroke="hsl(var(--muted-foreground))"
              />
              <YAxis 
                domain={['dataMin - 1', 'dataMax + 1']}
                tickFormatter={(value) => `$${value.toFixed(2)}`}
                stroke="hsl(var(--muted-foreground))"
              />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'hsl(var(--card))', 
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '8px',
                  color: 'hsl(var(--foreground))'
                }}
                labelFormatter={(time) => format(new Date(time), 'MMM dd, HH:mm')}
                formatter={(value: any) => [`$${value.toFixed(2)}`, 'Price']}
              />
              <Area 
                type="monotone" 
                dataKey="price" 
                stroke="#0EA5E9" 
                strokeWidth={2}
                fill="url(#colorPrice)"
              />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </Card>

      {/* Tabs */}
      <Tabs defaultValue="indicators" className="space-y-4">
        <TabsList className="bg-muted border border-border">
          <TabsTrigger value="indicators">Technical Indicators</TabsTrigger>
          <TabsTrigger value="company">Company Info</TabsTrigger>
          <TabsTrigger value="news">Recent News</TabsTrigger>
        </TabsList>

        {/* Technical Indicators */}
        <TabsContent value="indicators">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="bg-card border-border p-6">
              <p className="text-sm text-muted-foreground mb-2">RSI (14)</p>
              <p className="text-3xl font-bold text-foreground mb-2">{rsi.toFixed(2)}</p>
              <Badge variant={
                rsi > 70 ? 'destructive' : 
                rsi < 30 ? 'default' : 
                'secondary'
              }>
                {rsi > 70 ? 'Overbought' : rsi < 30 ? 'Oversold' : 'Neutral'}
              </Badge>
            </Card>

            <Card className="bg-card border-border p-6">
              <p className="text-sm text-muted-foreground mb-2">SMA (20)</p>
              <p className="text-3xl font-bold text-foreground mb-2">${sma20.toFixed(2)}</p>
              <p className="text-xs text-muted-foreground">
                {currentPrice > sma20 ? 'Above' : 'Below'} moving average
              </p>
            </Card>

            <Card className="bg-card border-border p-6">
              <p className="text-sm text-muted-foreground mb-2">SMA (50)</p>
              <p className="text-3xl font-bold text-foreground mb-2">${sma50.toFixed(2)}</p>
              <p className="text-xs text-muted-foreground">
                {currentPrice > sma50 ? 'Above' : 'Below'} moving average
              </p>
            </Card>
          </div>

          <Card className="bg-card border-border p-6 mt-4">
            <p className="text-xs text-muted-foreground">
              <strong className="text-foreground">Educational Note:</strong> Technical indicators are mathematical calculations based on historical price data. 
              RSI measures momentum, SMAs show trend direction. These are tools for analysis, not trading recommendations.
            </p>
          </Card>
        </TabsContent>

        {/* Company Info */}
        <TabsContent value="company">
          <Card className="bg-card border-border p-6">
            {detailsLoading ? (
              <div className="space-y-3">
                <Skeleton className="h-6 w-3/4 bg-muted" />
                <Skeleton className="h-20 bg-muted" />
              </div>
            ) : (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold text-foreground mb-2">About</h3>
                  <p className="text-muted-foreground leading-relaxed">
                    {details?.description || 'No description available'}
                  </p>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                  <CompanyStatItem label="Market Cap" value={details?.market_cap ? `$${(details.market_cap / 1e9).toFixed(2)}B` : 'N/A'} />
                  <CompanyStatItem label="Industry" value={details?.sic_description || 'N/A'} />
                  <CompanyStatItem label="Employees" value={details?.total_employees?.toLocaleString() || 'N/A'} />
                  <CompanyStatItem label="HQ" value={details?.address?.city ? `${details.address.city}, ${details.address.state}` : 'N/A'} />
                </div>

                {details?.homepage_url && (
                  <a 
                    href={details.homepage_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 text-blue-400 hover:text-blue-300"
                  >
                    Visit Website <ExternalLink size={14} />
                  </a>
                )}
              </div>
            )}
          </Card>
        </TabsContent>

        {/* News */}
        <TabsContent value="news">
          <Card className="bg-card border-border p-6">
            <h3 className="text-lg font-semibold text-foreground mb-4">Recent News</h3>
            {newsLoading ? (
              <div className="space-y-4">
                {[1,2,3].map(i => (
                  <Skeleton key={i} className="h-24 bg-muted" />
                ))}
              </div>
            ) : (
              <div className="space-y-4">
                {news?.map((article: any) => (
                  <a
                    key={article.id}
                    href={article.article_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block p-4 rounded-lg bg-muted hover:bg-muted/80 transition-colors"
                  >
                    <div className="flex gap-4">
                      {article.image_url && (
                        <img 
                          src={article.image_url} 
                          alt=""
                          className="w-24 h-24 object-cover rounded"
                        />
                      )}
                      <div className="flex-1 min-w-0">
                        <h4 className="text-foreground font-medium mb-1 line-clamp-2">
                          {article.title}
                        </h4>
                        <p className="text-sm text-muted-foreground mb-2 line-clamp-2">
                          {article.description}
                        </p>
                        <div className="flex items-center gap-3 text-xs text-muted-foreground">
                          <span>{article.publisher?.name}</span>
                          <span>•</span>
                          <span>{new Date(article.published_utc).toLocaleDateString()}</span>
                        </div>
                      </div>
                    </div>
                  </a>
                ))}

                {news?.length === 0 && (
                  <p className="text-center text-muted-foreground py-8">No recent news</p>
                )}
              </div>
            )}

            <p className="text-xs text-muted-foreground mt-6 pt-4 border-t border-border">
              News provided by Polygon.io for informational purposes only. Not investment advice.
            </p>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

function StatItem({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs text-muted-foreground mb-1">{label}</p>
      <p className="text-sm font-semibold text-foreground">{value}</p>
    </div>
  );
}

function CompanyStatItem({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs text-muted-foreground mb-1">{label}</p>
      <p className="text-sm font-medium text-foreground">{value}</p>
    </div>
  );
}

function StockAnalysisSkeleton() {
  return (
    <div className="p-6 space-y-6 bg-background min-h-screen">
      <Skeleton className="h-10 w-32 bg-muted" />
      <Skeleton className="h-48 bg-muted rounded-2xl" />
      <Skeleton className="h-96 bg-muted rounded-2xl" />
      <Skeleton className="h-64 bg-muted rounded-2xl" />
    </div>
  );
}
