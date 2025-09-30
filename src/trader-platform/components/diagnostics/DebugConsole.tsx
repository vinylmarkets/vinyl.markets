import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Terminal, Play, Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export function DebugConsole() {
  const [command, setCommand] = useState("");
  const [output, setOutput] = useState<Array<{ type: 'command' | 'output' | 'error'; text: string }>>([]);
  const { toast } = useToast();

  const executeCommand = async () => {
    if (!command.trim()) return;

    setOutput(prev => [...prev, { type: 'command', text: `$ ${command}` }]);

    try {
      // Simulate command execution
      switch (command.toLowerCase()) {
        case 'status':
          setOutput(prev => [...prev, {
            type: 'output',
            text: 'System Status:\n✓ Trading Engine: Running\n✓ Database: Connected\n✓ API: Healthy'
          }]);
          break;
        case 'clear':
          setOutput([]);
          break;
        case 'help':
          setOutput(prev => [...prev, {
            type: 'output',
            text: 'Available commands:\n- status: Check system status\n- test: Run system tests\n- clear: Clear console\n- help: Show this help'
          }]);
          break;
        case 'test':
          setOutput(prev => [...prev, {
            type: 'output',
            text: 'Running tests...\n✓ Database connection: PASS\n✓ API endpoint: PASS\n✓ Trading logic: PASS\n\nAll tests passed!'
          }]);
          break;
        default:
          setOutput(prev => [...prev, {
            type: 'error',
            text: `Unknown command: ${command}\nType 'help' for available commands`
          }]);
      }
    } catch (error: any) {
      setOutput(prev => [...prev, { type: 'error', text: error.message }]);
      toast({
        title: "Command failed",
        description: error.message,
        variant: "destructive"
      });
    }

    setCommand("");
  };

  const clearOutput = () => {
    setOutput([]);
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <Terminal className="h-5 w-5" />
            Debug Console
          </h3>
          <p className="text-sm text-muted-foreground">
            Execute diagnostic commands and test system components
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={clearOutput}>
            <Trash2 className="h-4 w-4 mr-2" />
            Clear
          </Button>
        </div>
      </div>

      {/* Output Window */}
      <Card>
        <CardContent className="p-4">
          <div className="font-mono text-sm space-y-2 bg-background rounded-lg p-4 min-h-[400px] max-h-[400px] overflow-y-auto">
            {output.length === 0 ? (
              <div className="text-muted-foreground">
                Console ready. Type 'help' for available commands.
              </div>
            ) : (
              output.map((line, index) => (
                <div key={index} className={
                  line.type === 'command' ? 'text-primary font-semibold' :
                  line.type === 'error' ? 'text-destructive' :
                  'text-foreground'
                }>
                  <pre className="whitespace-pre-wrap">{line.text}</pre>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>

      {/* Command Input */}
      <div className="flex gap-2">
        <div className="flex-1 relative">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 font-mono text-muted-foreground">$</span>
          <Textarea
            value={command}
            onChange={(e) => setCommand(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                executeCommand();
              }
            }}
            placeholder="Enter command..."
            className="pl-8 font-mono resize-none"
            rows={1}
          />
        </div>
        <Button onClick={executeCommand}>
          <Play className="h-4 w-4 mr-2" />
          Execute
        </Button>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Quick Actions</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-2">
          <Button variant="outline" size="sm" onClick={() => {
            setCommand('status');
            setTimeout(executeCommand, 0);
          }}>
            Check Status
          </Button>
          <Button variant="outline" size="sm" onClick={() => {
            setCommand('test');
            setTimeout(executeCommand, 0);
          }}>
            Run Tests
          </Button>
          <Button variant="outline" size="sm" onClick={() => {
            setCommand('help');
            setTimeout(executeCommand, 0);
          }}>
            Show Help
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}