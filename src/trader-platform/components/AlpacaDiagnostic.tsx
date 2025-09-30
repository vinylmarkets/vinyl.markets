import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  CheckCircle, 
  AlertCircle, 
  RefreshCw, 
  Wifi, 
  WifiOff,
  Activity,
  Shield
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface DiagnosticResult {
  credentialsConfigured: boolean;
  accountAccessible: boolean;
  accountInfo?: {
    id: string;
    status: string;
    currency: string;
    buying_power: string;
    portfolio_value: string;
  };
  assetAccessible?: boolean;
  assetInfo?: {
    symbol: string;
    tradable: boolean;
    status: string;
  };
  errors: string[];
}

interface DiagnosticResponse {
  success: boolean;
  diagnostics: DiagnosticResult;
  timestamp: string;
}

export const AlpacaDiagnostic = () => {
  const [isRunning, setIsRunning] = useState(false);
  const [lastRun, setLastRun] = useState<string | null>(null);
  const [diagnosticResult, setDiagnosticResult] = useState<DiagnosticResult | null>(null);
  const { toast } = useToast();

  const runDiagnostic = async () => {
    setIsRunning(true);
    try {
      console.log('Running Alpaca diagnostic...');
      
      const { data, error } = await supabase.functions.invoke('alpaca-diagnostic', {
        body: {}
      });

      if (error) {
        throw error;
      }

      const response = data as DiagnosticResponse;
      console.log('Diagnostic result:', response);
      
      if (response.success) {
        setDiagnosticResult(response.diagnostics);
        setLastRun(response.timestamp);
        
        const hasErrors = response.diagnostics.errors.length > 0;
        toast({
          title: hasErrors ? "Diagnostic Complete - Issues Found" : "Diagnostic Complete - All Good",
          description: hasErrors 
            ? `Found ${response.diagnostics.errors.length} issue(s) with Alpaca connection`
            : "Alpaca connection is working properly",
          variant: hasErrors ? "destructive" : "default",
        });
      } else {
        throw new Error('Diagnostic failed to run');
      }
    } catch (error) {
      console.error('Diagnostic error:', error);
      toast({
        title: "Diagnostic Failed",
        description: error instanceof Error ? error.message : 'Failed to run diagnostic',
        variant: "destructive",
      });
    } finally {
      setIsRunning(false);
    }
  };

  const getStatusIcon = (success: boolean) => {
    return success ? (
      <CheckCircle className="h-4 w-4 text-green-500" />
    ) : (
      <AlertCircle className="h-4 w-4 text-red-500" />
    );
  };

  const getStatusBadge = (success: boolean, label: string) => {
    return (
      <Badge variant={success ? "default" : "destructive"} className="flex items-center gap-1">
        {getStatusIcon(success)}
        {label}
      </Badge>
    );
  };

  return (
    <Card className="h-full !shadow-[0_10px_30px_-10px_rgba(0,0,0,0.15),0_4px_20px_-4px_rgba(0,0,0,0.1)] dark:!shadow-[0_10px_30px_-10px_rgba(255,255,255,0.08),0_4px_20px_-4px_rgba(255,255,255,0.05)]">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center justify-between text-lg">
          <div className="flex items-center gap-2">
            <Activity className="h-4 w-4" />
            Alpaca Connection
          </div>
          <Button 
            onClick={runDiagnostic} 
            disabled={isRunning}
            size="sm"
            variant="outline"
          >
            {isRunning ? (
              <RefreshCw className="h-3 w-3 animate-spin" />
            ) : (
              <Wifi className="h-3 w-3" />
            )}
          </Button>
        </CardTitle>
        <CardDescription className="text-xs">
          Test API connection and credentials
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3 pt-0">
        {!diagnosticResult && !isRunning && (
          <div className="text-center text-muted-foreground py-4">
            <WifiOff className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p className="text-xs">Click test to diagnose API issues</p>
          </div>
        )}

        {isRunning && (
          <div className="text-center py-4">
            <RefreshCw className="h-8 w-8 mx-auto mb-2 animate-spin text-blue-500" />
            <p className="text-muted-foreground text-xs">Testing connection...</p>
          </div>
        )}

        {diagnosticResult && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <h4 className="font-medium flex items-center gap-2">
                  <Shield className="h-4 w-4" />
                  Credentials
                </h4>
                {getStatusBadge(diagnosticResult.credentialsConfigured, 
                  diagnosticResult.credentialsConfigured ? 'Configured' : 'Missing')}
              </div>

              <div className="space-y-2">
                <h4 className="font-medium flex items-center gap-2">
                  <Wifi className="h-4 w-4" />
                  Account Access
                </h4>
                {getStatusBadge(diagnosticResult.accountAccessible, 
                  diagnosticResult.accountAccessible ? 'Connected' : 'Failed')}
              </div>

              {diagnosticResult.assetAccessible !== undefined && (
                <div className="space-y-2">
                  <h4 className="font-medium flex items-center gap-2">
                    <Activity className="h-4 w-4" />
                    Asset Access (GME)
                  </h4>
                  {getStatusBadge(diagnosticResult.assetAccessible, 
                    diagnosticResult.assetAccessible ? 'Available' : 'Not Found')}
                </div>
              )}
            </div>

            {diagnosticResult.accountInfo && (
              <div className="p-3 bg-muted rounded-lg">
                <h4 className="font-medium mb-2">Account Information</h4>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div>Status: <Badge variant="outline">{diagnosticResult.accountInfo.status}</Badge></div>
                  <div>Currency: {diagnosticResult.accountInfo.currency}</div>
                  <div>Buying Power: ${parseFloat(diagnosticResult.accountInfo.buying_power).toLocaleString()}</div>
                  <div>Portfolio Value: ${parseFloat(diagnosticResult.accountInfo.portfolio_value).toLocaleString()}</div>
                </div>
              </div>
            )}

            {diagnosticResult.assetInfo && (
              <div className="p-3 bg-muted rounded-lg">
                <h4 className="font-medium mb-2">Asset Information (GME)</h4>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div>Symbol: {diagnosticResult.assetInfo.symbol}</div>
                  <div>Tradable: {diagnosticResult.assetInfo.tradable ? 'Yes' : 'No'}</div>
                  <div>Status: <Badge variant="outline">{diagnosticResult.assetInfo.status}</Badge></div>
                </div>
              </div>
            )}

            {diagnosticResult.errors.length > 0 && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                <h4 className="font-medium text-red-700 mb-2 flex items-center gap-2">
                  <AlertCircle className="h-4 w-4" />
                  Issues Found ({diagnosticResult.errors.length})
                </h4>
                <ul className="space-y-1 text-sm text-red-600">
                  {diagnosticResult.errors.map((error, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <span className="text-red-400">•</span>
                      {error}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {lastRun && (
              <div className="text-xs text-muted-foreground text-center">
                Last run: {new Date(lastRun).toLocaleString()}
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};