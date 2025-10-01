import { NavLink, useLocation } from "react-router-dom";
import { useState } from "react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  useSidebar,
} from "@/components/ui/sidebar";
import { Badge } from "@/components/ui/badge";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import {
  LayoutDashboard,
  FileText,
  Terminal,
  Target,
  BarChart3,
  TrendingUp,
  Briefcase,
  Settings,
  Crown,
  BookOpen,
  Shield,
  MessageSquare,
  Trophy,
  ChevronRight,
  Search,
  TrendingDown,
  Users,
  Info
} from "lucide-react";
import { useAuth } from "@/components/auth/AuthProvider";
import { useAdmin } from "@/hooks/useAdmin";
import { siteNavigation } from "@/data/sitemap";

const navigationItems = [
  {
    title: "Dashboard",
    url: "/dashboard",
    icon: LayoutDashboard,
    exact: true
  },
  {
    title: "Daily Stock Analytics",
    url: "/dashboard/top20",
    icon: Trophy,
  },
  {
    title: "Market Intelligence",
    url: "/dashboard/briefings",
    icon: FileText,
  },
  {
    title: "Paper Trading",
    url: "/dashboard/paper-trading",
    icon: Target,
  },
  {
    title: "Options Value Tool",
    url: "/dashboard/options-value-tool",
    icon: BarChart3,
  },
  {
    title: "Learning Progress",
    url: "/dashboard/progress",
    icon: BookOpen,
  },
  {
    title: "Community Forum",
    url: "/forum",
    icon: MessageSquare,
  },
  {
    title: "Settings",
    url: "/dashboard/settings",
    icon: Settings,
  },
];


export function DashboardSidebar() {
  const { state } = useSidebar();
  const location = useLocation();
  const { user } = useAuth();
  const { isAdmin } = useAdmin();
  const [openMenus, setOpenMenus] = useState<Record<string, boolean>>({});
  
  // Mock user tier - in real app, fetch from user profile
  const userTier = "free"; // "free", "essential", "pro"
  const isCollapsed = state === "collapsed";

  const toggleMenu = (menuTitle: string) => {
    setOpenMenus(prev => ({
      ...prev,
      [menuTitle]: !prev[menuTitle]
    }));
  };
  
  const isActive = (path: string, exact = false) => {
    if (exact) {
      return location.pathname === path;
    }
    return location.pathname.startsWith(path);
  };

  const getNavClassName = (path: string, exact = false) => {
    const active = isActive(path, exact);
    return active 
      ? "bg-gradient-primary text-white font-medium" 
      : "hover:bg-muted/50";
  };

  const getIconForNavItem = (title: string) => {
    switch (title) {
      case "Home":
        return LayoutDashboard;
      case "Research":
        return Search;
      case "Documentation":
        return BookOpen;
      case "Performance":
        return TrendingUp;
      case "About":
        return Info;
      default:
        return FileText;
    }
  };

  return (
    <Sidebar
      collapsible="icon"
    >
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel className={isCollapsed ? "sr-only" : ""}>
            Dashboard
          </SidebarGroupLabel>
          
          <SidebarGroupContent>
            <SidebarMenu>
              {navigationItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink 
                      to={item.url} 
                      className={getNavClassName(item.url, item.exact)}
                      end={item.exact}
                    >
                      <item.icon className="h-4 w-4" />
                      {!isCollapsed && (
                        <span>{item.title}</span>
                      )}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
              
              {/* Admin Dashboard Link - Only show for admin users */}
              {isAdmin && (
                <SidebarMenuItem>
                  <SidebarMenuButton asChild>
                    <NavLink 
                      to="/admin" 
                      className={getNavClassName("/admin")}
                    >
                      <Shield className="h-4 w-4" />
                      {!isCollapsed && (
                        <div className="flex items-center justify-between w-full">
                          <span>Admin Dashboard</span>
                          <Badge variant="secondary" className="text-xs px-1.5 py-0.5">
                            Admin
                          </Badge>
                        </div>
                      )}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              )}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Site Navigation with Submenus */}
        <SidebarGroup>
          <SidebarGroupLabel className={isCollapsed ? "sr-only" : ""}>
            Site Navigation
          </SidebarGroupLabel>
          
          <SidebarGroupContent>
            <SidebarMenu>
              {siteNavigation.map((item) => {
                const IconComponent = getIconForNavItem(item.title);
                const hasChildren = item.children && item.children.length > 0;
                const isMenuOpen = openMenus[item.title];
                
                return (
                  <SidebarMenuItem key={item.title}>
                    {hasChildren ? (
                      <Collapsible
                        open={isMenuOpen}
                        onOpenChange={() => toggleMenu(item.title)}
                      >
                        <CollapsibleTrigger asChild>
                          <SidebarMenuButton className={getNavClassName(item.href)}>
                            <IconComponent className="h-4 w-4" />
                            {!isCollapsed && (
                              <>
                                <span>{item.title}</span>
                                <ChevronRight className={`h-4 w-4 ml-auto transition-transform ${isMenuOpen ? 'rotate-90' : ''}`} />
                              </>
                            )}
                          </SidebarMenuButton>
                        </CollapsibleTrigger>
                        {!isCollapsed && (
                          <CollapsibleContent>
                            <SidebarMenuSub>
                              {item.children?.map((child) => (
                                <SidebarMenuSubItem key={child.href}>
                                  <SidebarMenuSubButton asChild>
                                    <NavLink 
                                      to={child.href}
                                      className={getNavClassName(child.href)}
                                    >
                                      <span>{child.title}</span>
                                    </NavLink>
                                  </SidebarMenuSubButton>
                                </SidebarMenuSubItem>
                              ))}
                            </SidebarMenuSub>
                          </CollapsibleContent>
                        )}
                      </Collapsible>
                    ) : (
                      <SidebarMenuButton asChild>
                        <NavLink 
                          to={item.href} 
                          className={getNavClassName(item.href)}
                        >
                          <IconComponent className="h-4 w-4" />
                          {!isCollapsed && (
                            <span>{item.title}</span>
                          )}
                        </NavLink>
                      </SidebarMenuButton>
                    )}
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Upgrade Section */}
        {!isCollapsed && userTier === "free" && (
          <SidebarGroup>
            <SidebarGroupContent>
              <div className="mx-2 p-3 bg-gradient-to-br from-primary/20 to-primary/10 rounded-lg border">
                <div className="flex items-center gap-2 mb-2">
                  <Crown className="h-4 w-4 text-primary" />
                  <span className="text-sm font-medium">Upgrade</span>
                </div>
                <p className="text-xs text-muted-foreground mb-3">
                  Unlock advanced features with Essential or Pro
                </p>
                <NavLink 
                  to="/dashboard/upgrade" 
                  className="block text-center bg-accent text-accent-foreground py-1.5 px-3 rounded text-xs font-medium hover:bg-accent/90 transition-colors"
                >
                  View Plans
                </NavLink>
              </div>
            </SidebarGroupContent>
          </SidebarGroup>
        )}

        {/* User Info */}
        {!isCollapsed && user && (
          <SidebarGroup>
            <SidebarGroupContent>
              <div className="mx-2 p-3 border rounded-lg">
                <div className="flex items-center gap-2 mb-1">
                  <div className="h-6 w-6 rounded-full bg-secondary/20 flex items-center justify-center">
                    <span className="text-xs font-medium">
                      {user.email?.[0]?.toUpperCase()}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">
                      {user.user_metadata?.full_name || "User"}
                    </p>
                  </div>
                </div>
                <Badge variant="outline" className="text-xs">
                  {userTier.charAt(0).toUpperCase() + userTier.slice(1)} Plan
                </Badge>
              </div>
            </SidebarGroupContent>
          </SidebarGroup>
        )}
      </SidebarContent>
    </Sidebar>
  );
}