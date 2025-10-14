import React, { useState, useEffect, useCallback } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "@/components/auth/AuthProvider";

interface TraderProtectionProps {
  children: React.ReactNode;
}

export const TraderProtection: React.FC<TraderProtectionProps> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [checking, setChecking] = useState(true);
  const { user, loading: authLoading } = useAuth();

  const isEnabled = true;
  
  const checkTraderAccess = useCallback(() => {
    console.log('[TraderProtection] Checking', { authLoading, user: !!user });
    
    if (authLoading) {
      console.log('[TraderProtection] Waiting for auth...');
      return;
    }

    if (!user) {
      console.log('[TraderProtection] No user - redirect to auth');
      setIsAuthenticated(false);
      setChecking(false);
      return;
    }

    console.log('[TraderProtection] User OK:', user.email);
    setIsAuthenticated(true);
    setChecking(false);
  }, [user, authLoading]);

  useEffect(() => {
    checkTraderAccess();
  }, [checkTraderAccess]);

  if (!isEnabled) {
    return <Navigate to="/404" replace />;
  }

  if (authLoading || checking) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p>{authLoading ? 'Checking authentication...' : 'Verifying access...'}</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/trader-auth" replace />;
  }

  return <>{children}</>;
};
