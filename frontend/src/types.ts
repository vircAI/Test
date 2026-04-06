export interface Quote {
  symbol: string;
  name: string;
  type: 'index' | 'stock';
  price: number;
  change: number;
  changePercent: number;
  open: number;
  high: number;
  low: number;
  volume: number;
  marketCap?: number;
  previousClose: number;
}

export interface MarketData {
  indexes: Quote[];
  stocks: Quote[];
  updatedAt: string;
}

export interface HistoryPoint {
  date: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

export interface HistoryData {
  symbol: string;
  period: string;
  data: HistoryPoint[];
}

export interface SearchResult {
  symbol: string;
  name: string;
  type: string;
}

export type Period = '1D' | '1W' | '1M' | '3M' | '1Y' | '5Y';
