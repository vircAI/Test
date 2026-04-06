import type { MarketData, HistoryData, SearchResult, Period } from './types';

const BASE = '/api';

export async function fetchMarket(): Promise<MarketData> {
  const res = await fetch(`${BASE}/market`);
  if (!res.ok) throw new Error('Failed to fetch market data');
  return res.json();
}

export async function fetchHistory(symbol: string, period: Period): Promise<HistoryData> {
  const res = await fetch(`${BASE}/history/${encodeURIComponent(symbol)}?period=${period}`);
  if (!res.ok) throw new Error('Failed to fetch history');
  return res.json();
}

export async function searchSymbols(q: string): Promise<SearchResult[]> {
  const res = await fetch(`${BASE}/search?q=${encodeURIComponent(q)}`);
  if (!res.ok) return [];
  return res.json();
}
