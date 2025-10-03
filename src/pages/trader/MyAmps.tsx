import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Plus, TrendingUp, DollarSign, Zap, Activity } from 'lucide-react';
import { useUserAmps } from '@/hooks/useUserAmps';
import { AmpCard } from '@/components/amps/AmpCard';
import { AddAmpModal } from '@/components/amps/AddAmpModal';
import { AllocateCapitalModal } from '@/components/amps/AllocateCapitalModal';
import { AmpSettingsModal } from '@/components/amps/AmpSettingsModal';
import { UserAmp } from '@/types/amps';
import { TraderHeader } from '@/trader-platform/components/TraderHeader';
import { TraderProtection } from '@/components/trader/TraderProtection';
import { Sidebar } from '@/components/trader/Sidebar';
import { ComingSoonModal } from '@/components/trader/ComingSoonModal';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/components/auth/AuthProvider';
import { useToast } from '@/hooks/use-toast';

export default function MyAmps() {
  const { user } = useAuth();
  const { toast } = useToast();
  const { amps, summary, isLoading, toggleAmpActive, allocateCapital, addAmp, updateSettings } = useUserAmps();
  const [showAddModal, setShowAddModal] = useState(false);
  const [showAllocateModal, setShowAllocateModal] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [selectedAmp, setSelectedAmp] = useState<UserAmp | null>(null);
  const [signalStats, setSignalStats] = useState<{ count: number; lastGenerated: string | null }>({ count: 0, lastGenerated: null });
  const [autoTradeEnabled, setAutoTradeEnabled] = useState(false);
  const [comingSoonFeature, setComingSoonFeature] = useState<string | null>(null);

  const handleAllocateClick = (ampId: string) => {
    const amp = amps.find(a => a.id === ampId);
    if (amp) {
      setSelectedAmp(amp);
      setShowAllocateModal(true);
    }
  };

  const handleSettingsClick = (ampId: string) => {
    const amp = amps.find(a => a.id === ampId);
    if (amp) {
      setSelectedAmp(amp);
      setShowSettingsModal(true);
    }
  };

  // Load autotrading setting
  useEffect(() => {
    const savedSettings = localStorage.getItem('trader-settings');
    if (savedSettings) {
      const settings = JSON.parse(savedSettings);
      setAutoTradeEnabled(settings.autoTradeEnabled || false);
    }
  }, []);

  // Fetch signal stats
  useEffect(() => {
    const fetchSignalStats = async () => {
      try {
        const { data, error } = await supabase
          .from('trading_signals')
          .select('created_at')
          .eq('status', 'active')
          .order('created_at', { ascending: false });
        
        if (!error && data) {
          setSignalStats({
            count: data.length,
            lastGenerated: data[0]?.created_at || null
          });
        }
      } catch (error) {
        console.error('Failed to fetch signal stats:', error);
      }
    };

    fetchSignalStats();
    const interval = setInterval(fetchSignalStats, 30000);
    return () => clearInterval(interval);
  }, []);

  const handleAutoTradeToggle = async (checked: boolean) => {
    setAutoTradeEnabled(checked);
    
    // Save to localStorage
    const savedSettings = localStorage.getItem('trader-settings');
    const settings = savedSettings ? JSON.parse(savedSettings) : {};
    settings.autoTradeEnabled = checked;
    localStorage.setItem('trader-settings', JSON.stringify(settings));
    
    // Save to database
    try {
      const { error } = await supabase
        .from('user_settings')
        .upsert([{
          user_id: user?.id,
          settings: settings as any
        }]);
        
      if (error) {
        console.error('Error saving autotrading setting:', error);
        toast({
          title: "Settings Updated Locally",
          description: `Auto-trading ${checked ? 'enabled' : 'disabled'} in browser. May not sync with automated jobs.`,
          variant: "default"
        });
      } else {
        toast({
          title: checked ? "Auto-Trading Enabled" : "Auto-Trading Disabled",
          description: checked 
            ? "Scheduled jobs will now execute trades automatically" 
            : "Trades will require manual execution",
        });
      }
    } catch (error) {
      console.error('Error updating autotrading:', error);
    }
  };

  if (isLoading) {
    return (
      <TraderProtection>
        <div className="min-h-screen bg-background relative">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-background to-accent/10 pointer-events-none"></div>
          <TraderHeader showAccountStats={false} />
          <div className="container mx-auto p-6 space-y-6 relative z-10">
            <Skeleton className="h-12 w-64" />
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {[...Array(4)].map((_, i) => (
                <Skeleton key={i} className="h-24" />
              ))}
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[...Array(3)].map((_, i) => (
                <Skeleton key={i} className="h-64" />
              ))}
            </div>
          </div>
        </div>
      </TraderProtection>
    );
  }

  return (
    <TraderProtection>
      <div className="min-h-screen bg-background relative flex">
        <Sidebar onComingSoonClick={setComingSoonFeature} />
        <div className="flex-1 ml-16">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-background to-accent/10 pointer-events-none"></div>
          <TraderHeader showAccountStats={false} />
          <div className="container mx-auto p-6 relative z-10">
        <div className="flex items-start justify-between gap-6 mb-6">
          <div className="flex-1">
            <div className="flex items-center justify-between mb-2">
              <h1 className="text-3xl font-bold">Amps - My Trading Algorithms</h1>
              <Button onClick={() => setShowAddModal(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Add Algorithm
              </Button>
            </div>
            <p className="text-muted-foreground">Manage your active trading strategies</p>
          </div>
          
          {/* Trading Control Card */}
          <Card className="w-64 shrink-0">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center justify-between text-sm">
                <div className="flex items-center space-x-2">
                  <Zap className="h-4 w-4" style={{ color: '#5a3a1a' }} />
                  <span>Trading Control</span>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {/* Status */}
              <div className="text-xs space-y-1 p-2 bg-muted/50 rounded">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Active Signals:</span>
                  <span className="font-medium">{signalStats.count}</span>
                </div>
                {signalStats.lastGenerated && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Last Generated:</span>
                    <span className="font-medium">
                      {new Date(signalStats.lastGenerated).toLocaleTimeString()}
                    </span>
                  </div>
                )}
              </div>

              {/* Auto-Trading Toggle */}
              <div className="flex items-center justify-between pt-1">
                <span className="text-xs font-medium">Auto-Trading</span>
                <Switch
                  checked={autoTradeEnabled}
                  onCheckedChange={handleAutoTradeToggle}
                />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Summary Cards - Compact */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3 mb-6">
        <Card className="p-3">
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-primary/10 rounded">
              <DollarSign className="w-4 h-4 text-primary" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Total Allocated</p>
              <p className="text-base font-bold">
                ${summary.total_allocated.toLocaleString('en-US', { minimumFractionDigits: 2 })}
              </p>
            </div>
          </div>
        </Card>

        <Card className="p-3">
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-green-500/10 rounded">
              <TrendingUp className="w-4 h-4 text-green-500" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Available Capital</p>
              <p className="text-base font-bold">
                ${summary.available_capital.toLocaleString('en-US', { minimumFractionDigits: 2 })}
              </p>
            </div>
          </div>
        </Card>

        <Card className="p-3">
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-blue-500/10 rounded">
              <Zap className="w-4 h-4 text-blue-500" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Total Algorithms</p>
              <p className="text-base font-bold">{summary.total_amps}</p>
            </div>
          </div>
        </Card>

        <Card className="p-3">
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-purple-500/10 rounded">
              <Activity className="w-4 h-4 text-purple-500" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Active Algorithms</p>
              <p className="text-base font-bold">{summary.active_amps}</p>
            </div>
          </div>
        </Card>
        </div>

        {/* Amps Grid */}
        {amps.length === 0 ? (
        <Card className="p-12 text-center">
          <div className="max-w-md mx-auto space-y-4">
            <div className="w-16 h-16 mx-auto bg-muted rounded-full flex items-center justify-center">
              <Zap className="w-8 h-8 text-muted-foreground" />
            </div>
            <h3 className="text-xl font-semibold">No Algorithms Yet</h3>
            <p className="text-muted-foreground">
              Get started by adding your first trading algorithm. Each algorithm can run independently with its own capital and settings.
            </p>
            <Button onClick={() => setShowAddModal(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Add Your First Algorithm
            </Button>
          </div>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {amps.map((amp) => (
              <AmpCard
                key={amp.id}
                amp={amp}
                onToggle={toggleAmpActive}
                onAllocate={handleAllocateClick}
                onSettings={handleSettingsClick}
              />
            ))}
          </div>
        )}

        {/* Modals */}
        <AddAmpModal
          open={showAddModal}
          onOpenChange={setShowAddModal}
          onAdd={addAmp}
          availableCapital={summary.available_capital}
        />

        <AllocateCapitalModal
          open={showAllocateModal}
          onOpenChange={setShowAllocateModal}
          amp={selectedAmp}
          onAllocate={allocateCapital}
          availableCapital={summary.available_capital}
        />

        <AmpSettingsModal
          open={showSettingsModal}
          onOpenChange={setShowSettingsModal}
          amp={selectedAmp}
          onSave={updateSettings}
        />
          </div>
        </div>
        <ComingSoonModal
          open={comingSoonFeature !== null}
          onOpenChange={(open) => !open && setComingSoonFeature(null)}
          featureName={comingSoonFeature || ""}
        />
      </div>
    </TraderProtection>
  );
}
