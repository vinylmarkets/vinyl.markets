import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { logAdminAction } from '@/lib/auditLog';

export default function AdminLogin() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Sign in with Supabase
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (authError) throw authError;

      // Check if user is admin
      const { data: adminUser, error: adminError } = await supabase
        .from('admin_users')
        .select('role')
        .eq('user_id', authData.user.id)
        .single();

      if (adminError || !adminUser) {
        await supabase.auth.signOut();
        throw new Error('Not authorized for admin access');
      }

      // Log successful login
      await logAdminAction('admin.login', 'auth');

      // Redirect to dashboard
      navigate('/admin');
      
      toast({
        title: 'Welcome back',
        description: `Logged in as ${adminUser.role}`,
      });

    } catch (error: any) {
      toast({
        title: 'Login failed',
        description: error.message,
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0A0A0A] flex items-center justify-center p-4">
      <Card className="w-full max-w-md bg-[#1A1A1A] border-[#2A2A2A] p-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Vinyl Admin</h1>
          <p className="text-gray-400">Sign in to access the dashboard</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="text-sm font-medium text-gray-300 mb-1.5 block">
              Email
            </label>
            <Input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@vinyl.markets"
              className="bg-[#0A0A0A] border-[#2A2A2A] text-white"
              required
            />
          </div>

          <div>
            <label className="text-sm font-medium text-gray-300 mb-1.5 block">
              Password
            </label>
            <Input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="bg-[#0A0A0A] border-[#2A2A2A] text-white"
              required
            />
          </div>

          <Button
            type="submit"
            className="w-full bg-blue-600 hover:bg-blue-700"
            disabled={isLoading}
          >
            {isLoading ? 'Signing in...' : 'Sign In'}
          </Button>
        </form>

        <p className="text-xs text-gray-500 text-center mt-6">
          Admin access only. All actions are logged.
        </p>
      </Card>
    </div>
  );
}
