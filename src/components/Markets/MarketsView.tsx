import React, { useState } from 'react';
import {
  Search,
  Star,
  TrendingUp,
  TrendingDown,
  Layers,
  ArrowUpDown,
  LineChart,
  ShieldAlert,
  Sparkles,
  Filter,
} from 'lucide-react';
import { tradingStore } from '../../store/tradingStore';
import { Asset, SectorType } from '../../types/trading';

export const MarketsView: React.FC = () => {
  const [selectedSector, setSelectedSector] = useState<SectorType | 'ALL'>('ALL');
  const [search, setSearch] = useState('');
  const [sortField, setSortField] = useState<keyof Asset>('rank');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc');

  const assets = tradingStore.assets;

  const sectors: (SectorType | 'ALL')[] = [
    'ALL',
    'Layer 1',
    'Layer 2',
    'AI & Data',
    'DeFi',
    'RWA',
    'Memes',
    'Exchange Tokens',
    'Forex & Macro',
  ];

  const filteredAssets = assets
    .filter((a) => {
      const matchSearch =
        a.name.toLowerCase().includes(search.toLowerCase()) ||
        a.symbol.toLowerCase().includes(search.toLowerCase());
      const matchSector = selectedSector === 'ALL' || a.sector === selectedSector;
      return matchSearch && matchSector;
    })
    .sort((a, b) => {
      const valA = (a[sortField] as any) ?? 0;
      const valB = (b[sortField] as any) ?? 0;
      if (sortDir === 'asc') return valA > valB ? 1 : -1;
      return valA < valB ? 1 : -1;
    });

  const handleSort = (field: keyof Asset) => {
    if (sortField === field) {
      setSortDir(sortDir === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDir('desc');
    }
  };

  return (
    <div className="space-y-4 p-3 sm:p-4 max-w-[1920px] mx-auto text-slate-200">
      {/* Search & Sector Bar */}
      <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3 bg-slate-900/80 border border-slate-800/90 rounded-2xl p-4 shadow-md">
        <div className="flex items-center gap-2 bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 w-full lg:w-96">
          <Search className="w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search symbol, coin name, or sector..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="bg-transparent text-xs text-slate-200 placeholder-slate-500 focus:outline-none w-full"
          />
        </div>

        {/* Sector Filter Chips */}
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-1">
          {sectors.map((sec) => (
            <button
              key={sec}
              onClick={() => setSelectedSector(sec)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                selectedSector === sec
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-xs'
                  : 'bg-slate-950/80 text-slate-400 border border-slate-800/80 hover:text-slate-200 hover:bg-slate-800/50'
              }`}
            >
              {sec}
            </button>
          ))}
        </div>
      </div>

      {/* Markets Data Table */}
      <div className="bg-slate-900/90 border border-slate-800/90 rounded-2xl overflow-hidden shadow-lg">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-950/80 border-b border-slate-800 text-slate-400 font-bold uppercase tracking-wider">
              <tr>
                <th className="p-3 w-8"></th>
                <th
                  onClick={() => handleSort('rank')}
                  className="p-3 cursor-pointer hover:text-white"
                >
                  <div className="flex items-center gap-1">
                    <span>#</span>
                    <ArrowUpDown className="w-3 h-3" />
                  </div>
                </th>
                <th
                  onClick={() => handleSort('name')}
                  className="p-3 cursor-pointer hover:text-white"
                >
                  Asset
                </th>
                <th className="p-3">Sector</th>
                <th className="p-3 text-right">Price</th>
                <th
                  onClick={() => handleSort('change7d')}
                  className="p-3 text-right cursor-pointer hover:text-white"
                >
                  7d Change
                </th>
                <th
                  onClick={() => handleSort('marketCap')}
                  className="p-3 text-right cursor-pointer hover:text-white"
                >
                  Market Cap
                </th>
                <th
                  onClick={() => handleSort('volume24h')}
                  className="p-3 text-right cursor-pointer hover:text-white"
                >
                  24h Volume
                </th>
                <th className="p-3 text-center">Liquidity</th>
                <th className="p-3 text-right">ATH Distance</th>
                <th className="p-3 text-center">Action</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-800/60 font-medium">
              {filteredAssets.map((asset) => {
                const tick = tradingStore.ticks.get(asset.symbol);
                const price = tick?.last ?? asset.ath ?? 100;
                const change7d = asset.change7d ?? 0;

                return (
                  <tr
                    key={asset.id}
                    className="hover:bg-slate-800/40 transition-colors group cursor-pointer"
                  >
                    <td className="p-3 text-center">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          tradingStore.toggleFavorite(asset.symbol);
                        }}
                        className="text-slate-600 hover:text-amber-400"
                      >
                        <Star
                          className={`w-3.5 h-3.5 ${
                            asset.isFavorite ? 'text-amber-400 fill-amber-400' : ''
                          }`}
                        />
                      </button>
                    </td>

                    <td className="p-3 font-bold text-slate-500">{asset.rank || '-'}</td>

                    <td
                      onClick={() => {
                        tradingStore.selectSymbol(asset.symbol);
                        tradingStore.setActiveTab('chart');
                      }}
                      className="p-3"
                    >
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-lg bg-slate-800 border border-slate-700 flex items-center justify-center font-black text-[11px] text-cyan-300">
                          {asset.baseSymbol.slice(0, 3)}
                        </div>
                        <div>
                          <div className="font-bold text-white group-hover:text-cyan-300 transition-colors">
                            {asset.name}
                          </div>
                          <span className="text-[10px] text-slate-500">{asset.symbol}</span>
                        </div>
                      </div>
                    </td>

                    <td className="p-3">
                      <span className="text-[10px] font-semibold bg-slate-950 text-slate-300 px-2 py-0.5 rounded border border-slate-800">
                        {asset.sector || 'Crypto'}
                      </span>
                    </td>

                    <td className="p-3 text-right font-bold text-white">
                      ${price >= 1 ? price.toLocaleString('en-US', { minimumFractionDigits: 2 }) : price.toFixed(5)}
                    </td>

                    <td className="p-3 text-right font-bold">
                      <span
                        className={`inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[11px] ${
                          change7d >= 0
                            ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                            : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                        }`}
                      >
                        {change7d >= 0 ? '+' : ''}
                        {change7d}%
                      </span>
                    </td>

                    <td className="p-3 text-right font-semibold text-slate-200">
                      {asset.marketCap ? `$${(asset.marketCap / 1e9).toFixed(2)}B` : 'N/A'}
                    </td>

                    <td className="p-3 text-right font-semibold text-slate-300">
                      {asset.volume24h ? `$${(asset.volume24h / 1e6).toFixed(1)}M` : 'N/A'}
                    </td>

                    <td className="p-3 text-center">
                      <span className="text-[10px] font-bold text-cyan-300 bg-cyan-950 px-2 py-0.5 rounded border border-cyan-800/60">
                        {asset.liquidityScore ?? 90}/100
                      </span>
                    </td>

                    <td className="p-3 text-right font-semibold text-slate-400">
                      {asset.athChangePercent ? `${asset.athChangePercent}%` : 'N/A'}
                    </td>

                    <td className="p-3 text-center">
                      <button
                        onClick={() => {
                          tradingStore.selectSymbol(asset.symbol);
                          tradingStore.setActiveTab('chart');
                        }}
                        className="px-2.5 py-1 rounded-lg bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 font-semibold text-[11px] transition-colors"
                      >
                        Open Chart
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
