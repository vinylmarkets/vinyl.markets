import React from 'react';
import { motion } from 'framer-motion';
import { X, Activity, Database, Globe, Server } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import type { SystemNode } from '@/hooks/useSystemMetrics';

interface NodeDetailsPanelProps {
  node: SystemNode;
  onClose: () => void;
}

export const NodeDetailsPanel: React.FC<NodeDetailsPanelProps> = ({ node, onClose }) => {
  const getNodeIcon = () => {
    switch (node.type) {
      case 'database': return <Database className="w-5 h-5" />;
      case 'api': return <Globe className="w-5 h-5" />;
      default: return <Server className="w-5 h-5" />;
    }
  };

  const getStatusColor = () => {
    switch (node.status) {
      case 'healthy': return 'bg-green-500';
      case 'warning': return 'bg-yellow-500';
      case 'critical': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 300 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 300 }}
      transition={{ type: 'spring', damping: 20 }}
      className="fixed right-4 top-24 w-96 z-50"
    >
      <Card className="border-white/10 bg-white/5 backdrop-blur-xl">
        <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-4">
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-lg bg-primary/10`}>
              {getNodeIcon()}
            </div>
            <div>
              <CardTitle className="text-lg text-white">{node.name}</CardTitle>
              <div className="flex items-center gap-2 mt-1">
                <div className={`w-2 h-2 rounded-full ${getStatusColor()}`} />
                <span className="text-xs text-muted-foreground capitalize">{node.status}</span>
              </div>
            </div>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="text-muted-foreground hover:text-white"
          >
            <X className="w-4 h-4" />
          </Button>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* Health Score */}
          <div>
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm text-muted-foreground">Health Score</span>
              <span className="text-lg font-bold text-white">{node.health}%</span>
            </div>
            <div className="h-2 bg-white/10 rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${node.health}%` }}
                transition={{ duration: 1, ease: 'easeOut' }}
                className={`h-full ${
                  node.health >= 80 ? 'bg-green-500' :
                  node.health >= 60 ? 'bg-yellow-500' : 'bg-red-500'
                }`}
              />
            </div>
          </div>

          {/* Metrics */}
          <div className="space-y-3">
            <h4 className="text-sm font-semibold text-white">Real-time Metrics</h4>
            <div className="grid grid-cols-2 gap-3">
              {node.metrics.connections !== undefined && (
                <div className="p-3 rounded-lg bg-white/5 border border-white/10">
                  <div className="text-xs text-muted-foreground mb-1">Connections</div>
                  <div className="text-lg font-bold text-white">{node.metrics.connections}</div>
                </div>
              )}
              {node.metrics.queriesPerSec !== undefined && (
                <div className="p-3 rounded-lg bg-white/5 border border-white/10">
                  <div className="text-xs text-muted-foreground mb-1">Queries/sec</div>
                  <div className="text-lg font-bold text-white">{node.metrics.queriesPerSec}</div>
                </div>
              )}
              {node.metrics.requestsPerMin !== undefined && (
                <div className="p-3 rounded-lg bg-white/5 border border-white/10">
                  <div className="text-xs text-muted-foreground mb-1">Requests/min</div>
                  <div className="text-lg font-bold text-white">{node.metrics.requestsPerMin}</div>
                </div>
              )}
              {node.metrics.responseTime !== undefined && (
                <div className="p-3 rounded-lg bg-white/5 border border-white/10">
                  <div className="text-xs text-muted-foreground mb-1">Response Time</div>
                  <div className="text-lg font-bold text-white">{node.metrics.responseTime}ms</div>
                </div>
              )}
              {node.metrics.errorRate !== undefined && (
                <div className="p-3 rounded-lg bg-white/5 border border-white/10">
                  <div className="text-xs text-muted-foreground mb-1">Error Rate</div>
                  <div className="text-lg font-bold text-white">{node.metrics.errorRate}%</div>
                </div>
              )}
              {node.metrics.activeUsers !== undefined && (
                <div className="p-3 rounded-lg bg-white/5 border border-white/10">
                  <div className="text-xs text-muted-foreground mb-1">Active Users</div>
                  <div className="text-lg font-bold text-white">{node.metrics.activeUsers}</div>
                </div>
              )}
            </div>
          </div>

          {/* Quick Actions */}
          <div className="space-y-2">
            <h4 className="text-sm font-semibold text-white">Quick Actions</h4>
            <div className="flex flex-wrap gap-2">
              <Badge variant="outline" className="cursor-pointer hover:bg-white/10">
                View Logs
              </Badge>
              <Badge variant="outline" className="cursor-pointer hover:bg-white/10">
                Run Diagnostic
              </Badge>
              <Badge variant="outline" className="cursor-pointer hover:bg-white/10">
                Clear Cache
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};
