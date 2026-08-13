import React, { useState } from 'react';
import {
  Wallet,
  ArrowUpRight,
  ArrowDownRight,
  Plus,
  XCircle,
  ShieldCheck,
  Zap,
  DollarSign,
  TrendingUp,
  AlertTriangle,
} from 'lucide-react';
import { tradingStore } from '../../store/tradingStore';
import { IntelligenceService } from '../../services/intelligenceService';

export const PortfolioTerminal: React.FC = () => {
  const [orderSymbol, setOrderSymbol] = useState('BTC/USD');
  const [orderSide, setOrderSide] = useState<'BUY' | 'SELL'>('BUY');
  const [orderType, setOrderType] = useState<'MARKET' | 'LIMIT'>('MARKET');
  const [orderAmount, setOrderAmount] = useState('0.1');
  const [orderLeverage, setOrderLeverage] = useState(5);

  const balance = tradingStore.paperBalanceUSD;
  const positions = tradingStore.paperPositions;
  const orders = tradingStore.paperOrders;
  const risk = IntelligenceService.getPortfolioRisk(balance);

  const tick = tradingStore.ticks.get(orderSymbol);
  const currentPrice = tick?.last ?? 95400;

  const handlePlaceOrder = (e: React.FormEvent) => {
    e.preventDefault();
    tradingStore.placePaperOrder({
      symbol: orderSymbol,
      side: orderSide,
      type: orderType,
      price: currentPrice,
      amount: parseFloat(orderAmount) || 0.1,
    });
  };

  return (
    <div className="space-y-4 p-3 sm:p-4 max-w-[1920px] mx-auto text-slate-200">
      {/* Portfolio Header Banner */}
      <div className="bg-slate-900/90 border border-slate-800/90 rounded-2xl p-4 shadow-md space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800/80 pb-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <Wallet className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-white flex items-center gap-2">
                Pro Paper Trading & Portfolio Management Terminal
              </h1>
              <p className="text-xs text-slate-400">
                Execute paper trades with zero risk, monitor portfolio risk analytics, and optimize asset allocation.
              </p>
            </div>
          </div>
        </div>

        {/* Portfolio Stats Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="bg-slate-950/60 border border-slate-800/80 p-3 rounded-xl">
            <span className="text-[11px] text-slate-400">Total Portfolio Value</span>
            <div className="text-xl font-black text-white mt-0.5">${balance.toLocaleString()}</div>
            <span className="text-xs text-emerald-400 font-semibold flex items-center gap-0.5 mt-0.5">
              <ArrowUpRight className="w-3.5 h-3.5" /> +2.14% All-Time
            </span>
          </div>

          <div className="bg-slate-950/60 border border-slate-800/80 p-3 rounded-xl">
            <span className="text-[11px] text-slate-400">Sharpe Ratio</span>
            <div className="text-xl font-black text-cyan-400 mt-0.5">{risk.sharpeRatio}</div>
            <span className="text-xs text-slate-400 font-semibold mt-0.5 block">
              Excellent Risk-Adjusted Return
            </span>
          </div>

          <div className="bg-slate-950/60 border border-slate-800/80 p-3 rounded-xl">
            <span className="text-[11px] text-slate-400">Value at Risk (95% VaR)</span>
            <div className="text-xl font-black text-amber-400 mt-0.5">{risk.valueAtRisk95Percent}%</div>
            <span className="text-xs text-slate-400 font-semibold mt-0.5 block">
              Max Daily Loss Threshold
            </span>
          </div>

          <div className="bg-slate-950/60 border border-slate-800/80 p-3 rounded-xl">
            <span className="text-[11px] text-slate-400">Beta to Bitcoin</span>
            <div className="text-xl font-black text-indigo-400 mt-0.5">{risk.betaToBtc}</div>
            <span className="text-xs text-slate-400 font-semibold mt-0.5 block">
              Market Correlation Factor
            </span>
          </div>
        </div>
      </div>

      {/* Main Grid: Order Entry & Positions Table */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Order Entry Form */}
        <div className="bg-slate-900/90 border border-slate-800/90 rounded-2xl p-4 shadow-lg space-y-4">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <Zap className="w-4 h-4 text-emerald-400" />
            <span>New Paper Order Entry</span>
          </h3>

          <form onSubmit={handlePlaceOrder} className="space-y-3 text-xs">
            <div>
              <label className="text-slate-400 block mb-1 font-semibold">Select Asset</label>
              <select
                value={orderSymbol}
                onChange={(e) => setOrderSymbol(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white font-bold focus:outline-none"
              >
                {tradingStore.assets.map((a) => (
                  <option key={a.id} value={a.symbol}>
                    {a.symbol} (${(tradingStore.ticks.get(a.symbol)?.last ?? 0).toLocaleString()})
                  </option>
                ))}
              </select>
            </div>

            {/* Order Side Selector */}
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setOrderSide('BUY')}
                className={`py-2 rounded-xl font-bold text-xs transition-all ${
                  orderSide === 'BUY'
                    ? 'bg-emerald-600 text-white shadow-md'
                    : 'bg-slate-950 text-slate-400 border border-slate-800'
                }`}
              >
                BUY / LONG
              </button>
              <button
                type="button"
                onClick={() => setOrderSide('SELL')}
                className={`py-2 rounded-xl font-bold text-xs transition-all ${
                  orderSide === 'SELL'
                    ? 'bg-rose-600 text-white shadow-md'
                    : 'bg-slate-950 text-slate-400 border border-slate-800'
                }`}
              >
                SELL / SHORT
              </button>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-slate-400 block mb-1 font-semibold">Order Type</label>
                <select
                  value={orderType}
                  onChange={(e) => setOrderType(e.target.value as any)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2 text-white focus:outline-none"
                >
                  <option value="MARKET">MARKET</option>
                  <option value="LIMIT">LIMIT</option>
                </select>
              </div>

              <div>
                <label className="text-slate-400 block mb-1 font-semibold">Amount (Tokens)</label>
                <input
                  type="text"
                  value={orderAmount}
                  onChange={(e) => setOrderAmount(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2 text-white font-bold focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="text-slate-400 block mb-1 font-semibold">
                Leverage ({orderLeverage}x)
              </label>
              <input
                type="range"
                min="1"
                max="50"
                value={orderLeverage}
                onChange={(e) => setOrderLeverage(Number(e.target.value))}
                className="w-full accent-emerald-500 cursor-pointer"
              />
            </div>

            <button
              type="submit"
              className={`w-full py-3 rounded-xl font-black text-xs shadow-md transition-all cursor-pointer ${
                orderSide === 'BUY' ? 'bg-emerald-600 hover:bg-emerald-500 text-white' : 'bg-rose-600 hover:bg-rose-500 text-white'
              }`}
            >
              EXECUTE {orderSide} ORDER
            </button>
          </form>
        </div>

        {/* Positions & Order History */}
        <div className="lg:col-span-2 bg-slate-900/90 border border-slate-800/90 rounded-2xl p-4 shadow-lg space-y-4">
          <h3 className="text-sm font-bold text-white">Active Open Positions ({positions.length})</h3>

          {positions.length === 0 ? (
            <p className="text-xs text-slate-500 italic">No open paper positions. Place an order to start.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-300">
                <thead className="bg-slate-950 border-b border-slate-800 text-slate-400 uppercase font-bold">
                  <tr>
                    <th className="p-2.5">Asset</th>
                    <th className="p-2.5">Side</th>
                    <th className="p-2.5 text-right">Entry Price</th>
                    <th className="p-2.5 text-right">Amount</th>
                    <th className="p-2.5 text-right">Unrealized P&L</th>
                    <th className="p-2.5 text-center">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800 font-medium">
                  {positions.map((p) => (
                    <tr key={p.id} className="hover:bg-slate-800/40">
                      <td className="p-2.5 font-bold text-white">{p.symbol}</td>
                      <td className="p-2.5">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            p.side === 'LONG'
                              ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                              : 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                          }`}
                        >
                          {p.side} {p.leverage}x
                        </span>
                      </td>
                      <td className="p-2.5 text-right font-mono">${p.entryPrice.toLocaleString()}</td>
                      <td className="p-2.5 text-right font-mono">{p.amount}</td>
                      <td className="p-2.5 text-right font-bold text-emerald-400">
                        +${p.unrealizedPnl.toFixed(2)} (+{p.unrealizedPnlPercent}%)
                      </td>
                      <td className="p-2.5 text-center">
                        <button
                          onClick={() => tradingStore.closePaperPosition(p.id)}
                          className="px-2 py-1 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 border border-rose-500/30 font-semibold text-[10px]"
                        >
                          Close
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
