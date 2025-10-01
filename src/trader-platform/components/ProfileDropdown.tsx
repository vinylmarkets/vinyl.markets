import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { 
  ChevronDown, 
  Settings, 
  Link as LinkIcon, 
  Sun, 
  Moon, 
  BarChart3,
  Brain,
  Bell,
  Key,
  HelpCircle,
  LogOut,
  AlertCircle,
  FileText,
  Mail,
  Activity,
  Network,
  ChevronRight,
  Lightbulb
} from "lucide-react";
import { useAuth } from "@/components/auth/AuthProvider";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export const ProfileDropdown = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [theme, setTheme] = useState<'light' | 'dark' | 'auto'>('auto');

  useEffect(() => {
    // Load theme preference from localStorage
    const savedTheme = localStorage.getItem('trader-theme') as 'light' | 'dark' | 'auto' || 'auto';
    setTheme(savedTheme);
    applyTheme(savedTheme);
  }, []);

  const applyTheme = (newTheme: 'light' | 'dark' | 'auto') => {
    const root = document.documentElement;
    
    if (newTheme === 'auto') {
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      root.classList.toggle('dark', prefersDark);
    } else {
      root.classList.toggle('dark', newTheme === 'dark');
    }
    
    localStorage.setItem('trader-theme', newTheme);
  };

  const toggleTheme = () => {
    const nextTheme = theme === 'light' ? 'dark' : theme === 'dark' ? 'auto' : 'light';
    setTheme(nextTheme);
    applyTheme(nextTheme);
    
    toast({
      title: "Theme Updated",
      description: `Switched to ${nextTheme} mode`,
    });
  };

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      navigate('/trader-auth');
      toast({
        title: "Logged out",
        description: "You have been successfully logged out.",
      });
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const getUserInitials = (user: any) => {
    if (user?.user_metadata?.full_name) {
      return user.user_metadata.full_name
        .split(' ')
        .map((n: string) => n[0])
        .join('')
        .toUpperCase();
    }
    return user?.email?.[0]?.toUpperCase() || 'T';
  };

  const getThemeIcon = () => {
    switch (theme) {
      case 'light': return <Sun className="w-4 h-4" />;
      case 'dark': return <Moon className="w-4 h-4" />;
      default: return <Sun className="w-4 h-4" />;
    }
  };

  const getThemeLabel = () => {
    switch (theme) {
      case 'light': return 'Dark Mode';
      case 'dark': return 'Auto Mode';
      default: return 'Light Mode';
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="relative h-9 w-auto px-2 hover:bg-accent/50 transition-all">
          <div className="flex items-center space-x-2">
            <Avatar className="h-7 w-7 border-2 border-primary/20">
              <AvatarFallback className="text-xs font-medium bg-primary text-primary-foreground">
                {getUserInitials(user)}
              </AvatarFallback>
            </Avatar>
            <ChevronDown className="h-3 w-3 text-muted-foreground" />
          </div>
        </Button>
      </DropdownMenuTrigger>
      
      <DropdownMenuContent className="w-64 shadow-lg border-0" align="end" forceMount>
        {/* User info section */}
        <div className="px-4 py-3 border-b border-border/50">
          <p className="text-xs text-muted-foreground">Signed in as</p>
          <p className="font-medium text-sm text-foreground truncate">
            {user?.email}
          </p>
        </div>

        {/* Menu items */}
        <DropdownMenuItem asChild className="cursor-pointer hover:bg-accent/50 transition-colors">
          <Link to="/trader/settings" className="flex items-center w-full">
            <Settings className="mr-3 h-4 w-4" />
            <span>Settings</span>
          </Link>
        </DropdownMenuItem>
        
        <DropdownMenuItem asChild className="cursor-pointer hover:bg-accent/50 transition-colors">
          <Link to="/trader/integrations" className="flex items-center w-full">
            <LinkIcon className="mr-3 h-4 w-4" />
            <span>Broker Connections</span>
          </Link>
        </DropdownMenuItem>
        
        <DropdownMenuItem 
          onClick={toggleTheme}
          className="cursor-pointer hover:bg-accent/50 transition-colors"
        >
          {getThemeIcon()}
          <span className="ml-3">{getThemeLabel()}</span>
        </DropdownMenuItem>
        
        <DropdownMenuItem asChild className="cursor-pointer hover:bg-accent/50 transition-colors">
          <Link to="/trader/performance" className="flex items-center w-full">
            <BarChart3 className="mr-3 h-4 w-4" />
            <span>Performance History</span>
          </Link>
        </DropdownMenuItem>
        
        <DropdownMenuSeparator className="bg-border/50" />
        
        {/* System Maps Submenu */}
        <div className="px-2 py-1">
          <p className="text-xs font-semibold text-muted-foreground px-2 mb-1">System Maps</p>
          <DropdownMenuItem asChild className="cursor-pointer hover:bg-accent/50 transition-colors pl-4">
            <Link to="/trader/system-maps/architecture" className="flex items-center w-full">
              <Network className="mr-3 h-3 w-3" />
              <span className="text-sm">Architecture Overview</span>
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem asChild className="cursor-pointer hover:bg-accent/50 transition-colors pl-4">
            <Link to="/trader/system-maps/algorithms" className="flex items-center w-full">
              <Activity className="mr-3 h-3 w-3" />
              <span className="text-sm">Algorithm Analysis</span>
            </Link>
          </DropdownMenuItem>
        </div>
        
        <DropdownMenuSeparator className="bg-border/50" />
        
        {/* Intelligence Submenu */}
        <div className="px-2 py-1">
          <p className="text-xs font-semibold text-muted-foreground px-2 mb-1">Intelligence</p>
          <DropdownMenuItem asChild className="cursor-pointer hover:bg-accent/50 transition-colors pl-4">
            <Link to="/trader/intelligence/explorer" className="flex items-center w-full">
              <Brain className="mr-3 h-3 w-3" />
              <span className="text-sm">Knowledge Graph</span>
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem asChild className="cursor-pointer hover:bg-accent/50 transition-colors pl-4">
            <Link to="/trader/intelligence/insights" className="flex items-center w-full">
              <Lightbulb className="mr-3 h-3 w-3" />
              <span className="text-sm">AI Insights</span>
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem asChild className="cursor-pointer hover:bg-accent/50 transition-colors pl-4">
            <Link to="/trader/testing" className="flex items-center w-full">
              <Activity className="mr-3 h-3 w-3" />
              <span className="text-sm">Beta Testing</span>
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem asChild className="cursor-pointer hover:bg-accent/50 transition-colors pl-4">
            <Link to="/trader/forensics" className="flex items-center w-full">
              <FileText className="mr-3 h-3 w-3" />
              <span className="text-sm">BBBY Forensics</span>
            </Link>
          </DropdownMenuItem>
        </div>
        
        <DropdownMenuSeparator className="bg-border/50" />
        
        <DropdownMenuItem asChild className="cursor-pointer hover:bg-accent/50 transition-colors">
          <Link to="/trader/strategies" className="flex items-center w-full">
            <Brain className="mr-3 h-4 w-4" />
            <span>Strategy Settings</span>
          </Link>
        </DropdownMenuItem>
        
        <DropdownMenuItem asChild className="cursor-pointer hover:bg-accent/50 transition-colors">
          <Link to="/trader/alerts" className="flex items-center w-full">
            <Bell className="mr-3 h-4 w-4" />
            <span>Alert Preferences</span>
          </Link>
        </DropdownMenuItem>
        
        <DropdownMenuItem asChild className="cursor-pointer hover:bg-accent/50 transition-colors">
          <Link to="/trader/api-keys" className="flex items-center w-full">
            <Key className="mr-3 h-4 w-4" />
            <span>API & Webhooks</span>
          </Link>
        </DropdownMenuItem>
        
        <DropdownMenuSeparator className="bg-border/50" />
        
        <DropdownMenuItem asChild className="cursor-pointer hover:bg-accent/50 transition-colors">
          <Link to="/trader/reporting" className="flex items-center w-full">
            <FileText className="mr-3 h-4 w-4" />
            <span>Reporting</span>
          </Link>
        </DropdownMenuItem>
        
        <DropdownMenuItem asChild className="cursor-pointer hover:bg-accent/50 transition-colors">
          <Link to="/trader/newsletters" className="flex items-center w-full">
            <Mail className="mr-3 h-4 w-4" />
            <span>Newsletters</span>
          </Link>
        </DropdownMenuItem>
        
        <DropdownMenuItem asChild className="cursor-pointer hover:bg-accent/50 transition-colors">
          <Link to="/trader/troubleshooting" className="flex items-center w-full">
            <AlertCircle className="mr-3 h-4 w-4" />
            <span>Troubleshooting</span>
          </Link>
        </DropdownMenuItem>
        
        <DropdownMenuItem asChild className="cursor-pointer hover:bg-accent/50 transition-colors">
          <Link to="/trader/diagnostics" className="flex items-center w-full">
            <Activity className="mr-3 h-4 w-4" />
            <span>Algorithm Diagnostics</span>
          </Link>
        </DropdownMenuItem>
        
        <DropdownMenuItem asChild className="cursor-pointer hover:bg-accent/50 transition-colors">
          <Link to="/trader/help" className="flex items-center w-full">
            <HelpCircle className="mr-3 h-4 w-4" />
            <span>Help & Tutorials</span>
          </Link>
        </DropdownMenuItem>
        
        <DropdownMenuItem 
          className="cursor-pointer text-destructive hover:text-destructive hover:bg-destructive/10 transition-colors"
          onClick={handleLogout}
        >
          <LogOut className="mr-3 h-4 w-4" />
          <span>Logout</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};