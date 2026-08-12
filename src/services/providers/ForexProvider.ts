import { Asset, Candle, Timeframe } from '../../types/trading';
import { INITIAL_ASSETS } from '../../data/assets';
import { generateHistoricalCandles } from '../../data/mockHistorical';
import { MarketDataProvider, ProviderStatus, TickCallback } from './MarketDataProvider';

export class ForexProvider implements MarketDataProvider {
  id = 'forex_feed';
  name = 'Institutional Forex Feed';

  async getAssets(): Promise<Asset[]> {
    return INITIAL_ASSETS.filter((a) => a.category === 'forex' || a.category === 'commodity');
  }

  async getHistoricalCandles(symbol: string, timeframe: Timeframe, count = 200): Promise<Candle[]> {
    return generateHistoricalCandles(symbol, timeframe, count);
  }

  subscribe(_symbols: string[], _callback: TickCallback): void {
    // Handled by streaming fallback or integrated feed
  }

  unsubscribe(_symbols: string[]): void {}

  getStatus(): ProviderStatus {
    return {
      connected: true,
      sourceName: this.name,
      latencyMs: 32,
      lastTickTimestamp: Date.now(),
      isDemoMode: false,
    };
  }
}
