import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { BlogCard } from '@/components/blog/BlogCard';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, BookOpen } from 'lucide-react';
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

export default function BlogArchive() {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [filteredPosts, setFilteredPosts] = useState<BlogPost[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  useEffect(() => {
    async function fetchData() {
      try {
        // Fetch posts
        const { data: postsData, error: postsError } = await supabase
          .from('blog_posts')
          .select('*')
          .eq('published', true)
          .order('published_at', { ascending: false });

        if (postsError) throw postsError;

        // Fetch categories
        const { data: categoriesData, error: categoriesError } = await supabase
          .from('blog_categories')
          .select('name')
          .order('name');

        if (categoriesError) throw categoriesError;

        setPosts(postsData || []);
        setFilteredPosts(postsData || []);
        setCategories(categoriesData?.map(c => c.name) || []);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, []);

  useEffect(() => {
    let filtered = posts;

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(post =>
        post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        post.excerpt?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        post.tags?.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    // Filter by category
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(post => post.category === selectedCategory);
    }

    setFilteredPosts(filtered);
  }, [posts, searchTerm, selectedCategory]);

  return (
    <div className="min-h-screen bg-gradient-secondary">
      {/* Header */}
      <div className="bg-background border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center">
            <div className="flex items-center justify-center gap-3 mb-4">
              <BookOpen className="w-8 h-8 text-primary" />
              <h1 className="text-4xl font-bold text-foreground">Articles</h1>
            </div>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Educational content and insights to help you master trading and investing
            </p>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col sm:flex-row gap-4 mb-8">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <Input
              placeholder="Search articles..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          
          <Select value={selectedCategory} onValueChange={setSelectedCategory}>
            <SelectTrigger className="w-full sm:w-48">
              <SelectValue placeholder="All Categories" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              {categories.map((category) => (
                <SelectItem key={category} value={category}>
                  {category}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Results */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[...Array(6)].map((_, i) => (
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
        ) : filteredPosts.length > 0 ? (
          <>
            <div className="flex items-center justify-between mb-6">
              <p className="text-muted-foreground">
                {filteredPosts.length} article{filteredPosts.length !== 1 ? 's' : ''} found
              </p>
              {(searchTerm || selectedCategory !== 'all') && (
                <Button
                  variant="ghost"
                  onClick={() => {
                    setSearchTerm('');
                    setSelectedCategory('all');
                  }}
                >
                  Clear filters
                </Button>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredPosts.map((post) => (
                <BlogCard
                  key={post.id}
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
              ))}
            </div>
          </>
        ) : (
          <div className="text-center py-12">
            <BookOpen className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">No articles found</h3>
            <p className="text-muted-foreground">
              Try adjusting your search terms or filters
            </p>
          </div>
        )}
      </div>
    </div>
  );
}