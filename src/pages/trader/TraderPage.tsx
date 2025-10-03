import React, { useState, useEffect } from "react";
import { TradingDashboard } from "@/trader-platform/components/TradingDashboard";
import { TraderProtection } from "@/components/trader/TraderProtection";
import { TraderHeader } from "@/trader-platform/components/TraderHeader";
import { FadeInWrapper } from "@/components/FadeInWrapper";
import { Sidebar } from "@/components/trader/Sidebar";
import { ComingSoonModal } from "@/components/trader/ComingSoonModal";

const TraderPage = () => {
  const [comingSoonOpen, setComingSoonOpen] = useState(false);
  const [selectedFeature, setSelectedFeature] = useState("");

  const handleComingSoonClick = (feature: string) => {
    setSelectedFeature(feature);
    setComingSoonOpen(true);
  };

  // Listen for sidebar state changes
  useEffect(() => {
    const handleSidebarChange = () => {
      // Force re-render when sidebar state changes
      const event = new Event('sidebar-toggle');
      window.dispatchEvent(event);
    };
    
    window.addEventListener('storage', handleSidebarChange);
    window.addEventListener('sidebar-toggle', handleSidebarChange);
    
    return () => {
      window.removeEventListener('storage', handleSidebarChange);
      window.removeEventListener('sidebar-toggle', handleSidebarChange);
    };
  }, []);

  return (
    <TraderProtection>
      <FadeInWrapper>
        <div className="min-h-screen bg-background relative">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-background to-accent/10 pointer-events-none"></div>
          
          <Sidebar onComingSoonClick={handleComingSoonClick} />
          
          <div className="flex-1 flex flex-col ml-16">
            <TraderHeader />
            <TradingDashboard />
          </div>

          <ComingSoonModal
            open={comingSoonOpen}
            onOpenChange={setComingSoonOpen}
            featureName={selectedFeature}
          />
        </div>
      </FadeInWrapper>
    </TraderProtection>
  );
};

export default TraderPage;