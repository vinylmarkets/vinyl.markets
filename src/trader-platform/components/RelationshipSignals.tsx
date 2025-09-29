import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { 
  TrendingUp, 
  TrendingDown, 
  ArrowRight, 
  Activity, 
  Target,
  ChevronDown,
  ChevronUp,
  RefreshCw,
  Zap
} from "lucide-react";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";

interface RelationshipSignal {
  id: string;
  signal_type: 'sympathy' | 'sector_rotation' | 'pair_trade' | 'index_arbitrage';
  symbol_a?: string;
  symbol_b?: string;
  from_sector?: string;
  to_sector?: string;
  correlation_coefficient?: number;
  strength: number;
  confidence: number;
  message: string;
  metadata?: any;
  created_at: string;
  expires_at: string;
}

interface ConfidenceBoost {
  symbol: string;
  baseConfidence: number;
  boostedConfidence: number;
  correlatedSignals: number;
  boost: number;
}

export const RelationshipSignals: React.FC = () => {
  const [signals, setSignals] = useState<RelationshipSignal[]>([]);
  const [confidenceBoosts, setConfidenceBoosts] = useState<ConfidenceBoost[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedSignal, setExpandedSignal] = useState<string | null>(null);
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date());

  useEffect(() => {
    fetchRelationshipSignals();
    generateConfidenceBoosts();
    
    // Refresh every 30 seconds
    const interval = setInterval(() => {
      fetchRelationshipSignals();
      generateConfidenceBoosts();
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  const fetchRelationshipSignals = async () => {
    try {
      // For now, use mock data since the trading schema might not be accessible from client
      const mockSignals: RelationshipSignal[] = [
        {
          id: '1',
          signal_type: 'sympathy',
          symbol_a: 'AMD',
          symbol_b: 'NVDA',
          correlation_coefficient: 0.85,
          strength: 5.2,
          confidence: 0.85,
          message: 'AMD is up 5.2%, NVDA usually follows (85% correlation)',
          created_at: new Date().toISOString(),
          expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
        },
        {
          id: '2',
          signal_type: 'sector_rotation',
          from_sector: 'Technology',
          to_sector: 'Energy',
          strength: -2.1,
          confidence: 0.73,
          message: 'Money flowing out of Tech into Energy sectors',
          created_at: new Date().toISOString(),
          expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
        },
        {
          id: '3',
          signal_type: 'pair_trade',
          symbol_a: 'GOOGL',
          symbol_b: 'META',
          correlation_coefficient: 0.67,
          strength: 2.0,
          confidence: 0.67,
          message: 'GOOGL/META spread at 2-sigma, mean reversion opportunity',
          created_at: new Date().toISOString(),
          expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
        },
        {
          id: '4',
          signal_type: 'index_arbitrage',
          symbol_a: 'SPY',
          symbol_b: 'VOO',
          strength: 1.3,
          confidence: 0.78,
          message: 'SPY components lagging index movement by 1.3%',
          created_at: new Date().toISOString(),
          expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
        }
      ];

      setSignals(mockSignals);
      setLastRefresh(new Date());
    } catch (error) {
      console.error('Error fetching relationship signals:', error);
    } finally {
      setLoading(false);
    }
  };

  const generateConfidenceBoosts = () => {
    // Mock confidence boosts based on multiple correlated signals
    const boosts: ConfidenceBoost[] = [
      {
        symbol: 'AAPL',
        baseConfidence: 72,
        boostedConfidence: 87,
        correlatedSignals: 3,
        boost: 15
      },
      {
        symbol: 'TSLA',
        baseConfidence: 65,
        boostedConfidence: 78,
        correlatedSignals: 2,
        boost: 13
      }
    ];

    setConfidenceBoosts(boosts);
  };

  const getSignalIcon = (type: RelationshipSignal['signal_type']) => {
    switch (type) {
      case 'sympathy': return <TrendingUp className="h-4 w-4" />;
      case 'sector_rotation': return <ArrowRight className="h-4 w-4" />;
      case 'pair_trade': return <Activity className="h-4 w-4" />;
      case 'index_arbitrage': return <Target className="h-4 w-4" />;
      default: return <Activity className="h-4 w-4" />;
    }
  };

  const getSignalColor = (type: RelationshipSignal['signal_type']) => {
    switch (type) {
      case 'sympathy': return 'text-green-500 border-green-500';
      case 'sector_rotation': return 'text-blue-500 border-blue-500';
      case 'pair_trade': return 'text-purple-500 border-purple-500';
      case 'index_arbitrage': return 'text-orange-500 border-orange-500';
      default: return 'text-gray-500 border-gray-500';
    }
  };

  const getStrengthColor = (strength: number) => {
    if (Math.abs(strength) > 3) return 'text-red-500';
    if (Math.abs(strength) > 1.5) return 'text-orange-500';
    return 'text-green-500';
  };

  const handleRefresh = async () => {
    setLoading(true);
    await fetchRelationshipSignals();
    generateConfidenceBoosts();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Relationship-Based Signals</h3>
          <p className="text-sm text-muted-foreground">
            Last updated: {lastRefresh.toLocaleTimeString()}
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={handleRefresh}
          disabled={loading}
        >
          <RefreshCw className={cn("h-4 w-4 mr-2", loading && "animate-spin")} />
          Refresh
        </Button>
      </div>

      {/* Confidence Boosts */}
      {confidenceBoosts.length > 0 && (
        <Card className="border-amber-200 bg-amber-50/50 dark:border-amber-800 dark:bg-amber-950/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-amber-700 dark:text-amber-300">
              <Zap className="h-5 w-5" />
              Confidence Boosts
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {confidenceBoosts.map((boost, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-background rounded-lg border">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary">{boost.symbol}</Badge>
                    <span className="text-sm text-muted-foreground">
                      {boost.correlatedSignals} correlated signals detected
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <span className="text-muted-foreground">
                      {boost.baseConfidence}% → {boost.boostedConfidence}%
                    </span>
                    <Badge variant="outline" className="text-amber-600">
                      +{boost.boost}%
                    </Badge>
                  </div>
                </div>
                <Progress value={boost.boostedConfidence} className="w-20" />
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Relationship Signals */}
      <div className="grid gap-4">
        {signals.map((signal) => (
          <Card 
            key={signal.id} 
            className={cn(
              "border-l-4 transition-all duration-200",
              getSignalColor(signal.signal_type).replace('text-', 'border-').split(' ')[0]
            )}
          >
            <CardContent className="p-4">
              <div className="space-y-3">
                {/* Signal Header */}
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3">
                    <div className={cn("mt-1", getSignalColor(signal.signal_type).split(' ')[0])}>
                      {getSignalIcon(signal.signal_type)}
                    </div>
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-medium capitalize">
                          {signal.signal_type.replace('_', ' ')}
                        </span>
                        <Badge variant="outline" className="text-xs">
                          {(signal.confidence * 100).toFixed(0)}% confidence
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {signal.message}
                      </p>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setExpandedSignal(
                      expandedSignal === signal.id ? null : signal.id
                    )}
                  >
                    {expandedSignal === signal.id ? (
                      <ChevronUp className="h-4 w-4" />
                    ) : (
                      <ChevronDown className="h-4 w-4" />
                    )}
                  </Button>
                </div>

                {/* Signal Symbols/Sectors */}
                <div className="flex items-center gap-2">
                  {signal.symbol_a && (
                    <Badge variant="secondary">{signal.symbol_a}</Badge>
                  )}
                  {signal.symbol_b && (
                    <>
                      <ArrowRight className="h-3 w-3 text-muted-foreground" />
                      <Badge variant="secondary">{signal.symbol_b}</Badge>
                    </>
                  )}
                  {signal.from_sector && signal.to_sector && (
                    <>
                      <Badge variant="outline" className="text-red-500">
                        {signal.from_sector}
                      </Badge>
                      <ArrowRight className="h-3 w-3 text-muted-foreground" />
                      <Badge variant="outline" className="text-green-500">
                        {signal.to_sector}
                      </Badge>
                    </>
                  )}
                </div>

                {/* Signal Metrics */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4 text-sm">
                    <div>
                      <span className="text-muted-foreground">Strength: </span>
                      <span className={getStrengthColor(signal.strength)}>
                        {signal.strength > 0 ? '+' : ''}{signal.strength.toFixed(1)}%
                      </span>
                    </div>
                    {signal.correlation_coefficient && (
                      <div>
                        <span className="text-muted-foreground">Correlation: </span>
                        <span className="font-medium">
                          {(signal.correlation_coefficient * 100).toFixed(0)}%
                        </span>
                      </div>
                    )}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {new Date(signal.created_at).toLocaleTimeString()}
                  </div>
                </div>

                {/* Expanded Details */}
                {expandedSignal === signal.id && (
                  <div className="pt-3 border-t border-border space-y-2">
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-muted-foreground">Signal Type:</span>
                        <p className="font-medium capitalize">
                          {signal.signal_type.replace('_', ' ')}
                        </p>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Expires:</span>
                        <p className="font-medium">
                          {new Date(signal.expires_at).toLocaleString()}
                        </p>
                      </div>
                    </div>
                    
                    {/* Action Suggestions */}
                    <div className="p-3 bg-muted/50 rounded-lg">
                      <h4 className="font-medium text-sm mb-2">Suggested Actions:</h4>
                      <ul className="text-sm text-muted-foreground space-y-1">
                        {signal.signal_type === 'sympathy' && (
                          <>
                            <li>• Monitor {signal.symbol_b} for follow-through movement</li>
                            <li>• Consider position sizing based on correlation strength</li>
                          </>
                        )}
                        {signal.signal_type === 'sector_rotation' && (
                          <>
                            <li>• Reduce exposure to {signal.from_sector} stocks</li>
                            <li>• Increase allocation to {signal.to_sector} opportunities</li>
                          </>
                        )}
                        {signal.signal_type === 'pair_trade' && (
                          <>
                            <li>• Long {signal.symbol_a}, short {signal.symbol_b}</li>
                            <li>• Set stop loss at 3-sigma spread level</li>
                          </>
                        )}
                        {signal.signal_type === 'index_arbitrage' && (
                          <>
                            <li>• Look for lagging components to catch up</li>
                            <li>• Consider ETF vs individual stock plays</li>
                          </>
                        )}
                      </ul>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {signals.length === 0 && (
        <Card>
          <CardContent className="py-12 text-center">
            <Activity className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">No Relationship Signals</h3>
            <p className="text-muted-foreground">
              No correlation-based trading signals detected at this time.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};