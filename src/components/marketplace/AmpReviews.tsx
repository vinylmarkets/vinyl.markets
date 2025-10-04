import React, { useState, useEffect } from 'react';
import { ReviewsService } from '@/lib/reviewsService';
import { AmpReview, ReviewStats } from '@/types/marketplace';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Star, ThumbsUp, CheckCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface AmpReviewsProps {
  ampId: string;
  userId?: string;
}

export function AmpReviews({ ampId, userId }: AmpReviewsProps) {
  const [reviews, setReviews] = useState<AmpReview[]>([]);
  const [stats, setStats] = useState<ReviewStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const { toast } = useToast();
  
  useEffect(() => {
    loadReviews();
    loadStats();
  }, [ampId]);
  
  const loadReviews = async () => {
    try {
      const data = await ReviewsService.getReviews(ampId, { sort_by: 'helpful', limit: 20 });
      setReviews(data);
    } catch (error) {
      console.error('Error loading reviews:', error);
    } finally {
      setLoading(false);
    }
  };
  
  const loadStats = async () => {
    try {
      const data = await ReviewsService.getReviewStats(ampId);
      setStats(data);
    } catch (error) {
      console.error('Error loading stats:', error);
    }
  };
  
  const handleReviewSubmitted = () => {
    setShowForm(false);
    loadReviews();
    loadStats();
  };
  
  if (loading) {
    return <div className="text-center py-8">Loading reviews...</div>;
  }
  
  return (
    <div className="space-y-6">
      {/* Stats Overview */}
      {stats && stats.total_reviews > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Customer Reviews</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-6">
              <div className="text-5xl font-bold">{stats.average_rating.toFixed(1)}</div>
              <div className="flex-1">
                <StarRating rating={stats.average_rating} size="lg" />
                <div className="text-sm text-muted-foreground mt-1">
                  {stats.total_reviews} {stats.total_reviews === 1 ? 'review' : 'reviews'} 
                  {stats.verified_reviews > 0 && ` (${stats.verified_reviews} verified)`}
                </div>
              </div>
            </div>
            
            {/* Rating Distribution */}
            <div className="mt-6 space-y-2">
              {[5, 4, 3, 2, 1].map(rating => (
                <div key={rating} className="flex items-center gap-3">
                  <span className="text-sm w-16">{rating} star</span>
                  <div className="flex-1 bg-muted rounded-full h-2">
                    <div
                      className="bg-yellow-500 h-2 rounded-full transition-all"
                      style={{
                        width: `${stats.total_reviews > 0 ? (stats.rating_distribution[rating as keyof typeof stats.rating_distribution] / stats.total_reviews) * 100 : 0}%`
                      }}
                    />
                  </div>
                  <span className="text-sm text-muted-foreground w-12 text-right">
                    {stats.rating_distribution[rating as keyof typeof stats.rating_distribution]}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
      
      {/* Write Review Button */}
      {userId && (
        <Button onClick={() => setShowForm(!showForm)}>
          {showForm ? 'Cancel' : 'Write a Review'}
        </Button>
      )}
      
      {/* Review Form */}
      {showForm && userId && (
        <ReviewForm 
          ampId={ampId} 
          userId={userId} 
          onSubmit={handleReviewSubmitted}
          onCancel={() => setShowForm(false)}
        />
      )}
      
      {/* Reviews List */}
      {reviews.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            No reviews yet. Be the first to review this amp!
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {reviews.map(review => (
            <ReviewCard key={review.id} review={review} userId={userId} />
          ))}
        </div>
      )}
    </div>
  );
}

interface StarRatingProps {
  rating: number;
  size?: 'sm' | 'md' | 'lg';
  interactive?: boolean;
  onChange?: (rating: number) => void;
}

function StarRating({ rating, size = 'md', interactive = false, onChange }: StarRatingProps) {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6'
  };
  
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map(star => (
        <button
          key={star}
          type="button"
          onClick={() => interactive && onChange?.(star)}
          disabled={!interactive}
          className={interactive ? 'cursor-pointer hover:scale-110 transition-transform' : ''}
        >
          <Star
            className={`${sizeClasses[size]} ${
              star <= rating 
                ? 'fill-yellow-500 text-yellow-500' 
                : 'text-muted-foreground/30'
            }`}
          />
        </button>
      ))}
    </div>
  );
}

interface ReviewCardProps {
  review: AmpReview;
  userId?: string;
}

function ReviewCard({ review, userId }: ReviewCardProps) {
  const { toast } = useToast();
  const [helpful, setHelpful] = useState(false);
  
  const handleHelpful = async () => {
    if (!userId || helpful) return;
    
    try {
      await ReviewsService.markHelpful(review.id, userId);
      setHelpful(true);
      toast({
        title: 'Thank you!',
        description: 'Your feedback has been recorded.'
      });
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive'
      });
    }
  };
  
  return (
    <Card>
      <CardContent className="pt-6">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <span className="font-semibold">{review.user_name}</span>
              {review.verified_purchase && (
                <span className="inline-flex items-center gap-1 text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
                  <CheckCircle className="w-3 h-3" />
                  Verified Purchase
                </span>
              )}
            </div>
            <div className="flex items-center gap-2 mt-1">
              <StarRating rating={review.rating} size="sm" />
              <span className="text-sm text-muted-foreground">
                {new Date(review.created_at).toLocaleDateString()}
              </span>
            </div>
          </div>
        </div>
        
        <h3 className="font-semibold mt-4">{review.review_title}</h3>
        <p className="text-muted-foreground mt-2 whitespace-pre-wrap">{review.review_text}</p>
        
        <div className="mt-4 flex items-center gap-2">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleHelpful}
            disabled={!userId || helpful}
          >
            <ThumbsUp className={`w-4 h-4 mr-2 ${helpful ? 'fill-current' : ''}`} />
            Helpful ({review.helpful_count})
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

interface ReviewFormProps {
  ampId: string;
  userId: string;
  onSubmit: () => void;
  onCancel: () => void;
}

function ReviewForm({ ampId, userId, onSubmit, onCancel }: ReviewFormProps) {
  const [rating, setRating] = useState(5);
  const [title, setTitle] = useState('');
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      await ReviewsService.submitReview(ampId, userId, rating, title, text);
      toast({
        title: 'Success!',
        description: 'Your review has been submitted.'
      });
      onSubmit();
      setTitle('');
      setText('');
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>Write Your Review</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-sm font-medium">Rating</label>
            <div className="mt-2">
              <StarRating rating={rating} onChange={setRating} interactive size="lg" />
            </div>
          </div>
          
          <div>
            <label className="text-sm font-medium">Title</label>
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Sum up your experience"
              required
              maxLength={100}
            />
          </div>
          
          <div>
            <label className="text-sm font-medium">Review</label>
            <Textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Tell us about your experience with this amp (minimum 50 characters)"
              rows={6}
              required
              minLength={50}
            />
            <div className="text-sm text-muted-foreground mt-1">
              {text.length}/50 characters minimum
            </div>
          </div>
          
          <div className="flex gap-2">
            <Button type="submit" disabled={loading || text.length < 50}>
              {loading ? 'Submitting...' : 'Submit Review'}
            </Button>
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancel
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
