import React from 'react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { 
  FileText, 
  Calendar, 
  User, 
  Tag, 
  ExternalLink,
  Copy,
  BookOpen
} from 'lucide-react'
import { useToast } from '@/hooks/use-toast'

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

interface KnowledgeDetailViewProps {
  item: KnowledgeItem | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function KnowledgeDetailView({ item, open, onOpenChange }: KnowledgeDetailViewProps) {
  const { toast } = useToast()

  if (!item) return null

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text)
      toast({
        title: "Copied to clipboard",
        description: "Content copied successfully",
      })
    } catch (error) {
      toast({
        title: "Failed to copy",
        description: "Could not copy content to clipboard",
        variant: "destructive",
      })
    }
  }

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

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] flex flex-col">
        <DialogHeader className="flex-shrink-0">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1">
              <DialogTitle className="text-xl mb-3 pr-8">{item.title}</DialogTitle>
              <div className="flex items-center gap-2 flex-wrap">
                <Badge variant="outline" className={getCategoryColor(item.category)}>
                  {item.category}
                </Badge>
                {item.subcategory && (
                  <Badge variant="outline" className="bg-muted">
                    {item.subcategory}
                  </Badge>
                )}
              </div>
            </div>
            <div className="flex gap-2 flex-shrink-0">
              <Button
                variant="outline"
                size="sm"
                onClick={() => copyToClipboard(item.content)}
              >
                <Copy className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </DialogHeader>

        <ScrollArea className="flex-1">
          <div className="space-y-6">
            {/* Metadata Card */}
            <Card>
              <CardContent className="pt-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                  <div className="flex items-center gap-2">
                    <FileText className="h-4 w-4 text-muted-foreground" />
                    <span className="font-medium">Source:</span>
                    <span className="text-muted-foreground">{item.source}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span className="font-medium">Created:</span>
                    <span className="text-muted-foreground">{formatDate(item.created_at)}</span>
                  </div>
                  {item.created_by && (
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4 text-muted-foreground" />
                      <span className="font-medium">By:</span>
                      <span className="text-muted-foreground">{item.created_by}</span>
                    </div>
                  )}
                </div>
                
                {item.tags.length > 0 && (
                  <div className="flex items-center gap-2 mt-4 pt-4 border-t">
                    <Tag className="h-4 w-4 text-muted-foreground" />
                    <span className="font-medium text-sm">Tags:</span>
                    <div className="flex gap-1 flex-wrap">
                      {item.tags.map((tag, index) => (
                        <Badge key={index} variant="secondary" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Content */}
            <Card>
              <CardContent className="pt-6">
                <div className="prose prose-sm max-w-none prose-headings:text-foreground prose-p:text-foreground prose-strong:text-foreground prose-code:text-foreground prose-pre:bg-muted prose-pre:text-foreground prose-blockquote:text-muted-foreground prose-th:text-foreground prose-td:text-foreground prose-li:text-foreground">
                  <ReactMarkdown
                    remarkPlugins={[remarkGfm]}
                    components={{
                      // Custom table styling
                      table: ({ children }) => (
                        <div className="overflow-x-auto">
                          <table className="w-full border-collapse border border-border rounded-md">
                            {children}
                          </table>
                        </div>
                      ),
                      th: ({ children }) => (
                        <th className="border border-border bg-muted p-3 text-left font-semibold">
                          {children}
                        </th>
                      ),
                      td: ({ children }) => (
                        <td className="border border-border p-3">
                          {children}
                        </td>
                      ),
                      // Custom code block styling
                      pre: ({ children }) => (
                        <pre className="bg-muted p-4 rounded-md overflow-x-auto">
                          {children}
                        </pre>
                      ),
                      // Custom blockquote styling
                      blockquote: ({ children }) => (
                        <blockquote className="border-l-4 border-primary pl-4 italic text-muted-foreground">
                          {children}
                        </blockquote>
                      ),
                      // Custom link styling
                      a: ({ href, children }) => (
                        <a 
                          href={href}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-primary hover:underline inline-flex items-center gap-1"
                        >
                          {children}
                          <ExternalLink className="h-3 w-3" />
                        </a>
                      ),
                    }}
                  >
                    {item.content}
                  </ReactMarkdown>
                </div>
              </CardContent>
            </Card>

            {/* Additional Metadata */}
            {item.metadata && Object.keys(item.metadata).length > 0 && (
              <Card>
                <CardContent className="pt-6">
                  <h4 className="font-semibold mb-3 flex items-center gap-2">
                    <BookOpen className="h-4 w-4" />
                    Additional Information
                  </h4>
                  <div className="bg-muted p-4 rounded-md">
                    <pre className="text-sm text-muted-foreground whitespace-pre-wrap">
                      {JSON.stringify(item.metadata, null, 2)}
                    </pre>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  )
}