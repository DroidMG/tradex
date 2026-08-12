import React, { useState } from 'react';
import { History } from 'lucide-react';
import { SignalHistoryItem } from '../types/trading';
import { formatPrice } from '../utils/formatters';

const INITIAL_SIGNAL_LOGS: SignalHistoryItem[] = [
  {
    id: 'sig-1',
    time: '19:22:31',
    symbol: 'BTC/USD',
    direction: 'LONG',
    timeframe: '15m',
    entry: 118120.00,
    score: 84,
    reason: 'BOS + FVG + VWAP',
    result: 'OPEN',
  },
  {
    id: 'sig-2',
    time: '18:47:12',
    symbol: 'XAU/USD',
    direction: 'SHORT',
    timeframe: '1H',
    entry: 3424.10,
    score: 79,
    reason: 'OB + Liquidity Sweep',
    result: '+1.8R',
  },
  {
    id: 'sig-3',
    time: '17:15:04',
    symbol: 'EUR/USD',
    direction: 'LONG',
    timeframe: '5m',
    entry: 1.16680,
    score: 81,
    reason: 'CHoCH + Discount Retest',
    result: '+2.5R',
  },
  {
    id: 'sig-4',
    time: '15:30:22',
    symbol: 'US100',
    direction: 'SHORT',
    timeframe: '15m',
    entry: 23510.00,
    score: 76,
    reason: 'Bearish FVG + ADX Expansion',
    result: '-1.0R',
  },
];

export const SignalHistoryTable: React.FC = () => {
  const [logs] = useState<SignalHistoryItem[]>(INITIAL_SIGNAL_LOGS);

  return (
    <div className="bg-[#0c0e14] border border-slate-800/80 rounded-2xl p-4 font-sans text-xs select-none space-y-3">
      <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
        <div className="flex items-center gap-2 font-extrabold text-slate-100 tracking-tight">
          <History className="w-4 h-4 text-indigo-400" />
          <span>HISTORICAL SIGNAL AUDIT LOG</span>
        </div>
        <span className="text-[10px] font-bold font-mono text-slate-400">REAL-TIME SIGNAL TRACKING</span>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse font-mono text-[11px]">
          <thead>
            <tr className="text-slate-400 text-[10px] uppercase font-bold font-sans border-b border-slate-800/80">
              <th className="py-2 px-2">Time</th>
              <th className="py-2 px-2">Asset</th>
              <th className="py-2 px-2">Dir</th>
              <th className="py-2 px-2">TF</th>
              <th className="py-2 px-2">Entry</th>
              <th className="py-2 px-2">Score</th>
              <th className="py-2 px-2">Confluence Drivers</th>
              <th className="py-2 px-2 text-right">Result</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/40">
            {logs.map((log) => (
              <tr key={log.id} className="hover:bg-[#121622] transition-colors">
                <td className="py-2.5 px-2 text-slate-400">{log.time}</td>
                <td className="py-2.5 px-2 font-bold text-white">{log.symbol}</td>
                <td className="py-2.5 px-2">
                  <span
                    className={`font-bold px-2 py-0.5 rounded-full text-[10px] ${
                      log.direction === 'LONG'
                        ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                        : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                    }`}
                  >
                    {log.direction}
                  </span>
                </td>
                <td className="py-2.5 px-2 text-slate-300">{log.timeframe}</td>
                <td className="py-2.5 px-2 text-slate-200">{formatPrice(log.entry)}</td>
                <td className="py-2.5 px-2 font-bold text-indigo-400">{log.score}</td>
                <td className="py-2.5 px-2 text-slate-300 font-sans">{log.reason}</td>
                <td className="py-2.5 px-2 text-right font-bold">
                  <span
                    className={
                      log.result.includes('+')
                        ? 'text-emerald-400'
                        : log.result.includes('-')
                        ? 'text-rose-400'
                        : 'text-amber-400 animate-pulse'
                    }
                  >
                    {log.result}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
