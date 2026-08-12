import React, { useEffect, useState } from 'react';
import {
  AlertTriangle,
  BarChart2,
  Clock,
  Command,
  Sliders,
} from 'lucide-react';
import { tradingStore } from '../store/tradingStore';
import { formatTime } from '../utils/formatters';

export const Header: React.FC = () => {
  const [, setTick] = useState(0);

  useEffect(() => {
    return tradingStore.subscribe(() => setTick((t) => t + 1));
  }, []);

  const status = tradingStore.provider.getStatus();
  const timeSinceLastTick = (Date.now() - status.lastTickTimestamp) / 1000;
  const isStale = timeSinceLastTick > 3.5;

  return (
    <header className="flex flex-wrap items-center justify-between gap-3 bg-[#0c0e14] px-4 py-2.5 border-b border-slate-800/80 text-xs select-none">
      {/* Brand & Logo */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-indigo-600 to-indigo-400 flex items-center justify-center text-white shadow-md shadow-indigo-500/20 font-extrabold text-base tracking-tight">
            X
          </div>
          <div className="flex flex-col">
            <div className="flex items-center gap-1.5">
              <span className="font-extrabold text-base tracking-tight text-white font-sans">
                Trade<span className="text-indigo-400">X</span>
              </span>
              <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-300 border border-indigo-500/20">
                PRO
              </span>
            </div>
            <span className="text-[10px] text-slate-400 font-mono tracking-tight hidden sm:block">
              INTELLIGENCE TERMINAL
            </span>
          </div>
        </div>

        {/* Live Status Badge */}
        <div className="flex items-center gap-3 pl-4 border-l border-slate-800/80 font-mono text-[11px]">
          {!isStale && status.connected ? (
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <span className="font-semibold text-[10px] tracking-wide">STREAMING</span>
            </div>
          ) : (
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400">
              <AlertTriangle className="w-3 h-3" />
              <span className="text-[10px] font-semibold">RECONNECTING</span>
            </div>
          )}

          <div className="hidden lg:flex items-center gap-3 text-slate-400 text-[11px]">
            <span className="flex items-center gap-1">
              <Clock className="w-3 h-3 text-slate-500" />
              <span>{formatTime(status.lastTickTimestamp)}</span>
            </span>
            <span>Latency: <span className="text-emerald-400 font-semibold">{status.latencyMs} ms</span></span>
            <span>Source: <span className="text-slate-200 font-medium">{status.sourceName}</span></span>
          </div>
        </div>
      </div>

      {/* Action Controls */}
      <div className="flex items-center gap-2">
        {/* Command Palette Button */}
        <button
          onClick={() => {
            tradingStore.isCommandPaletteOpen = true;
            tradingStore.notify();
          }}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#131722] border border-slate-800 text-slate-300 hover:text-white hover:border-slate-700 transition-all text-xs font-medium"
          title="Open Command Palette (/ or Ctrl+K)"
        >
          <Command className="w-3.5 h-3.5 text-indigo-400" />
          <span className="hidden md:inline">Command</span>
          <kbd className="px-1.5 py-0.5 rounded-md bg-slate-800 text-[10px] text-slate-400 font-mono">
            /
          </kbd>
        </button>

        {/* Backtester Modal Button */}
        <button
          onClick={() => {
            tradingStore.isBacktestOpen = true;
            tradingStore.notify();
          }}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-600/10 border border-indigo-500/20 text-indigo-300 hover:bg-indigo-600/20 transition-all text-xs font-semibold"
          title="Run Strategy Backtest Engine"
        >
          <BarChart2 className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Backtest</span>
        </button>

        {/* Settings Drawer Button */}
        <button
          onClick={() => {
            tradingStore.isSettingsOpen = true;
            tradingStore.notify();
          }}
          className="p-2 rounded-xl bg-[#131722] border border-slate-800 text-slate-400 hover:text-white hover:border-slate-700 transition-all"
          title="Indicator Parameters"
        >
          <Sliders className="w-4 h-4" />
        </button>
      </div>
    </header>
  );
};
