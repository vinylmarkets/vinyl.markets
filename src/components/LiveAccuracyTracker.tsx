import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export const LiveAccuracyTracker = () => {
  const [accuracy, setAccuracy] = useState(87.3);
  const [totalSignals, setTotalSignals] = useState(2847);
  const [liveUsers, setLiveUsers] = useState(324);

  useEffect(() => {
    const interval = setInterval(() => {
      // Simulate live updates
      setAccuracy(prev => prev + (Math.random() - 0.5) * 0.1);
      setTotalSignals(prev => prev + Math.floor(Math.random() * 3));
      setLiveUsers(prev => prev + Math.floor(Math.random() * 5) - 2);
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  return (
    <Card className="p-6 bg-card/50 backdrop-blur-sm border-primary/20">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-foreground">Live Performance</h3>
        <div className="flex items-center gap-2">
          <div className="h-2 w-2 bg-secondary rounded-full animate-pulse"></div>
          <span className="text-sm text-muted-foreground">LIVE</span>
        </div>
      </div>
      
      <div className="grid grid-cols-3 gap-4">
        <div className="text-center">
          <div className="text-2xl font-bold text-secondary">{accuracy.toFixed(1)}%</div>
          <div className="text-sm text-muted-foreground">Accuracy</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-foreground">{totalSignals.toLocaleString()}</div>
          <div className="text-sm text-muted-foreground">Signals Sent</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-primary">{liveUsers}</div>
          <div className="text-sm text-muted-foreground">Live Users</div>
        </div>
      </div>
      
      <Badge variant="outline" className="mt-4 w-full justify-center border-secondary/50 text-secondary">
        🔥 Hot Streak: 12 consecutive profitable days
      </Badge>
    </Card>
  );
};