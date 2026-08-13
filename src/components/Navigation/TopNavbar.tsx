import React, { useState } from 'react';
import {
  LayoutDashboard,
  TrendingUp,
  LineChart,
  Zap,
  Activity,
  Scan,
  Wallet,
  Cpu,
  Search,
  Settings,
  Sparkles,
  Flame,
  Menu,
  X,
} from 'lucide-react';
import { tradingStore, MainTab } from '../../store/tradingStore';

export const TopNavbar: React.FC = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const activeTab = tradingStore.activeTab;

  const navItems: { id: MainTab; label: string; icon: React.ReactNode; badge?: string }[] = [
    { id: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard className="w-4 h-4" /> },
    { id: 'markets', label: 'Markets & Screener', icon: <TrendingUp className="w-4 h-4" /> },
    { id: 'chart', label: 'Chart Terminal', icon: <LineChart className="w-4 h-4" /> },
    { id: 'derivatives', label: 'Derivatives', icon: <Zap className="w-4 h-4" />, badge: 'HOT' },
    { id: 'onchain', label: 'On-Chain & Whales', icon: <Activity className="w-4 h-4" /> },
    { id: 'scanner', label: 'Scanner & Alerts', icon: <Scan className="w-4 h-4" /> },
    { id: 'portfolio', label: 'Paper Portfolio', icon: <Wallet className="w-4 h-4" /> },
    { id: 'quant', label: 'Quant & Strategy', icon: <Cpu className="w-4 h-4" /> },
  ];

  return (
    <header className="bg-[#0b0e14] border-b border-slate-800/90 text-slate-200 sticky top-0 z-40 select-none shadow-md">
      {/* Upper Main Navigation Bar */}
      <div className="max-w-[1920px] mx-auto px-3 py-2 flex items-center justify-between gap-2">
        {/* Left: Brand Identity */}
        <div className="flex items-center gap-3 shrink-0">
          <div
            onClick={() => tradingStore.setActiveTab('dashboard')}
            className="flex items-center gap-2.5 cursor-pointer group"
          >
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-cyan-600 via-blue-600 to-indigo-600 flex items-center justify-center text-white font-black text-sm shadow-md shadow-cyan-500/20 group-hover:scale-105 transition-transform">
              TX
            </div>
            <div className="flex flex-col">
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold text-base tracking-wide bg-gradient-to-r from-white via-slate-100 to-slate-300 bg-clip-text text-transparent">
                  TradeX Terminal
                </span>
                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center gap-0.5">
                  <Sparkles className="w-2.5 h-2.5" /> FREE
                </span>
              </div>
              <span className="text-[10px] text-slate-400 font-medium tracking-wider flex items-center gap-1">
                Crypto Intelligence Platform <span className="text-[10px]">🇮🇳</span>
              </span>
            </div>
          </div>
        </div>

        {/* Center: Desktop Navigation Tabs */}
        <nav className="hidden xl:flex items-center gap-1 overflow-x-auto no-scrollbar py-1">
          {navItems.map((item) => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                id={`nav-tab-${item.id}`}
                onClick={() => tradingStore.setActiveTab(item.id)}
                className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-all whitespace-nowrap ${
                  isActive
                    ? 'bg-cyan-500/15 text-cyan-300 border border-cyan-500/30 shadow-xs'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                }`}
              >
                {item.icon}
                <span>{item.label}</span>
                {item.badge && (
                  <span className="text-[9px] px-1 py-0.2 rounded font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Right: Actions & Utilities */}
        <div className="flex items-center gap-2 shrink-0">
          {/* Fear & Greed Badge */}
          <div className="hidden md:flex items-center gap-1.5 bg-amber-500/10 border border-amber-500/20 px-2.5 py-1 rounded-lg text-xs font-medium text-amber-300">
            <Flame className="w-3.5 h-3.5 text-amber-400 fill-amber-400/20" />
            <span>Fear & Greed:</span>
            <span className="font-bold text-amber-400">74 (Greed)</span>
          </div>

          {/* Live Data Stream Status Badge */}
          <div className="px-2.5 py-1 rounded-lg text-xs font-semibold flex items-center gap-1.5 bg-emerald-500/10 text-emerald-300 border border-emerald-500/30">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>Live Data</span>
          </div>

          {/* Command Palette Trigger */}
          <button
            onClick={() => (tradingStore.isCommandPaletteOpen = true)}
            className="p-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-400 hover:text-slate-200 transition-colors flex items-center gap-1 text-xs"
            title="Search assets or commands (Ctrl+K)"
          >
            <Search className="w-3.5 h-3.5" />
            <kbd className="hidden lg:inline text-[10px] text-slate-500 bg-slate-950 px-1 rounded border border-slate-800">
              Ctrl+K
            </kbd>
          </button>

          {/* Settings Trigger */}
          <button
            onClick={() => (tradingStore.isSettingsOpen = true)}
            className="p-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-400 hover:text-slate-200 transition-colors"
            title="Open System Settings"
          >
            <Settings className="w-3.5 h-3.5" />
          </button>

          {/* Mobile Hamburger Toggle */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="xl:hidden p-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="xl:hidden border-t border-slate-800/80 bg-[#0c0f17] px-3 py-3 grid grid-cols-2 gap-2">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => {
                tradingStore.setActiveTab(item.id);
                setMobileMenuOpen(false);
              }}
              className={`flex items-center gap-2 p-2 rounded-lg text-xs font-semibold ${
                activeTab === item.id
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                  : 'bg-slate-900/60 text-slate-300 border border-slate-800/60'
              }`}
            >
              {item.icon}
              <span className="truncate">{item.label}</span>
            </button>
          ))}
        </div>
      )}
    </header>
  );
};
