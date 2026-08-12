import React, { useState } from 'react';
import { Clock, Globe2 } from 'lucide-react';

export const SessionPanel: React.FC = () => {
  const [timezone, setTimezone] = useState<'UTC' | 'EST' | 'GMT' | 'JST'>('UTC');

  const now = new Date();
  const currentHourUTC = now.getUTCHours();

  const sessions = [
    {
      name: 'ASIA',
      startHour: 0,
      endHour: 9,
      isActive: currentHourUTC >= 0 && currentHourUTC < 9,
      rangePips: 45,
    },
    {
      name: 'LONDON',
      startHour: 7,
      endHour: 16,
      isActive: currentHourUTC >= 7 && currentHourUTC < 16,
      rangePips: 82,
    },
    {
      name: 'NEW YORK',
      startHour: 13,
      endHour: 22,
      isActive: currentHourUTC >= 13 && currentHourUTC < 22,
      rangePips: 110,
    },
    {
      name: 'OVERLAP',
      startHour: 13,
      endHour: 16,
      isActive: currentHourUTC >= 13 && currentHourUTC < 16,
      rangePips: 140,
    },
  ];

  return (
    <div className="bg-[#0c0e14] border border-slate-800/80 rounded-2xl p-4 font-sans text-xs select-none space-y-3">
      <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
        <div className="flex items-center gap-2 font-extrabold text-slate-100 tracking-tight">
          <Clock className="w-4 h-4 text-indigo-400" />
          <span>GLOBAL TRADING SESSIONS</span>
        </div>

        <div className="flex items-center gap-1.5 bg-[#121622] border border-slate-800 rounded-full px-3 py-1 text-[10px] font-mono">
          <Globe2 className="w-3 h-3 text-slate-400" />
          <select
            value={timezone}
            onChange={(e) => setTimezone(e.target.value as any)}
            className="bg-transparent text-slate-200 focus:outline-none cursor-pointer"
          >
            <option value="UTC" className="bg-[#121622]">UTC</option>
            <option value="EST" className="bg-[#121622]">EST</option>
            <option value="GMT" className="bg-[#121622]">GMT</option>
            <option value="JST" className="bg-[#121622]">JST</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-[11px] font-mono">
        {sessions.map((s) => (
          <div
            key={s.name}
            className={`p-3 rounded-xl border transition-all ${
              s.isActive
                ? 'bg-emerald-500/10 border-emerald-500/30 text-slate-100 shadow-sm'
                : 'bg-[#121622] border-slate-800/80 text-slate-400'
            }`}
          >
            <div className="flex justify-between items-center font-bold font-sans mb-1.5 text-xs">
              <span>{s.name}</span>
              <span
                className={`w-2 h-2 rounded-full ${
                  s.isActive ? 'bg-emerald-400 animate-pulse' : 'bg-slate-700'
                }`}
              />
            </div>
            <div className="text-[10px] space-y-0.5">
              <div>Range: <strong className="text-slate-200">{s.rangePips} pips</strong></div>
              <div>State: <strong className={s.isActive ? 'text-emerald-400' : 'text-slate-500'}>{s.isActive ? 'ACTIVE' : 'CLOSED'}</strong></div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
