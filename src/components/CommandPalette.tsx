import React, { useEffect, useState } from 'react';
import { Command, Search, X } from 'lucide-react';
import { tradingStore } from '../store/tradingStore';

export const CommandPalette: React.FC = () => {
  const [query, setQuery] = useState('');

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return;
      }

      if (e.key === '/') {
        e.preventDefault();
        tradingStore.isCommandPaletteOpen = true;
        tradingStore.notify();
      } else if (e.key === '1') {
        tradingStore.selectTimeframe('1m');
      } else if (e.key === '2') {
        tradingStore.selectTimeframe('5m');
      } else if (e.key === '3') {
        tradingStore.selectTimeframe('15m');
      } else if (e.key === '4') {
        tradingStore.selectTimeframe('1H');
      } else if (e.key === '5') {
        tradingStore.selectTimeframe('4H');
      } else if (e.key.toLowerCase() === 'f') {
        if (!document.fullscreenElement) {
          document.documentElement.requestFullscreen();
        } else {
          document.exitFullscreen();
        }
      } else if (e.key.toLowerCase() === 't') {
        tradingStore.setTheme(tradingStore.theme === 'dark' ? 'light' : 'dark');
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  if (!tradingStore.isCommandPaletteOpen) return null;

  const matches = tradingStore.assets.filter(
    (a) =>
      a.symbol.toLowerCase().includes(query.toLowerCase()) ||
      a.name.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-start justify-center pt-20 p-4 z-50 font-sans text-xs select-none">
      <div className="bg-[#0c0e14] border border-slate-800/80 rounded-3xl max-w-xl w-full p-5 space-y-4 shadow-2xl">
        <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
          <div className="flex items-center gap-2 text-slate-100 font-extrabold text-sm tracking-tight">
            <Command className="w-4 h-4 text-indigo-400" />
            <span>COMMAND PALETTE & QUICK SEARCH</span>
          </div>

          <button
            onClick={() => {
              tradingStore.isCommandPaletteOpen = false;
              tradingStore.notify();
            }}
            className="p-1.5 rounded-full bg-[#121622] border border-slate-800 text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Search Input */}
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3.5 top-3.5 text-slate-400" />
          <input
            type="text"
            autoFocus
            placeholder="Type symbol name or code..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full bg-[#121622] border border-slate-800/80 rounded-2xl pl-10 pr-4 py-3 text-slate-100 font-mono text-xs placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-colors"
          />
        </div>

        {/* Results */}
        <div className="max-h-60 overflow-y-auto space-y-1 font-mono pr-1">
          {matches.map((asset) => (
            <div
              key={asset.symbol}
              onClick={() => {
                tradingStore.selectSymbol(asset.symbol);
                tradingStore.isCommandPaletteOpen = false;
                tradingStore.notify();
              }}
              className="p-3 hover:bg-[#121622] cursor-pointer flex justify-between items-center rounded-xl text-slate-200 border border-transparent hover:border-slate-800/80 transition-all"
            >
              <div>
                <span className="font-bold mr-2 text-white">{asset.symbol}</span>
                <span className="text-slate-400 font-sans text-xs">{asset.name}</span>
              </div>
              <span className="text-[10px] px-2.5 py-1 rounded-full bg-slate-800/80 font-sans text-slate-300 font-bold uppercase">
                {asset.category}
              </span>
            </div>
          ))}
        </div>

        {/* Keyboard Shortcuts Reference */}
        <div className="border-t border-slate-800/80 pt-3 grid grid-cols-2 sm:grid-cols-4 gap-2 text-[10px] text-slate-400 font-mono">
          <div><kbd className="px-1.5 py-0.5 bg-slate-800/80 rounded-md text-slate-300 border border-slate-700/50">/</kbd> Open Search</div>
          <div><kbd className="px-1.5 py-0.5 bg-slate-800/80 rounded-md text-slate-300 border border-slate-700/50">1-5</kbd> Switch TF</div>
          <div><kbd className="px-1.5 py-0.5 bg-slate-800/80 rounded-md text-slate-300 border border-slate-700/50">F</kbd> Fullscreen</div>
          <div><kbd className="px-1.5 py-0.5 bg-slate-800/80 rounded-md text-slate-300 border border-slate-700/50">ESC</kbd> Close</div>
        </div>
      </div>
    </div>
  );
};
