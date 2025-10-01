import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { UserAmp } from '@/types/amps';
import { Settings } from 'lucide-react';
import { useState } from 'react';
import tubeAmpImage from '@/assets/vintage-tube-amp.jpg';

interface AmpCardProps {
  amp: UserAmp;
  onToggle: (ampId: string, isActive: boolean) => Promise<void>;
  onAllocate: (ampId: string) => void;
  onSettings: (ampId: string) => void;
}

export function AmpCard({ amp, onToggle, onAllocate, onSettings }: AmpCardProps) {
  const [isToggling, setIsToggling] = useState(false);

  const handleToggle = async (checked: boolean) => {
    setIsToggling(true);
    try {
      await onToggle(amp.id, checked);
    } finally {
      setIsToggling(false);
    }
  };

  const pnlColor = (amp.today_pnl || 0) >= 0 ? 'text-green-500' : 'text-red-500';

  return (
    <Card className={`overflow-hidden transition-all ${amp.is_active ? 'border-green-500 border-2' : 'border-border'}`}>
      {/* Featured Image */}
      {amp.catalog?.image_url && (
        <div className="relative w-full aspect-video overflow-hidden">
          <img 
            src={tubeAmpImage} 
            alt={amp.name}
            className="w-full h-full object-cover"
          />
        </div>
      )}
      
      <div className="p-6">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <h3 className="text-lg font-semibold">{amp.name}</h3>
              {amp.is_active && (
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
              )}
            </div>
            <Badge variant="secondary" className="text-xs">
              {amp.catalog?.category || 'momentum'}
            </Badge>
          </div>
          <Switch
            checked={amp.is_active}
            onCheckedChange={handleToggle}
            disabled={isToggling}
          />
        </div>

        {/* Description */}
        {amp.catalog?.description && (
          <p className="text-sm text-muted-foreground mb-4">
            {amp.catalog.description}
          </p>
        )}

      {/* Capital Section */}
      <div className="space-y-3 mb-4">
        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">Allocated Capital</span>
          <Button 
            variant="ghost" 
            size="sm"
            onClick={() => onAllocate(amp.id)}
          >
            Edit
          </Button>
        </div>
        <div className="text-2xl font-bold">
          ${amp.allocated_capital.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
        </div>
        <div className="text-sm text-muted-foreground">
          ${amp.available_capital?.toFixed(2)} available
        </div>
        <div className="space-y-1">
          <Progress value={amp.utilization_pct || 0} className="h-2" />
          <div className="text-xs text-muted-foreground text-right">
            {amp.utilization_pct?.toFixed(0)}% used
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-3 gap-3 mb-4">
        <div className="text-center p-3 bg-muted/50 rounded-lg">
          <div className={`text-lg font-bold ${pnlColor}`}>
            {(amp.today_pnl || 0) >= 0 ? '+' : ''}${amp.today_pnl?.toFixed(2) || '0.00'}
          </div>
          <div className="text-xs text-muted-foreground">Today</div>
        </div>
        <div className="text-center p-3 bg-muted/50 rounded-lg">
          <div className="text-lg font-bold">{amp.open_positions_count || 0}</div>
          <div className="text-xs text-muted-foreground">Positions</div>
        </div>
        <div className="text-center p-3 bg-muted/50 rounded-lg">
          <div className="text-lg font-bold">{amp.today_trades || 0}</div>
          <div className="text-xs text-muted-foreground">Trades</div>
        </div>
      </div>

      {/* Actions */}
      <Button 
        variant="outline" 
        className="w-full"
        onClick={() => onSettings(amp.id)}
      >
        <Settings className="w-4 h-4 mr-2" />
        Settings
      </Button>

        {/* Warning if no capital */}
        {amp.allocated_capital <= 0 && (
          <div className="mt-3 p-2 bg-yellow-500/10 border border-yellow-500/20 rounded text-xs text-yellow-600">
            ⚠️ No capital allocated
          </div>
        )}
      </div>
    </Card>
  );
}
