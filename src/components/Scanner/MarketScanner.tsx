import React, { useState } from 'react';
import {
  Scan,
  Plus,
  Trash2,
  Bell,
  Sparkles,
  Zap,
  TrendingUp,
  Sliders,
  CheckCircle2,
  AlertTriangle,
} from 'lucide-react';
import { tradingStore } from '../../store/tradingStore';
import { IntelligenceService } from '../../services/intelligenceService';

export const MarketScanner: React.FC = () => {
  const [newSymbol, setNewSymbol] = useState('BTC/USD');
  const [newMetric, setNewMetric] = useState('Price');
  const [newCondition, setNewCondition] = useState('Above');
  const [newThreshold, setNewThreshold] = useState('98000');
  const [newChannel, setNewChannel] = useState<'In-App' | 'Telegram' | 'Email' | 'Webhook'>('In-App');

  const opportunities = IntelligenceService.getOpportunities();
  const alertRules = tradingStore.customAlertRules;

  const handleCreateAlert = (e: React.FormEvent) => {
    e.preventDefault();
    tradingStore.addAlertRule({
      symbol: newSymbol,
      metric: newMetric,
      condition: newCondition,
      threshold: newThreshold,
      channel: newChannel,
    });
  };

  return (
    <div className="space-y-4 p-3 sm:p-4 max-w-[1920px] mx-auto text-slate-200">
      {/* Top Banner */}
      <div className="bg-slate-900/90 border border-slate-800/90 rounded-2xl p-4 shadow-md flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/30 flex items-center justify-center text-purple-400">
            <Scan className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-white flex items-center gap-2">
              Market Scanner & Custom Alert Intelligence Engine
            </h1>
            <p className="text-xs text-slate-400">
              Discover real-time technical setups, volume spikes, and configure instant multi-channel alert rules.
            </p>
          </div>
        </div>
      </div>

      {/* Grid: Opportunities Stream & Custom Alert Creator */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Real-time Opportunities */}
        <div className="bg-slate-900/90 border border-slate-800/90 rounded-2xl p-4 shadow-lg space-y-3">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-amber-400" />
            <span>Real-time Opportunity Alerts</span>
          </h3>

          <div className="space-y-2.5">
            {opportunities.map((opp) => (
              <div
                key={opp.id}
                className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 hover:border-purple-500/40 transition-colors space-y-1.5 text-xs"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-extrabold text-white text-sm">{opp.symbol}</span>
                    <span className="text-[10px] bg-purple-950 text-purple-300 border border-purple-800 px-2 py-0.5 rounded font-bold">
                      {opp.type}
                    </span>
                  </div>
                  <span className="text-xs font-black text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/30">
                    Score: {opp.score}/100
                  </span>
                </div>

                <h4 className="font-bold text-slate-200">{opp.title}</h4>
                <p className="text-[11px] text-slate-400 leading-relaxed">{opp.reasoning}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Custom Alert Rule Creator */}
        <div className="bg-slate-900/90 border border-slate-800/90 rounded-2xl p-4 shadow-lg space-y-4">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <Bell className="w-4 h-4 text-cyan-400" />
            <span>Create Custom Alert Rule</span>
          </h3>

          <form onSubmit={handleCreateAlert} className="space-y-3 text-xs">
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-slate-400 block mb-1 font-semibold">Target Asset</label>
                <select
                  value={newSymbol}
                  onChange={(e) => setNewSymbol(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2 text-white focus:outline-none"
                >
                  {tradingStore.assets.map((a) => (
                    <option key={a.id} value={a.symbol}>
                      {a.symbol} ({a.name})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-slate-400 block mb-1 font-semibold">Metric</label>
                <select
                  value={newMetric}
                  onChange={(e) => setNewMetric(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2 text-white focus:outline-none"
                >
                  <option value="Price">Price ($)</option>
                  <option value="RSI 14">RSI (14)</option>
                  <option value="Funding Rate">Funding Rate (%)</option>
                  <option value="Open Interest">Open Interest ($)</option>
                  <option value="SMC BOS">SMC Structure BOS/CHoCH</option>
                  <option value="Whale Inflow">Whale Exchange Inflow</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-slate-400 block mb-1 font-semibold">Condition</label>
                <select
                  value={newCondition}
                  onChange={(e) => setNewCondition(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2 text-white focus:outline-none"
                >
                  <option value="Above">Crosses Above (&gt;)</option>
                  <option value="Below">Crosses Below (&lt;)</option>
                  <option value="Spike 5%">Spikes &gt; 5% in 15m</option>
                  <option value="Trigger">Structure Confirmed</option>
                </select>
              </div>

              <div>
                <label className="text-slate-400 block mb-1 font-semibold">Threshold Value</label>
                <input
                  type="text"
                  value={newThreshold}
                  onChange={(e) => setNewThreshold(e.target.value)}
                  placeholder="e.g. 98000"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2 text-white focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="text-slate-400 block mb-1 font-semibold">Delivery Channel</label>
              <div className="grid grid-cols-4 gap-2">
                {(['In-App', 'Telegram', 'Email', 'Webhook'] as const).map((ch) => (
                  <button
                    key={ch}
                    type="button"
                    onClick={() => setNewChannel(ch)}
                    className={`py-1.5 rounded-xl text-xs font-bold transition-all ${
                      newChannel === ch
                        ? 'bg-cyan-600 text-white shadow-md'
                        : 'bg-slate-950 text-slate-400 border border-slate-800 hover:text-slate-200'
                    }`}
                  >
                    {ch}
                  </button>
                ))}
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs shadow-md transition-all cursor-pointer flex items-center justify-center gap-2"
            >
              <Plus className="w-4 h-4" /> Save Active Alert Rule
            </button>
          </form>

          {/* Active Custom Rules List */}
          <div className="pt-3 border-t border-slate-800/80 space-y-2">
            <h4 className="text-xs font-bold text-slate-300">Active Alert Rules ({alertRules.length})</h4>

            {alertRules.length === 0 ? (
              <p className="text-xs text-slate-500 italic">No custom rules set yet. Use form above to create one.</p>
            ) : (
              <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                {alertRules.map((rule) => (
                  <div
                    key={rule.id}
                    className="p-2.5 rounded-xl bg-slate-950/80 border border-slate-800 flex items-center justify-between text-xs"
                  >
                    <div>
                      <span className="font-bold text-white">{rule.symbol}</span> —{' '}
                      <span className="text-cyan-300">{rule.metric}</span> {rule.condition} {rule.threshold}
                      <span className="text-[10px] text-slate-500 block">Channel: {rule.channel}</span>
                    </div>

                    <button
                      onClick={() => tradingStore.deleteAlertRule(rule.id)}
                      className="p-1 text-slate-500 hover:text-rose-400 transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
