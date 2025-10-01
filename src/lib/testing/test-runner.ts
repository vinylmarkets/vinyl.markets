import { checkStyleConsistency } from './tests/style-tests';
import { checkNavigation } from './tests/navigation-tests';
import { checkFunctionality } from './tests/functionality-tests';
import { checkPerformance } from './tests/performance-tests';

export interface TestResult {
  name: string;
  description: string;
  critical: boolean;
  passed: boolean;
  message: string;
  details?: any;
  duration: number;
}

export interface CategoryResult {
  name: string;
  tests: TestResult[];
  passed: number;
  failed: number;
  warnings: number;
}

export interface TestSummary {
  totalTests: number;
  passed: number;
  failed: number;
  warnings: number;
  criticalIssues: number;
}

export interface ActionItem {
  priority: 'HIGH' | 'MEDIUM' | 'LOW';
  category: string;
  test: string;
  issue: string;
  details?: any;
}

export interface TestReport {
  timestamp: string;
  platform: string;
  environment: string;
  overallStatus: 'READY' | 'ALMOST_READY' | 'NEEDS_WORK' | 'NOT_READY';
  summary: TestSummary;
  categories: Record<string, CategoryResult>;
  actionItems: ActionItem[];
  recommendations: string[];
}

export interface TestProgress {
  progress: number;
  currentTest: string;
}

const categories = [
  { id: 'styling', name: 'Style Consistency', runner: checkStyleConsistency },
  { id: 'navigation', name: 'Navigation & Links', runner: checkNavigation },
  { id: 'functionality', name: 'Core Functionality', runner: checkFunctionality },
  { id: 'performance', name: 'Performance', runner: checkPerformance }
];

export async function runAllTests(
  onProgress?: (progress: TestProgress) => void
): Promise<TestReport> {
  console.log('🚀 Starting Vinyl platform beta testing...');
  
  const results: Record<string, CategoryResult> = {};
  let totalTests = 0;
  let completedTests = 0;

  // Count total tests
  for (const category of categories) {
    totalTests += category.runner.testCount;
  }

  // Run each category
  for (const category of categories) {
    const categoryResult: CategoryResult = {
      name: category.name,
      tests: [],
      passed: 0,
      failed: 0,
      warnings: 0
    };

    const tests = await category.runner.getTests();
    
    for (const test of tests) {
      if (onProgress) {
        onProgress({
          progress: Math.round((completedTests / totalTests) * 100),
          currentTest: test.name
        });
      }

      try {
        const startTime = Date.now();
        const result = await test.run();
        const duration = Date.now() - startTime;

        const testResult: TestResult = {
          name: test.name,
          description: test.description,
          critical: test.critical || false,
          passed: result.passed,
          message: result.message,
          details: result.details,
          duration
        };

        categoryResult.tests.push(testResult);

        if (result.passed) {
          categoryResult.passed++;
        } else if (test.critical) {
          categoryResult.failed++;
        } else {
          categoryResult.warnings++;
        }
      } catch (error) {
        console.error(`❌ Test failed: ${test.name}`, error);
        categoryResult.failed++;
      }

      completedTests++;
    }

    results[category.id] = categoryResult;
  }

  // Generate summary
  const summary: TestSummary = {
    totalTests,
    passed: Object.values(results).reduce((sum, cat) => sum + cat.passed, 0),
    failed: Object.values(results).reduce((sum, cat) => sum + cat.failed, 0),
    warnings: Object.values(results).reduce((sum, cat) => sum + cat.warnings, 0),
    criticalIssues: Object.values(results).reduce((sum, cat) => 
      sum + cat.tests.filter(t => !t.passed && t.critical).length, 0
    )
  };

  // Generate action items
  const actionItems: ActionItem[] = [];
  Object.values(results).forEach(category => {
    category.tests.forEach(test => {
      if (!test.passed) {
        actionItems.push({
          priority: test.critical ? 'HIGH' : 'MEDIUM',
          category: category.name,
          test: test.name,
          issue: test.message,
          details: test.details
        });
      }
    });
  });

  actionItems.sort((a, b) => {
    const priorityOrder = { HIGH: 0, MEDIUM: 1, LOW: 2 };
    return priorityOrder[a.priority] - priorityOrder[b.priority];
  });

  // Determine overall status
  let overallStatus: TestReport['overallStatus'];
  if (summary.criticalIssues > 0) {
    overallStatus = 'NOT_READY';
  } else if (summary.failed > 5) {
    overallStatus = 'NEEDS_WORK';
  } else if (summary.failed > 0) {
    overallStatus = 'ALMOST_READY';
  } else {
    overallStatus = 'READY';
  }

  // Generate recommendations
  const recommendations: string[] = [];
  if (summary.criticalIssues > 0) {
    recommendations.push('Fix all critical issues before beta launch');
  }
  if (summary.warnings > 10) {
    recommendations.push('Address warnings to improve user experience');
  }
  if (summary.passed / summary.totalTests < 0.9) {
    recommendations.push('Aim for 90%+ test pass rate before launch');
  }

  return {
    timestamp: new Date().toISOString(),
    platform: 'Vinyl Trading Platform',
    environment: import.meta.env.MODE || 'development',
    overallStatus,
    summary,
    categories: results,
    actionItems,
    recommendations
  };
}
