import React, { useEffect, useState } from 'react';
import { Compass, Sparkles, TrendingUp, TrendingDown } from 'lucide-react';
import { tradingStore } from '../store/tradingStore';
import { formatPrice } from '../utils/formatters';

export const PatternPanel: React.FC = () => {
  const [, setTick] = useState(0);

  useEffect(() => {
    return tradingStore.subscribe(() => setTick((t) => t + 1));
  }, []);

  const candlePatterns = tradingStore.candlestickPatterns;
  const chartPatterns = tradingStore.chartPatterns;

  if (candlePatterns.length === 0 && chartPatterns.length === 0) return null;

  return (
    <div className="bg-[#0c0e14] border border-slate-800/80 rounded-2xl p-4 font-sans text-xs select-none space-y-3.5">
      <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
        <div className="flex items-center gap-2 font-bold text-slate-100">
          <Sparkles className="w-4 h-4 text-amber-400" />
          <span className="font-extrabold tracking-tight text-white uppercase">Pattern Recognition Engine</span>
        </div>
        <div className="flex items-center gap-2 font-mono text-[10px]">
          <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 font-bold">
            Candlestick: {candlePatterns.length}
          </span>
          <span className="px-2.5 py-0.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 font-bold">
            Chart Patterns: {chartPatterns.length}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {/* Candlestick Patterns */}
        <div className="bg-[#121622] p-3 rounded-xl border border-slate-800/80 space-y-2 font-mono">
          <div className="flex justify-between items-center font-bold text-slate-200 border-b border-slate-800/80 pb-1.5 font-sans">
            <span>CANDLESTICK PATTERNS ({candlePatterns.length})</span>
            <Compass className="w-3.5 h-3.5 text-amber-400" />
          </div>

          <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
            {candlePatterns.length === 0 ? (
              <p className="text-slate-500 text-[11px] font-sans italic py-2">Scanning live price action for candle formations...</p>
            ) : (
              candlePatterns.map((cp) => (
                <div key={cp.id} className="p-2.5 rounded-xl bg-[#0c0e14] border border-slate-800/80 text-slate-300 space-y-1">
                  <div className="flex justify-between font-bold items-center">
                    <span className="flex items-center gap-1">
                      {cp.type === 'Bullish' ? (
                        <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />
                      ) : cp.type === 'Bearish' ? (
                        <TrendingDown className="w-3.5 h-3.5 text-rose-400" />
                      ) : (
                        <span className="w-2 h-2 rounded-full bg-amber-400" />
                      )}
                      <span className={cp.type === 'Bullish' ? 'text-emerald-400 font-sans' : cp.type === 'Bearish' ? 'text-rose-400 font-sans' : 'text-amber-400 font-sans'}>
                        {cp.name}
                      </span>
                    </span>
                    <span className="text-[10px] text-amber-300 px-2 py-0.5 rounded bg-amber-500/10 font-sans">
                      {cp.significance} Impact
                    </span>
                  </div>
                  <p className="text-[10px] text-slate-400 font-sans leading-relaxed">{cp.description}</p>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Chart Patterns */}
        <div className="bg-[#121622] p-3 rounded-xl border border-slate-800/80 space-y-2 font-mono">
          <div className="flex justify-between items-center font-bold text-slate-200 border-b border-slate-800/80 pb-1.5 font-sans">
            <span>CHART & STRUCTURE PATTERNS ({chartPatterns.length})</span>
            <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
          </div>

          <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
            {chartPatterns.length === 0 ? (
              <p className="text-slate-500 text-[11px] font-sans italic py-2">No active structural chart patterns detected on current timeframe.</p>
            ) : (
              chartPatterns.map((cp) => (
                <div key={cp.id} className="p-2.5 rounded-xl bg-[#0c0e14] border border-slate-800/80 text-slate-300 space-y-1">
                  <div className="flex justify-between font-bold items-center font-sans">
                    <span className={cp.type === 'Bullish' ? 'text-emerald-400' : 'text-rose-400'}>
                      {cp.name}
                    </span>
                    <span className="text-[10px] text-indigo-300 font-mono">Confidence: {cp.confidence}%</span>
                  </div>
                  <p className="text-[10px] text-slate-400 font-sans leading-relaxed">{cp.description}</p>
                  <div className="flex justify-between text-[10px] text-slate-300 font-mono pt-1 border-t border-slate-800/60">
                    {cp.targetPrice && <span>Target: <strong className="text-emerald-400">{formatPrice(cp.targetPrice)}</strong></span>}
                    {cp.stopLossPrice && <span>Stop Loss: <strong className="text-rose-400">{formatPrice(cp.stopLossPrice)}</strong></span>}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
