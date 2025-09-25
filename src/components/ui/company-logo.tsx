import { useState } from "react";
import { Building2 } from "lucide-react";

interface CompanyLogoProps {
  symbol: string;
  companyName: string;
  logoUrl?: string | null;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function CompanyLogo({ 
  symbol, 
  companyName, 
  logoUrl, 
  size = 'md',
  className = '' 
}: CompanyLogoProps) {
  const [imageError, setImageError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const sizeClasses = {
    sm: 'w-6 h-6',
    md: 'w-8 h-8',
    lg: 'w-12 h-12'
  };

  const iconSizeClasses = {
    sm: 'w-3 h-3',
    md: 'w-4 h-4', 
    lg: 'w-6 h-6'
  };

  // If no logo URL provided or image failed to load, show fallback
  if (!logoUrl || imageError) {
    return (
      <div className={`${sizeClasses[size]} ${className} bg-muted rounded-full flex items-center justify-center border border-border`}>
        <Building2 className={iconSizeClasses[size] + " text-muted-foreground"} />
      </div>
    );
  }

  return (
    <div className={`${sizeClasses[size]} ${className} relative`}>
      {isLoading && (
        <div className={`${sizeClasses[size]} bg-muted rounded-full flex items-center justify-center border border-border animate-pulse`}>
          <Building2 className={iconSizeClasses[size] + " text-muted-foreground"} />
        </div>
      )}
      <img
        src={logoUrl}
        alt={`${companyName} logo`}
        className={`${sizeClasses[size]} rounded-full border border-border object-cover ${isLoading ? 'opacity-0' : 'opacity-100'} transition-opacity`}
        onLoad={() => setIsLoading(false)}
        onError={() => {
          setImageError(true);
          setIsLoading(false);
        }}
      />
    </div>
  );
}