import React, { useEffect, useState } from 'react';
import { ArrowUpRight, ArrowDownRight, Layers, ShieldAlert, Sparkles, TrendingUp } from 'lucide-react';
import { tradingStore } from '../store/tradingStore';
import { formatPercent, formatPrice, formatVolume } from '../utils/formatters';

export const AssetDetailHeader: React.FC = () => {
  const [, setTick] = useState(0);

  useEffect(() => {
    return tradingStore.subscribe(() => setTick((t) => t + 1));
  }, []);

  const symbol = tradingStore.selectedSymbol;
  const asset = tradingStore.assets.find((a) => a.symbol === symbol);
  const tickData = tradingStore.ticks.get(symbol);
  const smc = tradingStore.smcAnalysis;
  const pressure = tradingStore.marketPressure;

  const decimals = asset?.decimals ?? 2;
  const lastPrice = tickData?.last ?? 0;
  const changePct = tickData?.changePercent24h ?? 0;
  const isPos = changePct >= 0;

  const buyPower = pressure?.buyPower ?? 50;
  const sellPower = pressure?.sellPower ?? 50;

  return (
    <div className="bg-[#0c0e14] border-b border-slate-800/80 px-4 py-3 select-none">
      <div className="flex flex-wrap items-center justify-between gap-4">
        {/* Symbol Name & Live Price */}
        <div className="flex items-center gap-4">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-extrabold text-white tracking-tight font-sans">{symbol}</h1>
              <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-slate-800/80 text-slate-300 border border-slate-700 uppercase tracking-wider">
                {asset?.category || 'Asset'}
              </span>
            </div>
            <p className="text-xs text-slate-400 font-sans truncate max-w-xs">{asset?.description}</p>
          </div>

          <div className="flex items-baseline gap-3 pl-4 border-l border-slate-800">
            <span className="text-2xl font-extrabold font-mono text-white tracking-tight">
              {formatPrice(lastPrice, decimals)}
            </span>
            <span
              className={`flex items-center text-xs font-bold font-mono px-2.5 py-1 rounded-full ${
                isPos ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
              }`}
            >
              {isPos ? <ArrowUpRight className="w-3.5 h-3.5 mr-0.5" /> : <ArrowDownRight className="w-3.5 h-3.5 mr-0.5" />}
              {formatPercent(changePct)}
            </span>
          </div>
        </div>

        {/* 24H Key Statistics Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs bg-[#121622] px-4 py-2.5 rounded-2xl border border-slate-800/80 font-mono">
          <div>
            <span className="text-slate-400 text-[10px] font-sans font-medium block">24H HIGH</span>
            <span className="text-slate-100 font-bold">{tickData ? formatPrice(tickData.high24h, decimals) : '—'}</span>
          </div>
          <div>
            <span className="text-slate-400 text-[10px] font-sans font-medium block">24H LOW</span>
            <span className="text-slate-100 font-bold">{tickData ? formatPrice(tickData.low24h, decimals) : '—'}</span>
          </div>
          <div>
            <span className="text-slate-400 text-[10px] font-sans font-medium block">24H VOLUME</span>
            <span className="text-slate-100 font-bold">{tickData ? formatVolume(tickData.volume) : '—'}</span>
          </div>
          <div>
            <span className="text-slate-400 text-[10px] font-sans font-medium block">SPREAD / STATE</span>
            <span className="text-emerald-400 font-bold">
              {tickData ? `${tickData.spread.toFixed(decimals > 2 ? 4 : 1)} pips` : '—'} | {smc?.overallBias.toUpperCase() || 'NEUTRAL'}
            </span>
          </div>
        </div>

        {/* Buy Power vs Sell Power Mini Gauges */}
        <div className="flex items-center gap-3 bg-[#121622] px-3.5 py-2.5 rounded-2xl border border-slate-800/80 min-w-[210px] font-mono">
          <div className="w-full">
            <div className="flex justify-between text-[10px] font-bold mb-1">
              <span className="text-emerald-400">BUY {buyPower}%</span>
              <span className="text-rose-400">SELL {sellPower}%</span>
            </div>
            <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden flex p-0.5 border border-slate-700/60">
              <div
                className="h-full bg-emerald-500 rounded-full transition-all duration-500"
                style={{ width: `${buyPower}%` }}
              />
              <div
                className="h-full bg-rose-500 rounded-full transition-all duration-500"
                style={{ width: `${sellPower}%` }}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
