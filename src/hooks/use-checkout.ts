import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { CheckoutParams, CheckoutResult, PromoCodeValidation } from '@/types/checkout';
import { CartItem } from '@/types/cart';

export function useCheckout() {
  const [processing, setProcessing] = useState(false);
  const [validatingPromo, setValidatingPromo] = useState(false);
  const { toast } = useToast();

  // Validate promo code
  const validatePromoCode = async (code: string): Promise<PromoCodeValidation> => {
    setValidatingPromo(true);
    try {
      const { data, error } = await supabase.rpc('validate_promo_code', { p_code: code });

      if (error) throw error;

      if (data && data.length > 0) {
        const result = data[0];
        return {
          valid: result.valid,
          discount_percent: result.discount_percent || 0,
          error_message: result.error_message
        };
      }

      return {
        valid: false,
        discount_percent: 0,
        error_message: 'Invalid promo code'
      };
    } catch (error) {
      console.error('Error validating promo code:', error);
      return {
        valid: false,
        discount_percent: 0,
        error_message: 'Failed to validate promo code'
      };
    } finally {
      setValidatingPromo(false);
    }
  };

  // Process checkout
  const processCheckout = async (
    cartItems: CartItem[],
    params: CheckoutParams
  ): Promise<CheckoutResult> => {
    setProcessing(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        return { success: false, error: 'Please sign in to complete checkout' };
      }

      if (cartItems.length === 0) {
        return { success: false, error: 'Cart is empty' };
      }

      // Calculate totals
      const totalAmount = cartItems.reduce((sum, item) => sum + item.price, 0);
      let discountAmount = 0;
      let discountPercent = 0;

      // Validate promo code if provided
      if (params.promo_code) {
        const validation = await validatePromoCode(params.promo_code);
        if (!validation.valid) {
          return { success: false, error: validation.error_message };
        }
        discountPercent = validation.discount_percent;
        discountAmount = (totalAmount * discountPercent) / 100;
      }

      const finalAmount = totalAmount - discountAmount;

      // Create order
      const { data: order, error: orderError } = await supabase
        .from('orders')
        .insert({
          user_id: user.id,
          total_amount: totalAmount,
          discount_amount: discountAmount,
          final_amount: finalAmount,
          promo_code: params.promo_code || null,
          status: 'pending'
        })
        .select()
        .single();

      if (orderError) throw orderError;

      // Create order items
      const orderItems = cartItems.map(item => ({
        order_id: order.id,
        amp_id: item.amp_id,
        price: item.price,
        pricing_model: item.pricing_model
      }));

      const { error: itemsError } = await supabase
        .from('order_items')
        .insert(orderItems);

      if (itemsError) throw itemsError;

      // Activate amps (add to user_amps) using edge function
      for (const item of cartItems) {
        try {
          await supabase.functions.invoke('add-user-amp', {
            body: {
              userId: user.id,
              ampId: item.amp_id
            }
          });
        } catch (error) {
          console.error('Error activating amp:', error);
        }
      }

      // Increment promo code usage
      if (params.promo_code) {
        await supabase.rpc('increment_promo_code_usage', {
          p_code: params.promo_code
        });
      }

      // Mark order as completed
      await supabase
        .from('orders')
        .update({
          status: 'completed',
          completed_at: new Date().toISOString()
        })
        .eq('id', order.id);

      // Clear cart
      await supabase
        .from('cart_items')
        .delete()
        .eq('user_id', user.id);

      toast({
        title: 'Order Complete!',
        description: 'Your amps have been added to your account',
      });

      return { success: true, order_id: order.id };
    } catch (error) {
      console.error('Checkout error:', error);
      toast({
        title: 'Checkout Failed',
        description: error instanceof Error ? error.message : 'An error occurred during checkout',
        variant: 'destructive'
      });
      return { success: false, error: 'Checkout failed. Please try again.' };
    } finally {
      setProcessing(false);
    }
  };

  return {
    processing,
    validatingPromo,
    validatePromoCode,
    processCheckout
  };
}
