import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { ArrowLeft, BookOpen } from "lucide-react";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { EducationalPrincipleBox } from "@/components/briefings/EducationalPrincipleBox";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";

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
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate('/dashboard/briefings')}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Briefings
          </Button>
          
          <div className="flex items-center space-x-2 ml-auto">
            <Label htmlFor="academic-mode">Academic Mode</Label>
            <Switch
              id="academic-mode"
              checked={isAcademicMode}
              onCheckedChange={setIsAcademicMode}
            />
          </div>
        </div>

        {/* Briefing Header */}
        <Card>
          <CardHeader>
            <div className="space-y-4">
              <Badge variant="outline">
                {briefing.category.replace('-', ' ')}
              </Badge>
              
              <CardTitle className="text-2xl font-bold">
                {briefing.title}
              </CardTitle>

              <p className="text-lg text-muted-foreground">
                {briefing.executive_summary}
              </p>
            </div>
          </CardHeader>
        </Card>

        {/* Main Content */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BookOpen className="h-5 w-5" />
              {isAcademicMode ? "Academic Analysis" : "Plain Language Summary"}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="prose prose-lg max-w-none">
              <div className="whitespace-pre-wrap leading-relaxed">
                {isAcademicMode ? briefing.academic_content : briefing.plain_speak_content}
              </div>
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