import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { supabase } from "@/integrations/supabase/client";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from "recharts";
import { FileText, AlertTriangle, Clock, ThumbsUp, BookOpen, TrendingUp } from "lucide-react";

interface ContentPerformanceData {
  popularTopics: Array<{ topic: string; views: number; engagement: number }>;
  formatPreferences: Array<{ format: string; percentage: number; count: number }>;
  ratingDistribution: Array<{ rating: number; count: number }>;
  complianceFlags: Array<{ type: string; count: number; severity: string }>;
  engagementTrends: Array<{ date: string; avgTime: number; completionRate: number }>;
  satisfactionTrends: Array<{ period: string; score: number }>;
}

const COLORS = ['hsl(var(--chart-1))', 'hsl(var(--chart-2))', 'hsl(var(--chart-3))', 'hsl(var(--chart-4))', 'hsl(var(--chart-5))'];

export default function ContentPerformance() {
  const [contentData, setContentData] = useState<ContentPerformanceData | null>(null);
  const [loading, setLoading] = useState(true);
  const [totalBriefings, setTotalBriefings] = useState(0);
  const [avgRating, setAvgRating] = useState(0);
  const [flaggedContent, setFlaggedContent] = useState(0);

  useEffect(() => {
    fetchContentPerformance();
  }, []);

  const fetchContentPerformance = async () => {
    try {
      // Fetch briefing ratings and preferences
      const { data: briefings } = await supabase
        .from('user_briefings')
        .select('rating, created_at')
        .not('rating', 'is', null);

      // Fetch compliance flags
      const { data: flags } = await supabase
        .from('content_flags')
        .select('flag_reason, flag_severity, created_at')
        .order('created_at', { ascending: false });

      // Fetch intelligence briefings for topics analysis
      const { data: intelligenceBriefings } = await supabase
        .from('intelligence_briefings')
        .select('title, created_at')
        .limit(100);

      // Process ratings distribution
      const ratingDistribution = [1, 2, 3, 4, 5].map(rating => ({
        rating,
        count: briefings?.filter(b => b.rating === rating).length || 0
      }));

      // Calculate average rating
      const totalRatings = briefings?.length || 0;
      const avgRatingValue = totalRatings > 0 
        ? briefings!.reduce((sum, b) => sum + (b.rating || 0), 0) / totalRatings 
        : 0;

      // Mock popular topics (would be extracted from briefing titles/content)
      const popularTopics = [
        { topic: 'Market Analysis', views: 2345, engagement: 87 },
        { topic: 'Crypto Updates', views: 1876, engagement: 72 },
        { topic: 'Tech Sector News', views: 1654, engagement: 91 },
        { topic: 'Healthcare Trends', views: 1432, engagement: 68 },
        { topic: 'Energy Markets', views: 1287, engagement: 83 },
        { topic: 'Real Estate', views: 1098, engagement: 76 }
      ];

      // Mock format preferences (would come from user preferences)
      const formatPreferences = [
        { format: 'Plain Speak', percentage: 68, count: 1836 },
        { format: 'Academic', percentage: 32, count: 864 }
      ];

      // Process compliance flags
      const complianceFlags = flags?.reduce((acc: any[], flag) => {
        const existing = acc.find(f => f.type === flag.flag_reason);
        if (existing) {
          existing.count++;
        } else {
          acc.push({
            type: flag.flag_reason || 'Unknown',
            count: 1,
            severity: flag.flag_severity || 'medium'
          });
        }
        return acc;
      }, []) || [];

      // Mock engagement trends
      const engagementTrends = [
        { date: '2024-01-01', avgTime: 4.2, completionRate: 78 },
        { date: '2024-01-08', avgTime: 4.5, completionRate: 82 },
        { date: '2024-01-15', avgTime: 4.1, completionRate: 76 },
        { date: '2024-01-22', avgTime: 4.7, completionRate: 85 },
        { date: '2024-01-29', avgTime: 4.3, completionRate: 80 },
        { date: '2024-02-05', avgTime: 4.6, completionRate: 87 }
      ];

      // Mock satisfaction trends
      const satisfactionTrends = [
        { period: 'Week 1', score: 4.1 },
        { period: 'Week 2', score: 4.3 },
        { period: 'Week 3', score: 4.2 },
        { period: 'Week 4', score: 4.4 },
        { period: 'Week 5', score: 4.5 },
        { period: 'Week 6', score: 4.3 }
      ];

      setContentData({
        popularTopics,
        formatPreferences,
        ratingDistribution,
        complianceFlags,
        engagementTrends,
        satisfactionTrends
      });

      setTotalBriefings(intelligenceBriefings?.length || 0);
      setAvgRating(avgRatingValue);
      setFlaggedContent(flags?.length || 0);
    } catch (error) {
      console.error('Error fetching content performance:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="p-6">Loading content performance...</div>;
  }

  const chartConfig = {
    views: { label: "Views", color: "hsl(var(--chart-1))" },
    engagement: { label: "Engagement %", color: "hsl(var(--chart-2))" },
    avgTime: { label: "Avg Time (min)", color: "hsl(var(--chart-3))" },
    completionRate: { label: "Completion Rate %", color: "hsl(var(--chart-4))" },
    score: { label: "Satisfaction Score", color: "hsl(var(--chart-5))" }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Content Performance</h1>
        <Badge variant="secondary">Content Analytics</Badge>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Briefings</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalBriefings.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">Published content</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average Rating</CardTitle>
            <ThumbsUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{avgRating.toFixed(2)}/5</div>
            <p className="text-xs text-muted-foreground">User satisfaction</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Read Time</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">4.4 min</div>
            <p className="text-xs text-muted-foreground">Content engagement</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Flagged Content</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{flaggedContent}</div>
            <p className="text-xs text-muted-foreground">Compliance alerts</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="topics" className="space-y-4">
        <TabsList>
          <TabsTrigger value="topics">Popular Topics</TabsTrigger>
          <TabsTrigger value="formats">Format Preferences</TabsTrigger>
          <TabsTrigger value="ratings">Content Ratings</TabsTrigger>
          <TabsTrigger value="engagement">Engagement Trends</TabsTrigger>
          <TabsTrigger value="compliance">Compliance</TabsTrigger>
        </TabsList>

        <TabsContent value="topics">
          <Card>
            <CardHeader>
              <CardTitle>Most Popular Content Topics</CardTitle>
              <CardDescription>Top performing topics by views and engagement</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <ChartContainer config={chartConfig} className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={contentData?.popularTopics}>
                      <XAxis dataKey="topic" angle={-45} textAnchor="end" height={80} />
                      <YAxis />
                      <ChartTooltip content={<ChartTooltipContent />} />
                      <Bar dataKey="views" fill="var(--color-views)" />
                    </BarChart>
                  </ResponsiveContainer>
                </ChartContainer>
                
                <div className="space-y-4">
                  {contentData?.popularTopics.map((topic, index) => (
                    <div key={topic.topic} className="flex items-center justify-between p-4 rounded-lg border">
                      <div className="flex items-center space-x-4">
                        <Badge variant="outline">#{index + 1}</Badge>
                        <div>
                          <div className="font-medium">{topic.topic}</div>
                          <div className="text-sm text-muted-foreground">{topic.views.toLocaleString()} views</div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-4">
                        <div className="text-right">
                          <div className="font-bold">{topic.engagement}%</div>
                          <div className="text-xs text-muted-foreground">engagement</div>
                        </div>
                        <Progress value={topic.engagement} className="w-20" />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="formats">
          <Card>
            <CardHeader>
              <CardTitle>Content Format Preferences</CardTitle>
              <CardDescription>User preferences for Academic vs Plain Speak content</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <ChartContainer config={{}} className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={contentData?.formatPreferences}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={100}
                        paddingAngle={5}
                        dataKey="count"
                      >
                        {contentData?.formatPreferences.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <ChartTooltip content={<ChartTooltipContent />} />
                    </PieChart>
                  </ResponsiveContainer>
                </ChartContainer>
                
                <div className="space-y-4">
                  {contentData?.formatPreferences.map((format, index) => (
                    <div key={format.format} className="flex items-center justify-between p-4 rounded-lg border">
                      <div className="flex items-center space-x-3">
                        <div className="w-4 h-4 rounded" style={{ backgroundColor: COLORS[index % COLORS.length] }}></div>
                        <span className="font-medium">{format.format}</span>
                      </div>
                      <div className="text-right">
                        <div className="font-bold">{format.count.toLocaleString()}</div>
                        <div className="text-sm text-muted-foreground">{format.percentage}%</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="ratings">
          <Card>
            <CardHeader>
              <CardTitle>Content Rating Distribution</CardTitle>
              <CardDescription>Distribution of user ratings for content</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <ChartContainer config={{}} className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={contentData?.ratingDistribution}>
                      <XAxis dataKey="rating" />
                      <YAxis />
                      <ChartTooltip content={<ChartTooltipContent />} />
                      <Bar dataKey="count" fill="hsl(var(--chart-1))" />
                    </BarChart>
                  </ResponsiveContainer>
                </ChartContainer>
                
                <div className="grid grid-cols-5 gap-4">
                  {contentData?.ratingDistribution.map((rating) => (
                    <div key={rating.rating} className="text-center p-4 rounded-lg border">
                      <div className="text-2xl font-bold">{rating.rating}★</div>
                      <div className="text-sm text-muted-foreground">{rating.count} ratings</div>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="engagement">
          <Card>
            <CardHeader>
              <CardTitle>Content Engagement Trends</CardTitle>
              <CardDescription>Average reading time and completion rates over time</CardDescription>
            </CardHeader>
            <CardContent>
              <ChartContainer config={chartConfig} className="h-[400px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={contentData?.engagementTrends}>
                    <XAxis dataKey="date" />
                    <YAxis />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Line type="monotone" dataKey="avgTime" stroke="var(--color-avgTime)" strokeWidth={2} />
                    <Line type="monotone" dataKey="completionRate" stroke="var(--color-completionRate)" strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              </ChartContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="compliance">
          <Card>
            <CardHeader>
              <CardTitle>Compliance Flag Tracking</CardTitle>
              <CardDescription>Content flags and compliance issues</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {contentData?.complianceFlags.length ? (
                  contentData.complianceFlags.map((flag, index) => (
                    <div key={flag.type} className="flex items-center justify-between p-4 rounded-lg border">
                      <div className="flex items-center space-x-3">
                        <AlertTriangle className={`h-5 w-5 ${
                          flag.severity === 'high' ? 'text-destructive' : 
                          flag.severity === 'medium' ? 'text-yellow-500' : 'text-muted-foreground'
                        }`} />
                        <div>
                          <div className="font-medium">{flag.type}</div>
                          <Badge variant={
                            flag.severity === 'high' ? 'destructive' : 
                            flag.severity === 'medium' ? 'secondary' : 'outline'
                          } className="text-xs">
                            {flag.severity} priority
                          </Badge>
                        </div>
                      </div>
                      <div className="font-bold">{flag.count}</div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <AlertTriangle className="h-12 w-12 mx-auto mb-4 text-green-500" />
                    <p>No compliance flags found</p>
                    <p className="text-sm">All content is compliant</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}