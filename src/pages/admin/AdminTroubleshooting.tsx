import React, { useState } from "react";
import { AdminProtected } from "@/components/AdminProtected";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";
import { 
  CheckCircle2, 
  XCircle, 
  AlertTriangle, 
  Loader2, 
  Search,
  User,
  Cog,
  DollarSign,
  TrendingUp,
  Clock,
  Shield,
  Database as DatabaseIcon,
  Link as LinkIcon
} from "lucide-react";

interface DiagnosticResult {
  check: string;
  status: 'pass' | 'fail' | 'warning';
  message: string;
  details?: any;
  iconName: string;
}

const AdminTroubleshooting = () => {
  const [userEmail, setUserEmail] = useState("");
  const [userId, setUserId] = useState("");
  const [isRunning, setIsRunning] = useState(false);
  const [diagnostics, setDiagnostics] = useState<DiagnosticResult[]>([]);

  const runDiagnostics = async () => {
    if (!userEmail && !userId) {
      return;
    }

    setIsRunning(true);
    setDiagnostics([]);
    const results: DiagnosticResult[] = [];

    try {
      // 1. Check if user exists and is whitelisted (only if email provided)
      if (userEmail) {
        const { data: traderCheck } = await supabase
          .from('traders_whitelist')
          .select('*')
          .eq('email', userEmail)
          .maybeSingle();

        results.push({
          check: "Trader Whitelist",
          status: traderCheck ? 'pass' : 'fail',
          message: traderCheck 
            ? `User is whitelisted with ${traderCheck.access_level} access` 
            : "User is not in traders whitelist",
          details: traderCheck,
          iconName: 'User'
        });

        if (!traderCheck) {
          setDiagnostics(results);
          setIsRunning(false);
          return;
        }
      }

      // Use provided user ID
      if (!userId) {
        results.push({
          check: "User ID Required",
          status: 'fail',
          message: "Please provide the user's UUID to continue diagnostics.",
          details: { 
            note: "You can find the user ID in Supabase Auth Users table or by running: SELECT id FROM auth.users WHERE email='user@example.com'",
            whitelistedEmail: userEmail 
          },
          iconName: 'User'
        });
        setDiagnostics(results);
        setIsRunning(false);
        return;
      }

      // 2. Check broker integration
      const { data: integration } = await supabase
        .from('broker_integrations')
        .select('*')
        .eq('user_id', userId)
        .eq('is_active', true)
        .maybeSingle();

      results.push({
        check: "Broker Integration",
        status: integration ? 'pass' : 'fail',
        message: integration 
          ? `${integration.broker_name} integration active (${integration.environment})` 
          : "No active broker integration found",
        details: integration,
        iconName: 'Link'
      });

      // 3. Check paper trading account
      const { data: paperAccount } = await supabase
        .from('paper_accounts')
        .select('*')
        .eq('user_id', userId)
        .maybeSingle();

      results.push({
        check: "Paper Trading Account",
        status: paperAccount ? 'pass' : 'fail',
        message: paperAccount 
          ? `Account exists with $${paperAccount.current_cash} cash` 
          : "No paper trading account found",
        details: paperAccount,
        iconName: 'Database'
      });

      // 4. Check user amps
      const { data: amps } = await supabase
        .from('user_amps')
        .select(`
          *,
          user_amp_settings (*)
        `)
        .eq('user_id', userId);

      const activeAmps = amps?.filter(a => a.is_active) || [];

      results.push({
        check: "User Amps",
        status: activeAmps.length > 0 ? 'pass' : 'warning',
        message: `${activeAmps.length} active amps out of ${amps?.length || 0} total`,
        details: amps,
        iconName: 'Cog'
      });

      // 5. Check allocated capital
      const totalAllocated = amps?.reduce((sum, amp) => sum + (amp.allocated_capital || 0), 0) || 0;

      results.push({
        check: "Allocated Capital",
        status: totalAllocated > 0 ? 'pass' : 'fail',
        message: `$${totalAllocated} allocated across ${activeAmps.length} amps`,
        details: { totalAllocated, amps: amps?.map(a => ({ name: a.name, capital: a.allocated_capital })) },
        iconName: 'DollarSign'
      });

      // 6. Check trading signals - bypass type checking for complex query
      let signals: any[] = [];
      let signalCount = 0;
      try {
        const res = await (supabase as any)
          .from('trading_signals')
          .select('*')
          .eq('user_id', userId)
          .eq('status', 'active')
          .gte('expires_at', new Date().toISOString());
        
        signals = res.data || [];
        signalCount = signals.length;
      } catch (e) {
        console.error('Error fetching signals:', e);
      }

      results.push({
        check: "Active Trading Signals",
        status: signalCount > 0 ? 'pass' : 'warning',
        message: `${signalCount} active unexpired signals`,
        details: signals,
        iconName: 'TrendingUp'
      });

      // 7. Check market hours
      const now = new Date();
      const estTime = new Date(now.toLocaleString('en-US', { timeZone: 'America/New_York' }));
      const hour = estTime.getHours();
      const minute = estTime.getMinutes();
      const isMarketHours = (hour > 9 || (hour === 9 && minute >= 30)) && hour < 16;

      results.push({
        check: "Market Hours",
        status: isMarketHours ? 'pass' : 'warning',
        message: isMarketHours 
          ? "Market is currently open" 
          : "Market is currently closed",
        details: { estTime: estTime.toLocaleString(), isOpen: isMarketHours },
        iconName: 'Clock'
      });

      // 8. Check recent amp events
      const { data: events } = await supabase
        .from('amp_events')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(10);

      results.push({
        check: "Recent Amp Events",
        status: 'pass',
        message: `${events?.length || 0} recent events found`,
        details: events,
        iconName: 'Shield'
      });

      // 9. Call backend diagnostics
      const { data: backendDiag, error: diagError } = await supabase.functions.invoke('diagnostics', {
        body: { action: 'test_connection', connectionType: 'broker' }
      });

      results.push({
        check: "Backend Broker Connection",
        status: !diagError && backendDiag?.status ? 'pass' : 'fail',
        message: !diagError && backendDiag?.status 
          ? "Broker API connection successful" 
          : `Broker connection failed: ${backendDiag?.error || diagError?.message || 'Unknown error'}`,
        details: backendDiag,
        iconName: 'Link'
      });

    } catch (error: any) {
      results.push({
        check: "Diagnostics Error",
        status: 'fail',
        message: error.message || "Unknown error occurred",
        details: error,
        iconName: 'XCircle'
      });
    }

    setDiagnostics(results);
    setIsRunning(false);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pass':
        return <CheckCircle2 className="h-5 w-5 text-green-500" />;
      case 'fail':
        return <XCircle className="h-5 w-5 text-red-500" />;
      case 'warning':
        return <AlertTriangle className="h-5 w-5 text-yellow-500" />;
      default:
        return null;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pass':
        return <Badge className="bg-green-500">Pass</Badge>;
      case 'fail':
        return <Badge variant="destructive">Fail</Badge>;
      case 'warning':
        return <Badge className="bg-yellow-500">Warning</Badge>;
      default:
        return null;
    }
  };

  const passCount = diagnostics.filter(d => d.status === 'pass').length;
  const failCount = diagnostics.filter(d => d.status === 'fail').length;
  const warningCount = diagnostics.filter(d => d.status === 'warning').length;

  return (
    <AdminProtected>
      <div className="min-h-screen bg-background p-6">
        <div className="max-w-6xl mx-auto space-y-6">
          <div>
            <h1 className="text-3xl font-bold">Admin Troubleshooting</h1>
            <p className="text-muted-foreground">
              Diagnose auto-trading issues for any user
            </p>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>User Auto-Trading Diagnostics</CardTitle>
              <CardDescription>
                Enter user's email (optional) and UUID (required) to check auto-trading requirements. Email checks whitelist status. Find User IDs: SELECT id FROM auth.users WHERE email='user@example.com'
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-4">
                <div className="flex-1">
                  <Label htmlFor="email">User Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="user@example.com"
                    value={userEmail}
                    onChange={(e) => setUserEmail(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && runDiagnostics()}
                  />
                </div>
                <div className="flex-1">
                  <Label htmlFor="userId">User ID (UUID)</Label>
                  <Input
                    id="userId"
                    type="text"
                    placeholder="00000000-0000-0000-0000-000000000000"
                    value={userId}
                    onChange={(e) => setUserId(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && runDiagnostics()}
                  />
                </div>
                <div className="flex items-end">
                  <Button 
                    onClick={runDiagnostics} 
                    disabled={(!userEmail && !userId) || isRunning}
                  >
                    {isRunning ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Running...
                      </>
                    ) : (
                      <>
                        <Search className="mr-2 h-4 w-4" />
                        Run Diagnostics
                      </>
                    )}
                  </Button>
                </div>
              </div>

              {diagnostics.length > 0 && (
                <Alert>
                  <AlertDescription className="flex items-center justify-between">
                    <div className="flex gap-4">
                      <span className="flex items-center gap-2">
                        <CheckCircle2 className="h-4 w-4 text-green-500" />
                        {passCount} Passed
                      </span>
                      <span className="flex items-center gap-2">
                        <AlertTriangle className="h-4 w-4 text-yellow-500" />
                        {warningCount} Warnings
                      </span>
                      <span className="flex items-center gap-2">
                        <XCircle className="h-4 w-4 text-red-500" />
                        {failCount} Failed
                      </span>
                    </div>
                  </AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>

          {diagnostics.length > 0 && (
            <div className="grid gap-4">
              {diagnostics.map((diagnostic, idx) => {
                const iconMap: Record<string, React.ElementType> = {
                  'User': User,
                  'Link': LinkIcon,
                  'Database': DatabaseIcon,
                  'Cog': Cog,
                  'DollarSign': DollarSign,
                  'TrendingUp': TrendingUp,
                  'Clock': Clock,
                  'Shield': Shield,
                  'XCircle': XCircle
                };
                const Icon = iconMap[diagnostic.iconName] || Cog;
                
                return (
                  <Card key={idx}>
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-3">
                          <Icon className="h-5 w-5 text-muted-foreground" />
                          <div>
                            <CardTitle className="text-lg">{diagnostic.check}</CardTitle>
                            <CardDescription>{diagnostic.message}</CardDescription>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          {getStatusIcon(diagnostic.status)}
                          {getStatusBadge(diagnostic.status)}
                        </div>
                      </div>
                    </CardHeader>
                    {diagnostic.details && (
                      <CardContent>
                        <details className="text-sm">
                          <summary className="cursor-pointer text-muted-foreground hover:text-foreground">
                            View Details
                          </summary>
                          <pre className="mt-2 p-4 bg-muted rounded-lg overflow-auto text-xs">
                            {JSON.stringify(diagnostic.details, null, 2)}
                          </pre>
                        </details>
                      </CardContent>
                    )}
                  </Card>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </AdminProtected>
  );
};

export default AdminTroubleshooting;
