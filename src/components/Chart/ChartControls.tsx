import React, { useEffect, useState } from 'react';
import { Timeframe } from '../../types/trading';
import { Layers, Maximize2, Sparkles, BarChart2, CandlestickChart, X, TrendingUp, Zap, Shield, EyeOff } from 'lucide-react';
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
  const chartType = tradingStore.chartType;

  const activeOverlayCount = Object.values(overlays).filter(Boolean).length;

  const quickPills: { label: string; key: keyof typeof overlays }[] = [
    { label: 'EMA', key: 'ema' },
    { label: 'VWAP', key: 'vwap' },
    { label: 'Bollinger', key: 'bollingerBands' },
    { label: 'Supertrend', key: 'supertrend' },
    { label: 'Order Blocks', key: 'orderBlocks' },
    { label: 'FVG', key: 'fvg' },
    { label: 'BOS/CHoCH', key: 'bos' },
  ];

  const technicalKeys: (keyof typeof overlays)[] = ['ema', 'vwap', 'bollingerBands', 'supertrend', 'pivotPoints', 'fibonacci', 'volume'];
  const smcKeys: (keyof typeof overlays)[] = ['orderBlocks', 'fvg', 'liquidity', 'bos', 'choch', 'supportResistance', 'sessionLevels'];
  const patternKeys: (keyof typeof overlays)[] = ['candlestickPatterns', 'chartPatterns'];

  const renderSection = (title: string, keys: (keyof typeof overlays)[]) => (
    <div className="space-y-1">
      <div className="text-[10px] text-indigo-400 font-bold px-2 py-1 uppercase tracking-wider border-b border-slate-800/80 mt-1 font-mono">
        {title}
      </div>
      {keys.map((key) => (
        <label
          key={key}
          className="flex items-center justify-between px-2.5 py-1.5 rounded-xl hover:bg-slate-800/60 cursor-pointer text-slate-300 transition-all text-[11px]"
        >
          <span className="capitalize font-medium">{key.replace(/([A-Z])/g, ' $1')}</span>
          <input
            type="checkbox"
            checked={overlays[key]}
            onChange={() => tradingStore.toggleOverlay(key)}
            className="accent-indigo-500 rounded-md w-3.5 h-3.5"
          />
        </label>
      ))}
    </div>
  );

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

      {/* Quick Indicator Toggles Toolbar */}
      <div className="hidden lg:flex items-center gap-1.5">
        <span className="text-[10px] font-mono text-slate-400 uppercase font-bold mr-1">Indicators:</span>
        {quickPills.map((p) => {
          const isActive = overlays[p.key];
          return (
            <button
              key={p.key}
              onClick={() => tradingStore.toggleOverlay(p.key)}
              className={`px-2.5 py-1 rounded-full text-[11px] font-mono font-bold transition-all border ${
                isActive
                  ? 'bg-indigo-500/20 text-indigo-300 border-indigo-500/50 shadow-sm'
                  : 'bg-[#131722] text-slate-400 hover:text-slate-200 border-slate-800/80'
              }`}
            >
              {isActive ? `✓ ${p.label}` : `+ ${p.label}`}
            </button>
          );
        })}

        {activeOverlayCount > 0 && (
          <button
            onClick={() => tradingStore.clearAllOverlays()}
            className="flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-mono font-bold bg-rose-500/10 text-rose-400 border border-rose-500/30 hover:bg-rose-500/20 transition-all"
            title="Clear all overlays for clean chart view"
          >
            <EyeOff className="w-3 h-3" />
            <span>Clear All</span>
          </button>
        )}
      </div>

      {/* Chart Type Selector & Overlay Toggles & Fullscreen */}
      <div className="flex items-center gap-2">
        {/* Chart Style Selector (Candlestick vs Heikin-Ashi) */}
        <div className="flex items-center p-0.5 rounded-full bg-[#131722] border border-slate-800">
          <button
            onClick={() => tradingStore.setChartType('candlestick')}
            className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-medium transition-all ${
              chartType === 'candlestick'
                ? 'bg-indigo-600 text-white shadow'
                : 'text-slate-400 hover:text-slate-200'
            }`}
            title="Standard Candlesticks"
          >
            <CandlestickChart className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Candles</span>
          </button>
          <button
            onClick={() => tradingStore.setChartType('heikinAshi')}
            className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-medium transition-all ${
              chartType === 'heikinAshi'
                ? 'bg-indigo-600 text-white shadow'
                : 'text-slate-400 hover:text-slate-200'
            }`}
            title="Smoothed Heikin-Ashi Candlesticks"
          >
            <BarChart2 className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Heikin-Ashi</span>
          </button>
        </div>

        {/* Overlay Dropdown Button */}
        <div className="relative">
          <button
            onClick={() => setShowOverlaysDropdown(!showOverlaysDropdown)}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-full border transition-all text-xs font-medium ${
              activeOverlayCount > 0
                ? 'bg-indigo-600/20 text-indigo-300 border-indigo-500/40 font-bold'
                : 'bg-[#131722] border-slate-800 text-slate-300 hover:text-white'
            }`}
          >
            <Layers className="w-3.5 h-3.5 text-indigo-400" />
            <span>Indicators ({activeOverlayCount})</span>
          </button>

          {showOverlaysDropdown && (
            <div className="absolute right-0 mt-2 w-72 bg-[#131722] border border-slate-700/80 rounded-2xl shadow-2xl p-3 z-50 text-xs space-y-2 font-sans max-h-96 overflow-y-auto">
              <div className="flex justify-between items-center text-[10px] text-slate-300 font-bold px-2 py-1 border-b border-slate-800/80">
                <span className="uppercase tracking-wider">Chart Indicators & SMC</span>
                {activeOverlayCount > 0 ? (
                  <button
                    onClick={() => tradingStore.clearAllOverlays()}
                    className="text-rose-400 hover:text-rose-300 font-bold underline"
                  >
                    Clear All
                  </button>
                ) : (
                  <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                )}
              </div>

              {renderSection('Technical Indicators', technicalKeys)}
              {renderSection('Smart Money Concepts (SMC)', smcKeys)}
              {renderSection('Pattern Recognition', patternKeys)}
            </div>
          )}
        </div>

        {/* Fullscreen Toggle */}
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
