import { useState, useEffect, useRef } from 'react';
import { Search, X } from 'lucide-react';
import { searchSymbols } from '../api';
import type { SearchResult } from '../types';

interface Props {
  onSelect: (result: SearchResult) => void;
}

export default function SearchBar({ onSelect }: Props) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    if (!query.trim()) { setResults([]); setOpen(false); return; }
    setLoading(true);
    timerRef.current = setTimeout(async () => {
      const r = await searchSymbols(query);
      setResults(r);
      setOpen(r.length > 0);
      setLoading(false);
    }, 400);
    return () => { if (timerRef.current) clearTimeout(timerRef.current); };
  }, [query]);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  return (
    <div ref={containerRef} className="relative w-full max-w-sm">
      <div className="flex items-center bg-[#1a1d2e] border border-[#2a2d3e] rounded-xl px-3 py-2 gap-2">
        <Search size={16} className="text-slate-400 shrink-0" />
        <input
          type="text"
          value={query}
          onChange={e => setQuery(e.target.value)}
          placeholder="Search stocks or indexes…"
          className="flex-1 bg-transparent text-sm text-white outline-none placeholder:text-slate-500"
        />
        {query && (
          <button onClick={() => { setQuery(''); setResults([]); setOpen(false); }}>
            <X size={14} className="text-slate-400 hover:text-white" />
          </button>
        )}
      </div>

      {open && (
        <div className="absolute top-full mt-1 left-0 right-0 z-50 bg-[#1f2235] border border-[#374151] rounded-xl overflow-hidden shadow-xl">
          {loading ? (
            <p className="px-4 py-3 text-sm text-slate-400">Searching…</p>
          ) : (
            results.map(r => (
              <button
                key={r.symbol}
                className="w-full flex items-center justify-between px-4 py-2.5 hover:bg-[#2a2d3e] transition-colors text-left"
                onClick={() => { onSelect(r); setQuery(''); setOpen(false); }}
              >
                <div>
                  <p className="text-sm font-semibold text-white">{r.symbol}</p>
                  <p className="text-xs text-slate-400">{r.name}</p>
                </div>
                <span className="text-xs text-slate-500 uppercase">{r.type}</span>
              </button>
            ))
          )}
        </div>
      )}
    </div>
  );
}
