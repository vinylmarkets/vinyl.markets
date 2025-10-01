import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { TraderProtection } from '@/components/trader/TraderProtection';
import { AlgorithmSelector } from '@/components/system-maps/AlgorithmSelector';
import { AlgorithmVisualizationTabs } from '@/components/system-maps/AlgorithmVisualizationTabs';
import { AlgorithmMetricsPanel } from '@/components/system-maps/AlgorithmMetricsPanel';
import { AlgorithmControlPanel } from '@/components/system-maps/AlgorithmControlPanel';
import { useAlgorithmMetrics } from '@/hooks/useAlgorithmMetrics';
import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

const AlgorithmAnalysis = () => {
  const [compareMode, setCompareMode] = useState(false);
  const [selectedAlgorithmIds, setSelectedAlgorithmIds] = useState<string[]>([]);
  
  const { 
    algorithms, 
    selectedAlgorithm, 
    flowNodes,
    flowConnections,
    loading, 
    selectAlgorithm 
  } = useAlgorithmMetrics();

  const handleAlgorithmSelect = (algorithmId: string) => {
    if (compareMode) {
      if (selectedAlgorithmIds.includes(algorithmId)) {
        setSelectedAlgorithmIds(prev => prev.filter(id => id !== algorithmId));
      } else if (selectedAlgorithmIds.length < 4) {
        setSelectedAlgorithmIds(prev => [...prev, algorithmId]);
      }
    } else {
      selectAlgorithm(algorithmId);
    }
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
                    Algorithm Analysis
                  </h1>
                  <p className="text-sm text-muted-foreground">Real-time trading algorithm performance and visualization</p>
                </div>
              </div>
            </div>
          </div>
        </header>

        <div className="container mx-auto px-4 py-6">
          <div className="flex gap-6">
            {/* Main Content Area */}
            <div className="flex-1 space-y-6">
              {/* Algorithm Selector */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
              >
                <AlgorithmSelector
                  algorithms={algorithms}
                  selectedIds={compareMode ? selectedAlgorithmIds : selectedAlgorithm ? [selectedAlgorithm.id] : []}
                  onSelect={handleAlgorithmSelect}
                  compareMode={compareMode}
                  onCompareModeToggle={() => setCompareMode(!compareMode)}
                  loading={loading}
                />
              </motion.div>

              {/* Algorithm Control Panel */}
              {selectedAlgorithm && !compareMode && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.1 }}
                >
                  <AlgorithmControlPanel algorithm={selectedAlgorithm} />
                </motion.div>
              )}

              {/* Visualization Tabs */}
              {selectedAlgorithm && !compareMode && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.2 }}
                >
                  <AlgorithmVisualizationTabs
                    algorithm={selectedAlgorithm}
                    flowNodes={flowNodes}
                    flowConnections={flowConnections}
                  />
                </motion.div>
              )}

              {/* Compare Mode View */}
              {compareMode && selectedAlgorithmIds.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.2 }}
                  className="rounded-3xl border border-white/10 bg-white/5 backdrop-blur-xl p-6"
                >
                  <h3 className="text-lg font-semibold text-white mb-4">Algorithm Comparison</h3>
                  <div className="grid grid-cols-2 gap-4">
                    {selectedAlgorithmIds.map(id => {
                      const algo = algorithms.find(a => a.id === id);
                      return algo ? (
                        <div key={id} className="p-4 rounded-xl bg-white/5 border border-white/10">
                          <h4 className="font-medium text-white mb-2">{algo.name}</h4>
                          <div className="space-y-2 text-sm">
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">Win Rate:</span>
                              <span className="text-white">{algo.performance.winRate.toFixed(1)}%</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">Total P&L:</span>
                              <span className={algo.performance.totalPnL >= 0 ? 'text-[#00ff88]' : 'text-red-500'}>
                                ${algo.performance.totalPnL.toFixed(2)}
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">Sharpe:</span>
                              <span className="text-white">{algo.performance.sharpeRatio.toFixed(2)}</span>
                            </div>
                          </div>
                        </div>
                      ) : null;
                    })}
                  </div>
                </motion.div>
              )}
            </div>

            {/* Metrics Sidebar */}
            {selectedAlgorithm && !compareMode && (
              <motion.div
                className="w-80"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.3 }}
              >
                <AlgorithmMetricsPanel algorithm={selectedAlgorithm} />
              </motion.div>
            )}
          </div>
        </div>

        {/* Background Effect */}
        <div className="fixed inset-0 pointer-events-none overflow-hidden -z-10">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(124,58,237,0.1),transparent_50%)]" />
        </div>
      </div>
    </TraderProtection>
  );
};

export default AlgorithmAnalysis;
