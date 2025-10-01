import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, Network, Loader2, ZoomIn, ZoomOut, Maximize2 } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { TraderProtection } from "@/components/trader/TraderProtection";
import { useCogneeData } from "@/hooks/useCogneeData";
import ForceGraph3D from "react-force-graph-3d";

export default function KnowledgeGraphView() {
  const { fetchKnowledgeGraph, loading } = useCogneeData();
  const [graphData, setGraphData] = useState<any>(null);
  const [selectedNode, setSelectedNode] = useState<any>(null);

  useEffect(() => {
    loadGraph();
  }, []);

  const loadGraph = async () => {
    const data = await fetchKnowledgeGraph({ limit: 200 });
    setGraphData(data);
  };

  const keyEntities = [
    { name: "BBBY", type: "Company", connections: 15 },
    { name: "Overstock", type: "Company", connections: 12 },
    { name: "DK-Butterfly", type: "Entity", connections: 8 },
    { name: "Section 382", type: "Tax Law", connections: 10 },
    { name: "NOLs", type: "Tax Asset", connections: 14 },
  ];

  return (
    <TraderProtection>
      <div className="min-h-screen bg-background">
        <div className="border-b border-border/40 bg-card/50 backdrop-blur-sm sticky top-0 z-10">
          <div className="container mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Link to="/trader/forensics">
                  <Button variant="ghost" size="sm">
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Back to Forensics
                  </Button>
                </Link>
                <div>
                  <h1 className="text-2xl font-bold">Knowledge Graph</h1>
                  <p className="text-sm text-muted-foreground">
                    Network visualization of entities and relationships
                  </p>
                </div>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm">
                  <ZoomIn className="h-4 w-4" />
                </Button>
                <Button variant="outline" size="sm">
                  <ZoomOut className="h-4 w-4" />
                </Button>
                <Button variant="outline" size="sm">
                  <Maximize2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>

        <div className="container mx-auto px-4 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Graph Visualization */}
            <div className="lg:col-span-3">
              <Card className="h-[600px]">
                <CardContent className="p-0 h-full">
                  {loading ? (
                    <div className="flex items-center justify-center h-full">
                      <div className="text-center">
                        <Loader2 className="h-8 w-8 animate-spin mx-auto mb-2" />
                        <p className="text-sm text-muted-foreground">Loading knowledge graph...</p>
                      </div>
                    </div>
                  ) : graphData && graphData.nodes.length > 0 ? (
                    <ForceGraph3D
                      graphData={graphData}
                      nodeLabel="name"
                      nodeColor="color"
                      linkColor="color"
                      onNodeClick={(node) => setSelectedNode(node)}
                      backgroundColor="#000000"
                    />
                  ) : (
                    <div className="flex items-center justify-center h-full">
                      <div className="text-center">
                        <Network className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                        <p className="text-muted-foreground">No graph data available</p>
                        <Button onClick={loadGraph} className="mt-4">
                          Load Graph
                        </Button>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Side Panel */}
            <div className="space-y-6">
              {/* Selected Node */}
              {selectedNode && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Selected Entity</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div>
                      <div className="font-semibold">{selectedNode.name}</div>
                      <Badge variant="outline" className="mt-1">
                        {selectedNode.type}
                      </Badge>
                    </div>
                    {selectedNode.metadata && (
                      <div className="text-sm text-muted-foreground">
                        <div>Connections: {selectedNode.val || 0}</div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}

              {/* Key Entities */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Key Entities</CardTitle>
                  <CardDescription>Most connected nodes in the graph</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  {keyEntities.map((entity, idx) => (
                    <div
                      key={idx}
                      className="p-3 rounded-lg border border-border hover:border-primary/50 transition-colors cursor-pointer"
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="font-medium text-sm">{entity.name}</div>
                          <div className="text-xs text-muted-foreground">{entity.type}</div>
                        </div>
                        <Badge variant="secondary" className="text-xs">
                          {entity.connections}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>

              {/* Graph Stats */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Graph Statistics</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Total Nodes:</span>
                    <span className="font-semibold">{graphData?.nodes.length || 0}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Total Edges:</span>
                    <span className="font-semibold">{graphData?.links.length || 0}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Entity Types:</span>
                    <span className="font-semibold">8</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Clusters:</span>
                    <span className="font-semibold">3</span>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </TraderProtection>
  );
}
