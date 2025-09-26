import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { 
  Images, 
  Search, 
  Download, 
  Copy, 
  Star, 
  StarOff, 
  Trash2, 
  Filter,
  Grid,
  List,
  Calendar
} from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

interface GeneratedImage {
  id: string;
  prompt: string;
  image_url: string;
  filename: string;
  created_at: string;
  tags?: string[];
  usage_notes?: string;
  is_featured: boolean;
}

export function ImageLibrary() {
  const [images, setImages] = useState<GeneratedImage[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [filterFeatured, setFilterFeatured] = useState(false);

  const loadImages = async () => {
    try {
      const { data, error } = await supabase
        .from('generated_images')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error loading images:', error);
        toast.error('Failed to load images');
        return;
      }

      setImages(data || []);
    } catch (error) {
      console.error('Error loading images:', error);
      toast.error('Failed to load images');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadImages();
  }, []);

  const filteredImages = images.filter(image => {
    const matchesSearch = 
      image.prompt.toLowerCase().includes(searchTerm.toLowerCase()) ||
      image.filename.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (image.tags && image.tags.some(tag => 
        tag.toLowerCase().includes(searchTerm.toLowerCase())
      )) ||
      (image.usage_notes && image.usage_notes.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesFeatured = !filterFeatured || image.is_featured;
    
    return matchesSearch && matchesFeatured;
  });

  const toggleFeatured = async (imageId: string, currentFeatured: boolean) => {
    try {
      const { error } = await supabase
        .from('generated_images')
        .update({ is_featured: !currentFeatured })
        .eq('id', imageId);

      if (error) {
        console.error('Error updating featured status:', error);
        toast.error('Failed to update featured status');
        return;
      }

      setImages(images.map(img => 
        img.id === imageId ? { ...img, is_featured: !currentFeatured } : img
      ));
      
      toast.success(currentFeatured ? 'Removed from featured' : 'Added to featured');
    } catch (error) {
      console.error('Error updating featured status:', error);
      toast.error('Failed to update featured status');
    }
  };

  const deleteImage = async (imageId: string) => {
    if (!confirm('Are you sure you want to delete this image?')) {
      return;
    }

    try {
      const { error } = await supabase
        .from('generated_images')
        .delete()
        .eq('id', imageId);

      if (error) {
        console.error('Error deleting image:', error);
        toast.error('Failed to delete image');
        return;
      }

      setImages(images.filter(img => img.id !== imageId));
      toast.success('Image deleted successfully');
    } catch (error) {
      console.error('Error deleting image:', error);
      toast.error('Failed to delete image');
    }
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast.success('Copied to clipboard');
    } catch (error) {
      toast.error('Failed to copy to clipboard');
    }
  };

  const downloadImage = (image: GeneratedImage) => {
    const link = document.createElement('a');
    link.href = image.image_url;
    link.download = image.filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success('Download started');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center space-y-2">
          <Images className="h-8 w-8 mx-auto text-muted-foreground animate-pulse" />
          <p className="text-muted-foreground">Loading image library...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-6 space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-3xl font-bold tracking-tight flex items-center gap-2">
                <Images className="h-8 w-8" />
                Image Library
              </CardTitle>
              <p className="text-muted-foreground mt-1">
                Manage your AI-generated images and assets
              </p>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Controls */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search images by prompt, filename, tags, or notes..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <div className="flex gap-2">
              <Button
                variant={filterFeatured ? "default" : "outline"}
                size="sm"
                onClick={() => setFilterFeatured(!filterFeatured)}
              >
                <Filter className="mr-2 h-4 w-4" />
                {filterFeatured ? 'Featured' : 'All'}
              </Button>
              
              <Button
                variant="outline"
                size="sm"
                onClick={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}
              >
                {viewMode === 'grid' ? <List className="h-4 w-4" /> : <Grid className="h-4 w-4" />}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Images className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium">Total Images</span>
            </div>
            <p className="text-2xl font-bold">{images.length}</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Star className="h-4 w-4 text-yellow-500" />
              <span className="text-sm font-medium">Featured</span>
            </div>
            <p className="text-2xl font-bold">{images.filter(img => img.is_featured).length}</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Search className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium">Filtered Results</span>
            </div>
            <p className="text-2xl font-bold">{filteredImages.length}</p>
          </CardContent>
        </Card>
      </div>

      {/* Image Grid/List */}
      {filteredImages.length === 0 ? (
        <Card>
          <CardContent className="p-8 text-center">
            <Images className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">No images found</h3>
            <p className="text-muted-foreground">
              {images.length === 0 
                ? "Generate your first image to get started"
                : "Try adjusting your search or filters"
              }
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className={viewMode === 'grid' 
          ? "grid gap-4 md:grid-cols-2 lg:grid-cols-3" 
          : "space-y-4"
        }>
          {filteredImages.map((image) => (
            <Card key={image.id} className={viewMode === 'list' ? "overflow-hidden" : ""}>
              {viewMode === 'grid' ? (
                <>
                  <div className="relative group">
                    <img
                      src={image.image_url}
                      alt={image.prompt}
                      className="w-full h-48 object-cover"
                    />
                    <div className="absolute top-2 right-2 flex gap-1">
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => toggleFeatured(image.id, image.is_featured)}
                      >
                        {image.is_featured ? (
                          <Star className="h-3 w-3 fill-yellow-500 text-yellow-500" />
                        ) : (
                          <StarOff className="h-3 w-3" />
                        )}
                      </Button>
                    </div>
                  </div>
                  <CardContent className="p-4">
                    <p className="text-sm text-muted-foreground line-clamp-2 mb-2">
                      {image.prompt}
                    </p>
                    
                    {image.tags && image.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1 mb-3">
                        {image.tags.slice(0, 3).map((tag, index) => (
                          <Badge key={index} variant="secondary" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                        {image.tags.length > 3 && (
                          <Badge variant="secondary" className="text-xs">
                            +{image.tags.length - 3}
                          </Badge>
                        )}
                      </div>
                    )}
                    
                    <div className="flex items-center justify-between text-xs text-muted-foreground mb-3">
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {new Date(image.created_at).toLocaleDateString()}
                      </span>
                    </div>
                    
                    <div className="flex gap-1">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => downloadImage(image)}
                        className="flex-1"
                      >
                        <Download className="h-3 w-3 mr-1" />
                        Download
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => copyToClipboard(image.image_url)}
                      >
                        <Copy className="h-3 w-3" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => deleteImage(image.id)}
                        className="text-destructive hover:text-destructive"
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </CardContent>
                </>
              ) : (
                <div className="flex gap-4 p-4">
                  <img
                    src={image.image_url}
                    alt={image.prompt}
                    className="w-24 h-24 object-cover rounded"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium line-clamp-2 mb-1">
                          {image.prompt}
                        </p>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground mb-2">
                          <Calendar className="h-3 w-3" />
                          {new Date(image.created_at).toLocaleDateString()}
                          {image.is_featured && (
                            <Badge variant="secondary" className="text-xs">
                              <Star className="h-2 w-2 mr-1 fill-yellow-500 text-yellow-500" />
                              Featured
                            </Badge>
                          )}
                        </div>
                        {image.tags && image.tags.length > 0 && (
                          <div className="flex flex-wrap gap-1">
                            {image.tags.slice(0, 4).map((tag, index) => (
                              <Badge key={index} variant="outline" className="text-xs">
                                {tag}
                              </Badge>
                            ))}
                            {image.tags.length > 4 && (
                              <Badge variant="outline" className="text-xs">
                                +{image.tags.length - 4}
                              </Badge>
                            )}
                          </div>
                        )}
                      </div>
                      <div className="flex gap-1 flex-shrink-0">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => toggleFeatured(image.id, image.is_featured)}
                        >
                          {image.is_featured ? (
                            <Star className="h-3 w-3 fill-yellow-500 text-yellow-500" />
                          ) : (
                            <StarOff className="h-3 w-3" />
                          )}
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => downloadImage(image)}
                        >
                          <Download className="h-3 w-3" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => copyToClipboard(image.image_url)}
                        >
                          <Copy className="h-3 w-3" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => deleteImage(image.id)}
                          className="text-destructive hover:text-destructive"
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}