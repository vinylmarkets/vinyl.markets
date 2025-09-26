import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { 
  BarChart3, 
  Users, 
  Brain, 
  FileText, 
  DollarSign, 
  Shield,
  ArrowRight,
  TrendingUp,
  AlertTriangle,
  Activity,
  Terminal,
  Briefcase,
  Edit3,
  Plus,
  Tag,
  Play,
  Clock,
  Sparkles,
  Images
} from "lucide-react";
import { toast } from "sonner";

interface AdminStats {
  totalUsers: number;
  activeUsers: number;
  totalRevenue: number;
  pendingFlags: number;
  systemHealth: string;
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [generatingPredictions, setGeneratingPredictions] = useState(false);

  useEffect(() => {
    fetchAdminStats();
  }, []);

  const fetchAdminStats = async () => {
    try {
      // Fetch key metrics for the overview
      const { data: metrics } = await supabase
        .from('daily_metrics')
        .select('*')
        .order('date', { ascending: false })
        .limit(1)
        .single();

      const { data: flags } = await supabase
        .from('content_flags')
        .select('id')
        .eq('reviewed', false);

      setStats({
        totalUsers: metrics?.total_users || 0,
        activeUsers: metrics?.active_users || 0,
        totalRevenue: metrics?.mrr || 0,
        pendingFlags: flags?.length || 0,
        systemHealth: 'Excellent'
      });
    } catch (error) {
      console.error('Error fetching admin stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const generateTodaysPredictions = async () => {
    setGeneratingPredictions(true);
    try {
      // Check if predictions already exist for today
      const today = new Date().toISOString().split('T')[0];
      const { data: existingPredictions } = await supabase
        .from('enhanced_daily_predictions')
        .select('id')
        .eq('prediction_date', today)
        .limit(1);

      if (existingPredictions && existingPredictions.length > 0) {
        toast.info('Predictions already exist for today');
        return;
      }

      // Call the edge function
      const { data, error } = await supabase.functions.invoke('morning-market-analysis', {
        body: { manual_trigger: true }
      });

      if (error) {
        console.error('Edge function error:', error);
        toast.error('Failed to generate predictions. Check logs for details.');
        return;
      }

      console.log('Prediction generation response:', data);
      
      if (data.success) {
        toast.success(`Successfully generated ${data.predictions_generated} predictions for today!`);
      } else {
        toast.error(data.message || 'Failed to generate predictions');
      }
    } catch (error) {
      console.error('Error generating predictions:', error);
      toast.error('Failed to generate predictions');
    } finally {
      setGeneratingPredictions(false);
    }
  };

  const dashboardSections = [
    {
      title: "Executive Overview",
      description: "High-level metrics, revenue trends, and key performance indicators",
      icon: BarChart3,
      href: "/admin/executive-overview",
      color: "text-purple-600",
      bgColor: "bg-purple-50",
      metrics: stats ? [
        { label: "Total Users", value: stats.totalUsers.toLocaleString() },
        { label: "MRR", value: `$${stats.totalRevenue.toLocaleString()}` }
      ] : []
    },
    {
      title: "User Analytics",
      description: "User behavior, signup trends, and engagement analysis",
      icon: Users,
      href: "/admin/user-analytics",
      color: "text-green-600",
      bgColor: "bg-green-50",
      metrics: stats ? [
        { label: "Active Users", value: stats.activeUsers.toLocaleString() },
        { label: "Growth", value: "+12.5%" }
      ] : []
    },
    {
      title: "Product Intelligence",
      description: "Feature adoption, user satisfaction, and product insights",
      icon: Brain,
      href: "/admin/product-intelligence",
      color: "text-purple-600",
      bgColor: "bg-purple-50",
      metrics: [
        { label: "Satisfaction", value: "4.3/5" },
        { label: "Feature Adoption", value: "76%" }
      ]
    },
    {
      title: "Content Performance",
      description: "Content analytics, engagement metrics, and topic trends",
      icon: FileText,
      href: "/admin/content-performance",
      color: "text-orange-600",
      bgColor: "bg-orange-50",
      metrics: [
        { label: "Avg Rating", value: "4.2/5" },
        { label: "Read Time", value: "4.4 min" }
      ]
    },
    {
      title: "Business Metrics",
      description: "Financial tracking, conversion funnels, and system performance",
      icon: DollarSign,
      href: "/admin/business-metrics",
      color: "text-emerald-600",
      bgColor: "bg-emerald-50",
      metrics: [
        { label: "LTV:CAC", value: "14.7:1" },
        { label: "Conversion", value: "3.2%" }
      ]
    },
    {
      title: "Algorithm Performance",
      description: "Algorithm accuracy metrics, signal analysis, and optimization recommendations",
      icon: Brain,
      href: "/admin/algorithm-performance",
      color: "text-indigo-600",
      bgColor: "bg-indigo-50",
      metrics: [
        { label: "Accuracy", value: "73.2%" },
        { label: "Confidence", value: "82%" }
      ]
    },
    {
      title: "Compliance Monitoring",
      description: "Risk management, content flags, and regulatory compliance",
      icon: Shield,
      href: "/admin/compliance-monitoring",
      color: "text-red-600",
      bgColor: "bg-red-50",
      metrics: stats ? [
        { label: "Pending Flags", value: stats.pendingFlags.toString() },
        { label: "Compliance", value: "98%" }
      ] : []
    },
    {
      title: "Image Generator",
      description: "AI-powered image generation for homepage and landing pages",
      icon: Sparkles,
      href: "/admin/image-generator",
      color: "text-purple-600",
      bgColor: "bg-purple-50",
      metrics: [
        { label: "Generate", value: "New Images" },
        { label: "AI Powered", value: "GPT-4" }
      ]
    },
    {
      title: "Image Library",
      description: "Manage and organize your generated images and assets",
      icon: Images,
      href: "/admin/image-library",  
      color: "text-green-600",
      bgColor: "bg-green-50",
      metrics: [
        { label: "Browse", value: "All Images" },
        { label: "Download", value: "& Share" }
      ]
    }
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-muted/30 flex items-center justify-center">
        <div className="text-center">
          <Activity className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p>Loading admin dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-muted/30">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
              <p className="text-muted-foreground mt-2">
                Comprehensive business intelligence and analytics platform
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <Badge variant="secondary" className="px-3 py-1">
                <Activity className="h-3 w-3 mr-1" />
                System: {stats?.systemHealth}
              </Badge>
              <Badge variant="outline">
                Last updated: {new Date().toLocaleTimeString()}
              </Badge>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Stats Bar */}
      {stats && (
        <div className="bg-white border-b">
          <div className="max-w-7xl mx-auto px-6 py-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">{stats.totalUsers.toLocaleString()}</div>
                <div className="text-sm text-muted-foreground">Total Users</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">{stats.activeUsers.toLocaleString()}</div>
                <div className="text-sm text-muted-foreground">Active Users</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-emerald-600">${stats.totalRevenue.toLocaleString()}</div>
                <div className="text-sm text-muted-foreground">Monthly Revenue</div>
              </div>
              <div className="text-center">
                <div className={`text-2xl font-bold ${stats.pendingFlags > 0 ? 'text-red-600' : 'text-green-600'}`}>
                  {stats.pendingFlags}
                </div>
                <div className="text-sm text-muted-foreground">Pending Flags</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Dashboard Sections */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {dashboardSections.map((section) => {
            const IconComponent = section.icon;
            return (
              <Card key={section.title} className="group hover:shadow-lg transition-all duration-200 border-2 hover:border-primary/20">
                <CardHeader className="pb-4">
                  <div className="flex items-center justify-between">
                    <div className={`p-3 rounded-lg ${section.bgColor}`}>
                      <IconComponent className={`h-6 w-6 ${section.color}`} />
                    </div>
                    <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
                  </div>
                  <CardTitle className="text-xl">{section.title}</CardTitle>
                  <CardDescription className="text-sm leading-relaxed">
                    {section.description}
                  </CardDescription>
                </CardHeader>
                
                <CardContent className="pt-0">
                  {section.metrics.length > 0 && (
                    <div className="grid grid-cols-2 gap-4 mb-4">
                      {section.metrics.map((metric, index) => (
                        <div key={index} className="text-center p-2 bg-muted/50 rounded">
                          <div className="font-semibold text-sm">{metric.value}</div>
                          <div className="text-xs text-muted-foreground">{metric.label}</div>
                        </div>
                      ))}
                    </div>
                  )}
                  
                  <Link to={section.href}>
                    <Button className="w-full group-hover:bg-primary/90 transition-colors">
                      View Dashboard
                      <TrendingUp className="h-4 w-4 ml-2" />
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* System Status */}
        <div className="mt-8">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Shield className="h-5 w-5 mr-2" />
                System Status
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg">
                  <div>
                    <div className="font-medium">API Performance</div>
                    <div className="text-sm text-muted-foreground">Response time: 245ms</div>
                  </div>
                  <Badge variant="default" className="bg-green-600">Good</Badge>
                </div>
                
                <div className="flex items-center justify-between p-4 bg-purple-50 rounded-lg">
                  <div>
                    <div className="font-medium">Database Health</div>
                    <div className="text-sm text-muted-foreground">Uptime: 99.9%</div>
                  </div>
                  <Badge variant="default" className="bg-purple-600">Excellent</Badge>
                </div>
                
                <div className="flex items-center justify-between p-4 bg-yellow-50 rounded-lg">
                  <div>
                    <div className="font-medium">Security Status</div>
                    <div className="text-sm text-muted-foreground">
                      {stats?.pendingFlags || 0} items need review
                    </div>
                  </div>
                  <Badge variant={stats?.pendingFlags === 0 ? "default" : "secondary"} 
                         className={stats?.pendingFlags === 0 ? "bg-green-600" : "bg-yellow-600"}>
                    {stats?.pendingFlags === 0 ? "Secure" : "Review Needed"}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Phase 2 Products */}
        <div className="mt-8">
          <h2 className="text-xl font-semibold mb-4">Phase 2 Products</h2>
          <p className="text-muted-foreground mb-4">Features in development for future release</p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Link to="/dashboard/terminal">
              <Button variant="outline" className="w-full justify-start">
                <Terminal className="h-4 w-4 mr-2" />
                Analytics Terminal
              </Button>
            </Link>
            <Link to="/dashboard/charts">
              <Button variant="outline" className="w-full justify-start">
                <TrendingUp className="h-4 w-4 mr-2" />
                Charts & Analytics
              </Button>
            </Link>
            <Link to="/dashboard/portfolio">
              <Button variant="outline" className="w-full justify-start">
                <Briefcase className="h-4 w-4 mr-2" />
                Portfolio
              </Button>
            </Link>
          </div>
        </div>

        {/* Prediction Management */}
        <div className="mt-8">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Brain className="h-5 w-5 mr-2" />
                Daily Predictions Management
              </CardTitle>
              <CardDescription>
                Generate and manage daily stock predictions using AI algorithms
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg">
                <div>
                  <div className="font-medium">Today's Predictions</div>
                  <div className="text-sm text-muted-foreground">
                    Generate new predictions for {new Date().toLocaleDateString()}
                  </div>
                </div>
                <Button 
                  onClick={generateTodaysPredictions} 
                  disabled={generatingPredictions}
                  className="ml-4"
                >
                  {generatingPredictions ? (
                    <>
                      <Activity className="h-4 w-4 mr-2 animate-spin" />
                      Generating...
                    </>
                  ) : (
                    <>
                      <Play className="h-4 w-4 mr-2" />
                      Generate Now
                    </>
                  )}
                </Button>
              </div>
              <div className="mt-4 text-sm text-muted-foreground">
                <div className="flex items-center">
                  <Clock className="h-4 w-4 mr-2" />
                  Automatic generation: Daily at 6:00 AM EST
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="mt-8">
          <h2 className="text-xl font-semibold mb-4">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Link to="/admin/blog">
              <Button variant="outline" className="w-full justify-start">
                <Edit3 className="h-4 w-4 mr-2" />
                Manage Blog
              </Button>
            </Link>
            <Link to="/admin/compliance-monitoring">
              <Button variant="outline" className="w-full justify-start">
                <AlertTriangle className="h-4 w-4 mr-2" />
                Review Flags
              </Button>
            </Link>
            <Link to="/admin/user-analytics">
              <Button variant="outline" className="w-full justify-start">
                <Users className="h-4 w-4 mr-2" />
                User Reports
              </Button>
            </Link>
            <Link to="/admin/business-metrics">
              <Button variant="outline" className="w-full justify-start">
                <DollarSign className="h-4 w-4 mr-2" />
                Revenue Analysis
              </Button>
            </Link>
          </div>
        </div>

        {/* Blog Management Section */}
        <div className="mt-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold">Blog Management</h2>
            <Link to="/admin/blog/new">
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Create New Article
              </Button>
            </Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Link to="/admin/blog">
              <Button variant="outline" className="w-full justify-start h-auto p-4">
                <div className="text-left">
                  <div className="flex items-center">
                    <FileText className="h-4 w-4 mr-2" />
                    All Articles
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">View and manage all blog posts</p>
                </div>
              </Button>
            </Link>
            <Link to="/admin/blog/categories">
              <Button variant="outline" className="w-full justify-start h-auto p-4">
                <div className="text-left">
                  <div className="flex items-center">
                    <Tag className="h-4 w-4 mr-2" />
                    Categories
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">Manage blog categories</p>
                </div>
              </Button>
            </Link>
            <Link to="/admin/content-performance">
              <Button variant="outline" className="w-full justify-start h-auto p-4">
                <div className="text-left">
                  <div className="flex items-center">
                    <BarChart3 className="h-4 w-4 mr-2" />
                    Analytics
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">Content performance metrics</p>
                </div>
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}