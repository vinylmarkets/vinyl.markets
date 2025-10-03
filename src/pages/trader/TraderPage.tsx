import React, { useState, useEffect } from "react";
import { TradingDashboard } from "@/trader-platform/components/TradingDashboard";
import { TraderProtection } from "@/components/trader/TraderProtection";
import { TraderHeader } from "@/trader-platform/components/TraderHeader";
import { Sidebar } from "@/components/trader/Sidebar";
import { ComingSoonModal } from "@/components/trader/ComingSoonModal";
import { PageTransition } from "@/components/trader/PageTransition";
import { PageSkeleton } from "@/components/trader/PageSkeleton";

const TraderPage = () => {
  const [comingSoonOpen, setComingSoonOpen] = useState(false);
  const [selectedFeature, setSelectedFeature] = useState("");
  const [isPageLoading, setIsPageLoading] = useState(true);

  const handleComingSoonClick = (feature: string) => {
    setSelectedFeature(feature);
    setComingSoonOpen(true);
  };

  // Debug logging
  useEffect(() => {
    console.log('TraderPage isPageLoading:', isPageLoading);
  }, [isPageLoading]);

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
      <div className="min-h-screen bg-background relative transition-colors duration-500">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-background to-accent/10 pointer-events-none"></div>
        
        {/* Header and Sidebar render immediately - no loading dependency */}
        <Sidebar onComingSoonClick={handleComingSoonClick} />
        
        <div className="flex-1 flex flex-col ml-16">
          <TraderHeader />
          
          {/* Main content area waits for data */}
          {isPageLoading ? (
            <PageSkeleton />
          ) : (
            <PageTransition isLoading={false}>
              <TradingDashboard onLoadingChange={setIsPageLoading} />
            </PageTransition>
          )}
        </div>

        <ComingSoonModal
          open={comingSoonOpen}
          onOpenChange={setComingSoonOpen}
          featureName={selectedFeature}
        />
      </div>
    </TraderProtection>
  );
};

export default TraderPage;