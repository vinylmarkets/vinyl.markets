import React, { useMemo } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { generateMockTrades } from "../../lib/performance-calculations";
import { Calendar, TrendingUp, TrendingDown } from "lucide-react";

interface DayData {
  date: string;
  pnl: number;
  trades: number;
  winRate: number;
  isToday: boolean;
}

interface MonthData {
  month: string;
  year: number;
  days: (DayData | null)[];
  totalPnl: number;
  totalTrades: number;
  winningDays: number;
  totalDays: number;
}

export function MonthlyHeatmap() {
  const trades = useMemo(() => generateMockTrades(100), []);
  
  const monthlyData = useMemo(() => {
    const closedTrades = trades.filter(t => t.status === 'closed');
    const months: MonthData[] = [];
    
    // Get last 6 months
    const endDate = new Date();
    const startDate = new Date();
    startDate.setMonth(endDate.getMonth() - 5);
    
    for (let i = 0; i < 6; i++) {
      const currentMonth = new Date(startDate);
      currentMonth.setMonth(startDate.getMonth() + i);
      
      const year = currentMonth.getFullYear();
      const month = currentMonth.getMonth();
      const monthName = currentMonth.toLocaleDateString('en-US', { month: 'long' });
      
      // Get days in month
      const daysInMonth = new Date(year, month + 1, 0).getDate();
      const firstDay = new Date(year, month, 1).getDay(); // 0 = Sunday
      
      // Create array with null padding for calendar layout
      const days: (DayData | null)[] = [];
      
      // Add padding for first week
      for (let j = 0; j < firstDay; j++) {
        days.push(null);
      }
      
      // Add actual days
      for (let day = 1; day <= daysInMonth; day++) {
        const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
        const dayTrades = closedTrades.filter(trade => 
          trade.exitTime && trade.exitTime.startsWith(dateStr)
        );
        
        const dayPnl = dayTrades.reduce((sum, trade) => sum + trade.pnl, 0);
        const winningTrades = dayTrades.filter(trade => trade.pnl > 0).length;
        const winRate = dayTrades.length > 0 ? (winningTrades / dayTrades.length) * 100 : 0;
        
        const today = new Date();
        const isToday = dateStr === today.toISOString().split('T')[0];
        
        days.push({
          date: dateStr,
          pnl: dayPnl,
          trades: dayTrades.length,
          winRate,
          isToday
        });
      }
      
      const monthTrades = days.filter(d => d !== null) as DayData[];
      const totalPnl = monthTrades.reduce((sum, day) => sum + day.pnl, 0);
      const totalTrades = monthTrades.reduce((sum, day) => sum + day.trades, 0);
      const winningDays = monthTrades.filter(day => day.pnl > 0).length;
      const tradingDays = monthTrades.filter(day => day.trades > 0).length;
      
      months.push({
        month: monthName,
        year,
        days,
        totalPnl,
        totalTrades,
        winningDays,
        totalDays: tradingDays
      });
    }
    
    return months;
  }, [trades]);

  const getIntensityColor = (pnl: number, maxPnl: number) => {
    if (pnl === 0) return "bg-muted/30";
    
    const intensity = Math.min(Math.abs(pnl) / maxPnl, 1);
    const isPositive = pnl > 0;
    
    if (isPositive) {
      if (intensity > 0.8) return "bg-success text-success-foreground";
      if (intensity > 0.6) return "bg-success/80 text-success-foreground";
      if (intensity > 0.4) return "bg-success/60";
      if (intensity > 0.2) return "bg-success/40";
      return "bg-success/20";
    } else {
      if (intensity > 0.8) return "bg-destructive text-destructive-foreground";
      if (intensity > 0.6) return "bg-destructive/80 text-destructive-foreground";
      if (intensity > 0.4) return "bg-destructive/60";
      if (intensity > 0.2) return "bg-destructive/40";
      return "bg-destructive/20";
    }
  };

  const maxPnl = Math.max(
    ...monthlyData.flatMap(month => 
      month.days.filter(day => day !== null).map(day => Math.abs(day!.pnl))
    )
  );

  const totalStats = useMemo(() => {
    return monthlyData.reduce((acc, month) => ({
      totalPnl: acc.totalPnl + month.totalPnl,
      totalTrades: acc.totalTrades + month.totalTrades,
      winningDays: acc.winningDays + month.winningDays,
      totalDays: acc.totalDays + month.totalDays
    }), { totalPnl: 0, totalTrades: 0, winningDays: 0, totalDays: 0 });
  }, [monthlyData]);

  const dayLabels = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  return (
    <div className="space-y-6">
      {/* Overall Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm">Total P&L (6M)</CardTitle>
          </CardHeader>
          <CardContent>
            <p className={`text-2xl font-bold ${
              totalStats.totalPnl > 0 ? 'text-success' : 'text-destructive'
            }`}>
              {totalStats.totalPnl > 0 ? '+' : ''}${totalStats.totalPnl.toFixed(0)}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm">Profitable Days</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">
              {totalStats.totalDays > 0 ? ((totalStats.winningDays / totalStats.totalDays) * 100).toFixed(1) : 0}%
            </p>
            <p className="text-sm text-muted-foreground">
              {totalStats.winningDays}/{totalStats.totalDays} days
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm">Trading Days</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{totalStats.totalDays}</p>
            <p className="text-sm text-muted-foreground">
              {totalStats.totalTrades} total trades
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm">Avg Daily P&L</CardTitle>
          </CardHeader>
          <CardContent>
            <p className={`text-2xl font-bold ${
              totalStats.totalDays > 0 && totalStats.totalPnl / totalStats.totalDays > 0 ? 'text-success' : 'text-destructive'
            }`}>
              ${totalStats.totalDays > 0 ? (totalStats.totalPnl / totalStats.totalDays).toFixed(0) : 0}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Monthly Calendar Heatmaps */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {monthlyData.map((monthData, monthIndex) => (
          <Card key={`${monthData.year}-${monthData.month}`}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  {monthData.month} {monthData.year}
                </CardTitle>
                <div className="flex gap-2">
                  <Badge 
                    variant={monthData.totalPnl > 0 ? "success" : "destructive"}
                    className="flex items-center gap-1"
                  >
                    {monthData.totalPnl > 0 ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                    {monthData.totalPnl > 0 ? '+' : ''}${monthData.totalPnl.toFixed(0)}
                  </Badge>
                </div>
              </div>
              <CardDescription>
                {monthData.totalDays > 0 ? ((monthData.winningDays / monthData.totalDays) * 100).toFixed(1) : 0}% profitable days • {monthData.totalTrades} trades
              </CardDescription>
            </CardHeader>
            
            <CardContent>
              <TooltipProvider>
                <div className="space-y-2">
                  {/* Day labels */}
                  <div className="grid grid-cols-7 gap-1">
                    {dayLabels.map(day => (
                      <div key={day} className="text-xs text-center text-muted-foreground py-1">
                        {day}
                      </div>
                    ))}
                  </div>
                  
                  {/* Calendar grid */}
                  <div className="grid grid-cols-7 gap-1">
                    {monthData.days.map((day, dayIndex) => {
                      if (day === null) {
                        return <div key={dayIndex} className="h-8" />;
                      }
                      
                      const dayNumber = parseInt(day.date.split('-')[2]);
                      const colorClass = getIntensityColor(day.pnl, maxPnl);
                      
                      return (
                        <Tooltip key={day.date}>
                          <TooltipTrigger>
                            <div 
                              className={`h-8 w-8 rounded text-xs font-medium flex items-center justify-center cursor-pointer transition-all hover:scale-110 ${colorClass} ${
                                day.isToday ? 'ring-2 ring-primary ring-offset-1' : ''
                              }`}
                            >
                              {dayNumber}
                            </div>
                          </TooltipTrigger>
                          <TooltipContent>
                            <div className="space-y-1">
                              <p className="font-medium">
                                {new Date(day.date).toLocaleDateString('en-US', { 
                                  weekday: 'long', 
                                  month: 'long', 
                                  day: 'numeric' 
                                })}
                              </p>
                              {day.trades > 0 ? (
                                <>
                                  <p className={day.pnl > 0 ? 'text-success' : day.pnl < 0 ? 'text-destructive' : ''}>
                                    P&L: {day.pnl > 0 ? '+' : ''}${day.pnl.toFixed(2)}
                                  </p>
                                  <p>Trades: {day.trades}</p>
                                  <p>Win Rate: {day.winRate.toFixed(1)}%</p>
                                </>
                              ) : (
                                <p className="text-muted-foreground">No trades</p>
                              )}
                            </div>
                          </TooltipContent>
                        </Tooltip>
                      );
                    })}
                  </div>
                </div>
              </TooltipProvider>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Color Legend */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Color Legend</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">Large Loss</span>
              <div className="flex gap-1">
                <div className="w-4 h-4 rounded bg-destructive" />
                <div className="w-4 h-4 rounded bg-destructive/60" />
                <div className="w-4 h-4 rounded bg-destructive/20" />
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded bg-muted/30" />
              <span className="text-sm text-muted-foreground">No Trades</span>
            </div>
            
            <div className="flex items-center gap-2">
              <div className="flex gap-1">
                <div className="w-4 h-4 rounded bg-success/20" />
                <div className="w-4 h-4 rounded bg-success/60" />
                <div className="w-4 h-4 rounded bg-success" />
              </div>
              <span className="text-sm text-muted-foreground">Large Gain</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}