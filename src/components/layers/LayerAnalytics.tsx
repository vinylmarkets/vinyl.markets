import { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';
import { ArrowLeft, TrendingUp, AlertTriangle, Target } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Skeleton } from '@/components/ui/skeleton';
import { LayerConfigService } from '@/lib/ampLayering/layerConfigService';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

export function LayerAnalytics() {
  const { layerId } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [layerName, setLayerName] = useState('');
  const [performanceData, setPerformanceData] = useState<any[]>([]);
  const [conflictData, setConflictData] = useState<any[]>([]);
  const [ampPerformance, setAmpPerformance] = useState<any[]>([]);
  const configService = new LayerConfigService();

  useEffect(() => {
    if (layerId) {
      loadAnalytics();
    }
  }, [layerId]);

  async function loadAnalytics() {
    if (!layerId) return;

    try {
      // Load layer info
      const config = await configService.getLayerConfig(layerId);
      setLayerName(config.layer.name);

      // Load performance data
      const { data: perfData, error: perfError } = await supabase
        .from('layer_performance')
        .select('*')
        .eq('layer_id', layerId)
        .order('date', { ascending: true })
        .limit(30);

      if (perfError) throw perfError;

      const formattedPerfData = (perfData || []).map(p => ({
        date: new Date(p.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        pnl: parseFloat(String(p.pnl || 0)),
        pnl_percentage: parseFloat(String(p.pnl_percentage || 0)),
        trades: p.trades_count || 0,
        wins: p.wins || 0,
        losses: p.losses || 0,
      }));

      setPerformanceData(formattedPerfData);

      // Load conflict data
      const { data: conflictDataRaw, error: conflictError } = await supabase
        .from('layer_conflicts')
        .select('*')
        .eq('layer_id', layerId)
        .order('timestamp', { ascending: false })
        .limit(100);

      if (conflictError) throw conflictError;

      setConflictData(conflictDataRaw || []);

      // Load amp performance data
      const { data: ampPerfData, error: ampPerfError } = await supabase
        .from('layer_amp_performance')
        .select('*')
        .eq('layer_id', layerId)
        .order('date', { ascending: false })
        .limit(100);

      if (ampPerfError) throw ampPerfError;

      // Aggregate by amp_id
      const ampAggregated = (ampPerfData || []).reduce((acc: any, curr: any) => {
        if (!acc[curr.amp_id]) {
          acc[curr.amp_id] = {
            amp_id: curr.amp_id,
            total_pnl: 0,
            total_trades: 0,
            total_signals: 0,
            conflicts_won: 0,
          };
        }
        acc[curr.amp_id].total_pnl += parseFloat(String(curr.pnl || 0));
        acc[curr.amp_id].total_trades += curr.trades_executed || 0;
        acc[curr.amp_id].total_signals += curr.signals_generated || 0;
        acc[curr.amp_id].conflicts_won += curr.conflicts_won || 0;
        return acc;
      }, {});

      setAmpPerformance(Object.values(ampAggregated));
    } catch (error) {
      console.error('Failed to load analytics:', error);
    } finally {
      setLoading(false);
    }
  }

  const conflictStats = {
    total: conflictData.length,
    withConflicts: conflictData.filter(c => c.had_conflict).length,
    byResolution: conflictData.reduce((acc: any, curr) => {
      const method = curr.resolution_method || 'unknown';
      acc[method] = (acc[method] || 0) + 1;
      return acc;
    }, {}),
  };

  const resolutionChartData = Object.entries(conflictStats.byResolution).map(([name, value]) => ({
    name: name.charAt(0).toUpperCase() + name.slice(1),
    value,
  }));

  if (loading) {
    return (
      <div className="container mx-auto p-6 space-y-6">
        <Skeleton className="h-8 w-64" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[1, 2, 3].map(i => (
            <Skeleton key={i} className="h-32" />
          ))}
        </div>
        <Skeleton className="h-96" />
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate('/trader/layers')}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold">{layerName} Analytics</h1>
          <p className="text-muted-foreground">Performance metrics and signal coordination analysis</p>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total P&L</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${performanceData.reduce((sum, d) => sum + d.pnl, 0).toFixed(2)}
            </div>
            <p className="text-xs text-muted-foreground">
              Across {performanceData.reduce((sum, d) => sum + d.trades, 0)} trades
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Win Rate</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {performanceData.length > 0
                ? (
                    (performanceData.reduce((sum, d) => sum + d.wins, 0) /
                      performanceData.reduce((sum, d) => sum + (d.wins + d.losses), 0)) *
                    100
                  ).toFixed(1)
                : 0}
              %
            </div>
            <p className="text-xs text-muted-foreground">
              {performanceData.reduce((sum, d) => sum + d.wins, 0)} wins /{' '}
              {performanceData.reduce((sum, d) => sum + d.losses, 0)} losses
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Conflicts</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{conflictStats.withConflicts}</div>
            <p className="text-xs text-muted-foreground">
              {conflictStats.total > 0
                ? ((conflictStats.withConflicts / conflictStats.total) * 100).toFixed(1)
                : 0}
              % of signals had conflicts
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Analytics Tabs */}
      <Tabs defaultValue="performance" className="space-y-4">
        <TabsList>
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="conflicts">Conflicts</TabsTrigger>
          <TabsTrigger value="amps">Amp Contributions</TabsTrigger>
        </TabsList>

        <TabsContent value="performance" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>P&L Over Time</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={performanceData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="pnl" stroke="#8884d8" name="P&L ($)" />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Trade Volume</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={performanceData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="wins" fill="#00C49F" name="Wins" />
                  <Bar dataKey="losses" fill="#FF8042" name="Losses" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="conflicts" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Conflict Resolution Methods</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={resolutionChartData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }: any) => `${name}: ${((percent || 0) * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {resolutionChartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Recent Conflicts</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {conflictData.slice(0, 10).map(conflict => (
                  <div key={conflict.id} className="flex items-center justify-between p-3 border rounded">
                    <div>
                      <div className="font-medium">{conflict.symbol}</div>
                      <div className="text-sm text-muted-foreground">
                        {new Date(conflict.timestamp).toLocaleString()}
                      </div>
                    </div>
                    <div className="text-right">
                      <Badge variant={conflict.had_conflict ? 'destructive' : 'default'}>
                        {conflict.resolution_method}
                      </Badge>
                      <div className="text-sm text-muted-foreground">{conflict.final_action}</div>
                    </div>
                  </div>
                ))}
                {conflictData.length === 0 && (
                  <p className="text-center text-muted-foreground py-8">No conflicts recorded yet</p>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="amps" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Amp Contributions</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={ampPerformance}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="amp_id" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="total_pnl" fill="#8884d8" name="Total P&L" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Amp Statistics</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {ampPerformance.map(amp => (
                  <div key={amp.amp_id} className="flex items-center justify-between p-3 border rounded">
                    <div>
                      <div className="font-medium">{amp.amp_id}</div>
                      <div className="text-sm text-muted-foreground">
                        {amp.total_trades} trades • {amp.total_signals} signals
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-bold">${amp.total_pnl.toFixed(2)}</div>
                      <div className="text-sm text-muted-foreground">
                        {amp.conflicts_won} conflicts won
                      </div>
                    </div>
                  </div>
                ))}
                {ampPerformance.length === 0 && (
                  <p className="text-center text-muted-foreground py-8">No amp performance data yet</p>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
