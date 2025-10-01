import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Clock, Zap, AlertCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

export function CronScheduler() {
  const [signalsWebhook, setSignalsWebhook] = useState(
    localStorage.getItem('zapier_signals_webhook') || ''
  );
  const [tradesWebhook, setTradesWebhook] = useState(
    localStorage.getItem('zapier_trades_webhook') || ''
  );
  const [isTestingSignals, setIsTestingSignals] = useState(false);
  const [isTestingTrades, setIsTestingTrades] = useState(false);
  const { toast } = useToast();

  const handleSaveSignalsWebhook = () => {
    localStorage.setItem('zapier_signals_webhook', signalsWebhook);
    toast({
      title: "Webhook Saved",
      description: "Signal generation webhook URL has been saved",
    });
  };

  const handleSaveTradesWebhook = () => {
    localStorage.setItem('zapier_trades_webhook', tradesWebhook);
    toast({
      title: "Webhook Saved",
      description: "Trade execution webhook URL has been saved",
    });
  };

  const testWebhook = async (url: string, type: 'signals' | 'trades') => {
    if (!url) {
      toast({
        title: "Error",
        description: "Please enter a webhook URL first",
        variant: "destructive",
      });
      return;
    }

    const setLoading = type === 'signals' ? setIsTestingSignals : setIsTestingTrades;
    setLoading(true);

    try {
      await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        mode: "no-cors",
        body: JSON.stringify({
          timestamp: new Date().toISOString(),
          test: true,
          job_type: type,
          triggered_from: "lovable_trader_platform",
        }),
      });

      toast({
        title: "Test Sent",
        description: `Test request sent to Zapier. Check your Zap's history to confirm it was triggered.`,
      });
    } catch (error) {
      console.error("Error testing webhook:", error);
      toast({
        title: "Error",
        description: "Failed to test webhook. Please check the URL and try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          Use Zapier to schedule automated signal generation and trade execution. 
          Create Zaps with webhook triggers and use the Schedule by Zapier action to run them at your desired times.
        </AlertDescription>
      </Alert>

      {/* Signal Generation Scheduler */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5" />
                Signal Generation Schedule
              </CardTitle>
              <CardDescription>
                Automatically generate trading signals before market open (recommended: 8:00 AM ET daily)
              </CardDescription>
            </div>
            <Badge variant="outline" className="gap-1">
              <Zap className="h-3 w-3" />
              Zapier
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="signals-webhook">Zapier Webhook URL</Label>
            <div className="flex gap-2">
              <Input
                id="signals-webhook"
                placeholder="https://hooks.zapier.com/hooks/catch/..."
                value={signalsWebhook}
                onChange={(e) => setSignalsWebhook(e.target.value)}
              />
              <Button onClick={handleSaveSignalsWebhook} variant="outline">
                Save
              </Button>
            </div>
          </div>

          <div className="flex gap-2">
            <Button
              onClick={() => testWebhook(signalsWebhook, 'signals')}
              disabled={isTestingSignals || !signalsWebhook}
              className="flex-1"
            >
              {isTestingSignals ? "Testing..." : "Test Webhook"}
            </Button>
          </div>

          <div className="text-sm text-muted-foreground space-y-1">
            <p className="font-medium">Setup Instructions:</p>
            <ol className="list-decimal list-inside space-y-1 ml-2">
              <li>Create a new Zap in Zapier</li>
              <li>Choose "Webhooks by Zapier" as the trigger</li>
              <li>Select "Catch Hook" and copy the webhook URL here</li>
              <li>Add "Schedule by Zapier" to run weekdays at 8:00 AM ET</li>
              <li>Add "HTTP POST" action to call: <code className="text-xs bg-muted px-1 py-0.5 rounded">https://jhxjvpbwkdzjufjyqanq.supabase.co/functions/v1/trader-signals</code></li>
            </ol>
          </div>
        </CardContent>
      </Card>

      {/* Trade Execution Scheduler */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5" />
                Trade Execution Schedule
              </CardTitle>
              <CardDescription>
                Automatically execute trades after market open (recommended: 9:35 AM ET and 12:00 PM ET daily)
              </CardDescription>
            </div>
            <Badge variant="outline" className="gap-1">
              <Zap className="h-3 w-3" />
              Zapier
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="trades-webhook">Zapier Webhook URL</Label>
            <div className="flex gap-2">
              <Input
                id="trades-webhook"
                placeholder="https://hooks.zapier.com/hooks/catch/..."
                value={tradesWebhook}
                onChange={(e) => setTradesWebhook(e.target.value)}
              />
              <Button onClick={handleSaveTradesWebhook} variant="outline">
                Save
              </Button>
            </div>
          </div>

          <div className="flex gap-2">
            <Button
              onClick={() => testWebhook(tradesWebhook, 'trades')}
              disabled={isTestingTrades || !tradesWebhook}
              className="flex-1"
            >
              {isTestingTrades ? "Testing..." : "Test Webhook"}
            </Button>
          </div>

          <div className="text-sm text-muted-foreground space-y-1">
            <p className="font-medium">Setup Instructions:</p>
            <ol className="list-decimal list-inside space-y-1 ml-2">
              <li>Create a new Zap in Zapier</li>
              <li>Choose "Webhooks by Zapier" as the trigger</li>
              <li>Select "Catch Hook" and copy the webhook URL here</li>
              <li>Add "Schedule by Zapier" to run weekdays at 9:35 AM ET (and optionally 12:00 PM ET)</li>
              <li>Add "HTTP POST" action to call: <code className="text-xs bg-muted px-1 py-0.5 rounded">https://jhxjvpbwkdzjufjyqanq.supabase.co/functions/v1/execute-trades</code></li>
            </ol>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
