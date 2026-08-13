import React from 'react';
import {
  Zap,
  TrendingUp,
  TrendingDown,
  Activity,
  Layers,
  Percent,
  Flame,
  ArrowUpRight,
  ArrowDownRight,
  Sparkles,
} from 'lucide-react';
import { tradingStore } from '../../store/tradingStore';
import { IntelligenceService } from '../../services/intelligenceService';

export const DerivativesTerminal: React.FC = () => {
  const selectedSymbol = tradingStore.selectedSymbol;
  const tick = tradingStore.ticks.get(selectedSymbol);
  const price = tick?.last ?? 95400;

  const derivs = IntelligenceService.getDerivativesData(selectedSymbol);
  const exchanges = IntelligenceService.getExchangeComparisons(selectedSymbol, price);
  const liqClusters = IntelligenceService.getLiquidationClusters(price);

  return (
    <div className="space-y-4 p-3 sm:p-4 max-w-[1920px] mx-auto text-slate-200">
      {/* Derivatives Top Intelligence Banner */}
      <div className="bg-slate-900/90 border border-slate-800/90 rounded-2xl p-4 shadow-md space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800/80 pb-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <Zap className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-white flex items-center gap-2">
                Derivatives & Liquidation Heatmap Terminal
                <span className="text-[10px] bg-amber-500/20 text-amber-300 border border-amber-500/30 px-2 py-0.5 rounded-full font-semibold">
                  {selectedSymbol}
                </span>
              </h1>
              <p className="text-xs text-slate-400">
                Institutional futures open interest, funding rate predictions, multi-exchange spread arbitrage, and leverage liquidation clusters.
              </p>
            </div>
          </div>
        </div>

        {/* Derivatives KPI Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          <div className="bg-slate-950/60 border border-slate-800/80 p-3 rounded-xl">
            <span className="text-[11px] text-slate-400">Futures Open Interest</span>
            <div className="text-base font-black text-white mt-0.5">
              ${(derivs.openInterestUSD / 1e9).toFixed(2)}B
            </div>
            <span className="text-[10px] text-emerald-400 font-semibold block mt-0.5">
              +{derivs.openInterestChange24h}% 24h Expansion
            </span>
          </div>

          <div className="bg-slate-950/60 border border-slate-800/80 p-3 rounded-xl">
            <span className="text-[11px] text-slate-400">Predicted Funding Rate</span>
            <div className="text-base font-black text-amber-400 mt-0.5">
              +{derivs.fundingRate8hPredicted}% / 8h
            </div>
            <span className="text-[10px] text-slate-400 font-semibold block mt-0.5">
              Longs Pay Shorts (Normal)
            </span>
          </div>

          <div className="bg-slate-950/60 border border-slate-800/80 p-3 rounded-xl">
            <span className="text-[11px] text-slate-400">24h Short Liquidations</span>
            <div className="text-base font-black text-emerald-400 mt-0.5">
              ${(derivs.liquidations24hShortUSD / 1e6).toFixed(1)}M
            </div>
            <span className="text-[10px] text-emerald-400 font-semibold block mt-0.5">
              Short Squeeze Liquidation
            </span>
          </div>

          <div className="bg-slate-950/60 border border-slate-800/80 p-3 rounded-xl">
            <span className="text-[11px] text-slate-400">Long / Short Ratio</span>
            <div className="text-base font-black text-cyan-400 mt-0.5">
              {derivs.longShortRatio} (56.9% Long)
            </div>
            <span className="text-[10px] text-slate-400 font-semibold block mt-0.5">
              Slight Bullish Leverage Bias
            </span>
          </div>

          <div className="bg-slate-950/60 border border-slate-800/80 p-3 rounded-xl">
            <span className="text-[11px] text-slate-400">Implied Volatility (IV 30d)</span>
            <div className="text-base font-black text-indigo-400 mt-0.5">
              {derivs.impliedVolatility30d}%
            </div>
            <span className="text-[10px] text-slate-400 font-semibold block mt-0.5">
              Moderate Options Premium
            </span>
          </div>

          <div className="bg-slate-950/60 border border-slate-800/80 p-3 rounded-xl">
            <span className="text-[11px] text-slate-400">Futures Basis Spread</span>
            <div className="text-base font-black text-white mt-0.5">
              +{derivs.basisPercent}%
            </div>
            <span className="text-[10px] text-slate-400 font-semibold block mt-0.5">
              Contango Premium
            </span>
          </div>
        </div>
      </div>

      {/* Main Grid: Liquidation Heatmap + Multi-Exchange Arbitrage */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Liquidation Cluster Heatmap */}
        <div className="bg-slate-900/90 border border-slate-800/90 rounded-2xl p-4 shadow-lg space-y-3">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Flame className="w-4 h-4 text-rose-400" />
              <span>Leverage Liquidation Cluster Heatmap</span>
            </h3>
            <span className="text-xs text-slate-400 font-mono">Current Spot: ${price.toLocaleString()}</span>
          </div>

          <div className="space-y-2">
            {liqClusters.map((cluster, index) => {
              const isShort = cluster.shortVolumeUSD > 0;
              const volUSD = isShort ? cluster.shortVolumeUSD : cluster.longVolumeUSD;

              return (
                <div
                  key={index}
                  className="p-2.5 rounded-xl bg-slate-950/80 border border-slate-800 flex items-center justify-between text-xs"
                >
                  <div className="flex items-center gap-2">
                    <span
                      className={`font-black text-xs px-2 py-0.5 rounded ${
                        isShort
                          ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                          : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                      }`}
                    >
                      {cluster.leverageTier} {isShort ? 'Short' : 'Long'}
                    </span>
                    <span className="font-bold text-white">
                      ${cluster.priceLevel.toLocaleString('en-US', { maximumFractionDigits: 0 })}
                    </span>
                    <span className="text-[10px] text-slate-500 font-mono">
                      ({cluster.distancePercent > 0 ? '+' : ''}
                      {cluster.distancePercent}%)
                    </span>
                  </div>

                  <div className="text-right font-black text-sm text-slate-200">
                    ${(volUSD / 1e6).toFixed(1)}M
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Multi-Exchange Spread Arbitrage */}
        <div className="bg-slate-900/90 border border-slate-800/90 rounded-2xl p-4 shadow-lg space-y-3">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Percent className="w-4 h-4 text-cyan-400" />
              <span>Multi-Exchange Liquidity & Arbitrage Matrix</span>
            </h3>
            <span className="text-xs text-emerald-400 font-semibold">Live Real-time Feeds</span>
          </div>

          <div className="space-y-2">
            {exchanges.map((ex) => (
              <div
                key={ex.exchange}
                className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 flex items-center justify-between text-xs"
              >
                <div>
                  <div className="font-bold text-white text-sm">{ex.exchange}</div>
                  <div className="text-[10px] text-slate-400 mt-0.5">
                    Spread: <span className="text-cyan-300">{ex.spreadBps} bps</span> | Depth 2%: ${(ex.depth2PercentUSD / 1e6).toFixed(1)}M
                  </div>
                </div>

                <div className="text-right">
                  <div className="font-bold text-slate-200">
                    Futures: ${ex.futuresPrice.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                  </div>
                  <span className="text-[10px] text-amber-400 font-semibold block mt-0.5">
                    Funding: +{ex.fundingRate}%
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
