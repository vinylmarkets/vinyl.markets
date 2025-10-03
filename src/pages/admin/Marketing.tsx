import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { ampTypes, eras, genres } from "@/data/ampTypes";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { toast } from "sonner";
import { 
  Plus, 
  Star, 
  Download, 
  Trash2, 
  Check, 
  Activity, 
  Filter, 
  ChevronDown,
  Music,
  Sparkles,
  Grid3x3,
  List
} from "lucide-react";

interface AmpCover {
  id: string;
  amp_type_id: string;
  band_name: string;
  album_title: string;
  image_url: string;
  generation_prompt: string | null;
  style_era: string | null;
  genre: string | null;
  is_featured: boolean;
  created_at: string;
}

export default function Marketing() {
  const [covers, setCovers] = useState<AmpCover[]>([]);
  const [filteredCovers, setFilteredCovers] = useState<AmpCover[]>([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [showGenerateModal, setShowGenerateModal] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');

  // Filters
  const [filterAmpType, setFilterAmpType] = useState<string>("all");
  const [filterEra, setFilterEra] = useState<string>("all");
  const [filterGenre, setFilterGenre] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [showFeaturedOnly, setShowFeaturedOnly] = useState<boolean>(false);

  // Generation modal state
  const [selectedAmpType, setSelectedAmpType] = useState<string>("");
  const [generateCount, setGenerateCount] = useState<number>(5);
  const [preferredEra, setPreferredEra] = useState<string>("");
  const [preferredGenre, setPreferredGenre] = useState<string>("");
  const [generationProgress, setGenerationProgress] = useState<number>(0);

  useEffect(() => {
    fetchCovers();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [covers, filterAmpType, filterEra, filterGenre, searchQuery, showFeaturedOnly]);

  const fetchCovers = async () => {
    try {
      const { data, error } = await supabase
        .from('amp_cover_art')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setCovers(data || []);
    } catch (error) {
      console.error('Error fetching covers:', error);
      toast.error('Failed to load cover art');
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...covers];

    if (filterAmpType !== "all") {
      filtered = filtered.filter(c => c.amp_type_id === filterAmpType);
    }

    if (filterEra !== "all") {
      filtered = filtered.filter(c => c.style_era === filterEra);
    }

    if (filterGenre !== "all") {
      filtered = filtered.filter(c => c.genre === filterGenre);
    }

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(c => 
        c.band_name.toLowerCase().includes(query) || 
        c.album_title.toLowerCase().includes(query)
      );
    }

    if (showFeaturedOnly) {
      filtered = filtered.filter(c => c.is_featured);
    }

    setFilteredCovers(filtered);
  };

  const clearFilters = () => {
    setFilterAmpType("all");
    setFilterEra("all");
    setFilterGenre("all");
    setSearchQuery("");
    setShowFeaturedOnly(false);
  };

  const generateCovers = async () => {
    if (!selectedAmpType) {
      toast.error('Please select an AMP type');
      return;
    }

    setGenerating(true);
    setGenerationProgress(0);

    try {
      const { data, error } = await supabase.functions.invoke('generate-amp-covers', {
        body: {
          ampTypeId: selectedAmpType,
          count: generateCount,
          preferEra: preferredEra || undefined,
          preferGenre: preferredGenre || undefined,
        }
      });

      if (error) throw error;

      if (data.success) {
        toast.success(`Generated ${data.count} album covers!`);
        setShowGenerateModal(false);
        fetchCovers();
      } else {
        toast.error('Failed to generate covers');
      }
    } catch (error) {
      console.error('Error generating covers:', error);
      toast.error('Failed to generate covers');
    } finally {
      setGenerating(false);
      setGenerationProgress(0);
    }
  };

  const toggleFeatured = async (coverId: string, currentValue: boolean) => {
    try {
      const { error } = await supabase
        .from('amp_cover_art')
        .update({ is_featured: !currentValue })
        .eq('id', coverId);

      if (error) throw error;

      setCovers(covers.map(c => 
        c.id === coverId ? { ...c, is_featured: !currentValue } : c
      ));
      toast.success(`Cover ${!currentValue ? 'featured' : 'unfeatured'}`);
    } catch (error) {
      console.error('Error toggling featured:', error);
      toast.error('Failed to update cover');
    }
  };

  const downloadCover = async (imageUrl: string, filename: string) => {
    try {
      const response = await fetch(imageUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      toast.success('Download started');
    } catch (error) {
      console.error('Error downloading:', error);
      toast.error('Failed to download');
    }
  };

  const deleteCover = async (coverId: string) => {
    try {
      const { error } = await supabase
        .from('amp_cover_art')
        .delete()
        .eq('id', coverId);

      if (error) throw error;

      setCovers(covers.filter(c => c.id !== coverId));
      toast.success('Cover deleted');
      setDeleteConfirm(null);
    } catch (error) {
      console.error('Error deleting cover:', error);
      toast.error('Failed to delete cover');
    }
  };

  const coversByType = covers.reduce((acc, cover) => {
    acc[cover.amp_type_id] = (acc[cover.amp_type_id] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  if (loading) {
    return (
      <div className="min-h-screen bg-muted/30 flex items-center justify-center">
        <div className="text-center">
          <Activity className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p>Loading cover art library...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-muted/30">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold flex items-center gap-3">
                <Music className="h-8 w-8" />
                AMP Cover Art Library
              </h1>
              <p className="text-muted-foreground mt-2">
                AI-generated vintage album covers for trading AMPs
              </p>
            </div>
            <div className="flex items-center gap-3">
              <Badge variant="secondary" className="px-3 py-2">
                <Sparkles className="h-4 w-4 mr-2" />
                {covers.length} Total Images
              </Badge>
              <Button onClick={() => setShowGenerateModal(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Generate New Covers
              </Button>
            </div>
          </div>

          {/* Stats */}
          <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4">
            {ampTypes.slice(0, 4).map(amp => (
              <div key={amp.id} className="p-3 bg-muted/50 rounded-lg">
                <div className="font-semibold">{coversByType[amp.id] || 0}</div>
                <div className="text-xs text-muted-foreground">{amp.name}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white border-b sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium">Filters:</span>
            </div>

            <Select value={filterAmpType} onValueChange={setFilterAmpType}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="AMP Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All AMPs</SelectItem>
                {ampTypes.map(amp => (
                  <SelectItem key={amp.id} value={amp.id}>{amp.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={filterEra} onValueChange={setFilterEra}>
              <SelectTrigger className="w-[140px]">
                <SelectValue placeholder="Era" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Eras</SelectItem>
                {eras.map(era => (
                  <SelectItem key={era} value={era}>{era}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={filterGenre} onValueChange={setFilterGenre}>
              <SelectTrigger className="w-[140px]">
                <SelectValue placeholder="Genre" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Genres</SelectItem>
                {genres.map(genre => (
                  <SelectItem key={genre} value={genre}>{genre}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Input
              placeholder="Search band or album..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-[220px]"
            />

            <Button
              variant={showFeaturedOnly ? "default" : "outline"}
              size="sm"
              onClick={() => setShowFeaturedOnly(!showFeaturedOnly)}
            >
              <Star className="h-4 w-4 mr-2" />
              Featured Only
            </Button>

            <Button variant="ghost" size="sm" onClick={clearFilters}>
              Clear Filters
            </Button>

            <div className="ml-auto flex gap-2">
              <Button
                variant={viewMode === 'grid' ? 'default' : 'outline'}
                size="icon"
                onClick={() => setViewMode('grid')}
              >
                <Grid3x3 className="h-4 w-4" />
              </Button>
              <Button
                variant={viewMode === 'table' ? 'default' : 'outline'}
                size="icon"
                onClick={() => setViewMode('table')}
              >
                <List className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        {filteredCovers.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <Music className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-lg font-semibold mb-2">No covers found</h3>
              <p className="text-muted-foreground mb-4">
                {covers.length === 0 
                  ? "Generate your first set of album covers to get started"
                  : "Try adjusting your filters"}
              </p>
              {covers.length === 0 && (
                <Button onClick={() => setShowGenerateModal(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Generate Covers
                </Button>
              )}
            </CardContent>
          </Card>
        ) : viewMode === 'grid' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredCovers.map((cover) => (
              <Card key={cover.id} className="group relative overflow-hidden hover:shadow-lg transition-all">
                <div className="relative aspect-square overflow-hidden bg-muted">
                  <img
                    src={cover.image_url}
                    alt={`${cover.band_name} - ${cover.album_title}`}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  {cover.is_featured && (
                    <Badge className="absolute top-2 left-2 bg-yellow-500">
                      <Star className="h-3 w-3 mr-1" />
                      Featured
                    </Badge>
                  )}
                  
                  {/* Hover Overlay */}
                  <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                    <Button
                      size="icon"
                      variant="secondary"
                      onClick={() => toggleFeatured(cover.id, cover.is_featured)}
                    >
                      <Star className={`h-4 w-4 ${cover.is_featured ? 'fill-yellow-500' : ''}`} />
                    </Button>
                    <Button
                      size="icon"
                      variant="secondary"
                      onClick={() => downloadCover(cover.image_url, `${cover.band_name}-${cover.album_title}.png`)}
                    >
                      <Download className="h-4 w-4" />
                    </Button>
                    <Button
                      size="icon"
                      variant="destructive"
                      onClick={() => setDeleteConfirm(cover.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                
                <CardContent className="p-4">
                  <div className="font-semibold truncate">{cover.band_name}</div>
                  <div className="text-sm text-muted-foreground truncate">{cover.album_title}</div>
                  <div className="flex gap-2 mt-2">
                    <Badge variant="outline" className="text-xs">{cover.style_era}</Badge>
                    <Badge variant="outline" className="text-xs">{cover.genre}</Badge>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="border-b">
                    <tr className="text-left">
                      <th className="p-4 w-24">Preview</th>
                      <th className="p-4">Band Name</th>
                      <th className="p-4">Album Title</th>
                      <th className="p-4">AMP Type</th>
                      <th className="p-4">Era</th>
                      <th className="p-4">Genre</th>
                      <th className="p-4">Featured</th>
                      <th className="p-4">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredCovers.map((cover) => (
                      <tr key={cover.id} className="border-b hover:bg-muted/50">
                        <td className="p-4">
                          <img src={cover.image_url} alt="" className="w-16 h-16 object-cover rounded" />
                        </td>
                        <td className="p-4">{cover.band_name}</td>
                        <td className="p-4">{cover.album_title}</td>
                        <td className="p-4">
                          <Badge variant="secondary">{ampTypes.find(a => a.id === cover.amp_type_id)?.name}</Badge>
                        </td>
                        <td className="p-4">{cover.style_era}</td>
                        <td className="p-4">{cover.genre}</td>
                        <td className="p-4">
                          {cover.is_featured && <Star className="h-4 w-4 fill-yellow-500 text-yellow-500" />}
                        </td>
                        <td className="p-4">
                          <div className="flex gap-2">
                            <Button
                              size="icon"
                              variant="ghost"
                              onClick={() => toggleFeatured(cover.id, cover.is_featured)}
                            >
                              <Star className={`h-4 w-4 ${cover.is_featured ? 'fill-yellow-500' : ''}`} />
                            </Button>
                            <Button
                              size="icon"
                              variant="ghost"
                              onClick={() => downloadCover(cover.image_url, `${cover.band_name}-${cover.album_title}.png`)}
                            >
                              <Download className="h-4 w-4" />
                            </Button>
                            <Button
                              size="icon"
                              variant="ghost"
                              onClick={() => setDeleteConfirm(cover.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Generate Modal */}
      <Dialog open={showGenerateModal} onOpenChange={setShowGenerateModal}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Generate Album Covers</DialogTitle>
            <DialogDescription>
              Use AI to create vintage-style album covers for your AMPs
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div>
              <Label>AMP Type *</Label>
              <Select value={selectedAmpType} onValueChange={setSelectedAmpType}>
                <SelectTrigger>
                  <SelectValue placeholder="Select AMP type" />
                </SelectTrigger>
                <SelectContent>
                  {ampTypes.map(amp => (
                    <SelectItem key={amp.id} value={amp.id}>
                      {amp.name} - {amp.description}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {selectedAmpType && (
              <div className="p-3 bg-muted rounded-lg">
                <div className="text-sm font-medium">
                  Band: {ampTypes.find(a => a.id === selectedAmpType)?.bandName}
                </div>
                <div className="text-xs text-muted-foreground">
                  {ampTypes.find(a => a.id === selectedAmpType)?.genre} • {ampTypes.find(a => a.id === selectedAmpType)?.era}
                </div>
              </div>
            )}

            <div>
              <Label>Number of Covers (1-10)</Label>
              <Input
                type="number"
                min="1"
                max="10"
                value={generateCount}
                onChange={(e) => setGenerateCount(Number(e.target.value))}
              />
            </div>

            <Collapsible>
              <CollapsibleTrigger asChild>
                <Button variant="ghost" className="w-full justify-between">
                  Advanced Options
                  <ChevronDown className="h-4 w-4" />
                </Button>
              </CollapsibleTrigger>
              <CollapsibleContent className="space-y-4 mt-4">
                <div>
                  <Label>Preferred Era</Label>
                  <Select value={preferredEra} onValueChange={setPreferredEra}>
                    <SelectTrigger>
                      <SelectValue placeholder="Auto" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">Auto</SelectItem>
                      {eras.map(era => (
                        <SelectItem key={era} value={era}>{era}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label>Preferred Genre</Label>
                  <Select value={preferredGenre} onValueChange={setPreferredGenre}>
                    <SelectTrigger>
                      <SelectValue placeholder="Auto" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">Auto</SelectItem>
                      {genres.map(genre => (
                        <SelectItem key={genre} value={genre}>{genre}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </CollapsibleContent>
            </Collapsible>

            {generating && (
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span>Generating covers...</span>
                  <span>{generationProgress}%</span>
                </div>
                <div className="h-2 bg-muted rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-primary transition-all duration-300"
                    style={{ width: `${generationProgress}%` }}
                  />
                </div>
              </div>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowGenerateModal(false)} disabled={generating}>
              Cancel
            </Button>
            <Button onClick={generateCovers} disabled={!selectedAmpType || generating}>
              {generating ? (
                <>
                  <Activity className="h-4 w-4 mr-2 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4 mr-2" />
                  Generate
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteConfirm} onOpenChange={() => setDeleteConfirm(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Cover?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the album cover.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={() => deleteConfirm && deleteCover(deleteConfirm)}>
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
