import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { UserAmp, AmpSettings } from '@/types/amps';
import { Slider } from '@/components/ui/slider';
import { Save, RotateCcw } from 'lucide-react';

interface AmpSettingsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  amp: UserAmp | null;
  onSave: (ampId: string, settings: Partial<AmpSettings>) => Promise<void>;
}

export function AmpSettingsModal({ open, onOpenChange, amp, onSave }: AmpSettingsModalProps) {
  const [settings, setSettings] = useState<Partial<AmpSettings>>({});
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (amp?.settings) {
      setSettings(amp.settings);
    }
  }, [amp]);

  const handleSave = async () => {
    if (!amp) return;
    
    setIsSaving(true);
    try {
      await onSave(amp.id, settings);
      onOpenChange(false);
    } finally {
      setIsSaving(false);
    }
  };

  const handleReset = () => {
    if (amp?.catalog?.default_settings) {
      setSettings({
        ...settings,
        custom_parameters: amp.catalog.default_settings
      });
    }
  };

  if (!amp) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Configure {amp.name}</DialogTitle>
          <DialogDescription>
            Adjust trading parameters and risk settings for this algorithm
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="trading" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="trading">Trading</TabsTrigger>
            <TabsTrigger value="risk">Risk</TabsTrigger>
            <TabsTrigger value="schedule">Schedule</TabsTrigger>
            <TabsTrigger value="advanced">Advanced</TabsTrigger>
          </TabsList>

          {/* Trading Tab */}
          <TabsContent value="trading" className="space-y-4 mt-4">
            <div className="space-y-2">
              <Label>Minimum Confidence Score (%)</Label>
              <div className="flex gap-4 items-center">
                <Slider
                  value={[((settings.min_confidence_score || 0.75) * 100)]}
                  onValueChange={([value]) => 
                    setSettings({ ...settings, min_confidence_score: value / 100 })
                  }
                  min={50}
                  max={100}
                  step={5}
                  className="flex-1"
                />
                <span className="w-16 text-right font-mono">
                  {((settings.min_confidence_score || 0.75) * 100).toFixed(0)}%
                </span>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Max Position Size ($)</Label>
              <Input
                type="number"
                value={settings.max_position_size || 1000}
                onChange={(e) => setSettings({ ...settings, max_position_size: Number(e.target.value) })}
                min={100}
                step={100}
              />
            </div>

            <div className="space-y-2">
              <Label>Max Open Positions</Label>
              <Input
                type="number"
                value={settings.max_open_positions || 3}
                onChange={(e) => setSettings({ ...settings, max_open_positions: Number(e.target.value) })}
                min={1}
                max={20}
              />
            </div>
          </TabsContent>

          {/* Risk Tab */}
          <TabsContent value="risk" className="space-y-4 mt-4">
            <div className="space-y-2">
              <Label>Stop Loss (%)</Label>
              <Input
                type="number"
                value={settings.stop_loss_percentage || 2}
                onChange={(e) => setSettings({ ...settings, stop_loss_percentage: Number(e.target.value) })}
                min={0.1}
                max={50}
                step={0.5}
              />
            </div>

            <div className="space-y-2">
              <Label>Take Profit (%)</Label>
              <Input
                type="number"
                value={settings.take_profit_percentage || 4}
                onChange={(e) => setSettings({ ...settings, take_profit_percentage: Number(e.target.value) })}
                min={0.1}
                max={100}
                step={0.5}
              />
            </div>

            <div className="space-y-2">
              <Label>Daily Loss Limit (%)</Label>
              <Input
                type="number"
                value={settings.daily_loss_limit || 5}
                onChange={(e) => setSettings({ ...settings, daily_loss_limit: Number(e.target.value) })}
                min={1}
                max={100}
                step={1}
              />
            </div>

            <div className="space-y-2">
              <Label>Portfolio Risk (%)</Label>
              <Input
                type="number"
                value={settings.total_portfolio_risk_pct || 2}
                onChange={(e) => setSettings({ ...settings, total_portfolio_risk_pct: Number(e.target.value) })}
                min={0.5}
                max={10}
                step={0.5}
              />
            </div>

            <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
              <Label htmlFor="trailing-stop">Trailing Stop Loss</Label>
              <Switch
                id="trailing-stop"
                checked={settings.trailing_stop_enabled || false}
                onCheckedChange={(checked) => 
                  setSettings({ ...settings, trailing_stop_enabled: checked })
                }
              />
            </div>
          </TabsContent>

          {/* Schedule Tab */}
          <TabsContent value="schedule" className="space-y-4 mt-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Trading Start</Label>
                <Input
                  type="time"
                  value={settings.trading_start_time || '09:30:00'}
                  onChange={(e) => setSettings({ ...settings, trading_start_time: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Trading End</Label>
                <Input
                  type="time"
                  value={settings.trading_end_time || '16:00:00'}
                  onChange={(e) => setSettings({ ...settings, trading_end_time: e.target.value })}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label className="mb-2">Trading Days</Label>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { key: 'trade_on_monday', label: 'Monday' },
                  { key: 'trade_on_tuesday', label: 'Tuesday' },
                  { key: 'trade_on_wednesday', label: 'Wednesday' },
                  { key: 'trade_on_thursday', label: 'Thursday' },
                  { key: 'trade_on_friday', label: 'Friday' },
                  { key: 'trade_on_saturday', label: 'Saturday' },
                  { key: 'trade_on_sunday', label: 'Sunday' },
                ].map(({ key, label }) => (
                  <div key={key} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                    <Label htmlFor={key}>{label}</Label>
                    <Switch
                      id={key}
                      checked={settings[key as keyof AmpSettings] as boolean || false}
                      onCheckedChange={(checked) => 
                        setSettings({ ...settings, [key]: checked })
                      }
                    />
                  </div>
                ))}
              </div>
            </div>
          </TabsContent>

          {/* Advanced Tab */}
          <TabsContent value="advanced" className="space-y-4 mt-4">
            <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
              <div>
                <Label>Volume Confirmation</Label>
                <p className="text-xs text-muted-foreground">Require volume confirmation for entries</p>
              </div>
              <Switch
                checked={settings.require_volume_confirmation || false}
                onCheckedChange={(checked) => 
                  setSettings({ ...settings, require_volume_confirmation: checked })
                }
              />
            </div>

            <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
              <div>
                <Label>Block Earnings</Label>
                <p className="text-xs text-muted-foreground">Avoid trading during earnings</p>
              </div>
              <Switch
                checked={settings.block_earnings_announcements || false}
                onCheckedChange={(checked) => 
                  setSettings({ ...settings, block_earnings_announcements: checked })
                }
              />
            </div>

            <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
              <div>
                <Label>Trade With Trend</Label>
                <p className="text-xs text-muted-foreground">Only trade in the direction of trend</p>
              </div>
              <Switch
                checked={settings.only_trade_with_trend || false}
                onCheckedChange={(checked) => 
                  setSettings({ ...settings, only_trade_with_trend: checked })
                }
              />
            </div>

            {amp.catalog?.parameter_schema && (
              <div className="mt-4 p-4 border rounded-lg space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="font-semibold">Algorithm-Specific Parameters</h4>
                  <Button variant="ghost" size="sm" onClick={handleReset}>
                    <RotateCcw className="w-4 h-4 mr-2" />
                    Reset to Defaults
                  </Button>
                </div>
                <p className="text-sm text-muted-foreground">
                  These parameters are specific to the {amp.name} algorithm strategy
                </p>
              </div>
            )}
          </TabsContent>
        </Tabs>

        <div className="flex justify-end gap-2 mt-6">
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isSaving}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={isSaving}>
            <Save className="w-4 h-4 mr-2" />
            {isSaving ? 'Saving...' : 'Save Settings'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
