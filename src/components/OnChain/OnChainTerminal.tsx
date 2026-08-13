import React, { useState } from 'react';
import {
  Activity,
  ArrowUpRight,
  ArrowDownRight,
  ShieldCheck,
  Zap,
  Users,
  Building,
  Unlock,
  ExternalLink,
  Search,
  Filter,
} from 'lucide-react';
import { tradingStore } from '../../store/tradingStore';
import { IntelligenceService } from '../../services/intelligenceService';

export const OnChainTerminal: React.FC = () => {
  const selectedSymbol = tradingStore.selectedSymbol;
  const onChain = IntelligenceService.getOnChainMetrics(selectedSymbol);
  const whaleTxs = IntelligenceService.getWhaleTransactions();
  const smartMoney = IntelligenceService.getSmartMoneyWallets();
  const holders = IntelligenceService.getTokenHolders(selectedSymbol);
  const unlocks = IntelligenceService.getTokenUnlocks();

  const [activeSubTab, setActiveSubTab] = useState<'whales' | 'smart_money' | 'holders' | 'unlocks'>('whales');

  return (
    <div className="space-y-4 p-3 sm:p-4 max-w-[1920px] mx-auto text-slate-200">
      {/* On-Chain Intelligence Banner */}
      <div className="bg-slate-900/90 border border-slate-800/90 rounded-2xl p-4 shadow-md space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800/80 pb-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/30 flex items-center justify-center text-blue-400">
              <Activity className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-white flex items-center gap-2">
                On-Chain & Whale Intelligence Terminal
                <span className="text-[10px] bg-blue-500/20 text-blue-300 border border-blue-500/30 px-2 py-0.5 rounded-full font-semibold">
                  {selectedSymbol}
                </span>
              </h1>
              <p className="text-xs text-slate-400">
                Track network activity, exchange netflows, smart money whale wallets, and token unlock pressure.
              </p>
            </div>
          </div>
        </div>

        {/* Core Metrics Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          <div className="bg-slate-950/60 border border-slate-800/80 p-3 rounded-xl">
            <span className="text-[11px] text-slate-400">Active Addresses (24h)</span>
            <div className="text-base font-black text-white mt-0.5">
              {onChain.activeAddresses24h.toLocaleString()}
            </div>
            <span className="text-[10px] text-emerald-400 font-semibold block mt-0.5">
              +14% New Addresses
            </span>
          </div>

          <div className="bg-slate-950/60 border border-slate-800/80 p-3 rounded-xl">
            <span className="text-[11px] text-slate-400">Exchange Netflow (24h)</span>
            <div
              className={`text-base font-black mt-0.5 ${
                onChain.netExchangeFlow24hUSD < 0 ? 'text-emerald-400' : 'text-rose-400'
              }`}
            >
              ${(Math.abs(onChain.netExchangeFlow24hUSD) / 1e6).toFixed(1)}M
            </div>
            <span className="text-[10px] text-slate-400 font-semibold block mt-0.5">
              {onChain.netExchangeFlow24hUSD < 0 ? 'Net Outflow (Accumulation)' : 'Net Inflow (Selling)'}
            </span>
          </div>

          <div className="bg-slate-950/60 border border-slate-800/80 p-3 rounded-xl">
            <span className="text-[11px] text-slate-400">MVRV Z-Score</span>
            <div className="text-base font-black text-amber-400 mt-0.5">{onChain.mvrvZScore}</div>
            <span className="text-[10px] text-slate-400 font-semibold block mt-0.5">
              Fair Value Expansion
            </span>
          </div>

          <div className="bg-slate-950/60 border border-slate-800/80 p-3 rounded-xl">
            <span className="text-[11px] text-slate-400">SOPR Ratio</span>
            <div className="text-base font-black text-cyan-400 mt-0.5">{onChain.soprRatio}</div>
            <span className="text-[10px] text-slate-400 font-semibold block mt-0.5">
              Profitable Realization
            </span>
          </div>

          <div className="bg-slate-950/60 border border-slate-800/80 p-3 rounded-xl">
            <span className="text-[11px] text-slate-400">NVT Valuation Ratio</span>
            <div className="text-base font-black text-white mt-0.5">{onChain.nvtRatio}</div>
            <span className="text-[10px] text-slate-400 font-semibold block mt-0.5">
              Healthy On-Chain Volume
            </span>
          </div>

          <div className="bg-slate-950/60 border border-slate-800/80 p-3 rounded-xl">
            <span className="text-[11px] text-slate-400">Avg Network Gas Fee</span>
            <div className="text-base font-black text-emerald-400 mt-0.5">
              ${onChain.avgGasFeeUSD}
            </div>
            <span className="text-[10px] text-slate-400 font-semibold block mt-0.5">
              Low Congestion
            </span>
          </div>
        </div>
      </div>

      {/* Sub Tab Navigation */}
      <div className="flex items-center gap-2 bg-slate-900/80 border border-slate-800/80 p-1.5 rounded-2xl">
        {[
          { id: 'whales', label: 'Whale Alert Feed ($100K+)' },
          { id: 'smart_money', label: 'Smart Money Wallets (VCs & MMs)' },
          { id: 'holders', label: 'Holders Distribution' },
          { id: 'unlocks', label: 'Vesting & Unlocks Calendar' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveSubTab(tab.id as any)}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeSubTab === tab.id
                ? 'bg-blue-600 text-white shadow-md'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Whale Alert Feed */}
      {activeSubTab === 'whales' && (
        <div className="bg-slate-900/90 border border-slate-800/90 rounded-2xl p-4 shadow-lg space-y-3">
          <h3 className="text-sm font-bold text-white flex items-center justify-between">
            <span>Real-time Whale Transaction Stream</span>
            <span className="text-xs text-slate-400 font-normal">Auto-updating live via Node RPC</span>
          </h3>

          <div className="space-y-2">
            {whaleTxs.map((tx) => (
              <div
                key={tx.id}
                className="p-3 rounded-xl bg-slate-950/70 border border-slate-800 hover:border-slate-700 flex flex-col md:flex-row items-start md:items-center justify-between gap-3 text-xs"
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-xs shrink-0 ${
                      tx.txType === 'Exchange Withdrawal'
                        ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                        : tx.txType === 'Exchange Deposit'
                        ? 'bg-rose-500/10 text-rose-400 border border-rose-500/30'
                        : 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/30'
                    }`}
                  >
                    🐋
                  </div>
                  <div>
                    <div className="font-bold text-white flex items-center gap-2">
                      <span>{tx.symbol}</span>
                      <span className="text-[10px] px-2 py-0.2 rounded bg-slate-900 border border-slate-800 text-slate-300">
                        {tx.txType}
                      </span>
                    </div>
                    <div className="text-[11px] text-slate-400 mt-0.5">
                      <span className="text-slate-300 font-medium">{tx.fromLabel}</span> →{' '}
                      <span className="text-slate-300 font-medium">{tx.toLabel}</span>
                    </div>
                  </div>
                </div>

                <div className="text-right shrink-0">
                  <div className="font-black text-sm text-white">
                    ${(tx.amountUSD / 1e6).toFixed(2)}M
                  </div>
                  <span className="text-[10px] text-slate-500 font-mono">
                    {tx.amountToken.toLocaleString()} tokens | {new Date(tx.timestamp).toLocaleTimeString()}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Smart Money Wallets */}
      {activeSubTab === 'smart_money' && (
        <div className="bg-slate-900/90 border border-slate-800/90 rounded-2xl p-4 shadow-lg space-y-3">
          <h3 className="text-sm font-bold text-white">Institutional & Smart Money Wallets</h3>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {smartMoney.map((wallet) => (
              <div
                key={wallet.id}
                className="p-4 rounded-xl bg-slate-950/70 border border-slate-800/90 space-y-3 text-xs"
              >
                <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                  <div>
                    <h4 className="font-bold text-white text-sm">{wallet.label}</h4>
                    <span className="text-[10px] text-cyan-400 bg-cyan-950 px-2 py-0.5 rounded border border-cyan-800/60 mt-0.5 inline-block">
                      {wallet.category}
                    </span>
                  </div>
                  <button className="px-2.5 py-1 rounded-lg bg-blue-500/10 hover:bg-blue-500/20 text-blue-300 border border-blue-500/30 font-semibold text-[10px]">
                    {wallet.isFollowing ? 'Following' : '+ Follow'}
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-2 text-[11px]">
                  <div>
                    <span className="text-slate-400">Portfolio Value:</span>
                    <div className="font-bold text-white text-xs">
                      ${(wallet.portfolioValueUSD / 1e6).toFixed(1)}M
                    </div>
                  </div>
                  <div>
                    <span className="text-slate-400">30d Win Rate:</span>
                    <div className="font-bold text-emerald-400 text-xs">{wallet.winRate30d}%</div>
                  </div>
                </div>

                <div className="bg-slate-900 p-2.5 rounded-lg text-[11px]">
                  <span className="text-slate-400 block mb-1 font-semibold">Recent Action:</span>
                  <p className="text-slate-200 font-medium">{wallet.recentAction}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Holders Distribution */}
      {activeSubTab === 'holders' && (
        <div className="bg-slate-900/90 border border-slate-800/90 rounded-2xl p-4 shadow-lg space-y-3">
          <h3 className="text-sm font-bold text-white">Token Holders Breakdown ({selectedSymbol})</h3>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            {holders.map((h, i) => (
              <div key={i} className="p-3 rounded-xl bg-slate-950/70 border border-slate-800/90">
                <span className="text-[11px] text-slate-400 block font-medium">{h.category}</span>
                <div className="text-lg font-black text-cyan-400 mt-1">{h.percentage}%</div>
                <span className="text-[10px] text-slate-500 font-semibold block mt-0.5">
                  ${(h.amountUSD / 1e9).toFixed(1)}B
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Vesting Unlocks */}
      {activeSubTab === 'unlocks' && (
        <div className="bg-slate-900/90 border border-slate-800/90 rounded-2xl p-4 shadow-lg space-y-3">
          <h3 className="text-sm font-bold text-white">Upcoming Cliff Token Unlocks Calendar</h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {unlocks.map((u) => (
              <div
                key={u.id}
                className="p-4 rounded-xl bg-slate-950/70 border border-slate-800/90 flex items-center justify-between text-xs"
              >
                <div>
                  <div className="font-bold text-white text-sm flex items-center gap-2">
                    <Unlock className="w-4 h-4 text-amber-400" />
                    <span>{u.name} ({u.symbol})</span>
                  </div>
                  <span className="text-[11px] text-slate-400 mt-1 block">
                    Target Unlock Date: <span className="text-amber-300 font-bold">{u.unlockDate}</span>
                  </span>
                  <span className="text-[10px] text-slate-500 mt-0.5 block">
                    Category: {u.recipientCategory}
                  </span>
                </div>

                <div className="text-right">
                  <div className="font-black text-sm text-rose-400">
                    ${(u.unlockAmountUSD / 1e6).toFixed(1)}M
                  </div>
                  <span className="text-[10px] text-slate-400 font-semibold block mt-0.5">
                    {u.percentOfCirculating}% of Circulating Supply
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
