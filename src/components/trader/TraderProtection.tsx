import React, { useState, useEffect, useCallback } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "@/components/auth/AuthProvider";

interface TraderProtectionProps {
  children: React.ReactNode;
}

export const TraderProtection: React.FC<TraderProtectionProps> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  // Check environment variable
  const isEnabled = true;
  
  // CRITICAL FIX: Wrap in useCallback to prevent function recreation
  const checkTraderAccess = useCallback(() => {
    console.log('[TraderProtection] Checking access for:', user?.email);
    
    if (!user) {
      console.log('[TraderProtection] No user - blocking access');
      setIsAuthenticated(false);
      setLoading(false);
      return;
    }

    // User exists - grant access
    console.log('[TraderProtection] User authenticated - granting access');
    setIsAuthenticated(true);
    setLoading(false);
  }, [user]); // Only recreate when user changes

  useEffect(() => {
    console.log('[TraderProtection] Running access check');
    checkTraderAccess();
  }, [checkTraderAccess]); // Now properly depends on the memoized function

  if (!isEnabled) {
    return <Navigate to="/404" replace />;
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p>Checking trader access...</p>
          <p className="text-xs text-muted-foreground mt-2">
            {user?.email || 'Verifying authentication...'}
          </p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/trader-auth" replace />;
  }

  return <>{children}</>;
};