import React, { useEffect, useState } from 'react';
import { TopNavbar } from './components/Navigation/TopNavbar';
import { TickerBar } from './components/TickerBar';
import { AssetDetailHeader } from './components/AssetDetailHeader';
import { Watchlist } from './components/Watchlist';
import { ChartControls } from './components/Chart/ChartControls';
import { TradingChart } from './components/Chart/TradingChart';
import { MarketPressurePanel } from './components/MarketPressurePanel';
import { SignalPanel } from './components/SignalPanel';
import { MTFPanel } from './components/MTFPanel';
import { SMCPanel } from './components/SMCPanel';
import { PatternPanel } from './components/PatternPanel';
import { SignalHistoryTable } from './components/SignalHistoryTable';
import { MacroNewsPanel } from './components/MacroNewsPanel';
import { SessionPanel } from './components/SessionPanel';
import { BacktestModal } from './components/BacktestModal';
import { SettingsDrawer } from './components/SettingsDrawer';
import { CommandPalette } from './components/CommandPalette';
import { ProDashboard } from './components/Dashboard/ProDashboard';
import { MarketsView } from './components/Markets/MarketsView';
import { OnChainTerminal } from './components/OnChain/OnChainTerminal';
import { DerivativesTerminal } from './components/Derivatives/DerivativesTerminal';
import { MarketScanner } from './components/Scanner/MarketScanner';
import { PortfolioTerminal } from './components/Portfolio/PortfolioTerminal';
import { QuantHub } from './components/Quant/QuantHub';
import { tradingStore } from './store/tradingStore';

export default function App() {
  const [, setTick] = useState(0);

  useEffect(() => {
    return tradingStore.subscribe(() => setTick((t) => t + 1));
  }, []);

  const activeTab = tradingStore.activeTab;

  return (
    <div className="min-h-screen flex flex-col font-sans text-slate-100 bg-[#0c0e14]">
      {/* Top Professional Navigation Bar */}
      <TopNavbar />

      {/* Horizontally Scrolling Top Ticker */}
      <TickerBar />

      {/* Asset Detail Stats Banner */}
      <AssetDetailHeader />

      {/* View Router Based on Active Main Tab */}
      <main className="flex-1 overflow-x-hidden">
        {activeTab === 'dashboard' && <ProDashboard />}

        {activeTab === 'markets' && <MarketsView />}

        {activeTab === 'chart' && (
          <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
            {/* Watchlist Sidebar */}
            <div className="w-full lg:w-80 shrink-0 h-80 lg:h-auto border-b lg:border-b-0 border-slate-800/80">
              <Watchlist />
            </div>

            {/* Center Terminal View Area */}
            <div className="flex-1 flex flex-col overflow-y-auto p-2 sm:p-3 space-y-3">
              {/* Main Interactive Chart */}
              <div className="bg-[#0c0e14] border border-slate-800/80 rounded-2xl overflow-hidden flex flex-col shadow-lg">
                <ChartControls />
                <div className="h-[520px] w-full">
                  <TradingChart />
                </div>
              </div>

              {/* Market Pressure & Signal Engine */}
              <div className="grid grid-cols-1 xl:grid-cols-2 gap-3">
                <MarketPressurePanel />
                <SignalPanel />
              </div>

              {/* Multi-Timeframe Alignment & Pattern Recognition Engine */}
              <div className="grid grid-cols-1 xl:grid-cols-2 gap-3">
                <MTFPanel />
                <PatternPanel />
              </div>

              {/* Smart Money Concepts (SMC) */}
              <SMCPanel />

              {/* Sessions & Macro Fundamental Calendar */}
              <div className="grid grid-cols-1 xl:grid-cols-2 gap-3">
                <SessionPanel />
                <MacroNewsPanel />
              </div>

              {/* Signal Audit History Log Table */}
              <SignalHistoryTable />
            </div>
          </div>
        )}

        {activeTab === 'derivatives' && <DerivativesTerminal />}

        {activeTab === 'onchain' && <OnChainTerminal />}

        {activeTab === 'scanner' && <MarketScanner />}

        {activeTab === 'portfolio' && <PortfolioTerminal />}

        {activeTab === 'quant' && <QuantHub />}
      </main>

      {/* Modals and Drawers */}
      <BacktestModal />
      <SettingsDrawer />
      <CommandPalette />

      {/* Footer */}
      <footer className="bg-[#080a0f] border-t border-slate-900 py-3 text-center text-xs text-slate-400 font-medium">
        Made With ❤️ By DroidMG. Proudly Made In India 🇮🇳
      </footer>
    </div>
  );
}
