import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { logAdminAction } from '@/lib/auditLog';

export function useUsers(filters?: {
  search?: string;
  status?: string;
  hasActiveAmps?: boolean;
}) {
  return useQuery({
    queryKey: ['admin-users', filters],
    queryFn: async () => {
      let query = supabase
        .from('users')
        .select(`
          *,
          user_amps!inner(id, is_active),
          paper_accounts(id, balance)
        `)
        .order('created_at', { ascending: false });

      // Apply search filter
      if (filters?.search) {
        query = query.or(`email.ilike.%${filters.search}%,full_name.ilike.%${filters.search}%`);
      }

      const { data, error } = await query;

      if (error) throw error;

      // Transform data to include counts
      const transformedData = (data || []).map(user => ({
        ...user,
        ampCount: Array.isArray(user.user_amps) ? user.user_amps.length : 0,
        paperBalance: Array.isArray(user.paper_accounts) && user.paper_accounts[0]?.balance ? user.paper_accounts[0].balance : 0
      }));

      // Client-side filtering for active amps (if needed)
      let filteredData = transformedData;
      
      if (filters?.hasActiveAmps) {
        filteredData = filteredData.filter(user => user.ampCount > 0);
      }

      return filteredData;
    },
  });
}

export function useUserDetail(userId: string) {
  return useQuery({
    queryKey: ['admin-user', userId],
    queryFn: async () => {
      const { data: user, error } = await supabase
        .from('users')
        .select(`
          *,
          user_amps(
            id,
            amp_id,
            is_active,
            allocated_capital,
            created_at,
            amp_catalog(name, description)
          ),
          paper_accounts(*),
          paper_positions(*)
        `)
        .eq('id', userId)
        .single();

      if (error) throw error;
      return user;
    },
  });
}

export function useUpdateUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ userId, updates }: { userId: string; updates: any }) => {
      const { data, error } = await supabase
        .from('users')
        .update(updates)
        .eq('id', userId)
        .select()
        .single();

      if (error) throw error;

      // Log the action
      await logAdminAction('user.update', 'user', userId, updates);

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
    },
  });
}

export function useSuspendUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ userId, reason }: { userId: string; reason?: string }) => {
      // Deactivate all user's amps
      const { error: ampsError } = await supabase
        .from('user_amps')
        .update({ is_active: false })
        .eq('user_id', userId);

      if (ampsError) throw ampsError;

      // Log the action
      await logAdminAction('user.suspend', 'user', userId, { reason });

      return { userId };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
    },
  });
}
