import React, { useEffect, useState } from 'react';
import { AssetCategory } from '../types/trading';
import { Search, Star, ArrowUpDown } from 'lucide-react';
import { tradingStore } from '../store/tradingStore';
import { formatPercent, formatPrice } from '../utils/formatters';

type SortKey = 'symbol' | 'price' | 'change' | 'volume';

export const Watchlist: React.FC = () => {
  const [, setTick] = useState(0);
  const [sortKey, setSortKey] = useState<SortKey>('volume');
  const [sortAsc, setSortAsc] = useState(false);

  useEffect(() => {
    return tradingStore.subscribe(() => setTick((t) => t + 1));
  }, []);

  const filter = tradingStore.selectedCategoryFilter;
  const search = tradingStore.searchQuery.toLowerCase();

  let filteredAssets = tradingStore.assets.filter((a) => {
    if (filter === 'favorites' && !a.isFavorite) return false;
    if (filter !== 'all' && filter !== 'favorites' && a.category !== filter) return false;
    if (search && !a.symbol.toLowerCase().includes(search) && !a.name.toLowerCase().includes(search)) {
      return false;
    }
    return true;
  });

  filteredAssets.sort((a, b) => {
    const tickA = tradingStore.ticks.get(a.symbol);
    const tickB = tradingStore.ticks.get(b.symbol);

    let valA = 0;
    let valB = 0;

    if (sortKey === 'symbol') {
      return sortAsc ? a.symbol.localeCompare(b.symbol) : b.symbol.localeCompare(a.symbol);
    } else if (sortKey === 'price') {
      valA = tickA?.last ?? 0;
      valB = tickB?.last ?? 0;
    } else if (sortKey === 'change') {
      valA = tickA?.changePercent24h ?? 0;
      valB = tickB?.changePercent24h ?? 0;
    } else if (sortKey === 'volume') {
      valA = tickA?.volume ?? 0;
      valB = tickB?.volume ?? 0;
    }

    return sortAsc ? valA - valB : valB - valA;
  });

  const categories: { label: string; key: AssetCategory | 'all' | 'favorites' }[] = [
    { label: 'ALL', key: 'all' },
    { label: 'FAVS', key: 'favorites' },
    { label: 'CRYPTO', key: 'crypto' },
    { label: 'FOREX', key: 'forex' },
    { label: 'CFD', key: 'cfd' },
    { label: 'COMMODITIES', key: 'commodity' },
  ];

  return (
    <div className="flex flex-col h-full bg-[#0c0e14] border-r border-slate-800/80 text-xs select-none">
      {/* Category Tabs & Search */}
      <div className="p-3 border-b border-slate-800/80 space-y-2.5">
        <div className="relative">
          <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-400" />
          <input
            type="text"
            placeholder="Search markets..."
            value={tradingStore.searchQuery}
            onChange={(e) => {
              tradingStore.searchQuery = e.target.value;
              tradingStore.notify();
            }}
            className="w-full bg-[#131722] border border-slate-800 rounded-full pl-8 pr-3 py-1.5 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500 text-xs font-sans transition-all"
          />
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
          {categories.map((cat) => (
            <button
              key={cat.key}
              onClick={() => {
                tradingStore.selectedCategoryFilter = cat.key;
                tradingStore.notify();
              }}
              className={`px-3 py-1 rounded-full text-[10px] font-bold tracking-wider transition-all ${
                filter === cat.key
                  ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-500/20'
                  : 'bg-[#131722] text-slate-400 hover:text-slate-200 border border-slate-800'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* Watchlist Table Header */}
      <div className="grid grid-cols-12 gap-1 px-3 py-2 border-b border-slate-800/80 bg-[#090b10] text-[10px] text-slate-400 font-bold uppercase tracking-wider font-mono">
        <div
          className="col-span-4 flex items-center gap-1 cursor-pointer hover:text-slate-200"
          onClick={() => {
            if (sortKey === 'symbol') setSortAsc(!sortAsc);
            else {
              setSortKey('symbol');
              setSortAsc(true);
            }
          }}
        >
          <span>Symbol</span>
          <ArrowUpDown className="w-2.5 h-2.5" />
        </div>
        <div
          className="col-span-3 text-right flex items-center justify-end gap-1 cursor-pointer hover:text-slate-200"
          onClick={() => {
            if (sortKey === 'price') setSortAsc(!sortAsc);
            else {
              setSortKey('price');
              setSortAsc(false);
            }
          }}
        >
          <span>Price</span>
        </div>
        <div
          className="col-span-3 text-right flex items-center justify-end gap-1 cursor-pointer hover:text-slate-200"
          onClick={() => {
            if (sortKey === 'change') setSortAsc(!sortAsc);
            else {
              setSortKey('change');
              setSortAsc(false);
            }
          }}
        >
          <span>24H %</span>
        </div>
        <div className="col-span-2 text-center">Fav</div>
      </div>

      {/* Watchlist Items */}
      <div className="flex-1 overflow-y-auto divide-y divide-slate-800/40">
        {filteredAssets.map((asset) => {
          const tickData = tradingStore.ticks.get(asset.symbol);
          const flash = tradingStore.priceFlashes.get(asset.symbol);
          const isSelected = tradingStore.selectedSymbol === asset.symbol;

          const price = tickData?.last ?? 0;
          const change = tickData?.changePercent24h ?? 0;
          const isPos = change >= 0;

          return (
            <div
              key={asset.symbol}
              onClick={() => tradingStore.selectSymbol(asset.symbol)}
              className={`grid grid-cols-12 gap-1 px-3 py-2.5 items-center cursor-pointer transition-all ${
                isSelected
                  ? 'bg-indigo-600/10 border-l-2 border-indigo-500 text-white font-medium'
                  : 'hover:bg-[#131722] text-slate-300'
              }`}
            >
              <div className="col-span-4 flex flex-col">
                <span className="text-white font-bold tracking-tight text-xs">{asset.symbol}</span>
                <span className="text-[10px] text-slate-400 font-sans truncate">{asset.name}</span>
              </div>

              <div
                className={`col-span-3 text-right font-mono font-bold transition-colors duration-200 ${
                  flash === 'up'
                    ? 'text-emerald-400'
                    : flash === 'down'
                    ? 'text-rose-400'
                    : 'text-slate-100'
                }`}
              >
                {formatPrice(price, asset.decimals)}
              </div>

              <div
                className={`col-span-3 text-right font-mono font-bold text-[11px] ${
                  isPos ? 'text-emerald-400' : 'text-rose-400'
                }`}
              >
                {formatPercent(change)}
              </div>

              <div className="col-span-2 flex justify-center">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    tradingStore.toggleFavorite(asset.symbol);
                  }}
                  className="p-1 text-slate-500 hover:text-amber-400 transition-colors"
                >
                  <Star
                    className={`w-3.5 h-3.5 ${
                      asset.isFavorite ? 'fill-amber-400 text-amber-400' : ''
                    }`}
                  />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
