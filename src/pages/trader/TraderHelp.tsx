import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { HelpCircle } from "lucide-react";
import { TraderProtection } from "@/components/trader/TraderProtection";
import { Sidebar } from "@/components/trader/Sidebar";
import { ComingSoonModal } from "@/components/trader/ComingSoonModal";
import { TraderHeader } from "@/trader-platform/components/TraderHeader";

const TraderHelp = () => {
  const [comingSoonFeature, setComingSoonFeature] = useState<string | null>(null);

  return (
    <TraderProtection>
      <div className="min-h-screen bg-background relative flex">
        <Sidebar onComingSoonClick={setComingSoonFeature} />
        <div className="flex-1 ml-16">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-background to-accent/10 pointer-events-none"></div>
          <TraderHeader showAccountStats={false} />

          {/* Content */}
          <div className="p-6 max-w-4xl mx-auto space-y-6 relative z-10">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <HelpCircle className="h-5 w-5" />
                <span>Getting Help</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4">
                Learn how to use the trading platform and get help when you need it.
              </p>
              <div className="text-center py-8">
                <HelpCircle className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">Coming Soon</h3>
                <p className="text-muted-foreground">
                  Help documentation and tutorials will be available in a future update.
                </p>
              </div>
            </CardContent>
          </Card>
          </div>
        </div>
        <ComingSoonModal
          open={comingSoonFeature !== null}
          onOpenChange={(open) => !open && setComingSoonFeature(null)}
          featureName={comingSoonFeature || ""}
        />
      </div>
    </TraderProtection>
  );
};

export default TraderHelp;