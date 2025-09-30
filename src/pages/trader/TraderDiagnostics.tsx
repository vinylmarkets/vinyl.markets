import { useState, useEffect } from "react";
import { TraderProtection } from "@/components/trader/TraderProtection";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Activity, AlertTriangle, CheckCircle2, XCircle, RefreshCw } from "lucide-react";
import { Link } from "react-router-dom";
import { DiagnosticStatusOverview } from "@/trader-platform/components/diagnostics/DiagnosticStatusOverview";
import { ConnectionDiagnostics } from "@/trader-platform/components/diagnostics/ConnectionDiagnostics";
import { ErrorLogViewer } from "@/trader-platform/components/diagnostics/ErrorLogViewer";
import { PerformanceAnalytics } from "@/trader-platform/components/diagnostics/PerformanceAnalytics";
import { DebugConsole } from "@/trader-platform/components/diagnostics/DebugConsole";
import { AlertConfiguration } from "@/trader-platform/components/diagnostics/AlertConfiguration";
import { ResourceMonitor } from "@/trader-platform/components/diagnostics/ResourceMonitor";

export default function TraderDiagnostics() {
  const [globalStatus, setGlobalStatus] = useState<'operational' | 'degraded' | 'critical'>('operational');
  const [lastUpdate, setLastUpdate] = useState(new Date());
  const [autoRefresh, setAutoRefresh] = useState(false);
  const [refreshInterval, setRefreshInterval] = useState(10);

  useEffect(() => {
    if (autoRefresh) {
      const interval = setInterval(() => {
        setLastUpdate(new Date());
        // Trigger refresh logic here
      }, refreshInterval * 1000);
      return () => clearInterval(interval);
    }
  }, [autoRefresh, refreshInterval]);

  const getStatusIcon = () => {
    switch (globalStatus) {
      case 'operational':
        return <CheckCircle2 className="h-5 w-5 text-success" />;
      case 'degraded':
        return <AlertTriangle className="h-5 w-5 text-warning" />;
      case 'critical':
        return <XCircle className="h-5 w-5 text-destructive" />;
    }
  };

  const getStatusColor = () => {
    switch (globalStatus) {
      case 'operational':
        return 'bg-success/10 text-success';
      case 'degraded':
        return 'bg-warning/10 text-warning';
      case 'critical':
        return 'bg-destructive/10 text-destructive';
    }
  };

  return (
    <TraderProtection>
      <div className="min-h-screen bg-background">
        {/* Header */}
        <div className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-10">
          <div className="container mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Link to="/trader">
                  <Button variant="ghost" size="icon">
                    <ArrowLeft className="h-5 w-5" />
                  </Button>
                </Link>
                <div>
                  <h1 className="text-2xl font-bold flex items-center gap-2">
                    <Activity className="h-6 w-6" />
                    Trading Algorithm Diagnostics
                  </h1>
                  <p className="text-sm text-muted-foreground">
                    Monitor, troubleshoot, and optimize your trading algorithms
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  {getStatusIcon()}
                  <Badge className={getStatusColor()}>
                    {globalStatus === 'operational' && 'All Systems Operational'}
                    {globalStatus === 'degraded' && 'Issues Detected'}
                    {globalStatus === 'critical' && 'Critical Error'}
                  </Badge>
                </div>
                <div className="text-sm text-muted-foreground">
                  Last update: {lastUpdate.toLocaleTimeString()}
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setLastUpdate(new Date())}
                >
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Refresh
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="container mx-auto px-4 py-6">
          {/* Status Overview */}
          <DiagnosticStatusOverview onStatusChange={setGlobalStatus} />

          {/* Tabbed Interface */}
          <Card className="mt-6">
            <Tabs defaultValue="connections" className="w-full">
              <CardHeader>
                <TabsList className="grid grid-cols-7 gap-4 w-full">
                  <TabsTrigger value="connections">Connections</TabsTrigger>
                  <TabsTrigger value="logs">Error Logs</TabsTrigger>
                  <TabsTrigger value="performance">Performance</TabsTrigger>
                  <TabsTrigger value="debug">Debug</TabsTrigger>
                  <TabsTrigger value="alerts">Alerts</TabsTrigger>
                  <TabsTrigger value="resources">Resources</TabsTrigger>
                  <TabsTrigger value="settings">Settings</TabsTrigger>
                </TabsList>
              </CardHeader>
              <CardContent>
                <TabsContent value="connections" className="mt-0">
                  <ConnectionDiagnostics />
                </TabsContent>
                <TabsContent value="logs" className="mt-0">
                  <ErrorLogViewer />
                </TabsContent>
                <TabsContent value="performance" className="mt-0">
                  <PerformanceAnalytics />
                </TabsContent>
                <TabsContent value="debug" className="mt-0">
                  <DebugConsole />
                </TabsContent>
                <TabsContent value="alerts" className="mt-0">
                  <AlertConfiguration />
                </TabsContent>
                <TabsContent value="resources" className="mt-0">
                  <ResourceMonitor />
                </TabsContent>
                <TabsContent value="settings" className="mt-0">
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold">Diagnostic Settings</h3>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <label className="text-sm">Auto-refresh</label>
                        <Button
                          variant={autoRefresh ? "default" : "outline"}
                          size="sm"
                          onClick={() => setAutoRefresh(!autoRefresh)}
                        >
                          {autoRefresh ? "Enabled" : "Disabled"}
                        </Button>
                      </div>
                      {autoRefresh && (
                        <div className="flex items-center gap-2">
                          <label className="text-sm">Interval (seconds):</label>
                          <select
                            value={refreshInterval}
                            onChange={(e) => setRefreshInterval(Number(e.target.value))}
                            className="border rounded px-2 py-1"
                          >
                            <option value={5}>5s</option>
                            <option value={10}>10s</option>
                            <option value={30}>30s</option>
                            <option value={60}>60s</option>
                          </select>
                        </div>
                      )}
                    </div>
                  </div>
                </TabsContent>
              </CardContent>
            </Tabs>
          </Card>
        </div>
      </div>
    </TraderProtection>
  );
}