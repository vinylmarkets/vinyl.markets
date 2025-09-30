import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Mail, CheckCircle, XCircle, AlertCircle, AlertTriangle } from "lucide-react";

interface DiagnosticResult {
  category: string;
  status: "success" | "warning" | "error";
  message: string;
  timestamp: Date;
  data?: any;
}

export const NewsletterDiagnostic = () => {
  const [diagnostics, setDiagnostics] = useState<DiagnosticResult[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const { toast } = useToast();

  const triggerNewsletter = async () => {
    try {
      const { data, error } = await supabase.functions.invoke("send-daily-market-email", {
        body: { manual: true }
      });
      
      if (error) throw error;
      
      toast({
        title: "Newsletter Triggered",
        description: "Check your email shortly",
      });
    } catch (error: any) {
      toast({
        title: "Failed to Trigger Newsletter",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const runDiagnostics = async () => {
    setIsRunning(true);
    setDiagnostics([]);
    const results: DiagnosticResult[] = [];

    try {
      // Check 1: Recent Briefings Created
      const { data: recentBriefings, error: briefingsError } = await supabase
        .from("briefings")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(5);

      if (briefingsError) {
        results.push({
          category: "Briefings Database",
          status: "error",
          message: `Failed to fetch briefings: ${briefingsError.message}`,
          timestamp: new Date(),
        });
      } else {
        const todayCount = recentBriefings?.filter(
          (b) => new Date(b.created_at).toDateString() === new Date().toDateString()
        ).length || 0;

        results.push({
          category: "Briefings Database",
          status: todayCount > 0 ? "success" : "warning",
          message: `Found ${todayCount} briefings created today, ${recentBriefings?.length || 0} total recent briefings`,
          timestamp: new Date(),
          data: { todayCount, totalRecent: recentBriefings?.length || 0 },
        });
      }

      // Check 2: Intelligence Briefings
      const { data: intelligenceBriefings, error: intError } = await supabase
        .from("intelligence_briefings")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(5);

      if (intError) {
        results.push({
          category: "Intelligence Briefings",
          status: "error",
          message: `Failed to fetch intelligence briefings: ${intError.message}`,
          timestamp: new Date(),
        });
      } else {
        const todayCount = intelligenceBriefings?.filter(
          (b) => new Date(b.created_at).toDateString() === new Date().toDateString()
        ).length || 0;

        results.push({
          category: "Intelligence Briefings",
          status: todayCount > 0 ? "success" : "warning",
          message: `Found ${todayCount} intelligence briefings today, ${intelligenceBriefings?.length || 0} total recent`,
          timestamp: new Date(),
          data: { todayCount, totalRecent: intelligenceBriefings?.length || 0 },
        });
      }

      // Check 3: Cron Job Logs
      const { data: cronLogs, error: cronError } = await supabase
        .from("cron_job_logs")
        .select("*")
        .or('job_name.eq.send-daily-market-email,job_name.eq.morning-market-analysis')
        .order("executed_at", { ascending: false })
        .limit(10);

      if (cronError) {
        results.push({
          category: "Cron Jobs",
          status: "error",
          message: `Failed to fetch cron logs: ${cronError.message}`,
          timestamp: new Date(),
        });
      } else {
        const todayLogs = cronLogs?.filter(
          (log) => new Date(log.executed_at).toDateString() === new Date().toDateString()
        ) || [];

        results.push({
          category: "Cron Jobs",
          status: todayLogs.length > 0 ? "success" : "warning",
          message: `Found ${todayLogs.length} newsletter cron jobs executed today`,
          timestamp: new Date(),
          data: { todayCount: todayLogs.length, recentLogs: cronLogs?.length || 0 },
        });
      }

      // Check 4: User Briefings (Delivery records)
      const { data: userBriefings, error: ubError } = await supabase
        .from("user_briefings")
        .select("*")
        .order("delivered_at", { ascending: false })
        .limit(50);

      if (ubError) {
        results.push({
          category: "Newsletter Delivery",
          status: "error",
          message: `Failed to fetch user briefings: ${ubError.message}`,
          timestamp: new Date(),
        });
      } else {
        const todayCount = userBriefings?.filter(
          (b) => new Date(b.delivered_at).toDateString() === new Date().toDateString()
        ).length || 0;

        results.push({
          category: "Newsletter Delivery",
          status: todayCount > 0 ? "success" : "warning",
          message: `${todayCount} newsletters delivered today, ${userBriefings?.length || 0} total recent deliveries`,
          timestamp: new Date(),
          data: { todayCount, totalRecent: userBriefings?.length || 0 },
        });
      }

      // Check 5: Newsletter Sending Function Status
      const { data: emailLogs, error: emailLogsError } = await supabase
        .from("cron_job_logs")
        .select("*")
        .eq("job_name", "send-daily-market-email")
        .order("executed_at", { ascending: false })
        .limit(5);

      const hasRecentEmailSends = emailLogs && emailLogs.length > 0;
      const lastEmailSent = hasRecentEmailSends 
        ? new Date(emailLogs[0].executed_at).toLocaleDateString()
        : "Never";

      results.push({
        category: "Newsletter Sending",
        status: hasRecentEmailSends ? "success" : "error",
        message: hasRecentEmailSends
          ? `Newsletter sending is active. Last sent: ${lastEmailSent}`
          : "⚠️ ISSUE FOUND: Newsletter sending function has never been executed. Cron job may not be configured.",
        timestamp: new Date(),
        data: { lastSent: lastEmailSent, totalSends: emailLogs?.length || 0 },
      });

      // Check 6: Test Morning Analysis Function
      try {
        const { data: edgeTest, error: edgeError } = await supabase.functions.invoke(
          "morning-market-analysis",
          { body: { test: true } }
        );

        results.push({
          category: "Prediction Generation",
          status: edgeError ? "error" : "success",
          message: edgeError
            ? `Morning analysis error: ${edgeError.message}`
            : "Morning market analysis function is working",
          timestamp: new Date(),
        });
      } catch (err: any) {
        results.push({
          category: "Prediction Generation",
          status: "warning",
          message: `Cannot reach morning analysis: ${err.message}`,
          timestamp: new Date(),
        });
      }

      setDiagnostics(results);

      const errorCount = results.filter((r) => r.status === "error").length;
      const warningCount = results.filter((r) => r.status === "warning").length;

      toast({
        title: "Newsletter Diagnostic Complete",
        description: `Found ${errorCount} errors, ${warningCount} warnings`,
        variant: errorCount > 0 ? "destructive" : "default",
      });
    } catch (error: any) {
      toast({
        title: "Diagnostic Failed",
        description: error.message,
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
        return <AlertCircle className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusBadge = (status: string) => {
    const variants = {
      success: "default",
      warning: "secondary",
      error: "destructive",
    } as const;

    return (
      <Badge variant={variants[status as keyof typeof variants] || "outline"}>
        {status}
      </Badge>
    );
  };

  return (
    <Card className="flex flex-col h-full">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base font-semibold flex items-center gap-2">
            <Mail className="h-5 w-5 text-primary" />
            Newsletter System
          </CardTitle>
          {diagnostics.length > 0 && (
            <Badge variant="outline" className="text-xs">
              {diagnostics.filter((d) => d.status === "success").length}/
              {diagnostics.length} passed
            </Badge>
          )}
        </div>
      </CardHeader>

      <CardContent className="space-y-3 pt-0 flex-1 flex flex-col">
        <div className="flex-1">
          {diagnostics.length === 0 ? (
            <div className="text-center text-muted-foreground py-4">
              <Mail className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p className="text-xs">No diagnostics run yet</p>
            </div>
          ) : (
            <div className="space-y-2">
              <h3 className="text-sm font-semibold mb-2">Results:</h3>
              <ScrollArea className="h-40">
                <div className="space-y-2">
                  {diagnostics.map((diagnostic, index) => (
                    <div
                      key={index}
                      className="p-2 border rounded-md text-xs space-y-1"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-2 flex-1">
                          {getStatusIcon(diagnostic.status)}
                          <span className="font-medium">{diagnostic.category}</span>
                        </div>
                        {getStatusBadge(diagnostic.status)}
                      </div>
                      <p className="text-muted-foreground pl-6">
                        {diagnostic.message}
                      </p>
                      <p className="text-xs text-muted-foreground pl-6">
                        {diagnostic.timestamp.toLocaleTimeString()}
                      </p>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </div>
          )}
        </div>

        <div className="space-y-2">
          <Button
            onClick={runDiagnostics}
            disabled={isRunning}
            className="w-full"
            size="sm"
          >
            {isRunning ? "Running Diagnostic..." : "Run Newsletter Diagnostic"}
          </Button>
          <Button
            onClick={triggerNewsletter}
            variant="outline"
            className="w-full"
            size="sm"
          >
            Trigger Newsletter Manually
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
