import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Settings, CheckCircle, XCircle, AlertCircle, RefreshCw } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface DiagnosticResult {
  category: string;
  status: "success" | "warning" | "error";
  message: string;
  data?: any;
  timestamp?: string;
}

interface DiagnosticPanelProps {
  currentPositions?: any[];
  currentTrades?: any[];
  currentAccount?: any;
}

export const DiagnosticPanel = ({ 
  currentPositions = [], 
  currentTrades = [],
  currentAccount 
}: DiagnosticPanelProps) => {
  const [diagnostics, setDiagnostics] = useState<DiagnosticResult[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const { toast } = useToast();

  const runDiagnostics = async () => {
    setIsRunning(true);
    const results: DiagnosticResult[] = [];

    try {
      // 0. Check frontend component state FIRST
      results.push({
        category: "Frontend State - Positions",
        status: currentPositions.length > 0 ? "warning" : "success",
        message: currentPositions.length > 0
          ? `⚠️ Component is displaying ${currentPositions.length} position(s) - verify these are not mock/demo data`
          : "No positions being displayed (correct for fresh account)",
        data: { 
          displayedPositions: currentPositions,
          symbols: currentPositions.map(p => p.symbol),
          note: "These are the ACTUAL positions being shown in the UI right now"
        },
        timestamp: new Date().toISOString()
      });

      results.push({
        category: "Frontend State - Recent Trades",
        status: currentTrades.length > 0 ? "warning" : "success",
        message: currentTrades.length > 0
          ? `⚠️ Component is displaying ${currentTrades.length} recent trade(s) - verify these are not mock/demo data`
          : "No recent trades being displayed",
        data: { 
          displayedTrades: currentTrades,
          symbols: currentTrades.map(t => t.symbol),
          note: "These are the ACTUAL trades being shown in the UI right now"
        },
        timestamp: new Date().toISOString()
      });

      results.push({
        category: "Frontend State - Account Data",
        status: currentAccount ? "success" : "warning",
        message: currentAccount
          ? `Account showing $${currentAccount.portfolioValue?.toLocaleString()} value`
          : "No account data in component state",
        data: {
          displayedAccount: currentAccount,
          note: "This is the ACTUAL account data being shown in the UI right now"
        },
        timestamp: new Date().toISOString()
      });

      // 1. Check current user
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      results.push({
        category: "Authentication",
        status: user ? "success" : "error",
        message: user ? `Logged in as: ${user.email}` : "No user logged in",
        data: { user_id: user?.id, email: user?.email },
        timestamp: new Date().toISOString()
      });

      if (!user) {
        setDiagnostics(results);
        setIsRunning(false);
        return;
      }

      // 2. Check paper accounts
      const { data: paperAccounts, error: accountError } = await supabase
        .from('paper_accounts')
        .select('*')
        .eq('user_id', user.id);

      results.push({
        category: "Paper Accounts",
        status: paperAccounts && paperAccounts.length > 0 ? "success" : "warning",
        message: paperAccounts 
          ? `Found ${paperAccounts.length} paper account(s)` 
          : "No paper accounts found",
        data: paperAccounts,
        timestamp: new Date().toISOString()
      });

      const activeAccount = paperAccounts?.find(acc => acc.is_active);
      
      if (activeAccount) {
        // 3. Check positions
        const { data: positions, error: posError } = await supabase
          .from('paper_positions')
          .select('*')
          .eq('account_id', activeAccount.id);

        results.push({
          category: "Positions",
          status: positions && positions.length > 0 ? "success" : "warning",
          message: `Found ${positions?.length || 0} position(s)`,
          data: positions,
          timestamp: new Date().toISOString()
        });

        // 4. Check transactions
        const { data: transactions, error: txError } = await supabase
          .from('paper_transactions')
          .select('*')
          .eq('account_id', activeAccount.id)
          .order('created_at', { ascending: false })
          .limit(10);

        results.push({
          category: "Recent Transactions",
          status: transactions && transactions.length > 0 ? "success" : "warning",
          message: `Found ${transactions?.length || 0} transaction(s)`,
          data: transactions,
          timestamp: new Date().toISOString()
        });
      }

      // 5. Check broker integrations
      const { data: integrations, error: intError } = await supabase
        .from('broker_integrations')
        .select('id, broker_name, is_active, last_connected')
        .eq('user_id', user.id);

      results.push({
        category: "Broker Integrations",
        status: integrations && integrations.length > 0 ? "success" : "warning",
        message: integrations && integrations.length > 0
          ? `Connected to ${integrations.filter(i => i.is_active).length} broker(s)`
          : "No broker integrations",
        data: integrations,
        timestamp: new Date().toISOString()
      });

      // 6. Test trader-positions endpoint
      const { data: positionsResponse, error: posEndpointError } = await supabase.functions
        .invoke('trader-positions', {
          method: 'GET'
        });

      results.push({
        category: "Positions Endpoint",
        status: positionsResponse ? "success" : "error",
        message: positionsResponse 
          ? `Endpoint returned ${positionsResponse.data?.positions?.length || 0} positions`
          : "Failed to fetch from endpoint",
        data: positionsResponse,
        timestamp: new Date().toISOString()
      });

      // 7. Test trader-account endpoint
      const { data: accountResponse, error: accEndpointError } = await supabase.functions
        .invoke('trader-account', {
          method: 'GET'
        });

      results.push({
        category: "Account Endpoint",
        status: accountResponse ? "success" : "error",
        message: accountResponse 
          ? `Account value: $${accountResponse.data?.portfolioValue?.toLocaleString()}`
          : "Failed to fetch account data",
        data: accountResponse,
        timestamp: new Date().toISOString()
      });

      // 8. Test Alpaca diagnostic
      const { data: alpacaResponse, error: alpacaError } = await supabase.functions
        .invoke('alpaca-diagnostic', {
          method: 'POST'
        });

      results.push({
        category: "Alpaca Connection",
        status: alpacaResponse?.success ? "success" : "error",
        message: alpacaResponse?.diagnostics?.accountAccessible 
          ? "Connected to Alpaca successfully"
          : "Alpaca connection failed",
        data: alpacaResponse,
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      results.push({
        category: "System Error",
        status: "error",
        message: error instanceof Error ? error.message : "Unknown error",
        timestamp: new Date().toISOString()
      });
    }

    setDiagnostics(results);
    setIsRunning(false);
    
    const hasErrors = results.some(r => r.status === "error");
    toast({
      title: hasErrors ? "Diagnostics completed with errors" : "Diagnostics completed",
      description: `Checked ${results.length} system components`,
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
    return <Badge variant={variants[status]}>{status}</Badge>;
  };

  return (
    <Card className="w-full h-full !shadow-[0_10px_30px_-10px_rgba(0,0,0,0.15),0_4px_20px_-4px_rgba(0,0,0,0.1)] dark:!shadow-[0_10px_30px_-10px_rgba(255,255,255,0.08),0_4px_20px_-4px_rgba(255,255,255,0.05)]">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center justify-between text-lg">
          <div className="flex items-center gap-2">
            <Settings className="h-4 w-4" />
            System Diagnostics
          </div>
          <Button 
            onClick={runDiagnostics} 
            disabled={isRunning}
            className="bg-purple-600 hover:bg-purple-700 text-white"
          >
            {isRunning ? "Running..." : "Run Diagnostic"}
          </Button>
        </CardTitle>
        <CardDescription className="text-xs">
          Check connections and data sources
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3 pt-0">
        {diagnostics.length === 0 ? (
          <div className="text-center py-4 text-muted-foreground text-xs">
            Click test to check system components
          </div>
        ) : (
          <div className="space-y-2">
            {diagnostics.map((result, index) => (
              <div key={index} className="border rounded p-2 space-y-1">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1">
                    {getStatusIcon(result.status)}
                    <span className="text-xs font-medium">{result.category}</span>
                  </div>
                  {getStatusBadge(result.status)}
                </div>
                <p className="text-xs text-muted-foreground">{result.message}</p>
                {result.timestamp && (
                  <p className="text-xs text-muted-foreground">
                    {new Date(result.timestamp).toLocaleTimeString()}
                  </p>
                )}
                {result.data && (
                  <details className="text-xs">
                    <summary className="cursor-pointer text-muted-foreground hover:text-foreground">
                      Details
                    </summary>
                    <pre className="mt-1 p-1 bg-muted rounded overflow-x-auto text-xs">
                      {JSON.stringify(result.data, null, 2)}
                    </pre>
                  </details>
                )}
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
