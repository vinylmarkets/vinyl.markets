import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useBlogPosts, useDeleteBlogPost } from '@/hooks/useCMS';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Plus, Edit, Trash2, FileText } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Skeleton } from '@/components/ui/skeleton';

export default function BlogList() {
  const [statusFilter, setStatusFilter] = useState('all');
  const { data: posts, isLoading } = useBlogPosts(statusFilter === 'all' ? undefined : statusFilter);
  const deletePost = useDeleteBlogPost();
  const { toast } = useToast();

  const handleDelete = async (id: string, title: string) => {
    try {
      await deletePost.mutateAsync(id);
      toast({ title: `Deleted "${title}"` });
    } catch (error: any) {
      toast({ 
        title: 'Failed to delete post',
        description: error.message,
        variant: 'destructive'
      });
    }
  };

  const counts = {
    all: posts?.length || 0,
    draft: posts?.filter(p => p.status === 'draft').length || 0,
    review: posts?.filter(p => p.status === 'review').length || 0,
    published: posts?.filter(p => p.status === 'published').length || 0
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white mb-1">Blog Posts</h1>
          <p className="text-gray-400">Manage blog content and articles</p>
        </div>
        <Link to="/admin/content/blog/new">
          <Button className="bg-blue-600 hover:bg-blue-700">
            <Plus size={16} className="mr-2" />
            New Post
          </Button>
        </Link>
      </div>

      {/* Filters */}
      <Tabs value={statusFilter} onValueChange={setStatusFilter}>
        <TabsList className="bg-[#1A1A1A] border border-[#2A2A2A]">
          <TabsTrigger value="all">All ({counts.all})</TabsTrigger>
          <TabsTrigger value="draft">Drafts ({counts.draft})</TabsTrigger>
          <TabsTrigger value="review">In Review ({counts.review})</TabsTrigger>
          <TabsTrigger value="published">Published ({counts.published})</TabsTrigger>
        </TabsList>
      </Tabs>

      {/* Posts Table */}
      <Card className="bg-[#1A1A1A] border-[#2A2A2A] overflow-hidden">
        {isLoading ? (
          <div className="p-4 space-y-3">
            {[1,2,3,4,5].map(i => (
              <Skeleton key={i} className="h-16 bg-[#0A0A0A]" />
            ))}
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow className="border-[#2A2A2A] hover:bg-transparent">
                <TableHead className="text-gray-400">Title</TableHead>
                <TableHead className="text-gray-400">Category</TableHead>
                <TableHead className="text-gray-400">Author</TableHead>
                <TableHead className="text-gray-400">Status</TableHead>
                <TableHead className="text-gray-400">Date</TableHead>
                <TableHead className="text-gray-400 text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {posts?.map((post) => (
                <TableRow 
                  key={post.id}
                  className="border-[#2A2A2A] hover:bg-[#0A0A0A]"
                >
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <FileText className="w-5 h-5 text-gray-500" />
                      <div>
                        <p className="text-sm font-medium text-white">{post.title}</p>
                        <p className="text-xs text-gray-500">/articles/{post.slug}</p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className="border-[#2A2A2A]">
                      {post.blog_categories?.name || 'Uncategorized'}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-gray-400 text-sm">
                    {post.users?.full_name || post.users?.email || 'Unknown'}
                  </TableCell>
                  <TableCell>
                    <Badge variant={
                      post.status === 'published' ? 'default' :
                      post.status === 'review' ? 'secondary' : 'outline'
                    }>
                      {post.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-gray-400 text-sm">
                    {new Date(post.created_at).toLocaleDateString()}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Link to={`/admin/content/blog/${post.id}`}>
                        <Button variant="ghost" size="sm" className="text-blue-400">
                          <Edit size={14} />
                        </Button>
                      </Link>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="ghost" size="sm" className="text-red-400">
                            <Trash2 size={14} />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent className="bg-[#1A1A1A] border-[#2A2A2A]">
                          <AlertDialogHeader>
                            <AlertDialogTitle className="text-white">Delete Post</AlertDialogTitle>
                            <AlertDialogDescription>
                              Are you sure you want to delete "{post.title}"? This action cannot be undone.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel className="border-[#2A2A2A]">Cancel</AlertDialogCancel>
                            <AlertDialogAction 
                              onClick={() => handleDelete(post.id, post.title)}
                              className="bg-red-600 hover:bg-red-700"
                            >
                              Delete
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </TableCell>
                </TableRow>
              ))}

              {posts?.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-12">
                    <FileText className="w-12 h-12 text-gray-600 mx-auto mb-3" />
                    <p className="text-gray-400">No posts yet</p>
                    <Link to="/admin/content/blog/new">
                      <Button className="mt-4 bg-blue-600 hover:bg-blue-700">
                        Create Your First Post
                      </Button>
                    </Link>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        )}
      </Card>
    </div>
  );
}
