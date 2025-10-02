export interface StockSearchResult {
  ticker: string;
  name: string;
  market: string;
  locale: string;
  primary_exchange?: string;
  type?: string;
  currency_name?: string;
  last_updated_utc?: string;
}

export interface PolygonTickerSearchResponse {
  status: string;
  results: StockSearchResult[];
  count: number;
  next_url?: string;
}

export interface SearchResultAmp {
  id: string;
  name: string;
  is_active: boolean;
  allocated_capital: number;
}

export interface SearchResultPosition {
  symbol: string;
  quantity: number;
  average_cost: number;
  current_price: number;
  unrealized_pnl: number;
}

export interface PlatformPage {
  name: string;
  path: string;
  category: string;
  keywords: string[];
}

export interface RecentSearch {
  query: string;
  type: 'stock' | 'amp' | 'position' | 'page';
  timestamp: number;
}
