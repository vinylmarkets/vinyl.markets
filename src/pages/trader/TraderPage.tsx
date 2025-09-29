import React from "react";
import { TradingDashboard } from "@/trader-platform/components/TradingDashboard";
import { TradingAutomationDiagnostic } from "@/trader-platform/components/TradingAutomationDiagnostic";
import { TraderProtection } from "@/components/trader/TraderProtection";

const TraderPage = () => {
  return (
    <TraderProtection>
      <div className="space-y-6">
        <TradingAutomationDiagnostic />
        <TradingDashboard />
      </div>
    </TraderProtection>
  );
};

export default TraderPage;