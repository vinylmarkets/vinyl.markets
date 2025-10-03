import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useBlogPost, useCreateBlogPost, useUpdateBlogPost, useCategories } from '@/hooks/useCMS';
import { useAdminAuth } from '@/hooks/useAdminAuth';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { RichTextEditor } from '@/components/admin/RichTextEditor';
import { ArrowLeft, Save, Eye, Send } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export default function BlogEditor() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { adminUser } = useAdminAuth();

  const { data: post, isLoading } = useBlogPost(id || '');
  const { data: categories } = useCategories();
  const createPost = useCreateBlogPost();
  const updatePost = useUpdateBlogPost();

  const [formData, setFormData] = useState({
    title: '',
    slug: '',
    excerpt: '',
    content: '',
    category_id: '',
    featured_image: '',
    tags: [] as string[],
    meta_description: '',
    status: 'draft' as 'draft' | 'review' | 'published'
  });

  const [tagInput, setTagInput] = useState('');

  useEffect(() => {
    if (post) {
      const postStatus = post.status as 'draft' | 'review' | 'published' | undefined;
      setFormData({
        title: post.title || '',
        slug: post.slug || '',
        excerpt: post.excerpt || '',
        content: post.content || '',
        category_id: post.category_id || '',
        featured_image: post.featured_image || '',
        tags: post.tags || [],
        meta_description: post.meta_description || '',
        status: postStatus || 'draft'
      });
    }
  }, [post]);

  const handleSave = async (newStatus?: 'draft' | 'review' | 'published') => {
    if (!formData.title || !formData.slug) {
      toast({ title: 'Title and slug are required', variant: 'destructive' });
      return;
    }

    const dataToSave = {
      ...formData,
      status: newStatus || formData.status,
      published_at: newStatus === 'published' ? new Date().toISOString() : null
    };

    try {
      if (id && id !== 'new') {
        await updatePost.mutateAsync({ id, updates: dataToSave });
        toast({ title: 'Post updated successfully' });
      } else {
        const result = await createPost.mutateAsync(dataToSave);
        toast({ title: 'Post created successfully' });
        navigate(`/admin/content/blog/${result.id}`);
      }
    } catch (error: any) {
      toast({ 
        title: 'Failed to save post',
        description: error.message,
        variant: 'destructive'
      });
    }
  };

  const generateSlug = (title: string) => {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
  };

  const addTag = () => {
    if (tagInput && !formData.tags.includes(tagInput)) {
      setFormData({ ...formData, tags: [...formData.tags, tagInput] });
      setTagInput('');
    }
  };

  const removeTag = (tag: string) => {
    setFormData({ ...formData, tags: formData.tags.filter(t => t !== tag) });
  };

  if (isLoading && id && id !== 'new') {
    return <div className="p-6 text-white">Loading...</div>;
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <Button 
          variant="ghost" 
          onClick={() => navigate('/admin/content/blog')}
          className="text-gray-400 hover:text-white"
        >
          <ArrowLeft size={16} className="mr-2" />
          Back to Posts
        </Button>

        <div className="flex items-center gap-2">
          <Badge variant={
            formData.status === 'published' ? 'default' :
            formData.status === 'review' ? 'secondary' : 'outline'
          }>
            {formData.status}
          </Badge>

          <Button 
            variant="outline"
            onClick={() => handleSave('draft')}
            disabled={createPost.isPending || updatePost.isPending}
            className="border-[#2A2A2A]"
          >
            <Save size={16} className="mr-2" />
            Save Draft
          </Button>

          {adminUser?.role === 'admin' && formData.status === 'review' && (
            <Button 
              onClick={() => handleSave('published')}
              disabled={createPost.isPending || updatePost.isPending}
              className="bg-green-600 hover:bg-green-700"
            >
              <Eye size={16} className="mr-2" />
              Publish
            </Button>
          )}

          {adminUser?.role !== 'admin' && formData.status === 'draft' && (
            <Button 
              onClick={() => handleSave('review')}
              disabled={createPost.isPending || updatePost.isPending}
              className="bg-blue-600 hover:bg-blue-700"
            >
              <Send size={16} className="mr-2" />
              Submit for Review
            </Button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Editor */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="bg-[#1A1A1A] border-[#2A2A2A] p-6">
            <div className="space-y-4">
              <div>
                <Label className="text-gray-300">Title</Label>
                <Input
                  value={formData.title}
                  onChange={(e) => {
                    setFormData({ 
                      ...formData, 
                      title: e.target.value,
                      slug: (!id || id === 'new') ? generateSlug(e.target.value) : formData.slug
                    });
                  }}
                  placeholder="Enter post title..."
                  className="bg-[#0A0A0A] border-[#2A2A2A] text-white text-xl font-semibold mt-1.5"
                />
              </div>

              <div>
                <Label className="text-gray-300">Slug</Label>
                <Input
                  value={formData.slug}
                  onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                  placeholder="post-slug"
                  className="bg-[#0A0A0A] border-[#2A2A2A] text-white font-mono text-sm mt-1.5"
                />
                <p className="text-xs text-gray-500 mt-1">
                  URL: /articles/{formData.slug || 'post-slug'}
                </p>
              </div>

              <div>
                <Label className="text-gray-300">Excerpt</Label>
                <Textarea
                  value={formData.excerpt}
                  onChange={(e) => setFormData({ ...formData, excerpt: e.target.value })}
                  placeholder="Brief description of the post..."
                  rows={3}
                  className="bg-[#0A0A0A] border-[#2A2A2A] text-white mt-1.5"
                />
              </div>

              <div>
                <Label className="text-gray-300 mb-2 block">Content</Label>
                <RichTextEditor
                  content={formData.content}
                  onChange={(content) => setFormData({ ...formData, content })}
                  placeholder="Start writing your post..."
                />
              </div>
            </div>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <Card className="bg-[#1A1A1A] border-[#2A2A2A] p-6">
            <h3 className="text-sm font-semibold text-white mb-4">Post Settings</h3>
            
            <div className="space-y-4">
              <div>
                <Label className="text-gray-300">Category</Label>
                <Select 
                  value={formData.category_id} 
                  onValueChange={(v) => setFormData({ ...formData, category_id: v })}
                >
                  <SelectTrigger className="bg-[#0A0A0A] border-[#2A2A2A] text-white mt-1.5">
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories?.map((cat) => (
                      <SelectItem key={cat.id} value={cat.id}>
                        {cat.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label className="text-gray-300">Featured Image URL</Label>
                <Input
                  value={formData.featured_image}
                  onChange={(e) => setFormData({ ...formData, featured_image: e.target.value })}
                  placeholder="https://..."
                  className="bg-[#0A0A0A] border-[#2A2A2A] text-white mt-1.5"
                />
                {formData.featured_image && (
                  <div className="mt-2">
                    <img 
                      src={formData.featured_image} 
                      alt="Featured" 
                      className="w-full h-32 object-cover rounded"
                      onError={(e) => {
                        e.currentTarget.style.display = 'none';
                      }}
                    />
                  </div>
                )}
              </div>

              <div>
                <Label className="text-gray-300">Tags</Label>
                <div className="flex gap-2 mt-1.5">
                  <Input
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                    placeholder="Add tag..."
                    className="bg-[#0A0A0A] border-[#2A2A2A] text-white"
                  />
                  <Button onClick={addTag} variant="outline" className="border-[#2A2A2A]">
                    Add
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2 mt-2">
                  {formData.tags.map(tag => (
                    <Badge 
                      key={tag} 
                      variant="secondary"
                      className="cursor-pointer"
                      onClick={() => removeTag(tag)}
                    >
                      {tag} ×
                    </Badge>
                  ))}
                </div>
              </div>

              <div>
                <Label className="text-gray-300">Meta Description</Label>
                <Textarea
                  value={formData.meta_description}
                  onChange={(e) => setFormData({ ...formData, meta_description: e.target.value })}
                  placeholder="SEO description..."
                  rows={3}
                  className="bg-[#0A0A0A] border-[#2A2A2A] text-white mt-1.5"
                />
                <p className="text-xs text-gray-500 mt-1">
                  {formData.meta_description.length}/160 characters
                </p>
              </div>
            </div>
          </Card>

          {post && (
            <Card className="bg-[#1A1A1A] border-[#2A2A2A] p-6">
              <h3 className="text-sm font-semibold text-white mb-3">Post Info</h3>
              <div className="space-y-2 text-xs text-gray-400">
                <p>Created: {new Date(post.created_at).toLocaleDateString()}</p>
                <p>Author: {(post as any).users?.full_name || (post as any).users?.email || 'Unknown'}</p>
                {post.published_at && (
                  <p>Published: {new Date(post.published_at).toLocaleDateString()}</p>
                )}
              </div>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
