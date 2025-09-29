import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { getTradeHistory } from "../../lib/trading-api";
import { calculatePerformanceMetrics } from "../../lib/performance-calculations";
import { Download, FileText, FileSpreadsheet, Database } from "lucide-react";
import { format } from "date-fns";

export function ExportTools() {
  const [trades, setTrades] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchTradeData = async () => {
    try {
      setLoading(true);
      const tradeHistory = await getTradeHistory();
      setTrades(tradeHistory);
    } catch (error) {
      console.error('Error fetching trade data:', error);
      setTrades([]);
    } finally {
      setLoading(false);
    }
  };

  const exportToCsv = async () => {
    if (trades.length === 0) {
      await fetchTradeData();
    }
    
    const headers = [
      'Date', 'Time', 'Symbol', 'Direction', 'Quantity', 'Entry Price', 
      'Exit Price', 'P&L ($)', 'P&L (%)', 'Strategy', 'Hold Time (Hours)', 'Status'
    ];
    
    const csvData = [
      headers.join(','),
      ...trades.map(trade => {
        const entryDate = new Date(trade.entryTime);
        const exitDate = trade.exitTime ? new Date(trade.exitTime) : null;
        const holdTimeHours = exitDate 
          ? ((exitDate.getTime() - entryDate.getTime()) / (1000 * 60 * 60)).toFixed(2)
          : 'Open';
        
        return [
          format(entryDate, 'yyyy-MM-dd'),
          format(entryDate, 'HH:mm:ss'),
          trade.symbol,
          trade.direction,
          trade.quantity,
          trade.entryPrice.toFixed(2),
          trade.exitPrice?.toFixed(2) || 'Open',
          trade.pnl.toFixed(2),
          trade.pnlPercent.toFixed(2),
          trade.strategy,
          holdTimeHours,
          trade.status
        ].join(',');
      })
    ].join('\n');

    downloadFile(csvData, `trading-history-${format(new Date(), 'yyyy-MM-dd')}.csv`, 'text/csv');
  };

  const exportToJson = async () => {
    if (trades.length === 0) {
      await fetchTradeData();
    }
    
    const metrics = calculatePerformanceMetrics(trades, 100000);
    
    const exportData = {
      exportDate: new Date().toISOString(),
      performanceMetrics: metrics,
      trades: trades,
      summary: {
        totalTrades: trades.length,
        closedTrades: trades.filter(t => t.status === 'closed').length,
        openTrades: trades.filter(t => t.status === 'open').length,
        strategies: {
          momentum: trades.filter(t => t.strategy === 'momentum').length,
          meanReversion: trades.filter(t => t.strategy === 'mean-reversion').length,
          mlPrediction: trades.filter(t => t.strategy === 'ml-prediction').length,
        }
      }
    };

    const jsonData = JSON.stringify(exportData, null, 2);
    downloadFile(jsonData, `trading-data-${format(new Date(), 'yyyy-MM-dd')}.json`, 'application/json');
  };

  const exportToPdf = async () => {
    if (trades.length === 0) {
      await fetchTradeData();
    }
    
    // For a real implementation, you would use a library like jsPDF or puppeteer
    // For now, we'll create a simplified HTML report
    const metrics = calculatePerformanceMetrics(trades, 100000);
    
    const htmlReport = `
<!DOCTYPE html>
<html>
<head>
    <title>Trading Performance Report - ${format(new Date(), 'MMMM yyyy')}</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 20px; }
        .header { text-align: center; border-bottom: 2px solid #333; padding-bottom: 10px; }
        .metrics { display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px; margin: 20px 0; }
        .metric-card { border: 1px solid #ddd; padding: 15px; text-align: center; }
        .metric-value { font-size: 24px; font-weight: bold; color: #007bff; }
        table { width: 100%; border-collapse: collapse; margin-top: 20px; }
        th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
        th { background-color: #f2f2f2; }
        .positive { color: #28a745; }
        .negative { color: #dc3545; }
    </style>
</head>
<body>
    <div class="header">
        <h1>Trading Performance Report</h1>
        <p>Generated on ${format(new Date(), 'MMMM dd, yyyy')}</p>
    </div>
    
    <div class="metrics">
        <div class="metric-card">
            <h3>Total Return</h3>
            <div class="metric-value ${metrics.totalReturn > 0 ? 'positive' : 'negative'}">
                ${metrics.totalReturn > 0 ? '+' : ''}$${metrics.totalReturn.toFixed(2)}
            </div>
            <p>${metrics.totalReturnPercent.toFixed(2)}%</p>
        </div>
        <div class="metric-card">
            <h3>Win Rate</h3>
            <div class="metric-value">${metrics.winRate.toFixed(1)}%</div>
            <p>${metrics.winningTrades}/${metrics.totalTrades} trades</p>
        </div>
        <div class="metric-card">
            <h3>Sharpe Ratio</h3>
            <div class="metric-value">${metrics.sharpeRatio.toFixed(2)}</div>
            <p>Risk-adjusted return</p>
        </div>
        <div class="metric-card">
            <h3>Max Drawdown</h3>
            <div class="metric-value negative">-${metrics.maxDrawdown.toFixed(2)}%</div>
            <p>Peak to trough loss</p>
        </div>
        <div class="metric-card">
            <h3>Profit Factor</h3>
            <div class="metric-value">${metrics.profitFactor.toFixed(2)}</div>
            <p>Wins / Losses ratio</p>
        </div>
        <div class="metric-card">
            <h3>Average Win</h3>
            <div class="metric-value positive">$${metrics.averageWin.toFixed(2)}</div>
            <p>vs $${metrics.averageLoss.toFixed(2)} avg loss</p>
        </div>
    </div>
    
    <h2>Recent Trades (Last 20)</h2>
    <table>
        <thead>
            <tr>
                <th>Date</th>
                <th>Symbol</th>
                <th>Direction</th>
                <th>Quantity</th>
                <th>Entry Price</th>
                <th>Exit Price</th>
                <th>P&L</th>
                <th>Strategy</th>
            </tr>
        </thead>
        <tbody>
            ${trades.slice(-20).map(trade => `
                <tr>
                    <td>${format(new Date(trade.entryTime), 'MM/dd/yyyy')}</td>
                    <td>${trade.symbol}</td>
                    <td>${trade.direction}</td>
                    <td>${trade.quantity}</td>
                    <td>$${trade.entryPrice.toFixed(2)}</td>
                    <td>${trade.exitPrice ? '$' + trade.exitPrice.toFixed(2) : 'Open'}</td>
                    <td class="${trade.pnl > 0 ? 'positive' : 'negative'}">
                        ${trade.pnl > 0 ? '+' : ''}$${trade.pnl.toFixed(2)}
                    </td>
                    <td>${trade.strategy}</td>
                </tr>
            `).join('')}
        </tbody>
    </table>
    
    <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #ddd; text-align: center; color: #666;">
        <p>This report is for informational purposes only. Past performance does not guarantee future results.</p>
        <p>Generated by Atomic Trading Platform</p>
    </div>
</body>
</html>`;

    downloadFile(htmlReport, `performance-report-${format(new Date(), 'yyyy-MM-dd')}.html`, 'text/html');
  };

  const downloadFile = (content: string, filename: string, mimeType: string) => {
    const blob = new Blob([content], { type: mimeType });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" className="gap-2">
          <Download className="h-4 w-4" />
          Export Data
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        <DropdownMenuItem onClick={exportToCsv} className="gap-2" disabled={loading}>
          <FileSpreadsheet className="h-4 w-4" />
          {loading ? 'Loading...' : 'Export to CSV'}
        </DropdownMenuItem>
        <DropdownMenuItem onClick={exportToJson} className="gap-2" disabled={loading}>
          <Database className="h-4 w-4" />
          {loading ? 'Loading...' : 'Export to JSON'}
        </DropdownMenuItem>
        <DropdownMenuItem onClick={exportToPdf} className="gap-2" disabled={loading}>
          <FileText className="h-4 w-4" />
          {loading ? 'Loading...' : 'Export Report (HTML)'}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}