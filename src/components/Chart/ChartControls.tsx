import React, { useEffect, useState } from 'react';
import { Timeframe } from '../../types/trading';
import { Layers, Maximize2 } from 'lucide-react';
import { tradingStore } from '../../store/tradingStore';

export const ChartControls: React.FC = () => {
  const [, setTick] = useState(0);
  const [showOverlaysDropdown, setShowOverlaysDropdown] = useState(false);

  useEffect(() => {
    return tradingStore.subscribe(() => setTick((t) => t + 1));
  }, []);

  const timeframes: Timeframe[] = ['1m', '3m', '5m', '15m', '30m', '1H', '4H', '1D', '1W'];
  const activeTf = tradingStore.selectedTimeframe;
  const overlays = tradingStore.overlayToggles;

  return (
    <div className="flex flex-wrap items-center justify-between gap-2 bg-[#0c0e14] px-4 py-2 border-b border-slate-800/80 text-xs select-none">
      {/* Timeframe Selector Pills */}
      <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none">
        {timeframes.map((tf) => (
          <button
            key={tf}
            onClick={() => tradingStore.selectTimeframe(tf)}
            className={`px-3 py-1 rounded-full text-[11px] font-bold font-mono transition-all ${
              activeTf === tf
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-500/20'
                : 'bg-[#131722] text-slate-400 hover:text-slate-200 border border-slate-800'
            }`}
          >
            {tf}
          </button>
        ))}
      </div>

      {/* Overlay Toggles & Fullscreen */}
      <div className="flex items-center gap-2">
        <div className="relative">
          <button
            onClick={() => setShowOverlaysDropdown(!showOverlaysDropdown)}
            className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#131722] border border-slate-800 text-slate-300 hover:text-white transition-all text-xs font-medium"
          >
            <Layers className="w-3.5 h-3.5 text-indigo-400" />
            <span>Overlays</span>
          </button>

          {showOverlaysDropdown && (
            <div className="absolute right-0 mt-2 w-52 bg-[#131722] border border-slate-700/80 rounded-2xl shadow-2xl p-3 z-50 text-xs space-y-1.5 font-sans">
              <div className="text-[10px] text-slate-400 font-bold px-2 py-0.5 uppercase tracking-wider border-b border-slate-800/80 mb-1">
                Overlays & Indicators
              </div>

              {Object.entries(overlays).map(([key, val]) => (
                <label
                  key={key}
                  className="flex items-center justify-between px-2.5 py-1.5 rounded-xl hover:bg-slate-800/60 cursor-pointer text-slate-300 transition-all text-[11px]"
                >
                  <span className="capitalize font-medium">{key.replace(/([A-Z])/g, ' $1')}</span>
                  <input
                    type="checkbox"
                    checked={val}
                    onChange={() => tradingStore.toggleOverlay(key as keyof typeof overlays)}
                    className="accent-indigo-500 rounded-md w-3.5 h-3.5"
                  />
                </label>
              ))}
            </div>
          )}
        </div>

        <button
          onClick={() => {
            if (!document.fullscreenElement) {
              document.documentElement.requestFullscreen();
            } else {
              document.exitFullscreen();
            }
          }}
          className="p-1.5 rounded-full bg-[#131722] border border-slate-800 text-slate-400 hover:text-white transition-all"
          title="Toggle Fullscreen"
        >
          <Maximize2 className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};
