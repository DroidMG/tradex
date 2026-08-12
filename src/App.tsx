import React, { useEffect, useState } from 'react';
import { Header } from './components/Header';
import { TickerBar } from './components/TickerBar';
import { AssetDetailHeader } from './components/AssetDetailHeader';
import { Watchlist } from './components/Watchlist';
import { ChartControls } from './components/Chart/ChartControls';
import { TradingChart } from './components/Chart/TradingChart';
import { MarketPressurePanel } from './components/MarketPressurePanel';
import { SignalPanel } from './components/SignalPanel';
import { MTFPanel } from './components/MTFPanel';
import { SMCPanel } from './components/SMCPanel';
import { SignalHistoryTable } from './components/SignalHistoryTable';
import { MacroNewsPanel } from './components/MacroNewsPanel';
import { SessionPanel } from './components/SessionPanel';
import { BacktestModal } from './components/BacktestModal';
import { SettingsDrawer } from './components/SettingsDrawer';
import { CommandPalette } from './components/CommandPalette';
import { tradingStore } from './store/tradingStore';

export default function App() {
  const [, setTick] = useState(0);

  useEffect(() => {
    return tradingStore.subscribe(() => setTick((t) => t + 1));
  }, []);

  return (
    <div className="min-h-screen flex flex-col font-sans text-slate-100 bg-[#0c0e14]">
      {/* Top Header */}
      <Header />

      {/* Horizontally Scrolling Top Ticker */}
      <TickerBar />

      {/* Asset Detail Stats Banner */}
      <AssetDetailHeader />

      {/* Main Terminal Layout */}
      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
        {/* Watchlist Sidebar */}
        <div className="w-full lg:w-80 shrink-0 h-80 lg:h-auto border-b lg:border-b-0 border-slate-800/80">
          <Watchlist />
        </div>

        {/* Center Dashboard View Area */}
        <div className="flex-1 flex flex-col overflow-y-auto p-2 sm:p-3 space-y-3">
          {/* Main Chart Area */}
          <div className="bg-[#0c0e14] border border-slate-800/80 rounded-2xl overflow-hidden flex flex-col shadow-lg">
            <ChartControls />
            <div className="h-[480px] w-full">
              <TradingChart />
            </div>
          </div>

          {/* Market Pressure & Signal Engine */}
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-3">
            <MarketPressurePanel />
            <SignalPanel />
          </div>

          {/* Multi-Timeframe Alignment & SMC Engine */}
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-3">
            <MTFPanel />
            <SMCPanel />
          </div>

          {/* Sessions & Macro Fundamental Calendar */}
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-3">
            <SessionPanel />
            <MacroNewsPanel />
          </div>

          {/* Signal Audit History Log Table */}
          <SignalHistoryTable />
        </div>
      </div>

      {/* Modals and Drawers */}
      <BacktestModal />
      <SettingsDrawer />
      <CommandPalette />
    </div>
  );
}
