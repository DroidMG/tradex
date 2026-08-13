import React, { useEffect, useState } from 'react';
import { Gauge, Zap, TrendingUp, TrendingDown, Activity, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { tradingStore } from '../store/tradingStore';

export const MarketPressurePanel: React.FC = () => {
  const [, setTick] = useState(0);

  useEffect(() => {
    return tradingStore.subscribe(() => setTick((t) => t + 1));
  }, []);

  const pressure = tradingStore.marketPressure;
  const currentTick = tradingStore.ticks.get(tradingStore.selectedSymbol);
  const symbol = tradingStore.selectedSymbol;
  const buyPower = pressure?.buyPower ?? 52;
  const sellPower = pressure?.sellPower ?? 48;
  const dominant = pressure?.dominantSide ?? 'BUYERS';

  // Live order fills preview based on active tick
  const lastPrice = currentTick?.last ?? 95420.5;
  const isUp = (currentTick?.changePercent24h ?? 0) >= 0;

  return (
    <div className="bg-[#0c0e14] border border-slate-800/80 rounded-2xl p-4 font-sans text-xs select-none shadow-lg">
      <div className="flex flex-wrap items-center justify-between border-b border-slate-800/80 pb-3 mb-3 gap-2">
        <div className="flex items-center gap-2 text-slate-100 font-extrabold tracking-tight">
          <Gauge className="w-4 h-4 text-indigo-400" />
          <span>INSTITUTIONAL BUYER / SELLER POWER ({symbol})</span>
        </div>

        <div className="flex items-center gap-2">
          <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold flex items-center gap-1 border ${
            dominant === 'BUYERS'
              ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
              : dominant === 'SELLERS'
              ? 'bg-rose-500/20 text-rose-300 border-rose-500/40'
              : 'bg-amber-500/20 text-amber-300 border-amber-500/40'
          }`}>
            <Zap className="w-3 h-3" />
            {dominant} CONTROL
          </span>

          <div className="flex items-center gap-1.5 bg-indigo-500/10 text-indigo-300 border border-indigo-500/20 px-2.5 py-0.5 rounded-full">
            <span className="flex h-2 w-2 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span className="text-[10px] font-bold font-mono uppercase">LIVE 1s ENGINE</span>
          </div>
        </div>
      </div>

      {/* Main Bar Gauge */}
      <div className="space-y-2 mb-4 font-mono">
        <div className="flex justify-between font-bold text-sm">
          <div className="flex items-center gap-2 text-emerald-400">
            <TrendingUp className="w-4 h-4" />
            <span className="text-xs font-sans">BUY POWER</span>
            <span className="text-2xl font-black tracking-tight">{buyPower}%</span>
          </div>

          <div className="text-center hidden sm:block">
            <span className="text-[10px] text-slate-400 font-sans block">LAST PRICE</span>
            <span className={`text-xs font-mono font-bold ${isUp ? 'text-emerald-400' : 'text-rose-400'}`}>
              ${lastPrice.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 4 })}
            </span>
          </div>

          <div className="flex items-center gap-2 text-rose-400">
            <span className="text-2xl font-black tracking-tight">{sellPower}%</span>
            <span className="text-xs font-sans">SELL POWER</span>
            <TrendingDown className="w-4 h-4" />
          </div>
        </div>

        {/* Dynamic Dual Gauge Bar */}
        <div className="w-full h-3.5 rounded-full bg-slate-900 overflow-hidden flex p-0.5 border border-slate-700/80 shadow-inner">
          <div
            className="h-full bg-gradient-to-r from-emerald-600 via-emerald-500 to-emerald-400 rounded-l-full transition-all duration-300 shadow-[0_0_12px_rgba(16,185,129,0.4)]"
            style={{ width: `${buyPower}%` }}
          />
          <div
            className="h-full bg-gradient-to-r from-rose-400 via-rose-500 to-rose-600 rounded-r-full transition-all duration-300 shadow-[0_0_12px_rgba(244,63,94,0.4)]"
            style={{ width: `${sellPower}%` }}
          />
        </div>
      </div>

      {/* Component Breakdown & Live Order Taker Feed */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-[11px] font-mono">
        {/* Buyer Components */}
        <div className="bg-[#121622] p-3 rounded-xl border border-slate-800/80 space-y-1.5">
          <div className="flex justify-between items-center font-bold font-sans text-emerald-400 border-b border-slate-800/80 pb-1.5 mb-1 text-[11px]">
            <span className="flex items-center gap-1">
              <ArrowUpRight className="w-3.5 h-3.5" /> BUYER SCORE ({buyPower})
            </span>
            <span className="text-[10px] text-emerald-500/80 font-mono">AGGRESSIVE BIDS</span>
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
          <div className="flex justify-between items-center font-bold font-sans text-rose-400 border-b border-slate-800/80 pb-1.5 mb-1 text-[11px]">
            <span className="flex items-center gap-1">
              <ArrowDownRight className="w-3.5 h-3.5" /> SELLER SCORE ({sellPower})
            </span>
            <span className="text-[10px] text-rose-500/80 font-mono">AGGRESSIVE ASKS</span>
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

