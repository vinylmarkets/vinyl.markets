import { useParams } from 'react-router-dom';
import { TopicList } from '@/components/forum/TopicList';

export default function ForumCategory() {
  const { categorySlug } = useParams<{ categorySlug: string }>();
  
  if (!categorySlug) {
    return <div>Category not found</div>;
  }

  return (
    <div className="min-h-screen bg-muted/30">
      <TopicList categorySlug={categorySlug} />
    </div>
  );
}