import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Send, Image, Link, Bold, Italic } from 'lucide-react';

interface PostEditorProps {
  onSubmit: (content: string) => Promise<void>;
  placeholder?: string;
  isLoading?: boolean;
}

export function PostEditor({ onSubmit, placeholder = "Share your thoughts...", isLoading }: PostEditorProps) {
  const [content, setContent] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim() || isSubmitting) return;

    setIsSubmitting(true);
    try {
      await onSubmit(content.trim());
      setContent('');
    } catch (error) {
      console.error('Failed to submit post:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-3">
          <Avatar className="h-8 w-8">
            <AvatarFallback>U</AvatarFallback>
          </Avatar>
          <span>Write a reply</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <div className="flex items-center gap-2 border-b pb-2">
              <Button type="button" variant="ghost" size="sm">
                <Bold className="h-4 w-4" />
              </Button>
              <Button type="button" variant="ghost" size="sm">
                <Italic className="h-4 w-4" />
              </Button>
              <Button type="button" variant="ghost" size="sm">
                <Link className="h-4 w-4" />
              </Button>
              <Button type="button" variant="ghost" size="sm">
                <Image className="h-4 w-4" />
              </Button>
            </div>
            
            <Textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder={placeholder}
              className="min-h-[120px] resize-none"
              disabled={isSubmitting || isLoading}
            />
          </div>
          
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              Be respectful and constructive in your discussions
            </p>
            <Button 
              type="submit" 
              disabled={!content.trim() || isSubmitting || isLoading}
              className="flex items-center gap-2"
            >
              <Send className="h-4 w-4" />
              {isSubmitting ? 'Posting...' : 'Post Reply'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}