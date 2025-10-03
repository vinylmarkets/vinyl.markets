import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export function useMarketStatus() {
  return useQuery({
    queryKey: ['market-status'],
    queryFn: async () => {
      const { data, error } = await supabase.functions.invoke('market-data', {
        body: { action: 'get-market-status' }
      });
      
      if (error) throw error;
      
      return {
        isOpen: data.market === 'open',
        afterHours: data.afterHours === 'open',
        earlyHours: data.earlyHours === 'open',
        serverTime: data.serverTime
      };
    },
    refetchInterval: 60000,
  });
}
