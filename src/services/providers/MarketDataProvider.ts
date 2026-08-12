import { Asset, Candle, MarketTick, Timeframe } from '../../types/trading';

export interface ProviderStatus {
  connected: boolean;
  sourceName: string;
  latencyMs: number;
  lastTickTimestamp: number;
  error?: string;
  isDemoMode: boolean;
}

export type TickCallback = (tick: MarketTick) => void;

export interface MarketDataProvider {
  id: string;
  name: string;
  getAssets(): Promise<Asset[]>;
  getHistoricalCandles(symbol: string, timeframe: Timeframe, count?: number): Promise<Candle[]>;
  subscribe(symbols: string[], callback: TickCallback): void;
  unsubscribe(symbols: string[]): void;
  getStatus(): ProviderStatus;
}
