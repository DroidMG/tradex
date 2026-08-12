import React, { useEffect, useState } from 'react';
import { tradingStore } from '../store/tradingStore';
import { formatPercent, formatPrice } from '../utils/formatters';

export const TickerBar: React.FC = () => {
  const [, setTick] = useState(0);

  useEffect(() => {
    return tradingStore.subscribe(() => setTick((t) => t + 1));
  }, []);

  const assets = tradingStore.assets;

  return (
    <div className="w-full bg-[#0a0c12] border-b border-slate-800/80 py-2 px-3 overflow-x-auto whitespace-nowrap text-xs select-none scrollbar-none">
      <div className="flex items-center gap-2">
        {assets.map((asset) => {
          const tickData = tradingStore.ticks.get(asset.symbol);
          const flash = tradingStore.priceFlashes.get(asset.symbol);
          const isSelected = tradingStore.selectedSymbol === asset.symbol;

          const price = tickData ? tickData.last : 0;
          const changePct = tickData ? tickData.changePercent24h : 0;
          const isPos = changePct >= 0;

          return (
            <button
              key={asset.symbol}
              onClick={() => tradingStore.selectSymbol(asset.symbol)}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-full transition-all duration-200 border ${
                isSelected
                  ? 'bg-indigo-600 text-white border-indigo-400 shadow-md shadow-indigo-500/20 font-semibold'
                  : 'bg-[#121622] border-slate-800 hover:bg-slate-800/80 hover:border-slate-700 text-slate-300'
              }`}
            >
              <span className="font-bold tracking-tight text-[11px]">{asset.symbol}</span>
              <span
                className={`font-mono text-[11px] transition-colors duration-200 ${
                  flash === 'up'
                    ? 'bg-emerald-500/20 text-emerald-300 px-1 rounded'
                    : flash === 'down'
                    ? 'bg-rose-500/20 text-rose-300 px-1 rounded'
                    : isSelected ? 'text-white' : 'text-slate-200'
                }`}
              >
                {formatPrice(price, asset.decimals)}
              </span>
              <span
                className={`text-[10px] font-mono font-bold ${
                  isSelected
                    ? isPos ? 'text-emerald-300' : 'text-rose-300'
                    : isPos ? 'text-emerald-400' : 'text-rose-400'
                }`}
              >
                {formatPercent(changePct)}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
