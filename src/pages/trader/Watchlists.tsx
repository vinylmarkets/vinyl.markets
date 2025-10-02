import React from "react";
import { TraderProtection } from "@/components/trader/TraderProtection";
import { TraderHeader } from "@/trader-platform/components/TraderHeader";
import { WatchlistManager } from "@/trader-platform/components/WatchlistManager";
import { FadeInWrapper } from "@/components/FadeInWrapper";

export default function Watchlists() {
  return (
    <TraderProtection>
      <div className="min-h-screen relative overflow-hidden">
        {/* Background gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-background to-accent/10 pointer-events-none" />
        
        {/* Content */}
        <div className="relative z-10">
          <TraderHeader showAccountStats={false} />
          
          <FadeInWrapper>
            <main className="container mx-auto p-4 sm:p-6 max-w-7xl">
              <div className="mb-6">
                <h1 className="text-3xl font-bold text-foreground mb-2">Smart Watchlists</h1>
                <p className="text-muted-foreground">
                  Manage your trading watchlists and discover new opportunities
                </p>
              </div>
              
              <WatchlistManager />
            </main>
          </FadeInWrapper>
        </div>
      </div>
    </TraderProtection>
  );
}
