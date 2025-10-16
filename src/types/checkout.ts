// Checkout and Order Types

export interface PromoCode {
  code: string;
  discount_percent: number;
  max_uses: number;
  uses_count: number;
  expires_at: string;
  is_active: boolean;
  created_at: string;
  created_by?: string;
  description?: string;
}

export interface Order {
  id: string;
  user_id: string;
  total_amount: number;
  discount_amount: number;
  final_amount: number;
  promo_code?: string;
  status: 'pending' | 'completed' | 'failed';
  created_at: string;
  completed_at?: string;
}

export interface OrderItem {
  id: string;
  order_id: string;
  amp_id: string;
  price: number;
  pricing_model: 'monthly' | 'onetime';
  created_at: string;
  // Joined data
  amp?: {
    id: string;
    name: string;
    description: string | null;
    category: string | null;
    image_url: string | null;
  };
}

export interface OrderWithItems extends Order {
  items: OrderItem[];
}

export interface PromoCodeValidation {
  valid: boolean;
  discount_percent: number;
  error_message?: string;
}

export interface CheckoutParams {
  promo_code?: string;
}

export interface CheckoutResult {
  success: boolean;
  order_id?: string;
  error?: string;
}
