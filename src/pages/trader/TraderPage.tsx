import React from "react";
import { TradingDashboard } from "@/trader-platform/components/TradingDashboard";
import { TraderProtection } from "@/components/trader/TraderProtection";

const TraderPage = () => {
  return (
    <TraderProtection>
      <TradingDashboard />
    </TraderProtection>
  );
};

export default TraderPage;