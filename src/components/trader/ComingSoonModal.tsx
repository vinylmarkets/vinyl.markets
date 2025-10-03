import React from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Bell, Sparkles } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface ComingSoonModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  featureName: string;
}

const featureDescriptions: Record<string, string> = {
  Positions: "Track your active positions in real-time with detailed P&L analysis, cost basis tracking, and risk metrics.",
  Orders: "View and manage all your pending, filled, and cancelled orders with advanced filtering and order history.",
  Research: "Deep-dive stock analysis with fundamental data, technical indicators, news sentiment, and AI-powered insights.",
  Backtesting: "Test your trading strategies against historical data with detailed performance metrics and optimization tools.",
};

export const ComingSoonModal: React.FC<ComingSoonModalProps> = ({
  open,
  onOpenChange,
  featureName,
}) => {
  const { toast } = useToast();

  const handleNotifyMe = () => {
    toast({
      title: "You're on the list! 🎉",
      description: `We'll notify you when ${featureName} is ready to use.`,
    });
    onOpenChange(false);
  };

  const description =
    featureDescriptions[featureName] ||
    `We're working hard on bringing you ${featureName}. This feature will enhance your trading experience.`;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-2 mb-2">
            <Sparkles className="h-5 w-5 text-primary" />
            <DialogTitle>Coming Soon</DialogTitle>
          </div>
          <DialogDescription className="text-base pt-2">
            <span className="font-semibold text-foreground">{featureName}</span> is currently
            under development.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <p className="text-sm text-muted-foreground">{description}</p>

          <div className="bg-accent/50 rounded-lg p-4 border border-border/50">
            <p className="text-sm text-foreground">
              Want to be notified when this feature launches?
            </p>
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <Button onClick={handleNotifyMe} className="w-full gap-2">
            <Bell className="h-4 w-4" />
            Notify me when ready
          </Button>
          <Button variant="outline" onClick={() => onOpenChange(false)} className="w-full">
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
