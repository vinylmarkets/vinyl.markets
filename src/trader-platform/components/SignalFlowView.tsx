import React, { useState, useEffect } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  TrendingUp, 
  TrendingDown, 
  Activity, 
  Target,
  Zap,
  Brain,
  Waves,
  CheckCircle2,
  X
} from "lucide-react";

interface TradingSignal {
  symbol: string;
  action: 'BUY' | 'SELL' | 'HOLD';
  confidence: number;
  targetPrice: number;
  currentPrice: number;
  reasoning: string;
  timestamp: string;
}

interface SignalFlowViewProps {
  signals: TradingSignal[];
  knowledgeMode: 'simple' | 'academic';
  onSignalAction: (signal: TradingSignal, action: 'execute' | 'pass') => void;
}

interface StrategyNode {
  id: string;
  name: string;
  description: string;
  isActive: boolean;
  signals: number;
  accuracy: number;
  icon: React.ReactNode;
}

interface FloatingSignal extends TradingSignal {
  id: string;
  position: { x: number; y: number };
  velocity: { x: number; y: number };
  isFlipped: boolean;
}

const STRATEGY_NODES: StrategyNode[] = [
  {
    id: 'momentum',
    name: 'Momentum',
    description: 'Looks for stocks moving strongly in one direction',
    isActive: true,
    signals: 3,
    accuracy: 73.2,
    icon: <TrendingUp className="h-4 w-4" />
  },
  {
    id: 'meanreversion',
    name: 'Mean Reversion',
    description: 'Finds oversold/overbought opportunities',
    isActive: true,
    signals: 2,
    accuracy: 68.5,
    icon: <Waves className="h-4 w-4" />
  },
  {
    id: 'mlprediction',
    name: 'AI Prediction',
    description: 'Machine learning pattern recognition',
    isActive: true,
    signals: 1,
    accuracy: 82.1,
    icon: <Brain className="h-4 w-4" />
  }
];

export const SignalFlowView: React.FC<SignalFlowViewProps> = ({ 
  signals, 
  knowledgeMode, 
  onSignalAction 
}) => {
  const [floatingSignals, setFloatingSignals] = useState<FloatingSignal[]>([]);
  const [draggedSignal, setDraggedSignal] = useState<string | null>(null);

  // Convert signals to floating signals
  useEffect(() => {
    if (signals.length > 0) {
      const newFloatingSignals = signals.map((signal, index) => ({
        ...signal,
        id: `${signal.symbol}-${Date.now()}-${index}`,
        position: { x: 50 + index * 100, y: 120 },
        velocity: { x: 0, y: 1 },
        isFlipped: false
      }));
      setFloatingSignals(newFloatingSignals);
    }
  }, [signals]);

  // Physics simulation for floating signals
  useEffect(() => {
    const interval = setInterval(() => {
      setFloatingSignals(prev => 
        prev.map(signal => ({
          ...signal,
          position: {
            x: signal.position.x + signal.velocity.x,
            y: signal.position.y + signal.velocity.y
          },
          velocity: {
            x: signal.velocity.x * 0.99, // friction
            y: Math.min(signal.velocity.y + 0.1, 2) // gravity with terminal velocity
          }
        })).filter(signal => signal.position.y < 400) // remove signals that fall off
      );
    }, 16); // ~60fps

    return () => clearInterval(interval);
  }, []);

  const handleSignalDrag = (signalId: string, position: { x: number; y: number }) => {
    setFloatingSignals(prev =>
      prev.map(signal =>
        signal.id === signalId
          ? { ...signal, position, velocity: { x: 0, y: 0 } }
          : signal
      )
    );
  };

  const handleDrop = (signalId: string, zone: 'execute' | 'pass') => {
    const signal = floatingSignals.find(s => s.id === signalId);
    if (signal) {
      onSignalAction(signal, zone);
      setFloatingSignals(prev => prev.filter(s => s.id !== signalId));
    }
    setDraggedSignal(null);
  };

  const flipSignalCard = (signalId: string) => {
    setFloatingSignals(prev =>
      prev.map(signal =>
        signal.id === signalId
          ? { ...signal, isFlipped: !signal.isFlipped }
          : signal
      )
    );
  };

  return (
    <Card className="h-full shadow-card hover:shadow-card-hover transition-shadow duration-200">
      <CardContent className="p-6 h-full flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-2">
            <Activity className="h-5 w-5 text-primary" />
            <h3 className="text-lg font-semibold">Signal Flow</h3>
            <Badge variant="secondary" className="text-xs">
              {knowledgeMode === 'simple' ? 'Learning Mode' : 'Advanced'}
            </Badge>
          </div>
          <div className="text-sm text-muted-foreground">
            Drag signals to execute or pass
          </div>
        </div>

        {/* Strategy Nodes */}
        <div className="flex justify-center space-x-6 mb-8">
          {STRATEGY_NODES.map((strategy) => (
            <div key={strategy.id} className="text-center group">
              <div className={`
                relative w-16 h-16 rounded-full border-2 flex items-center justify-center
                transition-all duration-300 cursor-pointer
                ${strategy.isActive 
                  ? 'border-primary bg-primary/10 animate-pulse' 
                  : 'border-muted bg-muted'
                }
              `}>
                {strategy.icon}
                
                {/* Pulse animation for active strategies */}
                {strategy.isActive && (
                  <div className="absolute inset-0 rounded-full border-2 border-primary animate-ping opacity-30" />
                )}
                
                {/* Signal count badge */}
                {strategy.signals > 0 && (
                  <Badge 
                    className="absolute -top-2 -right-2 w-6 h-6 rounded-full flex items-center justify-center text-xs"
                    variant="default"
                  >
                    {strategy.signals}
                  </Badge>
                )}
              </div>
              
              <div className="mt-2 space-y-1">
                <p className="text-xs font-medium">{strategy.name}</p>
                <p className="text-xs text-muted-foreground group-hover:text-foreground transition-colors">
                  {knowledgeMode === 'simple' 
                    ? strategy.description 
                    : `${strategy.accuracy}% accuracy`
                  }
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Signal Waterfall Area */}
        <div className="flex-1 relative bg-gradient-to-b from-background to-muted/20 rounded-lg border-2 border-dashed border-muted overflow-hidden">
          {/* Floating Signals */}
          {floatingSignals.map((signal) => (
            <div
              key={signal.id}
              className={`
                absolute w-64 transition-all duration-200 cursor-grab active:cursor-grabbing
                ${draggedSignal === signal.id ? 'z-50 scale-105' : 'z-10'}
              `}
              style={{
                left: signal.position.x,
                top: signal.position.y,
                transform: signal.isFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)'
              }}
              draggable
              onDragStart={() => setDraggedSignal(signal.id)}
              onDrag={(e) => {
                if (e.clientX && e.clientY) {
                  handleSignalDrag(signal.id, { x: e.clientX - 128, y: e.clientY - 40 });
                }
              }}
            >
              <Card 
                className={`
                  w-full shadow-lg border-2 cursor-pointer
                  ${signal.action === 'BUY' ? 'border-success bg-success/5' : 'border-destructive bg-destructive/5'}
                  hover:shadow-xl transition-all duration-200
                  ${signal.confidence > 80 ? 'ring-2 ring-primary/50 animate-pulse' : ''}
                `}
                onClick={() => flipSignalCard(signal.id)}
              >
                <CardContent className="p-4">
                  {!signal.isFlipped ? (
                    /* Front of card */
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <span className="font-bold text-lg">{signal.symbol}</span>
                          <Badge 
                            variant={signal.action === 'BUY' ? 'default' : 'destructive'}
                            className="text-xs"
                          >
                            {signal.action}
                          </Badge>
                        </div>
                        <div className="text-right">
                          <div className="text-sm font-bold">{signal.confidence}%</div>
                          <div className="text-xs text-muted-foreground">confidence</div>
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-between text-sm">
                        <span>Current: ${signal.currentPrice.toFixed(2)}</span>
                        <span>Target: ${signal.targetPrice.toFixed(2)}</span>
                      </div>
                      
                      {/* Confidence bar */}
                      <div className="w-full bg-muted rounded-full h-2">
                        <div 
                          className={`h-2 rounded-full transition-all duration-500 ${
                            signal.confidence > 80 ? 'bg-success' : 
                            signal.confidence > 60 ? 'bg-amber-500' : 'bg-destructive'
                          }`}
                          style={{ width: `${signal.confidence}%` }}
                        />
                      </div>
                      
                      <div className="text-xs text-center text-muted-foreground">
                        Click to see details
                      </div>
                    </div>
                  ) : (
                    /* Back of card */
                    <div className="space-y-3 text-sm" style={{ transform: 'rotateY(180deg)' }}>
                      <div className="font-medium">Why this signal?</div>
                      
                      <div className="space-y-2">
                        {knowledgeMode === 'simple' ? (
                          <div className="space-y-1">
                            <div className="flex items-center space-x-2">
                              <CheckCircle2 className="h-3 w-3 text-success" />
                              <span className="text-xs">Strong price momentum</span>
                            </div>
                            <div className="flex items-center space-x-2">
                              <CheckCircle2 className="h-3 w-3 text-success" />
                              <span className="text-xs">High trading volume</span>
                            </div>
                            <div className="flex items-center space-x-2">
                              <CheckCircle2 className="h-3 w-3 text-success" />
                              <span className="text-xs">All strategies agree</span>
                            </div>
                          </div>
                        ) : (
                          <div className="text-xs space-y-1">
                            <div>• RSI: {(Math.random() * 40 + 30).toFixed(1)}</div>
                            <div>• Volume: {(Math.random() * 3 + 1).toFixed(1)}x avg</div>
                            <div>• MACD: Bullish crossover</div>
                            <div>• ML Score: {signal.confidence}/100</div>
                          </div>
                        )}
                      </div>
                      
                      <div className="text-xs text-center text-muted-foreground border-t pt-2">
                        {signal.reasoning}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          ))}
          
          {/* Empty state */}
          {floatingSignals.length === 0 && (
            <div className="flex items-center justify-center h-full">
              <div className="text-center space-y-2">
                <Activity className="h-8 w-8 text-muted-foreground mx-auto" />
                <p className="text-sm text-muted-foreground">
                  Waiting for trading signals...
                </p>
                <p className="text-xs text-muted-foreground">
                  {knowledgeMode === 'simple' 
                    ? "Signals will appear here when our strategies find opportunities!"
                    : "Algorithmic analysis in progress. Signals generated based on multi-factor models."
                  }
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Decision Zones */}
        <div className="flex space-x-4 mt-6">
          <div 
            className="flex-1 h-20 border-2 border-dashed border-success rounded-lg flex items-center justify-center relative group hover:bg-success/5 transition-colors"
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => {
              e.preventDefault();
              if (draggedSignal) {
                handleDrop(draggedSignal, 'execute');
              }
            }}
          >
            <div className="text-center">
              <Target className="h-6 w-6 text-success mx-auto mb-1" />
              <div className="text-sm font-medium text-success">Execute Trade</div>
              <div className="text-xs text-muted-foreground">Drag here to buy</div>
            </div>
            <div className="absolute inset-0 rounded-lg bg-success/20 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
          </div>
          
          <div 
            className="flex-1 h-20 border-2 border-dashed border-muted rounded-lg flex items-center justify-center relative group hover:bg-muted/50 transition-colors"
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => {
              e.preventDefault();
              if (draggedSignal) {
                handleDrop(draggedSignal, 'pass');
              }
            }}
          >
            <div className="text-center">
              <X className="h-6 w-6 text-muted-foreground mx-auto mb-1" />
              <div className="text-sm font-medium text-muted-foreground">Pass</div>
              <div className="text-xs text-muted-foreground">Not interested</div>
            </div>
            <div className="absolute inset-0 rounded-lg bg-muted/20 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};