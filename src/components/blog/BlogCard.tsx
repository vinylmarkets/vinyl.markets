import { Link } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Clock, User } from 'lucide-react';

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
      
      <CardContent className="p-6">
        <div className="flex items-center gap-2 mb-3">
          <Badge variant="secondary" className="text-xs">
            {category}
          </Badge>
          {tags.slice(0, 2).map((tag) => (
            <Badge key={tag} variant="outline" className="text-xs">
              {tag}
            </Badge>
          ))}
        </div>
        
        <Link to={`/articles/${slug}`} className="block group-hover:text-primary transition-colors">
          <h3 className="text-xl font-semibold leading-tight mb-3 line-clamp-2">
            {title}
          </h3>
        </Link>
        
        <p className="text-muted-foreground text-sm mb-4 line-clamp-3">
          {excerpt}
        </p>
        
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <div className="flex items-center gap-1">
            <User className="w-3 h-3" />
            <span>{authorName}</span>
          </div>
          
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1">
              <Clock className="w-3 h-3" />
              <span>{readingTime} min read</span>
            </div>
            <time dateTime={publishedAt}>
              {new Date(publishedAt).toLocaleDateString()}
            </time>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}