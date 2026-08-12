import React, { useState } from 'react';
import { X, Play, BarChart2, AlertCircle } from 'lucide-react';
import { tradingStore } from '../store/tradingStore';
import { runBacktest } from '../services/BacktestEngine';
import { BacktestResult, Timeframe } from '../types/trading';

export const BacktestModal: React.FC = () => {
  const [symbol, setSymbol] = useState(tradingStore.selectedSymbol);
  const [timeframe, setTimeframe] = useState<Timeframe>(tradingStore.selectedTimeframe);
  const [strategy, setStrategy] = useState('SMC Confluence');
  const [feePercent, setFeePercent] = useState(0.05);
  const [slippagePercent, setSlippagePercent] = useState(0.01);

  const [result, setResult] = useState<BacktestResult | null>(() =>
    runBacktest({
      symbol: tradingStore.selectedSymbol,
      timeframe: tradingStore.selectedTimeframe,
      strategyName: 'SMC Confluence',
      initialBalance: 10000,
      feePercent: 0.05,
      slippagePercent: 0.01,
    })
  );

  if (!tradingStore.isBacktestOpen) return null;

  const handleRun = () => {
    const res = runBacktest({
      symbol,
      timeframe,
      strategyName: strategy,
      initialBalance: 10000,
      feePercent,
      slippagePercent,
    });
    setResult(res);
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 z-50 font-sans text-xs select-none">
      <div className="bg-[#0c0e14] border border-slate-800/80 rounded-3xl max-w-4xl w-full max-h-[90vh] overflow-y-auto p-5 space-y-4 shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800/80 pb-4">
          <div className="flex items-center gap-2 text-slate-100 font-extrabold text-sm tracking-tight">
            <BarChart2 className="w-5 h-5 text-indigo-400" />
            <span>QUANT STRATEGY BACKTESTING ENGINE</span>
            <span className="px-3 py-0.5 text-[10px] bg-amber-500/10 border border-amber-500/20 text-amber-300 rounded-full font-bold font-mono">
              BACKTESTED EVALUATION
            </span>
          </div>

          <button
            onClick={() => {
              tradingStore.isBacktestOpen = false;
              tradingStore.notify();
            }}
            className="p-1.5 rounded-full bg-[#121622] border border-slate-800 text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Controls Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 bg-[#121622] p-4 rounded-2xl border border-slate-800/80">
          <div>
            <label className="text-[10px] text-slate-400 font-bold block mb-1.5">ASSET</label>
            <select
              value={symbol}
              onChange={(e) => setSymbol(e.target.value)}
              className="w-full bg-[#0c0e14] border border-slate-800 rounded-xl px-3 py-2 text-slate-200 font-mono text-xs focus:outline-none focus:border-indigo-500"
            >
              {tradingStore.assets.map((a) => (
                <option key={a.symbol} value={a.symbol}>
                  {a.symbol}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-[10px] text-slate-400 font-bold block mb-1.5">TIMEFRAME</label>
            <select
              value={timeframe}
              onChange={(e) => setTimeframe(e.target.value as Timeframe)}
              className="w-full bg-[#0c0e14] border border-slate-800 rounded-xl px-3 py-2 text-slate-200 font-mono text-xs focus:outline-none focus:border-indigo-500"
            >
              {['1m', '5m', '15m', '1H', '4H', '1D'].map((tf) => (
                <option key={tf} value={tf}>
                  {tf}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-[10px] text-slate-400 font-bold block mb-1.5">STRATEGY</label>
            <select
              value={strategy}
              onChange={(e) => setStrategy(e.target.value)}
              className="w-full bg-[#0c0e14] border border-slate-800 rounded-xl px-3 py-2 text-slate-200 font-mono text-xs focus:outline-none focus:border-indigo-500"
            >
              <option value="SMC Confluence">SMC Confluence</option>
              <option value="EMA + VWAP Trend">EMA + VWAP Trend</option>
              <option value="RSI Mean Reversion">RSI Mean Reversion</option>
            </select>
          </div>

          <div>
            <label className="text-[10px] text-slate-400 font-bold block mb-1.5">FEES / SLIPPAGE</label>
            <div className="flex gap-1.5 font-mono">
              <input
                type="number"
                step="0.01"
                value={feePercent}
                onChange={(e) => setFeePercent(parseFloat(e.target.value))}
                className="w-1/2 bg-[#0c0e14] border border-slate-800 rounded-xl p-1.5 text-slate-200 text-center focus:outline-none focus:border-indigo-500"
                title="Fee %"
              />
              <input
                type="number"
                step="0.01"
                value={slippagePercent}
                onChange={(e) => setSlippagePercent(parseFloat(e.target.value))}
                className="w-1/2 bg-[#0c0e14] border border-slate-800 rounded-xl p-1.5 text-slate-200 text-center focus:outline-none focus:border-indigo-500"
                title="Slippage %"
              />
            </div>
          </div>

          <div className="flex items-end">
            <button
              onClick={handleRun}
              className="w-full flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white font-extrabold py-2 px-3 rounded-xl transition-all shadow-md hover:shadow-indigo-500/25 active:scale-95"
            >
              <Play className="w-3.5 h-3.5 fill-current" />
              <span>RUN</span>
            </button>
          </div>
        </div>

        {/* Backtest Results Cards */}
        {result && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 font-mono">
              <div className="bg-[#121622] p-3.5 rounded-2xl border border-slate-800/80">
                <span className="text-slate-400 text-[10px] block font-sans font-bold mb-1">WIN RATE</span>
                <span className="text-2xl font-extrabold text-emerald-400">{result.winRate}%</span>
                <span className="text-[10px] text-slate-400 block mt-1">{result.totalTrades} total trades</span>
              </div>

              <div className="bg-[#121622] p-3.5 rounded-2xl border border-slate-800/80">
                <span className="text-slate-400 text-[10px] block font-sans font-bold mb-1">PROFIT FACTOR</span>
                <span className="text-2xl font-extrabold text-indigo-400">{result.profitFactor}</span>
                <span className="text-[10px] text-slate-400 block mt-1">Expectancy: {result.expectancyR}R</span>
              </div>

              <div className="bg-[#121622] p-3.5 rounded-2xl border border-slate-800/80">
                <span className="text-slate-400 text-[10px] block font-sans font-bold mb-1">MAX DRAWDOWN</span>
                <span className="text-2xl font-extrabold text-rose-400">{result.maxDrawdownPercent}%</span>
                <span className="text-[10px] text-slate-400 block mt-1">Sharpe: {result.sharpeRatio}</span>
              </div>

              <div className="bg-[#121622] p-3.5 rounded-2xl border border-slate-800/80">
                <span className="text-slate-400 text-[10px] block font-sans font-bold mb-1">TOTAL RETURN</span>
                <span className="text-2xl font-extrabold text-emerald-300">+{result.totalReturnPercent}%</span>
                <span className="text-[10px] text-slate-400 block mt-1">Sortino: {result.sortinoRatio}</span>
              </div>
            </div>

            {/* Simulated Equity Curve */}
            <div className="bg-[#121622] p-4 rounded-2xl border border-slate-800/80 space-y-2">
              <span className="font-extrabold text-slate-200 text-xs block">SIMULATED EQUITY GROWTH CURVE</span>
              <div className="h-28 flex items-end gap-1.5 pt-2 border-b border-slate-800">
                {result.equityCurve.slice(-30).map((pt, i) => {
                  const min = 10000;
                  const max = Math.max(...result.equityCurve.map((e) => e.equity));
                  const hPct = Math.max(15, Math.min(100, ((pt.equity - min) / (max - min || 1)) * 100));

                  return (
                    <div
                      key={i}
                      className="flex-1 bg-indigo-500/70 hover:bg-indigo-400 rounded-t-md transition-all"
                      style={{ height: `${hPct}%` }}
                      title={`$${pt.equity}`}
                    />
                  );
                })}
              </div>
            </div>

            {/* Disclaimer */}
            <div className="flex items-center gap-2 p-3 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-300 text-[11px]">
              <AlertCircle className="w-4 h-4 text-amber-400 shrink-0" />
              <span>
                <strong>DISCLAIMER:</strong> Historical backtested performance does not guarantee future live trading accuracy or market execution performance.
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
