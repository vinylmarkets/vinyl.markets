import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export function useAdminStats() {
  return useQuery({
    queryKey: ['admin-stats'],
    queryFn: async () => {
      // Total users
      const { count: totalUsers } = await supabase
        .from('users')
        .select('*', { count: 'exact', head: true });

      // Active traders (users with active amps)
      const { count: activeTraders } = await supabase
        .from('user_amps')
        .select('user_id', { count: 'exact', head: true })
        .eq('status', 'active');

      // Total capital deployed (sum of allocated capital)
      const { data: capitalData } = await supabase
        .from('user_amps')
        .select('allocated_capital')
        .eq('status', 'active');

      const totalCapital = capitalData?.reduce((sum, row) => sum + (row.allocated_capital || 0), 0) || 0;

      // Active signals
      const { count: activeSignals } = await supabase
        .from('trading_signals')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'active');

      // User signups last 30 days
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      const { data: recentUsers, count: recentSignups } = await supabase
        .from('users')
        .select('created_at', { count: 'exact' })
        .gte('created_at', thirtyDaysAgo.toISOString())
        .order('created_at', { ascending: true });

      // Group by day for sparkline
      const signupsByDay = groupByDay(recentUsers || []);

      return {
        totalUsers: totalUsers || 0,
        activeTraders: activeTraders || 0,
        totalCapital,
        activeSignals: activeSignals || 0,
        recentSignups: recentSignups || 0,
        signupTrend: signupsByDay
      };
    },
    refetchInterval: 60000, // Refresh every minute
  });
}

function groupByDay(users: { created_at: string }[]) {
  const grouped: Record<string, number> = {};
  
  users.forEach(user => {
    const date = new Date(user.created_at).toISOString().split('T')[0];
    grouped[date] = (grouped[date] || 0) + 1;
  });

  return Object.entries(grouped).map(([date, count]) => ({ date, count }));
}

export function useRecentUsers() {
  return useQuery({
    queryKey: ['recent-users'],
    queryFn: async () => {
      const { data } = await supabase
        .from('users')
        .select('id, email, full_name, created_at')
        .order('created_at', { ascending: false })
        .limit(10);

      return data || [];
    },
  });
}
