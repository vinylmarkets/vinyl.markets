import React, { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, XCircle, AlertTriangle, Loader2, Mail } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface DiagnosticResult {
  category: string;
  status: "success" | "warning" | "error";
  message: string;
  data?: any;
  timestamp: Date;
}

export const KitDiagnostic = () => {
  const [diagnostics, setDiagnostics] = useState<DiagnosticResult[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const { toast } = useToast();

  const runDiagnostics = async () => {
    setIsRunning(true);
    const results: DiagnosticResult[] = [];

    try {
      // Check Kit API credentials
      try {
        const { data: credentialsTest, error } = await supabase.functions.invoke("push-newsletter-to-kit", {
          body: { test_credentials_only: true }
        });
        
        if (error || credentialsTest?.error) {
          results.push({
            category: "Kit API Credentials",
            status: "error",
            message: error?.message || credentialsTest?.error || "Failed to verify credentials",
            data: error || credentialsTest,
            timestamp: new Date()
          });
        } else {
          results.push({
            category: "Kit API Credentials",
            status: "success",
            message: "Kit.com API credentials configured properly",
            timestamp: new Date()
          });
        }
      } catch (error: any) {
        results.push({
          category: "Kit API Credentials",
          status: "error",
          message: `Credentials check failed: ${error.message}`,
          data: error,
          timestamp: new Date()
        });
      }

      // Check recent newsletters in database
      try {
        const { data: newsletters, error } = await supabase
          .from("vinyl_newsletters")
          .select("id, title, published, created_at")
          .order("created_at", { ascending: false })
          .limit(5);

        if (error) {
          results.push({
            category: "Newsletter Database",
            status: "error",
            message: `Database error: ${error.message}`,
            data: error,
            timestamp: new Date()
          });
        } else {
          const unpublishedCount = newsletters?.filter(n => !n.published).length || 0;
          results.push({
            category: "Newsletter Database",
            status: unpublishedCount > 3 ? "warning" : "success",
            message: `Found ${newsletters?.length || 0} recent newsletters, ${unpublishedCount} unpublished`,
            data: newsletters,
            timestamp: new Date()
          });
        }
      } catch (error) {
        results.push({
          category: "Newsletter Database",
          status: "error",
          message: "Cannot access newsletters table",
          data: error,
          timestamp: new Date()
        });
      }

      // Check Kit function availability  
      try {
        const { data: functionTest, error } = await supabase.functions.invoke("push-newsletter-to-kit", {
          body: { test_function_only: true }
        });
        
        if (error) {
          results.push({
            category: "Kit Publishing Function",
            status: "error",
            message: `Function error: ${error.message}`,
            data: error,
            timestamp: new Date()
          });
        } else {
          results.push({
            category: "Kit Publishing Function",
            status: "success",
            message: "push-newsletter-to-kit function is accessible",
            data: functionTest,
            timestamp: new Date()
          });
        }
      } catch (error: any) {
        results.push({
          category: "Kit Publishing Function",
          status: "error",
          message: `Function access failed: ${error.message}`,
          data: error,
          timestamp: new Date()
        });
      }

      // Check subscriber sync function
      try {
        const { data: syncTest, error } = await supabase.functions.invoke("sync-kit-subscriber", {
          body: { test_function_only: true }
        });
        
        if (error) {
          results.push({
            category: "Subscriber Sync",
            status: "warning",
            message: `Sync function issue: ${error.message}`,
            data: error,
            timestamp: new Date()
          });
        } else {
          results.push({
            category: "Subscriber Sync",
            status: "success",
            message: "sync-kit-subscriber function is accessible",
            timestamp: new Date()
          });
        }
      } catch (error: any) {
        results.push({
          category: "Subscriber Sync",
          status: "warning",
          message: `Sync function test failed: ${error.message}`,
          data: error,
          timestamp: new Date()
        });
      }

      setDiagnostics(results);
      
      const successCount = results.filter(r => r.status === "success").length;
      const errorCount = results.filter(r => r.status === "error").length;
      const warningCount = results.filter(r => r.status === "warning").length;

      toast({
        title: "Kit.com Diagnostic Complete",
        description: `✅ ${successCount} passed, ⚠️ ${warningCount} warnings, ❌ ${errorCount} errors`,
      });

    } catch (error) {
      console.error("Diagnostic error:", error);
      toast({
        title: "Diagnostic Failed",
        description: "Unable to complete Kit.com diagnostics",
        variant: "destructive",
      });
    } finally {
      setIsRunning(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "success":
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case "warning":
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      case "error":
        return <XCircle className="h-4 w-4 text-red-500" />;
      default:
        return null;
    }
  };

  const getStatusBadge = (status: string) => {
    const variant = status === "success" ? "default" : status === "warning" ? "secondary" : "destructive";
    return <Badge variant={variant}>{status.toUpperCase()}</Badge>;
  };

  return (
    <Card className="w-full">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Mail className="h-5 w-5 text-primary" />
            <CardTitle className="text-lg">Kit.com Publishing</CardTitle>
          </div>
          <Button
            onClick={runDiagnostics}
            disabled={isRunning}
            size="sm"
            className="h-8"
          >
            {isRunning ? (
              <>
                <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                Running...
              </>
            ) : (
              "Run Diagnostic"
            )}
          </Button>
        </div>
        <p className="text-xs text-muted-foreground">
          Test Kit.com API connection and newsletter publishing pipeline
        </p>
      </CardHeader>
      <CardContent className="space-y-3">
        {diagnostics.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-4">
            Click "Run Diagnostic" to check Kit.com publishing status
          </p>
        ) : (
          <div className="space-y-2">
            {diagnostics.map((result, index) => (
              <div key={index} className="flex items-start justify-between text-xs border-l-2 border-l-muted pl-3 py-1">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center space-x-2 mb-1">
                    {getStatusIcon(result.status)}
                    <span className="font-medium text-xs">{result.category}</span>
                    {getStatusBadge(result.status)}
                  </div>
                  <p className="text-xs text-muted-foreground leading-tight">{result.message}</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {result.timestamp.toLocaleTimeString()}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};