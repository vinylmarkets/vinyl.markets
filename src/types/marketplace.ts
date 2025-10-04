// Marketplace types for amp catalog, subscriptions, and reviews

export interface AmpReview {
  id: string;
  amp_id: string;
  user_id: string;
  rating: number; // 1-5 stars
  review_title: string;
  review_text: string;
  verified_purchase: boolean;
  helpful_count: number;
  created_at: Date;
  updated_at: Date;
  
  // Populated fields
  user_name?: string;
  user_avatar?: string;
}

export interface ReviewStats {
  amp_id: string;
  total_reviews: number;
  average_rating: number;
  rating_distribution: {
    1: number;
    2: number;
    3: number;
    4: number;
    5: number;
  };
  verified_reviews: number;
}

export interface ReviewFilters {
  rating?: number; // Filter by specific rating
  verified_only?: boolean;
  sort_by?: 'recent' | 'helpful' | 'rating_high' | 'rating_low';
  limit?: number;
  offset?: number;
}
