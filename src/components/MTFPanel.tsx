import React, { useEffect, useState } from 'react';
import { Layers } from 'lucide-react';
import { tradingStore } from '../store/tradingStore';

export const MTFPanel: React.FC = () => {
  const [, setTick] = useState(0);

  useEffect(() => {
    return tradingStore.subscribe(() => setTick((t) => t + 1));
  }, []);

  const mtf = tradingStore.mtfResult;
  if (!mtf) return null;

  return (
    <div className="bg-[#0c0e14] border border-slate-800/80 rounded-2xl p-4 font-sans text-xs select-none space-y-3">
      <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
        <div className="flex items-center gap-2 font-extrabold text-slate-100 tracking-tight">
          <Layers className="w-4 h-4 text-indigo-400" />
          <span>MULTI-TIMEFRAME CONFLUENCE MATRIX</span>
        </div>
        <div className="flex items-center gap-2 font-mono font-bold text-emerald-400 bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20 text-[11px]">
          <span>MTF BIAS {mtf.overallScore}% {mtf.overallBias.toUpperCase()}</span>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse font-mono text-[11px]">
          <thead>
            <tr className="text-slate-400 text-[10px] uppercase font-bold font-sans border-b border-slate-800/80">
              <th className="py-2 px-2">TF</th>
              <th className="py-2 px-2">Trend</th>
              <th className="py-2 px-2">Structure</th>
              <th className="py-2 px-2">Momentum</th>
              <th className="py-2 px-2">SMC Bias</th>
              <th className="py-2 px-2 text-right">Alignment</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/40">
            {mtf.rows.map((row) => (
              <tr key={row.timeframe} className="hover:bg-[#121622] transition-colors">
                <td className="py-2 px-2 font-bold text-white uppercase">{row.timeframe}</td>
                <td className="py-2 px-2 font-semibold">
                  <span className={row.trend === 'Up' ? 'text-emerald-400' : row.trend === 'Down' ? 'text-rose-400' : 'text-slate-400'}>
                    {row.trend === 'Up' ? '↑ Up' : row.trend === 'Down' ? '↓ Down' : '→ Sideways'}
                  </span>
                </td>
                <td className="py-2 px-2 text-slate-300">{row.structure}</td>
                <td className="py-2 px-2 text-slate-300">{row.momentum}</td>
                <td className="py-2 px-2">
                  <span className={row.smcBias === 'Bullish' ? 'text-emerald-400 font-bold' : row.smcBias === 'Bearish' ? 'text-rose-400 font-bold' : 'text-slate-400'}>
                    {row.smcBias}
                  </span>
                </td>
                <td className="py-2 px-2 text-right font-bold text-indigo-400">{row.alignment}%</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
