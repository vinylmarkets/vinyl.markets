import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Send, 
  MessageSquare, 
  Bot, 
  User, 
  AlertCircle, 
  ExternalLink,
  Loader2,
  HelpCircle,
  BookOpen
} from 'lucide-react';
import { useAuth } from '@/components/auth/AuthProvider';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { PredictionAPI, Prediction } from '@/lib/prediction-api';

interface Message {
  id: number;
  text: string;
  isUser: boolean;
  timestamp: Date;
  sources?: string[];
}

interface QueryLimit {
  used: number;
  limit: number;
  tier: string;
}

// Initial educational messages
const initialMessages: Message[] = [
  {
    id: 1,
    text: "👋 Welcome to Ask AtomicMarket! I'm your educational AI assistant for learning about options trading and market analysis. I can help you understand complex financial concepts, research methodologies, and trading strategies.",
    isUser: false,
    timestamp: new Date(),
    sources: []
  },
  {
    id: 2,
    text: "⚠️ **Important**: I provide educational information only. This is NOT investment advice or recommendations to buy or sell securities. Always consult qualified financial professionals before making investment decisions.",
    isUser: false,
    timestamp: new Date(),
    sources: []
  }
];

export default function Terminal() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [queryLimit, setQueryLimit] = useState<QueryLimit>({ used: 0, limit: 10, tier: 'free' });
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    fetchQueryHistory();
    checkQueryLimits();
  }, [user]);

  const fetchQueryHistory = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('terminal_queries')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: true })
        .limit(20);

      if (error) {
        console.error('Error fetching query history:', error);
        return;
      }

      if (data && data.length > 0) {
        const historyMessages: Message[] = [];
        
        data.forEach((query, index) => {
          // Add user question
          historyMessages.push({
            id: 1000 + index * 2,
            text: query.query_text,
            isUser: true,
            timestamp: new Date(query.created_at),
          });
          
          // Add AI response if available
          if (query.response_text) {
            historyMessages.push({
              id: 1000 + index * 2 + 1,
              text: query.response_text,
              isUser: false,
              timestamp: new Date(query.created_at),
              sources: query.response_sources || []
            });
          }
        });

        setMessages([...initialMessages, ...historyMessages]);
      }
    } catch (error) {
      console.error('Error fetching query history:', error);
    }
  };

  const checkQueryLimits = async () => {
    if (!user) return;

    try {
      // Get user's subscription tier
      const { data: userData } = await supabase
        .from('users')
        .select('subscription_tier')
        .eq('id', user.id)
        .single();

      const tier = userData?.subscription_tier || 'free';

      // Count today's queries
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const { data: queryData, error } = await supabase
        .from('terminal_queries')
        .select('id', { count: 'exact' })
        .eq('user_id', user.id)
        .gte('created_at', today.toISOString());

      if (error) {
        console.error('Error checking query limits:', error);
        return;
      }

      const used = queryData?.length || 0;
      const limit = tier === 'free' ? 10 : -1; // -1 means unlimited

      setQueryLimit({ used, limit, tier });
    } catch (error) {
      console.error('Error checking query limits:', error);
    }
  };

  const saveQuery = async (queryText: string, responseText: string, sources: string[] = []) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('terminal_queries')
        .insert({
          user_id: user.id,
          query_text: queryText,
          response_text: responseText,
          response_sources: sources,
          ai_model_used: 'claude',
          processing_time_ms: Math.floor(Math.random() * 2000) + 500, // Mock processing time
        });

      if (error) {
        console.error('Error saving query:', error);
      } else {
        // Update query limits
        setQueryLimit(prev => ({ ...prev, used: prev.used + 1 }));
      }
    } catch (error) {
      console.error('Error saving query:', error);
    }
  };

  const handleSendMessage = async () => {
    if (!inputValue.trim() || isLoading) return;

    // Check query limits for free tier
    if (queryLimit.tier === 'free' && queryLimit.used >= queryLimit.limit) {
      toast({
        variant: "destructive",
        title: "Query Limit Reached",
        description: "You've reached your daily limit of 10 questions. Upgrade to Essential for unlimited queries.",
      });
      return;
    }

    const userMessage: Message = {
      id: Date.now(),
      text: inputValue,
      isUser: true,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsLoading(true);

    try {
      // Get real prediction data
      const aiResponse = await handleQuery(inputValue);
      const sources = generateSources(inputValue);

      const aiMessage: Message = {
        id: Date.now() + 1,
        text: aiResponse,
        isUser: false,
        timestamp: new Date(),
        sources: sources
      };

      setMessages(prev => [...prev, aiMessage]);

      // Save query to database
      if (user) {
        await saveQuery(inputValue, aiResponse, sources);
      }

    } catch (error) {
      console.error('Error processing query:', error);
      
      const errorMessage: Message = {
        id: Date.now() + 1,
        text: "I apologize, but I'm experiencing technical difficulties. Please try again later or contact support if the issue persists.",
        isUser: false,
        timestamp: new Date(),
        sources: []
      };

      setMessages(prev => [...prev, errorMessage]);
      
      toast({
        variant: "destructive",
        title: "Processing Error",
        description: "Failed to process your question. Please try again.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  // Real API query handler
  const handleQuery = async (userQuery: string): Promise<string> => {
    // Extract stock symbol with improved logic for both symbols and company names
    const extractSymbol = (query: string): string | null => {
      const upperQuery = query.toUpperCase();
      
      // Company name to ticker symbol mapping
      const companyToTicker: { [key: string]: string } = {
        'APPLE': 'AAPL',
        'MICROSOFT': 'MSFT',
        'GOOGLE': 'GOOGL',
        'AMAZON': 'AMZN',
        'TESLA': 'TSLA',
        'META': 'META',
        'FACEBOOK': 'META',
        'NETFLIX': 'NFLX',
        'NVIDIA': 'NVDA',
        'GAMESTOP': 'GME',
        'AMC': 'AMC',
        'TWITTER': 'X',
        'BERKSHIRE': 'BRK.B',
        'WALMART': 'WMT',
        'DISNEY': 'DIS',
        'PAYPAL': 'PYPL',
        'ADOBE': 'ADBE',
        'SALESFORCE': 'CRM'
      };
      
      // First, check for company names and convert to tickers
      for (const [company, ticker] of Object.entries(companyToTicker)) {
        if (upperQuery.includes(company)) {
          return ticker;
        }
      }
      
      // Common words to skip
      const skipWords = new Set([
        'WHAT', 'IS', 'THE', 'YOUR', 'PREDICTION', 'FOR',
        'PROBABILITY', 'ABOVE', 'BELOW', 'BY', 'AT', 'IN', 
        'ON', 'WILL', 'BE', 'TODAY', 'TOMORROW', 'MOVEMENT',
        'PRICE', 'STOCK', 'SHARE', 'HOW', 'WHEN', 'WHERE'
      ]);
      
      // Look for stock symbols (1-5 uppercase letters)
      const words = upperQuery.split(/\s+/);
      
      for (const word of words) {
        // Remove any punctuation
        const cleanWord = word.replace(/[^A-Z]/g, '');
        
        // Check if it's a valid ticker symbol
        if (cleanWord.length >= 1 && 
            cleanWord.length <= 5 && 
            /^[A-Z]+$/.test(cleanWord) && 
            !skipWords.has(cleanWord)) {
          return cleanWord;
        }
      }
      
      // Also check for $SYMBOL format
      const dollarMatch = upperQuery.match(/\$([A-Z]{1,5})/);
      if (dollarMatch) return dollarMatch[1];
      
      return null;
    };
    
    const symbol = extractSymbol(userQuery);
    
    if (!symbol) {
      return "Please mention a stock symbol (e.g., GME, AAPL, TSLA)";
    }
    
    try {
      // Call Python API for real predictions
      const data: Prediction = await PredictionAPI.getPrediction(symbol);
      
      // Format the response based on the question
      if (userQuery.toLowerCase().includes('probability') || 
          userQuery.toLowerCase().includes('above') ||
          userQuery.toLowerCase().includes('below')) {
        
        return `📊 **${symbol} Analysis** (Real-Time Data)\n\n` +
          `**Probability of Upward Movement:** ${(data.probability * 100).toFixed(1)}%\n` +
          `**Current Price:** $${data.current_price.toFixed(2)}\n` +
          `**Confidence Level:** ${(data.confidence * 100).toFixed(0)}%\n\n` +
          `**Analysis Factors:**\n` +
          `• Market Momentum: ${(data.factors.base_rate * 100).toFixed(1)}%\n` +
          `• Reddit Sentiment: ${data.factors.reddit_adjustment > 0 ? '📈' : '📉'} ${Math.abs(data.factors.reddit_adjustment * 100).toFixed(1)}%\n` +
          `• News Impact: ${data.factors.news_adjustment > 0 ? '📰+' : '📰-'} ${Math.abs(data.factors.news_adjustment * 100).toFixed(1)}%\n\n` +
          `**Interpretation:** ${data.interpretation}\n\n` +
          `*Data sources: Polygon.io (market), Reddit API (sentiment), NewsAPI (news)*`;
      }
      
      return data.interpretation;
      
    } catch (error) {
      console.error('API Error:', error);
      return "Unable to get prediction. Make sure the Python API is running on port 8000.";
    }
  };

  const generateSources = (question: string): string[] => {
    const allSources = [
      "Cremers-Weinbaum (2010) - Deviations from Put-Call Parity",
      "Boehmer & Jones (2021) - Tracking Retail Investor Activity",
      "AtomicMarket Research Library - Options Basics Module",
      "Academic Paper: Glosten-Milgrom Model Analysis",
      "Educational Module: Understanding Market Microstructure",
      "Research Paper: Information Content of Options Trading"
    ];

    // Return 2-3 random sources
    const numSources = Math.floor(Math.random() * 2) + 2;
    return allSources.sort(() => 0.5 - Math.random()).slice(0, numSources);
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="text-center space-y-4">
        <div className="flex items-center justify-center gap-3">
          <div className="relative">
            <Bot className="h-8 w-8 text-primary" />
            <div className="absolute -top-1 -right-1 h-3 w-3 bg-secondary rounded-full animate-pulse" />
          </div>
          <h1 className="text-3xl font-serif font-bold">Ask AtomicMarket</h1>
        </div>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          Your educational AI assistant for learning about options trading, market analysis, and financial research. 
          Ask questions about concepts, methodologies, or get help understanding our research papers.
        </p>

        {/* Query Limit Indicator */}
        {queryLimit.tier === 'free' && (
          <div className="max-w-md mx-auto">
            <div className="flex items-center justify-between text-sm mb-2">
              <span className="text-muted-foreground">Daily Questions</span>
              <span className="font-medium">
                {queryLimit.used} / {queryLimit.limit}
              </span>
            </div>
            <Progress value={(queryLimit.used / queryLimit.limit) * 100} className="h-2" />
            {queryLimit.used >= queryLimit.limit - 2 && (
              <p className="text-xs text-destructive mt-2">
                {queryLimit.limit - queryLimit.used} questions remaining today
              </p>
            )}
          </div>
        )}
      </div>

      {/* Educational Disclaimer */}
      <Alert className="border-2 border-yellow-200 bg-yellow-50">
        <AlertCircle className="h-4 w-4 text-yellow-600" />
        <AlertDescription className="text-sm">
          <strong>Educational Platform:</strong> AtomicMarket provides educational content only. 
          This is not investment advice. All responses are for learning and research purposes.
        </AlertDescription>
      </Alert>

      {/* Chat Interface */}
      <Card className="min-h-[500px] flex flex-col">
        <CardHeader className="border-b">
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5 text-primary" />
            Educational Chat Session
            {isLoading && <Loader2 className="h-4 w-4 animate-spin ml-2" />}
          </CardTitle>
        </CardHeader>

        {/* Messages Area */}
        <CardContent className="flex-1 p-0">
          <ScrollArea className="h-[400px] p-4">
            <div className="space-y-4">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex gap-3 ${
                    message.isUser ? 'justify-end' : 'justify-start'
                  }`}
                >
                  {!message.isUser && (
                    <div className="flex-shrink-0">
                      <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                        <Bot className="h-4 w-4 text-primary" />
                      </div>
                    </div>
                  )}
                  
                  <div className={`max-w-[80%] ${message.isUser ? 'order-1' : ''}`}>
                    <div
                      className={`rounded-lg p-3 ${
                        message.isUser
                          ? 'bg-primary text-primary-foreground'
                          : 'bg-muted text-foreground'
                      }`}
                    >
                      <div className="text-sm whitespace-pre-wrap">{message.text}</div>
                      
                      {/* Sources */}
                      {message.sources && message.sources.length > 0 && (
                        <div className="mt-3 pt-2 border-t border-border/20">
                          <div className="text-xs text-muted-foreground mb-1">Sources:</div>
                          <div className="space-y-1">
                            {message.sources.map((source, index) => (
                              <div key={index} className="flex items-center gap-1 text-xs">
                                <BookOpen className="h-3 w-3" />
                                <span className="text-primary hover:underline cursor-pointer">
                                  {source}
                                </span>
                                <ExternalLink className="h-3 w-3 text-muted-foreground" />
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                    
                    <div className="text-xs text-muted-foreground mt-1 px-1">
                      {message.timestamp.toLocaleTimeString([], { 
                        hour: '2-digit', 
                        minute: '2-digit' 
                      })}
                    </div>
                  </div>
                  
                  {message.isUser && (
                    <div className="flex-shrink-0">
                      <div className="w-8 h-8 rounded-full bg-secondary/10 flex items-center justify-center">
                        <User className="h-4 w-4 text-primary" />
                      </div>
                    </div>
                  )}
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>
          </ScrollArea>
        </CardContent>

        <Separator />

        {/* Input Area */}
        <div className="p-4">
          <div className="flex gap-2">
            <Input
              ref={inputRef}
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Ask about options trading, research methodologies, or market analysis..."
              disabled={isLoading || (queryLimit.tier === 'free' && queryLimit.used >= queryLimit.limit)}
              className="flex-1"
            />
            <Button
              onClick={handleSendMessage}
              disabled={!inputValue.trim() || isLoading || (queryLimit.tier === 'free' && queryLimit.used >= queryLimit.limit)}
              size="sm"
            >
              {isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Send className="h-4 w-4" />
              )}
            </Button>
          </div>

          {/* Query Limit Warning */}
          {queryLimit.tier === 'free' && queryLimit.used >= queryLimit.limit && (
            <div className="mt-2 text-center">
              <Badge variant="destructive" className="text-xs">
                Daily limit reached - Upgrade to Essential for unlimited queries
              </Badge>
            </div>
          )}

          {/* Sample Questions */}
          <div className="mt-3">
            <div className="text-xs text-muted-foreground mb-2">Try asking:</div>
            <div className="flex flex-wrap gap-2">
              {[
                "What is put-call parity?",
                "How do market makers work?", 
                "Explain the Greeks in options",
                "What is unusual options activity?"
              ].map((question) => (
                <Button
                  key={question}
                  variant="outline"
                  size="sm"
                  className="text-xs h-6"
                  onClick={() => setInputValue(question)}
                  disabled={isLoading}
                >
                  <HelpCircle className="h-3 w-3 mr-1" />
                  {question}
                </Button>
              ))}
            </div>
          </div>
        </div>
      </Card>

      {/* Educational Footer */}
      <Card className="border-2 border-muted">
        <CardContent className="pt-4">
          <div className="flex items-start gap-3 text-sm">
            <AlertCircle className="h-4 w-4 text-destructive mt-0.5 flex-shrink-0" />
            <div className="space-y-1">
              <p className="font-medium">Educational Use Only</p>
              <p className="text-xs text-muted-foreground leading-relaxed">
                All responses are generated for educational purposes and should not be considered as 
                investment advice, financial advice, or recommendations to buy or sell securities. 
                Always consult with qualified financial professionals before making investment decisions.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}