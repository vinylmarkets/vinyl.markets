import { useState, useEffect } from 'react'
import { supabase } from '@/integrations/supabase/client'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useToast } from '@/hooks/use-toast'
import {
  BookOpen,
  Download,
  Search,
  RefreshCw,
  FileText,
  Tag,
  Calendar,
  User,
  Filter
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

export function KnowledgeBaseManager() {
  const { toast } = useToast()
  const [knowledgeItems, setKnowledgeItems] = useState<KnowledgeItem[]>([])
  const [filteredItems, setFilteredItems] = useState<KnowledgeItem[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [loading, setLoading] = useState(true)
  const [importing, setImporting] = useState(false)
  const [importStats, setImportStats] = useState<ImportStats | null>(null)

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

  const categories = [
    { value: 'all', label: 'All Categories', count: knowledgeItems.length },
    { value: 'strategy', label: 'Strategy', count: knowledgeItems.filter(i => i.category === 'strategy').length },
    { value: 'product', label: 'Product', count: knowledgeItems.filter(i => i.category === 'product').length },
    { value: 'marketing', label: 'Marketing', count: knowledgeItems.filter(i => i.category === 'marketing').length },
    { value: 'financial', label: 'Financial', count: knowledgeItems.filter(i => i.category === 'financial').length },
    { value: 'legal', label: 'Legal', count: knowledgeItems.filter(i => i.category === 'legal').length },
    { value: 'team', label: 'Team', count: knowledgeItems.filter(i => i.category === 'team').length },
  ]

  const getCategoryColor = (category: string) => {
    const colors = {
      strategy: 'bg-purple-100 text-purple-800 border-purple-200',
      product: 'bg-blue-100 text-blue-800 border-blue-200',
      marketing: 'bg-green-100 text-green-800 border-green-200',
      financial: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      legal: 'bg-red-100 text-red-800 border-red-200',
      team: 'bg-orange-100 text-orange-800 border-orange-200',
    }
    return colors[category as keyof typeof colors] || 'bg-gray-100 text-gray-800 border-gray-200'
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
            <Card key={item.id} className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <Badge variant="outline" className={getCategoryColor(item.category)}>
                        {item.category}
                      </Badge>
                      {item.subcategory && (
                        <Badge variant="outline" className="text-xs">
                          {item.subcategory}
                        </Badge>
                      )}
                      <Badge variant="outline" className="text-xs">
                        {item.source}
                      </Badge>
                    </div>
                    <CardTitle className="text-lg">{item.title}</CardTitle>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="prose prose-sm max-w-none">
                    <p className="text-muted-foreground line-clamp-3">
                      {item.content.substring(0, 300)}...
                    </p>
                  </div>
                  
                  {item.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {item.tags.map((tag, index) => (
                        <Badge key={index} variant="secondary" className="text-xs">
                          <Tag className="h-3 w-3 mr-1" />
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  )}

                  <div className="flex items-center gap-4 text-xs text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      {new Date(item.created_at).toLocaleDateString()}
                    </div>
                    {item.metadata?.phase && (
                      <div className="flex items-center gap-1">
                        <Badge variant="outline" className="text-xs">
                          {item.metadata.phase}
                        </Badge>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}