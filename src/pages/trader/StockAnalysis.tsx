import React, { useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { TraderProtection } from '@/components/trader/TraderProtection';
import { TraderHeader } from '@/trader-platform/components/TraderHeader';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import { Table, TableBody, TableCell, TableRow } from '@/components/ui/table';
import { AlertCircle, TrendingUp, TrendingDown, Share2, Plus, ExternalLink, ChevronDown, ChevronUp } from 'lucide-react';
import { 
  useTickerDetails, 
  useTickerSnapshot, 
  useAggregates, 
  useTickerNews,
  formatMarketCap,
  getMarketStatus,
  getTimeRangeDates,
  calculateMA,
  calculateRSI,
} from '@/hooks/usePolygonData';
import Plot from 'react-plotly.js';
import { darkPlotlyTheme } from '@/lib/plotly-themes';

const StockAnalysis = () => {
  const { symbol } = useParams<{ symbol: string }>();
  const navigate = useNavigate();
  const [timeRange, setTimeRange] = useState('1Y');
  const [chartType, setChartType] = useState<'line' | 'candlestick'>('candlestick');
  const [showMA, setShowMA] = useState(true);
  const [companyExpanded, setCompanyExpanded] = useState(false);
  
  const upperSymbol = symbol?.toUpperCase() || '';
  const { from, to } = getTimeRangeDates(timeRange);
  
  const { data: details, isLoading: detailsLoading, error: detailsError } = useTickerDetails(upperSymbol);
  const { data: snapshot, isLoading: snapshotLoading } = useTickerSnapshot(upperSymbol);
  const { data: aggregates, isLoading: aggregatesLoading } = useAggregates(upperSymbol, 1, 'day', from, to);
  const { data: news, isLoading: newsLoading } = useTickerNews(upperSymbol, 10);

  // Calculate technical indicators
  const technicalData = useMemo(() => {
    if (!aggregates || aggregates.length === 0) return null;
    
    const ma20 = calculateMA(aggregates, 20);
    const ma50 = calculateMA(aggregates, 50);
    const ma200 = calculateMA(aggregates, 200);
    const rsi = calculateRSI(aggregates, 14);
    
    return { ma20, ma50, ma200, rsi };
  }, [aggregates]);

  const currentPrice = snapshot?.day?.c || snapshot?.prevDay?.c || details?.market_cap ? (details.market_cap / (details.weighted_shares_outstanding || 1)) : 0;
  const priceChange = snapshot?.todaysChange || 0;
  const priceChangePercent = snapshot?.todaysChangePerc || 0;
  const isPositive = priceChange >= 0;

  // Error state
  if (detailsError) {
    return (
      <TraderProtection>
        <div className="min-h-screen bg-background">
          <TraderHeader />
          <div className="container mx-auto px-4 py-8">
            <Card className="border-destructive">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-destructive">
                  <AlertCircle className="h-5 w-5" />
                  Symbol Not Found
                </CardTitle>
                <CardDescription>
                  Unable to find stock information for "{upperSymbol}". Please check the symbol and try again.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button onClick={() => navigate('/trader')}>
                  Return to Dashboard
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </TraderProtection>
    );
  }

  return (
    <TraderProtection>
      <div className="min-h-screen bg-background">
        <TraderHeader />
        
        <div className="container mx-auto px-4 py-6 space-y-6">
          {/* Header Section - Sticky */}
          <div className="sticky top-0 z-10 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 pb-4 border-b">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
              <div className="space-y-2">
                <div className="flex items-center gap-3">
                  <h1 className="text-3xl font-bold">{upperSymbol}</h1>
                  {detailsLoading ? (
                    <Skeleton className="h-6 w-48" />
                  ) : (
                    <span className="text-lg text-muted-foreground">{details?.name}</span>
                  )}
                </div>
                
                <div className="flex items-center gap-4 flex-wrap">
                  {snapshotLoading ? (
                    <>
                      <Skeleton className="h-8 w-24" />
                      <Skeleton className="h-6 w-20" />
                    </>
                  ) : (
                    <>
                      <div className="text-3xl font-bold">
                        ${currentPrice.toFixed(2)}
                      </div>
                      <div className={`flex items-center gap-1 text-lg ${isPositive ? 'text-green-500' : 'text-red-500'}`}>
                        {isPositive ? <TrendingUp className="h-5 w-5" /> : <TrendingDown className="h-5 w-5" />}
                        <span>{isPositive ? '+' : ''}{priceChange.toFixed(2)}</span>
                        <span>({isPositive ? '+' : ''}{priceChangePercent.toFixed(2)}%)</span>
                      </div>
                      <Badge variant={getMarketStatus(snapshot?.updated) === 'Open' ? 'default' : 'secondary'}>
                        {getMarketStatus(snapshot?.updated)}
                      </Badge>
                      {!snapshotLoading && snapshot && (
                        <span className="text-xs text-muted-foreground">
                          Previous day's close
                        </span>
                      )}
                    </>
                  )}
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm">
                  <Plus className="h-4 w-4 mr-2" />
                  Add to Watchlist
                </Button>
                <Button size="sm">
                  Quick Trade
                </Button>
                <Button variant="ghost" size="sm">
                  <Share2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>

          {/* Price Chart */}
          <Card>
            <CardHeader>
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                <CardTitle>Price Chart</CardTitle>
                <div className="flex items-center gap-2 flex-wrap">
                  <div className="flex gap-1">
                    {['1D', '5D', '1M', '3M', '6M', '1Y', '5Y'].map((range) => (
                      <Button
                        key={range}
                        variant={timeRange === range ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setTimeRange(range)}
                      >
                        {range}
                      </Button>
                    ))}
                  </div>
                  <div className="flex gap-1">
                    <Button
                      variant={chartType === 'line' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setChartType('line')}
                    >
                      Line
                    </Button>
                    <Button
                      variant={chartType === 'candlestick' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setChartType('candlestick')}
                    >
                      Candles
                    </Button>
                  </div>
                  <Button
                    variant={showMA ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setShowMA(!showMA)}
                  >
                    MA
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {aggregatesLoading ? (
                <Skeleton className="h-[400px] w-full" />
              ) : !aggregates || aggregates.length === 0 ? (
                <div className="h-[400px] flex flex-col items-center justify-center text-muted-foreground space-y-4">
                  <AlertCircle className="h-12 w-12" />
                  <div className="text-center space-y-2">
                    <p className="font-medium">Chart data temporarily unavailable</p>
                    <p className="text-sm">API rate limit reached. Please wait a moment and refresh.</p>
                  </div>
                </div>
              ) : (
                <Plot
                  data={[
                    chartType === 'candlestick' ? {
                      type: 'candlestick',
                      x: aggregates.map(d => new Date(d.t)),
                      open: aggregates.map(d => d.o),
                      high: aggregates.map(d => d.h),
                      low: aggregates.map(d => d.l),
                      close: aggregates.map(d => d.c),
                      name: upperSymbol,
                      increasing: { line: { color: '#00ff88' } },
                      decreasing: { line: { color: '#ff6b6b' } },
                    } : {
                      type: 'scatter',
                      mode: 'lines',
                      x: aggregates.map(d => new Date(d.t)),
                      y: aggregates.map(d => d.c),
                      name: upperSymbol,
                      line: { color: '#00ff88', width: 2 },
                    },
                    ...(showMA && technicalData ? [
                      {
                        type: 'scatter',
                        mode: 'lines',
                        x: aggregates.map(d => new Date(d.t)),
                        y: technicalData.ma20,
                        name: 'MA 20',
                        line: { color: '#00ffff', width: 1 },
                      },
                      {
                        type: 'scatter',
                        mode: 'lines',
                        x: aggregates.map(d => new Date(d.t)),
                        y: technicalData.ma50,
                        name: 'MA 50',
                        line: { color: '#ff00ff', width: 1 },
                      },
                      {
                        type: 'scatter',
                        mode: 'lines',
                        x: aggregates.map(d => new Date(d.t)),
                        y: technicalData.ma200,
                        name: 'MA 200',
                        line: { color: '#ffff00', width: 1 },
                      },
                    ] : []),
                  ]}
                  layout={{
                    ...darkPlotlyTheme.layout,
                    height: 400,
                    margin: { l: 50, r: 50, t: 20, b: 50 },
                    xaxis: { 
                      ...darkPlotlyTheme.layout.xaxis,
                      rangeslider: { visible: false },
                    },
                    yaxis: {
                      ...darkPlotlyTheme.layout.yaxis,
                      title: 'Price ($)',
                    },
                    showlegend: true,
                    legend: {
                      orientation: 'h',
                      y: -0.2,
                    },
                  }}
                  config={{ responsive: true, displayModeBar: false }}
                  style={{ width: '100%' }}
                />
              )}
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Column - Main Content */}
            <div className="lg:col-span-2 space-y-6">
              {/* Key Metrics */}
              <Card>
                <CardHeader>
                  <CardTitle>Key Metrics</CardTitle>
                </CardHeader>
                <CardContent>
                  {detailsLoading ? (
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                      {[...Array(9)].map((_, i) => (
                        <Skeleton key={i} className="h-16" />
                      ))}
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                      <MetricCard label="Market Cap" value={formatMarketCap(details?.market_cap)} />
                      <MetricCard label="52W High" value={snapshot?.day?.h ? `$${snapshot.day.h.toFixed(2)}` : 'N/A'} />
                      <MetricCard label="52W Low" value={snapshot?.day?.l ? `$${snapshot.day.l.toFixed(2)}` : 'N/A'} />
                      <MetricCard label="Volume" value={snapshot?.day?.v ? snapshot.day.v.toLocaleString() : 'N/A'} />
                      <MetricCard label="Avg Volume" value={snapshot?.prevDay?.v ? snapshot.prevDay.v.toLocaleString() : 'N/A'} />
                      <MetricCard label="Prev Close" value={snapshot?.prevDay?.c ? `$${snapshot.prevDay.c.toFixed(2)}` : 'N/A'} />
                      <MetricCard label="Open" value={snapshot?.day?.o ? `$${snapshot.day.o.toFixed(2)}` : 'N/A'} />
                      <MetricCard label="Day High" value={snapshot?.day?.h ? `$${snapshot.day.h.toFixed(2)}` : 'N/A'} />
                      <MetricCard label="Day Low" value={snapshot?.day?.l ? `$${snapshot.day.l.toFixed(2)}` : 'N/A'} />
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Company Info */}
              <Card>
                <CardHeader>
                  <div 
                    className="flex items-center justify-between cursor-pointer"
                    onClick={() => setCompanyExpanded(!companyExpanded)}
                  >
                    <CardTitle>Company Information</CardTitle>
                    {companyExpanded ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
                  </div>
                </CardHeader>
                {companyExpanded && (
                  <CardContent className="space-y-4">
                    {detailsLoading ? (
                      <Skeleton className="h-32" />
                    ) : (
                      <>
                        {details?.description && (
                          <p className="text-sm text-muted-foreground">{details.description}</p>
                        )}
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <span className="text-muted-foreground">Industry:</span>
                            <p className="font-medium">{details?.sic_description || 'N/A'}</p>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Employees:</span>
                            <p className="font-medium">{details?.total_employees?.toLocaleString() || 'N/A'}</p>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Location:</span>
                            <p className="font-medium">
                              {details?.address?.city && details?.address?.state 
                                ? `${details.address.city}, ${details.address.state}`
                                : 'N/A'}
                            </p>
                          </div>
                          {details?.homepage_url && (
                            <div>
                              <span className="text-muted-foreground">Website:</span>
                              <a 
                                href={details.homepage_url} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="font-medium text-primary hover:underline flex items-center gap-1"
                              >
                                Visit <ExternalLink className="h-3 w-3" />
                              </a>
                            </div>
                          )}
                        </div>
                      </>
                    )}
                  </CardContent>
                )}
              </Card>

              {/* Technical Indicators */}
              {technicalData && (
                <Card>
                  <CardHeader>
                    <CardTitle>Technical Indicators</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <IndicatorCard 
                        label="RSI (14)" 
                        value={technicalData.rsi[technicalData.rsi.length - 1]?.toFixed(2) || 'N/A'}
                        signal={getRSISignal(technicalData.rsi[technicalData.rsi.length - 1])}
                      />
                      <IndicatorCard 
                        label="MA 20" 
                        value={technicalData.ma20[technicalData.ma20.length - 1] ? `$${technicalData.ma20[technicalData.ma20.length - 1].toFixed(2)}` : 'N/A'}
                      />
                      <IndicatorCard 
                        label="MA 50" 
                        value={technicalData.ma50[technicalData.ma50.length - 1] ? `$${technicalData.ma50[technicalData.ma50.length - 1].toFixed(2)}` : 'N/A'}
                      />
                      <IndicatorCard 
                        label="MA 200" 
                        value={technicalData.ma200[technicalData.ma200.length - 1] ? `$${technicalData.ma200[technicalData.ma200.length - 1].toFixed(2)}` : 'N/A'}
                      />
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Price Statistics */}
              <Card>
                <CardHeader>
                  <CardTitle>Price Statistics</CardTitle>
                </CardHeader>
                <CardContent>
                  {snapshotLoading ? (
                    <Skeleton className="h-64" />
                  ) : (
                    <Table>
                      <TableBody>
                        <TableRow>
                          <TableCell className="font-medium">Open</TableCell>
                          <TableCell className="text-right">${snapshot?.day?.o?.toFixed(2) || 'N/A'}</TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell className="font-medium">High</TableCell>
                          <TableCell className="text-right">${snapshot?.day?.h?.toFixed(2) || 'N/A'}</TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell className="font-medium">Low</TableCell>
                          <TableCell className="text-right">${snapshot?.day?.l?.toFixed(2) || 'N/A'}</TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell className="font-medium">Previous Close</TableCell>
                          <TableCell className="text-right">${snapshot?.prevDay?.c?.toFixed(2) || 'N/A'}</TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell className="font-medium">Volume</TableCell>
                          <TableCell className="text-right">{snapshot?.day?.v?.toLocaleString() || 'N/A'}</TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell className="font-medium">Average Volume</TableCell>
                          <TableCell className="text-right">{snapshot?.prevDay?.v?.toLocaleString() || 'N/A'}</TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell className="font-medium">Market Cap</TableCell>
                          <TableCell className="text-right">{formatMarketCap(details?.market_cap)}</TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell className="font-medium">Shares Outstanding</TableCell>
                          <TableCell className="text-right">
                            {details?.weighted_shares_outstanding 
                              ? (details.weighted_shares_outstanding / 1e6).toFixed(2) + 'M'
                              : 'N/A'}
                          </TableCell>
                        </TableRow>
                      </TableBody>
                    </Table>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Right Column - News */}
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Recent News</CardTitle>
                  <CardDescription className="text-xs">
                    News provided by Polygon.io for informational purposes only
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {newsLoading ? (
                    [...Array(5)].map((_, i) => (
                      <div key={i} className="space-y-2">
                        <Skeleton className="h-4 w-full" />
                        <Skeleton className="h-3 w-3/4" />
                      </div>
                    ))
                  ) : news && news.length > 0 ? (
                    news.map((article) => (
                      <NewsCard key={article.id} article={article} />
                    ))
                  ) : (
                    <p className="text-sm text-muted-foreground">No recent news available</p>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Disclaimer */}
          <Card className="border-muted">
            <CardContent className="pt-6">
              <p className="text-xs text-muted-foreground text-center">
                Data for informational purposes only. Not investment advice. Verify all information before making trading decisions.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </TraderProtection>
  );
};

const MetricCard = ({ label, value }: { label: string; value: string }) => (
  <div className="space-y-1">
    <p className="text-xs text-muted-foreground">{label}</p>
    <p className="text-lg font-semibold">{value}</p>
  </div>
);

const IndicatorCard = ({ 
  label, 
  value, 
  signal 
}: { 
  label: string; 
  value: string; 
  signal?: string;
}) => (
  <div className="space-y-1">
    <p className="text-xs text-muted-foreground">{label}</p>
    <p className="text-lg font-semibold">{value}</p>
    {signal && (
      <Badge variant="outline" className="text-xs">
        {signal}
      </Badge>
    )}
  </div>
);

const NewsCard = ({ article }: { article: any }) => {
  const getTimeAgo = (timestamp: string) => {
    const now = new Date();
    const published = new Date(timestamp);
    const diff = Math.floor((now.getTime() - published.getTime()) / 1000);
    
    if (diff < 3600) return `${Math.floor(diff / 60)} minutes ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)} hours ago`;
    return `${Math.floor(diff / 86400)} days ago`;
  };

  return (
    <a
      href={article.article_url}
      target="_blank"
      rel="noopener noreferrer"
      className="block space-y-2 hover:bg-accent/50 p-2 rounded-md transition-colors"
    >
      {article.image_url && (
        <img 
          src={article.image_url} 
          alt="" 
          className="w-full h-32 object-cover rounded"
          loading="lazy"
        />
      )}
      <h4 className="text-sm font-medium line-clamp-2 hover:text-primary">
        {article.title}
      </h4>
      <div className="flex items-center justify-between text-xs text-muted-foreground">
        <span>{article.publisher.name}</span>
        <span>{getTimeAgo(article.published_utc)}</span>
      </div>
    </a>
  );
};

const getRSISignal = (rsi: number): string => {
  if (isNaN(rsi)) return 'N/A';
  if (rsi > 70) return 'Overbought';
  if (rsi < 30) return 'Oversold';
  return 'Neutral';
};

export default StockAnalysis;
