import React from "react";
import { TradingDashboard } from "@/trader-platform/components/TradingDashboard";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Settings } from "lucide-react";
import { TraderProtection } from "@/components/trader/TraderProtection";

const TraderPage = () => {
  return (
    <TraderProtection>
      <div className="relative">
        {/* Floating integrations button */}
        <div className="fixed top-20 right-4 z-50">
          <Link to="/trader/integrations">
            <Button 
              size="sm" 
              variant="outline" 
              className="bg-background/80 backdrop-blur-sm border shadow-lg hover:bg-accent"
            >
              <Settings className="h-4 w-4 mr-2" />
              Integrations
            </Button>
          </Link>
        </div>
        
        <TradingDashboard />
      </div>
    </TraderProtection>
  );
};

export default TraderPage;