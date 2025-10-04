import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AutoRebalancer, RebalancingPlan, RebalancingStrategy } from '@/lib/ampLayering/autoRebalancer';
import { ArrowRight, TrendingUp, Shield, DollarSign } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Badge } from '@/components/ui/badge';

interface AutoRebalancePanelProps {
  layerId: string;
  onRebalanced?: () => void;
}

export const AutoRebalancePanel: React.FC<AutoRebalancePanelProps> = ({ layerId, onRebalanced }) => {
  const [strategy, setStrategy] = useState<RebalancingStrategy>({
    type: 'performance',
    minRebalanceThreshold: 5,
    maxAllocationChange: 30
  });
  const [plan, setPlan] = useState<RebalancingPlan | null>(null);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const analyzeRebalancing = async () => {
    try {
      setLoading(true);
      const rebalancer = new AutoRebalancer();
      const result = await rebalancer.analyzeRebalancing(layerId, strategy, 30);
      setPlan(result);
    } catch (error: any) {
      toast({
        title: 'Error analyzing rebalancing',
        description: error.message,
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const executeRebalancing = async () => {
    if (!plan) return;

    try {
      setLoading(true);
      const rebalancer = new AutoRebalancer();
      await rebalancer.executeRebalancing(plan);
      toast({
        title: 'Rebalancing complete',
        description: 'Your layer has been rebalanced successfully'
      });
      onRebalanced?.();
      setPlan(null);
    } catch (error: any) {
      toast({
        title: 'Error executing rebalancing',
        description: error.message,
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const getStrategyIcon = (type: string) => {
    switch (type) {
      case 'performance': return <TrendingUp className="w-4 h-4" />;
      case 'risk': return <Shield className="w-4 h-4" />;
      case 'kelly': return <DollarSign className="w-4 h-4" />;
      default: return null;
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Auto-Rebalancing</CardTitle>
        <CardDescription>
          Automatically optimize capital allocation based on performance
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium mb-2 block">Rebalancing Strategy</label>
            <Select
              value={strategy.type}
              onValueChange={(value: any) => setStrategy({ ...strategy, type: value })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="performance">
                  <div className="flex items-center gap-2">
                    <TrendingUp className="w-4 h-4" />
                    Performance-Based
                  </div>
                </SelectItem>
                <SelectItem value="risk">
                  <div className="flex items-center gap-2">
                    <Shield className="w-4 h-4" />
                    Risk-Adjusted
                  </div>
                </SelectItem>
                <SelectItem value="kelly">
                  <div className="flex items-center gap-2">
                    <DollarSign className="w-4 h-4" />
                    Kelly Criterion
                  </div>
                </SelectItem>
                <SelectItem value="equal">Equal Weight</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Button onClick={analyzeRebalancing} disabled={loading} className="w-full">
            {loading ? 'Analyzing...' : 'Analyze Rebalancing'}
          </Button>
        </div>

        {plan && (
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 rounded-lg bg-muted">
              <div>
                <div className="font-semibold">Recommendation</div>
                <div className="text-sm text-muted-foreground">
                  {plan.shouldRebalance ? 'Rebalancing recommended' : 'No rebalancing needed'}
                </div>
              </div>
              <Badge variant={plan.shouldRebalance ? 'default' : 'secondary'}>
                {plan.totalChangePercent.toFixed(1)}% change
              </Badge>
            </div>

            {plan.shouldRebalance && (
              <>
                <div className="space-y-3">
                  <h4 className="font-semibold">Proposed Changes</h4>
                  {plan.changes.map((change, idx) => (
                    <div key={idx} className="p-4 rounded-lg border">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-medium">{change.ampId}</span>
                        <Badge variant={change.changePercent > 0 ? 'default' : 'secondary'}>
                          {change.changePercent > 0 ? '+' : ''}{change.changePercent.toFixed(1)}%
                        </Badge>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <span>${change.currentAllocation.toFixed(2)}</span>
                        <ArrowRight className="w-4 h-4" />
                        <span>${change.proposedAllocation.toFixed(2)}</span>
                      </div>
                      <p className="text-xs text-muted-foreground mt-2">{change.reason}</p>
                    </div>
                  ))}
                </div>

                <Button onClick={executeRebalancing} disabled={loading} className="w-full">
                  {loading ? 'Executing...' : 'Execute Rebalancing'}
                </Button>
              </>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
