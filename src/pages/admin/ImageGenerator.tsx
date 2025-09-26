import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Loader2, Sparkles, Download, Copy, Tag, FileText } from 'lucide-react';
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
}

export function ImageGenerator() {
  const [prompt, setPrompt] = useState('');
  const [tags, setTags] = useState('');
  const [usageNotes, setUsageNotes] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedImage, setGeneratedImage] = useState<GeneratedImage | null>(null);

  const generateImage = async () => {
    if (!prompt.trim()) {
      toast.error('Please enter a prompt');
      return;
    }

    setIsGenerating(true);
    try {
      const { data, error } = await supabase.functions.invoke('generate-admin-image', {
        body: {
          prompt: prompt.trim(),
          tags: tags ? tags.split(',').map(tag => tag.trim()).filter(Boolean) : [],
          usageNotes: usageNotes.trim() || undefined
        }
      });

      if (error) {
        console.error('Generation error:', error);
        throw new Error(error.message || 'Failed to generate image');
      }

      if (data?.error) {
        throw new Error(data.error);
      }

      setGeneratedImage(data.image);
      toast.success('Image generated successfully!');
    } catch (error) {
      console.error('Error generating image:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to generate image');
    } finally {
      setIsGenerating(false);
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

  const downloadImage = () => {
    if (!generatedImage) return;
    
    const link = document.createElement('a');
    link.href = generatedImage.image_url;
    link.download = generatedImage.filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success('Download started');
  };

  const resetForm = () => {
    setPrompt('');
    setTags('');
    setUsageNotes('');
    setGeneratedImage(null);
  };

  return (
    <div className="container mx-auto px-4 py-6 space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-3xl font-bold tracking-tight">AI Image Generator</CardTitle>
              <p className="text-muted-foreground mt-1">
                Create custom visuals for your homepage and landing pages
              </p>
            </div>
          </div>
        </CardHeader>
      </Card>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Generator Form */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5" />
              Generate Image
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="prompt">Prompt *</Label>
              <Textarea
                id="prompt"
                placeholder="Describe the image you want to generate... (e.g., 'Modern financial dashboard interface with clean design, professional colors, data visualization charts')"
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                rows={4}
                className="min-h-[100px]"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="tags" className="flex items-center gap-2">
                <Tag className="h-4 w-4" />
                Tags (optional)
              </Label>
              <Input
                id="tags"
                placeholder="homepage, hero, dashboard, finance (comma separated)"
                value={tags}
                onChange={(e) => setTags(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="usage-notes" className="flex items-center gap-2">
                <FileText className="h-4 w-4" />
                Usage Notes (optional)
              </Label>
              <Textarea
                id="usage-notes"
                placeholder="Notes about where and how this image will be used..."
                value={usageNotes}
                onChange={(e) => setUsageNotes(e.target.value)}
                rows={2}
              />
            </div>

            <div className="flex gap-2">
              <Button 
                onClick={generateImage} 
                disabled={isGenerating || !prompt.trim()}
                className="flex-1"
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Sparkles className="mr-2 h-4 w-4" />
                    Generate Image
                  </>
                )}
              </Button>
              
              {generatedImage && (
                <Button variant="outline" onClick={resetForm}>
                  New Image
                </Button>
              )}
            </div>

            <div className="text-sm text-muted-foreground">
              <p>• Images are generated at 1024x1024 resolution</p>
              <p>• All generated images are automatically saved to your library</p>
              <p>• Be specific in your prompts for better results</p>
            </div>
          </CardContent>
        </Card>

        {/* Preview */}
        <Card>
          <CardHeader>
            <CardTitle>Preview</CardTitle>
          </CardHeader>
          <CardContent>
            {isGenerating ? (
              <div className="flex flex-col items-center justify-center h-64 space-y-4">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <p className="text-sm text-muted-foreground">Generating your image...</p>
              </div>
            ) : generatedImage ? (
              <div className="space-y-4">
                <div className="relative group">
                  <img
                    src={generatedImage.image_url}
                    alt="Generated image"
                    className="w-full h-auto rounded-lg border"
                  />
                </div>

                <div className="space-y-3">
                  <div>
                    <Label className="text-sm font-medium">Prompt</Label>
                    <div className="flex items-center gap-2 mt-1">
                      <p className="text-sm text-muted-foreground flex-1 p-2 bg-muted rounded">
                        {generatedImage.prompt}
                      </p>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => copyToClipboard(generatedImage.prompt)}
                      >
                        <Copy className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>

                  {generatedImage.tags && generatedImage.tags.length > 0 && (
                    <div>
                      <Label className="text-sm font-medium">Tags</Label>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {generatedImage.tags.map((tag, index) => (
                          <Badge key={index} variant="secondary" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  {generatedImage.usage_notes && (
                    <div>
                      <Label className="text-sm font-medium">Usage Notes</Label>
                      <p className="text-sm text-muted-foreground p-2 bg-muted rounded mt-1">
                        {generatedImage.usage_notes}
                      </p>
                    </div>
                  )}

                  <div className="flex gap-2 pt-2">
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={downloadImage}
                      className="flex-1"
                    >
                      <Download className="mr-2 h-4 w-4" />
                      Download
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => copyToClipboard(generatedImage.image_url)}
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-64 space-y-4 text-muted-foreground">
                <Sparkles className="h-12 w-12" />
                <p className="text-center">
                  Enter a prompt and click "Generate Image" to create your visual
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}