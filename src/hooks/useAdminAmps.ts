import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { logAdminAction } from '@/lib/auditLog';

export function useAmps() {
  return useQuery({
    queryKey: ['admin-amps'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('amp_catalog')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Get deployment counts for each amp
      const ampsWithCounts = await Promise.all(
        (data || []).map(async (amp) => {
          const { count } = await supabase
            .from('user_amps')
            .select('*', { count: 'exact', head: true })
            .eq('amp_id', amp.id);

          return {
            ...amp,
            deployment_count: count || 0
          };
        })
      );

      return ampsWithCounts;
    },
  });
}

export function useAmpDetail(ampId: string) {
  return useQuery({
    queryKey: ['admin-amp', ampId],
    queryFn: async () => {
      const { data: amp, error } = await supabase
        .from('amp_catalog')
        .select('*')
        .eq('id', ampId)
        .single();

      if (error) throw error;

      // Get user deployments
      const { data: deployments } = await supabase
        .from('user_amps')
        .select(`
          id,
          user_id,
          is_active,
          allocated_capital,
          created_at
        `)
        .eq('amp_id', ampId);

      // Fetch user details for each deployment
      const deploymentsWithUsers = await Promise.all(
        (deployments || []).map(async (deployment) => {
          const { data: userData } = await supabase.auth.admin.getUserById(
            deployment.user_id
          );
          
          return {
            ...deployment,
            users: {
              email: userData.user?.email || 'Unknown',
              full_name: userData.user?.user_metadata?.full_name || null
            }
          };
        })
      );

      return {
        ...amp,
        user_amps: deploymentsWithUsers
      };
    },
  });
}

export function useAmpStats() {
  return useQuery({
    queryKey: ['admin-amp-stats'],
    queryFn: async () => {
      // Total amps
      const { count: totalAmps } = await supabase
        .from('amp_catalog')
        .select('*', { count: 'exact', head: true });

      // Active deployments
      const { count: activeDeployments } = await supabase
        .from('user_amps')
        .select('*', { count: 'exact', head: true })
        .eq('is_active', true);

      // Total allocated capital
      const { data: capitalData } = await supabase
        .from('user_amps')
        .select('allocated_capital')
        .eq('is_active', true);

      const totalCapital = capitalData?.reduce((sum, row) => sum + (row.allocated_capital || 0), 0) || 0;

      return {
        totalAmps: totalAmps || 0,
        activeDeployments: activeDeployments || 0,
        totalCapital
      };
    },
  });
}

export function useUpdateAmp() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ ampId, updates }: { ampId: string; updates: any }) => {
      const { data, error } = await supabase
        .from('amp_catalog')
        .update(updates)
        .eq('id', ampId)
        .select()
        .single();

      if (error) throw error;

      await logAdminAction('amp.update', 'amp', ampId, updates);

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-amps'] });
      queryClient.invalidateQueries({ queryKey: ['admin-amp'] });
    },
  });
}

export function useDeactivateAmpDeployments() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ ampId }: { ampId: string }) => {
      // Deactivate all user deployments
      const { error } = await supabase
        .from('user_amps')
        .update({ is_active: false })
        .eq('amp_id', ampId);

      if (error) throw error;

      await logAdminAction('amp.deactivate_all', 'amp', ampId, { action: 'deactivate_all_deployments' });

      return { ampId };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-amps'] });
      queryClient.invalidateQueries({ queryKey: ['admin-amp'] });
    },
  });
}
