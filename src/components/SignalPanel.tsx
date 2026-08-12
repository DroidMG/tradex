import React, { useEffect, useState } from 'react';
import { CheckCircle2, AlertTriangle, ShieldCheck, Target } from 'lucide-react';
import { tradingStore } from '../store/tradingStore';
import { formatPrice } from '../utils/formatters';

export const SignalPanel: React.FC = () => {
  const [, setTick] = useState(0);

  useEffect(() => {
    return tradingStore.subscribe(() => setTick((t) => t + 1));
  }, []);

  const signal = tradingStore.currentSignal;
  const setup = signal?.setup;

  if (!signal) return null;

  const isBull = signal.direction === 'BULLISH BIAS';
  const isBear = signal.direction === 'BEARISH BIAS';

  return (
    <div className="bg-[#0c0e14] border border-slate-800/80 rounded-2xl p-4 font-sans text-xs select-none space-y-3.5">
      {/* Header & Composite Bias Output */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800/80 pb-3">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-indigo-400" />
          <span className="font-bold text-slate-100 tracking-wide font-sans">QUANT CONFLUENCE SIGNAL ENGINE</span>
        </div>

        <div
          className={`flex items-center gap-2 px-3 py-1 rounded-full text-xs font-extrabold font-mono border ${
            isBull
              ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
              : isBear
              ? 'bg-rose-500/10 text-rose-400 border-rose-500/20'
              : 'bg-slate-800 text-slate-300 border-slate-700'
          }`}
        >
          <span>{signal.direction}</span>
          <span>{signal.confidence}/100</span>
        </div>
      </div>

      {/* Scoring Matrix Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2 text-[11px] font-mono bg-[#121622] p-3 rounded-xl border border-slate-800/80">
        <div>
          <span className="text-slate-400 font-sans text-[10px] block font-medium">TECHNICAL</span>
          <span className="font-bold text-slate-100">{signal.scores.technicalScore}</span>
        </div>
        <div>
          <span className="text-slate-400 font-sans text-[10px] block font-medium">STRUCTURE</span>
          <span className="font-bold text-slate-100">{signal.scores.marketStructureScore}</span>
        </div>
        <div>
          <span className="text-slate-400 font-sans text-[10px] block font-medium">MOMENTUM</span>
          <span className="font-bold text-slate-100">{signal.scores.momentumScore}</span>
        </div>
        <div>
          <span className="text-slate-400 font-sans text-[10px] block font-medium">VOLUME</span>
          <span className="font-bold text-slate-100">{signal.scores.volumeScore}</span>
        </div>
        <div>
          <span className="text-slate-400 font-sans text-[10px] block font-medium">SMC CONFLUENCE</span>
          <span className="font-bold text-slate-100">{signal.scores.smcConfluenceScore}</span>
        </div>
        <div>
          <span className="text-slate-400 font-sans text-[10px] block font-medium">COMPOSITE</span>
          <span className="font-bold text-indigo-400">{signal.scores.compositeScore}</span>
        </div>
      </div>

      {/* Trade Setup Scenario Card */}
      {setup && setup.direction !== 'NO_TRADE' ? (
        <div className="bg-[#121622] border border-indigo-500/20 rounded-2xl p-4 space-y-3.5">
          <div className="flex items-center justify-between border-b border-slate-800/80 pb-2">
            <div className="flex items-center gap-2">
              <Target className="w-4 h-4 text-emerald-400" />
              <span className="font-extrabold text-white text-sm tracking-tight">{setup.symbol} {setup.direction} SETUP</span>
            </div>
            <span className="text-xs font-semibold px-3 py-1 rounded-full bg-indigo-500/10 text-indigo-300 border border-indigo-500/20 font-mono">
              R:R 1 : {setup.riskRewardRatio} | Quality: {setup.historicalQuality}/100
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-xs font-mono">
            <div className="bg-[#0c0e14] p-2.5 rounded-xl border border-slate-800/80">
              <span className="text-slate-400 block text-[10px] font-sans font-medium">ENTRY ZONE</span>
              <span className="font-bold text-slate-100">{formatPrice(setup.entryMin)} - {formatPrice(setup.entryMax)}</span>
            </div>
            <div className="bg-[#0c0e14] p-2.5 rounded-xl border border-slate-800/80">
              <span className="text-slate-400 block text-[10px] font-sans font-medium">STOP LOSS</span>
              <span className="font-bold text-rose-400">{formatPrice(setup.stopLoss)}</span>
            </div>
            <div className="bg-[#0c0e14] p-2.5 rounded-xl border border-slate-800/80">
              <span className="text-slate-400 block text-[10px] font-sans font-medium">TAKE PROFIT 1</span>
              <span className="font-bold text-emerald-400">{formatPrice(setup.tp1)}</span>
            </div>
            <div className="bg-[#0c0e14] p-2.5 rounded-xl border border-slate-800/80">
              <span className="text-slate-400 block text-[10px] font-sans font-medium">TAKE PROFIT 2</span>
              <span className="font-bold text-emerald-300">{formatPrice(setup.tp2)}</span>
            </div>
          </div>

          {/* Explainability Checkmarked Reasons */}
          <div className="space-y-1.5 pt-1">
            <span className="text-[11px] font-bold text-slate-400 block uppercase font-sans tracking-wider">Confluence Drivers & Reasons:</span>
            {setup.reasons.map((r, i) => (
              <div key={i} className="flex items-start gap-2 text-xs text-slate-200">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                <span>{r.text}</span>
              </div>
            ))}
          </div>

          {/* Risks / Invalidation */}
          {setup.risks.length > 0 && (
            <div className="space-y-1 border-t border-slate-800/80 pt-2.5 text-[11px]">
              <span className="font-bold text-amber-400 block uppercase font-sans tracking-wider">Invalidation Risks:</span>
              {setup.risks.map((rk, i) => (
                <div key={i} className="flex items-center gap-2 text-amber-300/90">
                  <AlertTriangle className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                  <span>{rk}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      ) : (
        <div className="bg-[#121622] p-4 rounded-2xl border border-slate-800/80 text-slate-400 text-center font-medium">
          <span>NO CLEAR EDGE DETECTED — Capital preservation mode recommended.</span>
        </div>
      )}
    </div>
  );
};
