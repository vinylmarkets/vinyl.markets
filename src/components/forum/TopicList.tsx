import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { MessageCircle, Eye, Clock } from 'lucide-react';

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
  topics: Topic[];
  isLoading?: boolean;
}

export function TopicList({ topics, isLoading }: TopicListProps) {
  if (isLoading) {
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
                    <span>{topic.reply_count}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Eye className="h-4 w-4" />
                    <span>{topic.view_count}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Clock className="h-4 w-4" />
                    <span>{new Date(topic.last_post_at).toLocaleDateString()}</span>
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