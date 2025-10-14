import React, { useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Shield, Eye, EyeOff } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/components/auth/AuthProvider";

const TraderAuth = () => {
  console.log('TraderAuth component is rendering');
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();
  const { user } = useAuth();

  // Check if user is already authenticated as a trader
  React.useEffect(() => {
    let mounted = true;
    
    const checkTraderAccess = async () => {
      if (!user?.email) {
        console.log('TraderAuth: No user email, skipping check');
        return;
      }

      console.log('TraderAuth: Checking trader access for:', user.email);

      try {
        const { data, error } = await supabase.rpc('is_whitelisted_trader', {
          user_email: user.email
        });

        if (!mounted) {
          console.log('TraderAuth: Component unmounted, aborting');
          return;
        }

        if (error) {
          console.error('TraderAuth: Error checking whitelist:', error);
          // For beta testing, allow access even if whitelist check fails
          console.log('TraderAuth: Beta mode - allowing access despite error');
          navigate('/trader');
          return;
        }

        if (data) {
          console.log('TraderAuth: User is whitelisted, updating last login');
          // Update last login
          await supabase.rpc('update_trader_last_login', {
            user_email: user.email
          });
        } else {
          console.log('TraderAuth: User not whitelisted, but allowing access for beta');
        }

        // For beta testing, redirect all authenticated users
        if (mounted) {
          console.log('TraderAuth: Redirecting to /trader');
          navigate('/trader');
        }
      } catch (error) {
        console.error('TraderAuth: Exception during access check:', error);
        // For beta testing, allow access even on error
        if (mounted) {
          console.log('TraderAuth: Beta mode - allowing access despite exception');
          navigate('/trader');
        }
      }
    };

    if (user) {
      console.log('TraderAuth: User authenticated, starting access check');
      checkTraderAccess();
    }

    return () => {
      console.log('TraderAuth: Cleanup - component unmounting');
      mounted = false;
    };
  }, [user, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !password) {
      toast({
        title: "Missing Information",
        description: "Please enter both email and password.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
      // First check if email is whitelisted
      const { data: isWhitelisted, error: whitelistError } = await supabase.rpc('is_whitelisted_trader', {
        user_email: email
      });

      if (whitelistError) {
        throw whitelistError;
      }

      if (!isWhitelisted) {
        toast({
          title: "Access Denied",
          description: "Your email is not authorized for trader access.",
          variant: "destructive",
        });
        setLoading(false);
        return;
      }

      // Attempt to sign in with Supabase
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (authError) {
        toast({
          title: "Authentication Failed",
          description: authError.message,
          variant: "destructive",
        });
        setLoading(false);
        return;
      }

      if (authData.user) {
        // Update last login for trader
        await supabase.rpc('update_trader_last_login', {
          user_email: email
        });

        toast({
          title: "Access Granted",
          description: "Welcome to the trading platform",
          variant: "default",
        });

        navigate('/trader');
      }
    } catch (error) {
      console.error('Login error:', error);
      toast({
        title: "Login Error",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // If already authenticated and whitelisted, redirect
  if (user) {
    console.log('TraderAuth: User is authenticated, showing debug info instead of redirecting');
    return <div className="flex items-center justify-center min-h-screen">
      <div className="text-center space-y-4">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
        <p>Already logged in as: {user.email}</p>
        <p>Checking trader access...</p>
        <Button onClick={() => navigate('/trader')}>Go to Trader Dashboard</Button>
        <Button variant="outline" onClick={() => supabase.auth.signOut()}>Logout to see login form</Button>
      </div>
    </div>;
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-md shadow-xl">
        <CardHeader className="text-center space-y-4">
          <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
            <Shield className="h-8 w-8 text-primary" />
          </div>
          <CardTitle className="text-2xl font-bold">Trading Platform Access</CardTitle>
          <p className="text-muted-foreground">
            Authorized traders only
          </p>
        </CardHeader>
        
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <Input
                id="email"
                type="email"
                placeholder="trader@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={loading}
                required
                autoComplete="email"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={loading}
                  required
                  autoComplete="current-password"
                  className="pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  disabled={loading}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
            </div>
            
            <Button 
              type="submit" 
              className="w-full" 
              disabled={loading || !email || !password}
            >
              {loading ? (
                <div className="flex items-center space-x-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  <span>Authenticating...</span>
                </div>
              ) : (
                "Access Trading Platform"
              )}
            </Button>
          </form>
          
          <div className="mt-6 text-center text-sm text-muted-foreground">
            <p>Secure access with 30-day sessions</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default TraderAuth;