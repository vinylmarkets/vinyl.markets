import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { CartItem, CartSummary, AddToCartParams } from '@/types/cart';
import { useToast } from '@/hooks/use-toast';

export function useCart() {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  // Fetch cart items
  const fetchCart = useCallback(async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setCart([]);
        setLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from('cart_items')
        .select(`
          *,
          amp:amp_catalog(
            id,
            name,
            description,
            category,
            image_url,
            version
          )
        `)
        .eq('user_id', user.id)
        .order('added_at', { ascending: false });

      if (error) throw error;
      setCart((data || []) as CartItem[]);
    } catch (error) {
      console.error('Error fetching cart:', error);
      toast({
        title: 'Error',
        description: 'Failed to load cart',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchCart();
  }, [fetchCart]);

  // Add item to cart
  const addToCart = useCallback(async (params: AddToCartParams) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast({
          title: 'Authentication Required',
          description: 'Please sign in to add items to cart',
          variant: 'destructive'
        });
        return false;
      }

      const { error } = await supabase
        .from('cart_items')
        .insert({
          user_id: user.id,
          amp_id: params.amp_id,
          pricing_model: params.pricing_model,
          price: params.price
        });

      if (error) {
        // Check if item already exists
        if (error.code === '23505') {
          toast({
            title: 'Already in Cart',
            description: 'This item is already in your cart'
          });
          return false;
        }
        throw error;
      }

      toast({
        title: 'Added to Cart',
        description: 'Item successfully added to your cart'
      });

      await fetchCart();
      return true;
    } catch (error) {
      console.error('Error adding to cart:', error);
      toast({
        title: 'Error',
        description: 'Failed to add item to cart',
        variant: 'destructive'
      });
      return false;
    }
  }, [fetchCart, toast]);

  // Remove item from cart
  const removeFromCart = useCallback(async (cartItemId: string) => {
    try {
      const { error } = await supabase
        .from('cart_items')
        .delete()
        .eq('id', cartItemId);

      if (error) throw error;

      toast({
        title: 'Removed from Cart',
        description: 'Item removed from your cart'
      });

      await fetchCart();
      return true;
    } catch (error) {
      console.error('Error removing from cart:', error);
      toast({
        title: 'Error',
        description: 'Failed to remove item from cart',
        variant: 'destructive'
      });
      return false;
    }
  }, [fetchCart, toast]);

  // Clear entire cart
  const clearCart = useCallback(async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return false;

      const { error } = await supabase
        .from('cart_items')
        .delete()
        .eq('user_id', user.id);

      if (error) throw error;

      toast({
        title: 'Cart Cleared',
        description: 'All items removed from your cart'
      });

      await fetchCart();
      return true;
    } catch (error) {
      console.error('Error clearing cart:', error);
      toast({
        title: 'Error',
        description: 'Failed to clear cart',
        variant: 'destructive'
      });
      return false;
    }
  }, [fetchCart, toast]);

  // Calculate cart summary
  const getCartSummary = useCallback((): CartSummary => {
    const subtotal = cart.reduce((sum, item) => sum + item.price, 0);
    return {
      items: cart,
      subtotal,
      itemCount: cart.length
    };
  }, [cart]);

  return {
    cart,
    loading,
    addToCart,
    removeFromCart,
    clearCart,
    getCartSummary,
    fetchCart
  };
}
