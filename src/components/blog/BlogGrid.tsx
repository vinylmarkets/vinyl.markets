import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { BlogCard } from './BlogCard';
import stockBasicsImage from '@/assets/blog-stock-basics.jpg';
import riskManagementImage from '@/assets/blog-risk-management.jpg';
import portfolioBuildingImage from '@/assets/blog-portfolio-building.jpg';
import technicalAnalysisImage from '@/assets/blog-technical-analysis.jpg';

interface BlogPost {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  featured_image_url: string;
  featured_image_alt: string;
  author_name: string;
  reading_time_minutes: number;
  published_at: string;
  category: string;
  tags: string[];
}

const imageMap: Record<string, string> = {
  '/src/assets/blog-stock-basics.jpg': stockBasicsImage,
  '/src/assets/blog-risk-management.jpg': riskManagementImage,
  '/src/assets/blog-portfolio-building.jpg': portfolioBuildingImage,
  '/src/assets/blog-technical-analysis.jpg': technicalAnalysisImage,
};

export function BlogGrid() {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [contentReady, setContentReady] = useState(false);

  useEffect(() => {
    async function fetchPosts() {
      try {
        const { data, error } = await supabase
          .from('blog_posts')
          .select('*')
          .eq('published', true)
          .order('published_at', { ascending: false })
          .limit(4);

        if (error) throw error;
        setPosts(data || []);
      } catch (error) {
        console.error('Error fetching blog posts:', error);
      } finally {
        setLoading(false);
        // Small delay for smooth transition
        setTimeout(() => setContentReady(true), 150);
      }
    }

    fetchPosts();
  }, []);

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="space-y-4">
            <div className="aspect-video bg-muted animate-pulse rounded-lg" />
            <div className="space-y-2">
              <div className="h-4 bg-muted animate-pulse rounded" />
              <div className="h-4 bg-muted animate-pulse rounded w-3/4" />
              <div className="h-3 bg-muted animate-pulse rounded w-1/2" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 transition-all duration-700 ${contentReady ? 'opacity-100 animate-fade-in' : 'opacity-0'}`}>
      {posts.map((post, index) => (
        <div
          key={post.id}
          className={`transition-all duration-500 ${contentReady ? 'animate-scale-in' : ''}`}
          style={{ animationDelay: `${index * 100}ms` }}
        >
          <BlogCard
            id={post.id}
          title={post.title}
          slug={post.slug}
          excerpt={post.excerpt || ''}
          featuredImage={imageMap[post.featured_image_url] || post.featured_image_url}
          featuredImageAlt={post.featured_image_alt || ''}
          authorName={post.author_name}
          readingTime={post.reading_time_minutes || 5}
          publishedAt={post.published_at}
          category={post.category || 'Education'}
            tags={post.tags || []}
          />
        </div>
      ))}
    </div>
  );
}