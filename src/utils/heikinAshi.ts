import { Candle } from '../types/trading';

/**
 * Calculates Heikin-Ashi candlesticks from standard candles.
 * HA_Close = (Open + High + Low + Close) / 4
 * HA_Open  = (Prev_HA_Open + Prev_HA_Close) / 2
 * HA_High  = Max(High, HA_Open, HA_Close)
 * HA_Low   = Min(Low, HA_Open, HA_Close)
 */
export function calculateHeikinAshi(candles: Candle[]): Candle[] {
  if (candles.length === 0) return [];

  const haCandles: Candle[] = [];

  for (let i = 0; i < candles.length; i++) {
    const curr = candles[i];
    const haClose = (curr.open + curr.high + curr.low + curr.close) / 4;

    let haOpen = 0;
    if (i === 0) {
      haOpen = (curr.open + curr.close) / 2;
    } else {
      const prevHA = haCandles[i - 1];
      haOpen = (prevHA.open + prevHA.close) / 2;
    }

    const haHigh = Math.max(curr.high, haOpen, haClose);
    const haLow = Math.min(curr.low, haOpen, haClose);

    haCandles.push({
      time: curr.time,
      open: Number(haOpen.toFixed(5)),
      high: Number(haHigh.toFixed(5)),
      low: Number(haLow.toFixed(5)),
      close: Number(haClose.toFixed(5)),
      volume: curr.volume,
    });
  }

  return haCandles;
}
