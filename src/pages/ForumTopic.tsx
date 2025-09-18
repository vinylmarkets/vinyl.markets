import React from 'react';
import { useParams } from 'react-router-dom';
import { ForumLayout } from '@/components/forum/ForumLayout';
import { TopicView } from '@/components/forum/TopicView';
import { PostEditor } from '@/components/forum/PostEditor';

export default function ForumTopic() {
  const { id } = useParams<{ id: string }>();
  
  // Placeholder data - will be replaced with real data from Supabase
  const topic = {
    id: id || '',
    title: 'Sample Topic',
    slug: 'sample-topic',
    reply_count: 5,
    view_count: 120,
    like_count: 8,
    is_pinned: false,
    created_at: new Date().toISOString(),
    user_id: 'user-1'
  };

  const posts = [
    {
      id: 'post-1',
      content: 'This is the first post in the topic...',
      post_number: 1,
      like_count: 3,
      created_at: new Date().toISOString(),
      user_id: 'user-1'
    }
  ];

  const handlePostSubmit = async (content: string) => {
    console.log('Submitting post:', content);
    // Will implement Supabase integration later
  };

  return (
    <ForumLayout>
      <div className="space-y-6">
        <TopicView topic={topic} posts={posts} isLoading={false} />
        <PostEditor onSubmit={handlePostSubmit} />
      </div>
    </ForumLayout>
  );
}