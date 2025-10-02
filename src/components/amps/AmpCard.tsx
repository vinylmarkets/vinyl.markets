import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { UserAmp } from '@/types/amps';
import { Settings, Info, TrendingUp, TrendingDown, DollarSign } from 'lucide-react';
import { useState } from 'react';
import { StrategyGuideModal } from './StrategyGuideModal';

interface AmpCardProps {
  amp: UserAmp;
  onToggle: (ampId: string, isActive: boolean) => Promise<void>;
  onAllocate: (ampId: string) => void;
  onSettings: (ampId: string) => void;
}

export function AmpCard({ amp, onToggle, onAllocate, onSettings }: AmpCardProps) {
  const [isToggling, setIsToggling] = useState(false);
  const [showStrategyGuide, setShowStrategyGuide] = useState(false);

  const handleToggle = async (checked: boolean) => {
    setIsToggling(true);
    try {
      await onToggle(amp.id, checked);
    } finally {
      setIsToggling(false);
    }
  };

  const pnlColor = (amp.today_pnl || 0) >= 0 ? 'text-green-500' : 'text-red-500';
  const PnlIcon = (amp.today_pnl || 0) >= 0 ? TrendingUp : TrendingDown;

  return (
    <Card className={`transition-all hover:shadow-md ${amp.is_active ? 'border-green-500' : 'border-border'}`}>
      <div className="p-4">
        {/* Hero Image */}
        <div className="relative mb-3 rounded-lg overflow-hidden h-48">
          <img 
            src={amp.catalog?.image_url || 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=400&q=80'} 
            alt={amp.name}
            className="w-full h-full object-cover"
          />
        </div>

        {/* Compact Header */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <h3 className="text-base font-semibold truncate">{amp.name}</h3>
              <button
                onClick={() => setShowStrategyGuide(true)}
                className="text-muted-foreground hover:text-primary transition-colors flex-shrink-0"
                aria-label="View strategy guide"
              >
                <Info className="w-4 h-4" />
              </button>
            </div>
            <Badge variant="secondary" className="text-xs mt-1">
              {amp.catalog?.category || 'momentum'}
            </Badge>
          </div>
          <Switch
            checked={amp.is_active}
            onCheckedChange={handleToggle}
            disabled={isToggling}
            className="flex-shrink-0"
          />
        </div>

        {/* Condensed Description */}
        {amp.catalog?.description && (
          <p className="text-xs text-muted-foreground mb-3 line-clamp-2">
            {amp.catalog.description}
          </p>
        )}

        {/* Horizontal Stats Row */}
        <div className="grid grid-cols-3 gap-2 mb-3 pb-3 border-b">
          <div>
            <div className="text-xs text-muted-foreground mb-0.5">Today P&L</div>
            <div className={`text-sm font-bold flex items-center gap-1 ${pnlColor}`}>
              <PnlIcon className="w-3 h-3" />
              {(amp.today_pnl || 0) >= 0 ? '+' : ''}${Math.abs(amp.today_pnl || 0).toFixed(0)}
            </div>
          </div>
          <div>
            <div className="text-xs text-muted-foreground mb-0.5">Positions</div>
            <div className="text-sm font-bold">{amp.open_positions_count || 0}</div>
          </div>
          <div>
            <div className="text-xs text-muted-foreground mb-0.5">Trades</div>
            <div className="text-sm font-bold">{amp.today_trades || 0}</div>
          </div>
        </div>

        {/* Compact Capital Section */}
        <div className="mb-3">
          <div className="flex items-baseline justify-between mb-1">
            <span className="text-xs text-muted-foreground flex items-center gap-1">
              <DollarSign className="w-3 h-3" />
              Allocated
            </span>
            <span className="text-sm font-bold">
              ${amp.allocated_capital.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
            </span>
          </div>
          <div className="flex items-center justify-between text-xs">
            <span className="text-muted-foreground">
              ${amp.available_capital?.toFixed(0) || 0} available
            </span>
            <span className="text-muted-foreground">
              {amp.utilization_pct?.toFixed(0) || 0}% used
            </span>
          </div>
        </div>

        {/* Warning if no capital */}
        {amp.allocated_capital <= 0 && (
          <div className="mb-3 p-2 bg-yellow-500/10 border border-yellow-500/20 rounded text-xs text-yellow-600">
            ⚠️ No capital allocated
          </div>
        )}

        {/* Horizontal Action Buttons */}
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            size="sm"
            className="flex-1"
            onClick={() => onAllocate(amp.id)}
          >
            <DollarSign className="w-3 h-3 mr-1" />
            Allocate
          </Button>
          <Button 
            variant="outline" 
            size="sm"
            className="flex-1"
            onClick={() => onSettings(amp.id)}
          >
            <Settings className="w-3 h-3 mr-1" />
            Settings
          </Button>
        </div>
      </div>

      {/* Strategy Guide Modal */}
      <StrategyGuideModal 
        amp={amp}
        isOpen={showStrategyGuide}
        onClose={() => setShowStrategyGuide(false)}
      />
    </Card>
  );
}
