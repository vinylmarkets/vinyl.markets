import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { ArrowLeft, BookOpen, Share2 } from "lucide-react";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { EducationalPrincipleBox } from "@/components/briefings/EducationalPrincipleBox";
import { StockBadge } from "@/components/briefings/StockBadge";
import { FeaturedImage } from "@/components/briefings/FeaturedImage";
import { ReadingStats } from "@/components/briefings/ReadingStats";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";

// Component to parse and render briefing content with styled headers
const BriefingContent = ({ content }: { content: string }) => {
  const parseContent = (text: string) => {
    const sections = text.split(/===\s*(.+?)\s*===/);
    const parsedSections = [];
    
    for (let i = 0; i < sections.length; i++) {
      if (i === 0 && sections[i].trim()) {
        // Content before first header
        parsedSections.push({
          type: 'content',
          text: sections[i].trim()
        });
      } else if (i % 2 === 1) {
        // Header
        parsedSections.push({
          type: 'header',
          text: sections[i].trim()
        });
      } else if (i % 2 === 0 && sections[i].trim()) {
        // Content after header
        parsedSections.push({
          type: 'content',
          text: sections[i].trim()
        });
      }
    }
    
    return parsedSections;
  };

  const sections = parseContent(content);

  return (
    <div className="space-y-6">
      {sections.map((section, index) => {
        if (section.type === 'header') {
          return (
            <h3 
              key={index} 
              className="text-lg font-semibold text-foreground flex items-center gap-2 mt-6 mb-3 first:mt-0"
            >
              {section.text}
            </h3>
          );
        } else {
          return (
            <div 
              key={index} 
              className="text-muted-foreground leading-relaxed whitespace-pre-wrap"
            >
              {section.text}
            </div>
          );
        }
      })}
    </div>
  );
};

export default function BriefingDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [briefing, setBriefing] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAcademicMode, setIsAcademicMode] = useState(false);

  useEffect(() => {
    if (id) {
      loadBriefing(id);
    }
  }, [id]);

  const loadBriefing = async (briefingId: string) => {
    try {
      const { data, error } = await supabase
        .from('briefings')
        .select('*')
        .eq('id', briefingId)
        .eq('published', true)
        .single();

      if (error) throw error;
      setBriefing(data);
    } catch (error) {
      console.error('Error loading briefing:', error);
      toast({
        title: "Error",
        description: "Failed to load briefing.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="max-w-4xl mx-auto py-8">
          <div className="animate-pulse">
            <div className="h-8 bg-muted rounded w-1/3 mb-4"></div>
            <div className="h-4 bg-muted rounded w-full mb-2"></div>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (!briefing) {
    return (
      <DashboardLayout>
        <div className="max-w-4xl mx-auto py-8 text-center">
          <h1 className="text-2xl font-bold mb-4">Briefing Not Found</h1>
          <Button onClick={() => navigate('/dashboard/briefings')}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Briefings
          </Button>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto py-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate('/dashboard/briefings')}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Briefings
          </Button>
          
          <div className="flex items-center gap-4">
            <div className="flex items-center space-x-2">
              <Label htmlFor="academic-mode" className="text-sm font-medium">Academic Mode</Label>
              <Switch
                id="academic-mode"
                checked={isAcademicMode}
                onCheckedChange={setIsAcademicMode}
              />
            </div>
            
            <Button variant="outline" size="sm" className="flex items-center gap-2">
              <Share2 className="w-4 h-4" />
              Share
            </Button>
          </div>
        </div>

        {/* Featured Image */}
        <FeaturedImage 
          title={briefing.title}
          category={briefing.category}
          stocks={briefing.stocks_mentioned || []}
        />

        {/* Reading Stats */}
        <ReadingStats 
          publicationDate={briefing.publication_date}
          contentLength={
            isAcademicMode 
              ? briefing.academic_content?.length || 0 
              : briefing.plain_speak_content?.length || 0
          }
          stocksCount={briefing.stocks_mentioned?.length || 0}
          category={briefing.category}
        />

        {/* Briefing Header */}
        <Card className="border-2 border-amber/20 bg-gradient-to-r from-amber/5 to-transparent">
          <CardHeader>
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="bg-purple/10 text-purple border-purple/30">
                  {briefing.category.replace('-', ' ')}
                </Badge>
                <Badge variant="outline" className="bg-amber/10 text-amber border-amber/30">
                  Market Intelligence
                </Badge>
              </div>
              
              <CardTitle className="text-2xl md:text-3xl font-bold leading-tight">
                {briefing.title}
              </CardTitle>

              <p className="text-lg text-muted-foreground leading-relaxed">
                {briefing.executive_summary}
              </p>

              {/* Stock Badges */}
              {briefing.stocks_mentioned && briefing.stocks_mentioned.length > 0 && (
                <div className="space-y-2">
                  <p className="text-sm font-medium text-muted-foreground">Stocks Analyzed:</p>
                  <div className="flex flex-wrap gap-2">
                    {briefing.stocks_mentioned.map((symbol: string) => (
                      <StockBadge key={symbol} symbol={symbol} size="md" />
                    ))}
                  </div>
                </div>
              )}
            </div>
          </CardHeader>
        </Card>

        {/* Main Content */}
        <Card className="border-l-4 border-l-primary">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BookOpen className="h-5 w-5 text-primary" />
              {isAcademicMode ? "Academic Analysis" : "Plain Language Summary"}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="prose prose-lg max-w-none">
              <BriefingContent 
                content={isAcademicMode ? briefing.academic_content : briefing.plain_speak_content}
              />
            </div>
          </CardContent>
        </Card>

        {/* Educational Principle */}
        {briefing.educational_principle && (
          <EducationalPrincipleBox principle={briefing.educational_principle} />
        )}
      </div>
    </DashboardLayout>
  );
}