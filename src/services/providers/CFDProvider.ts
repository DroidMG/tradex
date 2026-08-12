import { Asset, Candle, Timeframe } from '../../types/trading';
import { INITIAL_ASSETS } from '../../data/assets';
import { generateHistoricalCandles } from '../../data/mockHistorical';
import { MarketDataProvider, ProviderStatus, TickCallback } from './MarketDataProvider';

export class CFDProvider implements MarketDataProvider {
  id = 'cfd_feed';
  name = 'Global CFD Index Feed';

  async getAssets(): Promise<Asset[]> {
    return INITIAL_ASSETS.filter((a) => a.category === 'cfd');
  }

  async getHistoricalCandles(symbol: string, timeframe: Timeframe, count = 200): Promise<Candle[]> {
    return generateHistoricalCandles(symbol, timeframe, count);
  }

  subscribe(_symbols: string[], _callback: TickCallback): void {}

  unsubscribe(_symbols: string[]): void {}

  getStatus(): ProviderStatus {
    return {
      connected: true,
      sourceName: this.name,
      latencyMs: 45,
      lastTickTimestamp: Date.now(),
      isDemoMode: false,
    };
  }
}
