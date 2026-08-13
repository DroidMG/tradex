import React, { useState } from 'react';
import { MarketPressurePanel } from '../MarketPressurePanel';
import {
  Plus,
  RotateCcw,
  TrendingUp,
  TrendingDown,
  Flame,
  Activity,
  Bot,
  Zap,
  Layers,
  ArrowUpRight,
  ArrowDownRight,
  Sparkles,
  Trash2,
  DollarSign,
  PieChart,
  BarChart3,
  ShieldAlert,
  SlidersHorizontal,
} from 'lucide-react';
import { tradingStore } from '../../store/tradingStore';
import { IntelligenceService } from '../../services/intelligenceService';

export const ProDashboard: React.FC = () => {
  const [showAddWidget, setShowAddWidget] = useState(false);

  const activeLayout = tradingStore.dashboardLayouts.find((l) => l.id === tradingStore.activeLayoutId) || tradingStore.dashboardLayouts[0];
  const assets = tradingStore.assets;
  const topGainers = [...assets].sort((a, b) => (b.change7d || 0) - (a.change7d || 0)).slice(0, 5);
  const topLosers = [...assets].sort((a, b) => (a.change7d || 0) - (b.change7d || 0)).slice(0, 5);
  const highVol = [...assets].sort((a, b) => (b.volume24h || 0) - (a.volume24h || 0)).slice(0, 5);
  const whaleTxs = IntelligenceService.getWhaleTransactions();
  const narratives = IntelligenceService.getNarratives();

  return (
    <div className="space-y-4 p-3 sm:p-4 max-w-[1920px] mx-auto text-slate-200">
      {/* Top Layout Controls Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-900/80 border border-slate-800/90 rounded-2xl p-3 sm:p-4 shadow-md">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
            <BarChart3 className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-white flex items-center gap-2">
              Market Intelligence Terminal
              <span className="text-[10px] bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 px-2 py-0.5 rounded-full font-semibold">
                Interactive Grid
              </span>
            </h1>
            <p className="text-xs text-slate-400">
              Customize, rearrange, and monitor real-time institutional metrics across crypto, on-chain & derivatives.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Layout Presets */}
          <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800">
            {tradingStore.dashboardLayouts.map((l) => (
              <button
                key={l.id}
                onClick={() => (tradingStore.activeLayoutId = l.id)}
                className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                  tradingStore.activeLayoutId === l.id
                    ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {l.name}
              </button>
            ))}
          </div>

          <button
            onClick={() => setShowAddWidget(!showAddWidget)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-semibold text-xs shadow-md transition-all cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Widget</span>
          </button>

          <button
            onClick={() => tradingStore.resetActiveDashboardLayout()}
            title="Reset active layout to default"
            className="p-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-slate-200 border border-slate-700 transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Add Widget Picker Panel */}
      {showAddWidget && (
        <div className="bg-slate-900 border border-cyan-500/30 rounded-2xl p-4 space-y-3 animate-fade-in shadow-xl">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold text-cyan-300 flex items-center gap-1.5">
              <Plus className="w-4 h-4" /> Available Intelligence Widgets
            </h3>
            <button
              onClick={() => setShowAddWidget(false)}
              className="text-xs text-slate-400 hover:text-slate-200"
            >
              Close
            </button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-2">
            {[
              { type: 'market_pressure', label: 'Buyer/Seller Power (Live)' },
              { type: 'market_cap', label: 'Market Cap' },
              { type: 'btc_dominance', label: 'BTC Dominance' },
              { type: 'fear_greed', label: 'Fear & Greed' },
              { type: 'ai_summary', label: 'AI Executive Brief' },
              { type: 'top_gainers', label: 'Top 24h Gainers' },
              { type: 'highest_volume', label: 'Highest Volume' },
              { type: 'sector_perf', label: 'Sector Matrix' },
              { type: 'whale_feed_quick', label: 'Whale Alert Feed' },
              { type: 'derivatives_quick', label: 'Derivatives OI' },
              { type: 'user_watchlist', label: 'Pinned Watchlist' },
            ].map((item) => (
              <button
                key={item.type}
                onClick={() => {
                  tradingStore.addWidgetToActiveLayout(item.type as any, item.label);
                  setShowAddWidget(false);
                }}
                className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 hover:border-cyan-500/50 hover:bg-slate-800/60 text-xs text-left text-slate-300 transition-colors flex items-center justify-between"
              >
                <span>{item.label}</span>
                <Plus className="w-3.5 h-3.5 text-cyan-400" />
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Grid of Widgets */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3.5">
        {activeLayout.widgets.map((widget) => {
          const colSpanClass =
            widget.colSpan === 4
              ? 'md:col-span-2 lg:col-span-4'
              : widget.colSpan === 3
              ? 'md:col-span-2 lg:col-span-3'
              : widget.colSpan === 2
              ? 'md:col-span-2 lg:col-span-2'
              : 'col-span-1';

          return (
            <div
              key={widget.id}
              className={`${colSpanClass} bg-slate-900/90 border border-slate-800/90 rounded-2xl p-4 flex flex-col justify-between relative group hover:border-slate-700/80 transition-all shadow-md`}
            >
              {/* Widget Header */}
              <div className="flex items-center justify-between pb-2 border-b border-slate-800/80 mb-3">
                <span className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
                  {widget.title}
                </span>

                <button
                  onClick={() => tradingStore.removeWidgetFromActiveLayout(widget.id)}
                  title="Remove widget from layout"
                  className="opacity-0 group-hover:opacity-100 p-1 text-slate-500 hover:text-rose-400 transition-opacity"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Widget Body Content based on Type */}
              <div className="flex-1">
                {widget.type === 'market_pressure' && <MarketPressurePanel />}

                {widget.type === 'global_overview' && (
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <div className="bg-slate-950/60 border border-slate-800/80 p-3 rounded-xl">
                      <span className="text-[11px] text-slate-400">Crypto Market Cap</span>
                      <div className="text-lg font-black text-white mt-0.5">$2.85 Trillion</div>
                      <span className="text-xs text-emerald-400 font-semibold flex items-center gap-0.5 mt-0.5">
                        <ArrowUpRight className="w-3 h-3" /> +3.4% 24h
                      </span>
                    </div>

                    <div className="bg-slate-950/60 border border-slate-800/80 p-3 rounded-xl">
                      <span className="text-[11px] text-slate-400 font-medium">24h Global Volume</span>
                      <div className="text-lg font-black text-white mt-0.5">$114.2 Billion</div>
                      <span className="text-xs text-emerald-400 font-semibold flex items-center gap-0.5 mt-0.5">
                        <ArrowUpRight className="w-3 h-3" /> +12.8%
                      </span>
                    </div>

                    <div className="bg-slate-950/60 border border-slate-800/80 p-3 rounded-xl">
                      <span className="text-[11px] text-slate-400 font-medium">BTC Market Dominance</span>
                      <div className="text-lg font-black text-amber-400 mt-0.5">56.4%</div>
                      <span className="text-xs text-slate-400 font-semibold mt-0.5 block">
                        ETH 16.2% | Others 27.4%
                      </span>
                    </div>

                    <div className="bg-slate-950/60 border border-slate-800/80 p-3 rounded-xl">
                      <span className="text-[11px] text-slate-400 font-medium">Stablecoin Supply</span>
                      <div className="text-lg font-black text-cyan-400 mt-0.5">$168.5 Billion</div>
                      <span className="text-xs text-emerald-400 font-semibold flex items-center gap-0.5 mt-0.5">
                        <ArrowUpRight className="w-3 h-3" /> +$680M 24h Net Inflow
                      </span>
                    </div>
                  </div>
                )}

                {widget.type === 'market_cap' && (
                  <div>
                    <div className="text-2xl font-black text-white">$2.85T</div>
                    <span className="text-xs text-emerald-400 font-semibold flex items-center gap-0.5 mt-1">
                      <ArrowUpRight className="w-3.5 h-3.5" /> +3.4% ($94B added 24h)
                    </span>
                  </div>
                )}

                {widget.type === 'btc_dominance' && (
                  <div>
                    <div className="text-2xl font-black text-amber-400">56.4%</div>
                    <span className="text-xs text-slate-400 mt-1 block">
                      Macro Trend: High Bitcoin dominance with selective Altcoin rotation.
                    </span>
                  </div>
                )}

                {widget.type === 'eth_dominance' && (
                  <div>
                    <div className="text-2xl font-black text-indigo-400">16.2%</div>
                    <span className="text-xs text-slate-400 mt-1 block">
                      Staked Ratio: 28.4% of circulating ETH locked.
                    </span>
                  </div>
                )}

                {widget.type === 'stablecoin_cap' && (
                  <div>
                    <div className="text-2xl font-black text-cyan-400">$168.5B</div>
                    <span className="text-xs text-emerald-400 font-semibold flex items-center gap-0.5 mt-1">
                      <ArrowUpRight className="w-3.5 h-3.5" /> Dry Powder Increasing
                    </span>
                  </div>
                )}

                {widget.type === 'fear_greed' && (
                  <div className="flex items-center justify-between bg-slate-950/60 border border-slate-800/80 p-3 rounded-xl">
                    <div>
                      <div className="text-3xl font-black text-amber-400 flex items-center gap-2">
                        74
                        <span className="text-xs font-bold text-amber-300 bg-amber-500/20 px-2 py-0.5 rounded-full border border-amber-500/30">
                          GREED
                        </span>
                      </div>
                      <span className="text-[11px] text-slate-400 mt-1 block">
                        Last week: 68 (Greed) | Month ago: 52 (Neutral)
                      </span>
                    </div>

                    <div className="w-16 h-16 rounded-full border-4 border-amber-400 flex items-center justify-center bg-amber-400/10">
                      <Flame className="w-8 h-8 text-amber-400" />
                    </div>
                  </div>
                )}

                {widget.type === 'ai_summary' && (
                  <div className="space-y-2 bg-indigo-950/20 border border-indigo-500/30 p-3 rounded-xl">
                    <div className="flex items-center gap-2 text-indigo-300 font-bold text-xs">
                      <Sparkles className="w-4 h-4" /> Market Analyst Executive Summary
                    </div>
                    <p className="text-xs text-slate-300 leading-relaxed">
                      Bitcoin holding steady at $95.4k near major Order Block demand. High volume expansion in AI & Move-L1 sectors (FET +16.4%, SUI +19.5%). Exchange reserves down $430M indicating active institutional custody positioning.
                    </p>
                  </div>
                )}

                {widget.type === 'top_gainers' && (
                  <div className="space-y-1.5">
                    {topGainers.map((asset) => (
                      <div
                        key={asset.id}
                        onClick={() => tradingStore.selectSymbol(asset.symbol)}
                        className="flex items-center justify-between p-2 rounded-lg bg-slate-950/60 hover:bg-slate-800/60 cursor-pointer text-xs"
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
                )}

                {widget.type === 'top_losers' && (
                  <div className="space-y-1.5">
                    {topLosers.map((asset) => (
                      <div
                        key={asset.id}
                        onClick={() => tradingStore.selectSymbol(asset.symbol)}
                        className="flex items-center justify-between p-2 rounded-lg bg-slate-950/60 hover:bg-slate-800/60 cursor-pointer text-xs"
                      >
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-white">{asset.symbol}</span>
                          <span className="text-[10px] text-slate-400 bg-slate-900 px-1.5 py-0.5 rounded">
                            {asset.sector}
                          </span>
                        </div>
                        <span className="font-bold text-rose-400 flex items-center gap-0.5">
                          <ArrowDownRight className="w-3 h-3" /> {asset.change7d}%
                        </span>
                      </div>
                    ))}
                  </div>
                )}

                {widget.type === 'highest_volume' && (
                  <div className="space-y-1.5">
                    {highVol.map((asset) => (
                      <div
                        key={asset.id}
                        onClick={() => tradingStore.selectSymbol(asset.symbol)}
                        className="flex items-center justify-between p-2 rounded-lg bg-slate-950/60 hover:bg-slate-800/60 cursor-pointer text-xs"
                      >
                        <div>
                          <span className="font-bold text-white">{asset.symbol}</span>
                          <span className="text-[10px] text-slate-400 block">{asset.name}</span>
                        </div>
                        <div className="text-right">
                          <span className="font-bold text-slate-200">
                            ${((asset.volume24h || 0) / 1e9).toFixed(2)}B
                          </span>
                          <span className="text-[10px] text-emerald-400 block">
                             Vol/Cap: {asset.volumeToMcapRatio}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {widget.type === 'sector_perf' && (
                  <div className="grid grid-cols-2 gap-2">
                    {narratives.map((nar) => (
                      <div key={nar.id} className="p-2.5 rounded-xl bg-slate-950/60 border border-slate-800/80">
                        <div className="flex items-center justify-between text-xs font-bold text-slate-200">
                          <span>{nar.name}</span>
                          <span className="text-emerald-400">+{nar.marketCapPerformance7dPercent}%</span>
                        </div>
                        <span className="text-[10px] text-slate-400 block mt-1">
                          Tokens: {nar.topTokens.join(', ')}
                        </span>
                      </div>
                    ))}
                  </div>
                )}

                {widget.type === 'whale_feed_quick' && (
                  <div className="space-y-2">
                    {whaleTxs.slice(0, 3).map((w) => (
                      <div key={w.id} className="p-2 rounded-lg bg-slate-950/60 border border-slate-800/80 text-xs">
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
                )}

                {widget.type === 'derivatives_quick' && (
                  <div className="grid grid-cols-2 gap-3 bg-slate-950/60 p-3 rounded-xl border border-slate-800/80 text-xs">
                    <div>
                      <span className="text-slate-400 text-[11px]">BTC Open Interest</span>
                      <div className="text-base font-black text-white mt-0.5">$38.5 Billion</div>
                      <span className="text-emerald-400 font-semibold text-[10px]">+4.8% 24h</span>
                    </div>

                    <div>
                      <span className="text-slate-400 text-[11px]">BTC Funding Rate</span>
                      <div className="text-base font-black text-amber-400 mt-0.5">+0.0125% / 8h</div>
                      <span className="text-slate-400 font-semibold text-[10px]">Normal Bullish Bias</span>
                    </div>
                  </div>
                )}

                {widget.type === 'user_watchlist' && (
                  <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-2">
                    {assets.slice(0, 6).map((asset) => (
                      <div
                        key={asset.id}
                        onClick={() => tradingStore.selectSymbol(asset.symbol)}
                        className="p-2.5 rounded-xl bg-slate-950/80 border border-slate-800 hover:border-cyan-500/40 cursor-pointer text-xs"
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
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
