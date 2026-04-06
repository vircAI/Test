import { useState, useEffect, useCallback } from 'react';
import { RefreshCw, AlertCircle, BarChart2 } from 'lucide-react';
import { fetchMarket } from './api';
import type { Quote, MarketData, SearchResult } from './types';
import IndexCard from './components/IndexCard';
import StockRow from './components/StockRow';
import PriceChart from './components/PriceChart';
import SearchBar from './components/SearchBar';
import StatBox from './components/StatBox';

function formatTime(iso: string) {
  return new Date(iso).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
}

function fmtCap(n?: number) {
  if (!n) return '—';
  if (n >= 1e12) return `$${(n / 1e12).toFixed(2)}T`;
  if (n >= 1e9) return `$${(n / 1e9).toFixed(2)}B`;
  return `$${n}`;
}

function fmtVol(n?: number) {
  if (!n) return '—';
  if (n >= 1e9) return `${(n / 1e9).toFixed(2)}B`;
  if (n >= 1e6) return `${(n / 1e6).toFixed(2)}M`;
  return `${n}`;
}

export default function App() {
  const [market, setMarket] = useState<MarketData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selected, setSelected] = useState<Quote | null>(null);
  const [watchlist, setWatchlist] = useState<Quote[]>([]);

  const load = useCallback(async (silent = false) => {
    if (!silent) setLoading(true);
    else setRefreshing(true);
    setError(null);
    try {
      const data = await fetchMarket();
      setMarket(data);
      if (!selected && data.indexes.length > 0) {
        setSelected(data.indexes[0]);
      }
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [selected]);

  useEffect(() => {
    load();
    const interval = setInterval(() => load(true), 60000);
    return () => clearInterval(interval);
  }, []);

  function handleSelect(q: Quote) {
    setSelected(q);
  }

  function handleSearchSelect(r: SearchResult) {
    const existing = [...(market?.indexes || []), ...(market?.stocks || [])].find(q => q.symbol === r.symbol);
    if (existing) {
      setSelected(existing);
    } else {
      const pseudo: Quote = {
        symbol: r.symbol,
        name: r.name,
        type: 'stock',
        price: 0,
        change: 0,
        changePercent: 0,
        open: 0,
        high: 0,
        low: 0,
        volume: 0,
        previousClose: 0,
      };
      setSelected(pseudo);
      if (!watchlist.find(w => w.symbol === r.symbol)) {
        setWatchlist(prev => [...prev, pseudo]);
      }
    }
  }

  const allQuotes = [...(market?.stocks || []), ...watchlist.filter(w => !market?.stocks.find(s => s.symbol === w.symbol))];
  const gainers = [...allQuotes].sort((a, b) => b.changePercent - a.changePercent).slice(0, 3);
  const losers = [...allQuotes].sort((a, b) => a.changePercent - b.changePercent).slice(0, 3);

  return (
    <div className="min-h-screen bg-[#0f1117] text-white">
      {/* Header */}
      <header className="border-b border-[#1f2235] bg-[#0f1117]/90 backdrop-blur sticky top-0 z-40">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 py-3 flex items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <BarChart2 size={22} className="text-blue-400" />
            <span className="text-lg font-bold tracking-tight">Market Dashboard</span>
          </div>
          <div className="flex items-center gap-3 flex-1 justify-end">
            <SearchBar onSelect={handleSearchSelect} />
            <button
              onClick={() => load(true)}
              disabled={refreshing}
              className="p-2 rounded-lg bg-[#1a1d2e] border border-[#2a2d3e] hover:border-blue-500 transition-colors disabled:opacity-50"
            >
              <RefreshCw size={15} className={refreshing ? 'animate-spin text-blue-400' : 'text-slate-400'} />
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-[1400px] mx-auto px-4 sm:px-6 py-6 space-y-6">
        {error && (
          <div className="flex items-center gap-2 bg-red-900/30 border border-red-700 text-red-300 rounded-xl px-4 py-3 text-sm">
            <AlertCircle size={16} />
            {error} — Make sure the backend server is running on port 3001.
          </div>
        )}

        {loading ? (
          <div className="flex items-center justify-center h-64 text-slate-400 gap-3">
            <RefreshCw size={20} className="animate-spin" />
            Loading market data…
          </div>
        ) : (
          <>
            {/* Indexes */}
            <section>
              <h2 className="text-sm font-semibold text-slate-400 uppercase tracking-widest mb-3">Major Indexes</h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
                {market?.indexes.map(q => (
                  <IndexCard
                    key={q.symbol}
                    quote={q}
                    selected={selected?.symbol === q.symbol}
                    onClick={() => handleSelect(q)}
                  />
                ))}
              </div>
            </section>

            {/* Chart + detail */}
            {selected && (
              <section className="grid grid-cols-1 xl:grid-cols-3 gap-4">
                <div className="xl:col-span-2">
                  <PriceChart symbol={selected.symbol} name={selected.name} isPositive={selected.changePercent >= 0} />
                </div>
                <div className="space-y-3">
                  <div className="bg-[#1a1d2e] rounded-xl border border-[#2a2d3e] p-5">
                    <h3 className="text-base font-bold text-white mb-4">{selected.name} Stats</h3>
                    <div className="grid grid-cols-2 gap-3">
                      <StatBox label="Open" value={`$${selected.open?.toFixed(2) ?? '—'}`} />
                      <StatBox label="Prev Close" value={`$${selected.previousClose?.toFixed(2) ?? '—'}`} />
                      <StatBox label="Day High" value={`$${selected.high?.toFixed(2) ?? '—'}`} />
                      <StatBox label="Day Low" value={`$${selected.low?.toFixed(2) ?? '—'}`} />
                      <StatBox label="Volume" value={fmtVol(selected.volume)} />
                      {selected.marketCap && <StatBox label="Market Cap" value={fmtCap(selected.marketCap)} />}
                    </div>
                  </div>

                  <div className="bg-[#1a1d2e] rounded-xl border border-[#2a2d3e] p-4">
                    <h3 className="text-sm font-semibold text-green-400 mb-2">Top Gainers</h3>
                    {gainers.map(q => (
                      <button key={q.symbol} onClick={() => handleSelect(q)} className="w-full flex justify-between items-center py-1.5 hover:opacity-80 transition-opacity">
                        <span className="text-sm text-white">{q.symbol}</span>
                        <span className="text-sm font-semibold text-green-400">+{q.changePercent.toFixed(2)}%</span>
                      </button>
                    ))}
                  </div>

                  <div className="bg-[#1a1d2e] rounded-xl border border-[#2a2d3e] p-4">
                    <h3 className="text-sm font-semibold text-red-400 mb-2">Top Losers</h3>
                    {losers.map(q => (
                      <button key={q.symbol} onClick={() => handleSelect(q)} className="w-full flex justify-between items-center py-1.5 hover:opacity-80 transition-opacity">
                        <span className="text-sm text-white">{q.symbol}</span>
                        <span className="text-sm font-semibold text-red-400">{q.changePercent.toFixed(2)}%</span>
                      </button>
                    ))}
                  </div>
                </div>
              </section>
            )}

            {/* Stocks table */}
            <section>
              <h2 className="text-sm font-semibold text-slate-400 uppercase tracking-widest mb-3">Stocks</h2>
              <div className="bg-[#1a1d2e] rounded-xl border border-[#2a2d3e] overflow-hidden">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-[#2a2d3e] text-xs text-slate-400 uppercase tracking-wide">
                      <th className="px-4 py-3 text-left">Symbol</th>
                      <th className="px-4 py-3 text-right">Price</th>
                      <th className="px-4 py-3 text-right">Change</th>
                      <th className="px-4 py-3 text-right">%</th>
                      <th className="px-4 py-3 text-right">Volume</th>
                      <th className="px-4 py-3 text-right">Mkt Cap</th>
                    </tr>
                  </thead>
                  <tbody>
                    {allQuotes.map(q => (
                      <StockRow
                        key={q.symbol}
                        quote={q}
                        selected={selected?.symbol === q.symbol}
                        onClick={() => handleSelect(q)}
                      />
                    ))}
                  </tbody>
                </table>
              </div>
            </section>

            {market && (
              <p className="text-center text-xs text-slate-500">
                Last updated: {formatTime(market.updatedAt)} · Auto-refreshes every 60s
              </p>
            )}
          </>
        )}
      </main>
    </div>
  );
}
