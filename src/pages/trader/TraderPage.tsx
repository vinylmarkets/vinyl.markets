import React, { useState } from "react";
import { TradingDashboard } from "@/trader-platform/components/TradingDashboard";

const TraderPage = () => {
  const [isComingSoon] = useState(false); // Set to true for production

  if (isComingSoon) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold text-foreground">Trading Platform</h1>
          <p className="text-lg text-muted-foreground">Coming Soon</p>
          <p className="text-sm text-muted-foreground max-w-md">
            Our advanced trading platform is currently under development and awaiting regulatory approval.
          </p>
        </div>
      </div>
    );
  }

  return <TradingDashboard />;
};

export default TraderPage;