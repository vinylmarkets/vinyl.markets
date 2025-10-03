import React, { useState } from "react";
import { Outlet } from "react-router-dom";
import { TraderProtection } from "@/components/trader/TraderProtection";
import { TraderHeader } from "@/trader-platform/components/TraderHeader";
import { Sidebar } from "@/components/trader/Sidebar";
import { ComingSoonModal } from "@/components/trader/ComingSoonModal";

export default function TraderLayout() {
  const [comingSoonOpen, setComingSoonOpen] = useState(false);
  const [selectedFeature, setSelectedFeature] = useState("");

  const handleComingSoonClick = (feature: string) => {
    console.log('🔔 Coming soon feature clicked:', feature);
    setSelectedFeature(feature);
    setComingSoonOpen(true);
  };

  console.log('🎯 TraderLayout rendering');

  return (
    <TraderProtection>
      <div className="min-h-screen bg-[#0A0A0A] relative">
        <Sidebar onComingSoonClick={handleComingSoonClick} />
        
        <div className="flex-1 flex flex-col ml-16">
          <TraderHeader />
          <main className="flex-1">
            <Outlet />
          </main>
        </div>

        <ComingSoonModal
          open={comingSoonOpen}
          onOpenChange={setComingSoonOpen}
          featureName={selectedFeature}
        />
      </div>
    </TraderProtection>
  );
}
