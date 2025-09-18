import React from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Heart, MessageCircle, Share } from 'lucide-react';

interface Post {
  id: string;
  content: string;
  post_number: number;
  like_count: number;
  created_at: string;
  user_id: string;
}

interface Topic {
  id: string;
  title: string;
  slug: string;
  reply_count: number;
  view_count: number;
  like_count: number;
  is_pinned: boolean;
  created_at: string;
  user_id: string;
}

interface TopicViewProps {
  topic: Topic;
  posts: Post[];
  isLoading?: boolean;
}

export function TopicView({ topic, posts, isLoading }: TopicViewProps) {
  if (isLoading) {
    return (
      <div className="space-y-6">
        <Card className="animate-pulse">
          <CardHeader>
            <div className="h-6 bg-muted rounded w-3/4"></div>
          </CardHeader>
        </Card>
        {[...Array(3)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardContent className="p-6">
              <div className="h-4 bg-muted rounded w-full mb-2"></div>
              <div className="h-4 bg-muted rounded w-2/3"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Topic Header */}
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-2 mb-2">
                {topic.is_pinned && (
                  <Badge variant="secondary">Pinned</Badge>
                )}
                <h1 className="text-2xl font-bold">{topic.title}</h1>
              </div>
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <span>{topic.reply_count} replies</span>
                <span>{topic.view_count} views</span>
                <span>Created {new Date(topic.created_at).toLocaleDateString()}</span>
              </div>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Posts */}
      <div className="space-y-4">
        {posts.map((post, index) => (
          <Card key={post.id}>
            <CardContent className="p-6">
              <div className="flex gap-4">
                <Avatar className="h-10 w-10 mt-1">
                  <AvatarFallback>U</AvatarFallback>
                </Avatar>
                
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">User</span>
                      <Badge variant="outline">#{post.post_number}</Badge>
                    </div>
                    <span className="text-sm text-muted-foreground">
                      {new Date(post.created_at).toLocaleString()}
                    </span>
                  </div>
                  
                  <div className="prose prose-sm max-w-none mb-4">
                    <p>{post.content}</p>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Button variant="ghost" size="sm">
                      <Heart className="h-4 w-4 mr-1" />
                      {post.like_count}
                    </Button>
                    <Button variant="ghost" size="sm">
                      <MessageCircle className="h-4 w-4 mr-1" />
                      Reply
                    </Button>
                    <Button variant="ghost" size="sm">
                      <Share className="h-4 w-4 mr-1" />
                      Share
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}