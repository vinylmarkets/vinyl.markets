import React, { useMemo } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { generateMockTrades } from "../../lib/performance-calculations";
import { Clock, Calendar, TrendingUp, TrendingDown } from "lucide-react";

interface TimePerformance {
  period: string;
  trades: number;
  totalPnl: number;
  winRate: number;
  avgPnl: number;
}

export function TimeAnalysis() {
  const trades = useMemo(() => generateMockTrades(100), []);
  
  const { hourlyData, dailyData, sessionData } = useMemo(() => {
    const closedTrades = trades.filter(t => t.status === 'closed');
    
    // Hour of day analysis
    const hourlyStats: { [hour: number]: { trades: number; totalPnl: number; wins: number } } = {};
    
    // Day of week analysis  
    const dailyStats: { [day: number]: { trades: number; totalPnl: number; wins: number } } = {};
    
    // Market session analysis
    const sessionStats = {
      'Pre-Market (4-9:30 AM)': { trades: 0, totalPnl: 0, wins: 0 },
      'Market Open (9:30-11 AM)': { trades: 0, totalPnl: 0, wins: 0 },
      'Mid-Day (11 AM-2 PM)': { trades: 0, totalPnl: 0, wins: 0 },
      'Market Close (2-4 PM)': { trades: 0, totalPnl: 0, wins: 0 },
      'After Hours (4-8 PM)': { trades: 0, totalPnl: 0, wins: 0 }
    };

    closedTrades.forEach(trade => {
      const entryDate = new Date(trade.entryTime);
      const hour = entryDate.getHours();
      const dayOfWeek = entryDate.getDay(); // 0 = Sunday, 1 = Monday, etc.
      
      // Hour analysis
      if (!hourlyStats[hour]) {
        hourlyStats[hour] = { trades: 0, totalPnl: 0, wins: 0 };
      }
      hourlyStats[hour].trades++;
      hourlyStats[hour].totalPnl += trade.pnl;
      if (trade.pnl > 0) hourlyStats[hour].wins++;
      
      // Day analysis
      if (!dailyStats[dayOfWeek]) {
        dailyStats[dayOfWeek] = { trades: 0, totalPnl: 0, wins: 0 };
      }
      dailyStats[dayOfWeek].trades++;
      dailyStats[dayOfWeek].totalPnl += trade.pnl;
      if (trade.pnl > 0) dailyStats[dayOfWeek].wins++;
      
      // Session analysis
      let session: keyof typeof sessionStats;
      if (hour < 4 || hour >= 20) {
        return; // Skip overnight hours
      } else if (hour < 9 || (hour === 9 && entryDate.getMinutes() < 30)) {
        session = 'Pre-Market (4-9:30 AM)';
      } else if (hour < 11) {
        session = 'Market Open (9:30-11 AM)';
      } else if (hour < 14) {
        session = 'Mid-Day (11 AM-2 PM)';
      } else if (hour < 16) {
        session = 'Market Close (2-4 PM)';
      } else {
        session = 'After Hours (4-8 PM)';
      }
      
      sessionStats[session].trades++;
      sessionStats[session].totalPnl += trade.pnl;
      if (trade.pnl > 0) sessionStats[session].wins++;
    });

    // Convert to arrays for display
    const hourlyData: TimePerformance[] = Object.entries(hourlyStats).map(([hour, stats]) => ({
      period: `${hour}:00`,
      trades: stats.trades,
      totalPnl: stats.totalPnl,
      winRate: stats.trades > 0 ? (stats.wins / stats.trades) * 100 : 0,
      avgPnl: stats.trades > 0 ? stats.totalPnl / stats.trades : 0
    }));

    const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const dailyData: TimePerformance[] = Object.entries(dailyStats).map(([day, stats]) => ({
      period: dayNames[parseInt(day)],
      trades: stats.trades,
      totalPnl: stats.totalPnl,
      winRate: stats.trades > 0 ? (stats.wins / stats.trades) * 100 : 0,
      avgPnl: stats.trades > 0 ? stats.totalPnl / stats.trades : 0
    }));

    const sessionData: TimePerformance[] = Object.entries(sessionStats).map(([session, stats]) => ({
      period: session,
      trades: stats.trades,
      totalPnl: stats.totalPnl,
      winRate: stats.trades > 0 ? (stats.wins / stats.trades) * 100 : 0,
      avgPnl: stats.trades > 0 ? stats.totalPnl / stats.trades : 0
    }));

    return { 
      hourlyData: hourlyData.sort((a, b) => parseInt(a.period) - parseInt(b.period)),
      dailyData: dailyData.filter(d => d.trades > 0),
      sessionData: sessionData.filter(s => s.trades > 0)
    };
  }, [trades]);

  const getPerformanceColor = (value: number, isWinRate: boolean = false) => {
    if (isWinRate) {
      return value >= 60 ? "text-success" : value >= 40 ? "text-warning" : "text-destructive";
    }
    return value > 0 ? "text-success" : value < 0 ? "text-destructive" : "text-muted-foreground";
  };

  const getPerformanceBadge = (winRate: number, avgPnl: number) => {
    if (winRate >= 60 && avgPnl > 0) return "excellent";
    if (winRate >= 50 && avgPnl > 0) return "good";
    if (winRate >= 40 || avgPnl > 0) return "average";
    return "poor";
  };

  const renderHeatmapCell = (value: number, maxValue: number, isProfit: boolean = true) => {
    const intensity = Math.abs(value) / maxValue;
    const color = isProfit && value > 0 ? "bg-success" : value < 0 ? "bg-destructive" : "bg-muted";
    
    return (
      <div 
        className={`w-8 h-8 rounded ${color} flex items-center justify-center text-xs font-medium`}
        style={{ opacity: 0.2 + intensity * 0.8 }}
      >
        {value > 0 ? '+' : ''}{Math.round(value)}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Market Session Performance */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Market Session Analysis
          </CardTitle>
          <CardDescription>
            Trading performance by different market sessions
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {sessionData.map((session) => {
              const badgeType = getPerformanceBadge(session.winRate, session.avgPnl);
              return (
                <div key={session.period} className="p-4 border rounded-lg space-y-2">
                  <div className="flex items-center justify-between">
                    <h4 className="font-medium text-sm">{session.period}</h4>
                    <Badge 
                      variant={
                        badgeType === "excellent" ? "default" : 
                        badgeType === "good" ? "secondary" :
                        badgeType === "average" ? "outline" : "destructive"
                      }
                      className={badgeType === "excellent" ? "bg-success text-success-foreground hover:bg-success/80" : ""}
                    >
                      {badgeType}
                    </Badge>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div>
                      <p className="text-muted-foreground">Trades</p>
                      <p className="font-bold">{session.trades}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Win Rate</p>
                      <p className={`font-bold ${getPerformanceColor(session.winRate, true)}`}>
                        {session.winRate.toFixed(1)}%
                      </p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Total P&L</p>
                      <p className={`font-bold ${getPerformanceColor(session.totalPnl)}`}>
                        {session.totalPnl > 0 ? '+' : ''}${session.totalPnl.toFixed(0)}
                      </p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Avg P&L</p>
                      <p className={`font-bold ${getPerformanceColor(session.avgPnl)}`}>
                        {session.avgPnl > 0 ? '+' : ''}${session.avgPnl.toFixed(0)}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Day of Week Analysis */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Day of Week Performance
          </CardTitle>
          <CardDescription>
            Which days of the week are most profitable for your trading
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {dailyData.map((day, index) => (
              <div key={day.period} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center gap-4">
                  <div className="w-16 text-sm font-medium">{day.period}</div>
                  <div className="flex items-center gap-2">
                    {day.totalPnl > 0 ? <TrendingUp className="h-4 w-4 text-success" /> : 
                     day.totalPnl < 0 ? <TrendingDown className="h-4 w-4 text-destructive" /> : null}
                    <span className={`font-bold ${getPerformanceColor(day.totalPnl)}`}>
                      {day.totalPnl > 0 ? '+' : ''}${day.totalPnl.toFixed(0)}
                    </span>
                  </div>
                </div>
                
                <div className="flex items-center gap-6 text-sm">
                  <div className="text-center">
                    <p className="text-muted-foreground">Trades</p>
                    <p className="font-bold">{day.trades}</p>
                  </div>
                  <div className="text-center">
                    <p className="text-muted-foreground">Win Rate</p>
                    <p className={`font-bold ${getPerformanceColor(day.winRate, true)}`}>
                      {day.winRate.toFixed(1)}%
                    </p>
                  </div>
                  <div className="text-center">
                    <p className="text-muted-foreground">Avg P&L</p>
                    <p className={`font-bold ${getPerformanceColor(day.avgPnl)}`}>
                      ${day.avgPnl.toFixed(0)}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Hourly Heatmap */}
      <Card>
        <CardHeader>
          <CardTitle>Hour-by-Hour Heatmap</CardTitle>
          <CardDescription>
            Trading performance intensity by hour of day (darker = better performance)
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* P&L Heatmap */}
            <div>
              <h4 className="font-medium mb-2">Average P&L by Hour</h4>
              <div className="flex flex-wrap gap-1">
                {Array.from({ length: 24 }, (_, hour) => {
                  const data = hourlyData.find(h => parseInt(h.period) === hour);
                  const maxPnl = Math.max(...hourlyData.map(h => Math.abs(h.avgPnl)));
                  return (
                    <div key={hour} className="text-center">
                      <div className="text-xs mb-1">{hour}:00</div>
                      {data && data.trades > 0 ? 
                        renderHeatmapCell(data.avgPnl, maxPnl, true) :
                        <div className="w-8 h-8 rounded bg-muted/20" />
                      }
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Trade Volume Heatmap */}
            <div>
              <h4 className="font-medium mb-2">Trade Volume by Hour</h4>
              <div className="flex flex-wrap gap-1">
                {Array.from({ length: 24 }, (_, hour) => {
                  const data = hourlyData.find(h => parseInt(h.period) === hour);
                  const maxTrades = Math.max(...hourlyData.map(h => h.trades));
                  return (
                    <div key={hour} className="text-center">
                      <div className="text-xs mb-1">{hour}:00</div>
                      {data && data.trades > 0 ? (
                        <div 
                          className="w-8 h-8 rounded bg-primary flex items-center justify-center text-xs font-medium text-primary-foreground"
                          style={{ opacity: 0.2 + (data.trades / maxTrades) * 0.8 }}
                        >
                          {data.trades}
                        </div>
                      ) : (
                        <div className="w-8 h-8 rounded bg-muted/20" />
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Best/Worst Times Summary */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-success">Best Performance Times</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {[...sessionData]
              .sort((a, b) => b.totalPnl - a.totalPnl)
              .slice(0, 3)
              .map((session, index) => (
                <div key={session.period} className="flex justify-between items-center">
                  <span className="text-sm">{session.period}</span>
                  <div className="text-right">
                    <p className="font-bold text-success">+${session.totalPnl.toFixed(0)}</p>
                    <p className="text-xs text-muted-foreground">{session.winRate.toFixed(1)}% win rate</p>
                  </div>
                </div>
              ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-destructive">Challenging Times</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {[...sessionData]
              .sort((a, b) => a.totalPnl - b.totalPnl)
              .slice(0, 3)
              .map((session, index) => (
                <div key={session.period} className="flex justify-between items-center">
                  <span className="text-sm">{session.period}</span>
                  <div className="text-right">
                    <p className="font-bold text-destructive">${session.totalPnl.toFixed(0)}</p>
                    <p className="text-xs text-muted-foreground">{session.winRate.toFixed(1)}% win rate</p>
                  </div>
                </div>
              ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}