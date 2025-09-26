import { Link } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';

interface BlogCardProps {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  featuredImage: string;
  featuredImageAlt: string;
  authorName: string;
  readingTime: number;
  publishedAt: string;
  category: string;
  tags: string[];
}

export function BlogCard({
  title,
  slug,
  excerpt,
  featuredImage,
  featuredImageAlt,
  authorName,
  readingTime,
  publishedAt,
  category,
  tags
}: BlogCardProps) {
  return (
    <Card className="group overflow-hidden hover:shadow-lg transition-all duration-300 bg-card border-border">
      <div className="aspect-video overflow-hidden">
        <img
          src={featuredImage}
          alt={featuredImageAlt}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          loading="lazy"
        />
      </div>
      
      <CardContent className="p-4">
        <Link to={`/articles/${slug}`} className="block group-hover:text-primary transition-colors">
          <h3 className="text-base font-medium leading-tight line-clamp-2">
            {title}
          </h3>
        </Link>
      </CardContent>
    </Card>
  );
}