import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { MessageCircle, Eye, Clock } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';

interface Topic {
  id: string;
  title: string;
  slug: string;
  reply_count: number;
  view_count: number;
  like_count: number;
  is_pinned: boolean;
  created_at: string;
  last_post_at: string;
  user_id: string;
  category_id: string;
}

interface TopicListProps {
  topics?: Topic[];
  isLoading?: boolean;
  categorySlug?: string;
}

export function TopicList({ topics: initialTopics, isLoading, categorySlug }: TopicListProps) {
  const [topics, setTopics] = useState<any[]>(initialTopics || []);
  const [category, setCategory] = useState<any>(null);
  const [showNewTopic, setShowNewTopic] = useState(false);
  const [newTopicTitle, setNewTopicTitle] = useState('');
  const [loading, setLoading] = useState(isLoading || false);
  const [creating, setCreating] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (categorySlug) {
      loadCategory();
    }
  }, [categorySlug]);

  useEffect(() => {
    if (category) {
      loadTopics();
    }
  }, [category]);

  const loadCategory = async () => {
    try {
      const { data } = await supabase
        .from('forum_categories' as any)
        .select('*')
        .eq('slug', categorySlug)
        .maybeSingle();
      
      setCategory(data);
    } catch (error) {
      console.error('Error loading category:', error);
    }
  };

  const loadTopics = async () => {
    try {
      setLoading(true);
      const { data } = await supabase
        .from('forum_topics' as any)
        .select('*')
        .eq('category_id', category.id)
        .order('created_at', { ascending: false });
      
      setTopics(data || []);
    } catch (error) {
      console.error('Error loading topics:', error);
    } finally {
      setLoading(false);
    }
  };

  const createTopic = async () => {
    if (!newTopicTitle.trim()) {
      toast({
        title: "Error",
        description: "Please enter a topic title",
        variant: "destructive"
      });
      return;
    }

    try {
      setCreating(true);
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      
      if (userError) {
        toast({
          title: "Authentication Error",
          description: "Please log in to create a topic",
          variant: "destructive"
        });
        return;
      }

      if (!user) {
        toast({
          title: "Authentication Required",
          description: "Please log in to create a topic",
          variant: "destructive"
        });
        return;
      }

      const slug = newTopicTitle.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]/g, '');
      
      console.log('Creating topic with:', {
        category_id: category.id,
        user_id: user.id,
        title: newTopicTitle,
        slug: slug
      });

      const { data, error } = await supabase
        .from('forum_topics')
        .insert({
          category_id: category.id,
          user_id: user.id,
          title: newTopicTitle,
          slug: slug
        })
        .select()
        .single();

      if (error) {
        console.error('Error creating topic:', error);
        toast({
          title: "Error Creating Topic",
          description: error.message || "Failed to create topic",
          variant: "destructive"
        });
        return;
      }

      if (data) {
        setTopics([data, ...topics]);
        setNewTopicTitle('');
        setShowNewTopic(false);
        toast({
          title: "Success",
          description: "Topic created successfully!"
        });
      }
    } catch (error) {
      console.error('Error creating topic:', error);
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive"
      });
    } finally {
      setCreating(false);
    }
  };

  // If we have a category slug but no category loaded yet, show loading
  if (categorySlug && !category) {
    return <div className="p-6">Loading...</div>;
  }

  // Show category-specific view if we have a category
  if (categorySlug && category) {
    return (
      <div className="max-w-6xl mx-auto p-6">
        <div className="mb-6">
          <Link to="/forum" className="text-primary hover:underline">← Back to Forum</Link>
          <h1 className="text-2xl font-bold mt-2">{category.name}</h1>
          <p className="text-muted-foreground">{category.description}</p>
        </div>

        <div className="mb-4">
          {!showNewTopic ? (
            <Button onClick={() => setShowNewTopic(true)}>
              <MessageCircle className="w-4 h-4 mr-2" />
              New Topic
            </Button>
          ) : (
            <Card className="p-4">
              <Input
                placeholder="Topic title..."
                value={newTopicTitle}
                onChange={(e) => setNewTopicTitle(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && createTopic()}
                autoFocus
              />
              <div className="flex gap-2 mt-2">
                <Button onClick={createTopic} size="sm" disabled={creating}>
                  {creating ? "Creating..." : "Create"}
                </Button>
                <Button onClick={() => setShowNewTopic(false)} variant="outline" size="sm" disabled={creating}>
                  Cancel
                </Button>
              </div>
            </Card>
          )}
        </div>

        <div className="space-y-2">
          {topics.map(topic => (
            <Link key={topic.id} to={`/forum/topic/${topic.id}`}>
              <Card className="p-4 hover:shadow-md transition-shadow cursor-pointer">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-medium hover:text-primary">{topic.title}</h3>
                    <div className="text-sm text-muted-foreground mt-1">
                      Created {new Date(topic.created_at).toLocaleDateString()}
                    </div>
                  </div>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <MessageCircle className="w-4 h-4" />
                      {topic.reply_count || 0}
                    </span>
                    <span className="flex items-center gap-1">
                      <Eye className="w-4 h-4" />
                      {topic.view_count || 0}
                    </span>
                  </div>
                </div>
              </Card>
            </Link>
          ))}
          
          {topics.length === 0 && !loading && (
            <Card className="p-8 text-center text-muted-foreground">
              No topics yet. Be the first to start a discussion!
            </Card>
          )}
        </div>
      </div>
    );
  }

  // Default topic list view (used in other components)
  if (loading) {
    return (
      <div className="space-y-4">
        {[...Array(5)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardContent className="p-6">
              <div className="h-4 bg-muted rounded w-3/4 mb-2"></div>
              <div className="h-3 bg-muted rounded w-1/2"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {topics.map((topic) => (
        <Card key={topic.id} className="hover:shadow-md transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  {topic.is_pinned && (
                    <Badge variant="secondary">Pinned</Badge>
                  )}
                  <h3 className="text-lg font-semibold hover:text-primary cursor-pointer">
                    {topic.title}
                  </h3>
                </div>
                
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <MessageCircle className="h-4 w-4" />
                    <span>{topic.reply_count || 0}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Eye className="h-4 w-4" />
                    <span>{topic.view_count || 0}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Clock className="h-4 w-4" />
                    <span>{new Date(topic.last_post_at || topic.created_at).toLocaleDateString()}</span>
                  </div>
                </div>
              </div>
              
              <Avatar className="h-8 w-8">
                <AvatarFallback>U</AvatarFallback>
              </Avatar>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}