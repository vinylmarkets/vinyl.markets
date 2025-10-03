import { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';

interface PageTransitionProps {
  children: React.ReactNode;
  isLoading: boolean;
}

export function PageTransition({ children, isLoading }: PageTransitionProps) {
  const [shouldRender, setShouldRender] = useState(false);

  useEffect(() => {
    if (!isLoading) {
      // Small delay to ensure all components are ready
      const timer = setTimeout(() => setShouldRender(true), 50);
      return () => clearTimeout(timer);
    } else {
      setShouldRender(false);
    }
  }, [isLoading]);

  return (
    <div className={cn(
      "transition-opacity duration-500 ease-in-out",
      shouldRender ? "opacity-100" : "opacity-0"
    )}>
      {children}
    </div>
  );
}
