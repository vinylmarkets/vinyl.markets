import { useState, useEffect } from 'react';
import { getFallbackLogo } from '@/lib/polygon-logo';

// For now, we'll use Clearbit's free logo service as a simple solution
// Later you can implement Polygon API integration with proper API key handling

export function useCompanyLogo(symbol: string, companyName: string) {
  const [logoUrl, setLogoUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchLogo() {
      setIsLoading(true);
      
      // First try fallback logos for common stocks
      const fallbackLogo = getFallbackLogo(symbol);
      if (fallbackLogo) {
        setLogoUrl(fallbackLogo);
        setIsLoading(false);
        return;
      }

      // Try to get logo from company website using Clearbit
      // This is a free service that works for many companies
      try {
        const domain = await getCompanyDomain(companyName);
        if (domain) {
          const clearbitUrl = `https://logo.clearbit.com/${domain}`;
          
          // Test if the logo exists
          const img = new Image();
          img.onload = () => {
            setLogoUrl(clearbitUrl);
            setIsLoading(false);
          };
          img.onerror = () => {
            setLogoUrl(null);
            setIsLoading(false);
          };
          img.src = clearbitUrl;
        } else {
          setLogoUrl(null);
          setIsLoading(false);
        }
      } catch (error) {
        console.error('Error fetching logo:', error);
        setLogoUrl(null);
        setIsLoading(false);
      }
    }

    fetchLogo();
  }, [symbol, companyName]);

  return { logoUrl, isLoading };
}

// Simple domain extraction - you can enhance this
async function getCompanyDomain(companyName: string): Promise<string | null> {
  // Simple mapping for common companies
  const domainMappings: Record<string, string> = {
    'Apple Inc': 'apple.com',
    'Microsoft Corporation': 'microsoft.com', 
    'Amazon.com Inc': 'amazon.com',
    'Alphabet Inc': 'google.com',
    'Tesla Inc': 'tesla.com',
    'Meta Platforms Inc': 'meta.com',
    'NVIDIA Corporation': 'nvidia.com',
    'Netflix Inc': 'netflix.com',
    'Adobe Inc': 'adobe.com',
    'Salesforce Inc': 'salesforce.com',
    'Oracle Corporation': 'oracle.com',
    'Intel Corporation': 'intel.com',
    'Walt Disney Company': 'disney.com',
    'Boeing Company': 'boeing.com',
    'Uber Technologies': 'uber.com',
    'Snap Inc': 'snap.com',
    'PayPal Holdings': 'paypal.com',
    'Block Inc': 'block.xyz',
    'Roku Inc': 'roku.com'
  };

  // Check direct mapping first
  if (domainMappings[companyName]) {
    return domainMappings[companyName];
  }

  // Simple extraction from company name
  const cleanName = companyName
    .toLowerCase()
    .replace(/\b(inc|corp|corporation|company|ltd|llc)\b/g, '')
    .replace(/[^a-z0-9]/g, '')
    .trim();
  
  if (cleanName.length > 2) {
    return `${cleanName}.com`;
  }
  
  return null;
}