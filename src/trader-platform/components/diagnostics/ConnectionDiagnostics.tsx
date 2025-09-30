import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, XCircle, Loader2, Play } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface ConnectionTest {
  name: string;
  type: string;
  status: 'pending' | 'success' | 'error' | 'testing';
  responseTime?: number;
  error?: string;
  lastTested?: Date;
}

export function ConnectionDiagnostics() {
  const { toast } = useToast();
  const [tests, setTests] = useState<ConnectionTest[]>([
    { name: 'Trading API', type: 'api', status: 'pending' },
    { name: 'Database Connection', type: 'database', status: 'pending' },
    { name: 'Broker Connection', type: 'broker', status: 'pending' },
    { name: 'Market Data Feed', type: 'market_data', status: 'pending' },
    { name: 'Risk Management', type: 'risk_management', status: 'pending' },
  ]);
  const [testingAll, setTestingAll] = useState(false);

  const testConnection = async (index: number) => {
    const test = tests[index];
    setTests(prev => prev.map((t, i) => i === index ? { ...t, status: 'testing' } : t));

    try {
      const { data, error } = await supabase.functions.invoke('diagnostics', {
        body: {
          action: 'test_connection',
          connectionType: test.type
        }
      });

      if (error) throw error;

      setTests(prev => prev.map((t, i) =>
        i === index ? {
          ...t,
          status: data.status ? 'success' : 'error',
          responseTime: data.responseTime,
          error: data.error,
          lastTested: new Date()
        } : t
      ));

      toast({
        title: data.status ? "Connection successful" : "Connection failed",
        description: `${test.name}: ${data.status ? `${data.responseTime}ms` : data.error}`,
        variant: data.status ? "default" : "destructive"
      });
    } catch (error: any) {
      setTests(prev => prev.map((t, i) =>
        i === index ? {
          ...t,
          status: 'error',
          error: error.message,
          lastTested: new Date()
        } : t
      ));
      toast({
        title: "Connection test failed",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  const testAllConnections = async () => {
    setTestingAll(true);
    for (let i = 0; i < tests.length; i++) {
      await testConnection(i);
      // Small delay between tests
      await new Promise(resolve => setTimeout(resolve, 500));
    }
    setTestingAll(false);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success':
        return <CheckCircle2 className="h-5 w-5 text-success" />;
      case 'error':
        return <XCircle className="h-5 w-5 text-destructive" />;
      case 'testing':
        return <Loader2 className="h-5 w-5 animate-spin" />;
      default:
        return <div className="h-5 w-5 rounded-full bg-muted" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'success':
        return <Badge variant="outline" className="bg-success/10 text-success">Healthy</Badge>;
      case 'error':
        return <Badge variant="outline" className="bg-destructive/10 text-destructive">Failed</Badge>;
      case 'testing':
        return <Badge variant="outline">Testing...</Badge>;
      default:
        return <Badge variant="outline" className="bg-muted">Not Tested</Badge>;
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-semibold">Connection Diagnostics</h3>
          <p className="text-sm text-muted-foreground">
            Test connectivity to all critical systems
          </p>
        </div>
        <Button onClick={testAllConnections} disabled={testingAll}>
          {testingAll ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Play className="h-4 w-4 mr-2" />}
          Run All Tests
        </Button>
      </div>

      <div className="space-y-2">
        {tests.map((test, index) => (
          <Card key={test.type}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <div className="flex items-center gap-3">
                {getStatusIcon(test.status)}
                <div>
                  <CardTitle className="text-base">{test.name}</CardTitle>
                  <CardDescription className="text-xs">
                    {test.lastTested ? `Last tested: ${test.lastTested.toLocaleTimeString()}` : 'Not tested yet'}
                  </CardDescription>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {getStatusBadge(test.status)}
                {test.responseTime && (
                  <Badge variant="outline">{test.responseTime}ms</Badge>
                )}
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => testConnection(index)}
                  disabled={test.status === 'testing'}
                >
                  Test Now
                </Button>
              </div>
            </CardHeader>
            {test.error && (
              <CardContent>
                <div className="text-sm text-destructive bg-destructive/10 p-2 rounded">
                  Error: {test.error}
                </div>
              </CardContent>
            )}
          </Card>
        ))}
      </div>
    </div>
  );
}