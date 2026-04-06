interface Props {
  label: string;
  value: string;
  sub?: string;
}

export default function StatBox({ label, value, sub }: Props) {
  return (
    <div className="bg-[#1a1d2e] border border-[#2a2d3e] rounded-xl p-4">
      <p className="text-xs text-slate-400 uppercase tracking-wide mb-1">{label}</p>
      <p className="text-lg font-bold text-white">{value}</p>
      {sub && <p className="text-xs text-slate-500 mt-0.5">{sub}</p>}
    </div>
  );
}
