import React from "react";
import { WatchlistManager } from "@/trader-platform/components/WatchlistManager";
import { FadeInWrapper } from "@/components/FadeInWrapper";

export default function Watchlists() {

  return (
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
  );
}
