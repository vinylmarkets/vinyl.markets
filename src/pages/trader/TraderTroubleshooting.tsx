import React from "react";
import { Link } from "react-router-dom";
import { TraderProtection } from "@/components/trader/TraderProtection";
import { TradingAutomationDiagnostic } from "@/trader-platform/components/TradingAutomationDiagnostic";
import { AlpacaDiagnostic } from "@/trader-platform/components/AlpacaDiagnostic";
import { DiagnosticPanel } from "@/trader-platform/components/DiagnosticPanel";
import { NewsletterDiagnostic } from "@/trader-platform/components/NewsletterDiagnostic";
import { KitDiagnostic } from "@/trader-platform/components/KitDiagnostic";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AlertCircle, ArrowLeft } from "lucide-react";

const TraderTroubleshooting = () => {
  return (
    <TraderProtection>
      <div className="min-h-screen bg-background p-4 sm:p-6 lg:p-8">
        <div className="max-w-7xl mx-auto space-y-6">
          {/* Navigation Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button asChild variant="ghost" size="sm">
                <Link to="/trader" className="flex items-center space-x-2">
                  <ArrowLeft className="h-4 w-4" />
                  <span>Back to Dashboard</span>
                </Link>
              </Button>
            </div>
            <div className="flex items-center space-x-3">
              <AlertCircle className="h-6 w-6 text-primary" />
              <h1 className="text-2xl font-semibold">Troubleshooting & Diagnostics</h1>
            </div>
          </div>

          <p className="text-sm text-muted-foreground text-center">
            Run diagnostics to verify system health, API connections, and trading automation status.
          </p>

          {/* Bento Grid Layout - 3 columns on large screens */}
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {/* Trading Automation Diagnostic */}
            <div>
              <TradingAutomationDiagnostic />
            </div>

            {/* Alpaca Connection Diagnostic */}
            <div>
              <AlpacaDiagnostic />
            </div>

            {/* System Diagnostic Panel */}
            <div>
              <DiagnosticPanel />
            </div>

            {/* Newsletter Diagnostic */}
            <div>
              <NewsletterDiagnostic />
            </div>

            {/* Kit.com Publishing Diagnostic */}
            <div>
              <KitDiagnostic />
            </div>
          </div>
        </div>
      </div>
    </TraderProtection>
  );
};

export default TraderTroubleshooting;
