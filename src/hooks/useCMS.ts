import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { logAdminAction } from '@/lib/auditLog';

export function useBlogPosts(status?: string) {
  return useQuery({
    queryKey: ['blog-posts', status],
    queryFn: async () => {
      let query = supabase
        .from('blog_posts')
        .select(`
          *,
          blog_categories(name, slug)
        `)
        .order('created_at', { ascending: false });

      if (status && status !== 'all') {
        query = query.eq('status', status);
      }

      const { data, error } = await query;
      if (error) throw error;

      // Fetch author details separately
      const postsWithAuthors = await Promise.all(
        (data || []).map(async (post) => {
          if (post.author_id) {
            const { data: userData } = await supabase.auth.admin.getUserById(post.author_id);
            return {
              ...post,
              users: {
                email: userData.user?.email || 'Unknown',
                full_name: userData.user?.user_metadata?.full_name || null
              }
            };
          }
          return { ...post, users: null };
        })
      );

      return postsWithAuthors;
    },
  });
}

export function useBlogPost(id: string) {
  return useQuery({
    queryKey: ['blog-post', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('blog_posts')
        .select(`
          *,
          blog_categories(name, slug)
        `)
        .eq('id', id)
        .single();

      if (error) throw error;

      // Fetch author details
      if (data.author_id) {
        const { data: userData } = await supabase.auth.admin.getUserById(data.author_id);
        return {
          ...data,
          users: {
            email: userData.user?.email || 'Unknown',
            full_name: userData.user?.user_metadata?.full_name || null
          }
        };
      }

      return data;
    },
    enabled: !!id && id !== 'new',
  });
}

export function useCreateBlogPost() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (post: any) => {
      const { data: { user } } = await supabase.auth.getUser();
      
      const { data, error } = await supabase
        .from('blog_posts')
        .insert({
          ...post,
          author_id: user?.id
        })
        .select()
        .single();

      if (error) throw error;

      await logAdminAction('blog.create', 'blog_post', data.id, { title: post.title });

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['blog-posts'] });
    },
  });
}

export function useUpdateBlogPost() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: any }) => {
      const { data, error } = await supabase
        .from('blog_posts')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      await logAdminAction('blog.update', 'blog_post', id, updates);

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['blog-posts'] });
    },
  });
}

export function useDeleteBlogPost() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('blog_posts')
        .delete()
        .eq('id', id);

      if (error) throw error;

      await logAdminAction('blog.delete', 'blog_post', id, {});
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['blog-posts'] });
    },
  });
}

export function useCategories() {
  return useQuery({
    queryKey: ['blog-categories'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('blog_categories')
        .select('*')
        .order('name');

      if (error) throw error;
      return data || [];
    },
  });
}

export function useContentPages(status?: string) {
  return useQuery({
    queryKey: ['content-pages', status],
    queryFn: async () => {
      let query = supabase
        .from('content_pages')
        .select('*')
        .order('updated_at', { ascending: false });

      if (status && status !== 'all') {
        query = query.eq('status', status);
      }

      const { data, error } = await query;
      if (error) throw error;

      // Fetch author details
      const pagesWithAuthors = await Promise.all(
        (data || []).map(async (page) => {
          if (page.author_id) {
            const { data: userData } = await supabase.auth.admin.getUserById(page.author_id);
            return {
              ...page,
              users: {
                email: userData.user?.email || 'Unknown',
                full_name: userData.user?.user_metadata?.full_name || null
              }
            };
          }
          return { ...page, users: null };
        })
      );

      return pagesWithAuthors;
    },
  });
}

export function useContentPage(id: string) {
  return useQuery({
    queryKey: ['content-page', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('content_pages')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      return data;
    },
    enabled: !!id && id !== 'new',
  });
}

export function useUpdateContentPage() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: any }) => {
      const { data, error } = await supabase
        .from('content_pages')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      await logAdminAction('page.update', 'content_page', id, updates);

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['content-pages'] });
    },
  });
}
