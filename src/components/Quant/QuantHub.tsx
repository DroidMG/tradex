import React from 'react';
import {
  Cpu,
  BarChart2,
  Sliders,
  Play,
  RotateCcw,
  Sparkles,
  Zap,
  TrendingUp,
} from 'lucide-react';
import { tradingStore } from '../../store/tradingStore';

export const QuantHub: React.FC = () => {
  return (
    <div className="space-y-4 p-3 sm:p-4 max-w-[1920px] mx-auto text-slate-200">
      {/* Top Banner */}
      <div className="bg-slate-900/90 border border-slate-800/90 rounded-2xl p-4 shadow-md flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
            <Cpu className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-white flex items-center gap-2">
              Quant & Strategy Backtester Intelligence Hub
            </h1>
            <p className="text-xs text-slate-400">
              Simulate quantitative algorithmic strategies against historical candle data with slippage and fee modeling.
            </p>
          </div>
        </div>

        <button
          onClick={() => (tradingStore.isBacktestOpen = true)}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-md transition-all cursor-pointer"
        >
          <Play className="w-4 h-4 fill-white" />
          <span>Launch Strategy Backtester</span>
        </button>
      </div>

      {/* Preset Strategies Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[
          {
            name: 'SMC Order Block & FVG Liquidity Retest',
            winRate: '68.4%',
            profitFactor: '2.14',
            sharpe: '2.28',
            desc: 'Detects institutional Order Block mitigation zones aligned with 15m Fair Value Gap sweep entries.',
          },
          {
            name: 'Multi-EMA Trend & Supertrend Volatility',
            winRate: '61.2%',
            profitFactor: '1.82',
            sharpe: '1.95',
            desc: 'Executes trades on EMA 20/50 golden crossover with ATR Supertrend trend-following trailing stop.',
          },
          {
            name: 'RSI Divergence & Volume Exhaustion Squeeze',
            winRate: '58.9%',
            profitFactor: '1.68',
            sharpe: '1.72',
            desc: 'Identifies bullish/bearish divergence between RSI oscillator and high volume candle exhaustion.',
          },
        ].map((strat, idx) => (
          <div
            key={idx}
            className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800/90 space-y-3 text-xs"
          >
            <h3 className="font-bold text-white text-sm">{strat.name}</h3>
            <p className="text-slate-400 text-[11px] leading-relaxed">{strat.desc}</p>

            <div className="grid grid-cols-3 gap-2 bg-slate-950 p-2.5 rounded-xl text-[11px]">
              <div>
                <span className="text-slate-500 block">Win Rate</span>
                <span className="font-bold text-emerald-400">{strat.winRate}</span>
              </div>
              <div>
                <span className="text-slate-500 block">Profit Factor</span>
                <span className="font-bold text-cyan-300">{strat.profitFactor}</span>
              </div>
              <div>
                <span className="text-slate-500 block">Sharpe</span>
                <span className="font-bold text-amber-400">{strat.sharpe}</span>
              </div>
            </div>

            <button
              onClick={() => (tradingStore.isBacktestOpen = true)}
              className="w-full py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold transition-colors flex items-center justify-center gap-1.5"
            >
              <Play className="w-3.5 h-3.5" /> Backtest Strategy
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};
