import React from "react";
import { TraderProtection } from "@/components/trader/TraderProtection";
import { TradingAutomationDiagnostic } from "@/trader-platform/components/TradingAutomationDiagnostic";
import { AlpacaDiagnostic } from "@/trader-platform/components/AlpacaDiagnostic";
import { DiagnosticPanel } from "@/trader-platform/components/DiagnosticPanel";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertCircle } from "lucide-react";

const TraderTroubleshooting = () => {
  return (
    <TraderProtection>
      <div className="min-h-screen bg-background p-4 sm:p-6 lg:p-8">
        <div className="max-w-7xl mx-auto space-y-6">
          {/* Page Header */}
          <Card className="border-primary/20">
            <CardHeader>
              <div className="flex items-center space-x-3">
                <AlertCircle className="h-6 w-6 text-primary" />
                <CardTitle className="text-2xl">Troubleshooting & Diagnostics</CardTitle>
              </div>
              <p className="text-sm text-muted-foreground mt-2">
                Run diagnostics to verify system health, API connections, and trading automation status.
              </p>
            </CardHeader>
          </Card>

          {/* Trading Automation Diagnostic */}
          <TradingAutomationDiagnostic />

          {/* Alpaca Connection Diagnostic */}
          <AlpacaDiagnostic />

          {/* General Diagnostic Panel */}
          <Card>
            <CardHeader>
              <CardTitle>System Diagnostic Panel</CardTitle>
              <p className="text-sm text-muted-foreground">
                Real-time checks of your trading system components.
              </p>
            </CardHeader>
            <CardContent>
              <DiagnosticPanel />
            </CardContent>
          </Card>
        </div>
      </div>
    </TraderProtection>
  );
};

export default TraderTroubleshooting;
