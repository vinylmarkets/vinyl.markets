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
  BookOpen,
  MessageSquare,
  Sparkles
} from 'lucide-react'

interface Message {
  id: string
  type: 'user' | 'assistant'
  content: string
  timestamp: Date
  sources?: Source[]
}

interface Source {
  id: string
  title: string
  category: string
  source: string
}

export function AIAssistant() {
  const { toast } = useToast()
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      type: 'assistant',
      content: 'Hi! I\'m your AI assistant for the Atomic Playbook. I can help you find information from your company knowledge base, answer questions about strategy, products, finances, and more. What would you like to know?',
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

      const { data, error } = await supabase.functions.invoke('ai-knowledge-query', {
        body: {
          question: currentQuestion,
          maxResults: 5
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
          sources: data.sources
        }

        setMessages(prev => [...prev, assistantMessage])
        
        toast({
          title: "Success",
          description: `Found ${data.sources?.length || 0} relevant sources`,
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
    "What's our company mission and strategy?",
    "What are our target customer personas?", 
    "What's our go-to-market strategy?",
    "What are our financial projections?",
    "What's our technical architecture?",
    "What legal compliance do we need to consider?"
  ]

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <Card className="mb-4">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            AI Knowledge Assistant
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Ask questions about your company knowledge base and get AI-powered answers
          </p>
        </CardHeader>
      </Card>

      {/* Example Questions */}
      {messages.length <= 1 && (
        <Card className="mb-4">
          <CardContent className="pt-4">
            <h3 className="text-sm font-medium mb-3">Try asking about:</h3>
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
          <ScrollArea className="h-[400px] pr-4">
            <div className="space-y-4">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex gap-3 ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div className={`flex gap-3 max-w-[80%] ${message.type === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                    <div className="flex-shrink-0">
                      {message.type === 'user' ? (
                        <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center">
                          <User className="h-4 w-4 text-primary-foreground" />
                        </div>
                      ) : (
                        <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center">
                          <Bot className="h-4 w-4 text-secondary-foreground" />
                        </div>
                      )}
                    </div>
                    <div className={`space-y-2 ${message.type === 'user' ? 'text-right' : 'text-left'}`}>
                      <div className={`rounded-lg p-3 ${
                        message.type === 'user' 
                          ? 'bg-primary text-primary-foreground' 
                          : 'bg-muted'
                      }`}>
                        <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                      </div>
                      
                      {message.sources && message.sources.length > 0 && (
                        <div className="space-y-2">
                          <p className="text-xs text-muted-foreground flex items-center gap-1">
                            <BookOpen className="h-3 w-3" />
                            Sources:
                          </p>
                          <div className="flex flex-wrap gap-1">
                            {message.sources.map((source) => (
                              <Badge key={source.id} variant="secondary" className="text-xs">
                                {source.title} ({source.category})
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
                  <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center">
                    <Bot className="h-4 w-4 text-secondary-foreground" />
                  </div>
                  <div className="bg-muted rounded-lg p-3">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      AI is thinking...
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
              placeholder="Ask a question about your company knowledge..."
              disabled={isLoading}
              className="flex-1"
            />
            <Button 
              onClick={askQuestion} 
              disabled={isLoading || !question.trim()}
              className="px-3"
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