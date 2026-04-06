import type { Quote } from '../types';
import { TrendingUp, TrendingDown } from 'lucide-react';

interface Props {
  quote: Quote;
  selected: boolean;
  onClick: () => void;
}

function fmt(n: number) {
  if (n === undefined || n === null) return '—';
  return n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

export default function IndexCard({ quote, selected, onClick }: Props) {
  const up = quote.changePercent >= 0;

  return (
    <button
      onClick={onClick}
      className={`w-full text-left rounded-xl p-4 border transition-all cursor-pointer ${
        selected
          ? 'bg-blue-900/40 border-blue-500'
          : 'bg-[#1a1d2e] border-[#2a2d3e] hover:border-[#374151]'
      }`}
    >
      <div className="flex justify-between items-start mb-2">
        <div>
          <p className="text-xs text-slate-400 font-mono">{quote.symbol}</p>
          <p className="text-sm font-semibold text-white">{quote.name}</p>
        </div>
        <span className={`flex items-center gap-1 text-xs font-semibold px-2 py-1 rounded-md ${up ? 'bg-green-900/40 text-green-400' : 'bg-red-900/40 text-red-400'}`}>
          {up ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
          {up ? '+' : ''}{quote.changePercent.toFixed(2)}%
        </span>
      </div>
      <p className="text-xl font-bold text-white">{fmt(quote.price)}</p>
      <p className={`text-sm mt-1 ${up ? 'text-green-400' : 'text-red-400'}`}>
        {up ? '+' : ''}{fmt(quote.change)}
      </p>
    </button>
  );
}
