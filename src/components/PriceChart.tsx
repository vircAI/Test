import { useEffect, useState } from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
} from 'recharts';
import { fetchHistory } from '../api';
import type { HistoryPoint, Period } from '../types';

const PERIODS: Period[] = ['1D', '1W', '1M', '3M', '1Y', '5Y'];

interface Props {
  symbol: string;
  name: string;
  isPositive: boolean;
}

function formatDate(dateStr: string, period: Period) {
  const d = new Date(dateStr);
  if (period === '1D') return d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
  if (period === '1W' || period === '1M' || period === '3M')
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  return d.toLocaleDateString('en-US', { month: 'short', year: '2-digit' });
}

function formatPrice(n: number) {
  return n?.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function formatVolume(n: number) {
  if (!n) return '0';
  if (n >= 1e9) return `${(n / 1e9).toFixed(1)}B`;
  if (n >= 1e6) return `${(n / 1e6).toFixed(1)}M`;
  if (n >= 1e3) return `${(n / 1e3).toFixed(1)}K`;
  return `${n}`;
}

export default function PriceChart({ symbol, name, isPositive }: Props) {
  const [period, setPeriod] = useState<Period>('1M');
  const [data, setData] = useState<HistoryPoint[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    fetchHistory(symbol, period)
      .then(res => setData(res.data))
      .catch(() => setData([]))
      .finally(() => setLoading(false));
  }, [symbol, period]);

  const color = isPositive ? '#22c55e' : '#ef4444';
  const gradientId = `gradient-${symbol.replace(/[^a-zA-Z0-9]/g, '')}`;

  const minClose = data.length ? Math.min(...data.map(d => d.close)) : 0;
  const maxClose = data.length ? Math.max(...data.map(d => d.close)) : 0;
  const domainPad = (maxClose - minClose) * 0.05;

  const chartData = data.map(d => ({
    date: formatDate(d.date, period),
    close: d.close,
    volume: d.volume,
    fullDate: d.date,
  }));

  return (
    <div className="bg-[#1a1d2e] rounded-xl border border-[#2a2d3e] p-5">
      <div className="flex flex-wrap justify-between items-center mb-4 gap-3">
        <div>
          <h2 className="text-lg font-bold text-white">{name}</h2>
          <p className="text-sm text-slate-400 font-mono">{symbol}</p>
        </div>
        <div className="flex gap-1">
          {PERIODS.map(p => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${
                period === p
                  ? 'bg-blue-600 text-white'
                  : 'bg-[#252836] text-slate-400 hover:text-white hover:bg-[#2e3147]'
              }`}
            >
              {p}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-52 text-slate-500">Loading chart…</div>
      ) : data.length === 0 ? (
        <div className="flex items-center justify-center h-52 text-slate-500">No data available</div>
      ) : (
        <>
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={chartData} margin={{ top: 5, right: 5, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={color} stopOpacity={0.2} />
                  <stop offset="95%" stopColor={color} stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#2a2d3e" />
              <XAxis
                dataKey="date"
                tick={{ fill: '#94a3b8', fontSize: 11 }}
                tickLine={false}
                axisLine={false}
                interval="preserveStartEnd"
              />
              <YAxis
                domain={[minClose - domainPad, maxClose + domainPad]}
                tick={{ fill: '#94a3b8', fontSize: 11 }}
                tickLine={false}
                axisLine={false}
                tickFormatter={formatPrice}
                width={70}
              />
              <Tooltip
                contentStyle={{ background: '#1f2235', border: '1px solid #374151', borderRadius: '8px', color: '#e2e8f0' }}
                formatter={(val) => [`$${formatPrice(Number(val))}`, 'Price']}
                labelStyle={{ color: '#94a3b8', fontSize: 12 }}
              />
              <Area
                type="monotone"
                dataKey="close"
                stroke={color}
                strokeWidth={2}
                fill={`url(#${gradientId})`}
                dot={false}
                activeDot={{ r: 4, fill: color }}
              />
            </AreaChart>
          </ResponsiveContainer>

          <div className="mt-3">
            <p className="text-xs text-slate-500 mb-1 uppercase tracking-wide">Volume</p>
            <ResponsiveContainer width="100%" height={60}>
              <BarChart data={chartData} margin={{ top: 0, right: 5, left: 0, bottom: 0 }}>
                <XAxis dataKey="date" hide />
                <YAxis hide />
                <Tooltip
                  contentStyle={{ background: '#1f2235', border: '1px solid #374151', borderRadius: '8px', color: '#e2e8f0' }}
                  formatter={(val) => [formatVolume(Number(val)), 'Volume']}
                  labelStyle={{ color: '#94a3b8', fontSize: 12 }}
                />
                <Bar dataKey="volume" fill="#374151" radius={[2, 2, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </>
      )}
    </div>
  );
}
