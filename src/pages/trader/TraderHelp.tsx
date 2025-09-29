import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, HelpCircle, BookOpen, Video, MessageCircle } from "lucide-react";
import { Link } from "react-router-dom";
import { TraderProtection } from "@/components/trader/TraderProtection";

const TraderHelp = () => {
  return (
    <TraderProtection>
      <div className="min-h-screen bg-background">
        {/* Header */}
        <header className="h-16 border-b border-border bg-card/50 backdrop-blur">
          <div className="flex items-center justify-between px-6 h-full">
            <div className="flex items-center space-x-4">
              <Link to="/trader">
                <Button variant="ghost" size="sm">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Trading
                </Button>
              </Link>
              <h1 className="text-xl font-bold">Help & Tutorials</h1>
            </div>
          </div>
        </header>

        {/* Content */}
        <div className="p-6 max-w-4xl mx-auto space-y-6">
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
    </TraderProtection>
  );
};

export default TraderHelp;