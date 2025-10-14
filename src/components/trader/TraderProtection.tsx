import React, { useState, useEffect } from "react";
import { Navigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/components/auth/AuthProvider";

interface TraderProtectionProps {
  children: React.ReactNode;
}

export const TraderProtection: React.FC<TraderProtectionProps> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  console.log('[TraderProtection] Render:', { 
    hasUser: !!user, 
    userEmail: user?.email,
    isAuthenticated, 
    loading 
  });

  // Check environment variable - disable in production unless explicitly enabled
  // Temporarily disabled for development
  const isEnabled = true; // import.meta.env.VITE_ENABLE_TRADING === 'true';
  console.log('[TraderProtection] isEnabled =', isEnabled);
  
  useEffect(() => {
    console.log('[TraderProtection] useEffect triggered', { hasUser: !!user, userEmail: user?.email });
    checkTraderAccess();
  }, [user]);

  const checkTraderAccess = async () => {
    console.log('[TraderProtection] checkTraderAccess called', { hasUser: !!user, userEmail: user?.email });
    
    if (!user?.email) {
      console.log('[TraderProtection] No user email, setting authenticated=false');
      setIsAuthenticated(false);
      setLoading(false);
      return;
    }

    try {
      console.log('[TraderProtection] Making RPC call to is_whitelisted_trader with 5s timeout');
      
      // Create timeout promise (5 seconds)
      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error("RPC call timed out after 5 seconds")), 5000)
      );

      // Race between RPC call and timeout
      const rpcPromise = supabase.rpc('is_whitelisted_trader', {
        user_email: user.email
      });

      const { data, error } = await Promise.race([rpcPromise, timeoutPromise]) as any;

      console.log('[TraderProtection] RPC response:', { data, error });

      if (error) {
        console.error('[TraderProtection] Error checking trader access:', error);
        console.log('[TraderProtection] Beta mode - allowing access despite error');
        setIsAuthenticated(true);
      } else {
        console.log('[TraderProtection] Whitelist status:', data);
        console.log('[TraderProtection] Beta mode - allowing all authenticated users');
        setIsAuthenticated(true);
      }
    } catch (error) {
      console.error('[TraderProtection] Exception in trader access check:', error);
      console.log('[TraderProtection] Beta mode - allowing access despite exception/timeout');
      setIsAuthenticated(true);
    } finally {
      console.log('[TraderProtection] Setting loading to false');
      setLoading(false);
    }
  };

  // Redirect to 404 if trading is disabled
  if (!isEnabled) {
    console.log('[TraderProtection] Trading disabled, redirecting to 404');
    return <Navigate to="/404" replace />;
  }

  // Show loading state
  if (loading) {
    console.log('[TraderProtection] Showing loading state');
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p>Checking trader access...</p>
        </div>
      </div>
    );
  }

  // Redirect to trader auth if not authenticated
  if (!isAuthenticated) {
    console.log('[TraderProtection] Not authenticated, redirecting to /trader-auth');
    return <Navigate to="/trader-auth" replace />;
  }

  // Render protected content if authenticated
  console.log('[TraderProtection] Rendering protected content');
  return <>{children}</>;
};