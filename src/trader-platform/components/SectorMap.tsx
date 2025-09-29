import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { TrendingUp, TrendingDown, Activity, ArrowRight, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";

interface SectorData {
  sector: string;
  day_change_percent: number;
  week_change_percent: number;
  relative_strength: number;
  leading_stocks: string[];
  signal_count?: number;
  unusual_activity?: boolean;
}

interface CorrelationSignal {
  type: 'sympathy' | 'rotation' | 'pair_trade' | 'index_arbitrage';
  message: string;
  symbols: string[];
  confidence: number;
  strength: number;
}

const SECTOR_COLORS = {
  'Technology': 'from-blue-500 to-blue-600',
  'Financial Services': 'from-green-500 to-green-600',
  'Healthcare': 'from-red-500 to-red-600',
  'Consumer Discretionary': 'from-purple-500 to-purple-600',
  'Consumer Staples': 'from-orange-500 to-orange-600',
  'Energy': 'from-yellow-500 to-yellow-600',
  'Industrials': 'from-gray-500 to-gray-600',
  'Materials': 'from-brown-500 to-brown-600',
  'Real Estate': 'from-pink-500 to-pink-600',
  'Utilities': 'from-cyan-500 to-cyan-600',
  'Communication Services': 'from-indigo-500 to-indigo-600',
};

interface SectorCardProps {
  sector: SectorData;
  onClick: (sectorName: string) => void;
}

const SectorCard: React.FC<SectorCardProps> = ({ sector, onClick }) => {
  const getIntensityColor = (change: number) => {
    const intensity = Math.min(Math.abs(change) / 5, 1); // Normalize to 0-1
    if (change > 0) {
      return `rgba(34, 197, 94, ${0.2 + intensity * 0.6})`; // Green with varying opacity
    } else {
      return `rgba(239, 68, 68, ${0.2 + intensity * 0.6})`; // Red with varying opacity
    }
  };

  const baseColor = SECTOR_COLORS[sector.sector as keyof typeof SECTOR_COLORS] || 'from-gray-400 to-gray-500';

  return (
    <Card 
      className={cn(
        "cursor-pointer transition-all duration-300 hover:scale-105 relative overflow-hidden",
        sector.unusual_activity && "animate-pulse"
      )}
      style={{ backgroundColor: getIntensityColor(sector.day_change_percent) }}
      onClick={() => onClick(sector.sector)}
    >
      <div className={cn("absolute inset-0 bg-gradient-to-br opacity-10", baseColor)} />
      
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium text-foreground">
          {sector.sector}
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-xs text-muted-foreground">Daily</span>
          <div className="flex items-center gap-1">
            {sector.day_change_percent > 0 ? (
              <TrendingUp className="h-3 w-3 text-green-500" />
            ) : (
              <TrendingDown className="h-3 w-3 text-red-500" />
            )}
            <span className={cn(
              "text-xs font-medium",
              sector.day_change_percent > 0 ? "text-green-500" : "text-red-500"
            )}>
              {sector.day_change_percent > 0 ? '+' : ''}{sector.day_change_percent.toFixed(1)}%
            </span>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-xs text-muted-foreground">Strength</span>
          <div className="w-12 h-1 bg-muted rounded-full overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-red-400 to-green-400 transition-all duration-500"
              style={{ width: `${sector.relative_strength * 100}%` }}
            />
          </div>
        </div>

        <div className="space-y-1">
          <div className="text-xs text-muted-foreground">Top Movers</div>
          <div className="flex flex-wrap gap-1">
            {sector.leading_stocks?.slice(0, 2).map((stock) => (
              <Badge key={stock} variant="secondary" className="text-xs">
                {stock}
              </Badge>
            ))}
          </div>
        </div>

        {sector.signal_count && sector.signal_count > 0 && (
          <div className="flex items-center gap-1">
            <Activity className="h-3 w-3 text-blue-500" />
            <span className="text-xs text-blue-500 font-medium">
              {sector.signal_count} signals
            </span>
          </div>
        )}

        {sector.unusual_activity && (
          <Badge variant="destructive" className="text-xs">
            Unusual Activity
          </Badge>
        )}
      </CardContent>
    </Card>
  );
};

interface RelationshipSignalProps {
  signal: CorrelationSignal;
}

const RelationshipSignal: React.FC<RelationshipSignalProps> = ({ signal }) => {
  const getSignalIcon = (type: string) => {
    switch (type) {
      case 'sympathy': return <TrendingUp className="h-4 w-4" />;
      case 'rotation': return <ArrowRight className="h-4 w-4" />;
      case 'pair_trade': return <Activity className="h-4 w-4" />;
      case 'index_arbitrage': return <TrendingDown className="h-4 w-4" />;
      default: return <Activity className="h-4 w-4" />;
    }
  };

  const getSignalColor = (type: string) => {
    switch (type) {
      case 'sympathy': return 'text-green-500';
      case 'rotation': return 'text-blue-500';
      case 'pair_trade': return 'text-purple-500';
      case 'index_arbitrage': return 'text-orange-500';
      default: return 'text-gray-500';
    }
  };

  return (
    <Card className="border-l-4 border-l-blue-500">
      <CardContent className="p-3">
        <div className="flex items-start gap-2">
          <div className={cn("mt-0.5", getSignalColor(signal.type))}>
            {getSignalIcon(signal.type)}
          </div>
          <div className="flex-1">
            <div className="text-sm font-medium capitalize mb-1">
              {signal.type.replace('_', ' ')}
            </div>
            <div className="text-sm text-muted-foreground mb-2">
              {signal.message}
            </div>
            <div className="flex items-center justify-between">
              <div className="flex gap-1">
                {signal.symbols.map((symbol) => (
                  <Badge key={symbol} variant="outline" className="text-xs">
                    {symbol}
                  </Badge>
                ))}
              </div>
              <div className="text-xs text-muted-foreground">
                {(signal.confidence * 100).toFixed(0)}% confidence
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export const SectorMap: React.FC = () => {
  const [sectors, setSectors] = useState<SectorData[]>([]);
  const [relationshipSignals, setRelationshipSignals] = useState<CorrelationSignal[]>([]);
  const [selectedSector, setSelectedSector] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSectorData();
    fetchRelationshipSignals();
  }, []);

  const fetchSectorData = async () => {
    try {
      // Use mock data for now since the trading schema might not be accessible from client
      const mockSectors: SectorData[] = [
        {
          sector: 'Technology',
          day_change_percent: 1.25,
          week_change_percent: 3.45,
          relative_strength: 0.85,
          leading_stocks: ['AAPL', 'MSFT', 'NVDA'],
          signal_count: 8,
          unusual_activity: true
        },
        {
          sector: 'Financial Services',
          day_change_percent: 0.75,
          week_change_percent: 2.10,
          relative_strength: 0.65,
          leading_stocks: ['JPM', 'V', 'MA'],
          signal_count: 5,
          unusual_activity: false
        },
        {
          sector: 'Healthcare',
          day_change_percent: 0.45,
          week_change_percent: 1.80,
          relative_strength: 0.55,
          leading_stocks: ['UNH', 'JNJ'],
          signal_count: 3,
          unusual_activity: false
        },
        {
          sector: 'Consumer Discretionary',
          day_change_percent: 1.85,
          week_change_percent: 4.20,
          relative_strength: 0.78,
          leading_stocks: ['AMZN', 'TSLA', 'HD'],
          signal_count: 12,
          unusual_activity: true
        },
        {
          sector: 'Consumer Staples',
          day_change_percent: -0.25,
          week_change_percent: 0.85,
          relative_strength: 0.45,
          leading_stocks: ['WMT', 'PG'],
          signal_count: 2,
          unusual_activity: false
        },
        {
          sector: 'Energy',
          day_change_percent: 2.15,
          week_change_percent: 5.30,
          relative_strength: 0.82,
          leading_stocks: ['XOM', 'CVX'],
          signal_count: 7,
          unusual_activity: true
        },
        {
          sector: 'Industrials',
          day_change_percent: 0.95,
          week_change_percent: 2.75,
          relative_strength: 0.62,
          leading_stocks: ['BA', 'CAT'],
          signal_count: 4,
          unusual_activity: false
        },
        {
          sector: 'Materials',
          day_change_percent: -0.65,
          week_change_percent: 1.25,
          relative_strength: 0.48,
          leading_stocks: ['LIN', 'APD'],
          signal_count: 1,
          unusual_activity: false
        },
        {
          sector: 'Real Estate',
          day_change_percent: -1.15,
          week_change_percent: -0.45,
          relative_strength: 0.35,
          leading_stocks: ['PLD', 'AMT'],
          signal_count: 0,
          unusual_activity: false
        },
        {
          sector: 'Utilities',
          day_change_percent: -0.35,
          week_change_percent: 0.65,
          relative_strength: 0.42,
          leading_stocks: ['NEE', 'DUK'],
          signal_count: 1,
          unusual_activity: false
        },
        {
          sector: 'Communication Services',
          day_change_percent: 0.85,
          week_change_percent: 2.95,
          relative_strength: 0.68,
          leading_stocks: ['GOOGL', 'META'],
          signal_count: 6,
          unusual_activity: false
        }
      ];

      setSectors(mockSectors);
    } catch (error) {
      console.error('Error fetching sector data:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchRelationshipSignals = async () => {
    // Mock relationship signals - in production, this would come from your correlation analysis
    const mockSignals: CorrelationSignal[] = [
      {
        type: 'sympathy',
        message: 'AMD is up 5%, NVDA usually follows (85% correlation)',
        symbols: ['AMD', 'NVDA'],
        confidence: 0.85,
        strength: 5.2
      },
      {
        type: 'rotation',
        message: 'Money flowing out of Tech into Energy',
        symbols: ['XLK', 'XLE'],
        confidence: 0.73,
        strength: -2.1
      },
      {
        type: 'pair_trade',
        message: 'GOOGL/META spread at 2-sigma, mean reversion opportunity',
        symbols: ['GOOGL', 'META'],
        confidence: 0.67,
        strength: 2.0
      },
      {
        type: 'index_arbitrage',
        message: 'SPY components lagging index movement',
        symbols: ['SPY', 'VOO'],
        confidence: 0.78,
        strength: 1.3
      }
    ];

    setRelationshipSignals(mockSignals);
  };

  const handleSectorClick = (sectorName: string) => {
    setSelectedSector(selectedSector === sectorName ? null : sectorName);
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
      {/* Sector Map Grid */}
      <div>
        <h3 className="text-lg font-semibold mb-4">Sector Heat Map</h3>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
          {sectors.map((sector) => (
            <SectorCard
              key={sector.sector}
              sector={sector}
              onClick={handleSectorClick}
            />
          ))}
        </div>
      </div>

      {/* Selected Sector Details */}
      {selectedSector && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              {selectedSector} Details
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSelectedSector(null)}
              >
                <X className="h-4 w-4" />
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-sm text-muted-foreground">
              Detailed sector analysis would go here - stocks, signals, correlations, etc.
            </div>
          </CardContent>
        </Card>
      )}

      {/* Relationship-Based Signals */}
      <div>
        <h3 className="text-lg font-semibold mb-4">Relationship Signals</h3>
        <div className="grid gap-3">
          {relationshipSignals.map((signal, index) => (
            <RelationshipSignal key={index} signal={signal} />
          ))}
        </div>
      </div>
    </div>
  );
};