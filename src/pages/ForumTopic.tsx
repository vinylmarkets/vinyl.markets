import { useParams } from 'react-router-dom';
import { TopicView } from '@/components/forum/TopicView';

export default function ForumTopic() {
  const { topicId } = useParams<{ topicId: string }>();
  
  if (!topicId) {
    return <div>Topic not found</div>;
  }

  return (
    <div className="min-h-screen bg-muted/30">
      <TopicView topicId={topicId} />
    </div>
  );
}