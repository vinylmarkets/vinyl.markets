import React, { useMemo, useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { getTradeHistory } from "../../lib/trading-api";
import { Trade } from "../../lib/performance-calculations";
import { CalendarIcon, Download, Filter, Search, TrendingUp, TrendingDown } from "lucide-react";
import { format } from "date-fns";
import { DateRange } from "react-day-picker";

export function TradeHistoryTable() {
  const [trades, setTrades] = useState<Trade[]>([]);
  const [loading, setLoading] = useState(true);
  const [filteredTrades, setFilteredTrades] = useState<Trade[]>([]);
  const [searchSymbol, setSearchSymbol] = useState("");
  const [filterType, setFilterType] = useState("all");
  const [strategyFilter, setStrategyFilter] = useState("all");
  const [sortField, setSortField] = useState<keyof Trade>("entryTime");
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  const [dateRange, setDateRange] = useState<DateRange | undefined>(undefined);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const tradeHistory = await getTradeHistory();
        setTrades(tradeHistory);
      } catch (error) {
        console.error('Error fetching trade history:', error);
        setTrades([]);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Apply filters
  React.useEffect(() => {
    let filtered = [...trades];

    // Symbol filter
    if (searchSymbol) {
      filtered = filtered.filter(trade => 
        trade.symbol.toLowerCase().includes(searchSymbol.toLowerCase())
      );
    }

    // Win/Loss filter
    if (filterType === "wins") {
      filtered = filtered.filter(trade => trade.pnl > 0);
    } else if (filterType === "losses") {
      filtered = filtered.filter(trade => trade.pnl < 0);
    }

    // Strategy filter
    if (strategyFilter !== "all") {
      filtered = filtered.filter(trade => trade.strategy === strategyFilter);
    }

    // Date range filter
    if (dateRange?.from || dateRange?.to) {
      filtered = filtered.filter(trade => {
        const tradeDate = new Date(trade.entryTime);
        const afterStart = !dateRange?.from || tradeDate >= dateRange.from;
        const beforeEnd = !dateRange?.to || tradeDate <= dateRange.to;
        return afterStart && beforeEnd;
      });
    }

    // Sort
    filtered.sort((a, b) => {
      const aVal = a[sortField];
      const bVal = b[sortField];
      
      if (typeof aVal === 'string' && typeof bVal === 'string') {
        return sortDirection === 'asc' 
          ? aVal.localeCompare(bVal)
          : bVal.localeCompare(aVal);
      }
      
      if (typeof aVal === 'number' && typeof bVal === 'number') {
        return sortDirection === 'asc' ? aVal - bVal : bVal - aVal;
      }
      
      return 0;
    });

    setFilteredTrades(filtered);
  }, [trades, searchSymbol, filterType, strategyFilter, dateRange, sortField, sortDirection]);

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Trade History</CardTitle>
          <CardDescription>Loading trade data...</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex gap-4">
              <Skeleton className="h-10 flex-1" />
              <Skeleton className="h-10 w-32" />
              <Skeleton className="h-10 w-40" />
            </div>
            <div className="space-y-2">
              {Array.from({ length: 10 }).map((_, i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (trades.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Trade History</CardTitle>
          <CardDescription>No trades found</CardDescription>
        </CardHeader>
        <CardContent className="text-center py-8">
          <p className="text-muted-foreground">
            Your trade history will appear here once you start trading.
          </p>
        </CardContent>
      </Card>
    );
  }

  const handleSort = (field: keyof Trade) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('desc');
    }
  };

  const calculateHoldTime = (entry: string, exit?: string) => {
    if (!exit) return "Open";
    
    const entryDate = new Date(entry);
    const exitDate = new Date(exit);
    const diffMs = exitDate.getTime() - entryDate.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffHours / 24);
    
    if (diffDays > 0) {
      return `${diffDays}d ${diffHours % 24}h`;
    }
    return `${diffHours}h`;
  };

  const getStrategyBadgeColor = (strategy: string) => {
    switch (strategy) {
      case 'momentum': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400';
      case 'mean-reversion': return 'bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-400';
      case 'ml-prediction': return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400';
    }
  };

  const exportToCsv = () => {
    const headers = ['Date', 'Symbol', 'Direction', 'Quantity', 'Entry Price', 'Exit Price', 'P&L ($)', 'P&L (%)', 'Strategy', 'Hold Time'];
    const csvData = [
      headers.join(','),
      ...filteredTrades.map(trade => [
        format(new Date(trade.entryTime), 'yyyy-MM-dd HH:mm:ss'),
        trade.symbol,
        trade.direction,
        trade.quantity,
        trade.entryPrice.toFixed(2),
        trade.exitPrice?.toFixed(2) || 'Open',
        trade.pnl.toFixed(2),
        trade.pnlPercent.toFixed(2),
        trade.strategy,
        calculateHoldTime(trade.entryTime, trade.exitTime)
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvData], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `trade-history-${format(new Date(), 'yyyy-MM-dd')}.csv`;
    link.click();
    window.URL.revokeObjectURL(url);
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Trade History</CardTitle>
            <CardDescription>
              Detailed record of all executed trades with filtering and export options
            </CardDescription>
          </div>
          <Button onClick={exportToCsv} variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export CSV
          </Button>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-4 mt-4">
          <div className="relative flex-1 min-w-48">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="Search symbols..."
              value={searchSymbol}
              onChange={(e) => setSearchSymbol(e.target.value)}
              className="pl-9"
            />
          </div>

          <Select value={filterType} onValueChange={setFilterType}>
            <SelectTrigger className="w-32">
              <SelectValue placeholder="Filter" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Trades</SelectItem>
              <SelectItem value="wins">Wins Only</SelectItem>
              <SelectItem value="losses">Losses Only</SelectItem>
            </SelectContent>
          </Select>

          <Select value={strategyFilter} onValueChange={setStrategyFilter}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Strategy" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Strategies</SelectItem>
              <SelectItem value="momentum">Momentum</SelectItem>
              <SelectItem value="mean-reversion">Mean Reversion</SelectItem>
              <SelectItem value="ml-prediction">ML Prediction</SelectItem>
            </SelectContent>
          </Select>

          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" className="justify-start text-left font-normal">
                <CalendarIcon className="mr-2 h-4 w-4" />
                {dateRange?.from ? (
                  dateRange?.to ? (
                    `${format(dateRange.from, "MMM dd")} - ${format(dateRange.to, "MMM dd")}`
                  ) : (
                    format(dateRange.from, "MMM dd")
                  )
                ) : (
                  "Date range"
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="range"
                selected={dateRange}
                onSelect={(range) => setDateRange(range)}
                initialFocus
                className="pointer-events-auto"
              />
            </PopoverContent>
          </Popover>
        </div>

        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          <span>Showing {filteredTrades.length} of {trades.length} trades</span>
          <Badge variant="outline">
            {filteredTrades.filter(t => t.pnl > 0).length} wins
          </Badge>
          <Badge variant="outline">
            {filteredTrades.filter(t => t.pnl < 0).length} losses
          </Badge>
        </div>
      </CardHeader>

      <CardContent>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead 
                  className="cursor-pointer hover:text-foreground"
                  onClick={() => handleSort('entryTime')}
                >
                  Date/Time {sortField === 'entryTime' && (sortDirection === 'asc' ? '↑' : '↓')}
                </TableHead>
                <TableHead 
                  className="cursor-pointer hover:text-foreground"
                  onClick={() => handleSort('symbol')}
                >
                  Symbol {sortField === 'symbol' && (sortDirection === 'asc' ? '↑' : '↓')}
                </TableHead>
                <TableHead>Direction</TableHead>
                <TableHead 
                  className="cursor-pointer hover:text-foreground text-right"
                  onClick={() => handleSort('quantity')}
                >
                  Quantity {sortField === 'quantity' && (sortDirection === 'asc' ? '↑' : '↓')}
                </TableHead>
                <TableHead className="text-right">Entry Price</TableHead>
                <TableHead className="text-right">Exit Price</TableHead>
                <TableHead 
                  className="cursor-pointer hover:text-foreground text-right"
                  onClick={() => handleSort('pnl')}
                >
                  P&L ($) {sortField === 'pnl' && (sortDirection === 'asc' ? '↑' : '↓')}
                </TableHead>
                <TableHead className="text-right">P&L (%)</TableHead>
                <TableHead>Strategy</TableHead>
                <TableHead>Hold Time</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredTrades.map((trade) => (
                <TableRow key={trade.id}>
                  <TableCell className="font-mono text-xs">
                    {format(new Date(trade.entryTime), 'MMM dd, HH:mm')}
                  </TableCell>
                  <TableCell className="font-medium">{trade.symbol}</TableCell>
                  <TableCell>
                    <Badge variant={trade.direction === 'BUY' ? 'default' : 'destructive'} className={trade.direction === 'BUY' ? 'bg-success text-success-foreground hover:bg-success/80' : ''}>
                      {trade.direction}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">{trade.quantity}</TableCell>
                  <TableCell className="text-right font-mono">
                    ${trade.entryPrice.toFixed(2)}
                  </TableCell>
                  <TableCell className="text-right font-mono">
                    {trade.exitPrice ? `$${trade.exitPrice.toFixed(2)}` : 'Open'}
                  </TableCell>
                  <TableCell className={`text-right font-mono font-medium ${
                    trade.pnl > 0 ? 'text-success' : trade.pnl < 0 ? 'text-destructive' : ''
                  }`}>
                    <div className="flex items-center justify-end gap-1">
                      {trade.pnl > 0 ? <TrendingUp className="h-3 w-3" /> : 
                       trade.pnl < 0 ? <TrendingDown className="h-3 w-3" /> : null}
                      {trade.pnl > 0 ? '+' : ''}${trade.pnl.toFixed(2)}
                    </div>
                  </TableCell>
                  <TableCell className={`text-right font-mono ${
                    trade.pnlPercent > 0 ? 'text-success' : trade.pnlPercent < 0 ? 'text-destructive' : ''
                  }`}>
                    {trade.pnlPercent > 0 ? '+' : ''}{trade.pnlPercent.toFixed(2)}%
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className={getStrategyBadgeColor(trade.strategy)}>
                      {trade.strategy === 'ml-prediction' ? 'ML' : 
                       trade.strategy === 'mean-reversion' ? 'Mean Rev' : 'Momentum'}
                    </Badge>
                  </TableCell>
                  <TableCell className="font-mono text-xs">
                    {calculateHoldTime(trade.entryTime, trade.exitTime)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}