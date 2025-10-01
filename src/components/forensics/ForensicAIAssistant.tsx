import { useState } from 'react'
import { supabase } from '@/integrations/supabase/client'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { useToast } from '@/hooks/use-toast'
import {
  Bot,
  Send,
  User,
  Loader2,
  FileText,
  MessageSquare,
  Sparkles,
  Brain,
  Network
} from 'lucide-react'

interface Message {
  id: string
  type: 'user' | 'assistant'
  content: string
  timestamp: Date
  sources?: Source[]
  metadata?: {
    documentsAnalyzed?: number
    knowledgeGraphNodes?: number
  }
}

interface Source {
  id: string
  title: string
  type: string
}

export function ForensicAIAssistant() {
  const { toast } = useToast()
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      type: 'assistant',
      content: 'Hello! I\'m your forensic investigation AI assistant. I have access to all uploaded documents, the knowledge graph, and can help you:\n\n• Answer questions about the BBBY case\n• Connect evidence across documents\n• Brainstorm theories and connections\n• Identify gaps in the investigation\n• Suggest areas for further research\n\nWhat would you like to explore?',
      timestamp: new Date(),
    }
  ])
  const [question, setQuestion] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const askQuestion = async () => {
    if (!question.trim()) {
      toast({
        title: "Error",
        description: "Please enter a question",
        variant: "destructive",
      })
      return
    }

    const userMessage: Message = {
      id: Date.now().toString(),
      type: 'user',
      content: question,
      timestamp: new Date(),
    }

    setMessages(prev => [...prev, userMessage])
    setIsLoading(true)
    
    const currentQuestion = question
    setQuestion('')

    try {
      const { data: session } = await supabase.auth.getSession()
      if (!session.session) {
        throw new Error('Not authenticated')
      }

      const { data, error } = await supabase.functions.invoke('forensic-ai-assistant', {
        body: {
          question: currentQuestion
        },
        headers: {
          Authorization: `Bearer ${session.session.access_token}`
        }
      })

      if (error) throw error

      if (data.success) {
        const assistantMessage: Message = {
          id: Date.now().toString(),
          type: 'assistant',
          content: data.answer,
          timestamp: new Date(),
          sources: data.sources,
          metadata: {
            documentsAnalyzed: data.documentsAnalyzed,
            knowledgeGraphNodes: data.knowledgeGraphNodes
          }
        }

        setMessages(prev => [...prev, assistantMessage])
        
        toast({
          title: "Analysis Complete",
          description: `Analyzed ${data.documentsAnalyzed} documents and ${data.knowledgeGraphNodes} knowledge graph nodes`,
        })
      } else {
        throw new Error(data.error || 'Failed to get response')
      }
    } catch (error) {
      console.error('Error asking question:', error)
      
      const errorMessage: Message = {
        id: Date.now().toString(),
        type: 'assistant',
        content: 'Sorry, I encountered an error while processing your question. Please try again.',
        timestamp: new Date(),
      }
      
      setMessages(prev => [...prev, errorMessage])
      
      toast({
        title: "Error",
        description: "Failed to get AI response",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      askQuestion()
    }
  }

  const formatTimestamp = (timestamp: Date) => {
    return timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  }

  const exampleQuestions = [
    "What evidence do we have for NOL preservation timing?",
    "How are the entities in the knowledge graph connected?",
    "What gaps exist in our current investigation?",
    "Summarize the key findings about DK Butterfly",
    "What patterns do you see across the documents?",
    "What should we investigate next?"
  ]

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <Card className="mb-4 border-primary/20">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2">
            <Brain className="h-5 w-5 text-primary" />
            Forensic AI Assistant
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            AI-powered analysis connected to your document library and knowledge graph
          </p>
        </CardHeader>
      </Card>

      {/* Example Questions */}
      {messages.length <= 1 && (
        <Card className="mb-4">
          <CardContent className="pt-4">
            <h3 className="text-sm font-medium mb-3 flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-primary" />
              Suggested Questions:
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {exampleQuestions.map((example, index) => (
                <Button
                  key={index}
                  variant="outline"
                  size="sm"
                  className="justify-start text-left h-auto py-2 px-3"
                  onClick={() => setQuestion(example)}
                >
                  <MessageSquare className="h-3 w-3 mr-2 flex-shrink-0" />
                  <span className="text-xs">{example}</span>
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Messages */}
      <Card className="flex-1 flex flex-col">
        <CardContent className="flex-1 p-4">
          <ScrollArea className="h-[500px] pr-4">
            <div className="space-y-4">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex gap-3 ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div className={`flex gap-3 max-w-[85%] ${message.type === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                    <div className="flex-shrink-0">
                      {message.type === 'user' ? (
                        <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center">
                          <User className="h-4 w-4 text-primary-foreground" />
                        </div>
                      ) : (
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center">
                          <Bot className="h-4 w-4 text-primary-foreground" />
                        </div>
                      )}
                    </div>
                    <div className={`space-y-2 ${message.type === 'user' ? 'text-right' : 'text-left'}`}>
                      <div className={`rounded-lg p-3 ${
                        message.type === 'user' 
                          ? 'bg-primary text-primary-foreground' 
                          : 'bg-muted'
                      }`}>
                        <p className="text-sm whitespace-pre-wrap leading-relaxed">{message.content}</p>
                      </div>
                      
                      {message.metadata && (
                        <div className="flex gap-2 flex-wrap">
                          {message.metadata.documentsAnalyzed !== undefined && (
                            <Badge variant="secondary" className="text-xs">
                              <FileText className="h-3 w-3 mr-1" />
                              {message.metadata.documentsAnalyzed} docs
                            </Badge>
                          )}
                          {message.metadata.knowledgeGraphNodes !== undefined && (
                            <Badge variant="secondary" className="text-xs">
                              <Network className="h-3 w-3 mr-1" />
                              {message.metadata.knowledgeGraphNodes} KG nodes
                            </Badge>
                          )}
                        </div>
                      )}

                      {message.sources && message.sources.length > 0 && (
                        <div className="space-y-2">
                          <p className="text-xs text-muted-foreground flex items-center gap-1">
                            <FileText className="h-3 w-3" />
                            Referenced Sources:
                          </p>
                          <div className="flex flex-wrap gap-1">
                            {message.sources.map((source) => (
                              <Badge key={source.id} variant="outline" className="text-xs">
                                {source.title}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}
                      
                      <p className="text-xs text-muted-foreground">
                        {formatTimestamp(message.timestamp)}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
              
              {isLoading && (
                <div className="flex gap-3 justify-start">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center">
                    <Bot className="h-4 w-4 text-primary-foreground" />
                  </div>
                  <div className="bg-muted rounded-lg p-3">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Analyzing documents and knowledge graph...
                    </div>
                  </div>
                </div>
              )}
            </div>
          </ScrollArea>
        </CardContent>

        {/* Input */}
        <CardContent className="border-t pt-4">
          <div className="flex gap-2">
            <Input
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Ask about evidence, connections, theories..."
              disabled={isLoading}
              className="flex-1"
            />
            <Button 
              onClick={askQuestion} 
              disabled={isLoading || !question.trim()}
              className="px-4"
            >
              {isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Send className="h-4 w-4" />
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
