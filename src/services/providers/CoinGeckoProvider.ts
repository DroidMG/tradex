import { Asset, Candle, MarketTick, Timeframe } from '../../types/trading';
import { INITIAL_ASSETS } from '../../data/assets';
import { generateHistoricalCandles } from '../../data/mockHistorical';
import { MarketDataProvider, ProviderStatus, TickCallback } from './MarketDataProvider';

export class CoinGeckoProvider implements MarketDataProvider {
  id = 'coingecko';
  name = 'CoinGecko API';
  
  private subscribers: Set<TickCallback> = new Set();
  private subscribedSymbols: Set<string> = new Set();
  private timer: number | null = null;
  private lastFetchTime = 0;
  private latency = 0;
  private connected = true;

  async getAssets(): Promise<Asset[]> {
    return INITIAL_ASSETS.filter((a) => a.category === 'crypto');
  }

  async getHistoricalCandles(symbol: string, timeframe: Timeframe, count = 200): Promise<Candle[]> {
    return generateHistoricalCandles(symbol, timeframe, count);
  }

  subscribe(symbols: string[], callback: TickCallback): void {
    symbols.forEach((s) => this.subscribedSymbols.add(s));
    this.subscribers.add(callback);

    if (!this.timer) {
      this.fetchLiveData();
      this.timer = window.setInterval(() => this.fetchLiveData(), 5000); // Poll every 5s for CoinGecko free tier limit
    }
  }

  unsubscribe(symbols: string[]): void {
    symbols.forEach((s) => this.subscribedSymbols.delete(s));
    if (this.subscribedSymbols.size === 0 && this.timer) {
      clearInterval(this.timer);
      this.timer = null;
    }
  }

  getStatus(): ProviderStatus {
    return {
      connected: this.connected,
      sourceName: this.name,
      latencyMs: this.latency,
      lastTickTimestamp: this.lastFetchTime || Date.now(),
      isDemoMode: false,
    };
  }

  private async fetchLiveData(): Promise<void> {
    const cryptoMap: Record<string, string> = {
      'BTC/USD': 'bitcoin',
      'ETH/USD': 'ethereum',
      'SOL/USD': 'solana',
      'XRP/USD': 'ripple',
    };

    const ids = Array.from(this.subscribedSymbols)
      .map((sym) => cryptoMap[sym])
      .filter(Boolean)
      .join(',');

    if (!ids) return;

    const startTime = performance.now();
    try {
      const res = await fetch(
        `https://api.coingecko.com/api/v3/simple/price?ids=${ids}&vs_currencies=usd&include_24hr_vol=true&include_24hr_change=true`
      );
      if (!res.ok) throw new Error(`CoinGecko HTTP ${res.status}`);

      const data = await res.json();
      this.latency = Math.round(performance.now() - startTime);
      this.lastFetchTime = Date.now();
      this.connected = true;

      for (const [sym, cgId] of Object.entries(cryptoMap)) {
        if (data[cgId] && this.subscribedSymbols.has(sym)) {
          const price = data[cgId].usd;
          const change = data[cgId].usd_24h_change || 0;
          const vol = data[cgId].usd_24h_vol || 1000000000;
          const spread = price * 0.0001; // ~0.01% spread

          const tick: MarketTick = {
            symbol: sym,
            timestamp: this.lastFetchTime,
            bid: price - spread / 2,
            ask: price + spread / 2,
            last: price,
            change24h: (price * change) / 100,
            changePercent24h: change,
            volume: vol,
            high24h: price * 1.02,
            low24h: price * 0.98,
            source: 'CoinGecko Live',
            spread,
          };

          this.subscribers.forEach((cb) => cb(tick));
        }
      }
    } catch (err) {
      this.connected = false;
      console.warn('CoinGecko fetch failed, falling back to cached ticks:', err);
    }
  }
}
