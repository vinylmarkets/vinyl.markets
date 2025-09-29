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
    <div className="space-y-3">
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div>
          <h3 className="text-base font-semibold">Relationship-Based Signals</h3>
          <p className="text-xs text-muted-foreground">
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
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-amber-700 dark:text-amber-300 text-sm">
              <Zap className="h-4 w-4" />
              Confidence Boosts
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 pt-0">
            {confidenceBoosts.map((boost, index) => (
              <div key={index} className="flex items-center justify-between p-2 bg-background rounded-lg border">
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary" className="text-xs">{boost.symbol}</Badge>
                    <span className="text-xs text-muted-foreground">
                      {boost.correlatedSignals} correlated signals detected
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-xs">
                    <span className="text-muted-foreground">
                      {boost.baseConfidence}% → {boost.boostedConfidence}%
                    </span>
                    <Badge variant="outline" className="text-amber-600">
                      +{boost.boost}%
                    </Badge>
                  </div>
                </div>
                <Progress value={boost.boostedConfidence} className="w-16 h-2" />
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Relationship Signals */}
      <div className="grid grid-cols-4 gap-2">
        {signals.map((signal) => (
          <Card 
            key={signal.id} 
            className={cn(
              "border-l-4 transition-all duration-200 hover:shadow-md h-24",
              getSignalColor(signal.signal_type).replace('text-', 'border-').split(' ')[0]
            )}
          >
            <CardContent className="p-1.5 h-full flex flex-col justify-between">
              <div className="space-y-1">
                {/* Signal Header - Ultra Compact */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1 flex-1 min-w-0">
                    <div className={cn("", getSignalColor(signal.signal_type).split(' ')[0])}>
                      {getSignalIcon(signal.signal_type)}
                    </div>
                    <span className="font-medium text-xs capitalize truncate">
                      {signal.signal_type.replace('_', ' ')}
                    </span>
                  </div>
                  <Badge variant="outline" className="text-xs shrink-0 px-1">
                    {(signal.confidence * 100).toFixed(0)}%
                  </Badge>
                </div>

                {/* Signal Symbols/Sectors - Ultra Compact */}
                <div className="flex items-center gap-0.5 flex-wrap text-xs">
                  {signal.symbol_a && (
                    <Badge variant="secondary" className="text-xs px-1 py-0">{signal.symbol_a}</Badge>
                  )}
                  {signal.symbol_b && (
                    <>
                      <ArrowRight className="h-2 w-2 text-muted-foreground" />
                      <Badge variant="secondary" className="text-xs px-1 py-0">{signal.symbol_b}</Badge>
                    </>
                  )}
                  {signal.from_sector && signal.to_sector && (
                    <>
                      <Badge variant="outline" className="text-xs px-1 py-0 text-red-500">
                        {signal.from_sector.substring(0, 3)}
                      </Badge>
                      <ArrowRight className="h-2 w-2 text-muted-foreground" />
                      <Badge variant="outline" className="text-xs px-1 py-0 text-green-500">
                        {signal.to_sector.substring(0, 3)}
                      </Badge>
                    </>
                  )}
                </div>

              </div>

              {/* Signal Metrics - Bottom */}
              <div className="flex items-center justify-between text-xs leading-none">
                <div className="flex items-center gap-1">
                  <span className="text-muted-foreground">Str:</span>
                  <span className={getStrengthColor(signal.strength)}>
                    {signal.strength > 0 ? '+' : ''}{signal.strength.toFixed(1)}%
                  </span>
                </div>
                {signal.correlation_coefficient && (
                  <div className="flex items-center gap-1">
                    <span className="text-muted-foreground">Corr:</span>
                    <span className="font-medium">
                      {(signal.correlation_coefficient * 100).toFixed(0)}%
                    </span>
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