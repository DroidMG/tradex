import React, { useState } from 'react';
import { Globe, AlertTriangle, Calendar } from 'lucide-react';
import { INITIAL_MACRO_EVENTS } from '../data/newsData';
import { formatTime } from '../utils/formatters';

export const MacroNewsPanel: React.FC = () => {
  const [events] = useState(INITIAL_MACRO_EVENTS);

  // Overall Event Risk assessment
  const hasHighImpactSoon = events.some((e) => e.impact === 'HIGH' && e.timestamp > Date.now());
  const eventRiskLevel = hasHighImpactSoon ? 'HIGH' : 'MEDIUM';

  return (
    <div className="bg-[#0c0e14] border border-slate-800/80 rounded-2xl p-4 font-sans text-xs select-none space-y-3">
      <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
        <div className="flex items-center gap-2 font-extrabold text-slate-100 tracking-tight">
          <Globe className="w-4 h-4 text-indigo-400" />
          <span>MACROECONOMIC & FUNDAMENTAL CALENDAR</span>
        </div>
        <div
          className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold font-mono border ${
            eventRiskLevel === 'HIGH'
              ? 'bg-rose-500/10 text-rose-400 border-rose-500/20'
              : 'bg-amber-500/10 text-amber-400 border-amber-500/20'
          }`}
        >
          <AlertTriangle className="w-3 h-3" />
          <span>EVENT RISK: {eventRiskLevel}</span>
        </div>
      </div>

      <div className="space-y-2 max-h-52 overflow-y-auto pr-1 font-mono">
        {events.map((evt) => (
          <div
            key={evt.id}
            className="p-3 rounded-xl bg-[#121622] border border-slate-800/80 hover:border-slate-700 transition-colors space-y-1.5"
          >
            <div className="flex justify-between items-start gap-2">
              <span className="font-bold text-slate-100 font-sans text-xs">{evt.title}</span>
              <span
                className={`text-[9px] font-bold px-2 py-0.5 rounded-full ${
                  evt.impact === 'HIGH'
                    ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                    : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                }`}
              >
                {evt.impact} IMPACT
              </span>
            </div>

            <div className="flex flex-wrap justify-between items-center text-[10px] text-slate-400 pt-0.5 font-mono">
              <span className="flex items-center gap-1">
                <Calendar className="w-3 h-3 text-slate-500" />
                <span>{formatTime(evt.timestamp)}</span>
                <span className="text-slate-500">({evt.currency})</span>
              </span>
              <div className="flex items-center gap-3">
                {evt.forecast && <span>FCST: <strong className="text-slate-200">{evt.forecast}</strong></span>}
                {evt.previous && <span>PREV: <strong className="text-slate-200">{evt.previous}</strong></span>}
                {evt.actual && <span>ACTUAL: <strong className="text-emerald-400">{evt.actual}</strong></span>}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
