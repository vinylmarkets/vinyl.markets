import React, { useState, useEffect } from "react";
import { NavLink, useLocation } from "react-router-dom";
import {
  Home,
  Music,
  TrendingUp,
  Briefcase,
  ClipboardList,
  Search,
  Bell,
  BarChart3,
  Rewind,
  Plug,
  Key,
  Settings,
  HelpCircle,
  Wrench,
  Activity,
  TestTube,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Badge } from "@/components/ui/badge";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";

interface MenuItem {
  label: string;
  icon: React.ElementType;
  path: string;
  comingSoon?: boolean;
  badge?: string;
}

interface MenuGroup {
  label: string;
  items: MenuItem[];
  defaultOpen?: boolean;
}

const SIDEBAR_STATE_KEY = "vinyl-sidebar-expanded";

const menuGroups: MenuGroup[] = [
  {
    label: "TRADING",
    items: [
      { label: "Dashboard", icon: Home, path: "/trader" },
      { label: "Amps", icon: Music, path: "/trader/amps" },
      { label: "Performance", icon: TrendingUp, path: "/trader/performance" },
      { label: "Positions", icon: Briefcase, path: "/trader/positions", comingSoon: true },
      { label: "Orders", icon: ClipboardList, path: "/trader/orders", comingSoon: true },
    ],
  },
  {
    label: "TOOLS",
    items: [
      { label: "Research", icon: Search, path: "/trader/research", comingSoon: true },
      { label: "Alerts", icon: Bell, path: "/trader/alerts" },
      { label: "Reports", icon: BarChart3, path: "/trader/reporting" },
      { label: "Backtesting", icon: Rewind, path: "/trader/backtesting", comingSoon: true },
    ],
  },
  {
    label: "PLATFORM",
    items: [
      { label: "Integrations", icon: Plug, path: "/trader/integrations" },
      { label: "API Keys", icon: Key, path: "/trader/api-keys" },
      { label: "Settings", icon: Settings, path: "/trader/settings" },
      { label: "Help", icon: HelpCircle, path: "/trader/help" },
    ],
  },
  {
    label: "ADVANCED",
    defaultOpen: false,
    items: [
      { label: "Diagnostics", icon: Wrench, path: "/trader/diagnostics" },
      { label: "Troubleshooting", icon: Activity, path: "/trader/troubleshooting" },
      { label: "Testing", icon: TestTube, path: "/trader/testing" },
    ],
  },
];

interface SidebarProps {
  onComingSoonClick: (feature: string) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ onComingSoonClick }) => {
  const [isExpanded, setIsExpanded] = useState(() => {
    const saved = localStorage.getItem(SIDEBAR_STATE_KEY);
    return saved ? JSON.parse(saved) : false;
  });
  const [advancedOpen, setAdvancedOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    localStorage.setItem(SIDEBAR_STATE_KEY, JSON.stringify(isExpanded));
  }, [isExpanded]);

  const toggleSidebar = () => {
    setIsExpanded(!isExpanded);
  };

  const isActivePath = (path: string) => {
    return location.pathname === path;
  };

  const handleMenuClick = (item: MenuItem, e: React.MouseEvent) => {
    if (item.comingSoon) {
      e.preventDefault();
      onComingSoonClick(item.label);
    }
  };

  return (
    <TooltipProvider delayDuration={300}>
      <aside
        className={cn(
          "fixed left-0 top-0 h-full bg-[#1a1a1a] border-r border-border/50 z-40 transition-all duration-200 flex flex-col",
          isExpanded ? "w-60" : "w-16"
        )}
      >
        {/* Menu Groups */}
        <nav className="flex-1 overflow-y-auto overflow-x-hidden py-4 scrollbar-thin scrollbar-thumb-border scrollbar-track-transparent">
          <div className="space-y-6">
            {menuGroups.map((group, groupIndex) => {
              const isAdvancedGroup = group.label === "ADVANCED";
              const GroupWrapper = isAdvancedGroup ? Collapsible : "div";
              const groupProps = isAdvancedGroup
                ? { open: advancedOpen, onOpenChange: setAdvancedOpen }
                : {};

              return (
                <GroupWrapper key={group.label} {...groupProps}>
                  {/* Group Header */}
                  {isExpanded && (
                    isAdvancedGroup ? (
                      <CollapsibleTrigger className="w-full px-4 mb-2 flex items-center justify-between group">
                        <span className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">
                          {group.label}
                        </span>
                        <ChevronRight
                          className={cn(
                            "h-3 w-3 text-muted-foreground transition-transform",
                            advancedOpen && "rotate-90"
                          )}
                        />
                      </CollapsibleTrigger>
                    ) : (
                      <div className="px-4 mb-2">
                        <span className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">
                          {group.label}
                        </span>
                      </div>
                    )
                  )}

                  {/* Menu Items */}
                  {isAdvancedGroup ? (
                    <CollapsibleContent className="space-y-1">
                      {group.items.map((item) => {
                        const Icon = item.icon;
                        const isActive = isActivePath(item.path);
                        const itemContent = (
                          <NavLink
                            to={item.path}
                            onClick={(e) => handleMenuClick(item, e)}
                            className={cn(
                              "flex items-center gap-3 px-4 py-2.5 text-sm font-medium transition-all relative group",
                              "hover:bg-accent/50",
                              isActive && "bg-accent text-primary",
                              !isActive && "text-muted-foreground hover:text-foreground",
                              item.comingSoon && "opacity-70 cursor-not-allowed",
                              !isExpanded && "justify-center"
                            )}
                          >
                            {/* Active indicator bar */}
                            {isActive && (
                              <div className="absolute left-0 top-0 bottom-0 w-1 bg-primary rounded-r" />
                            )}

                            <Icon
                              className={cn(
                                "h-5 w-5 flex-shrink-0",
                                isActive && "text-primary"
                              )}
                            />

                            {isExpanded && (
                              <>
                                <span className="flex-1">{item.label}</span>
                                {item.comingSoon && (
                                  <Badge
                                    variant="secondary"
                                    className="text-[10px] px-1.5 py-0 h-5"
                                  >
                                    Soon
                                  </Badge>
                                )}
                              </>
                            )}
                          </NavLink>
                        );

                        return (
                          <div key={item.path}>
                            {!isExpanded ? (
                              <Tooltip>
                                <TooltipTrigger asChild>{itemContent}</TooltipTrigger>
                                <TooltipContent side="right" className="flex items-center gap-2">
                                  <span>{item.label}</span>
                                  {item.comingSoon && (
                                    <Badge variant="secondary" className="text-[10px]">
                                      Soon
                                    </Badge>
                                  )}
                                </TooltipContent>
                              </Tooltip>
                            ) : (
                              itemContent
                            )}
                          </div>
                        );
                      })}
                    </CollapsibleContent>
                  ) : (
                    <div className="space-y-1">
                      {group.items.map((item) => {
                        const Icon = item.icon;
                        const isActive = isActivePath(item.path);
                        const itemContent = (
                          <NavLink
                            to={item.path}
                            onClick={(e) => handleMenuClick(item, e)}
                            className={cn(
                              "flex items-center gap-3 px-4 py-2.5 text-sm font-medium transition-all relative group",
                              "hover:bg-accent/50",
                              isActive && "bg-accent text-primary",
                              !isActive && "text-muted-foreground hover:text-foreground",
                              item.comingSoon && "opacity-70 cursor-not-allowed",
                              !isExpanded && "justify-center"
                            )}
                          >
                            {/* Active indicator bar */}
                            {isActive && (
                              <div className="absolute left-0 top-0 bottom-0 w-1 bg-primary rounded-r" />
                            )}

                            <Icon
                              className={cn(
                                "h-5 w-5 flex-shrink-0",
                                isActive && "text-primary"
                              )}
                            />

                            {isExpanded && (
                              <>
                                <span className="flex-1">{item.label}</span>
                                {item.comingSoon && (
                                  <Badge
                                    variant="secondary"
                                    className="text-[10px] px-1.5 py-0 h-5"
                                  >
                                    Soon
                                  </Badge>
                                )}
                              </>
                            )}
                          </NavLink>
                        );

                        return (
                          <div key={item.path}>
                            {!isExpanded ? (
                              <Tooltip>
                                <TooltipTrigger asChild>{itemContent}</TooltipTrigger>
                                <TooltipContent side="right" className="flex items-center gap-2">
                                  <span>{item.label}</span>
                                  {item.comingSoon && (
                                    <Badge variant="secondary" className="text-[10px]">
                                      Soon
                                    </Badge>
                                  )}
                                </TooltipContent>
                              </Tooltip>
                            ) : (
                              itemContent
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}

                  {/* Divider between groups */}
                  {groupIndex < menuGroups.length - 1 && (
                    <div className="mx-4 my-4 border-t border-border/50" />
                  )}
                </GroupWrapper>
              );
            })}
          </div>
        </nav>

        {/* Toggle Button */}
        <div className="p-4 border-t border-border/50">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                onClick={toggleSidebar}
                className="w-full"
              >
                {isExpanded ? (
                  <ChevronLeft className="h-5 w-5" />
                ) : (
                  <ChevronRight className="h-5 w-5" />
                )}
              </Button>
            </TooltipTrigger>
            <TooltipContent side="right">
              {isExpanded ? "Collapse menu" : "Expand menu"}
            </TooltipContent>
          </Tooltip>
        </div>
      </aside>
    </TooltipProvider>
  );
};
