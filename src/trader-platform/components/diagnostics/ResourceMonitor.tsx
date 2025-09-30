import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Activity, Database, Zap, DollarSign } from "lucide-react";

export function ResourceMonitor() {
  // Mock data - in production, fetch from actual monitoring service
  const cpuUsage = 45;
  const memoryUsage = 62;
  const apiCallsUsed = 1250;
  const apiCallsLimit = 5000;
  const dbConnections = 8;
  const dbConnectionsLimit = 20;

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold">Resource Monitor</h3>
        <p className="text-sm text-muted-foreground">
          System health and resource utilization
        </p>
      </div>

      {/* System Resources */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">CPU Usage</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{cpuUsage}%</div>
            <Progress value={cpuUsage} className="mt-2" />
            <p className="text-xs text-muted-foreground mt-2">
              {cpuUsage < 50 ? 'Normal' : cpuUsage < 80 ? 'Moderate' : 'High'} utilization
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Memory Usage</CardTitle>
            <Zap className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{memoryUsage}%</div>
            <Progress value={memoryUsage} className="mt-2" />
            <p className="text-xs text-muted-foreground mt-2">
              {memoryUsage < 70 ? 'Healthy' : 'Consider optimization'}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* API Rate Limits */}
      <Card>
        <CardHeader>
          <CardTitle>API Rate Limits</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <div className="flex justify-between text-sm mb-2">
              <span>Polygon API Calls</span>
              <span>{apiCallsUsed} / {apiCallsLimit}</span>
            </div>
            <Progress value={(apiCallsUsed / apiCallsLimit) * 100} />
            <p className="text-xs text-muted-foreground mt-1">
              {apiCallsLimit - apiCallsUsed} calls remaining
            </p>
          </div>
          <div>
            <div className="flex justify-between text-sm mb-2">
              <span>Alpaca API Calls</span>
              <span>324 / 2000</span>
            </div>
            <Progress value={16.2} />
            <p className="text-xs text-muted-foreground mt-1">
              1676 calls remaining
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Database Performance */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0">
          <CardTitle>Database Performance</CardTitle>
          <Database className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <div className="flex justify-between text-sm mb-2">
              <span>Active Connections</span>
              <span>{dbConnections} / {dbConnectionsLimit}</span>
            </div>
            <Progress value={(dbConnections / dbConnectionsLimit) * 100} />
          </div>
          <div className="grid grid-cols-3 gap-4 text-sm">
            <div>
              <div className="text-muted-foreground">Avg Query Time</div>
              <div className="text-lg font-semibold">12ms</div>
            </div>
            <div>
              <div className="text-muted-foreground">Slow Queries</div>
              <div className="text-lg font-semibold">3</div>
            </div>
            <div>
              <div className="text-muted-foreground">DB Size</div>
              <div className="text-lg font-semibold">245MB</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Cost Tracking */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0">
          <CardTitle>Cost Tracking</CardTitle>
          <DollarSign className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <div className="text-sm text-muted-foreground">API Costs</div>
              <div className="text-2xl font-bold">$12.45</div>
              <p className="text-xs text-muted-foreground">This month</p>
            </div>
            <div>
              <div className="text-sm text-muted-foreground">Database</div>
              <div className="text-2xl font-bold">$25.00</div>
              <p className="text-xs text-muted-foreground">This month</p>
            </div>
            <div>
              <div className="text-sm text-muted-foreground">Total</div>
              <div className="text-2xl font-bold">$37.45</div>
              <p className="text-xs text-muted-foreground">This month</p>
            </div>
            <div>
              <div className="text-sm text-muted-foreground">Projected</div>
              <div className="text-2xl font-bold">$45.00</div>
              <p className="text-xs text-muted-foreground">Monthly</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}