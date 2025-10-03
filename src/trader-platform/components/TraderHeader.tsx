import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { 
  Radio, 
  Wifi, 
  WifiOff
} from "lucide-react";
import vinylLogoWhite from "@/assets/vinyl-logo-white-new.svg";
import vinylLogoBlack from "@/assets/vinyl-logo-black-new.svg";
import { ProfileDropdown } from "./ProfileDropdown";
import { TickerSearch } from "@/components/trader/TickerSearch";

interface TraderHeaderProps {
  accountData?: {
    portfolioValue: number;
    dailyPnL: number;
    buyingPower: number;
  };
  isConnected?: boolean;
  showAccountStats?: boolean;
}


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
      className="h-16 border-b border-[#2A2A2A] relative overflow-hidden bg-[#1A1A1A]"
      style={woodHeaderEnabled ? {
        background: '#5a3a1a',
        borderColor: '#5a3a1a',
        boxShadow: '0 2px 8px rgba(0,0,0,0.3)'
      } : undefined}
    >
      <div className="flex items-center justify-between px-4 sm:px-6 h-full relative z-10">
        {/* Left Side - Logo */}
        <div className="flex items-center space-x-2 sm:space-x-4">
          {/* Logo */}
          <Link to="/trader" className="flex items-center space-x-2 sm:space-x-3">
            <img 
              src={woodHeaderEnabled ? vinylLogoWhite : vinylLogoWhite} 
              alt="Vinyl" 
              className="h-9 w-auto"
            />
            <div className="text-lg sm:text-xl font-bold tracking-tight text-white">
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

        {/* Center Section - Ticker Search */}
        <div className="flex-1 flex justify-center px-4 max-w-2xl mx-auto">
          <TickerSearch />
        </div>

        {/* Right Side Controls */}
        <div className="flex items-center space-x-2 sm:space-x-4">
          {/* Profile Dropdown */}
          <ProfileDropdown />
        </div>
      </div>
    </header>
  );
};
