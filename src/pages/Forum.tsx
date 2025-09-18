import React from 'react';
import { ForumLayout } from '@/components/forum/ForumLayout';
import { TopicList } from '@/components/forum/TopicList';

export default function Forum() {
  // Placeholder data - will be replaced with real data from Supabase
  const topics = [];

  return (
    <ForumLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-semibold">Recent Discussions</h2>
          <button className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90">
            New Topic
          </button>
        </div>
        
        <TopicList topics={topics} isLoading={false} />
      </div>
    </ForumLayout>
  );
}