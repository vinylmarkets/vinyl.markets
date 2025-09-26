import { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { Save, Eye, FileText, Image, Tag, Zap, Globe, ArrowLeft } from 'lucide-react';

interface BlogPost {
  id?: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  featured_image_url: string;
  featured_image_alt: string;
  author_name: string;
  author_bio: string;
  published: boolean;
  meta_title: string;
  meta_description: string;
  keywords: string[];
  reading_time_minutes: number;
  category: string;
  tags: string[];
}

const initialPost: BlogPost = {
  title: '',
  slug: '',
  excerpt: '',
  content: '',
  featured_image_url: '',
  featured_image_alt: '',
  author_name: 'AtomicMarket Research Team',
  author_bio: 'Expert financial analysts providing educational content for traders and investors.',
  published: false,
  meta_title: '',
  meta_description: '',
  keywords: [],
  reading_time_minutes: 5,
  category: '',
  tags: []
};

export default function BlogEditor() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [post, setPost] = useState<BlogPost>(initialPost);
  const [categories, setCategories] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [newTag, setNewTag] = useState('');
  const [newKeyword, setNewKeyword] = useState('');

  useEffect(() => {
    fetchCategories();
    if (id) {
      fetchPost(id);
    }
  }, [id]);

  const fetchCategories = async () => {
    try {
      const { data, error } = await supabase
        .from('blog_categories')
        .select('name')
        .order('name');

      if (error) throw error;
      setCategories(data?.map(c => c.name) || []);
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const fetchPost = async (postId: string) => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('blog_posts')
        .select('*')
        .eq('id', postId)
        .single();

      if (error) throw error;
      setPost(data);
    } catch (error) {
      console.error('Error fetching post:', error);
      toast({
        title: "Error",
        description: "Failed to load blog post.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const generateSlug = (title: string) => {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, '')
      .replace(/\s+/g, '-')
      .trim();
  };

  const estimateReadingTime = (content: string) => {
    const wordsPerMinute = 200;
    const wordCount = content.split(/\s+/).length;
    return Math.max(1, Math.round(wordCount / wordsPerMinute));
  };

  const handleTitleChange = (title: string) => {
    setPost(prev => ({
      ...prev,
      title,
      slug: prev.slug || generateSlug(title),
      meta_title: prev.meta_title || `${title} | AtomicMarket`
    }));
  };

  const handleContentChange = (content: string) => {
    setPost(prev => ({
      ...prev,
      content,
      reading_time_minutes: estimateReadingTime(content)
    }));
  };

  const addTag = () => {
    if (newTag && !post.tags.includes(newTag)) {
      setPost(prev => ({
        ...prev,
        tags: [...prev.tags, newTag]
      }));
      setNewTag('');
    }
  };

  const removeTag = (tag: string) => {
    setPost(prev => ({
      ...prev,
      tags: prev.tags.filter(t => t !== tag)
    }));
  };

  const addKeyword = () => {
    if (newKeyword && !post.keywords.includes(newKeyword)) {
      setPost(prev => ({
        ...prev,
        keywords: [...prev.keywords, newKeyword]
      }));
      setNewKeyword('');
    }
  };

  const removeKeyword = (keyword: string) => {
    setPost(prev => ({
      ...prev,
      keywords: prev.keywords.filter(k => k !== keyword)
    }));
  };

  const generateSEOSchema = () => {
    return {
      "@context": "https://schema.org",
      "@type": "Article",
      "headline": post.title,
      "description": post.excerpt,
      "author": {
        "@type": "Person",
        "name": post.author_name
      },
      "publisher": {
        "@type": "Organization",
        "name": "AtomicMarket"
      },
      "datePublished": new Date().toISOString(),
      "image": post.featured_image_url,
      "keywords": post.keywords.join(', ')
    };
  };

  const savePost = async (publish = false) => {
    setSaving(true);
    try {
      const postData = {
        ...post,
        published: publish,
        published_at: publish ? new Date().toISOString() : null,
        seo_schema: generateSEOSchema()
      };

      if (id) {
        const { error } = await supabase
          .from('blog_posts')
          .update(postData)
          .eq('id', id);

        if (error) throw error;
      } else {
        const { data, error } = await supabase
          .from('blog_posts')
          .insert([postData])
          .select()
          .single();

        if (error) throw error;
        navigate(`/admin/blog/${data.id}`);
      }

      toast({
        title: "Success",
        description: `Blog post ${publish ? 'published' : 'saved'} successfully!`,
      });
    } catch (error) {
      console.error('Error saving post:', error);
      toast({
        title: "Error",
        description: "Failed to save blog post.",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto p-6">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-muted rounded w-1/3" />
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-4">
              <div className="h-10 bg-muted rounded" />
              <div className="h-40 bg-muted rounded" />
              <div className="h-60 bg-muted rounded" />
            </div>
            <div className="space-y-4">
              <div className="h-40 bg-muted rounded" />
              <div className="h-32 bg-muted rounded" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold">
          {id ? 'Edit Article' : 'Create New Article'}
        </h1>
        
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            onClick={() => savePost(false)}
            disabled={saving || !post.title}
          >
            <Save className="w-4 h-4 mr-2" />
            Save Draft
          </Button>
          
          <Button
            onClick={() => savePost(true)}
            disabled={saving || !post.title || !post.content || !post.category}
          >
            <Globe className="w-4 h-4 mr-2" />
            Publish
          </Button>

          <Button variant="outline" asChild>
            <Link to="/admin">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Admin Dashboard
            </Link>
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="w-5 h-5" />
                Content
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="title">Title</Label>
                <Input
                  id="title"
                  value={post.title}
                  onChange={(e) => handleTitleChange(e.target.value)}
                  placeholder="Enter article title..."
                />
              </div>

              <div>
                <Label htmlFor="slug">Slug</Label>
                <Input
                  id="slug"
                  value={post.slug}
                  onChange={(e) => setPost(prev => ({ ...prev, slug: e.target.value }))}
                  placeholder="article-url-slug"
                />
              </div>

              <div>
                <Label htmlFor="excerpt">Excerpt</Label>
                <Textarea
                  id="excerpt"
                  value={post.excerpt}
                  onChange={(e) => setPost(prev => ({ ...prev, excerpt: e.target.value }))}
                  placeholder="Brief description of the article..."
                  rows={3}
                />
              </div>

              <div>
                <Label htmlFor="content">Content (Markdown)</Label>
                <Textarea
                  id="content"
                  value={post.content}
                  onChange={(e) => handleContentChange(e.target.value)}
                  placeholder="Write your article content in markdown..."
                  rows={20}
                  className="font-mono"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Estimated reading time: {post.reading_time_minutes} minutes
                </p>
              </div>
            </CardContent>
          </Card>

          {/* SEO Section */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="w-5 h-5" />
                SEO & Meta
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="meta-title">Meta Title</Label>
                <Input
                  id="meta-title"
                  value={post.meta_title}
                  onChange={(e) => setPost(prev => ({ ...prev, meta_title: e.target.value }))}
                  placeholder="SEO title (60 characters max)"
                  maxLength={60}
                />
                <p className="text-xs text-muted-foreground">
                  {post.meta_title.length}/60 characters
                </p>
              </div>

              <div>
                <Label htmlFor="meta-description">Meta Description</Label>
                <Textarea
                  id="meta-description"
                  value={post.meta_description}
                  onChange={(e) => setPost(prev => ({ ...prev, meta_description: e.target.value }))}
                  placeholder="SEO description (160 characters max)"
                  maxLength={160}
                  rows={3}
                />
                <p className="text-xs text-muted-foreground">
                  {post.meta_description.length}/160 characters
                </p>
              </div>

              <div>
                <Label>SEO Keywords</Label>
                <div className="flex gap-2 mb-2">
                  <Input
                    value={newKeyword}
                    onChange={(e) => setNewKeyword(e.target.value)}
                    placeholder="Add keyword..."
                    onKeyPress={(e) => e.key === 'Enter' && addKeyword()}
                  />
                  <Button type="button" onClick={addKeyword} size="sm">
                    Add
                  </Button>
                </div>
                <div className="flex flex-wrap gap-1">
                  {post.keywords.map((keyword) => (
                    <Badge key={keyword} variant="secondary" className="cursor-pointer">
                      {keyword}
                      <button
                        onClick={() => removeKeyword(keyword)}
                        className="ml-1 hover:text-destructive"
                      >
                        ×
                      </button>
                    </Badge>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Publishing */}
          <Card>
            <CardHeader>
              <CardTitle>Publishing</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <Label htmlFor="published">Published</Label>
                <Switch
                  id="published"
                  checked={post.published}
                  onCheckedChange={(checked) => setPost(prev => ({ ...prev, published: checked }))}
                />
              </div>

              <div>
                <Label htmlFor="category">Category</Label>
                <Select value={post.category} onValueChange={(value) => setPost(prev => ({ ...prev, category: value }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((category) => (
                      <SelectItem key={category} value={category}>
                        {category}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Featured Image */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Image className="w-5 h-5" />
                Featured Image
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="image-url">Image URL</Label>
                <Input
                  id="image-url"
                  value={post.featured_image_url}
                  onChange={(e) => setPost(prev => ({ ...prev, featured_image_url: e.target.value }))}
                  placeholder="https://example.com/image.jpg"
                />
              </div>

              <div>
                <Label htmlFor="image-alt">Alt Text</Label>
                <Input
                  id="image-alt"
                  value={post.featured_image_alt}
                  onChange={(e) => setPost(prev => ({ ...prev, featured_image_alt: e.target.value }))}
                  placeholder="Descriptive alt text..."
                />
              </div>

              {post.featured_image_url && (
                <div className="aspect-video overflow-hidden rounded border">
                  <img
                    src={post.featured_image_url}
                    alt={post.featured_image_alt}
                    className="w-full h-full object-cover"
                  />
                </div>
              )}
            </CardContent>
          </Card>

          {/* Tags */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Tag className="w-5 h-5" />
                Tags
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-2">
                <Input
                  value={newTag}
                  onChange={(e) => setNewTag(e.target.value)}
                  placeholder="Add tag..."
                  onKeyPress={(e) => e.key === 'Enter' && addTag()}
                />
                <Button type="button" onClick={addTag} size="sm">
                  Add
                </Button>
              </div>
              
              <div className="flex flex-wrap gap-1">
                {post.tags.map((tag) => (
                  <Badge key={tag} variant="outline" className="cursor-pointer">
                    {tag}
                    <button
                      onClick={() => removeTag(tag)}
                      className="ml-1 hover:text-destructive"
                    >
                      ×
                    </button>
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Author */}
          <Card>
            <CardHeader>
              <CardTitle>Author</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="author-name">Name</Label>
                <Input
                  id="author-name"
                  value={post.author_name}
                  onChange={(e) => setPost(prev => ({ ...prev, author_name: e.target.value }))}
                />
              </div>

              <div>
                <Label htmlFor="author-bio">Bio</Label>
                <Textarea
                  id="author-bio"
                  value={post.author_bio}
                  onChange={(e) => setPost(prev => ({ ...prev, author_bio: e.target.value }))}
                  rows={3}
                />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}