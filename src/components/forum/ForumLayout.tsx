import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card } from '@/components/ui/card';
import { Link } from 'react-router-dom';

interface ForumLayoutProps {
  children?: React.ReactNode;
}

export function ForumLayout({ children }: ForumLayoutProps) {
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    try {
      const { data, error } = await supabase
        .from('forum_categories' as any)
        .select('*')
        .order('position');
      
      if (error) {
        console.error('Error loading categories:', error);
      } else if (data) {
        setCategories(data);
      }
    } catch (err) {
      console.error('Error loading categories:', err);
    }
    setLoading(false);
  };

  if (loading) {
    return <div className="p-8">Loading forum...</div>;
  }

  // If children are provided, show them instead of the category list
  if (children) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8">
          <header className="mb-8">
            <Link to="/forum" className="text-3xl font-bold text-foreground hover:text-primary">
              Community Forum
            </Link>
            <p className="text-muted-foreground mt-2">Connect with other investors and share insights</p>
          </header>
          
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            <aside className="lg:col-span-1">
              <div className="bg-card rounded-lg border p-6">
                <h2 className="font-semibold mb-4">Categories</h2>
                <div className="space-y-2">
                  {categories.map(category => (
                    <Link 
                      key={category.id} 
                      to={`/forum/${category.slug}`}
                      className="block text-sm text-muted-foreground hover:text-foreground transition-colors"
                    >
                      <div className="flex items-center gap-2">
                        <div 
                          className="w-3 h-3 rounded" 
                          style={{ backgroundColor: category.color }}
                        />
                        {category.name}
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            </aside>
            
            <main className="lg:col-span-3">
              {children}
            </main>
          </div>
        </div>
      </div>
    );
  }

  // Default view - show category list
  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Community Forum</h1>
        <p className="text-muted-foreground mt-2">Discuss markets, trading, and predictions</p>
      </div>

      <div className="space-y-3">
        {categories.map(category => (
          <Link key={category.id} to={`/forum/${category.slug}`}>
            <Card className="p-4 hover:shadow-md transition-shadow cursor-pointer">
              <div className="flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-3">
                    <div 
                      className="w-4 h-4 rounded" 
                      style={{ backgroundColor: category.color }}
                    />
                    <h2 className="text-lg font-semibold">{category.name}</h2>
                  </div>
                  <p className="text-muted-foreground text-sm mt-1">{category.description}</p>
                </div>
                <div className="text-right text-sm text-muted-foreground">
                  <div>{category.topic_count} topics</div>
                  <div>{category.post_count} posts</div>
                </div>
              </div>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}