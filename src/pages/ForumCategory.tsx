import React from 'react';
import { useParams } from 'react-router-dom';
import { ForumLayout } from '@/components/forum/ForumLayout';
import { TopicList } from '@/components/forum/TopicList';

export default function ForumCategory() {
  const { category } = useParams<{ category: string }>();
  
  // Placeholder data - will be replaced with real data from Supabase
  const topics = [];

  return (
    <ForumLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-semibold capitalize">{category} Discussions</h2>
            <p className="text-muted-foreground">Topics in this category</p>
          </div>
          <button className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90">
            New Topic
          </button>
        </div>
        
        <TopicList topics={topics} isLoading={false} />
      </div>
    </ForumLayout>
  );
}