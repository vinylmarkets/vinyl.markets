import React, { useState, useEffect } from 'react';

interface FadeInWrapperProps {
  children: React.ReactNode;
  delay?: number;
  className?: string;
}

export const FadeInWrapper: React.FC<FadeInWrapperProps> = ({ 
  children, 
  delay = 100,
  className = '' 
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    // Wait for content to be ready
    const readyTimer = setTimeout(() => {
      setIsReady(true);
    }, delay);

    // Then fade in
    const visibleTimer = setTimeout(() => {
      setIsVisible(true);
    }, delay + 50);

    return () => {
      clearTimeout(readyTimer);
      clearTimeout(visibleTimer);
    };
  }, [delay]);

  return (
    <div 
      className={`transition-opacity duration-500 ${
        isVisible ? 'opacity-100' : 'opacity-0'
      } ${className}`}
    >
      {isReady && children}
    </div>
  );
};