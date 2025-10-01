import { useState } from 'react';
import { Check, X, AlertCircle, Loader2, PlayCircle, FileDown, ArrowLeft, RefreshCw } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { TraderProtection } from '@/components/trader/TraderProtection';
import { runAllTests, TestReport } from '@/lib/testing/test-runner';
import { TestResultsGrid } from '@/components/testing/TestResultsGrid';
import { ActionItemsList } from '@/components/testing/ActionItemsList';

export default function BetaTesting() {
  const [testResults, setTestResults] = useState<TestReport | null>(null);
  const [isRunning, setIsRunning] = useState(false);
  const [currentTest, setCurrentTest] = useState('');
  const [progress, setProgress] = useState(0);

  const calculateReadiness = () => {
    if (!testResults) return 0;
    const total = testResults.summary.totalTests;
    const passed = testResults.summary.passed;
    return total > 0 ? Math.round((passed / total) * 100) : 0;
  };

  const runTests = async () => {
    setIsRunning(true);
    setProgress(0);
    
    try {
      const results = await runAllTests((status) => {
        setProgress(status.progress);
        setCurrentTest(status.currentTest);
      });
      
      setTestResults(results);
    } catch (error) {
      console.error('Test run failed:', error);
    } finally {
      setIsRunning(false);
      setCurrentTest('');
    }
  };

  const exportReport = () => {
    if (!testResults) return;
    
    const report = JSON.stringify(testResults, null, 2);
    const blob = new Blob([report], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `vinyl-beta-test-report-${new Date().toISOString()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const readinessScore = calculateReadiness();
  const getReadinessStatus = () => {
    if (readinessScore >= 90) return { color: 'text-green-400', bg: 'bg-green-500/20', icon: Check };
    if (readinessScore >= 70) return { color: 'text-yellow-400', bg: 'bg-yellow-500/20', icon: AlertCircle };
    return { color: 'text-red-400', bg: 'bg-red-500/20', icon: X };
  };

  const status = getReadinessStatus();
  const StatusIcon = status.icon;

  return (
    <TraderProtection>
      <div className="min-h-screen bg-gradient-to-br from-background via-purple-900/20 to-background p-6">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link 
                to="/trader" 
                className="flex items-center gap-2 text-primary hover:text-primary/80 transition"
              >
                <ArrowLeft size={20} />
                Back to Trader
              </Link>
              <div className="border-l border-border pl-4">
                <h1 className="text-4xl font-bold">Beta Readiness Testing</h1>
                <p className="text-muted-foreground mt-1">Automated validation for production readiness</p>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card className="border-white/10 bg-card/50 backdrop-blur">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-muted-foreground text-sm">Overall Readiness</p>
                  <p className={`text-3xl font-bold mt-1 ${status.color}`}>{readinessScore}%</p>
                </div>
                <div className={`w-12 h-12 rounded-full flex items-center justify-center ${status.bg}`}>
                  <StatusIcon className={status.color} />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-white/10 bg-card/50 backdrop-blur">
            <CardContent className="p-6">
              <p className="text-muted-foreground text-sm">Tests Passed</p>
              <p className="text-3xl font-bold text-green-400 mt-1">
                {testResults?.summary.passed || 0}/{testResults?.summary.totalTests || 0}
              </p>
            </CardContent>
          </Card>

          <Card className="border-white/10 bg-card/50 backdrop-blur">
            <CardContent className="p-6">
              <p className="text-muted-foreground text-sm">Critical Issues</p>
              <p className="text-3xl font-bold text-red-400 mt-1">
                {testResults?.summary.criticalIssues || 0}
              </p>
            </CardContent>
          </Card>

          <Card className="border-white/10 bg-card/50 backdrop-blur">
            <CardContent className="p-6">
              <p className="text-muted-foreground text-sm">Warnings</p>
              <p className="text-3xl font-bold text-yellow-400 mt-1">
                {testResults?.summary.warnings || 0}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Main Control Panel */}
        <Card className="border-white/10 bg-card/50 backdrop-blur mb-8">
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle>Test Control Panel</CardTitle>
              <div className="flex gap-3">
                <Button 
                  onClick={runTests}
                  disabled={isRunning}
                  className="gap-2"
                >
                  {isRunning ? (
                    <><Loader2 className="animate-spin" size={20} /> Running Tests...</>
                  ) : (
                    <><PlayCircle size={20} /> Run All Tests</>
                  )}
                </Button>
                <Button 
                  onClick={exportReport}
                  disabled={!testResults}
                  variant="outline"
                  className="gap-2"
                >
                  <FileDown size={20} /> Export Report
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {/* Progress Bar */}
            {isRunning && (
              <div className="mb-6">
                <div className="flex justify-between text-sm text-muted-foreground mb-2">
                  <span>Testing: {currentTest}</span>
                  <span>{progress}%</span>
                </div>
                <Progress value={progress} className="h-2" />
              </div>
            )}

            {/* Overall Status */}
            {testResults && (
              <div className="mt-4 p-4 rounded-lg bg-background/50">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-semibold">Overall Status</h3>
                    <p className="text-muted-foreground text-sm mt-1">
                      {testResults.overallStatus === 'READY' && 'Platform is ready for beta testing'}
                      {testResults.overallStatus === 'ALMOST_READY' && 'Platform is almost ready, minor issues to fix'}
                      {testResults.overallStatus === 'NEEDS_WORK' && 'Platform needs work before beta launch'}
                      {testResults.overallStatus === 'NOT_READY' && 'Critical issues must be resolved'}
                    </p>
                  </div>
                  <Badge 
                    variant={
                      testResults.overallStatus === 'READY' ? 'default' :
                      testResults.overallStatus === 'ALMOST_READY' ? 'secondary' :
                      'destructive'
                    }
                  >
                    {testResults.overallStatus.replace('_', ' ')}
                  </Badge>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Test Results */}
        {testResults && (
          <>
            <TestResultsGrid results={testResults} />
            <ActionItemsList actionItems={testResults.actionItems} />
          </>
        )}

        {/* Initial State */}
        {!testResults && !isRunning && (
          <Card className="border-white/10 bg-card/50 backdrop-blur">
            <CardContent className="p-12 text-center">
              <PlayCircle size={64} className="mx-auto text-muted-foreground mb-4" />
              <h3 className="text-xl font-semibold mb-2">Ready to Test</h3>
              <p className="text-muted-foreground mb-6">
                Run comprehensive tests to validate your platform's readiness for beta users
              </p>
              <Button onClick={runTests} size="lg" className="gap-2">
                <PlayCircle size={20} /> Start Testing
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </TraderProtection>
  );
}
