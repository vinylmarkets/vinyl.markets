import { Check, X, AlertCircle, Clock } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TestReport } from '@/lib/testing/test-runner';

interface TestResultsGridProps {
  results: TestReport;
}

export function TestResultsGrid({ results }: TestResultsGridProps) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
      {Object.entries(results.categories).map(([id, category]) => {
        const passRate = category.tests.length > 0 
          ? Math.round((category.passed / category.tests.length) * 100)
          : 0;
        
        return (
          <Card key={id} className="border-white/10 bg-card/50 backdrop-blur">
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle className="text-lg">{category.name}</CardTitle>
                <Badge 
                  variant={passRate >= 90 ? 'default' : passRate >= 70 ? 'secondary' : 'destructive'}
                >
                  {passRate}% Pass Rate
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex gap-4 mb-4 text-sm">
                <div className="flex items-center gap-1 text-green-400">
                  <Check size={16} />
                  <span>{category.passed} Passed</span>
                </div>
                <div className="flex items-center gap-1 text-red-400">
                  <X size={16} />
                  <span>{category.failed} Failed</span>
                </div>
                <div className="flex items-center gap-1 text-yellow-400">
                  <AlertCircle size={16} />
                  <span>{category.warnings} Warnings</span>
                </div>
              </div>
              
              <div className="space-y-2">
                {category.tests.map((test, idx) => (
                  <div 
                    key={idx}
                    className="p-3 rounded-lg bg-background/50 border border-border/50"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          {test.passed ? (
                            <Check size={16} className="text-green-400 flex-shrink-0" />
                          ) : (
                            <X size={16} className="text-red-400 flex-shrink-0" />
                          )}
                          <span className="font-medium text-sm">{test.name}</span>
                          {test.critical && (
                            <Badge variant="destructive" className="text-xs">Critical</Badge>
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground ml-6">{test.description}</p>
                        {!test.passed && (
                          <p className="text-xs text-red-400 ml-6 mt-1">{test.message}</p>
                        )}
                      </div>
                      <div className="flex items-center gap-1 text-xs text-muted-foreground flex-shrink-0">
                        <Clock size={12} />
                        <span>{test.duration}ms</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
