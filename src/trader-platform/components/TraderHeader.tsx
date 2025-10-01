import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { 
  Radio, 
  Wifi, 
  WifiOff,
  Menu,
  BarChart3,
  Settings,
  Zap,
  TrendingUp,
  BookOpen,
  Activity,
  Network,
  TestTube,
  Bell,
  HelpCircle,
  FileText,
  Mail,
  Key,
  AlertTriangle,
  Search
} from "lucide-react";
import vinylLogoWhite from "@/assets/vinyl-logo-white-new.svg";
import vinylLogoBlack from "@/assets/vinyl-logo-black-new.svg";
import { ProfileDropdown } from "./ProfileDropdown";

interface TraderHeaderProps {
  accountData?: {
    portfolioValue: number;
    dailyPnL: number;
    buyingPower: number;
  };
  isConnected?: boolean;
  showAccountStats?: boolean;
}

const navigationItems = [
  { 
    label: "Dashboard", 
    path: "/trader", 
    icon: BarChart3,
    description: "Main trading dashboard"
  },
  { 
    label: "My Amps", 
    path: "/trader/amps", 
    icon: Radio,
    description: "Manage your trading algorithms"
  },
  { 
    label: "Performance", 
    path: "/trader/performance", 
    icon: TrendingUp,
    description: "View trading performance"
  },
  { 
    label: "Integrations", 
    path: "/trader/integrations", 
    icon: Network,
    description: "Connect brokers & APIs"
  },
  { 
    label: "System Architecture", 
    path: "/trader/system-architecture", 
    icon: Activity,
    description: "View system components"
  },
  { 
    label: "Algorithm Analysis", 
    path: "/trader/algorithm-analysis", 
    icon: Search,
    description: "Analyze algorithm performance"
  },
  { 
    label: "Forensics", 
    path: "/trader/forensics", 
    icon: BookOpen,
    description: "Document analysis & intelligence"
  },
  { 
    label: "Knowledge Explorer", 
    path: "/trader/knowledge-explorer", 
    icon: Network,
    description: "Explore knowledge graphs"
  },
  { 
    label: "Insights Dashboard", 
    path: "/trader/insights", 
    icon: Zap,
    description: "AI-powered insights"
  },
  { 
    label: "Diagnostics", 
    path: "/trader/diagnostics", 
    icon: TestTube,
    description: "System diagnostics & monitoring"
  },
  { 
    label: "Beta Testing", 
    path: "/trader/beta-testing", 
    icon: TestTube,
    description: "Test new features"
  },
  { 
    label: "Alerts", 
    path: "/trader/alerts", 
    icon: Bell,
    description: "Configure trading alerts"
  },
  { 
    label: "Reporting", 
    path: "/trader/reporting", 
    icon: FileText,
    description: "Generate reports"
  },
  { 
    label: "Newsletters", 
    path: "/trader/newsletters", 
    icon: Mail,
    description: "Manage newsletters"
  },
  { 
    label: "API Keys", 
    path: "/trader/api-keys", 
    icon: Key,
    description: "Manage API keys"
  },
  { 
    label: "Settings", 
    path: "/trader/settings", 
    icon: Settings,
    description: "Platform settings"
  },
  { 
    label: "Help", 
    path: "/trader/help", 
    icon: HelpCircle,
    description: "Get help & support"
  },
  { 
    label: "Troubleshooting", 
    path: "/trader/troubleshooting", 
    icon: AlertTriangle,
    description: "Troubleshoot issues"
  }
];

export const TraderHeader: React.FC<TraderHeaderProps> = ({ 
  accountData,
  isConnected = true,
  showAccountStats = true
}) => {
  const location = useLocation();
  const [woodHeaderEnabled, setWoodHeaderEnabled] = useState(false);
  const isDevelopment = import.meta.env.DEV;

  // Load wood header setting
  useEffect(() => {
    const savedSettings = localStorage.getItem('trader-settings');
    if (savedSettings) {
      const settings = JSON.parse(savedSettings);
      setWoodHeaderEnabled(settings.woodHeaderEnabled || false);
    }

    // Listen for storage changes
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'trader-settings' && e.newValue) {
        const settings = JSON.parse(e.newValue);
        setWoodHeaderEnabled(settings.woodHeaderEnabled || false);
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  const currentPath = location.pathname;

  return (
    <header 
      className="h-16 border-b relative overflow-hidden"
      style={woodHeaderEnabled ? {
        background: '#5a3a1a',
        borderColor: '#5a3a1a',
        boxShadow: '0 2px 8px rgba(0,0,0,0.3)'
      } : {
        background: 'hsl(var(--card) / 0.5)',
        backdropFilter: 'blur(8px)',
        borderColor: 'hsl(var(--border))'
      }}
    >
      <div className="flex items-center justify-between px-4 sm:px-6 h-full relative z-10">
        {/* Left Side - Logo & Navigation */}
        <div className="flex items-center space-x-2 sm:space-x-4">
          {/* Navigation Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button 
                variant="ghost" 
                size="sm" 
                className={`h-8 w-8 p-0 ${woodHeaderEnabled ? 'text-white hover:bg-white/10' : ''}`}
              >
                <Menu className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent 
              align="start" 
              className="w-72 max-h-[600px] overflow-y-auto bg-card/95 backdrop-blur-sm border-border z-50"
            >
              <div className="px-2 py-1.5 text-sm font-semibold text-muted-foreground">
                Navigation
              </div>
              <DropdownMenuSeparator />
              {navigationItems.map((item) => {
                const Icon = item.icon;
                const isActive = currentPath === item.path;
                return (
                  <DropdownMenuItem 
                    key={item.path} 
                    asChild
                    className={`cursor-pointer ${isActive ? 'bg-primary/10 text-primary font-medium' : ''}`}
                  >
                    <Link to={item.path} className="flex items-start space-x-3 py-2">
                      <Icon className={`h-4 w-4 mt-0.5 flex-shrink-0 ${isActive ? 'text-primary' : 'text-muted-foreground'}`} />
                      <div className="flex-1">
                        <div className="text-sm font-medium">{item.label}</div>
                        <div className="text-xs text-muted-foreground">{item.description}</div>
                      </div>
                    </Link>
                  </DropdownMenuItem>
                );
              })}
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Logo */}
          <Link to="/trader" className="flex items-center space-x-2 sm:space-x-3">
            {woodHeaderEnabled ? (
              <img 
                src={vinylLogoWhite} 
                alt="Vinyl" 
                className="h-9 w-auto"
              />
            ) : (
              <>
                <img 
                  src={vinylLogoBlack} 
                  alt="Vinyl" 
                  className="h-9 w-auto dark:hidden"
                />
                <img 
                  src={vinylLogoWhite} 
                  alt="Vinyl" 
                  className="h-9 w-auto hidden dark:block"
                />
              </>
            )}
            <div className={`text-lg sm:text-xl font-bold tracking-tight ${woodHeaderEnabled ? 'text-white' : 'text-foreground'}`}>
              <span className="hidden sm:inline">v5.0</span>
            </div>
          </Link>

          {/* Connection Status */}
          {isDevelopment && (
            <div className="flex items-center space-x-1">
              {isConnected ? (
                <Wifi className="h-4 w-4 text-success" />
              ) : (
                <WifiOff className="h-4 w-4 text-destructive" />
              )}
              <span className={`text-xs ${isConnected ? 'text-success' : 'text-destructive'}`}>
                {isConnected ? 'Connected' : 'Disconnected'}
              </span>
            </div>
          )}
        </div>

        {/* Account Stats - Hide on small screens */}
        {showAccountStats && accountData && (
          <div className="hidden lg:flex items-center space-x-6">
            <div className="text-center">
              <p className={`text-xs ${woodHeaderEnabled ? 'text-success dark:text-background' : 'text-muted-foreground'}`}>Portfolio Value</p>
              <p className={`text-lg font-semibold ${woodHeaderEnabled ? 'text-white/80 dark:text-foreground' : 'text-foreground'}`}>
                ${accountData.portfolioValue.toLocaleString()}
              </p>
            </div>
            <div className="text-center">
              <p className={`text-xs ${woodHeaderEnabled ? 'text-success dark:text-background' : 'text-muted-foreground'}`}>Daily P&L</p>
              <p className={`text-lg font-semibold ${
                woodHeaderEnabled 
                  ? 'text-white/80' 
                  : accountData.dailyPnL >= 0 ? 'text-success' : 'text-destructive'
              }`}>
                {accountData.dailyPnL >= 0 ? '+' : ''}${accountData.dailyPnL.toLocaleString()}
              </p>
            </div>
            <div className="text-center">
              <p className={`text-xs ${woodHeaderEnabled ? 'text-success dark:text-background' : 'text-muted-foreground'}`}>Buying Power</p>
              <p className={`text-lg font-semibold ${woodHeaderEnabled ? 'text-white/80 dark:text-card' : 'text-accent'}`}>
                ${accountData.buyingPower.toLocaleString()}
              </p>
            </div>
          </div>
        )}

        {/* Right Side Controls */}
        <div className="flex items-center space-x-2 sm:space-x-4">
          {/* My Amps Button */}
          <Link to="/trader/amps">
            <Button 
              variant="outline" 
              size="sm" 
              className="h-8 px-3 text-xs bg-[#2c2c2c] hover:bg-[#3c3c3c] text-success border-success/30 hover:border-success/50"
            >
              <Radio className="h-3 w-3 mr-1" />
              <span className="hidden sm:inline">My Amps</span>
            </Button>
          </Link>
          
          {/* Profile Dropdown */}
          <ProfileDropdown />
        </div>
      </div>
    </header>
  );
};
