import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Plus, TrendingUp, DollarSign, Zap, Activity, ArrowLeft } from 'lucide-react';
import { useUserAmps } from '@/hooks/useUserAmps';
import { AmpCard } from '@/components/amps/AmpCard';
import { AddAmpModal } from '@/components/amps/AddAmpModal';
import { AllocateCapitalModal } from '@/components/amps/AllocateCapitalModal';
import { AmpSettingsModal } from '@/components/amps/AmpSettingsModal';
import { UserAmp } from '@/types/amps';
import { TraderHeader } from '@/trader-platform/components/TraderHeader';
import { TraderProtection } from '@/components/trader/TraderProtection';

export default function MyAmps() {
  const { amps, summary, isLoading, toggleAmpActive, allocateCapital, addAmp, updateSettings } = useUserAmps();
  const [showAddModal, setShowAddModal] = useState(false);
  const [showAllocateModal, setShowAllocateModal] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [selectedAmp, setSelectedAmp] = useState<UserAmp | null>(null);

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
      <div className="min-h-screen bg-background relative">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-background to-accent/10 pointer-events-none"></div>
        <TraderHeader showAccountStats={false} />
      {/* Header */}
      <div className="container mx-auto p-6 relative z-10">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold">Amps - My Trading Algorithms</h1>
            <p className="text-muted-foreground">Manage your active trading strategies</p>
          </div>
          <Button onClick={() => setShowAddModal(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Add Algorithm
          </Button>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-lg">
              <DollarSign className="w-5 h-5 text-primary" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total Allocated</p>
              <p className="text-xl font-bold">
                ${summary.total_allocated.toLocaleString('en-US', { minimumFractionDigits: 2 })}
              </p>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-500/10 rounded-lg">
              <TrendingUp className="w-5 h-5 text-green-500" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Available Capital</p>
              <p className="text-xl font-bold">
                ${summary.available_capital.toLocaleString('en-US', { minimumFractionDigits: 2 })}
              </p>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-500/10 rounded-lg">
              <Zap className="w-5 h-5 text-blue-500" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total Algorithms</p>
              <p className="text-xl font-bold">{summary.total_amps}</p>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-500/10 rounded-lg">
              <Activity className="w-5 h-5 text-purple-500" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Active Algorithms</p>
              <p className="text-xl font-bold">{summary.active_amps}</p>
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
  </TraderProtection>
  );
}
