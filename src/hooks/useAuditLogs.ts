import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export function useAuditLogs(filters?: {
  startDate?: Date;
  endDate?: Date;
  adminUserId?: string;
  action?: string;
  resourceType?: string;
}) {
  return useQuery({
    queryKey: ['audit-logs', filters],
    queryFn: async () => {
      let query = supabase
        .from('audit_logs')
        .select(`
          *,
          admin_users!inner(
            user_id,
            role
          )
        `)
        .order('created_at', { ascending: false })
        .limit(100);

      // Apply date filters
      if (filters?.startDate) {
        query = query.gte('created_at', filters.startDate.toISOString());
      }
      if (filters?.endDate) {
        query = query.lte('created_at', filters.endDate.toISOString());
      }

      // Apply admin filter
      if (filters?.adminUserId) {
        query = query.eq('admin_user_id', filters.adminUserId);
      }

      // Apply action filter
      if (filters?.action) {
        query = query.ilike('action', `%${filters.action}%`);
      }

      // Apply resource type filter
      if (filters?.resourceType) {
        query = query.eq('resource_type', filters.resourceType);
      }

      const { data, error } = await query;

      if (error) throw error;

      // Fetch admin user details separately
      const logsWithAdmins = await Promise.all(
        (data || []).map(async (log) => {
          const { data: userData } = await supabase.auth.admin.getUserById(
            log.admin_users.user_id
          );
          
          return {
            ...log,
            admin_email: userData.user?.email || 'Unknown',
            admin_name: userData.user?.user_metadata?.full_name || 'Unknown'
          };
        })
      );

      return logsWithAdmins;
    },
    staleTime: 30000, // 30 seconds
  });
}

export function useAuditLogStats() {
  return useQuery({
    queryKey: ['audit-log-stats'],
    queryFn: async () => {
      // Count by action type (last 24 hours)
      const { data: actionCounts } = await supabase
        .from('audit_logs')
        .select('action')
        .gte('created_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString());

      // Group by action
      const grouped = (actionCounts || []).reduce((acc: any, log) => {
        acc[log.action] = (acc[log.action] || 0) + 1;
        return acc;
      }, {});

      // Count by admin (last 7 days)
      const { data: adminCounts } = await supabase
        .from('audit_logs')
        .select('admin_user_id')
        .gte('created_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString());

      const uniqueAdmins = new Set(adminCounts?.map(log => log.admin_user_id)).size;

      return {
        totalActions24h: actionCounts?.length || 0,
        topActions: Object.entries(grouped)
          .map(([action, count]) => ({ action, count }))
          .sort((a: any, b: any) => b.count - a.count)
          .slice(0, 5),
        activeAdmins: uniqueAdmins
      };
    },
    refetchInterval: 60000, // Refresh every minute
  });
}
