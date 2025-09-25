import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { LoginForm } from "./LoginForm";
import { RegisterForm } from "./RegisterForm";
import { Button } from "@/components/ui/button";

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialTab?: 'login' | 'register';
}

export function AuthModal({ isOpen, onClose, initialTab = 'login' }: AuthModalProps) {
  const [activeTab, setActiveTab] = useState<'login' | 'register'>(initialTab);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-serif text-center">
            {activeTab === 'login' ? 'Welcome Back' : 'Join AtomicMarket'}
          </DialogTitle>
        </DialogHeader>

        {/* Tab Navigation */}
        <div className="flex bg-muted rounded-lg p-1 mb-6">
          <Button
            variant={activeTab === 'login' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setActiveTab('login')}
            className="flex-1 rounded-md"
          >
            Login
          </Button>
          <Button
            variant={activeTab === 'register' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setActiveTab('register')}
            className="flex-1 rounded-md"
          >
            Sign Up
          </Button>
        </div>

        {/* Forms */}
        {activeTab === 'login' ? (
          <LoginForm onClose={onClose} />
        ) : (
          <RegisterForm onClose={onClose} />
        )}

        {/* Switch Forms */}
        <div className="text-center text-sm text-muted-foreground mt-4">
          {activeTab === 'login' ? (
            <>
              Don't have an account?{' '}
              <button
                onClick={() => setActiveTab('register')}
                className="text-primary hover:underline font-medium"
              >
                Sign up for free
              </button>
            </>
          ) : (
            <>
              Already have an account?{' '}
              <button
                onClick={() => setActiveTab('login')}
                className="text-primary hover:underline font-medium"
              >
                Log in
              </button>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}