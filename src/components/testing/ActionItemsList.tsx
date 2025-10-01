import { AlertTriangle, AlertCircle, Info } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ActionItem } from '@/lib/testing/test-runner';

interface ActionItemsListProps {
  actionItems: ActionItem[];
}

export function ActionItemsList({ actionItems }: ActionItemsListProps) {
  if (actionItems.length === 0) {
    return (
      <Card className="border-white/10 bg-card/50 backdrop-blur">
        <CardContent className="p-12 text-center">
          <div className="text-green-400 mb-4">
            <svg className="w-16 h-16 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h3 className="text-xl font-semibold mb-2">All Tests Passed!</h3>
          <p className="text-muted-foreground">
            Your platform is ready for beta testing. No action items to address.
          </p>
        </CardContent>
      </Card>
    );
  }

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case 'HIGH':
        return <AlertTriangle className="text-red-400" size={20} />;
      case 'MEDIUM':
        return <AlertCircle className="text-yellow-400" size={20} />;
      default:
        return <Info className="text-blue-400" size={20} />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'HIGH':
        return 'destructive';
      case 'MEDIUM':
        return 'secondary';
      default:
        return 'outline';
    }
  };

  return (
    <Card className="border-white/10 bg-card/50 backdrop-blur">
      <CardHeader>
        <CardTitle>Action Items</CardTitle>
        <p className="text-sm text-muted-foreground">
          Issues that need to be addressed before beta launch
        </p>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {actionItems.map((item, idx) => (
            <div 
              key={idx}
              className="p-4 rounded-lg bg-background/50 border border-border/50"
            >
              <div className="flex items-start gap-3">
                <div className="mt-0.5">
                  {getPriorityIcon(item.priority)}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <Badge variant={getPriorityColor(item.priority) as any}>
                      {item.priority}
                    </Badge>
                    <span className="text-sm text-muted-foreground">{item.category}</span>
                  </div>
                  <h4 className="font-medium mb-1">{item.test}</h4>
                  <p className="text-sm text-muted-foreground">{item.issue}</p>
                  {item.details && (
                    <details className="mt-2">
                      <summary className="text-xs text-muted-foreground cursor-pointer hover:text-foreground">
                        View details
                      </summary>
                      <pre className="text-xs mt-2 p-2 bg-background rounded overflow-auto">
                        {JSON.stringify(item.details, null, 2)}
                      </pre>
                    </details>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
