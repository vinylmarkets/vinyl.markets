import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { TraderProtection } from "@/components/trader/TraderProtection";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ScrollArea } from "@/components/ui/scroll-area";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import {
  ArrowLeft,
  Mail,
  TrendingUp,
  Users,
  Eye,
  Search,
  ChevronLeft,
  ChevronRight,
  BarChart3,
  TrendingDown,
} from "lucide-react";

interface NewsletterStats {
  totalSent: number;
  totalViews: number;
  avgRating: number;
  subscriberCount: number;
}

interface Newsletter {
  id: string;
  title: string;
  publication_date: string;
  stocks_mentioned: string[];
  views: number;
  sent_count: number;
  avg_rating: number;
}

interface TopicAnalysis {
  topic: string;
  count: number;
  percentage: number;
}

const TraderReporting = () => {
  const [stats, setStats] = useState<NewsletterStats>({
    totalSent: 0,
    totalViews: 0,
    avgRating: 0,
    subscriberCount: 0,
  });
  const [newsletters, setNewsletters] = useState<Newsletter[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [topStocks, setTopStocks] = useState<TopicAnalysis[]>([]);
  const [topCategories, setTopCategories] = useState<TopicAnalysis[]>([]);
  const { toast } = useToast();

  const itemsPerPage = 10;

  useEffect(() => {
    loadNewsletterData();
    loadAnalytics();
  }, []);

  const loadNewsletterData = async () => {
    setLoading(true);
    try {
      // Fetch vinyl newsletters (completely separate from atomic briefings)
      const { data: newslettersData, error: newslettersError } = await supabase
        .from("vinyl_newsletters")
        .select(`
          id,
          title,
          created_at,
          tags,
          category
        `)
        .eq("published", true)
        .order("created_at", { ascending: false })
        .limit(100);

      if (newslettersError) throw newslettersError;

      // Fetch analytics for each newsletter
      const newslettersWithStats = await Promise.all(
        (newslettersData || []).map(async (newsletter) => {
          const { data: analytics } = await supabase
            .from("vinyl_newsletter_analytics")
            .select("*")
            .eq("newsletter_id", newsletter.id)
            .single();

          return {
            id: newsletter.id,
            title: newsletter.title,
            publication_date: newsletter.created_at,
            stocks_mentioned: newsletter.tags || [],
            views: analytics?.views || 0,
            sent_count: analytics?.beehiiv_sent_count || 0,
            avg_rating: 0, // No rating system for VINYL
          };
        })
      );

      setNewsletters(newslettersWithStats);

      // Calculate overall stats
      const totalSent = newslettersWithStats.reduce((sum, n) => sum + n.sent_count, 0);
      const totalViews = newslettersWithStats.reduce((sum, n) => sum + n.views, 0);

      setStats({
        totalSent,
        totalViews,
        avgRating: 0, // No ratings for VINYL
        subscriberCount: 0, // Would come from BEEHIIV
      });
    } catch (error: any) {
      toast({
        title: "Error Loading Data",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const loadAnalytics = async () => {
    try {
      // Analyze vinyl newsletters (separate from atomic)
      const { data: newslettersData } = await supabase
        .from("vinyl_newsletters")
        .select("tags, category")
        .eq("published", true)
        .limit(100);

      if (newslettersData) {
        // Count tag mentions
        const tagCounts: { [key: string]: number } = {};
        newslettersData.forEach((n) => {
          (n.tags || []).forEach((tag: string) => {
            tagCounts[tag] = (tagCounts[tag] || 0) + 1;
          });
        });

        const totalTags = Object.values(tagCounts).reduce((a, b) => a + b, 0);
        const topStocksData = Object.entries(tagCounts)
          .sort(([, a], [, b]) => b - a)
          .slice(0, 10)
          .map(([topic, count]) => ({
            topic,
            count,
            percentage: totalTags > 0 ? (count / totalTags) * 100 : 0,
          }));

        setTopStocks(topStocksData);

        // Count categories
        const categoryCounts: { [key: string]: number } = {};
        newslettersData.forEach((n) => {
          if (n.category) {
            categoryCounts[n.category] = (categoryCounts[n.category] || 0) + 1;
          }
        });

        const totalCategories = Object.values(categoryCounts).reduce((a, b) => a + b, 0);
        const topCategoriesData = Object.entries(categoryCounts)
          .sort(([, a], [, b]) => b - a)
          .map(([topic, count]) => ({
            topic,
            count,
            percentage: totalCategories > 0 ? (count / totalCategories) * 100 : 0,
          }));

        setTopCategories(topCategoriesData);
      }
    } catch (error) {
      console.error("Error loading analytics:", error);
    }
  };

  const filteredNewsletters = newsletters.filter(
    (newsletter) =>
      newsletter.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      newsletter.stocks_mentioned.some((stock) =>
        stock.toLowerCase().includes(searchTerm.toLowerCase())
      )
  );

  const paginatedNewsletters = filteredNewsletters.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const totalPages = Math.ceil(filteredNewsletters.length / itemsPerPage);

  return (
    <TraderProtection>
      <div className="min-h-screen bg-background p-4 sm:p-6 lg:p-8">
        <div className="max-w-7xl mx-auto space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button asChild variant="ghost" size="sm">
                <Link to="/trader" className="flex items-center space-x-2">
                  <ArrowLeft className="h-4 w-4" />
                  <span>Back to Dashboard</span>
                </Link>
              </Button>
            </div>
            <div className="flex items-center space-x-3">
              <Mail className="h-6 w-6 text-primary" />
              <h1 className="text-2xl font-semibold">Newsletter Reporting</h1>
            </div>
          </div>

          {/* KPI Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <Mail className="h-4 w-4 text-primary" />
                  Total Sent
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.totalSent}</div>
                <p className="text-xs text-muted-foreground">Newsletter deliveries</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <Eye className="h-4 w-4 text-blue-500" />
                  Total Views
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.totalViews}</div>
                <p className="text-xs text-muted-foreground">
                  {stats.totalSent > 0
                    ? `${((stats.totalViews / stats.totalSent) * 100).toFixed(1)}% open rate`
                    : "No data"}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-green-500" />
                  Avg Rating
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.avgRating.toFixed(1)}</div>
                <p className="text-xs text-muted-foreground">Out of 5.0</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <Users className="h-4 w-4 text-purple-500" />
                  Newsletters
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{newsletters.length}</div>
                <p className="text-xs text-muted-foreground">Total published</p>
              </CardContent>
            </Card>
          </div>

          {/* Analytics Section */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Top Stocks */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-primary" />
                  Top Mentioned Stocks
                </CardTitle>
                <CardDescription>Most frequently mentioned tickers</CardDescription>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[300px]">
                  <div className="space-y-2">
                    {topStocks.map((stock, index) => (
                      <div key={stock.topic} className="flex items-center justify-between p-2 border rounded-md">
                        <div className="flex items-center gap-3">
                          <Badge variant="outline" className="font-mono">
                            {index + 1}
                          </Badge>
                          <span className="font-medium">{stock.topic}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                          <span className="text-muted-foreground">{stock.count}x</span>
                          <Badge variant="secondary">{stock.percentage.toFixed(1)}%</Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>

            {/* Top Categories */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <BarChart3 className="h-5 w-5 text-primary" />
                  Category Distribution
                </CardTitle>
                <CardDescription>Newsletter topics breakdown</CardDescription>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[300px]">
                  <div className="space-y-2">
                    {topCategories.map((category, index) => (
                      <div key={category.topic} className="flex items-center justify-between p-2 border rounded-md">
                        <div className="flex items-center gap-3">
                          <Badge variant="outline">
                            {index + 1}
                          </Badge>
                          <span className="font-medium">{category.topic}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                          <span className="text-muted-foreground">{category.count}</span>
                          <Badge variant="secondary">{category.percentage.toFixed(1)}%</Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          </div>

          {/* Newsletter Table */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Recent Newsletters</CardTitle>
                  <CardDescription>Browse and search newsletter history</CardDescription>
                </div>
                <div className="relative w-64">
                  <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search newsletters..."
                    value={searchTerm}
                    onChange={(e) => {
                      setSearchTerm(e.target.value);
                      setCurrentPage(1);
                    }}
                    className="pl-8"
                  />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead>Title</TableHead>
                      <TableHead>Stocks</TableHead>
                      <TableHead className="text-center">Sent</TableHead>
                      <TableHead className="text-center">Views</TableHead>
                      <TableHead className="text-center">Rating</TableHead>
                      <TableHead className="text-center">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {loading ? (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                          Loading newsletters...
                        </TableCell>
                      </TableRow>
                    ) : paginatedNewsletters.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                          No newsletters found
                        </TableCell>
                      </TableRow>
                    ) : (
                      paginatedNewsletters.map((newsletter) => (
                        <TableRow key={newsletter.id}>
                          <TableCell className="font-medium">
                            {new Date(newsletter.publication_date).toLocaleDateString()}
                          </TableCell>
                          <TableCell>
                            <div className="max-w-md truncate">{newsletter.title}</div>
                          </TableCell>
                          <TableCell>
                            <div className="flex gap-1 flex-wrap max-w-xs">
                              {newsletter.stocks_mentioned.slice(0, 3).map((stock) => (
                                <Badge key={stock} variant="secondary" className="text-xs">
                                  {stock}
                                </Badge>
                              ))}
                              {newsletter.stocks_mentioned.length > 3 && (
                                <Badge variant="outline" className="text-xs">
                                  +{newsletter.stocks_mentioned.length - 3}
                                </Badge>
                              )}
                            </div>
                          </TableCell>
                          <TableCell className="text-center">
                            <Badge variant="outline">{newsletter.sent_count}</Badge>
                          </TableCell>
                          <TableCell className="text-center">
                            <Badge variant="outline">{newsletter.views}</Badge>
                          </TableCell>
                          <TableCell className="text-center">
                            {newsletter.avg_rating > 0 ? (
                              <Badge variant="default">
                                {newsletter.avg_rating.toFixed(1)} ⭐
                              </Badge>
                            ) : (
                              <span className="text-muted-foreground text-sm">-</span>
                            )}
                          </TableCell>
                          <TableCell className="text-center">
                            <Button 
                              asChild 
                              size="sm" 
                              variant="ghost"
                              className="h-7 px-2 text-xs"
                            >
                              <Link to={`/trader/newsletters/${newsletter.id}`}>
                                <Eye className="h-3 w-3 mr-1" />
                                View
                              </Link>
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between mt-4">
                  <div className="text-sm text-muted-foreground">
                    Showing {(currentPage - 1) * itemsPerPage + 1} to{" "}
                    {Math.min(currentPage * itemsPerPage, filteredNewsletters.length)} of{" "}
                    {filteredNewsletters.length} newsletters
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                      disabled={currentPage === 1}
                    >
                      <ChevronLeft className="h-4 w-4" />
                      Previous
                    </Button>
                    <div className="flex items-center gap-1">
                      {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                        const page = i + 1;
                        return (
                          <Button
                            key={page}
                            variant={currentPage === page ? "default" : "outline"}
                            size="sm"
                            onClick={() => setCurrentPage(page)}
                          >
                            {page}
                          </Button>
                        );
                      })}
                      {totalPages > 5 && <span className="px-2">...</span>}
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                      disabled={currentPage === totalPages}
                    >
                      Next
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </TraderProtection>
  );
};

export default TraderReporting;
