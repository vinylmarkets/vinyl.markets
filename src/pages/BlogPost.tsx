import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Clock, User, ArrowLeft, Share2, BookOpen, Eye } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import stockBasicsImage from '@/assets/blog-stock-basics.jpg';
import riskManagementImage from '@/assets/blog-risk-management.jpg';
import portfolioBuildingImage from '@/assets/blog-portfolio-building.jpg';
import technicalAnalysisImage from '@/assets/blog-technical-analysis.jpg';

interface BlogPost {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  featured_image_url: string;
  featured_image_alt: string;
  author_name: string;
  author_bio: string;
  reading_time_minutes: number;
  published_at: string;
  category: string;
  tags: string[];
  view_count: number;
  meta_title: string;
  meta_description: string;
  seo_schema: any;
}

const imageMap: Record<string, string> = {
  '/src/assets/blog-stock-basics.jpg': stockBasicsImage,
  '/src/assets/blog-risk-management.jpg': riskManagementImage,
  '/src/assets/blog-portfolio-building.jpg': portfolioBuildingImage,
  '/src/assets/blog-technical-analysis.jpg': technicalAnalysisImage,
};

export default function BlogPost() {
  const { slug } = useParams();
  const { toast } = useToast();
  const [post, setPost] = useState<BlogPost | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchPost() {
      if (!slug) return;

      try {
        const { data, error } = await supabase
          .from('blog_posts')
          .select('*')
          .eq('slug', slug)
          .eq('published', true)
          .single();

        if (error) {
          if (error.code === 'PGRST116') {
            throw new Error('Article not found');
          }
          throw error;
        }

        setPost(data);

        // Track view
        await supabase
          .from('blog_views')
          .insert({
            post_id: data.id,
            ip_address: 'unknown', // In production, you'd get this from headers
            user_agent: navigator.userAgent,
            referrer: document.referrer
          });

      } catch (error) {
        console.error('Error fetching post:', error);
        toast({
          title: "Error",
          description: "Article not found or could not be loaded.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    }

    fetchPost();
  }, [slug, toast]);

  useEffect(() => {
    if (post) {
      // Update page title and meta description
      document.title = post.meta_title || post.title;
      
      // Update meta description
      const metaDescription = document.querySelector('meta[name="description"]');
      if (metaDescription) {
        metaDescription.setAttribute('content', post.meta_description || post.excerpt || '');
      }

      // Add structured data
      if (post.seo_schema) {
        const script = document.createElement('script');
        script.type = 'application/ld+json';
        script.textContent = JSON.stringify(post.seo_schema);
        document.head.appendChild(script);

        return () => {
          document.head.removeChild(script);
        };
      }
    }
  }, [post]);

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: post?.title,
          text: post?.excerpt,
          url: window.location.href,
        });
      } catch (error) {
        console.error('Error sharing:', error);
      }
    } else {
      // Fallback: copy URL to clipboard
      await navigator.clipboard.writeText(window.location.href);
      toast({
        title: "Link copied!",
        description: "The article link has been copied to your clipboard.",
      });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-secondary">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="space-y-8">
            <div className="aspect-video bg-muted animate-pulse rounded-lg" />
            <div className="space-y-4">
              <div className="h-8 bg-muted animate-pulse rounded w-3/4" />
              <div className="h-4 bg-muted animate-pulse rounded w-1/2" />
              <div className="space-y-2">
                {[...Array(10)].map((_, i) => (
                  <div key={i} className="h-4 bg-muted animate-pulse rounded" />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="min-h-screen bg-gradient-secondary flex items-center justify-center">
        <div className="text-center">
          <BookOpen className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
          <h1 className="text-2xl font-bold mb-2">Article Not Found</h1>
          <p className="text-muted-foreground mb-6">
            The article you're looking for doesn't exist or has been removed.
          </p>
          <Link to="/articles">
            <Button>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Articles
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <article className="min-h-screen bg-gradient-secondary">
      {/* Header */}
      <div className="bg-background border-b">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Link to="/articles" className="inline-flex items-center text-muted-foreground hover:text-foreground transition-colors mb-6">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Articles
          </Link>

          <div className="space-y-6">
            {/* Categories and Tags */}
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="default" className="bg-primary">
                {post.category}
              </Badge>
              {post.tags?.slice(0, 3).map((tag) => (
                <Badge key={tag} variant="outline">
                  {tag}
                </Badge>
              ))}
            </div>

            {/* Title */}
            <h1 className="text-4xl sm:text-5xl font-bold leading-tight text-foreground">
              {post.title}
            </h1>

            {/* Excerpt */}
            {post.excerpt && (
              <p className="text-xl text-muted-foreground leading-relaxed">
                {post.excerpt}
              </p>
            )}

            {/* Meta info */}
            <div className="flex flex-wrap items-center gap-6 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <User className="w-4 h-4" />
                <span>{post.author_name}</span>
              </div>

              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4" />
                <span>{post.reading_time_minutes} min read</span>
              </div>

              <div className="flex items-center gap-2">
                <Eye className="w-4 h-4" />
                <span>{post.view_count} views</span>
              </div>

              <time dateTime={post.published_at}>
                {new Date(post.published_at).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </time>

              <Button variant="ghost" size="sm" onClick={handleShare}>
                <Share2 className="w-4 h-4 mr-2" />
                Share
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Featured Image */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="aspect-video overflow-hidden rounded-lg">
          <img
            src={imageMap[post.featured_image_url] || post.featured_image_url}
            alt={post.featured_image_alt || ''}
            className="w-full h-full object-cover"
          />
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
        <div className="bg-background rounded-lg p-8 shadow-sm">
          <div className="prose prose-lg max-w-none">
            {/* Convert markdown-style content to HTML for display */}
            <div 
              className="space-y-6 text-foreground"
              dangerouslySetInnerHTML={{ 
                __html: post.content
                  .replace(/^# (.*$)/gm, '<h2 class="text-2xl font-bold mt-8 mb-4">$1</h2>')
                  .replace(/^## (.*$)/gm, '<h3 class="text-xl font-semibold mt-6 mb-3">$1</h3>')
                  .replace(/^### (.*$)/gm, '<h4 class="text-lg font-medium mt-4 mb-2">$1</h4>')
                  .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
                  .replace(/\*(.*?)\*/g, '<em>$1</em>')
                  .replace(/^- (.*$)/gm, '<li>$1</li>')
                  .replace(/(<li>.*<\/li>)/s, '<ul class="list-disc pl-6 space-y-1">$1</ul>')
                  .replace(/\n\n/g, '</p><p class="mb-4">')
                  .replace(/^(?!<[h|u|l])(.+)$/gm, '<p class="mb-4">$1</p>')
              }}
            />
          </div>
        </div>

        {/* Author Bio */}
        {post.author_bio && (
          <>
            <Separator className="my-8" />
            <div className="bg-background rounded-lg p-6">
              <h3 className="text-lg font-semibold mb-2">About the Author</h3>
              <div className="flex items-start gap-4">
                <div className="flex-1">
                  <p className="font-medium">{post.author_name}</p>
                  <p className="text-muted-foreground text-sm mt-1">{post.author_bio}</p>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </article>
  );
}