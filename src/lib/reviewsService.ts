import { supabase } from '@/integrations/supabase/client';
import { AmpReview, ReviewStats, ReviewFilters } from '@/types/marketplace';

export class ReviewsService {
  
  /**
   * Submit a new review
   */
  static async submitReview(
    ampId: string,
    userId: string,
    rating: number,
    title: string,
    text: string
  ): Promise<AmpReview> {
    // Validation
    if (rating < 1 || rating > 5) {
      throw new Error('Rating must be between 1 and 5');
    }
    
    if (!title || title.trim().length === 0) {
      throw new Error('Review title is required');
    }
    
    if (!text || text.trim().length < 50) {
      throw new Error('Review must be at least 50 characters');
    }
    
    // Check if user has already reviewed this amp
    const { data: existing } = await supabase
      .from('amp_reviews')
      .select('id')
      .eq('amp_id', ampId)
      .eq('user_id', userId)
      .maybeSingle();
    
    if (existing) {
      throw new Error('You have already reviewed this amp');
    }
    
    // Check if user has purchased/subscribed to this amp
    // Note: amp_subscriptions table will be created in future migration
    const verified = false; // For now, default to false until subscriptions are implemented
    
    // Insert review
    const { data, error } = await supabase
      .from('amp_reviews')
      .insert({
        amp_id: ampId,
        user_id: userId,
        rating,
        review_title: title.trim(),
        review_text: text.trim(),
        verified_purchase: verified,
        helpful_count: 0
      })
      .select()
      .single();
    
    if (error) throw error;
    
    // Update amp's average rating
    await this.updateAmpRating(ampId);
    
    console.log('✅ Review submitted:', data.id);
    return {
      ...data,
      created_at: new Date(data.created_at),
      updated_at: new Date(data.updated_at)
    };
  }
  
  /**
   * Get reviews for an amp
   */
  static async getReviews(
    ampId: string,
    filters: ReviewFilters = {}
  ): Promise<AmpReview[]> {
    let query = supabase
      .from('amp_reviews')
      .select('*')
      .eq('amp_id', ampId);
    
    // Apply filters
    if (filters.rating) {
      query = query.eq('rating', filters.rating);
    }
    
    if (filters.verified_only) {
      query = query.eq('verified_purchase', true);
    }
    
    // Apply sorting
    switch (filters.sort_by) {
      case 'helpful':
        query = query.order('helpful_count', { ascending: false });
        break;
      case 'rating_high':
        query = query.order('rating', { ascending: false });
        break;
      case 'rating_low':
        query = query.order('rating', { ascending: true });
        break;
      case 'recent':
      default:
        query = query.order('created_at', { ascending: false });
    }
    
    // Pagination
    if (filters.limit) {
      query = query.limit(filters.limit);
    }
    if (filters.offset) {
      query = query.range(filters.offset, filters.offset + (filters.limit || 10) - 1);
    }
    
    const { data, error } = await query;
    
    if (error) throw error;
    
    // Transform data
    return (data || []).map(review => ({
      ...review,
      user_name: 'Anonymous', // Will be populated when profiles table is available
      created_at: new Date(review.created_at),
      updated_at: new Date(review.updated_at)
    }));
  }
  
  /**
   * Get review statistics for an amp
   */
  static async getReviewStats(ampId: string): Promise<ReviewStats> {
    const { data: reviews, error } = await supabase
      .from('amp_reviews')
      .select('rating, verified_purchase')
      .eq('amp_id', ampId);
    
    if (error) throw error;
    
    if (!reviews || reviews.length === 0) {
      return {
        amp_id: ampId,
        total_reviews: 0,
        average_rating: 0,
        rating_distribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
        verified_reviews: 0
      };
    }
    
    // Calculate statistics
    const total = reviews.length;
    const sum = reviews.reduce((acc, r) => acc + r.rating, 0);
    const average = sum / total;
    
    const distribution = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    reviews.forEach(r => {
      distribution[r.rating as keyof typeof distribution]++;
    });
    
    const verified = reviews.filter(r => r.verified_purchase).length;
    
    return {
      amp_id: ampId,
      total_reviews: total,
      average_rating: Number(average.toFixed(2)),
      rating_distribution: distribution,
      verified_reviews: verified
    };
  }
  
  /**
   * Mark review as helpful
   */
  static async markHelpful(reviewId: string, userId: string): Promise<void> {
    // Check if user already marked this helpful
    const { data: existing } = await supabase
      .from('review_helpful_votes')
      .select('id')
      .eq('review_id', reviewId)
      .eq('user_id', userId)
      .maybeSingle();
    
    if (existing) {
      throw new Error('You have already marked this review as helpful');
    }
    
    // Record the vote
    await supabase
      .from('review_helpful_votes')
      .insert({
        review_id: reviewId,
        user_id: userId
      });
    
    // Increment helpful count
    await supabase.rpc('increment_review_helpful_count', {
      review_id: reviewId
    });
    
    console.log('✅ Review marked as helpful');
  }
  
  /**
   * Update review (only by original author)
   */
  static async updateReview(
    reviewId: string,
    userId: string,
    updates: {
      rating?: number;
      title?: string;
      text?: string;
    }
  ): Promise<AmpReview> {
    // Verify ownership
    const { data: review } = await supabase
      .from('amp_reviews')
      .select('user_id, amp_id')
      .eq('id', reviewId)
      .single();
    
    if (!review || review.user_id !== userId) {
      throw new Error('Not authorized to update this review');
    }
    
    // Validate updates
    if (updates.rating && (updates.rating < 1 || updates.rating > 5)) {
      throw new Error('Rating must be between 1 and 5');
    }
    
    if (updates.text && updates.text.trim().length < 50) {
      throw new Error('Review must be at least 50 characters');
    }
    
    // Update review
    const { data, error } = await supabase
      .from('amp_reviews')
      .update({
        ...(updates.rating && { rating: updates.rating }),
        ...(updates.title && { review_title: updates.title.trim() }),
        ...(updates.text && { review_text: updates.text.trim() })
      })
      .eq('id', reviewId)
      .select()
      .single();
    
    if (error) throw error;
    
    // Update amp rating if rating changed
    if (updates.rating) {
      await this.updateAmpRating(review.amp_id);
    }
    
    return {
      ...data,
      created_at: new Date(data.created_at),
      updated_at: new Date(data.updated_at)
    };
  }
  
  /**
   * Delete review (only by original author or admin)
   */
  static async deleteReview(reviewId: string, userId: string, isAdmin: boolean = false): Promise<void> {
    // Get amp_id before deletion
    const { data: review } = await supabase
      .from('amp_reviews')
      .select('amp_id, user_id')
      .eq('id', reviewId)
      .single();
    
    if (!review) {
      throw new Error('Review not found');
    }
    
    // Verify ownership (unless admin)
    if (!isAdmin && review.user_id !== userId) {
      throw new Error('Not authorized to delete this review');
    }
    
    // Delete review
    const { error } = await supabase
      .from('amp_reviews')
      .delete()
      .eq('id', reviewId);
    
    if (error) throw error;
    
    // Update amp rating
    await this.updateAmpRating(review.amp_id);
    
    console.log('✅ Review deleted');
  }
  
  /**
   * Update amp's average rating in catalog
   */
  private static async updateAmpRating(ampId: string): Promise<void> {
    const stats = await this.getReviewStats(ampId);
    
    await supabase
      .from('amp_catalog')
      .update({
        average_rating: stats.average_rating,
        total_reviews: stats.total_reviews
      })
      .eq('id', ampId);
  }
}
