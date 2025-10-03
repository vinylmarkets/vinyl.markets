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

      return data || [];
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

      return amp;
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
        .eq('status', 'active');

      // Total allocated capital
      const { data: capitalData } = await supabase
        .from('user_amps')
        .select('allocated_capital')
        .eq('status', 'active');

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
      // Note: New schema doesn't have amp_id reference
      // This function is deprecated and does nothing
      await logAdminAction('amp.deactivate_all', 'amp', ampId, { action: 'deprecated' });
      return { ampId };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-amps'] });
      queryClient.invalidateQueries({ queryKey: ['admin-amp'] });
    },
  });
}
