/**
 * Historical Data Service
 * Fetches and caches historical market data from Polygon.io
 */

export interface HistoricalBar {
  symbol: string;
  timestamp: Date;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

export interface DataRequest {
  symbol: string;
  startDate: Date;
  endDate: Date;
  timeframe: '1Min' | '5Min' | '15Min' | '1Hour' | '1Day';
}

export interface DataCache {
  symbol: string;
  timeframe: string;
  data: HistoricalBar[];
  lastUpdated: Date;
}

export class HistoricalDataService {
  private cache: Map<string, DataCache>;
  private readonly POLYGON_API_KEY: string;
  private readonly BASE_URL = 'https://api.polygon.io/v2';

  constructor(apiKey: string) {
    this.POLYGON_API_KEY = apiKey;
    this.cache = new Map();
  }

  /**
   * Fetch historical data with automatic caching
   */
  async getHistoricalData(request: DataRequest): Promise<HistoricalBar[]> {
    const cacheKey = this.getCacheKey(request);

    // Check cache first
    const cached = this.cache.get(cacheKey);
    if (cached && this.isCacheValid(cached, request)) {
      console.log(`✅ Cache hit for ${request.symbol}`);
      return cached.data;
    }

    // Fetch from API
    console.log(`📡 Fetching ${request.symbol} from Polygon.io...`);
    const data = await this.fetchFromPolygon(request);

    // Update cache
    this.cache.set(cacheKey, {
      symbol: request.symbol,
      timeframe: request.timeframe,
      data,
      lastUpdated: new Date()
    });

    return data;
  }

  /**
   * Fetch data from Polygon.io API
   */
  private async fetchFromPolygon(request: DataRequest): Promise<HistoricalBar[]> {
    const { symbol, startDate, endDate, timeframe } = request;

    // Convert timeframe to Polygon format
    const multiplier = this.getTimeframeMultiplier(timeframe);
    const timespan = this.getTimeframeSpan(timeframe);

    // Build URL
    const url = `${this.BASE_URL}/aggs/ticker/${symbol}/range/${multiplier}/${timespan}/${this.formatDate(startDate)}/${this.formatDate(endDate)}?apiKey=${this.POLYGON_API_KEY}`;

    try {
      const response = await fetch(url);

      if (!response.ok) {
        throw new Error(`Polygon API error: ${response.status} ${response.statusText}`);
      }

      const json = await response.json();

      if (!json.results || json.results.length === 0) {
        throw new Error(`No data returned for ${symbol}`);
      }

      // Transform to our format
      return json.results.map((bar: any) => ({
        symbol,
        timestamp: new Date(bar.t),
        open: bar.o,
        high: bar.h,
        low: bar.l,
        close: bar.c,
        volume: bar.v
      }));
    } catch (error) {
      console.error('Error fetching from Polygon:', error);
      throw error;
    }
  }

  /**
   * Check if cached data is still valid
   */
  private isCacheValid(cached: DataCache, request: DataRequest): boolean {
    // Cache is valid if:
    // 1. Last updated within 24 hours
    // 2. Data covers requested date range
    const now = new Date();
    const ageHours = (now.getTime() - cached.lastUpdated.getTime()) / (1000 * 60 * 60);

    if (ageHours > 24) {
      return false;
    }

    const cachedStart = cached.data[0]?.timestamp;
    const cachedEnd = cached.data[cached.data.length - 1]?.timestamp;

    return (
      cachedStart <= request.startDate &&
      cachedEnd >= request.endDate
    );
  }

  /**
   * Generate cache key
   */
  private getCacheKey(request: DataRequest): string {
    return `${request.symbol}-${request.timeframe}-${this.formatDate(request.startDate)}-${this.formatDate(request.endDate)}`;
  }

  /**
   * Helper: Convert timeframe to Polygon multiplier
   */
  private getTimeframeMultiplier(timeframe: string): number {
    const map: Record<string, number> = {
      '1Min': 1,
      '5Min': 5,
      '15Min': 15,
      '1Hour': 1,
      '1Day': 1
    };
    return map[timeframe] || 1;
  }

  /**
   * Helper: Convert timeframe to Polygon timespan
   */
  private getTimeframeSpan(timeframe: string): string {
    const map: Record<string, string> = {
      '1Min': 'minute',
      '5Min': 'minute',
      '15Min': 'minute',
      '1Hour': 'hour',
      '1Day': 'day'
    };
    return map[timeframe] || 'day';
  }

  /**
   * Helper: Format date for Polygon API (YYYY-MM-DD)
   */
  private formatDate(date: Date): string {
    return date.toISOString().split('T')[0];
  }

  /**
   * Clear cache (useful for testing)
   */
  clearCache(): void {
    this.cache.clear();
    console.log('🗑️ Cache cleared');
  }

  /**
   * Get cache statistics
   */
  getCacheStats(): {
    size: number;
    symbols: string[];
    oldestEntry: Date | null;
  } {
    const entries = Array.from(this.cache.values());

    return {
      size: this.cache.size,
      symbols: [...new Set(entries.map(e => e.symbol))],
      oldestEntry: entries.length > 0
        ? entries.reduce((oldest, e) =>
            e.lastUpdated < oldest ? e.lastUpdated : oldest,
            entries[0].lastUpdated
          )
        : null
    };
  }
}

// Singleton Instance
let instance: HistoricalDataService | null = null;

export function getHistoricalDataService(): HistoricalDataService {
  if (!instance) {
    const apiKey = import.meta.env.VITE_POLYGON_API_KEY || '';
    if (!apiKey) {
      throw new Error('POLYGON_API_KEY not configured');
    }
    instance = new HistoricalDataService(apiKey);
  }
  return instance;
}
