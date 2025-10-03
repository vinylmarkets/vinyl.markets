import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface UserAmp {
  id: string;
  user_id: string;
  name: string;
  description?: string;
  strategy_type: 'momentum' | 'mean_reversion' | 'breakout' | 'custom';
  risk_level: 'conservative' | 'moderate' | 'aggressive';
  allocated_capital: number;
  status: 'active' | 'paused' | 'stopped';
  total_pnl: number;
  total_pnl_percent: number;
  trades_count: number;
  win_rate: number;
  deployed_at: string;
  last_trade_at?: string;
  created_at: string;
  updated_at: string;
}

export function useUserAmps() {
  return useQuery({
    queryKey: ['user-amps'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('user_amps')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as UserAmp[];
    }
  });
}

export function useCreateAmp() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (ampData: {
      name: string;
      description?: string;
      strategy_type: string;
      risk_level: string;
      allocated_capital: number;
    }) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('user_amps')
        .insert({
          ...ampData,
          user_id: user.id
        })
        .select()
        .single();

      if (error) throw error;
      return data as UserAmp;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-amps'] });
      toast.success('Amp deployed successfully');
    },
    onError: (error: any) => {
      toast.error(`Failed to deploy amp: ${error.message}`);
    }
  });
}

export function useUpdateAmpStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ ampId, status }: { ampId: string; status: string }) => {
      const { data, error } = await supabase
        .from('user_amps')
        .update({ status })
        .eq('id', ampId)
        .select()
        .single();

      if (error) throw error;
      return data as UserAmp;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['user-amps'] });
      toast.success(`Amp ${data.status === 'active' ? 'activated' : 'paused'}`);
    },
    onError: (error: any) => {
      toast.error(`Failed to update amp: ${error.message}`);
    }
  });
}

export function useDeleteAmp() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (ampId: string) => {
      const { error } = await supabase
        .from('user_amps')
        .delete()
        .eq('id', ampId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-amps'] });
      toast.success('Amp deleted successfully');
    },
    onError: (error: any) => {
      toast.error(`Failed to delete amp: ${error.message}`);
    }
  });
}