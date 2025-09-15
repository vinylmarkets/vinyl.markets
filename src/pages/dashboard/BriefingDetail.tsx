import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { 
  ArrowLeft, 
  Clock, 
  Calendar, 
  TrendingUp, 
  Star, 
  ExternalLink,
  GraduationCap,
  MessageSquare,
  ThumbsUp,
  ThumbsDown
} from "lucide-react";
import { mockBriefings, Briefing } from "@/data/mockBriefings";
import { useToast } from "@/hooks/use-toast";

export default function BriefingDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [briefing, setBriefing] = useState<Briefing | null>(null);
  const [isAcademicMode, setIsAcademicMode] = useState(false);
  const [userRating, setUserRating] = useState<number>(0);
  const [feedback, setFeedback] = useState("");
  const [showMethodology, setShowMethodology] = useState(false);

  useEffect(() => {
    const found = mockBriefings.find(b => b.id === id);
    if (found) {
      setBriefing(found);
      setUserRating(found.rating || 0);
      setFeedback(found.feedback || "");
    }
  }, [id]);

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getConfidenceColor = (score: number) => {
    if (score >= 85) return "text-emerald-600 bg-emerald-50";
    if (score >= 70) return "text-yellow-600 bg-yellow-50";
    return "text-orange-600 bg-orange-50";
  };

  const handleRating = (rating: number) => {
    setUserRating(rating);
    // In real app, this would update the database
    toast({
      title: "Rating saved",
      description: `You rated this briefing ${rating} star${rating !== 1 ? 's' : ''}`,
    });
  };

  const handleFeedbackSubmit = () => {
    // In real app, this would update the database
    toast({
      title: "Feedback submitted",
      description: "Thank you for your feedback! It helps improve our analysis.",
    });
  };

  if (!briefing) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <h2 className="text-xl font-semibold mb-2">Briefing not found</h2>
            <Button onClick={() => navigate('/dashboard/briefings')}>
              Back to Briefings
            </Button>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Button 
            variant="ghost" 
            size="sm"
            onClick={() => navigate('/dashboard/briefings')}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Briefings
          </Button>
        </div>

        {/* Briefing Header */}
        <Card>
          <CardHeader>
            <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-3">
                  <Badge variant="secondary">{briefing.category}</Badge>
                  <div className={`px-3 py-1 rounded-full text-sm font-medium ${getConfidenceColor(briefing.confidenceScore)}`}>
                    {briefing.confidenceScore}% Confidence
                  </div>
                </div>
                <CardTitle className="text-2xl lg:text-3xl mb-3">
                  {briefing.title}
                </CardTitle>
                <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Calendar className="h-4 w-4" />
                    {formatDate(briefing.date)}
                  </div>
                  <div className="flex items-center gap-1">
                    <Clock className="h-4 w-4" />
                    {briefing.readTime} min read
                  </div>
                </div>
              </div>
              
              {/* Academic/Plain Speak Toggle */}
              <div className="flex flex-col items-end gap-4">
                <div className="flex items-center space-x-3 bg-muted/50 p-3 rounded-lg">
                  <GraduationCap className="h-5 w-5 text-muted-foreground" />
                  <Label htmlFor="academic-mode" className="text-sm font-medium">
                    Academic Mode
                  </Label>
                  <Switch
                    id="academic-mode"
                    checked={isAcademicMode}
                    onCheckedChange={setIsAcademicMode}
                  />
                </div>
                <div className="text-xs text-muted-foreground text-center max-w-48">
                  {isAcademicMode ? 
                    "Technical analysis with detailed methodology" : 
                    "Clear explanations in everyday language"
                  }
                </div>
              </div>
            </div>
          </CardHeader>
        </Card>

        {/* Tags */}
        <div className="flex flex-wrap gap-2">
          {briefing.tags.map(tag => (
            <Badge key={tag} variant="outline" className="text-xs">
              {tag.replace('-', ' ')}
            </Badge>
          ))}
        </div>

        {/* Main Content */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">
                {isAcademicMode ? "Technical Analysis" : "Analysis Summary"}
              </h3>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <TrendingUp className="h-4 w-4" />
                Signal Strength: {briefing.confidenceScore}%
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="prose prose-sm max-w-none">
              <div 
                className="whitespace-pre-wrap"
                dangerouslySetInnerHTML={{
                  __html: (isAcademicMode ? briefing.academicContent : briefing.plainSpeakContent)
                    .replace(/## (.*)/g, '<h2 class="text-xl font-semibold mt-6 mb-3 text-foreground">$1</h2>')
                    .replace(/\*\*(.*?)\*\*/g, '<strong class="font-semibold text-foreground">$1</strong>')
                    .replace(/- \*\*(.*?)\*\*:/g, '<li class="mb-1"><strong class="font-semibold text-foreground">$1:</strong>')
                    .replace(/- (.*)/g, '<li class="mb-1 text-muted-foreground">$1</li>')
                }}
              />
            </div>
          </CardContent>
        </Card>

        {/* Methodology */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">Methodology</h3>
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => setShowMethodology(!showMethodology)}
              >
                <ExternalLink className="h-4 w-4 mr-2" />
                {showMethodology ? 'Hide' : 'Show'} Details
              </Button>
            </div>
          </CardHeader>
          {showMethodology && (
            <CardContent>
              <p className="text-muted-foreground text-sm leading-relaxed">
                {briefing.methodology}
              </p>
            </CardContent>
          )}
        </Card>

        {/* Rating and Feedback */}
        <Card>
          <CardHeader>
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <MessageSquare className="h-5 w-5" />
              Your Feedback
            </h3>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Rating */}
            <div>
              <Label className="text-sm font-medium mb-3 block">Rate this briefing</Label>
              <div className="flex items-center gap-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Button
                    key={star}
                    variant="ghost"
                    size="sm"
                    className="p-1"
                    onClick={() => handleRating(star)}
                  >
                    <Star 
                      className={`h-5 w-5 ${
                        star <= userRating 
                          ? 'text-yellow-500 fill-current' 
                          : 'text-muted-foreground'
                      }`} 
                    />
                  </Button>
                ))}
                {userRating > 0 && (
                  <span className="ml-2 text-sm text-muted-foreground">
                    {userRating} star{userRating !== 1 ? 's' : ''}
                  </span>
                )}
              </div>
            </div>

            <Separator />

            {/* Feedback */}
            <div>
              <Label htmlFor="feedback" className="text-sm font-medium mb-3 block">
                Additional comments (optional)
              </Label>
              <Textarea
                id="feedback"
                placeholder="Share your thoughts on this analysis..."
                value={feedback}
                onChange={(e) => setFeedback(e.target.value)}
                className="min-h-20"
              />
              <div className="flex items-center justify-between mt-3">
                <div className="flex gap-2">
                  <Button variant="outline" size="sm">
                    <ThumbsUp className="h-4 w-4 mr-1" />
                    Helpful
                  </Button>
                  <Button variant="outline" size="sm">
                    <ThumbsDown className="h-4 w-4 mr-1" />
                    Not Helpful
                  </Button>
                </div>
                <Button onClick={handleFeedbackSubmit} size="sm">
                  Submit Feedback
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}