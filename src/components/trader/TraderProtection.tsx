import React, { useState, useEffect } from "react";
import { Navigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Shield, Lock } from "lucide-react";

interface TraderProtectionProps {
  children: React.ReactNode;
}

const TRADER_PIN = "7890"; // In production, this should be from environment variables

export const TraderProtection: React.FC<TraderProtectionProps> = ({ children }) => {
  const [pin, setPin] = useState("");
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [attempts, setAttempts] = useState(0);
  const [isLocked, setIsLocked] = useState(false);
  const { toast } = useToast();

  // Check environment variable - disable in production unless explicitly enabled
  const isEnabled = import.meta.env.VITE_ENABLE_TRADING === 'true';
  
  useEffect(() => {
    // Check if already authenticated in this session
    const sessionAuth = sessionStorage.getItem('trader_authenticated');
    if (sessionAuth === 'true') {
      setIsAuthenticated(true);
    }
  }, []);

  // Redirect to 404 if trading is disabled
  if (!isEnabled) {
    return <Navigate to="/404" replace />;
  }

  const handlePinSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (isLocked) {
      toast({
        title: "Access Locked",
        description: "Too many failed attempts. Please refresh the page.",
        variant: "destructive",
      });
      return;
    }

    if (pin === TRADER_PIN) {
      setIsAuthenticated(true);
      sessionStorage.setItem('trader_authenticated', 'true');
      toast({
        title: "Access Granted",
        description: "Welcome to the trading platform",
        variant: "default",
      });
    } else {
      const newAttempts = attempts + 1;
      setAttempts(newAttempts);
      
      if (newAttempts >= 3) {
        setIsLocked(true);
        toast({
          title: "Access Denied",
          description: "Maximum attempts exceeded. Page locked.",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Invalid PIN",
          description: `Incorrect PIN. ${3 - newAttempts} attempts remaining.`,
          variant: "destructive",
        });
      }
      setPin("");
    }
  };

  // Show PIN entry screen if not authenticated
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="w-full max-w-md shadow-lg">
          <CardHeader className="text-center space-y-4">
            <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
              <Shield className="h-8 w-8 text-primary" />
            </div>
            <CardTitle className="text-2xl font-bold">Secure Trading Access</CardTitle>
            <p className="text-muted-foreground">
              This area requires authentication to proceed
            </p>
          </CardHeader>
          
          <CardContent>
            <form onSubmit={handlePinSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="pin" className="flex items-center space-x-2">
                  <Lock className="h-4 w-4" />
                  <span>Enter PIN</span>
                </Label>
                <Input
                  id="pin"
                  type="password"
                  placeholder="••••"
                  value={pin}
                  onChange={(e) => setPin(e.target.value)}
                  maxLength={4}
                  disabled={isLocked}
                  className="text-center text-lg tracking-wider"
                  autoComplete="off"
                />
              </div>
              
              <Button 
                type="submit" 
                className="w-full" 
                disabled={pin.length !== 4 || isLocked}
              >
                {isLocked ? "Access Locked" : "Authenticate"}
              </Button>
              
              {attempts > 0 && !isLocked && (
                <p className="text-sm text-destructive text-center">
                  {3 - attempts} attempts remaining
                </p>
              )}
              
              {isLocked && (
                <p className="text-sm text-destructive text-center">
                  Access locked. Refresh the page to try again.
                </p>
              )}
            </form>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Render protected content if authenticated
  return <>{children}</>;
};