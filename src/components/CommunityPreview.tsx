import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";

const recentActivity = [
  { user: "TraderMike", action: "just made +47% on NVDA", time: "2m ago", avatar: "TM" },
  { user: "AlgoQueen", action: "shared DD on TSLA", time: "5m ago", avatar: "AQ" },
  { user: "RetailKing", action: "hit 30-day streak! 🔥", time: "8m ago", avatar: "RK" },
  { user: "DataDriven", action: "joined the movement", time: "12m ago", avatar: "DD" },
];

export const CommunityPreview = () => {
  return (
    <Card className="p-6 bg-gradient-to-br from-card to-muted/30">
      <div className="text-center mb-6">
        <h3 className="text-2xl font-bold text-foreground mb-2">
          Join the Movement
        </h3>
        <p className="text-muted-foreground mb-4">
          12,847 retail traders taking back control from Wall Street
        </p>
        <div className="flex justify-center gap-2 mb-4">
          <Badge className="bg-secondary text-secondary-foreground">
            🚀 834 online now
          </Badge>
          <Badge className="bg-primary text-primary-foreground">
            💬 3,247 active discussions
          </Badge>
        </div>
      </div>
      
      <div className="space-y-3 mb-6">
        <div className="text-sm font-semibold text-foreground mb-2">Live Activity</div>
        {recentActivity.map((activity, index) => (
          <div key={index} className="flex items-center gap-3 p-2 rounded-lg bg-muted/50">
            <Avatar className="h-8 w-8">
              <AvatarImage src="" />
              <AvatarFallback className="bg-primary text-primary-foreground text-xs">
                {activity.avatar}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <span className="font-semibold text-sm text-primary">{activity.user}</span>
              <span className="text-sm text-muted-foreground"> {activity.action}</span>
            </div>
            <div className="text-xs text-muted-foreground">{activity.time}</div>
          </div>
        ))}
      </div>
      
      <div className="space-y-3">
        <Button className="w-full bg-primary hover:bg-primary/90">
          🎯 Join Our Discord Community
        </Button>
        <Button variant="outline" className="w-full">
          📊 View Live Trading Floor
        </Button>
      </div>
      
      <div className="mt-4 text-center">
        <div className="text-xs text-muted-foreground">
          "Finally, transparency in trading signals. This community changed my life." - Sarah K.
        </div>
      </div>
    </Card>
  );
};