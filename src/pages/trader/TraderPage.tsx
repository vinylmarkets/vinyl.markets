import React from "react";
import { TradingDashboard } from "@/trader-platform/components/TradingDashboard";
import { TraderProtection } from "@/components/trader/TraderProtection";
import { TraderHeader } from "@/trader-platform/components/TraderHeader";
import { FadeInWrapper } from "@/components/FadeInWrapper";

const TraderPage = () => {
  return (
    <TraderProtection>
      <FadeInWrapper>
        <div className="min-h-screen bg-background relative">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-background to-accent/10 pointer-events-none"></div>
          <TraderHeader />
          <TradingDashboard />
        </div>
      </FadeInWrapper>
    </TraderProtection>
  );
};

export default TraderPage;