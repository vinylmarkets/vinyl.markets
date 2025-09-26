import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Plus, Edit3, Eye, Trash2, Search, Filter, ArrowLeft } from 'lucide-react';

interface BlogPost {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  author_name: string;
  published: boolean;
  published_at: string | null;
  view_count: number;
  category: string;
  created_at: string;
  updated_at: string;
}

export default function BlogManagement() {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterPublished, setFilterPublished] = useState<boolean | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    try {
      const { data, error } = await supabase
        .from('blog_posts')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setPosts(data || []);
    } catch (error) {
      console.error('Error fetching posts:', error);
      toast({
        title: "Error",
        description: "Failed to load blog posts.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const deletePost = async (id: string) => {
    if (!confirm('Are you sure you want to delete this post?')) return;

    try {
      const { error } = await supabase
        .from('blog_posts')
        .delete()
        .eq('id', id);

      if (error) throw error;
      
      setPosts(posts.filter(p => p.id !== id));
      toast({
        title: "Success",
        description: "Blog post deleted successfully.",
      });
    } catch (error) {
      console.error('Error deleting post:', error);
      toast({
        title: "Error",
        description: "Failed to delete blog post.",
        variant: "destructive",
      });
    }
  };

  const filteredPosts = posts.filter(post => {
    const matchesSearch = post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         post.excerpt.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterPublished === null || post.published === filterPublished;
    return matchesSearch && matchesFilter;
  });

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto p-6">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-muted rounded w-1/3" />
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-20 bg-muted rounded" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold">Blog Management</h1>
        <div className="flex items-center gap-2">
          <Link to="/admin/blog/new">
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Create New Article
            </Button>
          </Link>
          <Button variant="outline" asChild>
            <Link to="/admin">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Admin Dashboard
            </Link>
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                <Input
                  placeholder="Search articles..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <Button
                variant={filterPublished === null ? "default" : "outline"}
                size="sm"
                onClick={() => setFilterPublished(null)}
              >
                All
              </Button>
              <Button
                variant={filterPublished === true ? "default" : "outline"}
                size="sm"
                onClick={() => setFilterPublished(true)}
              >
                Published
              </Button>
              <Button
                variant={filterPublished === false ? "default" : "outline"}
                size="sm"
                onClick={() => setFilterPublished(false)}
              >
                Drafts
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Posts List */}
      <div className="space-y-4">
        {filteredPosts.length === 0 ? (
          <Card>
            <CardContent className="pt-6 text-center">
              <p className="text-muted-foreground">
                {searchTerm || filterPublished !== null 
                  ? "No posts match your filters."
                  : "No blog posts yet. Create your first article!"
                }
              </p>
            </CardContent>
          </Card>
        ) : (
          filteredPosts.map((post) => (
            <Card key={post.id} className="hover:shadow-md transition-shadow">
              <CardContent className="pt-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="text-lg font-semibold">{post.title}</h3>
                      <Badge variant={post.published ? "default" : "secondary"}>
                        {post.published ? "Published" : "Draft"}
                      </Badge>
                      {post.category && (
                        <Badge variant="outline">{post.category}</Badge>
                      )}
                    </div>
                    
                    <p className="text-muted-foreground text-sm mb-3 line-clamp-2">
                      {post.excerpt}
                    </p>
                    
                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                      <span>By {post.author_name}</span>
                      <span>•</span>
                      <span>{post.view_count} views</span>
                      <span>•</span>
                      <span>
                        {post.published && post.published_at
                          ? `Published ${new Date(post.published_at).toLocaleDateString()}`
                          : `Created ${new Date(post.created_at).toLocaleDateString()}`
                        }
                      </span>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2 ml-4">
                    {post.published && (
                      <Button variant="ghost" size="sm" asChild>
                        <Link to={`/blog/${post.slug}`} target="_blank">
                          <Eye className="w-4 h-4" />
                        </Link>
                      </Button>
                    )}
                    
                    <Button variant="ghost" size="sm" asChild>
                      <Link to={`/admin/blog/${post.id}`}>
                        <Edit3 className="w-4 h-4" />
                      </Link>
                    </Button>
                    
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => deletePost(post.id)}
                      className="text-destructive hover:text-destructive"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Stats */}
      {posts.length > 0 && (
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Blog Statistics</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
              <div>
                <div className="text-2xl font-bold">{posts.length}</div>
                <div className="text-sm text-muted-foreground">Total Articles</div>
              </div>
              <div>
                <div className="text-2xl font-bold">
                  {posts.filter(p => p.published).length}
                </div>
                <div className="text-sm text-muted-foreground">Published</div>
              </div>
              <div>
                <div className="text-2xl font-bold">
                  {posts.filter(p => !p.published).length}
                </div>
                <div className="text-sm text-muted-foreground">Drafts</div>
              </div>
              <div>
                <div className="text-2xl font-bold">
                  {posts.reduce((sum, p) => sum + p.view_count, 0).toLocaleString()}
                </div>
                <div className="text-sm text-muted-foreground">Total Views</div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}