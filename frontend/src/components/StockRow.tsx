import type { Quote } from '../types';
import { TrendingUp, TrendingDown } from 'lucide-react';

interface Props {
  quote: Quote;
  selected: boolean;
  onClick: () => void;
}

function fmt(n: number, decimals = 2) {
  if (n === undefined || n === null) return '—';
  return n.toLocaleString('en-US', { minimumFractionDigits: decimals, maximumFractionDigits: decimals });
}

function fmtCap(n?: number) {
  if (!n) return '—';
  if (n >= 1e12) return `$${(n / 1e12).toFixed(2)}T`;
  if (n >= 1e9) return `$${(n / 1e9).toFixed(2)}B`;
  if (n >= 1e6) return `$${(n / 1e6).toFixed(2)}M`;
  return `$${n}`;
}

function fmtVol(n?: number) {
  if (!n) return '—';
  if (n >= 1e9) return `${(n / 1e9).toFixed(2)}B`;
  if (n >= 1e6) return `${(n / 1e6).toFixed(2)}M`;
  if (n >= 1e3) return `${(n / 1e3).toFixed(2)}K`;
  return `${n}`;
}

export default function StockRow({ quote, selected, onClick }: Props) {
  const up = quote.changePercent >= 0;

  return (
    <tr
      onClick={onClick}
      className={`border-b border-[#2a2d3e] cursor-pointer transition-colors ${
        selected ? 'bg-blue-900/20' : 'hover:bg-[#1f2235]'
      }`}
    >
      <td className="px-4 py-3">
        <div>
          <p className="text-sm font-semibold text-white">{quote.symbol}</p>
          <p className="text-xs text-slate-400">{quote.name}</p>
        </div>
      </td>
      <td className="px-4 py-3 text-right font-mono text-white">${fmt(quote.price)}</td>
      <td className={`px-4 py-3 text-right font-mono ${up ? 'text-green-400' : 'text-red-400'}`}>
        <span className="flex items-center justify-end gap-1">
          {up ? <TrendingUp size={13} /> : <TrendingDown size={13} />}
          {up ? '+' : ''}{fmt(quote.change)}
        </span>
      </td>
      <td className={`px-4 py-3 text-right font-semibold ${up ? 'text-green-400' : 'text-red-400'}`}>
        {up ? '+' : ''}{fmt(quote.changePercent)}%
      </td>
      <td className="px-4 py-3 text-right text-slate-400 font-mono text-sm">{fmtVol(quote.volume)}</td>
      <td className="px-4 py-3 text-right text-slate-400 font-mono text-sm">{fmtCap(quote.marketCap)}</td>
    </tr>
  );
}
