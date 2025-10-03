import React, { useState, useEffect } from "react";
import BentoDashboard from "@/pages/trader/BentoDashboard";
import { TraderProtection } from "@/components/trader/TraderProtection";
import { TraderHeader } from "@/trader-platform/components/TraderHeader";
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
      <div className="min-h-screen bg-[#1F1F1F] relative transition-colors duration-500">
        
        {/* Header and Sidebar render immediately */}
        <Sidebar onComingSoonClick={handleComingSoonClick} />
        
        <div className="flex-1 flex flex-col ml-16">
          <TraderHeader />
          <BentoDashboard />
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