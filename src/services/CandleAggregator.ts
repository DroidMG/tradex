import { Candle, MarketTick, Timeframe } from '../types/trading';
import { TIMEFRAME_SECONDS } from '../data/mockHistorical';

export type CandleUpdateCallback = (candle: Candle, isClosed: boolean) => void;

export class CandleAggregator {
  private currentCandles: Map<Timeframe, Candle> = new Map();
  private listeners: Map<Timeframe, Set<CandleUpdateCallback>> = new Map();

  constructor(initialCandles: Partial<Record<Timeframe, Candle[]>> = {}) {
    // Initialize current open candles from initial array tail if available
    Object.entries(initialCandles).forEach(([tfStr, candles]) => {
      const tf = tfStr as Timeframe;
      if (candles && candles.length > 0) {
        this.currentCandles.set(tf, { ...candles[candles.length - 1] });
      }
    });
  }

  public subscribe(timeframe: Timeframe, callback: CandleUpdateCallback): () => void {
    if (!this.listeners.has(timeframe)) {
      this.listeners.set(timeframe, new Set());
    }
    this.listeners.get(timeframe)!.add(callback);

    return () => {
      this.listeners.get(timeframe)?.delete(callback);
    };
  }

  public processTick(tick: MarketTick, timeframes: Timeframe[] = ['1m', '3m', '5m', '15m', '30m', '1H', '4H', '1D']): void {
    const tickSec = Math.floor(tick.timestamp / 1000);

    for (const tf of timeframes) {
      const durationSec = TIMEFRAME_SECONDS[tf] || 300;
      const candleStartTime = Math.floor(tickSec / durationSec) * durationSec;

      let candle = this.currentCandles.get(tf);

      if (!candle || candle.time < candleStartTime) {
        // Finalize previous candle if exists
        if (candle && candle.time < candleStartTime) {
          this.notifyListeners(tf, candle, true);
        }

        // Start new candle
        candle = {
          time: candleStartTime,
          open: tick.last,
          high: tick.last,
          low: tick.last,
          close: tick.last,
          volume: 1,
        };
      } else {
        // Update existing current candle
        candle.high = Math.max(candle.high, tick.last);
        candle.low = Math.min(candle.low, tick.last);
        candle.close = tick.last;
        candle.volume += 1;
      }

      this.currentCandles.set(tf, candle);
      this.notifyListeners(tf, candle, false);
    }
  }

  public getCurrentCandle(timeframe: Timeframe): Candle | undefined {
    return this.currentCandles.get(timeframe);
  }

  private notifyListeners(timeframe: Timeframe, candle: Candle, isClosed: boolean): void {
    const cbs = this.listeners.get(timeframe);
    if (cbs) {
      cbs.forEach((cb) => cb(candle, isClosed));
    }
  }
}
