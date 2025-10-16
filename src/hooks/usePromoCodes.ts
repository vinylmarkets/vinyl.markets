import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface PromoCode {
  code: string;
  discount_percent: number;
  max_uses: number;
  uses_count: number;
  is_active: boolean;
  expires_at: string;
  created_at: string;
  created_by: string;
  description: string;
}

export const usePromoCodes = () => {
  const [promoCodes, setPromoCodes] = useState<PromoCode[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const fetchPromoCodes = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('promo_codes')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setPromoCodes(data || []);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to fetch promo codes',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const createPromoCode = async (data: {
    code: string;
    discount_percent: number;
    max_uses: number;
    expires_at: string;
  }) => {
    setIsLoading(true);
    try {
      const { error } = await supabase
        .from('promo_codes')
        .insert([data]);

      if (error) throw error;

      toast({
        title: 'Success',
        description: 'Promo code created successfully',
      });

      await fetchPromoCodes();
      return true;
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to create promo code',
        variant: 'destructive',
      });
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const togglePromoCode = async (code: string, isActive: boolean) => {
    setIsLoading(true);
    try {
      const { error } = await supabase
        .from('promo_codes')
        .update({ is_active: isActive })
        .eq('code', code);

      if (error) throw error;

      toast({
        title: 'Success',
        description: `Promo code ${isActive ? 'activated' : 'deactivated'}`,
      });

      await fetchPromoCodes();
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to update promo code',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const generateCode = () => {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    let code = '';
    for (let i = 0; i < 8; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return code;
  };

  return {
    promoCodes,
    isLoading,
    fetchPromoCodes,
    createPromoCode,
    togglePromoCode,
    generateCode,
  };
};
