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

  // Check environment variable - disable in production unless explicitly enabled
  // Temporarily disabled for development
  const isEnabled = true; // import.meta.env.VITE_ENABLE_TRADING === 'true';
  console.log('TraderProtection: isEnabled =', isEnabled, 'env var =', import.meta.env.VITE_ENABLE_TRADING);
  
  useEffect(() => {
    checkTraderAccess();
  }, [user]);

  const checkTraderAccess = async () => {
    if (!user?.email) {
      setIsAuthenticated(false);
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase.rpc('is_whitelisted_trader', {
        user_email: user.email
      });

      if (error) {
        console.error('Error checking trader access:', error);
        setIsAuthenticated(false);
      } else {
        setIsAuthenticated(data || false);
      }
    } catch (error) {
      console.error('Error in trader access check:', error);
      setIsAuthenticated(false);
    } finally {
      setLoading(false);
    }
  };

  // Redirect to 404 if trading is disabled
  if (!isEnabled) {
    console.log('TraderProtection: Trading disabled, redirecting to 404');
    return <Navigate to="/404" replace />;
  }

  // Show loading state
  if (loading) {
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
    return <Navigate to="/trader-auth" replace />;
  }

  // Render protected content if authenticated
  return <>{children}</>;
};