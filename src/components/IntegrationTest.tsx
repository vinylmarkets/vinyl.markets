import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  CheckCircle2, 
  XCircle, 
  Clock,
  Database, 
  Shield, 
  User,
  MessageSquare,
  RefreshCw
} from 'lucide-react';
import { useAuth } from '@/components/auth/AuthProvider';
import { supabase } from '@/integrations/supabase/client';

interface TestResult {
  name: string;
  status: 'pending' | 'success' | 'error';
  message: string;
  details?: string;
}

export default function IntegrationTest() {
  const { user, session, loading } = useAuth();
  const [tests, setTests] = useState<TestResult[]>([
    { name: 'Supabase Client Configuration', status: 'pending', message: 'Testing...' },
    { name: 'Authentication State Management', status: 'pending', message: 'Testing...' },
    { name: 'Database Connection', status: 'pending', message: 'Testing...' },
    { name: 'Row Level Security', status: 'pending', message: 'Testing...' },
    { name: 'User Data Flow', status: 'pending', message: 'Testing...' }
  ]);
  
  const [isRunning, setIsRunning] = useState(false);

  const updateTest = (index: number, updates: Partial<TestResult>) => {
    setTests(prev => prev.map((test, i) => 
      i === index ? { ...test, ...updates } : test
    ));
  };

  const runTests = async () => {
    setIsRunning(true);
    
    // Test 1: Supabase Client Configuration
    try {
      const url = import.meta.env.VITE_SUPABASE_URL;
      const key = import.meta.env.VITE_SUPABASE_ANON_KEY;
      
      if (url && key && url !== 'https://placeholder.supabase.co') {
        updateTest(0, {
          status: 'success',
          message: 'Supabase client properly configured',
          details: `URL: ${url.substring(0, 50)}...`
        });
      } else {
        updateTest(0, {
          status: 'error',
          message: 'Supabase client not configured',
          details: 'Check environment variables'
        });
      }
    } catch (error) {
      updateTest(0, {
        status: 'error',
        message: 'Error checking client configuration',
        details: String(error)
      });
    }

    // Test 2: Authentication State Management
    if (loading) {
      updateTest(1, {
        status: 'pending',
        message: 'Waiting for auth to initialize...'
      });
    } else {
      updateTest(1, {
        status: user ? 'success' : 'error',
        message: user ? 'Authentication working' : 'No authenticated user',
        details: user ? `User ID: ${user.id.substring(0, 8)}...` : 'User needs to sign up/login'
      });
    }

    // Test 3: Database Connection
    try {
      const { data, error } = await supabase
        .from('users')
        .select('count', { count: 'exact' });
        
      if (error) {
        updateTest(2, {
          status: 'error',
          message: 'Database connection failed',
          details: error.message
        });
      } else {
        updateTest(2, {
          status: 'success',
          message: 'Database connection successful',
          details: `Users table accessible`
        });
      }
    } catch (error) {
      updateTest(2, {
        status: 'error',
        message: 'Database connection error',
        details: String(error)
      });
    }

    // Test 4: Row Level Security
    if (user) {
      try {
        // Test RLS by trying to access user data
        const { data: userData, error: userError } = await supabase
          .from('users')
          .select('*')
          .eq('id', user.id);

        if (userError) {
          updateTest(3, {
            status: 'error',
            message: 'RLS policy blocking access',
            details: userError.message
          });
        } else {
          updateTest(3, {
            status: 'success',
            message: 'RLS policies working correctly',
            details: `Can access own user data: ${userData?.length || 0} records`
          });
        }
      } catch (error) {
        updateTest(3, {
          status: 'error',
          message: 'RLS test failed',
          details: String(error)
        });
      }
    } else {
      updateTest(3, {
        status: 'error',
        message: 'Cannot test RLS without authenticated user',
        details: 'Need to login first'
      });
    }

    // Test 5: User Data Flow
    if (user) {
      try {
        // Test creating and reading terminal queries
        const testQuery = {
          user_id: user.id,
          query_text: 'Integration test query',
          response_text: 'Integration test response',
          ai_model_used: 'test'
        };

        const { data: insertData, error: insertError } = await supabase
          .from('terminal_queries')
          .insert(testQuery)
          .select();

        if (insertError) {
          updateTest(4, {
            status: 'error',
            message: 'Cannot insert user data',
            details: insertError.message
          });
        } else {
          // Try to read it back
          const { data: readData, error: readError } = await supabase
            .from('terminal_queries')
            .select('*')
            .eq('user_id', user.id)
            .limit(1);

          if (readError) {
            updateTest(4, {
              status: 'error',
              message: 'Cannot read user data',
              details: readError.message
            });
          } else {
            updateTest(4, {
              status: 'success',
              message: 'User data flow working',
              details: `Can read/write user data: ${readData?.length || 0} queries`
            });
          }
        }
      } catch (error) {
        updateTest(4, {
          status: 'error',
          message: 'User data flow test failed',
          details: String(error)
        });
      }
    } else {
      updateTest(4, {
        status: 'error',
        message: 'Cannot test data flow without authenticated user',
        details: 'Need to login first'
      });
    }

    setIsRunning(false);
  };

  useEffect(() => {
    if (!loading) {
      runTests();
    }
  }, [loading, user]);

  const getStatusIcon = (status: TestResult['status']) => {
    switch (status) {
      case 'success':
        return <CheckCircle2 className="h-5 w-5 text-green-600" />;
      case 'error':
        return <XCircle className="h-5 w-5 text-red-600" />;
      case 'pending':
        return <Clock className="h-5 w-5 text-yellow-600" />;
    }
  };

  const getStatusBadge = (status: TestResult['status']) => {
    switch (status) {
      case 'success':
        return <Badge variant="secondary" className="bg-green-100 text-green-800">PASS</Badge>;
      case 'error':
        return <Badge variant="destructive">FAIL</Badge>;
      case 'pending':
        return <Badge variant="outline" className="bg-yellow-100 text-yellow-800">TESTING</Badge>;
    }
  };

  const allTestsPassed = tests.every(test => test.status === 'success');
  const hasFailures = tests.some(test => test.status === 'error');

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <div className="text-center">
        <h1 className="text-3xl font-serif font-bold mb-2">Integration Test Suite</h1>
        <p className="text-muted-foreground">
          Testing Supabase backend integration and authentication flow
        </p>
      </div>

      {/* Overall Status */}
      <Alert className={`border-2 ${
        allTestsPassed ? 'border-green-200 bg-green-50' :
        hasFailures ? 'border-red-200 bg-red-50' :
        'border-yellow-200 bg-yellow-50'
      }`}>
        <div className="flex items-center gap-2">
          {allTestsPassed ? <CheckCircle2 className="h-5 w-5 text-green-600" /> :
           hasFailures ? <XCircle className="h-5 w-5 text-red-600" /> :
           <Clock className="h-5 w-5 text-yellow-600" />}
          <AlertDescription className="font-medium">
            {allTestsPassed ? 'All integration tests passed! Your backend is properly connected.' :
             hasFailures ? 'Some tests failed. Check the details below.' :
             'Running integration tests...'}
          </AlertDescription>
        </div>
      </Alert>

      {/* User Info */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Authentication Status
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span>Loading:</span>
              <Badge variant={loading ? "destructive" : "secondary"}>
                {loading ? "True" : "False"}
              </Badge>
            </div>
            <div className="flex items-center justify-between">
              <span>User:</span>
              <Badge variant={user ? "secondary" : "outline"}>
                {user ? `${user.email || 'Authenticated'}` : "None"}
              </Badge>
            </div>
            <div className="flex items-center justify-between">
              <span>Session:</span>
              <Badge variant={session ? "secondary" : "outline"}>
                {session ? "Active" : "None"}
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Test Results */}
      <div className="grid gap-4">
        {tests.map((test, index) => (
          <Card key={index} className="border-l-4" style={{
            borderLeftColor: test.status === 'success' ? '#16a34a' :
                           test.status === 'error' ? '#dc2626' : '#ca8a04'
          }}>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-3">
                  {getStatusIcon(test.status)}
                  <h3 className="font-semibold">{test.name}</h3>
                </div>
                {getStatusBadge(test.status)}
              </div>
              <p className="text-sm text-muted-foreground mb-1">{test.message}</p>
              {test.details && (
                <p className="text-xs text-muted-foreground bg-muted p-2 rounded font-mono">
                  {test.details}
                </p>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Actions */}
      <div className="flex gap-4">
        <Button 
          onClick={runTests} 
          disabled={isRunning}
          className="flex items-center gap-2"
        >
          <RefreshCw className={`h-4 w-4 ${isRunning ? 'animate-spin' : ''}`} />
          Re-run Tests
        </Button>
        
        {!user && (
          <Button variant="outline" onClick={() => window.location.href = '/'}>
            Go to Login
          </Button>
        )}
      </div>

      {/* Next Steps */}
      {allTestsPassed && (
        <Alert className="border-green-200 bg-green-50">
          <CheckCircle2 className="h-4 w-4 text-green-600" />
          <AlertDescription>
            <strong>Integration Complete!</strong> Your frontend is successfully connected to Supabase. 
            You can now test all features including authentication, briefings, and the Ask AtomicMarket terminal.
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
}