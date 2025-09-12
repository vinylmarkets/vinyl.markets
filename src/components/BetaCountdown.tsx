import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export const BetaCountdown = () => {
  const [spotsLeft, setSpotsLeft] = useState(127);
  const [timeLeft, setTimeLeft] = useState({
    days: 2,
    hours: 14,
    minutes: 32,
    seconds: 45
  });

  useEffect(() => {
    const interval = setInterval(() => {
      setTimeLeft(prev => {
        let { days, hours, minutes, seconds } = prev;
        
        if (seconds > 0) {
          seconds--;
        } else {
          seconds = 59;
          if (minutes > 0) {
            minutes--;
          } else {
            minutes = 59;
            if (hours > 0) {
              hours--;
            } else {
              hours = 23;
              if (days > 0) {
                days--;
              }
            }
          }
        }
        
        return { days, hours, minutes, seconds };
      });
    }, 1000);

    // Simulate spots being taken
    const spotsInterval = setInterval(() => {
      if (Math.random() < 0.3) {
        setSpotsLeft(prev => Math.max(0, prev - 1));
      }
    }, 15000);

    return () => {
      clearInterval(interval);
      clearInterval(spotsInterval);
    };
  }, []);

  return (
    <Card className="p-6 bg-gradient-to-br from-primary/10 to-secondary/10 border-primary/30">
      <div className="text-center">
        <div className="mb-4">
          <div className="text-sm font-semibold text-primary mb-2">⚡ EXCLUSIVE BETA ACCESS</div>
          <div className="text-lg font-bold text-foreground mb-2">
            Top 500 Early Users Get Lifetime Access
          </div>
          <div className="text-sm text-muted-foreground">
            After 1 year of membership - yours forever
          </div>
        </div>
        
        <div className="flex justify-center gap-4 mb-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-foreground">{timeLeft.days}</div>
            <div className="text-xs text-muted-foreground">DAYS</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-foreground">{timeLeft.hours}</div>
            <div className="text-xs text-muted-foreground">HOURS</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-foreground">{timeLeft.minutes}</div>
            <div className="text-xs text-muted-foreground">MIN</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-secondary">{timeLeft.seconds}</div>
            <div className="text-xs text-muted-foreground">SEC</div>
          </div>
        </div>
        
        <div className="mb-4">
          <div className="text-lg font-semibold text-secondary">{spotsLeft} spots left</div>
          <div className="w-full bg-muted rounded-full h-2 mt-2">
            <div 
              className="bg-gradient-to-r from-secondary to-primary h-2 rounded-full transition-all duration-300"
              style={{ width: `${((500 - spotsLeft) / 500) * 100}%` }}
            ></div>
          </div>
        </div>
        
        <Button className="w-full bg-gradient-success hover:bg-gradient-success/90 text-lg py-3 shadow-glow-green">
          Claim Your Lifetime Spot
        </Button>
        <div className="text-xs text-muted-foreground mt-2">
          🔒 Secure your position • No credit card required
        </div>
      </div>
    </Card>
  );
};