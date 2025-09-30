import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Activity, Database, TrendingUp, AlertCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface StatusOverviewProps {
  onStatusChange: (status: 'operational' | 'degraded' | 'critical') => void;
}

export function DiagnosticStatusOverview({ onStatusChange }: StatusOverviewProps) {
  const [algorithmStatus, setAlgorithmStatus] = useState({ running: 0, stopped: 0, errors: 0 });
  const [connectionHealth, setConnectionHealth] = useState({ healthy: 0, unhealthy: 0 });
  const [performanceMetrics, setPerformanceMetrics] = useState({ trades: 0, successRate: 0, pnl: 0 });
  const [alertCount, setAlertCount] = useState({ errors: 0, warnings: 0, info: 0 });
  const { toast } = useToast();

  useEffect(() => {
    fetchStatusData();
    const interval = setInterval(fetchStatusData, 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchStatusData = async () => {
    try {
      // Fetch algorithm status
      const { data: algos } = await supabase.functions.invoke('diagnostics', {
        body: { action: 'get_algorithm_status' }
      });

      if (algos?.algorithms) {
        const running = algos.algorithms.filter((a: any) => a.status === 'running').length;
        const stopped = algos.algorithms.filter((a: any) => a.status === 'stopped').length;
        const errors = algos.algorithms.filter((a: any) => a.status === 'error').length;
        setAlgorithmStatus({ running, stopped, errors });

        // Update global status based on errors
        if (errors > 0) {
          onStatusChange('critical');
        } else if (stopped > running) {
          onStatusChange('degraded');
        } else {
          onStatusChange('operational');
        }
      }

      // Fetch connection health
      const { data: connections } = await supabase
        .from('connection_health')
        .select('*')
        .order('last_tested', { ascending: false })
        .limit(10);

      if (connections) {
        const healthy = connections.filter(c => c.status).length;
        const unhealthy = connections.filter(c => !c.status).length;
        setConnectionHealth({ healthy, unhealthy });
      }

      // Fetch recent logs for alerts
      const { data: logs } = await supabase.functions.invoke('diagnostics', {
        body: { action: 'get_logs', limit: 100 }
      });

      if (logs?.logs) {
        const errors = logs.logs.filter((l: any) => l.severity === 'error').length;
        const warnings = logs.logs.filter((l: any) => l.severity === 'warning').length;
        const info = logs.logs.filter((l: any) => l.severity === 'info').length;
        setAlertCount({ errors, warnings, info });
      }

      // Fetch performance data from trader-positions
      const { data: positions } = await supabase.functions.invoke('trader-positions');
      if (positions?.data) {
        setPerformanceMetrics({
          trades: positions.data.recentTrades?.length || 0,
          successRate: 0, // Calculate from actual trade data
          pnl: positions.data.totalPnL || 0
        });
      }
    } catch (error) {
      console.error('Error fetching status data:', error);
      toast({
        title: "Error",
        description: "Failed to fetch diagnostic status",
        variant: "destructive"
      });
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Algorithm Status</CardTitle>
          <Activity className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-success">{algorithmStatus.running}</div>
          <p className="text-xs text-muted-foreground">
            Running • {algorithmStatus.stopped} stopped • {algorithmStatus.errors} errors
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Connection Health</CardTitle>
          <Database className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-success">{connectionHealth.healthy}</div>
          <p className="text-xs text-muted-foreground">
            Healthy • {connectionHealth.unhealthy} unhealthy
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Performance Metrics</CardTitle>
          <TrendingUp className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">${performanceMetrics.pnl.toFixed(2)}</div>
          <p className="text-xs text-muted-foreground">
            {performanceMetrics.trades} trades today • {performanceMetrics.successRate}% success
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Alert Summary</CardTitle>
          <AlertCircle className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-destructive">{alertCount.errors}</div>
          <p className="text-xs text-muted-foreground">
            Errors • {alertCount.warnings} warnings • {alertCount.info} info
          </p>
        </CardContent>
      </Card>
    </div>
  );
}