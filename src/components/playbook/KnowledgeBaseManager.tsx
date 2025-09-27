import { useState, useEffect } from 'react'
import { supabase } from '@/integrations/supabase/client'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useToast } from '@/hooks/use-toast'
import { KnowledgeDetailView } from './KnowledgeDetailView'
import {
  BookOpen,
  Download,
  Search,
  RefreshCw,
  FileText,
  Tag,
  Calendar,
  User,
  Filter,
  Upload,
  X,
  Loader2,
  Eye,
  Clock
} from 'lucide-react'

interface KnowledgeItem {
  id: string
  category: string
  subcategory?: string
  title: string
  content: string
  source: string
  tags: string[]
  metadata: any
  created_at: string
  created_by?: string
}

interface ImportStats {
  totalSections: number
  imported: number
  errors: number
}

interface UploadFormData {
  file: File | null
  category: string
  instructions: string
  tags: string
}

export function KnowledgeBaseManager() {
  const { toast } = useToast()
  const [knowledgeItems, setKnowledgeItems] = useState<KnowledgeItem[]>([])
  const [filteredItems, setFilteredItems] = useState<KnowledgeItem[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [loading, setLoading] = useState(true)
  const [importing, setImporting] = useState(false)
  const [importStats, setImportStats] = useState<ImportStats | null>(null)
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [selectedItem, setSelectedItem] = useState<KnowledgeItem | null>(null)
  const [detailViewOpen, setDetailViewOpen] = useState(false)
  const [uploadForm, setUploadForm] = useState<UploadFormData>({
    file: null,
    category: 'strategy',
    instructions: '',
    tags: ''
  })

  useEffect(() => {
    loadKnowledgeBase()
  }, [])

  useEffect(() => {
    filterItems()
  }, [knowledgeItems, searchQuery, selectedCategory])

  const loadKnowledgeBase = async () => {
    try {
      const { data, error } = await supabase
        .from('playbook_knowledge')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error

      setKnowledgeItems(data || [])
    } catch (error) {
      console.error('Error loading knowledge base:', error)
      toast({
        title: "Error",
        description: "Failed to load knowledge base",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const filterItems = () => {
    let filtered = knowledgeItems

    // Filter by search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(item =>
        item.title.toLowerCase().includes(query) ||
        item.content.toLowerCase().includes(query) ||
        item.tags.some(tag => tag.toLowerCase().includes(query))
      )
    }

    // Filter by category
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(item => item.category === selectedCategory)
    }

    setFilteredItems(filtered)
  }

  const importBible = async () => {
    setImporting(true)
    try {
      const { data, error } = await supabase.functions.invoke('import-atomic-bible', {
        body: { action: 'import' }
      })

      if (error) throw error

      if (data.success) {
        setImportStats(data.stats)
        toast({
          title: "Success",
          description: `Bible imported successfully! ${data.stats.imported} sections added.`,
        })
        // Reload the knowledge base
        await loadKnowledgeBase()
      } else {
        throw new Error(data.error || 'Import failed')
      }
    } catch (error) {
      console.error('Error importing Bible:', error)
      toast({
        title: "Error",
        description: "Failed to import Bible. Check console for details.",
        variant: "destructive",
      })
    } finally {
      setImporting(false)
    }
  }

  const handleFileUpload = async () => {
    if (!uploadForm.file) {
      toast({
        title: "Error",
        description: "Please select a file to upload",
        variant: "destructive",
      })
      return
    }

    setUploading(true)
    try {
      // Upload file to Supabase storage first
      const fileName = `${Date.now()}-${uploadForm.file.name}`
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('generated-images')
        .upload(`documents/${fileName}`, uploadForm.file)

      if (uploadError) throw uploadError

      // Get the public URL
      const { data: { publicUrl } } = supabase.storage
        .from('generated-images')
        .getPublicUrl(`documents/${fileName}`)

      // Process the document
      const { data: session } = await supabase.auth.getSession()
      if (!session.session) throw new Error('Not authenticated')

      const { data, error } = await supabase.functions.invoke('process-document', {
        body: {
          fileUrl: publicUrl,
          fileName: uploadForm.file.name,
          category: uploadForm.category,
          instructions: uploadForm.instructions || undefined,
          tags: uploadForm.tags ? uploadForm.tags.split(',').map(tag => tag.trim()) : undefined
        },
        headers: {
          Authorization: `Bearer ${session.session.access_token}`
        }
      })

      if (error) throw error

      if (data.success) {
        toast({
          title: "Success",
          description: `Document uploaded and processed successfully!`,
        })
        setUploadDialogOpen(false)
        setUploadForm({
          file: null,
          category: 'strategy',
          instructions: '',
          tags: ''
        })
        await loadKnowledgeBase()
      } else {
        throw new Error(data.error || 'Processing failed')
      }
    } catch (error) {
      console.error('Error uploading document:', error)
      toast({
        title: "Error",
        description: "Failed to upload and process document",
        variant: "destructive",
      })
    } finally {
      setUploading(false)
    }
  }

  const categories = [
    { value: 'all', label: 'All Categories', count: knowledgeItems.length },
    { value: 'strategy', label: 'Strategy', count: knowledgeItems.filter(i => i.category === 'strategy').length },
    { value: 'product', label: 'Product', count: knowledgeItems.filter(i => i.category === 'product').length },
    { value: 'marketing', label: 'Marketing', count: knowledgeItems.filter(i => i.category === 'marketing').length },
    { value: 'financial', label: 'Financial', count: knowledgeItems.filter(i => i.category === 'financial').length },
    { value: 'legal', label: 'Legal', count: knowledgeItems.filter(i => i.category === 'legal').length },
    { value: 'team', label: 'Team', count: knowledgeItems.filter(i => i.category === 'team').length },
    { value: 'research', label: 'Research', count: knowledgeItems.filter(i => i.category === 'research').length },
  ]

  const uploadCategories = [
    { value: 'strategy', label: 'Strategy' },
    { value: 'product', label: 'Product' },
    { value: 'marketing', label: 'Marketing' },
    { value: 'financial', label: 'Financial' },
    { value: 'legal', label: 'Legal' },
    { value: 'team', label: 'Team' },
    { value: 'research', label: 'Research' },
  ]

  const getCategoryColor = (category: string) => {
    const colors = {
      strategy: 'bg-purple-100 text-purple-800 border-purple-200',
      product: 'bg-blue-100 text-blue-800 border-blue-200',
      marketing: 'bg-green-100 text-green-800 border-green-200',
      financial: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      legal: 'bg-red-100 text-red-800 border-red-200',
      team: 'bg-orange-100 text-orange-800 border-orange-200',
      research: 'bg-indigo-100 text-indigo-800 border-indigo-200',
    }
    return colors[category as keyof typeof colors] || 'bg-gray-100 text-gray-800 border-gray-200'
  }

  const handleItemClick = (item: KnowledgeItem) => {
    setSelectedItem(item)
    setDetailViewOpen(true)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    })
  }

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-8">
          <RefreshCw className="h-6 w-6 animate-spin mr-2" />
          Loading knowledge base...
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <BookOpen className="h-5 w-5" />
                Company Knowledge Base
              </CardTitle>
              <p className="text-sm text-muted-foreground mt-1">
                Searchable wiki of all company knowledge from the Atomic Bible
              </p>
            </div>
            <div className="flex items-center gap-2">
              {importStats && (
                <Badge variant="outline" className="bg-green-50 text-green-700">
                  {importStats.imported} sections imported
                </Badge>
              )}
              <Dialog open={uploadDialogOpen} onOpenChange={setUploadDialogOpen}>
                <DialogTrigger asChild>
                  <Button variant="outline" className="gap-2">
                    <Upload className="h-4 w-4" />
                    Upload Document
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-md">
                  <DialogHeader>
                    <DialogTitle>Upload Knowledge Document</DialogTitle>
                    <DialogDescription>
                      Upload any document to add to the company knowledge base. Include instructions on how to use this knowledge.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4 py-4">
                    <div className="space-y-2">
                      <Label htmlFor="file">Document</Label>
                      <Input
                        id="file"
                        type="file"
                        accept=".pdf,.docx,.doc,.txt,.md,.pptx,.xlsx"
                        onChange={(e) => setUploadForm({
                          ...uploadForm,
                          file: e.target.files?.[0] || null
                        })}
                      />
                      <p className="text-xs text-muted-foreground">
                        Supports PDF, Word, PowerPoint, Excel, and text files
                      </p>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="category">Category</Label>
                      <Select
                        value={uploadForm.category}
                        onValueChange={(value) => setUploadForm({
                          ...uploadForm,
                          category: value
                        })}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select category" />
                        </SelectTrigger>
                        <SelectContent>
                          {uploadCategories.map(cat => (
                            <SelectItem key={cat.value} value={cat.value}>
                              {cat.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="instructions">Usage Instructions</Label>
                      <Textarea
                        id="instructions"
                        placeholder="e.g., 'Use this research for our Q2 marketing strategy' or 'Apply these principles to our social media campaigns'"
                        value={uploadForm.instructions}
                        onChange={(e) => setUploadForm({
                          ...uploadForm,
                          instructions: e.target.value
                        })}
                        rows={3}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="tags">Tags (comma-separated)</Label>
                      <Input
                        id="tags"
                        placeholder="e.g., strategy, q2-2024, social-media"
                        value={uploadForm.tags}
                        onChange={(e) => setUploadForm({
                          ...uploadForm,
                          tags: e.target.value
                        })}
                      />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setUploadDialogOpen(false)}
                    >
                      Cancel
                    </Button>
                    <Button 
                      onClick={handleFileUpload} 
                      disabled={uploading || !uploadForm.file}
                    >
                      {uploading ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Processing...
                        </>
                      ) : (
                        <>
                          <Upload className="h-4 w-4 mr-2" />
                          Upload & Process
                        </>
                      )}
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
              <Button onClick={importBible} disabled={importing} className="bg-primary hover:bg-primary/90">
                {importing ? (
                  <>
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                    Importing...
                  </>
                ) : (
                  <>
                    <Download className="h-4 w-4 mr-2" />
                    Import Bible
                  </>
                )}
              </Button>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Search and Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Search knowledge base..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex gap-2 flex-wrap">
              {categories.map(category => (
                <Button
                  key={category.value}
                  variant={selectedCategory === category.value ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedCategory(category.value)}
                  className="text-xs"
                >
                  {category.label} ({category.count})
                </Button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Knowledge Items */}
      {filteredItems.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            {knowledgeItems.length === 0 ? (
              <div>
                <h3 className="text-lg font-semibold mb-2">No Knowledge Base Content</h3>
                <p className="text-muted-foreground mb-4">
                  Import the Atomic Bible to populate your knowledge base
                </p>
                <Button onClick={importBible} disabled={importing}>
                  {importing ? (
                    <>
                      <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                      Importing...
                    </>
                  ) : (
                    <>
                      <Download className="h-4 w-4 mr-2" />
                      Import Bible Now
                    </>
                  )}
                </Button>
              </div>
            ) : (
              <div>
                <h3 className="text-lg font-semibold mb-2">No Results Found</h3>
                <p className="text-muted-foreground">
                  Try adjusting your search query or category filter
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {filteredItems.map((item) => (
            <Card 
              key={item.id} 
              className="hover:shadow-md transition-all cursor-pointer hover:border-primary/50 group"
              onClick={() => handleItemClick(item)}
            >
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <Badge variant="outline" className={getCategoryColor(item.category)}>
                        {item.category}
                      </Badge>
                      {item.subcategory && (
                        <Badge variant="outline" className="bg-muted">
                          {item.subcategory}
                        </Badge>
                      )}
                    </div>
                    <CardTitle className="text-lg group-hover:text-primary transition-colors flex items-center gap-2">
                      {item.title}
                      <Eye className="h-4 w-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </CardTitle>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Clock className="h-3 w-3" />
                    {formatDate(item.created_at)}
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-4 line-clamp-3">
                  {item.content.length > 200 ? `${item.content.substring(0, 200)}...` : item.content}
                </p>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4 text-xs text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <FileText className="h-3 w-3" />
                      {item.source}
                    </div>
                    {item.created_by && (
                      <div className="flex items-center gap-1">
                        <User className="h-3 w-3" />
                        {item.created_by}
                      </div>
                    )}
                  </div>
                  {item.tags.length > 0 && (
                    <div className="flex gap-1 flex-wrap">
                      {item.tags.slice(0, 3).map((tag, tagIndex) => (
                        <Badge key={tagIndex} variant="secondary" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                      {item.tags.length > 3 && (
                        <Badge variant="secondary" className="text-xs">
                          +{item.tags.length - 3}
                        </Badge>
                      )}
                    </div>
                  )}
                </div>
                <div className="mt-3 pt-3 border-t">
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="text-xs opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={(e) => {
                      e.stopPropagation()
                      handleItemClick(item)
                    }}
                  >
                    <Eye className="h-3 w-3 mr-1" />
                    View Full Content
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Detail View Modal */}
      <KnowledgeDetailView
        item={selectedItem}
        open={detailViewOpen}
        onOpenChange={setDetailViewOpen}
      />
    </div>
  )
}