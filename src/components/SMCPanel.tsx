import React, { useEffect, useState } from 'react';
import { Box, Layers, Zap } from 'lucide-react';
import { tradingStore } from '../store/tradingStore';
import { formatPrice } from '../utils/formatters';

export const SMCPanel: React.FC = () => {
  const [, setTick] = useState(0);

  useEffect(() => {
    return tradingStore.subscribe(() => setTick((t) => t + 1));
  }, []);

  const smc = tradingStore.smcAnalysis;
  if (!smc) return null;

  return (
    <div className="bg-[#0c0e14] border border-slate-800/80 rounded-2xl p-4 font-sans text-xs select-none space-y-3.5">
      <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
        <div className="flex items-center gap-2 font-bold text-slate-100">
          <Zap className="w-4 h-4 text-amber-400" />
          <span className="font-extrabold tracking-tight text-white">SMART MONEY CONCEPTS (SMC)</span>
        </div>
        <span className="text-[10px] font-bold font-mono px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-300">
          BIAS: {smc.overallBias.toUpperCase()} ({smc.biasConfidence}%)
        </span>
      </div>

      {/* Dealing Range Premium / Discount Channel */}
      <div className="bg-[#121622] p-3 rounded-xl border border-slate-800/80 space-y-2 font-mono">
        <div className="flex justify-between text-[10px] text-slate-400 font-sans font-semibold">
          <span>PREMIUM ({formatPrice(smc.dealingRange.high)})</span>
          <span className="text-indigo-400">50% EQUILIBRIUM ({formatPrice(smc.dealingRange.equilibrium)})</span>
          <span>DISCOUNT ({formatPrice(smc.dealingRange.low)})</span>
        </div>
        <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden flex border border-slate-700/60 p-0.5">
          <div className="h-full bg-rose-500/50 w-1/2 rounded-l-full border-r border-indigo-400" />
          <div className="h-full bg-emerald-500/50 w-1/2 rounded-r-full" />
        </div>
        <div className="text-center text-[10px] text-slate-300 font-sans font-medium pt-0.5">
          CURRENT POSITION: <span className="text-amber-400 font-bold font-mono">{smc.dealingRange.currentZone}</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-[11px]">
        {/* Order Blocks */}
        <div className="bg-[#121622] p-3 rounded-xl border border-slate-800/80 space-y-2 font-mono">
          <div className="flex justify-between items-center font-bold text-slate-200 border-b border-slate-800/80 pb-1.5 font-sans">
            <span>ORDER BLOCKS ({smc.orderBlocks.length})</span>
            <Box className="w-3.5 h-3.5 text-amber-400" />
          </div>

          <div className="space-y-2 max-h-36 overflow-y-auto pr-1">
            {smc.orderBlocks.map((ob) => (
              <div key={ob.id} className="p-2.5 rounded-xl bg-[#0c0e14] border border-slate-800/80 text-slate-300 space-y-1">
                <div className="flex justify-between font-bold">
                  <span className={ob.bias === 'Bullish' ? 'text-emerald-400' : 'text-rose-400'}>
                    {ob.bias.toUpperCase()} OB ({ob.timeframe})
                  </span>
                  <span className="text-amber-300">Strength: {ob.strength}/100</span>
                </div>
                <div className="flex justify-between text-[10px] text-slate-400">
                  <span>Zone: {formatPrice(ob.bottom)} - {formatPrice(ob.top)}</span>
                  <span>{ob.freshness} ({ob.touches} touches)</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Fair Value Gaps */}
        <div className="bg-[#121622] p-3 rounded-xl border border-slate-800/80 space-y-2 font-mono">
          <div className="flex justify-between items-center font-bold text-slate-200 border-b border-slate-800/80 pb-1.5 font-sans">
            <span>FAIR VALUE GAPS ({smc.fairValueGaps.length})</span>
            <Layers className="w-3.5 h-3.5 text-cyan-400" />
          </div>

          <div className="space-y-2 max-h-36 overflow-y-auto pr-1">
            {smc.fairValueGaps.map((fvg) => (
              <div key={fvg.id} className="p-2.5 rounded-xl bg-[#0c0e14] border border-slate-800/80 text-slate-300 space-y-1">
                <div className="flex justify-between font-bold">
                  <span className={fvg.bias === 'Bullish' ? 'text-emerald-400' : 'text-rose-400'}>
                    {fvg.bias.toUpperCase()} FVG
                  </span>
                  <span className="text-cyan-300">Fill: {fvg.fillPercentage}%</span>
                </div>
                <div className="flex justify-between text-[10px] text-slate-400">
                  <span>Gap: {formatPrice(fvg.bottom)} - {formatPrice(fvg.top)}</span>
                  <span>{fvg.status}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
