import { Asset, Candle, MarketTick, Timeframe } from '../../types/trading';
import { INITIAL_ASSETS } from '../../data/assets';
import { generateHistoricalCandles } from '../../data/mockHistorical';
import { MarketDataProvider, ProviderStatus, TickCallback } from './MarketDataProvider';

interface InternalPriceState {
  lastPrice: number;
  change24hPct: number;
  high24h: number;
  low24h: number;
  volume24h: number;
  spreadPips: number;
}

export class DemoProvider implements MarketDataProvider {
  id = 'demo_provider';
  name = 'Real-Time Institutional Simulation Engine';

  private subscribers: Set<TickCallback> = new Set();
  private subscribedSymbols: Set<string> = new Set();
  private intervalId: number | null = null;
  private priceStates: Map<string, InternalPriceState> = new Map();
  private lastTickTime = Date.now();

  constructor() {
    this.initializeBasePrices();
  }

  private initializeBasePrices() {
    const defaultPrices: Record<string, { price: number; changePct: number; spread: number }> = {
      'BTC/USD': { price: 118492.41, changePct: 2.84, spread: 2.5 },
      'ETH/USD': { price: 4321.88, changePct: 1.92, spread: 0.25 },
      'SOL/USD': { price: 214.50, changePct: 4.15, spread: 0.05 },
      'XAU/USD': { price: 3421.70, changePct: -0.42, spread: 0.30 },
      'EUR/USD': { price: 1.1672, changePct: 0.13, spread: 0.00012 },
      'GBP/USD': { price: 1.3120, changePct: -0.18, spread: 0.00018 },
      'USD/JPY': { price: 148.45, changePct: 0.35, spread: 0.015 },
      'US100': { price: 23481.20, changePct: 0.74, spread: 1.2 },
      'US500': { price: 6042.80, changePct: 0.52, spread: 0.4 },
      'US30': { price: 44982.20, changePct: -0.21, spread: 2.0 },
      'WTI/USD': { price: 78.40, changePct: 1.10, spread: 0.03 },
      'XAG/USD': { price: 38.60, changePct: 0.85, spread: 0.02 },
      'XRP/USD': { price: 2.45, changePct: 3.20, spread: 0.001 },
      'AUD/USD': { price: 0.6720, changePct: -0.05, spread: 0.00015 },
      'USD/CAD': { price: 1.3850, changePct: 0.22, spread: 0.00016 },
    };

    INITIAL_ASSETS.forEach((asset) => {
      const def = defaultPrices[asset.symbol] || { price: 100, changePct: 0.5, spread: 0.05 };
      this.priceStates.set(asset.symbol, {
        lastPrice: def.price,
        change24hPct: def.changePct,
        high24h: def.price * 1.015,
        low24h: def.price * 0.985,
        volume24h: asset.category === 'crypto' ? 24500000000 : 850000000,
        spreadPips: def.spread,
      });
    });
  }

  async getAssets(): Promise<Asset[]> {
    return INITIAL_ASSETS;
  }

  async getHistoricalCandles(symbol: string, timeframe: Timeframe, count = 200): Promise<Candle[]> {
    return generateHistoricalCandles(symbol, timeframe, count);
  }

  subscribe(symbols: string[], callback: TickCallback): void {
    symbols.forEach((s) => this.subscribedSymbols.add(s));
    this.subscribers.add(callback);

    if (!this.intervalId) {
      // Sub-second updates (every 350ms) for ultra-responsive trading terminal feel
      this.intervalId = window.setInterval(() => this.tickAllSubscribed(), 350);
    }
  }

  unsubscribe(symbols: string[]): void {
    symbols.forEach((s) => this.subscribedSymbols.delete(s));
    if (this.subscribedSymbols.size === 0 && this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
  }

  getStatus(): ProviderStatus {
    return {
      connected: true,
      sourceName: this.name,
      latencyMs: 14 + Math.floor(Math.random() * 8),
      lastTickTimestamp: this.lastTickTime,
      isDemoMode: true,
    };
  }

  private tickAllSubscribed() {
    this.lastTickTime = Date.now();

    this.subscribedSymbols.forEach((sym) => {
      const state = this.priceStates.get(sym);
      if (!state) return;

      // Small stochastic step
      const isForex = sym.includes('EUR') || sym.includes('GBP') || sym.includes('AUD');
      const isCrypto = sym.includes('BTC') || sym.includes('ETH') || sym.includes('SOL');
      
      const volatility = isCrypto ? 0.0004 : isForex ? 0.00008 : 0.0002;
      const direction = Math.random() > 0.48 ? 1 : -1;
      const stepPct = direction * Math.random() * volatility;

      let newPrice = state.lastPrice * (1 + stepPct);

      // Precision rounding
      const decimals = sym.includes('EUR') || sym.includes('GBP') || sym.includes('AUD') || sym.includes('CAD') ? 5 : 2;
      newPrice = Number(newPrice.toFixed(decimals));

      // Update state
      state.lastPrice = newPrice;
      state.change24hPct += stepPct * 10; // slow drift
      if (newPrice > state.high24h) state.high24h = newPrice;
      if (newPrice < state.low24h) state.low24h = newPrice;
      state.volume24h += Math.floor(Math.random() * 500 + 50);

      const halfSpread = state.spreadPips / 2;
      const change24hVal = (newPrice * state.change24hPct) / 100;

      const tick: MarketTick = {
        symbol: sym,
        timestamp: this.lastTickTime,
        bid: Number((newPrice - halfSpread).toFixed(decimals)),
        ask: Number((newPrice + halfSpread).toFixed(decimals)),
        last: newPrice,
        change24h: Number(change24hVal.toFixed(decimals)),
        changePercent24h: Number(state.change24hPct.toFixed(2)),
        volume: state.volume24h,
        high24h: state.high24h,
        low24h: state.low24h,
        source: 'Demo Stream',
        spread: state.spreadPips,
      };

      this.subscribers.forEach((cb) => cb(tick));
    });
  }
}
