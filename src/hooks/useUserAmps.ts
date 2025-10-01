import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { UserAmp, AmpsSummary } from '@/types/amps';
import { toast } from 'sonner';

export const useUserAmps = () => {
  const [amps, setAmps] = useState<UserAmp[]>([]);
  const [summary, setSummary] = useState<AmpsSummary>({
    total_allocated: 0,
    available_capital: 0,
    total_amps: 0,
    active_amps: 0
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAmps = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const { data, error: fetchError } = await supabase.functions.invoke('get-user-amps');

      if (fetchError) throw fetchError;

      if (data) {
        setAmps(data.amps || []);
        setSummary(data.summary || {
          total_allocated: 0,
          available_capital: 0,
          total_amps: 0,
          active_amps: 0
        });
      }
    } catch (err) {
      console.error('Error fetching amps:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch amps');
      toast.error('Failed to load amps');
    } finally {
      setIsLoading(false);
    }
  };

  const toggleAmpActive = async (ampId: string, isActive: boolean) => {
    try {
      const { data, error } = await supabase.functions.invoke('toggle-amp-active', {
        body: { user_amp_id: ampId, is_active: isActive }
      });

      if (error) throw error;

      if (data?.warning) {
        toast.warning(data.warning);
      } else {
        toast.success(`Amp ${isActive ? 'enabled' : 'disabled'} successfully`);
      }

      await fetchAmps();
    } catch (err) {
      console.error('Error toggling amp:', err);
      toast.error(err instanceof Error ? err.message : 'Failed to toggle amp');
      throw err;
    }
  };

  const allocateCapital = async (ampId: string, capital: number) => {
    try {
      const { data, error } = await supabase.functions.invoke('allocate-capital', {
        body: { user_amp_id: ampId, allocated_capital: capital }
      });

      if (error) throw error;

      toast.success('Capital allocated successfully');
      await fetchAmps();
    } catch (err) {
      console.error('Error allocating capital:', err);
      toast.error(err instanceof Error ? err.message : 'Failed to allocate capital');
      throw err;
    }
  };

  const addAmp = async (ampId: string, name: string, capital: number) => {
    try {
      const { data, error } = await supabase.functions.invoke('add-user-amp', {
        body: { amp_id: ampId, name, allocated_capital: capital }
      });

      if (error) throw error;

      toast.success('Amp added successfully');
      await fetchAmps();
      return data.amp;
    } catch (err) {
      console.error('Error adding amp:', err);
      toast.error(err instanceof Error ? err.message : 'Failed to add amp');
      throw err;
    }
  };

  const updateSettings = async (ampId: string, settings: Partial<any>) => {
    try {
      const { data, error } = await supabase.functions.invoke('update-amp-settings', {
        body: { user_amp_id: ampId, settings }
      });

      if (error) throw error;

      if (data?.warning) {
        toast.warning(data.warning);
      } else {
        toast.success('Settings updated successfully');
      }

      await fetchAmps();
    } catch (err) {
      console.error('Error updating settings:', err);
      toast.error(err instanceof Error ? err.message : 'Failed to update settings');
      throw err;
    }
  };

  useEffect(() => {
    fetchAmps();
    
    // Refresh every 30 seconds
    const interval = setInterval(fetchAmps, 30000);
    return () => clearInterval(interval);
  }, []);

  return {
    amps,
    summary,
    isLoading,
    error,
    fetchAmps,
    toggleAmpActive,
    allocateCapital,
    addAmp,
    updateSettings
  };
};
