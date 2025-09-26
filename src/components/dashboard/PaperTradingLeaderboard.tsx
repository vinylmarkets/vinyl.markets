import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Trophy, TrendingUp, User, Award } from 'lucide-react';

interface LeaderboardEntry {
  rank: number;
  account_id: string;
  return_percentage: number;
  sharpe_ratio: number;
  win_rate: number;
  total_trades: number;
  total_points: number;
  account_name: string;
  user_id: string;
}

export function PaperTradingLeaderboard() {
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchLeaderboard() {
      try {
        console.log('Fetching leaderboard data...');
        const { data, error } = await supabase
          .from('paper_leaderboards')
          .select(`
            *,
            paper_accounts!inner(account_name, user_id)
          `)
          .order('return_percentage', { ascending: false })
          .limit(10);

        console.log('Leaderboard query result:', { data, error });

        if (error) {
          console.error('Supabase error:', error);
          throw error;
        }

        const formattedData = data?.map((entry, index) => ({
          rank: index + 1,
          account_id: entry.account_id,
          return_percentage: entry.return_percentage || 0,
          sharpe_ratio: entry.sharpe_ratio || 0,
          win_rate: entry.win_rate || 0,
          total_trades: entry.total_trades || 0,
          total_points: entry.total_points || 0,
          account_name: entry.paper_accounts?.account_name || 'Anonymous',
          user_id: entry.paper_accounts?.user_id
        })) || [];

        console.log('Formatted leaderboard data:', formattedData);
        setLeaderboard(formattedData);
      } catch (error) {
        console.error('Error fetching leaderboard:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchLeaderboard();
  }, []);

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Trophy className="w-4 h-4 text-yellow-500" />;
      case 2:
        return <Award className="w-4 h-4 text-gray-400" />;
      case 3:
        return <Award className="w-4 h-4 text-amber-600" />;
      default:
        return <span className="w-4 h-4 flex items-center justify-center text-xs font-semibold text-muted-foreground">#{rank}</span>;
    }
  };

  const getPercentageBadgeColor = (rank: number, isPositive: boolean): React.CSSProperties | undefined => {
    if (!isPositive) return undefined; // Keep red for actual losses
    
    // Create gradient from purple (#10) to electric green (#1)
    const intensity = (11 - rank) / 10; // 0.1 for rank 10, 1.0 for rank 1
    
    // Purple to green transition
    const red = Math.round(128 + (127 * (1 - intensity))); // 255 (purple) to 0 (green)
    const green = Math.round(50 + (200 * intensity)); // 50 (purple) to 250 (electric green)
    const blue = Math.round(255 * (1 - intensity)); // 255 (purple) to 0 (green)
    
    return {
      backgroundColor: `rgb(${red}, ${green}, ${blue})`,
      color: intensity > 0.6 ? '#000' : '#fff', // Dark text for bright colors
      border: 'none'
    } as React.CSSProperties;
  };

  const formatPercentage = (value: number) => {
    const sign = value >= 0 ? '+' : '';
    return `${sign}${value.toFixed(2)}%`;
  };

  if (loading) {
    return (
      <Card className="h-fit">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-lg">
            <TrendingUp className="w-5 h-5" />
            Paper Trading Leaderboard
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex items-center gap-3">
                <div className="w-6 h-6 bg-muted animate-pulse rounded" />
                <div className="flex-1 space-y-1">
                  <div className="h-4 bg-muted animate-pulse rounded w-3/4" />
                  <div className="h-3 bg-muted animate-pulse rounded w-1/2" />
                </div>
                <div className="h-6 w-16 bg-muted animate-pulse rounded" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="h-fit">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base">
          <TrendingUp className="w-4 h-4" />
          Trading Leaders
        </CardTitle>
      </CardHeader>
      <CardContent>
        {leaderboard.length === 0 ? (
          <div className="text-center py-8">
            <User className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
            <p className="text-sm text-muted-foreground">No traders yet</p>
            <p className="text-xs text-muted-foreground mt-1">
              Start paper trading to see rankings
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {leaderboard.map((entry) => (
              <div
                key={entry.account_id}
                className="flex items-center justify-between p-2 rounded-lg hover:bg-muted/50 transition-colors text-xs"
              >
                <div className="flex items-center gap-2 min-w-0 flex-1">
                  <div className="flex items-center justify-center w-5 h-5 text-xs">
                    {getRankIcon(entry.rank)}
                  </div>
                  <span className="font-medium truncate">{entry.account_name}</span>
                </div>
                
                <div className="flex items-center gap-3 text-xs">
                  <span className="text-muted-foreground">{entry.total_trades} trades</span>
                  <span className="text-muted-foreground">
                    ${((entry.return_percentage / 100) * 100000).toLocaleString()}
                  </span>
                  <Badge
                    variant={entry.return_percentage >= 0 ? undefined : 'destructive'}
                    className="text-xs min-w-[60px] text-center"
                    style={entry.return_percentage >= 0 ? getPercentageBadgeColor(entry.rank, true) : undefined}
                  >
                    {formatPercentage(entry.return_percentage)}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        )}
        
        <div className="mt-4 pt-3 border-t">
          <p className="text-xs text-muted-foreground text-center">
            Rankings updated in real-time
          </p>
        </div>
      </CardContent>
    </Card>
  );
}