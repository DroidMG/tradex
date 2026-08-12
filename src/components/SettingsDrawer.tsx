import React, { useState } from 'react';
import { X, Sliders, Save, RotateCcw } from 'lucide-react';
import { tradingStore, DEFAULT_INDICATOR_CONFIG } from '../store/tradingStore';

export const SettingsDrawer: React.FC = () => {
  const [config, setConfig] = useState(tradingStore.indicatorConfig);

  if (!tradingStore.isSettingsOpen) return null;

  const handleSave = () => {
    tradingStore.updateIndicatorConfig(config);
    tradingStore.isSettingsOpen = false;
    tradingStore.notify();
  };

  const handleReset = () => {
    setConfig({ ...DEFAULT_INDICATOR_CONFIG });
  };

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex justify-end z-50 font-sans text-xs select-none">
      <div className="bg-[#0c0e14] border-l border-slate-800/80 w-full max-w-md h-full flex flex-col p-5 space-y-4 shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800/80 pb-4">
          <div className="flex items-center gap-2 text-slate-100 font-extrabold text-sm tracking-tight">
            <Sliders className="w-4 h-4 text-indigo-400" />
            <span>INDICATOR PARAMETERS</span>
          </div>

          <button
            onClick={() => {
              tradingStore.isSettingsOpen = false;
              tradingStore.notify();
            }}
            className="p-1.5 rounded-full bg-[#121622] border border-slate-800 text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Inputs */}
        <div className="flex-1 overflow-y-auto space-y-3 pr-1 font-mono">
          <div className="space-y-1.5 bg-[#121622] p-3 rounded-2xl border border-slate-800/80">
            <label className="text-[10px] text-slate-400 font-bold block font-sans">RSI LENGTH</label>
            <input
              type="number"
              value={config.rsiLength}
              onChange={(e) => setConfig({ ...config, rsiLength: parseInt(e.target.value) || 14 })}
              className="w-full bg-[#0c0e14] border border-slate-800 rounded-xl px-3 py-2 text-slate-200 focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div className="space-y-1.5 bg-[#121622] p-3 rounded-2xl border border-slate-800/80">
            <label className="text-[10px] text-slate-400 font-bold block font-sans">EMA LENGTHS (comma separated)</label>
            <input
              type="text"
              value={config.emaLengths.join(', ')}
              onChange={(e) =>
                setConfig({
                  ...config,
                  emaLengths: e.target.value.split(',').map((v) => parseInt(v.trim())).filter((v) => !isNaN(v)),
                })
              }
              className="w-full bg-[#0c0e14] border border-slate-800 rounded-xl px-3 py-2 text-slate-200 focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div className="space-y-1.5 bg-[#121622] p-3 rounded-2xl border border-slate-800/80">
            <label className="text-[10px] text-slate-400 font-bold block font-sans">ATR LENGTH</label>
            <input
              type="number"
              value={config.atrLength}
              onChange={(e) => setConfig({ ...config, atrLength: parseInt(e.target.value) || 14 })}
              className="w-full bg-[#0c0e14] border border-slate-800 rounded-xl px-3 py-2 text-slate-200 focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div className="space-y-1.5 bg-[#121622] p-3 rounded-2xl border border-slate-800/80">
            <label className="text-[10px] text-slate-400 font-bold block font-sans">ADX LENGTH</label>
            <input
              type="number"
              value={config.adxLength}
              onChange={(e) => setConfig({ ...config, adxLength: parseInt(e.target.value) || 14 })}
              className="w-full bg-[#0c0e14] border border-slate-800 rounded-xl px-3 py-2 text-slate-200 focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div className="space-y-1.5 bg-[#121622] p-3 rounded-2xl border border-slate-800/80">
            <label className="text-[10px] text-slate-400 font-bold block font-sans">SUPERTREND MULTIPLIER</label>
            <input
              type="number"
              step="0.1"
              value={config.supertrendMultiplier}
              onChange={(e) => setConfig({ ...config, supertrendMultiplier: parseFloat(e.target.value) || 3.0 })}
              className="w-full bg-[#0c0e14] border border-slate-800 rounded-xl px-3 py-2 text-slate-200 focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div className="space-y-1.5 bg-[#121622] p-3 rounded-2xl border border-slate-800/80">
            <label className="text-[10px] text-slate-400 font-bold block font-sans">SWING DETECTION LOOKBACK</label>
            <input
              type="number"
              value={config.swingLength}
              onChange={(e) => setConfig({ ...config, swingLength: parseInt(e.target.value) || 5 })}
              className="w-full bg-[#0c0e14] border border-slate-800 rounded-xl px-3 py-2 text-slate-200 focus:outline-none focus:border-indigo-500"
            />
          </div>
        </div>

        {/* Buttons */}
        <div className="flex gap-2.5 pt-3 border-t border-slate-800/80 font-sans">
          <button
            onClick={handleReset}
            className="flex-1 flex items-center justify-center gap-1.5 bg-[#121622] hover:bg-slate-800/80 text-slate-300 font-bold py-2.5 px-3 rounded-xl border border-slate-800 transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Defaults</span>
          </button>
          <button
            onClick={handleSave}
            className="flex-1 flex items-center justify-center gap-1.5 bg-indigo-600 hover:bg-indigo-500 text-white font-extrabold py-2.5 px-3 rounded-xl transition-all shadow-md hover:shadow-indigo-500/25 active:scale-95"
          >
            <Save className="w-3.5 h-3.5" />
            <span>Save & Apply</span>
          </button>
        </div>
      </div>
    </div>
  );
};
