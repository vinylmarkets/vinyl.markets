// Polygon.io ticker details API to get company logos
const POLYGON_API_KEY = 'YOUR_POLYGON_API_KEY'; // This will be set as a secret in Supabase

interface TickerDetails {
  ticker: string;
  name: string;
  branding?: {
    logo_url?: string;
    icon_url?: string;
  };
}

interface PolygonResponse {
  results: TickerDetails;
  status: string;
}

// Cache for logos to avoid repeated API calls
const logoCache = new Map<string, string | null>();

export async function getTickerLogo(symbol: string): Promise<string | null> {
  // Check cache first
  if (logoCache.has(symbol)) {
    return logoCache.get(symbol) || null;
  }

  try {
    const response = await fetch(
      `https://api.polygon.io/v3/reference/tickers/${symbol}?apikey=${POLYGON_API_KEY}`
    );
    
    if (!response.ok) {
      throw new Error(`API call failed: ${response.status}`);
    }
    
    const data: PolygonResponse = await response.json();
    
    // Extract logo URL from branding
    const logoUrl = data.results?.branding?.logo_url || data.results?.branding?.icon_url || null;
    
    // Cache the result
    logoCache.set(symbol, logoUrl);
    
    return logoUrl;
  } catch (error) {
    console.error(`Error fetching logo for ${symbol}:`, error);
    logoCache.set(symbol, null);
    return null;
  }
}

export function clearLogoCache() {
  logoCache.clear();
}

// Fallback logos for common tickers (in case API fails)
export const fallbackLogos: Record<string, string> = {
  AAPL: 'https://logo.clearbit.com/apple.com',
  MSFT: 'https://logo.clearbit.com/microsoft.com',
  GOOGL: 'https://logo.clearbit.com/google.com',
  AMZN: 'https://logo.clearbit.com/amazon.com',
  TSLA: 'https://logo.clearbit.com/tesla.com',
  META: 'https://logo.clearbit.com/meta.com',
  NVDA: 'https://logo.clearbit.com/nvidia.com',
  // Add more as needed
};

export function getFallbackLogo(symbol: string): string | null {
  return fallbackLogos[symbol] || null;
}