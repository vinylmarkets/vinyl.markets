import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Bell, Plus, Trash2 } from "lucide-react";

export function AlertConfiguration() {
  const [rules, setRules] = useState([
    {
      id: '1',
      name: 'High Error Rate',
      condition: 'error_rate',
      threshold: 5,
      severity: 'critical',
      enabled: true
    }
  ]);

  const addRule = () => {
    setRules([...rules, {
      id: Date.now().toString(),
      name: 'New Rule',
      condition: 'error_rate',
      threshold: 0,
      severity: 'medium',
      enabled: true
    }]);
  };

  const deleteRule = (id: string) => {
    setRules(rules.filter(r => r.id !== id));
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <Bell className="h-5 w-5" />
            Alert Configuration
          </h3>
          <p className="text-sm text-muted-foreground">
            Configure automated notifications for critical events
          </p>
        </div>
        <Button onClick={addRule}>
          <Plus className="h-4 w-4 mr-2" />
          Add Rule
        </Button>
      </div>

      <div className="space-y-4">
        {rules.map((rule) => (
          <Card key={rule.id}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-base">{rule.name}</CardTitle>
                <div className="flex items-center gap-2">
                  <Switch checked={rule.enabled} />
                  <Button variant="ghost" size="icon" onClick={() => deleteRule(rule.id)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Rule Name</Label>
                  <Input value={rule.name} />
                </div>
                <div>
                  <Label>Condition</Label>
                  <Select value={rule.condition}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="error_rate">Error Rate Exceeds</SelectItem>
                      <SelectItem value="pnl_drop">P&L Drops Below</SelectItem>
                      <SelectItem value="connection_lost">Connection Lost</SelectItem>
                      <SelectItem value="high_volume">Unusual Volume</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Threshold</Label>
                  <Input type="number" value={rule.threshold} />
                </div>
                <div>
                  <Label>Severity</Label>
                  <Select value={rule.severity}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="critical">Critical</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="low">Low</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}