import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from "recharts";
import { AlertTriangle, Shield, FileCheck, Bell, Users, TrendingDown } from "lucide-react";

interface ComplianceData {
  flaggingAlerts: Array<{ date: string; count: number; severity: string }>;
  reviewQueue: Array<{ id: string; type: string; content: string; flaggedAt: string; severity: string; status: string }>;
  complaintTracking: Array<{ category: string; count: number; resolved: number }>;
  auditLogs: Array<{ event: string; user: string; timestamp: string; riskLevel: string }>;
  complianceStatus: Array<{ requirement: string; status: 'compliant' | 'pending' | 'non-compliant'; lastCheck: string }>;
  riskDistribution: Array<{ level: string; count: number; percentage: number }>;
}

const COLORS = ['hsl(var(--chart-1))', 'hsl(var(--chart-2))', 'hsl(var(--chart-3))', 'hsl(var(--chart-4))'];
const SEVERITY_COLORS = {
  high: 'hsl(var(--destructive))',
  medium: 'hsl(var(--warning))',
  low: 'hsl(var(--muted-foreground))'
};

export default function ComplianceMonitoring() {
  const [complianceData, setComplianceData] = useState<ComplianceData | null>(null);
  const [loading, setLoading] = useState(true);
  const [totalFlags, setTotalFlags] = useState(0);
  const [pendingReviews, setPendingReviews] = useState(0);
  const [complianceScore, setComplianceScore] = useState(0);

  useEffect(() => {
    fetchComplianceData();
  }, []);

  const fetchComplianceData = async () => {
    try {
      // Fetch content flags
      const { data: contentFlags } = await supabase
        .from('content_flags')
        .select('*')
        .order('created_at', { ascending: false });

      // Fetch compliance logs
      const { data: complianceLogs } = await supabase
        .from('compliance_logs')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(100);

      // Process flagging alerts by date
      const flagsByDate = contentFlags?.reduce((acc: any, flag) => {
        const date = new Date(flag.created_at).toLocaleDateString();
        if (!acc[date]) {
          acc[date] = { date, count: 0, high: 0, medium: 0, low: 0 };
        }
        acc[date].count++;
        acc[date][flag.flag_severity || 'medium']++;
        return acc;
      }, {}) || {};

      const flaggingAlerts = Object.values(flagsByDate).slice(-30) as any[];

      // Process review queue
      const reviewQueue = contentFlags?.filter(flag => !flag.reviewed).map(flag => ({
        id: flag.id,
        type: flag.content_type,
        content: flag.flag_reason,
        flaggedAt: new Date(flag.created_at).toLocaleDateString(),
        severity: flag.flag_severity || 'medium',
        status: flag.reviewed ? 'reviewed' : 'pending'
      })) || [];

      // Mock complaint tracking data
      const complaintTracking = [
        { category: 'Content Quality', count: 12, resolved: 10 },
        { category: 'Technical Issues', count: 8, resolved: 7 },
        { category: 'Billing', count: 5, resolved: 5 },
        { category: 'Data Privacy', count: 3, resolved: 3 },
        { category: 'User Experience', count: 15, resolved: 12 }
      ];

      // Process audit logs
      const auditLogs = complianceLogs?.map(log => ({
        event: log.event_description,
        user: log.reviewer || 'System',
        timestamp: new Date(log.created_at).toLocaleTimeString(),
        riskLevel: log.risk_level || 'low'
      })) || [];

      // Mock compliance status
      const complianceStatus = [
        { requirement: 'GDPR Compliance', status: 'compliant' as const, lastCheck: '2024-01-15' },
        { requirement: 'SOC 2 Type II', status: 'compliant' as const, lastCheck: '2024-01-10' },
        { requirement: 'Financial Regulations', status: 'compliant' as const, lastCheck: '2024-01-14' },
        { requirement: 'Data Encryption', status: 'compliant' as const, lastCheck: '2024-01-16' },
        { requirement: 'Access Controls', status: 'pending' as const, lastCheck: '2024-01-12' },
        { requirement: 'Audit Logging', status: 'compliant' as const, lastCheck: '2024-01-16' }
      ];

      // Calculate risk distribution
      const riskCounts = contentFlags?.reduce((acc: any, flag) => {
        const severity = flag.flag_severity || 'medium';
        acc[severity] = (acc[severity] || 0) + 1;
        return acc;
      }, {}) || {};

      const totalRisks = Object.values(riskCounts).reduce((sum: number, count: any) => sum + count, 0);
      const riskDistribution = Object.entries(riskCounts).map(([level, count]) => ({
        level: level.charAt(0).toUpperCase() + level.slice(1),
        count: count as number,
        percentage: totalRisks > 0 ? ((count as number) / totalRisks) * 100 : 0
      }));

      setComplianceData({
        flaggingAlerts,
        reviewQueue,
        complaintTracking,
        auditLogs,
        complianceStatus,
        riskDistribution
      });

      // Calculate summary metrics
      setTotalFlags(contentFlags?.length || 0);
      setPendingReviews(reviewQueue.length);
      
      // Calculate compliance score (percentage of compliant requirements)
      const compliantCount = complianceStatus.filter(s => s.status === 'compliant').length;
      setComplianceScore((compliantCount / complianceStatus.length) * 100);

    } catch (error) {
      console.error('Error fetching compliance data:', error);
    } finally {
      setLoading(false);
    }
  };

  const resolveFlag = async (flagId: string) => {
    try {
      await supabase
        .from('content_flags')
        .update({ reviewed: true, resolved_at: new Date().toISOString() })
        .eq('id', flagId);
      
      // Refresh data
      fetchComplianceData();
    } catch (error) {
      console.error('Error resolving flag:', error);
    }
  };

  if (loading) {
    return <div className="p-6">Loading compliance monitoring...</div>;
  }

  const chartConfig = {
    count: { label: "Alerts", color: "hsl(var(--chart-1))" },
    resolved: { label: "Resolved", color: "hsl(var(--chart-2))" }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Compliance Monitoring</h1>
        <Badge variant={complianceScore >= 90 ? "default" : complianceScore >= 70 ? "secondary" : "destructive"}>
          {complianceScore.toFixed(0)}% Compliant
        </Badge>
      </div>

      {/* Compliance Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Flags</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalFlags}</div>
            <p className="text-xs text-muted-foreground">Content flags raised</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Reviews</CardTitle>
            <FileCheck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{pendingReviews}</div>
            <p className="text-xs text-muted-foreground">Awaiting review</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Compliance Score</CardTitle>
            <Shield className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{complianceScore.toFixed(0)}%</div>
            <p className="text-xs text-muted-foreground">Overall compliance</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Risk Level</CardTitle>
            <TrendingDown className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">Low</div>
            <p className="text-xs text-muted-foreground">Current risk assessment</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="alerts" className="space-y-4">
        <TabsList>
          <TabsTrigger value="alerts">Flagging Alerts</TabsTrigger>
          <TabsTrigger value="queue">Review Queue</TabsTrigger>
          <TabsTrigger value="complaints">Complaints</TabsTrigger>
          <TabsTrigger value="audit">Audit Logs</TabsTrigger>
          <TabsTrigger value="status">Compliance Status</TabsTrigger>
          <TabsTrigger value="risk">Risk Assessment</TabsTrigger>
        </TabsList>

        <TabsContent value="alerts">
          <Card>
            <CardHeader>
              <CardTitle>Content Flagging Alerts</CardTitle>
              <CardDescription>Timeline of content flags and compliance alerts</CardDescription>
            </CardHeader>
            <CardContent>
              <ChartContainer config={chartConfig} className="h-[400px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={complianceData?.flaggingAlerts}>
                    <XAxis dataKey="date" />
                    <YAxis />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Line type="monotone" dataKey="count" stroke="var(--color-count)" strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              </ChartContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="queue">
          <Card>
            <CardHeader>
              <CardTitle>Compliance Review Queue</CardTitle>
              <CardDescription>Items pending compliance review and approval</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {complianceData?.reviewQueue.length ? (
                  complianceData.reviewQueue.map((item) => (
                    <div key={item.id} className="flex items-center justify-between p-4 rounded-lg border">
                      <div className="flex items-center space-x-4">
                        <AlertTriangle className={`h-5 w-5 ${
                          item.severity === 'high' ? 'text-destructive' : 
                          item.severity === 'medium' ? 'text-yellow-500' : 'text-muted-foreground'
                        }`} />
                        <div>
                          <div className="font-medium">{item.type}</div>
                          <div className="text-sm text-muted-foreground">{item.content}</div>
                          <div className="text-xs text-muted-foreground">Flagged: {item.flaggedAt}</div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Badge variant={
                          item.severity === 'high' ? 'destructive' : 
                          item.severity === 'medium' ? 'secondary' : 'outline'
                        }>
                          {item.severity}
                        </Badge>
                        <Button size="sm" onClick={() => resolveFlag(item.id)}>
                          Resolve
                        </Button>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <FileCheck className="h-12 w-12 mx-auto mb-4 text-green-500" />
                    <p>No pending reviews</p>
                    <p className="text-sm">All content has been reviewed</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="complaints">
          <Card>
            <CardHeader>
              <CardTitle>User Complaint Tracking</CardTitle>
              <CardDescription>Categories and resolution status of user complaints</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <ChartContainer config={chartConfig} className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={complianceData?.complaintTracking}>
                      <XAxis dataKey="category" angle={-45} textAnchor="end" height={80} />
                      <YAxis />
                      <ChartTooltip content={<ChartTooltipContent />} />
                      <Bar dataKey="count" fill="var(--color-count)" />
                      <Bar dataKey="resolved" fill="var(--color-resolved)" />
                    </BarChart>
                  </ResponsiveContainer>
                </ChartContainer>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {complianceData?.complaintTracking.map((complaint) => (
                    <div key={complaint.category} className="p-4 rounded-lg border">
                      <div className="flex items-center justify-between mb-2">
                        <div className="font-medium">{complaint.category}</div>
                        <Badge variant="outline">{complaint.count} total</Badge>
                      </div>
                      <div className="flex items-center justify-between text-sm text-muted-foreground">
                        <span>Resolved: {complaint.resolved}</span>
                        <span>{((complaint.resolved / complaint.count) * 100).toFixed(0)}%</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="audit">
          <Card>
            <CardHeader>
              <CardTitle>System Audit Logs</CardTitle>
              <CardDescription>Recent system events and compliance activities</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4 max-h-96 overflow-y-auto">
                {complianceData?.auditLogs.map((log, index) => (
                  <div key={index} className="flex items-center justify-between p-3 rounded-lg border">
                    <div className="flex items-center space-x-3">
                      <div className={`w-2 h-2 rounded-full ${
                        log.riskLevel === 'high' ? 'bg-destructive' :
                        log.riskLevel === 'medium' ? 'bg-yellow-500' : 'bg-green-500'
                      }`}></div>
                      <div>
                        <div className="font-medium text-sm">{log.event}</div>
                        <div className="text-xs text-muted-foreground">by {log.user} at {log.timestamp}</div>
                      </div>
                    </div>
                    <Badge variant="outline" className="text-xs">
                      {log.riskLevel}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="status">
          <Card>
            <CardHeader>
              <CardTitle>Regulatory Compliance Status</CardTitle>
              <CardDescription>Status of various compliance requirements</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {complianceData?.complianceStatus.map((requirement) => (
                  <div key={requirement.requirement} className="flex items-center justify-between p-4 rounded-lg border">
                    <div>
                      <div className="font-medium">{requirement.requirement}</div>
                      <div className="text-sm text-muted-foreground">Last checked: {requirement.lastCheck}</div>
                    </div>
                    <Badge variant={
                      requirement.status === 'compliant' ? 'default' :
                      requirement.status === 'pending' ? 'secondary' : 'destructive'
                    }>
                      {requirement.status}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="risk">
          <Card>
            <CardHeader>
              <CardTitle>Risk Assessment Distribution</CardTitle>
              <CardDescription>Current risk levels across all flagged content</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <ChartContainer config={{}} className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={complianceData?.riskDistribution}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={100}
                        paddingAngle={5}
                        dataKey="count"
                      >
                        {complianceData?.riskDistribution.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <ChartTooltip content={<ChartTooltipContent />} />
                    </PieChart>
                  </ResponsiveContainer>
                </ChartContainer>
                
                <div className="space-y-4">
                  {complianceData?.riskDistribution.map((risk, index) => (
                    <div key={risk.level} className="flex items-center justify-between p-4 rounded-lg border">
                      <div className="flex items-center space-x-3">
                        <div className="w-4 h-4 rounded" style={{ backgroundColor: COLORS[index % COLORS.length] }}></div>
                        <span className="font-medium">{risk.level} Risk</span>
                      </div>
                      <div className="text-right">
                        <div className="font-bold">{risk.count}</div>
                        <div className="text-sm text-muted-foreground">{risk.percentage.toFixed(1)}%</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}