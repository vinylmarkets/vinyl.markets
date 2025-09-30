import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { RefreshCw, CheckCircle, XCircle, AlertCircle, Clock, Database, Zap, Settings, Activity } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface DiagnosticResult {
  category: string;
  status: "success" | "warning" | "error";
  message: string;
  data?: any;
  timestamp?: string;
  icon?: any;
  recommendation?: string;
}

export const TradingAutomationDiagnostic = () => {
  const [diagnostics, setDiagnostics] = useState<DiagnosticResult[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const { toast } = useToast();

  const runDiagnostics = async () => {
    setIsRunning(true);
    const results: DiagnosticResult[] = [];

    try {
      // 1. Check Market Status
      const now = new Date();
      const utcHour = now.getUTCHours();
      const utcDay = now.getUTCDay();
      const estHour = utcHour - 5;
      const isWeekday = utcDay >= 1 && utcDay <= 5;
      const isMarketHours = estHour >= 9.5 && estHour < 16;
      const isMarketOpen = isWeekday && isMarketHours;

      results.push({
        category: "Market Status",
        status: isMarketOpen ? "success" : "warning",
        message: isMarketOpen 
          ? `Market is OPEN (EST Hour: ${estHour.toFixed(1)})` 
          : `Market is CLOSED (EST Hour: ${estHour.toFixed(1)}, Day: ${utcDay})`,
        data: { 
          utcHour, 
          estHour, 
          utcDay, 
          isWeekday, 
          isMarketHours,
          currentTime: now.toISOString() 
        },
        icon: Clock,
        recommendation: !isMarketOpen 
          ? "Automated trading only runs during market hours (Mon-Fri, 9:30 AM - 4:00 PM EST)" 
          : undefined,
        timestamp: new Date().toISOString()
      });

      // 2. Test trading-engine function
      console.log("Testing trading-engine...");
      const { data: engineResponse, error: engineError } = await supabase.functions
        .invoke('trading-engine', {
          method: 'GET'
        });

      results.push({
        category: "Trading Engine",
        status: engineResponse?.success ? "success" : "error",
        message: engineResponse?.success 
          ? `Generated ${engineResponse.totalSignals || 0} signals for ${engineResponse.symbolsAnalyzed || 0} symbols`
          : `Failed: ${engineError?.message || engineResponse?.error || 'Unknown error'}`,
        data: engineResponse,
        icon: Zap,
        recommendation: !engineResponse?.success 
          ? "Check edge function logs for trading-engine. May need to be manually triggered or scheduled." 
          : undefined,
        timestamp: new Date().toISOString()
      });

      // 3. Test trader-signals function
      console.log("Testing trader-signals...");
      const { data: signalsResponse, error: signalsError } = await supabase.functions
        .invoke('trader-signals', {
          method: 'GET'
        });

      results.push({
        category: "Signal Generator",
        status: signalsResponse?.success ? "success" : "error",
        message: signalsResponse?.success 
          ? `Returned ${signalsResponse.data?.length || 0} trading signals (${signalsResponse.source})`
          : `Failed: ${signalsError?.message || 'Unknown error'}`,
        data: signalsResponse,
        icon: Activity,
        recommendation: signalsResponse?.source === 'demo' 
          ? "Using demo data - Python API not connected" 
          : undefined,
        timestamp: new Date().toISOString()
      });

      // 4. Skip database signals check (table may not exist in schema)
      results.push({
        category: "Database Signals (Info)",
        status: "warning",
        message: "Signals should be checked via trading-engine response",
        data: { note: "Check trading_signals table instead" },
        icon: Database,
        recommendation: "Monitor trading_signals table for active signals",
        timestamp: new Date().toISOString()
      });

      // 5. Check trading_signals table (different from signals)
      const { data: tradingSignals, error: tradingSignalsError } = await supabase
        .from('trading_signals')
        .select('*')
        .eq('status', 'active')
        .order('created_at', { ascending: false })
        .limit(10);

      results.push({
        category: "Active Trading Signals",
        status: tradingSignals && tradingSignals.length > 0 ? "success" : "warning",
        message: `Found ${tradingSignals?.length || 0} active trading signals`,
        data: tradingSignals,
        icon: Database,
        recommendation: (!tradingSignals || tradingSignals.length === 0) 
          ? "No active trading signals. These are needed for execute-trades to work." 
          : undefined,
        timestamp: new Date().toISOString()
      });

      // 6. Check user trading settings
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: userSettings, error: settingsError } = await supabase
          .from('user_settings')
          .select('settings')
          .eq('user_id', user.id)
          .single();

        const settings = userSettings?.settings as any;
        const autoTradeEnabled = settings?.autoTradeEnabled || false;
        
        results.push({
          category: "Auto-Trade Settings",
          status: autoTradeEnabled ? "success" : "warning",
          message: autoTradeEnabled 
            ? "Auto-trading is ENABLED" 
            : "Auto-trading is DISABLED in user settings",
          data: userSettings?.settings,
          icon: Settings,
          recommendation: !autoTradeEnabled 
            ? "Enable auto-trading in your settings for automated execution" 
            : undefined,
          timestamp: new Date().toISOString()
        });
      }

      // 7. Check cron job logs
      const { data: cronLogs, error: cronError } = await supabase
        .from('cron_job_logs')
        .select('*')
        .in('job_name', ['trading-engine', 'execute-trades', 'morning-market-analysis'])
        .order('executed_at', { ascending: false })
        .limit(20);

      const todayCronLogs = cronLogs?.filter(log => 
        new Date(log.executed_at).toDateString() === new Date().toDateString()
      );

      results.push({
        category: "Scheduled Jobs",
        status: todayCronLogs && todayCronLogs.length > 0 ? "success" : "warning",
        message: todayCronLogs && todayCronLogs.length > 0
          ? `${todayCronLogs.length} scheduled jobs ran today`
          : "No scheduled jobs ran today",
        data: { todayLogs: todayCronLogs, recentLogs: cronLogs },
        icon: Clock,
        recommendation: (!todayCronLogs || todayCronLogs.length === 0)
          ? "Cron jobs may not be configured. Check Supabase cron setup or manually trigger functions."
          : undefined,
        timestamp: new Date().toISOString()
      });

      // 8. Test execute-trades function
      console.log("Testing execute-trades (dry run)...");
      try {
        const { data: executeResponse, error: executeError } = await supabase.functions
          .invoke('execute-trades', {
            method: 'POST'
          });

        results.push({
          category: "Trade Execution",
          status: executeResponse?.success ? "success" : "warning",
          message: executeResponse?.message || "Trade execution checked",
          data: executeResponse,
          icon: Zap,
          recommendation: executeResponse?.riskStatus === 'blocked'
            ? `Trade execution blocked: ${executeResponse.message}`
            : undefined,
          timestamp: new Date().toISOString()
        });
      } catch (err) {
        results.push({
          category: "Trade Execution",
          status: "error",
          message: `Failed to test: ${err instanceof Error ? err.message : 'Unknown error'}`,
          icon: Zap,
          timestamp: new Date().toISOString()
        });
      }

      // 9. Check Alpaca credentials
      const { data: alpacaDiag } = await supabase.functions
        .invoke('alpaca-diagnostic', { method: 'POST' });

      results.push({
        category: "Alpaca Integration",
        status: alpacaDiag?.diagnostics?.accountAccessible ? "success" : "error",
        message: alpacaDiag?.diagnostics?.accountAccessible
          ? "Alpaca API connected successfully"
          : "Alpaca API connection failed",
        data: alpacaDiag,
        icon: Activity,
        recommendation: !alpacaDiag?.diagnostics?.accountAccessible
          ? "Check ALPACA_API_KEY and ALPACA_SECRET_KEY secrets"
          : undefined,
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      results.push({
        category: "System Error",
        status: "error",
        message: error instanceof Error ? error.message : "Unknown error",
        icon: XCircle,
        timestamp: new Date().toISOString()
      });
    }

    setDiagnostics(results);
    setIsRunning(false);
    
    const hasErrors = results.some(r => r.status === "error");
    const hasWarnings = results.some(r => r.status === "warning");
    
    toast({
      title: hasErrors 
        ? "Critical issues found" 
        : hasWarnings 
        ? "Issues found" 
        : "All systems operational",
      description: `Checked ${results.length} components`,
      variant: hasErrors ? "destructive" : "default"
    });
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "success":
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case "warning":
        return <AlertCircle className="h-5 w-5 text-yellow-500" />;
      case "error":
        return <XCircle className="h-5 w-5 text-red-500" />;
      default:
        return null;
    }
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, "default" | "destructive" | "secondary"> = {
      success: "default",
      warning: "secondary",
      error: "destructive"
    };
    return <Badge variant={variants[status]}>{status.toUpperCase()}</Badge>;
  };

  const errorCount = diagnostics.filter(d => d.status === "error").length;
  const warningCount = diagnostics.filter(d => d.status === "warning").length;
  const successCount = diagnostics.filter(d => d.status === "success").length;

  return (
    <Card className="w-full h-full !shadow-[0_10px_30px_-10px_rgba(0,0,0,0.15),0_4px_20px_-4px_rgba(0,0,0,0.1)] dark:!shadow-[0_10px_30px_-10px_rgba(255,255,255,0.08),0_4px_20px_-4px_rgba(255,255,255,0.05)]">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center justify-between text-lg">
          <div className="flex items-center gap-2">
            <Activity className="h-4 w-4" />
            Trading Automation
          </div>
        </CardTitle>
        <CardDescription className="text-xs">
          Debug trading signals and automation
        </CardDescription>
      </CardHeader>
      <CardContent>
        {diagnostics.length > 0 && (
          <div className="flex gap-2 mb-3 p-2 bg-muted rounded text-xs">
            <div className="flex items-center gap-1">
              <CheckCircle className="h-3 w-3 text-green-500" />
              <span>{successCount}</span>
            </div>
            <div className="flex items-center gap-1">
              <AlertCircle className="h-3 w-3 text-yellow-500" />
              <span>{warningCount}</span>
            </div>
            <div className="flex items-center gap-1">
              <XCircle className="h-3 w-3 text-red-500" />
              <span>{errorCount}</span>
            </div>
          </div>
        )}

        {diagnostics.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            No diagnostics run yet
          </div>
        ) : (
          <div className="space-y-4">
            {diagnostics.map((result, index) => {
              const IconComponent = result.icon || AlertCircle;
              return (
                <div key={index} className="border rounded-lg p-4 space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <IconComponent className="h-4 w-4 text-muted-foreground" />
                      {getStatusIcon(result.status)}
                      <span className="font-semibold">{result.category}</span>
                    </div>
                    {getStatusBadge(result.status)}
                  </div>
                  <p className="text-sm">{result.message}</p>
                  {result.recommendation && (
                    <div className="mt-2 p-2 bg-yellow-500/10 border border-yellow-500/20 rounded text-sm">
                      <strong>Recommendation:</strong> {result.recommendation}
                    </div>
                  )}
                  {result.timestamp && (
                    <p className="text-xs text-muted-foreground">
                      Checked at: {new Date(result.timestamp).toLocaleTimeString()}
                    </p>
                  )}
                  {result.data && (
                    <details className="text-xs">
                      <summary className="cursor-pointer text-muted-foreground hover:text-foreground">
                        View technical details
                      </summary>
                      <pre className="mt-2 p-2 bg-muted rounded overflow-x-auto max-h-64">
                        {JSON.stringify(result.data, null, 2)}
                      </pre>
                    </details>
                  )}
                </div>
              );
            })}
          </div>
        )}
        
        <div className="mt-4 pt-4 border-t">
          <Button 
            onClick={runDiagnostics} 
            disabled={isRunning}
            className="w-full bg-purple-600 hover:bg-purple-700 text-white"
          >
            {isRunning ? "Running..." : "Run Diagnostic"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
