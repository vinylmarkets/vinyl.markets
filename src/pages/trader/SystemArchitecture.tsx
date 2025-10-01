import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { TraderProtection } from '@/components/trader/TraderProtection';
import { VisualizationControls } from '@/components/system-maps/VisualizationControls';
import { NodeDetailsPanel } from '@/components/system-maps/NodeDetailsPanel';
import { MetricsCards } from '@/components/system-maps/MetricsCards';
import { ArchitectureVisualizer } from '@/components/system-maps/ArchitectureVisualizer';
import { useSystemMetrics } from '@/hooks/useSystemMetrics';
import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

export type VisualizationType = 'network' | 'sankey' | 'sunburst' | 'treemap' | 'chord' | 'force-directed';
export type TimeRange = '1h' | '24h' | '7d' | '30d';
export type RefreshInterval = 'off' | '5s' | '30s' | '1m' | '5m';

const SystemArchitecture = () => {
  const [visualizationType, setVisualizationType] = useState<VisualizationType>('network');
  const [timeRange, setTimeRange] = useState<TimeRange>('24h');
  const [refreshInterval, setRefreshInterval] = useState<RefreshInterval>('30s');
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [searchFilter, setSearchFilter] = useState('');
  const [isFullscreen, setIsFullscreen] = useState(false);

  const autoRefresh = refreshInterval !== 'off';
  const intervalMs = refreshInterval === '5s' ? 5000 : refreshInterval === '30s' ? 30000 : refreshInterval === '1m' ? 60000 : 300000;
  
  const { metrics, loading, refetch } = useSystemMetrics(autoRefresh, intervalMs);

  const selectedNode = metrics?.nodes.find(n => n.id === selectedNodeId);

  const handleExport = (format: 'png' | 'svg' | 'json') => {
    console.log(`Exporting as ${format}`);
    // Export functionality would be implemented here
  };

  return (
    <TraderProtection>
      <div className="min-h-screen bg-gradient-to-br from-[#0a0a0f] via-[#1a1a2e] to-[#0a0a0f]">
        {/* Header */}
        <header className="border-b border-white/10 backdrop-blur-xl bg-white/5">
          <div className="container mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Link 
                  to="/trader" 
                  className="flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span className="text-sm">Back to Dashboard</span>
                </Link>
                <div className="h-6 w-px bg-white/10" />
                <div>
                  <h1 className="text-2xl font-bold bg-gradient-to-r from-[#00ffff] via-[#ff00ff] to-[#00ff88] bg-clip-text text-transparent">
                    System Architecture
                  </h1>
                  <p className="text-sm text-muted-foreground">Real-time infrastructure monitoring and visualization</p>
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <div className="container mx-auto px-4 py-6">
          {/* Control Panel */}
          <VisualizationControls
            visualizationType={visualizationType}
            onVisualizationTypeChange={setVisualizationType}
            timeRange={timeRange}
            onTimeRangeChange={setTimeRange}
            refreshInterval={refreshInterval}
            onRefreshIntervalChange={setRefreshInterval}
            searchFilter={searchFilter}
            onSearchFilterChange={setSearchFilter}
            isFullscreen={isFullscreen}
            onFullscreenToggle={() => setIsFullscreen(!isFullscreen)}
            onExport={handleExport}
            onRefresh={refetch}
          />

          {/* Main Visualization Area */}
          <motion.div 
            className="mt-6 relative"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="rounded-3xl border border-white/10 bg-white/5 backdrop-blur-xl overflow-hidden"
                 style={{ height: isFullscreen ? 'calc(100vh - 200px)' : '600px' }}>
              {loading ? (
                <div className="flex items-center justify-center h-full">
                  <div className="text-center">
                    <div className="w-16 h-16 border-4 border-[#00ff88] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-muted-foreground">Loading system metrics...</p>
                  </div>
                </div>
              ) : metrics ? (
                <ArchitectureVisualizer
                  metrics={metrics}
                  visualizationType={visualizationType}
                  searchFilter={searchFilter}
                  onNodeClick={setSelectedNodeId}
                />
              ) : (
                <div className="flex items-center justify-center h-full">
                  <p className="text-muted-foreground">No data available</p>
                </div>
              )}
            </div>
          </motion.div>

          {/* Node Details Panel */}
          <AnimatePresence>
            {selectedNode && (
              <NodeDetailsPanel
                node={selectedNode}
                onClose={() => setSelectedNodeId(null)}
              />
            )}
          </AnimatePresence>

          {/* Statistics Dashboard */}
          {metrics && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <MetricsCards metrics={metrics} />
            </motion.div>
          )}
        </div>

        {/* Particle Background Effect */}
        <div className="fixed inset-0 pointer-events-none overflow-hidden -z-10">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(124,58,237,0.1),transparent_50%)]" />
        </div>
      </div>
    </TraderProtection>
  );
};

export default SystemArchitecture;
