import React from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import {
  Download,
  Maximize2,
  Minimize2,
  RefreshCw,
  Search,
} from 'lucide-react';
import type { VisualizationType, TimeRange, RefreshInterval } from '@/pages/trader/SystemArchitecture';

interface VisualizationControlsProps {
  visualizationType: VisualizationType;
  onVisualizationTypeChange: (type: VisualizationType) => void;
  timeRange: TimeRange;
  onTimeRangeChange: (range: TimeRange) => void;
  refreshInterval: RefreshInterval;
  onRefreshIntervalChange: (interval: RefreshInterval) => void;
  searchFilter: string;
  onSearchFilterChange: (filter: string) => void;
  isFullscreen: boolean;
  onFullscreenToggle: () => void;
  onExport: (format: 'png' | 'svg' | 'json') => void;
  onRefresh: () => void;
}

export const VisualizationControls: React.FC<VisualizationControlsProps> = ({
  visualizationType,
  onVisualizationTypeChange,
  timeRange,
  onTimeRangeChange,
  refreshInterval,
  onRefreshIntervalChange,
  searchFilter,
  onSearchFilterChange,
  isFullscreen,
  onFullscreenToggle,
  onExport,
  onRefresh,
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="rounded-3xl border border-white/10 bg-white/5 backdrop-blur-xl p-4"
    >
      <div className="flex flex-wrap items-center gap-4">
        {/* Visualization Type */}
        <div className="flex-1 min-w-[200px]">
          <Select value={visualizationType} onValueChange={(v) => onVisualizationTypeChange(v as VisualizationType)}>
            <SelectTrigger className="bg-white/5 border-white/10">
              <SelectValue placeholder="Select visualization" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="network">Network Graph</SelectItem>
              <SelectItem value="sankey">Sankey Diagram</SelectItem>
              <SelectItem value="sunburst">Sunburst Chart</SelectItem>
              <SelectItem value="treemap">Treemap</SelectItem>
              <SelectItem value="chord">Chord Diagram</SelectItem>
              <SelectItem value="force-directed">Force-Directed Graph</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Time Range */}
        <Select value={timeRange} onValueChange={(v) => onTimeRangeChange(v as TimeRange)}>
          <SelectTrigger className="w-32 bg-white/5 border-white/10">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="1h">Last Hour</SelectItem>
            <SelectItem value="24h">24 Hours</SelectItem>
            <SelectItem value="7d">7 Days</SelectItem>
            <SelectItem value="30d">30 Days</SelectItem>
          </SelectContent>
        </Select>

        {/* Refresh Interval */}
        <Select value={refreshInterval} onValueChange={(v) => onRefreshIntervalChange(v as RefreshInterval)}>
          <SelectTrigger className="w-32 bg-white/5 border-white/10">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="off">No Refresh</SelectItem>
            <SelectItem value="5s">Every 5s</SelectItem>
            <SelectItem value="30s">Every 30s</SelectItem>
            <SelectItem value="1m">Every 1m</SelectItem>
            <SelectItem value="5m">Every 5m</SelectItem>
          </SelectContent>
        </Select>

        {/* Search Filter */}
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search components..."
            value={searchFilter}
            onChange={(e) => onSearchFilterChange(e.target.value)}
            className="pl-10 bg-white/5 border-white/10"
          />
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="icon"
            onClick={onRefresh}
            className="bg-white/5 border-white/10 hover:bg-white/10"
          >
            <RefreshCw className="w-4 h-4" />
          </Button>

          <Select onValueChange={(v) => onExport(v as 'png' | 'svg' | 'json')}>
            <SelectTrigger asChild>
              <Button variant="outline" size="icon" className="bg-white/5 border-white/10 hover:bg-white/10">
                <Download className="w-4 h-4" />
              </Button>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="png">Export as PNG</SelectItem>
              <SelectItem value="svg">Export as SVG</SelectItem>
              <SelectItem value="json">Export as JSON</SelectItem>
            </SelectContent>
          </Select>

          <Button
            variant="outline"
            size="icon"
            onClick={onFullscreenToggle}
            className="bg-white/5 border-white/10 hover:bg-white/10"
          >
            {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </Button>
        </div>
      </div>
    </motion.div>
  );
};
