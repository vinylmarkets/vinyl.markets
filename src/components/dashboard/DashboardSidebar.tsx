import { NavLink, useLocation } from "react-router-dom";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import { Badge } from "@/components/ui/badge";
import {
  LayoutDashboard,
  FileText,
  Terminal,
  TrendingUp,
  Briefcase,
  Settings,
  Crown,
  BookOpen,
  Shield,
  MessageSquare
} from "lucide-react";
import { useAuth } from "@/components/auth/AuthProvider";
import { useAdmin } from "@/hooks/useAdmin";

const navigationItems = [
  {
    title: "Dashboard",
    url: "/dashboard",
    icon: LayoutDashboard,
    exact: true
  },
  {
    title: "Market Intelligence",
    url: "/dashboard/briefings",
    icon: FileText,
  },
  {
    title: "Ask TubeAmp",
    url: "/dashboard/terminal",
    icon: Terminal,
  },
  {
    title: "Charts & Analytics",
    url: "/dashboard/charts",
    icon: TrendingUp,
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
    title: "Portfolio",
    url: "/dashboard/portfolio",
    icon: Briefcase,
    premium: true
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
  
  // Mock user tier - in real app, fetch from user profile
  const userTier = "free"; // "free", "essential", "pro"
  const isCollapsed = state === "collapsed";
  
  const isActive = (path: string, exact = false) => {
    if (exact) {
      return location.pathname === path;
    }
    return location.pathname.startsWith(path);
  };

  const getNavClassName = (path: string, exact = false) => {
    const active = isActive(path, exact);
    return active 
      ? "bg-secondary text-secondary-foreground font-medium" 
      : "hover:bg-muted/50";
  };

  return (
    <Sidebar
      collapsible="icon"
    >
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel className={isCollapsed ? "sr-only" : ""}>
            Navigation
          </SidebarGroupLabel>
          
          <SidebarGroupContent>
            <SidebarMenu>
              {navigationItems.map((item) => {
                const isDisabled = item.premium && userTier === "free";
                
                return (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild disabled={isDisabled}>
                      <NavLink 
                        to={isDisabled ? "#" : item.url} 
                        className={getNavClassName(item.url, item.exact)}
                        end={item.exact}
                      >
                        <item.icon className="h-4 w-4" />
                        {!isCollapsed && (
                          <div className="flex items-center justify-between w-full">
                            <span className={isDisabled ? "text-muted-foreground" : ""}>
                              {item.title}
                            </span>
                            {item.premium && userTier === "free" && (
                              <Crown className="h-3 w-3 text-yellow-500" />
                            )}
                          </div>
                        )}
                      </NavLink>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
              
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

        {/* Upgrade Section */}
        {!isCollapsed && userTier === "free" && (
          <SidebarGroup>
            <SidebarGroupContent>
              <div className="mx-2 p-3 bg-gradient-to-br from-secondary/20 to-secondary/10 rounded-lg border">
                <div className="flex items-center gap-2 mb-2">
                  <Crown className="h-4 w-4 text-yellow-500" />
                  <span className="text-sm font-medium">Upgrade</span>
                </div>
                <p className="text-xs text-muted-foreground mb-3">
                  Unlock advanced features with Essential or Pro
                </p>
                <NavLink 
                  to="/dashboard/upgrade" 
                  className="block text-center bg-secondary text-secondary-foreground py-1.5 px-3 rounded text-xs font-medium hover:bg-secondary/90 transition-colors"
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