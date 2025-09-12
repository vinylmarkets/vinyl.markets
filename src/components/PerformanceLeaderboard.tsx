import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";

const leaderboardData = [
  { rank: 1, name: "Alex M.", returns: "+342.7%", streak: "23 days", avatar: "AM", verified: true },
  { rank: 2, name: "Sarah K.", returns: "+298.4%", streak: "19 days", avatar: "SK", verified: true },
  { rank: 3, name: "Mike R.", returns: "+267.1%", streak: "16 days", avatar: "MR", verified: false },
  { rank: 4, name: "Emma L.", returns: "+243.8%", streak: "14 days", avatar: "EL", verified: true },
  { rank: 5, name: "David C.", returns: "+231.2%", streak: "12 days", avatar: "DC", verified: false },
];

export const PerformanceLeaderboard = () => {
  return (
    <Card className="p-6 bg-card/80 backdrop-blur-sm">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-bold text-foreground">Top Performers This Month</h3>
        <Badge variant="outline" className="border-secondary/50 text-secondary">
          🏆 Live Leaderboard
        </Badge>
      </div>
      
      <div className="space-y-4">
        {leaderboardData.map((user) => (
          <div key={user.rank} className="flex items-center gap-4 p-3 rounded-lg bg-muted/30">
            <div className="flex items-center gap-3">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                user.rank === 1 ? 'bg-yellow-500 text-black' :
                user.rank === 2 ? 'bg-gray-400 text-black' :
                user.rank === 3 ? 'bg-orange-600 text-white' :
                'bg-muted text-muted-foreground'
              }`}>
                {user.rank}
              </div>
              <Avatar className="h-10 w-10">
                <AvatarImage src="" />
                <AvatarFallback className="bg-primary text-primary-foreground text-sm">
                  {user.avatar}
                </AvatarFallback>
              </Avatar>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-foreground">{user.name}</span>
                  {user.verified && (
                    <div className="w-4 h-4 bg-secondary rounded-full flex items-center justify-center">
                      <span className="text-secondary-foreground text-xs">✓</span>
                    </div>
                  )}
                </div>
                <div className="text-sm text-muted-foreground">{user.streak} streak</div>
              </div>
            </div>
            
            <div className="ml-auto text-right">
              <div className="text-lg font-bold text-secondary">{user.returns}</div>
              <div className="text-xs text-muted-foreground">YTD Returns</div>
            </div>
          </div>
        ))}
      </div>
      
      <div className="mt-6 text-center">
        <div className="text-sm text-muted-foreground mb-2">
          Could you be next? Join 12,847+ successful traders
        </div>
        <Badge variant="outline" className="border-primary/50 text-primary">
          📈 Average member return: +127.3% YTD
        </Badge>
      </div>
    </Card>
  );
};