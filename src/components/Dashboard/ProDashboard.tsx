import React, { useState, useEffect } from 'react';
import { MarketPressurePanel } from '../MarketPressurePanel';
import {
  BarChart3,
  Sparkles,
  ArrowUpRight,
  ArrowDownRight,
  Flame,
  RefreshCw,
  TrendingUp,
  Activity,
  Layers,
  ShieldAlert,
} from 'lucide-react';
import { tradingStore } from '../../store/tradingStore';
import { IntelligenceService } from '../../services/intelligenceService';
import { getClassificationColor } from '../../services/fearAndGreedService';

export const ProDashboard: React.FC = () => {
  const [, setTick] = useState(0);

  useEffect(() => {
    return tradingStore.subscribe(() => setTick((t) => t + 1));
  }, []);

  const assets = tradingStore.assets;
  const topGainers = [...assets].sort((a, b) => (b.change7d || 0) - (a.change7d || 0)).slice(0, 5);
  const highVol = [...assets].sort((a, b) => (b.volume24h || 0) - (a.volume24h || 0)).slice(0, 5);
  const whaleTxs = IntelligenceService.getWhaleTransactions();
  const narratives = IntelligenceService.getNarratives();

  const fng = tradingStore.fearAndGreed;
  const fngValue = fng ? fng.value : 29;
  const fngClassification = fng ? fng.classification : 'Fear';
  const fngColors = getClassificationColor(fngValue);

  return (
    <div className="space-y-4 p-3 sm:p-4 max-w-[1920px] mx-auto text-slate-200">
      {/* Top Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-900/80 border border-slate-800/90 rounded-2xl p-4 shadow-md">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
            <BarChart3 className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-white flex items-center gap-2">
              Market Intelligence Terminal
            </h1>
            <p className="text-xs text-slate-400">
              Real-time institutional metrics across crypto, orderflow pressure, on-chain transactions & derivatives.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => tradingStore.refreshFearAndGreed()}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-xs border border-slate-700 transition-all cursor-pointer"
          >
            <RefreshCw className="w-3.5 h-3.5 text-cyan-400" />
            <span>Refresh Intelligence Data</span>
          </button>
        </div>
      </div>

      {/* Row 1: Key Global Market Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
        <div className="bg-slate-900/90 border border-slate-800/90 rounded-2xl p-4 flex flex-col justify-between shadow-md">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Crypto Market Cap</span>
          <div className="text-2xl font-black text-white mt-1">$2.85 Trillion</div>
          <span className="text-xs text-emerald-400 font-semibold flex items-center gap-0.5 mt-1">
            <ArrowUpRight className="w-3.5 h-3.5" /> +3.4% 24h
          </span>
        </div>

        <div className="bg-slate-900/90 border border-slate-800/90 rounded-2xl p-4 flex flex-col justify-between shadow-md">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">24h Global Volume</span>
          <div className="text-2xl font-black text-white mt-1">$114.2 Billion</div>
          <span className="text-xs text-cyan-400 font-semibold flex items-center gap-0.5 mt-1">
            <TrendingUp className="w-3.5 h-3.5" /> High Liquidity Flow
          </span>
        </div>

        <div className="bg-slate-900/90 border border-slate-800/90 rounded-2xl p-4 flex flex-col justify-between shadow-md">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">BTC Dominance</span>
          <div className="text-2xl font-black text-white mt-1">57.4%</div>
          <span className="text-xs text-rose-400 font-semibold flex items-center gap-0.5 mt-1">
            <ArrowDownRight className="w-3.5 h-3.5" /> -0.6% (Altcoin Season Index: 62)
          </span>
        </div>

        {/* Live Fear & Greed Card */}
        <div className="bg-slate-900/90 border border-slate-800/90 rounded-2xl p-4 flex flex-col justify-between shadow-md">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
              <Flame className={`w-4 h-4 ${fngColors.text}`} /> Fear & Greed Index
            </span>
            <span className={`text-xs font-bold uppercase tracking-wider px-2 py-0.5 rounded-md ${fngColors.badgeBg} ${fngColors.text} border ${fngColors.border}`}>
              {fngClassification}
            </span>
          </div>

          <div className="flex items-center gap-3 my-2">
            <div
              className="w-12 h-12 rounded-full border-4 flex items-center justify-center bg-slate-950 shadow-inner shrink-0"
              style={{ borderColor: fngColors.gaugeColor }}
            >
              <span className={`text-lg font-black ${fngColors.text}`}>{fngValue}</span>
            </div>
            <div className="flex-1">
              <div className="h-2 rounded-full bg-slate-800 relative overflow-hidden flex">
                <div className="w-1/4 bg-rose-500/80 h-full" />
                <div className="w-1/5 bg-orange-400/80 h-full" />
                <div className="w-1/10 bg-amber-400/80 h-full" />
                <div className="w-1/4 bg-emerald-500/80 h-full" />
                <div className="w-1/5 bg-green-500/80 h-full" />
                <div
                  className="absolute top-0 bottom-0 w-1.5 bg-white shadow-lg rounded-full transform -translate-x-1/2 transition-all duration-500"
                  style={{ left: `${Math.min(100, Math.max(0, fngValue))}%` }}
                />
              </div>
              <span className="text-[10px] text-slate-400 mt-1 block">
                Next update in: <span className="text-slate-200 font-semibold">{fng?.timeUntilUpdate || 'Live'}</span>
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Row 2: AI Analyst Executive Brief & Buyer/Seller Orderflow Power */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-3.5">
        <div className="lg:col-span-1 bg-slate-900/90 border border-slate-800/90 rounded-2xl p-4 space-y-3 shadow-md flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 pb-2 border-b border-slate-800 mb-2">
              <Sparkles className="w-4 h-4 text-indigo-400" />
              <span className="text-xs font-bold text-slate-200 uppercase tracking-wider">
                AI Executive Market Brief
              </span>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed bg-indigo-950/20 border border-indigo-500/30 p-3 rounded-xl">
              Bitcoin holding steady near major Order Block demand zone. High volume expansion in AI & Move-L1 sectors (FET +16.4%, SUI +19.5%). Exchange reserves down $430M indicating active institutional custody positioning.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-2 text-xs pt-2 border-t border-slate-800/80">
            <div className="bg-slate-950/60 p-2.5 rounded-xl border border-slate-800/60">
              <span className="text-slate-400 block text-[11px]">BTC Open Interest</span>
              <span className="font-black text-white text-sm">$38.5B</span>
              <span className="text-emerald-400 text-[10px] block font-semibold">+4.8% 24h</span>
            </div>
            <div className="bg-slate-950/60 p-2.5 rounded-xl border border-slate-800/60">
              <span className="text-slate-400 block text-[11px]">BTC Funding Rate</span>
              <span className="font-black text-amber-400 text-sm">+0.0125%</span>
              <span className="text-slate-400 text-[10px] block">Normal Bullish Bias</span>
            </div>
          </div>
        </div>

        <div className="lg:col-span-2 bg-slate-900/90 border border-slate-800/90 rounded-2xl p-4 shadow-md">
          <div className="flex items-center gap-2 pb-2 border-b border-slate-800 mb-3">
            <Activity className="w-4 h-4 text-cyan-400" />
            <span className="text-xs font-bold text-slate-200 uppercase tracking-wider">
              Real-Time Buyer vs Seller Power (Orderflow Delta)
            </span>
          </div>
          <MarketPressurePanel />
        </div>
      </div>

      {/* Row 3: Sector Matrix, Top Gainers, High Vol & Whale Alerts */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3.5">
        {/* Sector Matrix */}
        <div className="bg-slate-900/90 border border-slate-800/90 rounded-2xl p-4 shadow-md">
          <div className="flex items-center gap-2 pb-2 border-b border-slate-800 mb-3">
            <Layers className="w-4 h-4 text-indigo-400" />
            <span className="text-xs font-bold text-slate-200 uppercase tracking-wider">
              Sector Momentum Matrix
            </span>
          </div>
          <div className="space-y-2">
            {narratives.map((nar) => (
              <div key={nar.id} className="p-2.5 rounded-xl bg-slate-950/60 border border-slate-800/80">
                <div className="flex items-center justify-between text-xs font-bold text-slate-200">
                  <span>{nar.name}</span>
                  <span className="text-emerald-400">+{nar.marketCapPerformance7dPercent}%</span>
                </div>
                <span className="text-[10px] text-slate-400 block mt-0.5">
                  Top: {nar.topTokens.join(', ')}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Top 24h Gainers */}
        <div className="bg-slate-900/90 border border-slate-800/90 rounded-2xl p-4 shadow-md">
          <div className="flex items-center gap-2 pb-2 border-b border-slate-800 mb-3">
            <TrendingUp className="w-4 h-4 text-emerald-400" />
            <span className="text-xs font-bold text-slate-200 uppercase tracking-wider">
              Top 24h Outperformers
            </span>
          </div>
          <div className="space-y-1.5">
            {topGainers.map((asset) => (
              <div
                key={asset.id}
                onClick={() => tradingStore.selectSymbol(asset.symbol)}
                className="flex items-center justify-between p-2 rounded-xl bg-slate-950/60 hover:bg-slate-800/60 cursor-pointer text-xs transition-colors"
              >
                <div className="flex items-center gap-2">
                  <span className="font-bold text-white">{asset.symbol}</span>
                  <span className="text-[10px] text-slate-400 bg-slate-900 px-1.5 py-0.5 rounded">
                    {asset.sector}
                  </span>
                </div>
                <span className="font-bold text-emerald-400 flex items-center gap-0.5">
                  <ArrowUpRight className="w-3 h-3" /> +{asset.change7d}%
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Highest Volume */}
        <div className="bg-slate-900/90 border border-slate-800/90 rounded-2xl p-4 shadow-md">
          <div className="flex items-center gap-2 pb-2 border-b border-slate-800 mb-3">
            <BarChart3 className="w-4 h-4 text-cyan-400" />
            <span className="text-xs font-bold text-slate-200 uppercase tracking-wider">
              Volume Leaders
            </span>
          </div>
          <div className="space-y-1.5">
            {highVol.map((asset) => (
              <div
                key={asset.id}
                onClick={() => tradingStore.selectSymbol(asset.symbol)}
                className="flex items-center justify-between p-2 rounded-xl bg-slate-950/60 hover:bg-slate-800/60 cursor-pointer text-xs transition-colors"
              >
                <div>
                  <span className="font-bold text-white">{asset.symbol}</span>
                  <span className="text-[10px] text-slate-400 block">{asset.name}</span>
                </div>
                <div className="text-right">
                  <span className="font-bold text-slate-200">
                    ${((asset.volume24h || 0) / 1e9).toFixed(2)}B
                  </span>
                  <span className="text-[10px] text-cyan-400 block">
                    Vol/Cap: {asset.volumeToMcapRatio}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Whale Alert Feed */}
        <div className="bg-slate-900/90 border border-slate-800/90 rounded-2xl p-4 shadow-md">
          <div className="flex items-center gap-2 pb-2 border-b border-slate-800 mb-3">
            <ShieldAlert className="w-4 h-4 text-amber-400" />
            <span className="text-xs font-bold text-slate-200 uppercase tracking-wider">
              Whale Transactions
            </span>
          </div>
          <div className="space-y-2">
            {whaleTxs.slice(0, 4).map((w) => (
              <div key={w.id} className="p-2 rounded-xl bg-slate-950/60 border border-slate-800/80 text-xs">
                <div className="flex items-center justify-between font-bold text-slate-200">
                  <span className="text-cyan-300">{w.symbol}</span>
                  <span className="text-emerald-400">${(w.amountUSD / 1e6).toFixed(1)}M</span>
                </div>
                <div className="text-[10px] text-slate-400 mt-0.5 truncate">
                  {w.txType}: {w.fromLabel} → {w.toLabel}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Row 4: Watchlist Quick Select Bar */}
      <div className="bg-slate-900/90 border border-slate-800/90 rounded-2xl p-4 shadow-md">
        <span className="text-xs font-bold text-slate-300 uppercase tracking-wider block mb-3">
          Quick Asset Watchlist
        </span>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2">
          {assets.map((asset) => (
            <div
              key={asset.id}
              onClick={() => tradingStore.selectSymbol(asset.symbol)}
              className="p-2.5 rounded-xl bg-slate-950/80 border border-slate-800 hover:border-cyan-500/40 cursor-pointer text-xs transition-colors"
            >
              <div className="flex items-center justify-between">
                <span className="font-bold text-white">{asset.baseSymbol}</span>
                <span className={`font-semibold ${asset.change7d && asset.change7d > 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                  {asset.change7d}%
                </span>
              </div>
              <div className="text-[11px] text-slate-400 mt-1">${(asset.marketCap ? asset.marketCap / 1e9 : 0).toFixed(1)}B Cap</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
