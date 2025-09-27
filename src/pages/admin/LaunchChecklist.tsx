import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  CheckCircle2, 
  XCircle, 
  Plus, 
  Edit3, 
  FileText, 
  Layout, 
  Gavel,
  Users,
  Globe,
  Shield,
  Activity,
  ArrowLeft,
  RefreshCw
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface LaunchChecklistPage {
  id: string;
  page_name: string;
  page_path: string | null;
  page_section: string;
  functionality_status: string;
  copy_status: string; 
  layout_status: string;
  compliance_status: string;
  notes: string | null;
  sort_order: number;
  updated_at: string;
}

interface StatusCounts {
  total: number;
  ready: number;
  notReady: number;
}

const statusColors = {
  'Ready': 'bg-success text-success-foreground',
  'Not Ready': 'bg-destructive text-destructive-foreground'
};

const statusIcons = {
  'Ready': CheckCircle2,
  'Not Ready': XCircle
};

const sectionIcons = {
  'Public': Globe,
  'User Area': Users, 
  'Admin': Shield
};

export default function LaunchChecklist() {
  const [pages, setPages] = useState<LaunchChecklistPage[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedSection, setSelectedSection] = useState<string>('all');
  const { toast } = useToast();

  useEffect(() => {
    loadPages();
    initializePages();
  }, []);

  const loadPages = async () => {
    try {
      const { data, error } = await supabase
        .from('launch_checklist_pages')
        .select('*')
        .order('page_section, sort_order');

      if (error) throw error;
      setPages(data || []);
    } catch (error: any) {
      toast({
        title: "Error loading pages",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const initializePages = async () => {
    // Check if pages already exist
    const { count } = await supabase
      .from('launch_checklist_pages')
      .select('*', { count: 'exact', head: true });

    if (count && count > 0) return;

    // Initialize with pages from PDF specification
    const initialPages = [
      // Public Section
      { name: 'Landing Page', path: '/', section: 'Public', order: 1 },
      { name: 'About', path: '/about', section: 'Public', order: 2 },
      { name: 'Mission', path: '/mission', section: 'Public', order: 3 },
      { name: 'Transparency', path: '/transparency', section: 'Public', order: 4 },
      { name: 'Pricing', path: '/pricing', section: 'Public', order: 5 },
      { name: 'Features', path: '/features', section: 'Public', order: 6 },
      { name: 'Intelligence Briefings', path: '/briefings', section: 'Public', order: 7 },
      { name: 'Ask AtomicMarket', path: '/ask', section: 'Public', order: 8 },
      { name: 'Market Monitor', path: '/monitor', section: 'Public', order: 9 },
      { name: 'Blog', path: '/blog', section: 'Public', order: 10 },
      { name: 'Blog Archive', path: '/blog/archive', section: 'Public', order: 11 },
      { name: 'Legal', path: '/legal', section: 'Public', order: 12 },
      { name: 'Terms of Service', path: '/terms', section: 'Public', order: 13 },
      { name: 'Privacy Policy', path: '/privacy', section: 'Public', order: 14 },
      { name: 'Contact', path: '/contact', section: 'Public', order: 15 },
      { name: 'FAQ', path: '/faq', section: 'Public', order: 16 },
      { name: 'Sign Up Flow', path: '/auth', section: 'Public', order: 17 },
      { name: 'Sign In Flow', path: '/auth', section: 'Public', order: 18 },
      { name: 'Error Pages (404, 500)', path: '/404', section: 'Public', order: 19 },
      
      // User Area
      { name: 'Dashboard', path: '/dashboard', section: 'User Area', order: 1 },
      { name: "Today's Briefings", path: '/dashboard/briefings', section: 'User Area', order: 2 },
      { name: 'Briefing Archive', path: '/dashboard/briefings/archive', section: 'User Area', order: 3 },
      { name: 'Single Briefing View', path: '/dashboard/briefings/:id', section: 'User Area', order: 4 },
      { name: 'Ask AtomicMarket Terminal', path: '/dashboard/terminal', section: 'User Area', order: 5 },
      { name: 'Market Monitor', path: '/dashboard/charts', section: 'User Area', order: 6 },
      { name: 'Portfolio', path: '/dashboard/portfolio', section: 'User Area', order: 7 },
      { name: 'Settings', path: '/dashboard/settings', section: 'User Area', order: 8 },
      { name: 'Top 20 Predictions', path: '/dashboard/predictions', section: 'User Area', order: 9 },
      { name: 'Paper Trading', path: '/dashboard/paper-trading', section: 'User Area', order: 10 },
      
      // Admin Section
      { name: 'Admin Dashboard', path: '/admin', section: 'Admin', order: 1 },
      { name: 'Blog Management', path: '/admin/blog', section: 'Admin', order: 2 },
      { name: 'User Analytics', path: '/admin/users', section: 'Admin', order: 3 },
      { name: 'Business Metrics', path: '/admin/metrics', section: 'Admin', order: 4 },
      { name: 'Algorithm Performance', path: '/admin/performance', section: 'Admin', order: 5 },
      { name: 'Content Performance', path: '/admin/content', section: 'Admin', order: 6 },
      { name: 'Image Generator', path: '/admin/image-generator', section: 'Admin', order: 7 },
      { name: 'Image Library', path: '/admin/image-library', section: 'Admin', order: 8 },
      { name: 'Launch Checklist', path: '/admin/launch-checklist', section: 'Admin', order: 9 },
    ];

    try {
      const { error } = await supabase
        .from('launch_checklist_pages')
        .insert(
          initialPages.map(page => ({
            page_name: page.name,
            page_path: page.path,
            page_section: page.section,
            sort_order: page.order
          }))
        );

      if (error) throw error;
      loadPages();
    } catch (error: any) {
      toast({
        title: "Error initializing pages",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  const updatePageStatus = async (
    pageId: string, 
    field: string, 
    value: 'Ready' | 'Not Ready'
  ) => {
    try {
      const { error } = await supabase
        .from('launch_checklist_pages')
        .update({ [field]: value })
        .eq('id', pageId);

      if (error) throw error;
      
      // Log the activity
      await supabase
        .from('launch_checklist_activity')
        .insert({
          page_id: pageId,
          action_type: 'status_update',
          field_changed: field,
          new_value: value
        });

      loadPages();
      toast({
        title: "Status updated",
        description: `${field.replace('_', ' ')} status updated to ${value}`,
      });
    } catch (error: any) {
      toast({
        title: "Error updating status",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  const getStatusCounts = (category: string): StatusCounts => {
    const filteredPages = selectedSection === 'all' 
      ? pages 
      : pages.filter(p => p.page_section === selectedSection);
    
    const field = `${category}_status` as keyof LaunchChecklistPage;
    const ready = filteredPages.filter(p => p[field] === 'Ready').length;
    const total = filteredPages.length;
    
    return {
      total,
      ready,
      notReady: total - ready
    };
  };

  const getOverallProgress = (): number => {
    const filteredPages = selectedSection === 'all' 
      ? pages 
      : pages.filter(p => p.page_section === selectedSection);
    
    if (filteredPages.length === 0) return 0;
    
    const totalChecks = filteredPages.length * 4; // 4 categories per page
    const completedChecks = filteredPages.reduce((acc, page) => {
      return acc + 
        (page.functionality_status === 'Ready' ? 1 : 0) +
        (page.copy_status === 'Ready' ? 1 : 0) +
        (page.layout_status === 'Ready' ? 1 : 0) +
        (page.compliance_status === 'Ready' ? 1 : 0);
    }, 0);
    
    return Math.round((completedChecks / totalChecks) * 100);
  };

  const filteredPages = selectedSection === 'all' 
    ? pages 
    : pages.filter(p => p.page_section === selectedSection);

  const sections = ['Public', 'User Area', 'Admin'];
  const categories = [
    { key: 'functionality', label: 'Functionality', icon: Activity },
    { key: 'copy', label: 'Copy', icon: FileText },
    { key: 'layout', label: 'Layout', icon: Layout },
    { key: 'compliance', label: 'Compliance', icon: Gavel }
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Launch Checklist</h1>
          <p className="text-muted-foreground">Track beta launch readiness across all platform pages</p>
        </div>
        <div className="flex items-center gap-4">
          <Button variant="outline" size="sm" onClick={loadPages} disabled={loading}>
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Badge variant="secondary" className="text-lg px-4 py-2">
            {getOverallProgress()}% Complete
          </Badge>
          <Button variant="outline" asChild>
            <Link to="/admin">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Admin Dashboard
            </Link>
          </Button>
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        {categories.map((category) => {
          const counts = getStatusCounts(category.key);
          const Icon = category.icon;
          return (
            <Card key={category.key}>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <Icon className="h-5 w-5 text-muted-foreground" />
                  <div className="flex-1">
                    <p className="font-medium">{category.label}</p>
                    <div className="flex gap-2 mt-1">
                      <Badge variant="secondary" className="text-xs">
                        {counts.ready}/{counts.total} Ready
                      </Badge>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Section Tabs */}
      <Tabs value={selectedSection} onValueChange={setSelectedSection}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="all">All Sections</TabsTrigger>
          {sections.map((section) => {
            const Icon = sectionIcons[section as keyof typeof sectionIcons];
            const sectionPages = pages.filter(p => p.page_section === section);
            return (
              <TabsTrigger key={section} value={section}>
                <Icon className="h-4 w-4 mr-2" />
                {section} ({sectionPages.length})
              </TabsTrigger>
            );
          })}
        </TabsList>

        <TabsContent value={selectedSection} className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                {selectedSection === 'all' ? 'All Pages' : selectedSection}
                <Badge variant="outline">{filteredPages.length} pages</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {filteredPages.map((page) => (
                  <div key={page.id} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <h3 className="font-medium">{page.page_name}</h3>
                        {page.page_path && (
                          <p className="text-sm text-muted-foreground">{page.page_path}</p>
                        )}
                      </div>
                      <Badge variant="outline">{page.page_section}</Badge>
                    </div>
                    
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                      {categories.map((category) => {
                        const status = page[`${category.key}_status` as keyof LaunchChecklistPage] as string;
                        const Icon = statusIcons[status as keyof typeof statusIcons];
                        
                        return (
                          <Button
                            key={category.key}
                            variant="ghost"
                            size="sm"
                            className={`justify-start gap-2 h-auto py-2 ${statusColors[status as keyof typeof statusColors]}`}
                            onClick={() => updatePageStatus(
                              page.id,
                              `${category.key}_status`,
                              status === 'Ready' ? 'Not Ready' : 'Ready'
                            )}
                          >
                            <Icon className="h-4 w-4" />
                            <div className="text-left">
                              <p className="text-xs font-medium">{category.label}</p>
                              <p className="text-xs opacity-75">{status}</p>
                            </div>
                          </Button>
                        );
                      })}
                    </div>
                    
                    {page.notes && (
                      <div className="mt-3 p-2 bg-muted rounded text-sm">
                        {page.notes}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}