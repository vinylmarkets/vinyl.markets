import React, { useEffect, useRef, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Zap, TrendingUp, TrendingDown, RotateCcw } from "lucide-react";
import { cn } from "@/lib/utils";

interface NetworkNode {
  id: string;
  symbol: string;
  x: number;
  y: number;
  size: number;
  color: string;
  signal?: 'BUY' | 'SELL' | 'HOLD';
  price: number;
  change: number;
  sector: string;
}

interface NetworkEdge {
  source: string;
  target: string;
  correlation: number;
  strength: number;
}

interface RelationshipData {
  confirmations: {
    symbol: string;
    signal: 'BUY' | 'SELL';
    strength: number;
  }[];
  divergences: {
    symbolA: string;
    symbolB: string;
    correlation: number;
  }[];
  rotations: {
    from: string;
    to: string;
    strength: number;
  }[];
}

interface RelationshipNetworkGraphProps {
  selectedSymbol?: string;
  onSymbolSelect?: (symbol: string) => void;
}

export const RelationshipNetworkGraph: React.FC<RelationshipNetworkGraphProps> = ({
  selectedSymbol = 'AAPL',
  onSymbolSelect
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [showNetwork, setShowNetwork] = useState(true);
  const [nodes, setNodes] = useState<NetworkNode[]>([]);
  const [edges, setEdges] = useState<NetworkEdge[]>([]);
  const [relationshipData, setRelationshipData] = useState<RelationshipData>({
    confirmations: [],
    divergences: [],
    rotations: []
  });
  const [animationFrame, setAnimationFrame] = useState<number | null>(null);

  // Initialize network data
  useEffect(() => {
    const generateNetworkData = () => {
      const stockData = [
        { symbol: 'AAPL', sector: 'Technology', price: 182.30, change: 2.5 },
        { symbol: 'MSFT', sector: 'Technology', price: 348.75, change: 1.8 },
        { symbol: 'GOOGL', sector: 'Technology', price: 142.50, change: -0.5 },
        { symbol: 'META', sector: 'Technology', price: 338.90, change: 1.2 },
        { symbol: 'NVDA', sector: 'Technology', price: 438.50, change: 3.1 },
        { symbol: 'TSLA', sector: 'Consumer Discretionary', price: 218.45, change: -1.5 },
        { symbol: 'JPM', sector: 'Financial Services', price: 175.20, change: 0.8 },
        { symbol: 'V', sector: 'Financial Services', price: 265.40, change: 1.1 },
      ];

      const centerX = 200;
      const centerY = 150;
      const radius = 100;

      const newNodes: NetworkNode[] = stockData.map((stock, index) => {
        const angle = (index / stockData.length) * 2 * Math.PI;
        const isCenter = stock.symbol === selectedSymbol;
        
        return {
          id: stock.symbol,
          symbol: stock.symbol,
          x: isCenter ? centerX : centerX + Math.cos(angle) * radius,
          y: isCenter ? centerY : centerY + Math.sin(angle) * radius,
          size: isCenter ? 25 : 15,
          color: getNodeColor(stock.change, stock.symbol === selectedSymbol),
          signal: stock.change > 1 ? 'BUY' : stock.change < -1 ? 'SELL' : 'HOLD',
          price: stock.price,
          change: stock.change,
          sector: stock.sector
        };
      });

      const newEdges: NetworkEdge[] = [];
      stockData.forEach((stockA, i) => {
        stockData.forEach((stockB, j) => {
          if (i < j && (stockA.symbol === selectedSymbol || stockB.symbol === selectedSymbol)) {
            const correlation = 0.5 + Math.random() * 0.4; // 0.5-0.9 correlation
            newEdges.push({
              source: stockA.symbol,
              target: stockB.symbol,
              correlation,
              strength: correlation
            });
          }
        });
      });

      setNodes(newNodes);
      setEdges(newEdges);

      // Generate relationship insights
      const confirmations = newNodes
        .filter(node => node.symbol !== selectedSymbol && node.signal === newNodes.find(n => n.symbol === selectedSymbol)?.signal)
        .slice(0, 3)
        .map(node => ({
          symbol: node.symbol,
          signal: node.signal as 'BUY' | 'SELL',
          strength: Math.abs(node.change)
        }));

      const divergences = newEdges
        .filter(edge => {
          const nodeA = newNodes.find(n => n.id === edge.source);
          const nodeB = newNodes.find(n => n.id === edge.target);
          return nodeA && nodeB && nodeA.signal !== nodeB.signal && edge.correlation > 0.7;
        })
        .slice(0, 2)
        .map(edge => ({
          symbolA: edge.source,
          symbolB: edge.target,
          correlation: edge.correlation
        }));

      const rotations = [
        { from: 'Technology', to: 'Energy', strength: 0.75 },
        { from: 'Financial Services', to: 'Healthcare', strength: 0.45 }
      ];

      setRelationshipData({ confirmations, divergences, rotations });
    };

    generateNetworkData();
  }, [selectedSymbol]);

  const getNodeColor = (change: number, isSelected: boolean) => {
    if (isSelected) return '#3b82f6'; // Blue for selected
    if (change > 1) return '#22c55e'; // Green for strong positive
    if (change > 0) return '#84cc16'; // Light green for positive
    if (change < -1) return '#ef4444'; // Red for strong negative
    if (change < 0) return '#f97316'; // Orange for negative
    return '#6b7280'; // Gray for neutral
  };

  const drawNetwork = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw edges
    edges.forEach(edge => {
      const sourceNode = nodes.find(n => n.id === edge.source);
      const targetNode = nodes.find(n => n.id === edge.target);
      
      if (sourceNode && targetNode) {
        ctx.beginPath();
        ctx.moveTo(sourceNode.x, sourceNode.y);
        ctx.lineTo(targetNode.x, targetNode.y);
        ctx.strokeStyle = `rgba(59, 130, 246, ${edge.strength * 0.6})`;
        ctx.lineWidth = edge.strength * 3;
        ctx.stroke();
      }
    });

    // Draw nodes
    nodes.forEach(node => {
      // Node circle
      ctx.beginPath();
      ctx.arc(node.x, node.y, node.size, 0, 2 * Math.PI);
      ctx.fillStyle = node.color;
      ctx.fill();
      
      // Node border
      ctx.strokeStyle = node.symbol === selectedSymbol ? '#1e40af' : '#374151';
      ctx.lineWidth = node.symbol === selectedSymbol ? 3 : 1;
      ctx.stroke();

      // Symbol text
      ctx.fillStyle = '#ffffff';
      ctx.font = `${node.size / 2}px Arial`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(node.symbol, node.x, node.y);

      // Signal indicator
      if (node.signal && node.signal !== 'HOLD') {
        ctx.beginPath();
        ctx.arc(node.x + node.size - 5, node.y - node.size + 5, 4, 0, 2 * Math.PI);
        ctx.fillStyle = node.signal === 'BUY' ? '#22c55e' : '#ef4444';
        ctx.fill();
      }

      // Pulse animation for selected node
      if (node.symbol === selectedSymbol) {
        const time = Date.now() / 1000;
        const pulseRadius = node.size + Math.sin(time * 3) * 8;
        ctx.beginPath();
        ctx.arc(node.x, node.y, pulseRadius, 0, 2 * Math.PI);
        ctx.strokeStyle = `rgba(59, 130, 246, ${0.3 + Math.sin(time * 3) * 0.2})`;
        ctx.lineWidth = 2;
        ctx.stroke();
      }
    });
  };

  useEffect(() => {
    if (showNetwork) {
      const animate = () => {
        drawNetwork();
        setAnimationFrame(requestAnimationFrame(animate));
      };
      animate();
    }

    return () => {
      if (animationFrame) {
        cancelAnimationFrame(animationFrame);
      }
    };
  }, [nodes, edges, selectedSymbol, showNetwork]);

  const handleCanvasClick = (event: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    nodes.forEach(node => {
      const distance = Math.sqrt((x - node.x) ** 2 + (y - node.y) ** 2);
      if (distance <= node.size) {
        onSymbolSelect?.(node.symbol);
      }
    });
  };

  return (
    <div className="space-y-4">
      {/* Network Visualization */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Zap className="h-5 w-5 text-blue-500" />
              Relationship Network
            </CardTitle>
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">Show Network</span>
              <Switch
                checked={showNetwork}
                onCheckedChange={setShowNetwork}
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {showNetwork ? (
            <div className="space-y-4">
              <canvas
                ref={canvasRef}
                width={400}
                height={300}
                className="border border-border rounded-lg cursor-pointer bg-card/50"
                onClick={handleCanvasClick}
              />
              <div className="flex items-center justify-center gap-4 text-xs text-muted-foreground">
                <div className="flex items-center gap-1">
                  <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                  <span>Selected</span>
                </div>
                <div className="flex items-center gap-1">
                  <div className="w-3 h-3 rounded-full bg-green-500"></div>
                  <span>Buy Signal</span>
                </div>
                <div className="flex items-center gap-1">
                  <div className="w-3 h-3 rounded-full bg-red-500"></div>
                  <span>Sell Signal</span>
                </div>
                <div className="flex items-center gap-1">
                  <div className="w-2 h-0.5 bg-blue-500 opacity-60"></div>
                  <span>Correlation</span>
                </div>
              </div>
            </div>
          ) : (
            <div className="h-48 flex items-center justify-center text-muted-foreground">
              Network view disabled
            </div>
          )}
        </CardContent>
      </Card>

      {/* Relationship Insights */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Signal Confirmations */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-sm">
              <TrendingUp className="h-4 w-4 text-green-500" />
              Signal Confirmations
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {relationshipData.confirmations.length > 0 ? (
              relationshipData.confirmations.map((confirmation, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary" className="text-xs">
                      {confirmation.symbol}
                    </Badge>
                    <span className={cn(
                      "text-xs font-medium",
                      confirmation.signal === 'BUY' ? "text-green-500" : "text-red-500"
                    )}>
                      {confirmation.signal}
                    </span>
                  </div>
                  <span className="text-xs text-muted-foreground">
                    {confirmation.strength.toFixed(1)}%
                  </span>
                </div>
              ))
            ) : (
              <div className="text-xs text-muted-foreground">No confirmations</div>
            )}
          </CardContent>
        </Card>

        {/* Unusual Divergences */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-sm">
              <TrendingDown className="h-4 w-4 text-orange-500" />
              Unusual Divergences
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {relationshipData.divergences.length > 0 ? (
              relationshipData.divergences.map((divergence, index) => (
                <div key={index} className="space-y-1">
                  <div className="flex items-center gap-1">
                    <Badge variant="outline" className="text-xs">
                      {divergence.symbolA}
                    </Badge>
                    <span className="text-xs text-muted-foreground">vs</span>
                    <Badge variant="outline" className="text-xs">
                      {divergence.symbolB}
                    </Badge>
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {(divergence.correlation * 100).toFixed(0)}% correlation
                  </div>
                </div>
              ))
            ) : (
              <div className="text-xs text-muted-foreground">No divergences detected</div>
            )}
          </CardContent>
        </Card>

        {/* Sector Rotation */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-sm">
              <RotateCcw className="h-4 w-4 text-purple-500" />
              Sector Rotation
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {relationshipData.rotations.map((rotation, index) => (
              <div key={index} className="space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-red-500">{rotation.from}</span>
                  <span className="text-xs text-muted-foreground">→</span>
                  <span className="text-xs text-green-500">{rotation.to}</span>
                </div>
                <div className="w-full bg-muted rounded-full h-1">
                  <div 
                    className="bg-purple-500 h-1 rounded-full transition-all duration-500"
                    style={{ width: `${rotation.strength * 100}%` }}
                  />
                </div>
                <div className="text-xs text-muted-foreground">
                  {(rotation.strength * 100).toFixed(0)}% strength
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};