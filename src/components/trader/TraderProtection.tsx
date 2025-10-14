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
    
    // Simply check if user is logged in - no RPC call needed
    if (!user) {
      console.log('[TraderProtection] No user, setting authenticated=false');
      setIsAuthenticated(false);
      setLoading(false);
      return;
    }

    // User is logged in - grant access
    console.log('[TraderProtection] User is logged in, granting access');
    setIsAuthenticated(true);
    setLoading(false);
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