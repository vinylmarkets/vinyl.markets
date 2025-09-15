import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { supabase } from "@/integrations/supabase/client";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, LineChart, Line, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar } from "recharts";
import { FileText, MessageSquare, GraduationCap, Award, TrendingUp, Star } from "lucide-react";

interface ProductIntelligenceData {
  briefingDeliveryRate: number;
  avgQueryResponseTime: number;
  moduleCompletionRate: number;
  achievementDistribution: Array<{ category: string; count: number }>;
  featureAdoption: Array<{ feature: string; adoption: number; growth: number }>;
  satisfactionScores: Array<{ period: string; score: number }>;
  queryPatterns: Array<{ pattern: string; frequency: number; intent: string }>;
}

export default function ProductIntelligence() {
  const [intelligenceData, setIntelligenceData] = useState<ProductIntelligenceData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProductIntelligence();
  }, []);

  const fetchProductIntelligence = async () => {
    try {
      // Fetch briefing delivery metrics
      const { data: briefingMetrics } = await supabase
        .from('daily_metrics')
        .select('briefings_delivered, date')
        .order('date', { ascending: false })
        .limit(30);

      // Fetch query patterns
      const { data: queryPatterns } = await supabase
        .from('query_intelligence_summary')
        .select('*')
        .order('frequency_count', { ascending: false })
        .limit(10);

      // Fetch achievement data
      const { data: achievementsData } = await supabase
        .from('achievements')
        .select('category');

      const achievements = achievementsData ? 
        Object.entries(achievementsData.reduce((acc: any, curr) => {
          acc[curr.category] = (acc[curr.category] || 0) + 1;
          return acc;
        }, {})).map(([category, count]) => ({ category, count: count as number })) : [];

      // Calculate metrics
      const totalBriefings = briefingMetrics?.reduce((sum, d) => sum + (d.briefings_delivered || 0), 0) || 0;
      const avgDeliveryRate = briefingMetrics?.length ? (totalBriefings / briefingMetrics.length) : 0;

      // Mock data for features not fully implemented
      const featureAdoption = [
        { feature: 'Intelligence Briefings', adoption: 89, growth: 12 },
        { feature: 'Terminal Queries', adoption: 76, growth: 8 },
        { feature: 'Portfolio Tracking', adoption: 45, growth: 23 },
        { feature: 'Educational Modules', adoption: 34, growth: 15 },
        { feature: 'Achievement System', adoption: 28, growth: 31 }
      ];

      const satisfactionScores = [
        { period: 'Week 1', score: 4.2 },
        { period: 'Week 2', score: 4.3 },
        { period: 'Week 3', score: 4.1 },
        { period: 'Week 4', score: 4.4 },
        { period: 'Week 5', score: 4.5 },
        { period: 'Week 6', score: 4.3 }
      ];

      const processedQueryPatterns = queryPatterns?.map(p => ({
        pattern: p.pattern_text?.substring(0, 50) + '...' || 'Unknown',
        frequency: Number(p.frequency_count) || 0,
        intent: p.user_intent_category || 'general'
      })) || [];

      setIntelligenceData({
        briefingDeliveryRate: (avgDeliveryRate / 100) * 100, // Convert to percentage
        avgQueryResponseTime: 2.3, // This would come from performance metrics
        moduleCompletionRate: 67, // This would come from learning progress
        achievementDistribution: achievements || [],
        featureAdoption,
        satisfactionScores,
        queryPatterns: processedQueryPatterns
      });
    } catch (error) {
      console.error('Error fetching product intelligence:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="p-6">Loading product intelligence...</div>;
  }

  const chartConfig = {
    adoption: { label: "Adoption Rate", color: "hsl(var(--chart-1))" },
    growth: { label: "Growth Rate", color: "hsl(var(--chart-2))" },
    score: { label: "Satisfaction Score", color: "hsl(var(--chart-3))" }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Product Intelligence</h1>
        <Badge variant="secondary">Feature Performance</Badge>
      </div>

      {/* Key Performance Indicators */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Briefing Delivery</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{intelligenceData?.briefingDeliveryRate.toFixed(1)}%</div>
            <p className="text-xs text-muted-foreground">Average delivery rate</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Query Response</CardTitle>
            <MessageSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{intelligenceData?.avgQueryResponseTime}s</div>
            <p className="text-xs text-muted-foreground">Average response time</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Module Completion</CardTitle>
            <GraduationCap className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{intelligenceData?.moduleCompletionRate}%</div>
            <p className="text-xs text-muted-foreground">Educational completion</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">User Satisfaction</CardTitle>
            <Star className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">4.3/5</div>
            <p className="text-xs text-muted-foreground">Average rating</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="adoption" className="space-y-4">
        <TabsList>
          <TabsTrigger value="adoption">Feature Adoption</TabsTrigger>
          <TabsTrigger value="satisfaction">Satisfaction</TabsTrigger>
          <TabsTrigger value="patterns">Query Patterns</TabsTrigger>
          <TabsTrigger value="achievements">Achievements</TabsTrigger>
        </TabsList>

        <TabsContent value="adoption">
          <Card>
            <CardHeader>
              <CardTitle>Feature Adoption Rates</CardTitle>
              <CardDescription>Current adoption and growth rates for key features</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <ChartContainer config={chartConfig} className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={intelligenceData?.featureAdoption}>
                      <XAxis dataKey="feature" angle={-45} textAnchor="end" height={60} />
                      <YAxis />
                      <ChartTooltip content={<ChartTooltipContent />} />
                      <Bar dataKey="adoption" fill="var(--color-adoption)" />
                    </BarChart>
                  </ResponsiveContainer>
                </ChartContainer>
                
                <div className="space-y-4">
                  {intelligenceData?.featureAdoption.map((feature, index) => (
                    <div key={feature.feature} className="flex items-center justify-between p-4 rounded-lg border">
                      <div>
                        <div className="font-medium">{feature.feature}</div>
                        <div className="text-sm text-muted-foreground">Growth: +{feature.growth}% this month</div>
                      </div>
                      <div className="flex items-center space-x-4">
                        <Progress value={feature.adoption} className="w-24" />
                        <span className="font-bold w-12 text-right">{feature.adoption}%</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="satisfaction">
          <Card>
            <CardHeader>
              <CardTitle>User Satisfaction Trends</CardTitle>
              <CardDescription>Weekly satisfaction scores and feedback</CardDescription>
            </CardHeader>
            <CardContent>
              <ChartContainer config={chartConfig} className="h-[400px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={intelligenceData?.satisfactionScores}>
                    <XAxis dataKey="period" />
                    <YAxis domain={[3.5, 5]} />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Line 
                      type="monotone" 
                      dataKey="score" 
                      stroke="var(--color-score)" 
                      strokeWidth={3}
                      dot={{ fill: "var(--color-score)", strokeWidth: 2, r: 6 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </ChartContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="patterns">
          <Card>
            <CardHeader>
              <CardTitle>Query Patterns & Trends</CardTitle>
              <CardDescription>Most common user query patterns and intents</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {intelligenceData?.queryPatterns.map((pattern, index) => (
                  <div key={index} className="flex items-center justify-between p-4 rounded-lg border">
                    <div className="flex-1">
                      <div className="font-medium text-sm">{pattern.pattern}</div>
                      <Badge variant="outline" className="mt-1 text-xs">{pattern.intent}</Badge>
                    </div>
                    <div className="flex items-center space-x-4">
                      <div className="text-right">
                        <div className="font-bold">{pattern.frequency}</div>
                        <div className="text-xs text-muted-foreground">queries</div>
                      </div>
                      <Progress value={(pattern.frequency / Math.max(...intelligenceData.queryPatterns.map(p => p.frequency))) * 100} className="w-20" />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="achievements">
          <Card>
            <CardHeader>
              <CardTitle>Achievement Distribution</CardTitle>
              <CardDescription>Distribution of achievements across categories</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="space-y-4">
                  {intelligenceData?.achievementDistribution.map((achievement, index) => (
                    <div key={achievement.category} className="flex items-center justify-between p-4 rounded-lg border">
                      <div className="flex items-center space-x-3">
                        <Award className="h-5 w-5 text-muted-foreground" />
                        <span className="font-medium capitalize">{achievement.category}</span>
                      </div>
                      <div className="flex items-center space-x-4">
                        <span className="font-bold">{achievement.count}</span>
                        <Progress 
                          value={(achievement.count / Math.max(...intelligenceData.achievementDistribution.map(a => a.count))) * 100} 
                          className="w-20" 
                        />
                      </div>
                    </div>
                  ))}
                </div>
                <div className="flex items-center justify-center">
                  <div className="text-center space-y-4">
                    <div className="text-4xl font-bold text-primary">
                      {intelligenceData?.achievementDistribution.reduce((sum, a) => sum + a.count, 0)}
                    </div>
                    <div className="text-muted-foreground">Total Achievements Available</div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}