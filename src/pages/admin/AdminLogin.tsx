import { useState, useEffect } from 'react';
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
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isResettingPassword, setIsResettingPassword] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  // Check if user arrived via password reset link
  useEffect(() => {
    supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'PASSWORD_RECOVERY') {
        setIsResettingPassword(true);
      }
    });
  }, []);

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

  const handleForgotPassword = async () => {
    if (!email) {
      toast({
        title: 'Email required',
        description: 'Please enter your email address first',
        variant: 'destructive'
      });
      return;
    }

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/admin/login`
      });

      if (error) throw error;

      toast({
        title: 'Check your email',
        description: 'Password reset link has been sent to your email',
      });
    } catch (error: any) {
      toast({
        title: 'Reset failed',
        description: error.message,
        variant: 'destructive'
      });
    }
  };

  const handlePasswordReset = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (newPassword !== confirmPassword) {
      toast({
        title: 'Passwords do not match',
        description: 'Please make sure both passwords are the same',
        variant: 'destructive'
      });
      return;
    }

    if (newPassword.length < 6) {
      toast({
        title: 'Password too short',
        description: 'Password must be at least 6 characters',
        variant: 'destructive'
      });
      return;
    }

    setIsLoading(true);

    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword
      });

      if (error) throw error;

      toast({
        title: 'Password updated',
        description: 'Your password has been successfully reset',
      });

      // Reset state and show login form
      setIsResettingPassword(false);
      setNewPassword('');
      setConfirmPassword('');
    } catch (error: any) {
      toast({
        title: 'Reset failed',
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
          <p className="text-gray-400">
            {isResettingPassword ? 'Set your new password' : 'Sign in to access the dashboard'}
          </p>
        </div>

        {isResettingPassword ? (
          <form onSubmit={handlePasswordReset} className="space-y-4">
            <div>
              <label className="text-sm font-medium text-gray-300 mb-1.5 block">
                New Password
              </label>
              <Input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="••••••••"
                className="bg-[#0A0A0A] border-[#2A2A2A] text-white"
                required
              />
            </div>

            <div>
              <label className="text-sm font-medium text-gray-300 mb-1.5 block">
                Confirm New Password
              </label>
              <Input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
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
              {isLoading ? 'Updating...' : 'Update Password'}
            </Button>

            <button
              type="button"
              onClick={() => setIsResettingPassword(false)}
              className="w-full text-sm text-gray-400 hover:text-gray-300 transition-colors mt-2"
            >
              Back to Sign In
            </button>
          </form>
        ) : (
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

            <button
              type="button"
              onClick={handleForgotPassword}
              className="w-full text-sm text-gray-400 hover:text-gray-300 transition-colors mt-2"
            >
              Forgot Password?
            </button>
          </form>
        )}

        <p className="text-xs text-gray-500 text-center mt-6">
          Admin access only. All actions are logged.
        </p>
      </Card>
    </div>
  );
}
