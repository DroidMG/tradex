import React, { useEffect, useState } from 'react';
import { Gauge } from 'lucide-react';
import { tradingStore } from '../store/tradingStore';

export const MarketPressurePanel: React.FC = () => {
  const [, setTick] = useState(0);

  useEffect(() => {
    return tradingStore.subscribe(() => setTick((t) => t + 1));
  }, []);

  const pressure = tradingStore.marketPressure;
  const buyPower = pressure?.buyPower ?? 50;
  const sellPower = pressure?.sellPower ?? 50;

  return (
    <div className="bg-[#0c0e14] border border-slate-800/80 rounded-2xl p-4 font-sans text-xs select-none">
      <div className="flex items-center justify-between border-b border-slate-800/80 pb-3 mb-3">
        <div className="flex items-center gap-2 text-slate-100 font-extrabold tracking-tight">
          <Gauge className="w-4 h-4 text-indigo-400" />
          <span>INSTITUTIONAL MARKET PRESSURE</span>
        </div>
        <span className="text-[10px] font-bold font-mono px-3 py-0.5 rounded-full bg-indigo-500/10 text-indigo-300 border border-indigo-500/20">
          QUANT MODEL
        </span>
      </div>

      {/* Main Bar Gauge */}
      <div className="space-y-2 mb-4 font-mono">
        <div className="flex justify-between font-bold text-sm">
          <div className="flex items-center gap-2 text-emerald-400">
            <span className="text-xs font-sans">BUY PRESSURE</span>
            <span className="text-xl font-extrabold">{buyPower}%</span>
          </div>
          <div className="flex items-center gap-2 text-rose-400">
            <span className="text-xl font-extrabold">{sellPower}%</span>
            <span className="text-xs font-sans">SELL PRESSURE</span>
          </div>
        </div>

        <div className="w-full h-3 rounded-full bg-slate-800/80 overflow-hidden flex p-0.5 border border-slate-700/60">
          <div
            className="h-full bg-gradient-to-r from-emerald-600 to-emerald-400 rounded-l-full transition-all duration-500"
            style={{ width: `${buyPower}%` }}
          />
          <div
            className="h-full bg-gradient-to-r from-rose-400 to-rose-600 rounded-r-full transition-all duration-500"
            style={{ width: `${sellPower}%` }}
          />
        </div>
      </div>

      {/* Component Breakdown List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-[11px] font-mono">
        {/* Buyer Components */}
        <div className="bg-[#121622] p-3 rounded-xl border border-slate-800/80 space-y-1.5">
          <div className="font-bold font-sans text-emerald-400 border-b border-slate-800/80 pb-1 mb-1 text-[11px]">
            BUYER BREAKDOWN ({buyPower})
          </div>
          {pressure?.buyBreakdown.map((item, idx) => (
            <div key={idx} className="flex justify-between items-center text-slate-300">
              <span className="text-slate-400 font-sans">{item.component}</span>
              <span className="text-emerald-400 font-bold">+{item.score}</span>
            </div>
          ))}
        </div>

        {/* Seller Components */}
        <div className="bg-[#121622] p-3 rounded-xl border border-slate-800/80 space-y-1.5">
          <div className="font-bold font-sans text-rose-400 border-b border-slate-800/80 pb-1 mb-1 text-[11px]">
            SELLER BREAKDOWN ({sellPower})
          </div>
          {pressure?.sellBreakdown.map((item, idx) => (
            <div key={idx} className="flex justify-between items-center text-slate-300">
              <span className="text-slate-400 font-sans">{item.component}</span>
              <span className="text-rose-400 font-bold">+{item.score}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
