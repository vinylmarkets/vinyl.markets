// Shopping Cart Types

export interface CartItem {
  id: string;
  user_id: string;
  amp_id: string;
  pricing_model: 'monthly' | 'onetime';
  price: number;
  added_at: string;
  updated_at: string;
  // Joined data from amp_catalog
  amp?: {
    id: string;
    name: string;
    description: string | null;
    category: string | null;
    image_url: string | null;
    version: string;
  };
}

export interface CartSummary {
  items: CartItem[];
  subtotal: number;
  itemCount: number;
}

export interface AddToCartParams {
  amp_id: string;
  pricing_model: 'monthly' | 'onetime';
  price: number;
}
